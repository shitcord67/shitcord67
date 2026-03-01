(function initUiStateNormalizers(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_UI_STATE_NORMALIZERS) return;

  function normalizeToggle(value) {
    return value === "on" ? "on" : "off";
  }

  globalScope.SHITCORD67_UI_STATE_NORMALIZERS = Object.freeze({
    normalizeToggle
  });
})(typeof window !== "undefined" ? window : globalThis);
