(function initXmppLoginNormalizers(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XMPP_LOGIN_NORMALIZERS) return;

  function normalizeXmppJid(value) {
    return (value || "").toString().trim().slice(0, 120);
  }

  function normalizeXmppPassword(value) {
    return (value || "").toString().slice(0, 120);
  }

  globalScope.SHITCORD67_XMPP_LOGIN_NORMALIZERS = Object.freeze({
    normalizeXmppJid,
    normalizeXmppPassword
  });
})(typeof window !== "undefined" ? window : globalThis);
