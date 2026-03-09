(function initXep0384Runtime(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_0384_RUNTIME) return;

  let libsignalLoadPromise = null;

  function xmppOmemoRuntimeAvailable() {
    return Boolean(globalThis.libsignal && globalThis.libsignal.KeyHelper && globalThis.crypto?.subtle);
  }

  function ensureLibsignalLoaded({
    src = "assets/libsignal_protocol.min.js"
  } = {}) {
    if (xmppOmemoRuntimeAvailable()) return Promise.resolve(true);
    if (libsignalLoadPromise) return libsignalLoadPromise;
    libsignalLoadPromise = new Promise((resolve) => {
      if (!(globalThis.document && globalThis.document.head)) {
        resolve(false);
        return;
      }
      const existing = globalThis.document.querySelector(`script[data-libsignal-src="${src}"]`);
      if (existing) {
        existing.addEventListener("load", () => resolve(xmppOmemoRuntimeAvailable()), { once: true });
        existing.addEventListener("error", () => resolve(false), { once: true });
        return;
      }
      const script = globalThis.document.createElement("script");
      script.async = true;
      script.dataset.libsignalSrc = src;
      script.src = src;
      script.addEventListener("load", () => resolve(xmppOmemoRuntimeAvailable()), { once: true });
      script.addEventListener("error", () => resolve(false), { once: true });
      globalThis.document.head.appendChild(script);
    }).finally(() => {
      if (!xmppOmemoRuntimeAvailable()) {
        libsignalLoadPromise = null;
      }
    });
    return libsignalLoadPromise;
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
    ensureLibsignalLoaded,
    createXmppOmemoStoreRegistry
  });
})(typeof window !== "undefined" ? window : globalThis);
