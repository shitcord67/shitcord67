(function initXep0313MamLoading(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_0313_MAM_LOADING) return;

  function beginXmppMamLoading(mamState, queryId = "") {
    if (!mamState) return;
    mamState.loading = true;
    mamState.loadingSince = Date.now();
    mamState.lastQueryId = queryId;
  }

  function endXmppMamLoading(mamState) {
    if (!mamState) return;
    mamState.loading = false;
    mamState.loadingSince = 0;
  }

  function recoverStaleXmppMamLoading(mamState, details = {}, deps = {}) {
    if (!mamState || !mamState.loading) return false;
    const staleMs = Math.max(1000, Number(deps.staleMs) || 0);
    const startedAt = Number(mamState.loadingSince) || 0;
    if (!startedAt) {
      mamState.loadingSince = Date.now();
      return false;
    }
    const ageMs = Date.now() - startedAt;
    if (ageMs < staleMs) return false;
    const queryId = (mamState.lastQueryId || "").toString();
    if (typeof deps.endXmppMamLoadingFn === "function") deps.endXmppMamLoadingFn(mamState);
    else endXmppMamLoading(mamState);
    if (typeof deps.addXmppDebugEventFn === "function") {
      deps.addXmppDebugEventFn("iq", "Recovered stale MAM loading state", {
        ...details,
        ageMs,
        queryId
      });
    }
    return true;
  }

  function xmppMamArchiveTargetJid(prefs = {}, deps = {}) {
    const xmppDomainFromJidFn = deps.xmppDomainFromJidFn;
    if (typeof xmppDomainFromJidFn !== "function") return "";
    const domain = xmppDomainFromJidFn(prefs.xmppJid || "");
    return domain || "";
  }

  globalScope.SHITCORD67_XEP_0313_MAM_LOADING = Object.freeze({
    beginXmppMamLoading,
    endXmppMamLoading,
    recoverStaleXmppMamLoading,
    xmppMamArchiveTargetJid
  });
  if (typeof globalScope.SHITCORD67_XEP_REGISTRY?.register === "function") {
    globalScope.SHITCORD67_XEP_REGISTRY.register("xep-0313_mam-loading", globalScope.SHITCORD67_XEP_0313_MAM_LOADING);
  }
})(typeof window !== "undefined" ? window : globalThis);
