(function initXep0454Aggregate(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_0454) return;

  const registry = globalScope.SHITCORD67_XEP_REGISTRY;
  const media = (typeof registry?.get === "function" ? registry.get("xep-0454_omemo-media-sharing-utils") : null)
    || globalScope.SHITCORD67_XEP_0454_UTILS
    || {};

  const aggregate = Object.freeze({
    media
  });

  globalScope.SHITCORD67_XEP_0454 = aggregate;
  if (typeof registry?.register === "function") {
    registry.register("xep-0454", aggregate);
  }
})(typeof window !== "undefined" ? window : globalThis);
