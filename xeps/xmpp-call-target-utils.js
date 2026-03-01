(function initXmppCallTargetUtils(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XMPP_CALL_TARGET_UTILS) return;

  function xmppRememberPeerFullJid(jid = "", {
    seenAt = Date.now(),
    normalizeXmppJidFn = (value) => (value || "").toString().trim().toLowerCase(),
    xmppBareJidFn = (value) => (value || "").toString().trim().toLowerCase(),
    poolByBare = null
  } = {}) {
    if (!(poolByBare instanceof Map)) return;
    const normalized = normalizeXmppJidFn(jid).toLowerCase();
    if (!normalized || !normalized.includes("/")) return;
    const bare = xmppBareJidFn(normalized);
    if (!bare) return;
    const pool = poolByBare.get(bare) || new Map();
    pool.set(normalized, Number(seenAt) || Date.now());
    if (pool.size > 8) {
      const oldest = [...pool.entries()].sort((a, b) => (Number(a[1]) || 0) - (Number(b[1]) || 0))[0]?.[0] || "";
      if (oldest) pool.delete(oldest);
    }
    poolByBare.set(bare, pool);
  }

  globalScope.SHITCORD67_XMPP_CALL_TARGET_UTILS = Object.freeze({
    xmppRememberPeerFullJid
  });
})(typeof window !== "undefined" ? window : globalThis);
