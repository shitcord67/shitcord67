(function initNameNormalizers(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_NAME_NORMALIZERS) return;

  function sanitizeChannelName(value, fallback = "") {
    const cleaned = (value || "")
      .toString()
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-_]/g, "")
      .slice(0, 40);
    return cleaned || fallback;
  }

  function sanitizeForumTagName(value) {
    return (value || "")
      .toString()
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9_-]/g, "")
      .slice(0, 24);
  }

  function normalizeSlowmodeSeconds(value) {
    const next = Math.round(Number(value) || 0);
    return Math.max(0, Math.min(3600, next));
  }

  globalScope.SHITCORD67_NAME_NORMALIZERS = Object.freeze({
    sanitizeChannelName,
    sanitizeForumTagName,
    normalizeSlowmodeSeconds
  });
})(typeof window !== "undefined" ? window : globalThis);
