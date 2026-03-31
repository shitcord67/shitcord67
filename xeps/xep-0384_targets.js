(function initXep0384Targets(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_0384_TARGETS) return;

  async function xmppOmemoGatherDeviceTargetsCore(peers = [], ownBare = "", {
    toBareJid,
    fetchDeviceListFn,
    storeForAccountFn
  } = {}) {
    if (typeof toBareJid !== "function" || typeof fetchDeviceListFn !== "function") return [];
    const uniquePeers = [...new Set(peers.map((entry) => toBareJid(entry || "")).filter(Boolean))];
    const targets = [];
    const seenIds = new Map();
    let localDeviceId = "";
    if (ownBare && typeof storeForAccountFn === "function") {
      const localStore = storeForAccountFn(ownBare);
      const localId = localStore ? await localStore.getLocalRegistrationId() : null;
      localDeviceId = localId ? String(localId) : "";
    }
    for (const peer of uniquePeers) {
      // eslint-disable-next-line no-await-in-loop
      const devices = await fetchDeviceListFn(peer);
      const filteredDevices = devices.filter((deviceId) => {
        const normalized = String(deviceId || "").trim();
        if (!normalized) return false;
        // Never encrypt for the currently active local device.
        // Local UI already has the plaintext, and self-sessions on the active device
        // cause libsignal session corruption and carbon/decrypt failures.
        if (peer === ownBare && localDeviceId && normalized === localDeviceId) return false;
        return true;
      });
      filteredDevices.forEach((deviceId) => {
        if (!deviceId) return;
        const existing = seenIds.get(deviceId);
        if (existing && existing !== peer) {
          throw new Error(`OMEMO device id collision (${deviceId}) between ${existing} and ${peer}`);
        }
        seenIds.set(deviceId, peer);
        targets.push({ jid: peer, deviceId });
      });
    }
    return targets;
  }

  globalScope.SHITCORD67_XEP_0384_TARGETS = Object.freeze({
    xmppOmemoGatherDeviceTargetsCore
  });
})(typeof window !== "undefined" ? window : globalThis);
