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

  function normalizeRelayTransportAttachmentUrl(rawUrl, {
    resolveMediaUrlFn = (value) => (value || "").toString().trim()
  } = {}) {
    const resolved = resolveMediaUrlFn((rawUrl || "").toString().trim());
    if (!resolved) return "";
    return /^https?:\/\//i.test(resolved) ? resolved : "";
  }

  function normalizeMediaRuleToken(rule) {
    return (rule || "").toString().trim().toLowerCase();
  }

  function normalizeMediaPrivacyUrl(url, {
    resolveMediaUrlFn = (value) => (value || "").toString(),
    baseUrl = ""
  } = {}) {
    const resolved = resolveMediaUrlFn(url);
    try {
      const parsed = new URL(resolved, baseUrl || undefined);
      parsed.hash = "";
      return parsed.href;
    } catch {
      return resolved;
    }
  }

  function normalizeRenderableAvatarUrl(value, {
    isRenderableAvatarUrlFn = () => false,
    resolveMediaUrlFn = (input) => (input || "").toString().trim()
  } = {}) {
    const raw = (value || "").toString().trim();
    if (!isRenderableAvatarUrlFn(raw)) return "";
    return resolveMediaUrlFn(raw);
  }

  function isLikelyImageDataUrl(value) {
    return /^data:image\/[a-z0-9.+-]+;base64,/i.test((value || "").trim());
  }

  function isRenderableAvatarUrl(value, {
    isLikelyUrlFn = () => false,
    isLikelyImageDataUrlFn = isLikelyImageDataUrl
  } = {}) {
    return isLikelyUrlFn(value) || isLikelyImageDataUrlFn(value);
  }

  function doesMediaRuleMatchHost(rule, host) {
    if (!rule || !host) return false;
    if (rule.startsWith("/") && rule.endsWith("/") && rule.length > 2) {
      try {
        return new RegExp(rule.slice(1, -1), "i").test(host);
      } catch {
        return false;
      }
    }
    if (rule.startsWith("*.")) {
      const suffix = rule.slice(2);
      return host === suffix || host.endsWith(`.${suffix}`);
    }
    return host === rule;
  }

  function isBuiltInTrustedMediaHost(host = "", {
    doesMediaRuleMatchHostFn = doesMediaRuleMatchHost
  } = {}) {
    const normalized = (host || "").toString().trim().toLowerCase();
    if (!normalized) return false;
    const builtInRules = [
      "jabber.org",
      "*.jabber.org",
      "w3.org",
      "*.w3.org",
      "xmpp.org",
      "*.xmpp.org"
    ];
    return builtInRules.some((rule) => doesMediaRuleMatchHostFn(rule, normalized));
  }

  function isExternalMediaUrl(url, {
    baseUrl = ""
  } = {}) {
    try {
      const resolved = new URL(url, baseUrl || undefined);
      if (!/^https?:$/i.test(resolved.protocol)) return false;
      if (!baseUrl) return true;
      return resolved.origin !== new URL(baseUrl).origin;
    } catch {
      return false;
    }
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
    normalizeGifScope,
    normalizeRelayTransportAttachmentUrl,
    normalizeMediaRuleToken,
    normalizeMediaPrivacyUrl,
    normalizeRenderableAvatarUrl,
    isLikelyImageDataUrl,
    isRenderableAvatarUrl,
    doesMediaRuleMatchHost,
    isBuiltInTrustedMediaHost,
    isExternalMediaUrl
  });
})(typeof window !== "undefined" ? window : globalThis);
