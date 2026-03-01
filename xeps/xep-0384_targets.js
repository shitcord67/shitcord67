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
    for (const peer of uniquePeers) {
      // eslint-disable-next-line no-await-in-loop
      const devices = await fetchDeviceListFn(peer);
      if (peer === ownBare && devices.length === 0 && typeof storeForAccountFn === "function") {
        const store = storeForAccountFn(ownBare);
        // eslint-disable-next-line no-await-in-loop
        const localId = store ? await store.getLocalRegistrationId() : null;
        if (localId) devices.push(String(localId));
      }
      devices.forEach((deviceId) => {
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
