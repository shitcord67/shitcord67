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

  function buildXmppMamQueryIq({
    to = "",
    queryId = "",
    withJid = "",
    maxRows = 50,
    beforeToken = "",
    mamNamespace = "urn:xmpp:mam:2",
    rsmNamespace = "http://jabber.org/protocol/rsm"
  } = {}, deps = {}) {
    if (typeof deps.$iq !== "function") return null;
    const safeTo = (to || "").toString().trim();
    const safeQueryId = (queryId || "").toString().trim();
    const safeWith = (withJid || "").toString().trim();
    const safeBefore = (beforeToken || "").toString().trim();
    const safeMax = Math.max(10, Math.min(200, Number(maxRows) || 50));
    const iqAttrs = { type: "set" };
    if (safeTo) iqAttrs.to = safeTo;
    const iqBuilder = deps.$iq(iqAttrs)
      .c("query", {
        xmlns: (mamNamespace || "").toString().trim() || "urn:xmpp:mam:2",
        ...(safeQueryId ? { queryid: safeQueryId } : {})
      })
      .c("x", { xmlns: "jabber:x:data", type: "submit" })
      .c("field", { var: "FORM_TYPE" })
      .c("value")
      .t((mamNamespace || "").toString().trim() || "urn:xmpp:mam:2")
      .up()
      .up();
    if (safeWith) {
      iqBuilder
        .c("field", { var: "with" })
        .c("value")
        .t(safeWith)
        .up()
        .up();
    }
    iqBuilder
      .up()
      .c("set", { xmlns: (rsmNamespace || "").toString().trim() || "http://jabber.org/protocol/rsm" })
      .c("max")
      .t(String(safeMax))
      .up();
    if (!safeBefore) iqBuilder.c("before");
    else iqBuilder.c("before").t(safeBefore);
    return iqBuilder;
  }

  function parseXmppMamFinPage(stanza, {
    mamNamespace = "urn:xmpp:mam:2"
  } = {}, deps = {}) {
    if (!stanza || typeof stanza.getElementsByTagName !== "function") {
      return { complete: false, firstId: "" };
    }
    const xmlnsMatcher = typeof deps.xmppNodeHasXmlnsFn === "function"
      ? deps.xmppNodeHasXmlnsFn
      : ((node, xmlns) => ((node?.getAttribute?.("xmlns") || "").toString().toLowerCase() === (xmlns || "").toString().toLowerCase()));
    const nodeText = typeof deps.xmppNodeTextFn === "function"
      ? deps.xmppNodeTextFn
      : ((node) => (node?.textContent || "").toString());
    const finNode = [...stanza.getElementsByTagName("fin")]
      .find((node) => xmlnsMatcher(node, mamNamespace)) || null;
    const complete = (finNode?.getAttribute("complete") || "").toString().toLowerCase() === "true";
    const firstNode = finNode ? [...finNode.getElementsByTagName("first")][0] : null;
    const firstId = (nodeText(firstNode) || "").toString().trim();
    return { complete, firstId };
  }

  function xmppIqErrorNode(stanza) {
    return stanza?.getElementsByTagName?.("error")?.[0] || null;
  }

  function xmppMamErrorIsPermanent(stanza) {
    const errorNode = xmppIqErrorNode(stanza);
    return Boolean(
      errorNode?.getElementsByTagName?.("feature-not-implemented")?.length
      || errorNode?.getElementsByTagName?.("service-unavailable")?.length
      || errorNode?.getElementsByTagName?.("item-not-found")?.length
    );
  }

  function xmppMamUpdateStateFromFinPage(mamState, page = {}) {
    if (!mamState || !page || typeof page !== "object") return mamState;
    const firstId = (page.firstId || "").toString().trim();
    const complete = page.complete === true;
    mamState.pagesLoaded = (Number(mamState.pagesLoaded) || 0) + 1;
    if (firstId) mamState.before = firstId;
    if (complete || !firstId) mamState.complete = true;
    return mamState;
  }

  function xmppMamResetStateForForceReload(mamState, deps = {}) {
    if (!mamState) return mamState;
    mamState.before = "";
    mamState.complete = false;
    mamState.pagesLoaded = 0;
    if (deps.includeTargetIndex) mamState.targetIndex = 0;
    return mamState;
  }

  function xmppMamPrepareFallbackTargetState(mamState, nextTargetIndex = 0) {
    if (!mamState) return mamState;
    mamState.targetIndex = Math.max(0, Number(nextTargetIndex) || 0);
    mamState.before = "";
    mamState.pagesLoaded = 0;
    mamState.complete = false;
    return mamState;
  }

  globalScope.SHITCORD67_XEP_0313_MAM_LOADING = Object.freeze({
    beginXmppMamLoading,
    endXmppMamLoading,
    recoverStaleXmppMamLoading,
    xmppMamArchiveTargetJid,
    buildXmppMamQueryIq,
    parseXmppMamFinPage,
    xmppIqErrorNode,
    xmppMamErrorIsPermanent,
    xmppMamUpdateStateFromFinPage,
    xmppMamResetStateForForceReload,
    xmppMamPrepareFallbackTargetState
  });
  if (typeof globalScope.SHITCORD67_XEP_REGISTRY?.register === "function") {
    globalScope.SHITCORD67_XEP_REGISTRY.register("xep-0313_mam-loading", globalScope.SHITCORD67_XEP_0313_MAM_LOADING);
  }
})(typeof window !== "undefined" ? window : globalThis);
