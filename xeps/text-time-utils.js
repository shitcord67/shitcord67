(function initTextTimeUtils(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_TEXT_TIME_UTILS) return;

  function clampMessageTextForStorage(value, {
    maxLength = 4000
  } = {}) {
    return (value || "").toString().slice(0, maxLength);
  }

  function escapeRegExp(value) {
    return (value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function toTimestampMs(value) {
    const parsed = Date.parse(value || "");
    return Number.isFinite(parsed) ? parsed : 0;
  }

  globalScope.SHITCORD67_TEXT_TIME_UTILS = Object.freeze({
    clampMessageTextForStorage,
    escapeRegExp,
    toTimestampMs
  });
})(typeof window !== "undefined" ? window : globalThis);
