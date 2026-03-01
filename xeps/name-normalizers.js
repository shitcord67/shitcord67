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

  globalScope.SHITCORD67_NAME_NORMALIZERS = Object.freeze({
    sanitizeChannelName,
    sanitizeForumTagName
  });
})(typeof window !== "undefined" ? window : globalThis);
