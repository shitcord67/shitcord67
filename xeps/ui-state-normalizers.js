(function initUiStateNormalizers(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_UI_STATE_NORMALIZERS) return;

  function normalizeToggle(value) {
    return value === "on" ? "on" : "off";
  }

  function normalizeMemberPresenceFilter(value) {
    if (value === "online" || value === "offline") return value;
    return "all";
  }

  function normalizeMobilePane(value) {
    return value === "nav" ? "nav" : "chat";
  }

  function normalizeSwfAudioPolicy(value) {
    return value === "multi" ? "multi" : "single";
  }

  function normalizeSwfAudioScope(value) {
    return value === "guild" ? "guild" : "global";
  }

  function normalizeSwfAutoplay(value) {
    return value === "off" ? "off" : "on";
  }

  function normalizeSwfQuickAudioMode(value) {
    if (value === "on" || value === "off" || value === "click") return value;
    return "click";
  }

  function normalizeTheme(value) {
    if (value === "oled" || value === "high-contrast") return value;
    return "discord";
  }

  globalScope.SHITCORD67_UI_STATE_NORMALIZERS = Object.freeze({
    normalizeToggle,
    normalizeMemberPresenceFilter,
    normalizeMobilePane,
    normalizeSwfAudioPolicy,
    normalizeSwfAudioScope,
    normalizeSwfAutoplay,
    normalizeSwfQuickAudioMode,
    normalizeTheme
  });
})(typeof window !== "undefined" ? window : globalThis);
