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

  globalScope.SHITCORD67_NAME_NORMALIZERS = Object.freeze({
    sanitizeChannelName
  });
})(typeof window !== "undefined" ? window : globalThis);
