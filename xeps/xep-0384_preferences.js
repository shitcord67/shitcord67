(function initXep0384Preferences(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_0384_PREFERENCES) return;

  function normalizeXmppEncryptionMode(value) {
    const mode = (value || "").toString().trim().toLowerCase();
    if (mode === "omemo" || mode === "openpgp" || mode === "pgp" || mode === "otr") return mode;
    return "off";
  }

  function xmppEncryptionModeForPeer(peerBare, prefs = {}, normalizeMode = normalizeXmppEncryptionMode, normalizeToggle = (value) => value) {
    const explicit = prefs?.xmppEncryptionByJid?.[peerBare];
    if (typeof explicit !== "undefined") return normalizeMode(explicit);
    const enabled = prefs?.xmppOmemoEnabledByJid?.[peerBare];
    return normalizeToggle(enabled) === "on" ? "omemo" : "off";
  }

  function xmppApplyEncryptionModeForPeer(
    prefs = {},
    peerBare,
    mode,
    normalizeMode = normalizeXmppEncryptionMode,
    normalizeToggle = (value) => value
  ) {
    if (!peerBare) return prefs;
    const normalizedMode = normalizeMode(mode);
    return {
      ...prefs,
      xmppEncryptionByJid: {
        ...(prefs?.xmppEncryptionByJid || {}),
        [peerBare]: normalizedMode
      },
      xmppOmemoEnabledByJid: {
        ...(prefs?.xmppOmemoEnabledByJid || {}),
        [peerBare]: normalizeToggle(normalizedMode === "omemo" ? "on" : "off")
      }
    };
  }

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
    normalizeXmppEncryptionMode,
    xmppEncryptionModeForPeer,
    xmppApplyEncryptionModeForPeer,
    xmppOmemoEnabledForPeer,
    xmppOmemoApplyPeerEnabled
  });
})(typeof window !== "undefined" ? window : globalThis);
