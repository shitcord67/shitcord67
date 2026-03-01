(function initXep0384OwnBundle(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_0384_OWN_BUNDLE) return;

  async function xmppOmemoEnsureOwnBundleCore(ownBare, {
    force = false,
    ensureLocalIdentityFn,
    fetchDeviceListFn,
    publishDeviceListFn,
    publishBundleFn,
    deviceListByJid,
    preKeyCount,
    signedPreKeyId,
    arrayBufferToBase64
  } = {}) {
    if (!ownBare) return false;
    if (typeof ensureLocalIdentityFn !== "function" || typeof fetchDeviceListFn !== "function") return false;
    if (typeof publishDeviceListFn !== "function" || typeof publishBundleFn !== "function") return false;
    if (!deviceListByJid || typeof arrayBufferToBase64 !== "function") return false;

    const store = await ensureLocalIdentityFn(ownBare);
    if (!store) return false;

    const registrationId = await store.getLocalRegistrationId();
    if (!registrationId) return false;

    let deviceList = deviceListByJid.get(ownBare);
    if (!deviceList || deviceList.length === 0) {
      deviceList = await fetchDeviceListFn(ownBare);
    }
    const nextList = [...new Set([...(deviceList || []), String(registrationId)])];
    if (force || !deviceList || !deviceList.includes(String(registrationId))) {
      await publishDeviceListFn(ownBare, nextList);
    }

    let identityKeyPair;
    try {
      identityKeyPair = await store.getIdentityKeyPair();
    } catch {
      identityKeyPair = await globalThis.libsignal.KeyHelper.generateIdentityKeyPair();
      await store.setIdentityKeyPair(identityKeyPair);
    }

    let signedPreKey = store.loadCompleteSignedPreKey(signedPreKeyId || 1);
    if (!signedPreKey || force) {
      signedPreKey = await globalThis.libsignal.KeyHelper.generateSignedPreKey(identityKeyPair, signedPreKeyId || 1);
      await store.storeSignedPreKey(signedPreKey.keyId, signedPreKey);
    }

    let preKeys = [];
    if (!force) {
      for (let i = 0; i < (preKeyCount || 48); i += 1) {
        // eslint-disable-next-line no-await-in-loop
        const existing = await store.loadPreKey(i + 1);
        if (!existing) {
          preKeys = [];
          break;
        }
        preKeys.push({ id: i + 1, key: arrayBufferToBase64(existing.pubKey) });
      }
    }

    if (preKeys.length === 0) {
      preKeys = [];
      for (let i = 0; i < (preKeyCount || 48); i += 1) {
        // eslint-disable-next-line no-await-in-loop
        const preKey = await globalThis.libsignal.KeyHelper.generatePreKey(i + 1);
        // eslint-disable-next-line no-await-in-loop
        await store.storePreKey(preKey.keyId, preKey.keyPair);
        preKeys.push({ id: preKey.keyId, key: arrayBufferToBase64(preKey.keyPair.pubKey) });
      }
    }

    const bundle = {
      deviceId: registrationId,
      identityKey: arrayBufferToBase64(identityKeyPair.pubKey),
      signedPreKeyId: signedPreKey.keyId || signedPreKeyId || 1,
      signedPreKeyPublic: arrayBufferToBase64(signedPreKey.keyPair?.pubKey || signedPreKey.keyPair?.publicKey || new ArrayBuffer(0)),
      signedPreKeySignature: arrayBufferToBase64(signedPreKey.signature || new ArrayBuffer(0)),
      preKeys
    };
    return publishBundleFn(ownBare, bundle);
  }

  globalScope.SHITCORD67_XEP_0384_OWN_BUNDLE = Object.freeze({
    xmppOmemoEnsureOwnBundleCore
  });
})(typeof window !== "undefined" ? window : globalThis);
