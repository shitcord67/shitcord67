(function initMediaProviderNormalizers(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_MEDIA_PROVIDER_NORMALIZERS) return;

  function normalizeTenorApiKey(value) {
    return (value || "").toString().trim().slice(0, 180);
  }

  function normalizeTenorClientKey(value) {
    return (value || "").toString().trim().slice(0, 120);
  }

  function normalizeMediaPrivacyMode(value) {
    return value === "off" ? "off" : "safe";
  }

  globalScope.SHITCORD67_MEDIA_PROVIDER_NORMALIZERS = Object.freeze({
    normalizeTenorApiKey,
    normalizeTenorClientKey,
    normalizeMediaPrivacyMode
  });
})(typeof window !== "undefined" ? window : globalThis);
