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

  function normalizeMediaTrustRules(value) {
    if (!Array.isArray(value)) return [];
    return value
      .map((entry) => (entry || "").toString().trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 120);
  }

  function normalizeMediaDenyRules(value, {
    normalizeMediaTrustRulesFn = normalizeMediaTrustRules
  } = {}) {
    return normalizeMediaTrustRulesFn(value);
  }

  function normalizeProfileEffect(value) {
    const effect = (value || "").toString().toLowerCase();
    return ["none", "aurora", "flame", "ocean"].includes(effect) ? effect : "none";
  }

  function normalizeMediaTab(value, {
    allowedTabs = []
  } = {}) {
    const tab = (value || "").toString().toLowerCase();
    return Array.isArray(allowedTabs) && allowedTabs.includes(tab) ? tab : "gif";
  }

  globalScope.SHITCORD67_MEDIA_PROVIDER_NORMALIZERS = Object.freeze({
    normalizeTenorApiKey,
    normalizeTenorClientKey,
    normalizeMediaPrivacyMode,
    normalizeMediaTrustRules,
    normalizeMediaDenyRules,
    normalizeProfileEffect,
    normalizeMediaTab
  });
})(typeof window !== "undefined" ? window : globalThis);
