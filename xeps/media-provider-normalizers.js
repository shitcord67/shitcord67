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

  function normalizeMessageCharLimit(value, {
    defaultValue = 2000,
    minValue = 200,
    maxValue = 4000
  } = {}) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return defaultValue;
    return Math.max(minValue, Math.min(maxValue, Math.floor(parsed)));
  }

  function normalizeRecentEmojis(value) {
    if (!Array.isArray(value)) return [];
    const seen = new Set();
    const output = [];
    value.forEach((entry) => {
      const key = (entry || "").toString().trim();
      if (!key || seen.has(key)) return;
      seen.add(key);
      output.push(key);
    });
    return output.slice(0, 24);
  }

  globalScope.SHITCORD67_MEDIA_PROVIDER_NORMALIZERS = Object.freeze({
    normalizeTenorApiKey,
    normalizeTenorClientKey,
    normalizeMediaPrivacyMode,
    normalizeMediaTrustRules,
    normalizeMediaDenyRules,
    normalizeProfileEffect,
    normalizeMediaTab,
    normalizeMessageCharLimit,
    normalizeRecentEmojis
  });
})(typeof window !== "undefined" ? window : globalThis);
