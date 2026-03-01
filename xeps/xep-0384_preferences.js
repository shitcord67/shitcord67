(function initXep0384Preferences(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_0384_PREFERENCES) return;

  function xmppOmemoEnabledForPeer(peerBare, prefs = {}, normalizeToggle = (value) => value) {
    const enabled = prefs?.xmppOmemoEnabledByJid?.[peerBare];
    return normalizeToggle(enabled) === "on";
  }

  function xmppOmemoApplyPeerEnabled(prefs = {}, peerBare, enabled, normalizeToggle = (value) => value) {
    if (!peerBare) return prefs;
    return {
      ...prefs,
      xmppOmemoEnabledByJid: {
        ...(prefs?.xmppOmemoEnabledByJid || {}),
        [peerBare]: normalizeToggle(enabled ? "on" : "off")
      }
    };
  }

  globalScope.SHITCORD67_XEP_0384_PREFERENCES = Object.freeze({
    xmppOmemoEnabledForPeer,
    xmppOmemoApplyPeerEnabled
  });
})(typeof window !== "undefined" ? window : globalThis);
