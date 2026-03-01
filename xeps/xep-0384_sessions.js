(function initXep0384Sessions(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_0384_SESSIONS) return;

  async function xmppOmemoEnsureSessionCore(peerBare, deviceId, ownBare, {
    runtimeAvailableFn,
    storeForAccountFn,
    fetchBundleFn,
    sessionSetupInFlight,
    base64ToArrayBuffer,
    signedPreKeyId
  } = {}) {
    if (!peerBare || !deviceId || !ownBare) return false;
    if (typeof runtimeAvailableFn !== "function" || !runtimeAvailableFn()) return false;
    if (typeof storeForAccountFn !== "function" || typeof fetchBundleFn !== "function") return false;
    if (!sessionSetupInFlight || typeof base64ToArrayBuffer !== "function") return false;

    const store = storeForAccountFn(ownBare);
    if (!store) return false;

    const sessionId = `${peerBare}.${deviceId}`;
    const existing = await store.loadSession(sessionId);
    if (existing) return true;

    const inflightKey = `${ownBare}|${peerBare}|${deviceId}`;
    if (sessionSetupInFlight.has(inflightKey)) {
      return sessionSetupInFlight.get(inflightKey) || false;
    }

    const promise = (async () => {
      const bundle = await fetchBundleFn(peerBare, deviceId);
      if (!bundle) return false;
      const preKey = bundle.preKeys[Math.floor(Math.random() * bundle.preKeys.length)];
      if (!preKey) return false;
      const address = new globalThis.libsignal.SignalProtocolAddress(peerBare, Number(deviceId));
      const builder = new globalThis.libsignal.SessionBuilder(store, address);
      await builder.processPreKey({
        registrationId: Number(deviceId),
        identityKey: base64ToArrayBuffer(bundle.identityKey),
        signedPreKey: {
          keyId: Number(bundle.signedPreKeyId || signedPreKeyId || 1),
          publicKey: base64ToArrayBuffer(bundle.signedPreKeyPublic),
          signature: base64ToArrayBuffer(bundle.signedPreKeySignature)
        },
        preKey: {
          keyId: Number(preKey.id),
          publicKey: base64ToArrayBuffer(preKey.key)
        }
      });
      return true;
    })();

    sessionSetupInFlight.set(inflightKey, promise);
    try {
      return await promise;
    } finally {
      sessionSetupInFlight.delete(inflightKey);
    }
  }

  async function xmppOmemoEnsurePeerSessionsCore(peerBare, ownBare, {
    deviceListByJid,
    fetchDeviceListFn,
    ensureSessionFn
  } = {}) {
    if (!peerBare || !ownBare) return [];
    if (!deviceListByJid || typeof fetchDeviceListFn !== "function" || typeof ensureSessionFn !== "function") return [];

    const devices = deviceListByJid.get(peerBare) || await fetchDeviceListFn(peerBare);
    if (!devices || devices.length === 0) return [];
    const results = await Promise.all(devices.map((deviceId) => ensureSessionFn(peerBare, deviceId, ownBare)));
    return devices.filter((_, index) => results[index]);
  }

  globalScope.SHITCORD67_XEP_0384_SESSIONS = Object.freeze({
    xmppOmemoEnsureSessionCore,
    xmppOmemoEnsurePeerSessionsCore
  });
})(typeof window !== "undefined" ? window : globalThis);
