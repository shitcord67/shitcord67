(function initXep0384Runtime(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_0384_RUNTIME) return;

  function xmppOmemoRuntimeAvailable() {
    return Boolean(globalThis.libsignal && globalThis.libsignal.KeyHelper && globalThis.crypto?.subtle);
  }

  function createXmppOmemoStoreRegistry() {
    const storesByBareJid = new Map();

    function defaultToBareJid(value) {
      const raw = (value || "").toString().trim().toLowerCase();
      return (raw.split("/")[0] || "").trim();
    }

    function getStoreForAccount(jid, {
      toBareJid = defaultToBareJid,
      StoreCtor = null
    } = {}) {
      const bare = typeof toBareJid === "function"
        ? toBareJid(jid)
        : defaultToBareJid(jid);
      if (!bare || !StoreCtor) return null;
      if (!storesByBareJid.has(bare)) {
        storesByBareJid.set(bare, new StoreCtor(bare));
      }
      return storesByBareJid.get(bare) || null;
    }

    return Object.freeze({
      getStoreForAccount
    });
  }

  globalScope.SHITCORD67_XEP_0384_RUNTIME = Object.freeze({
    xmppOmemoRuntimeAvailable,
    createXmppOmemoStoreRegistry
  });
})(typeof window !== "undefined" ? window : globalThis);
