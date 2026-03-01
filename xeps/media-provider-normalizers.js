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

  function normalizeGifFavorites(value) {
    if (!Array.isArray(value)) return [];
    const seen = new Set();
    const output = [];
    value.forEach((entry) => {
      const url = (entry || "").toString().trim();
      if (!url || seen.has(url)) return;
      seen.add(url);
      output.push(url);
    });
    return output.slice(0, 1200);
  }

  function normalizeGifGroups(value, {
    normalizeGifFavoritesFn = normalizeGifFavorites
  } = {}) {
    if (!Array.isArray(value)) return [];
    return value
      .map((entry, index) => {
        const safe = entry && typeof entry === "object" ? entry : {};
        const id = (safe.id || `group-${index + 1}`).toString().trim().slice(0, 80);
        const name = (safe.name || "Group").toString().trim().slice(0, 40);
        const urls = normalizeGifFavoritesFn(safe.urls).slice(0, 600);
        if (!id || !name) return null;
        return { id, name, urls };
      })
      .filter(Boolean)
      .slice(0, 32);
  }

  function normalizeGifScope(value, {
    groups = []
  } = {}) {
    const token = (value || "").toString().trim().toLowerCase();
    if (token === "all" || token === "favorites" || token === "chat" || token === "time" || token === "network") return token;
    if (token.startsWith("group:")) {
      const groupId = token.slice(6);
      if (groups.some((group) => group.id === groupId)) return token;
    }
    return "all";
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
    normalizeRecentEmojis,
    normalizeGifFavorites,
    normalizeGifGroups,
    normalizeGifScope
  });
})(typeof window !== "undefined" ? window : globalThis);
