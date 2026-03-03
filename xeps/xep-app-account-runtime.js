/*
 * Account login helpers extracted from app.js.
 * Keeps XMPP-specific account preference logic outside the main app bundle.
 */

(function initAppAccountRuntime(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_APP_ACCOUNT_RUNTIME) return;

  function applyXmppLoginOptionsToPreferences(options, prefs, {
    requestedRelayMode = "",
    normalizeXmppJidFn = (value) => (value || "").toString().trim(),
    normalizeXmppPasswordFn = (value) => (value || "").toString(),
    normalizeXmppWsUrlFn = (value) => (value || "").toString().trim(),
    inferXmppWsUrlFromJidFn = () => "",
    xmppDomainFromJidFn = () => ""
  } = {}) {
    const nextPrefs = prefs && typeof prefs === "object" ? prefs : {};
    const xmpp = options && typeof options.xmpp === "object" ? options.xmpp : null;
    if (!xmpp) return false;
    const jid = normalizeXmppJidFn(xmpp.jid || "");
    const password = normalizeXmppPasswordFn(xmpp.password || "");
    const wsInput = normalizeXmppWsUrlFn(xmpp.wsUrl || "") || inferXmppWsUrlFromJidFn(jid);
    if (jid) nextPrefs.xmppJid = jid;
    if (typeof xmpp.password === "string") nextPrefs.xmppPassword = password;
    if (wsInput) nextPrefs.xmppWsUrl = wsInput;
    if (jid && !nextPrefs.xmppMucService) {
      const domain = xmppDomainFromJidFn(jid);
      if (domain) nextPrefs.xmppMucService = `conference.${domain}`;
    }
    if (jid && password && (!requestedRelayMode || requestedRelayMode === "xmpp")) {
      nextPrefs.relayMode = "xmpp";
      nextPrefs.relayAutoConnect = "on";
    }
    return true;
  }

  globalScope.SHITCORD67_APP_ACCOUNT_RUNTIME = Object.freeze({
    applyXmppLoginOptionsToPreferences
  });
})(typeof window !== "undefined" ? window : globalThis);
