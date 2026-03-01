(function initAccountProfileNormalizers(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_ACCOUNT_PROFILE_NORMALIZERS) return;

  function normalizeUsername(value) {
    const base = value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_")
      .slice(0, 24);
    try {
      return base.replace(new RegExp("[^\\p{L}\\p{N}._-]", "gu"), "");
    } catch {
      // Older JS engines may not support Unicode property escapes.
    }
    return value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9._-]/g, "")
      .slice(0, 24);
  }

  function normalizeComposerDrafts(value, {
    maxLength = 2000
  } = {}) {
    if (!value || typeof value !== "object") return {};
    const entries = Object.entries(value)
      .filter(([conversationId]) => typeof conversationId === "string" && conversationId)
      .map(([conversationId, draft]) => [conversationId, (draft || "").toString().slice(0, maxLength)]);
    return Object.fromEntries(entries.filter(([, draft]) => draft.length > 0));
  }

  globalScope.SHITCORD67_ACCOUNT_PROFILE_NORMALIZERS = Object.freeze({
    normalizeUsername,
    normalizeComposerDrafts
  });
})(typeof window !== "undefined" ? window : globalThis);
