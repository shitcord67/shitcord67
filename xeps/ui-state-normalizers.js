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

  globalScope.SHITCORD67_UI_STATE_NORMALIZERS = Object.freeze({
    normalizeToggle,
    normalizeMemberPresenceFilter,
    normalizeMobilePane
  });
})(typeof window !== "undefined" ? window : globalThis);
