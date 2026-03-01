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
    mamNamespace = "urn:xmpp:mam:2",
    rsmNamespace = "http://jabber.org/protocol/rsm"
  } = {}, deps = {}) {
    if (!stanza || typeof stanza.getElementsByTagName !== "function") {
      return { complete: false, firstId: "", lastId: "", count: null };
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
    const setNode = finNode
      ? ([...finNode.getElementsByTagName("set")].find((node) => xmlnsMatcher(node, rsmNamespace))
          || [...finNode.getElementsByTagName("set")][0]
          || null)
      : null;
    const firstNode = setNode
      ? [...setNode.getElementsByTagName("first")][0]
      : (finNode ? [...finNode.getElementsByTagName("first")][0] : null);
    const lastNode = setNode
      ? [...setNode.getElementsByTagName("last")][0]
      : (finNode ? [...finNode.getElementsByTagName("last")][0] : null);
    const countNode = setNode
      ? [...setNode.getElementsByTagName("count")][0]
      : (finNode ? [...finNode.getElementsByTagName("count")][0] : null);
    const firstId = (nodeText(firstNode) || "").toString().trim();
    const lastId = (nodeText(lastNode) || "").toString().trim();
    const countValue = Number((nodeText(countNode) || "").toString().trim());
    const count = Number.isFinite(countValue) && countValue >= 0 ? Math.floor(countValue) : null;
    return { complete, firstId, lastId, count };
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
    const lastId = (page.lastId || "").toString().trim();
    const beforeId = firstId || lastId;
    const complete = page.complete === true;
    const count = Number.isFinite(page.count) && Number(page.count) >= 0 ? Math.floor(Number(page.count)) : null;
    mamState.pagesLoaded = (Number(mamState.pagesLoaded) || 0) + 1;
    if (beforeId) mamState.before = beforeId;
    if (count !== null) mamState.lastCount = count;
    if (complete || !beforeId) mamState.complete = true;
    return mamState;
  }

  function createXmppMamState({ includeTargetIndex = false } = {}) {
    return {
      before: "",
      complete: false,
      loading: false,
      loadingSince: 0,
      pagesLoaded: 0,
      lastQueryId: "",
      ...(includeTargetIndex ? { targetIndex: 0 } : {})
    };
  }

  function ensureXmppMamStateByJid(stateByJid, jid = "", { includeTargetIndex = false } = {}, deps = {}) {
    if (!stateByJid || typeof stateByJid.has !== "function" || typeof stateByJid.get !== "function" || typeof stateByJid.set !== "function") {
      return null;
    }
    if (typeof deps.xmppBareJidFn !== "function") return null;
    const bareJid = deps.xmppBareJidFn(jid);
    if (!bareJid) return null;
    if (!stateByJid.has(bareJid)) {
      stateByJid.set(bareJid, createXmppMamState({ includeTargetIndex }));
    }
    return stateByJid.get(bareJid) || null;
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

  function requestXmppRoomHistory(roomJid, {
    limit = 50,
    force = false,
    reason = "manual",
    prefetchPages = 1
  } = {}, deps = {}) {
    if (typeof deps.xmppBareJidFn !== "function") return false;
    const bareRoom = deps.xmppBareJidFn(roomJid);
    if (!bareRoom || !deps.xmppConnection || typeof deps.$iq !== "function") return false;
    const mamState = typeof deps.ensureXmppMamStateFn === "function" ? deps.ensureXmppMamStateFn(bareRoom) : null;
    if (!mamState) return false;
    if (typeof deps.recoverStaleXmppMamLoadingFn === "function") {
      deps.recoverStaleXmppMamLoadingFn(mamState, { scope: "muc", roomJid: bareRoom, reason: `${reason}-precheck` });
    }
    if (mamState.loading) return false;
    if (!force && mamState.complete) return false;
    if (force && typeof deps.xmppMamResetStateForForceReloadFn === "function") {
      deps.xmppMamResetStateForForceReloadFn(mamState);
    }
    const pageSize = Math.max(10, Math.min(200, Number(deps.XMPP_MAM_PAGE_SIZE) || 50));
    const maxRows = Math.max(10, Math.min(200, Number(limit) || pageSize));
    const beforeToken = mamState.before || "";
    const createIdFn = typeof deps.createIdFn === "function" ? deps.createIdFn : (() => `${Date.now()}`);
    const queryId = `mam-${createIdFn().slice(0, 8)}-${mamState.pagesLoaded + 1}`;
    if (typeof deps.beginXmppMamLoadingFn === "function") deps.beginXmppMamLoadingFn(mamState, queryId);
    const iqBuilder = typeof deps.buildXmppMamQueryIqFn === "function"
      ? deps.buildXmppMamQueryIqFn({
        to: bareRoom,
        queryId,
        withJid: "",
        maxRows,
        beforeToken
      })
      : null;
    if (!iqBuilder) {
      if (typeof deps.endXmppMamLoadingFn === "function") deps.endXmppMamLoadingFn(mamState);
      return false;
    }
    if (typeof deps.addXmppDebugEventFn === "function") {
      deps.addXmppDebugEventFn("iq", "Requesting MUC history", {
        roomJid: bareRoom,
        max: maxRows,
        before: beforeToken || "(latest)",
        page: mamState.pagesLoaded + 1,
        reason
      });
    }
    try {
      deps.xmppConnection.sendIQ(
        iqBuilder,
        (stanza) => {
          if (typeof deps.endXmppMamLoadingFn === "function") deps.endXmppMamLoadingFn(mamState);
          const page = typeof deps.parseXmppMamFinPageFn === "function"
            ? deps.parseXmppMamFinPageFn(stanza)
            : { complete: false, firstId: "", lastId: "", count: null };
          if (typeof deps.xmppMamUpdateStateFromFinPageFn === "function") {
            deps.xmppMamUpdateStateFromFinPageFn(mamState, page);
          }
          const nextPrefetchPages = Math.max(1, Number(prefetchPages) || 1);
          if (nextPrefetchPages > 1 && !mamState.complete) {
            const setTimeoutFn = typeof deps.setTimeoutFn === "function" ? deps.setTimeoutFn : setTimeout;
            setTimeoutFn(() => {
              requestXmppRoomHistory(bareRoom, {
                limit: maxRows,
                force: false,
                reason: `${reason}-prefetch`,
                prefetchPages: nextPrefetchPages - 1
              }, deps);
            }, 120);
          }
          const activeRoomJid = deps.xmppBareJidFn(deps.getActiveChannelFn?.()?.xmppRoomJid || "");
          if (activeRoomJid && activeRoomJid === bareRoom) {
            deps.renderMessagesFn?.();
          }
          deps.renderChannelsFn?.();
          if (typeof deps.addXmppDebugEventFn === "function") {
            deps.addXmppDebugEventFn("iq", "MUC history query completed", {
              roomJid: bareRoom,
              queryId,
              page: mamState.pagesLoaded,
              complete: mamState.complete,
              first: page.firstId || "",
              last: page.lastId || "",
              count: page.count,
              canLoadMore: !mamState.complete
            });
          }
        },
        (stanza) => {
          if (typeof deps.endXmppMamLoadingFn === "function") deps.endXmppMamLoadingFn(mamState);
          const permanent = typeof deps.xmppMamErrorIsPermanentFn === "function"
            ? deps.xmppMamErrorIsPermanentFn(stanza)
            : false;
          if (permanent) mamState.complete = true;
          const activeRoomJid = deps.xmppBareJidFn(deps.getActiveChannelFn?.()?.xmppRoomJid || "");
          if (activeRoomJid && activeRoomJid === bareRoom) {
            deps.renderMessagesFn?.();
          }
          deps.renderChannelsFn?.();
          if (typeof deps.addXmppDebugEventFn === "function") {
            deps.addXmppDebugEventFn("iq", "MUC history query unavailable", {
              roomJid: bareRoom,
              queryId,
              page: mamState.pagesLoaded + 1,
              reason,
              permanent
            });
          }
        },
        Number(deps.XMPP_MAM_REQUEST_TIMEOUT_MS) || 8000
      );
    } catch (error) {
      if (typeof deps.endXmppMamLoadingFn === "function") deps.endXmppMamLoadingFn(mamState);
      if (typeof deps.addXmppDebugEventFn === "function") {
        deps.addXmppDebugEventFn("error", "Failed to send MUC history query", {
          roomJid: bareRoom,
          queryId,
          reason,
          error: String(error?.message || error || "unknown")
        });
      }
      return false;
    }
    return true;
  }

  function requestXmppDirectHistory(peerJid, {
    limit = 50,
    force = false,
    reason = "manual",
    prefetchPages = 1
  } = {}, deps = {}) {
    if (typeof deps.xmppBareJidFn !== "function") return false;
    const barePeer = deps.xmppBareJidFn(peerJid);
    if (!barePeer || !deps.xmppConnection || typeof deps.$iq !== "function") return false;
    if (typeof deps.getPreferencesFn !== "function") return false;
    const prefs = deps.getPreferencesFn();
    const ownBare = deps.xmppBareJidFn(prefs?.xmppJid || "");
    if (!ownBare) return false;
    const domainTarget = typeof deps.xmppMamArchiveTargetJidFn === "function"
      ? deps.xmppMamArchiveTargetJidFn(prefs)
      : "";
    const archiveTargets = [...new Set([domainTarget, ownBare].filter(Boolean))];
    if (archiveTargets.length === 0) return false;
    const mamState = typeof deps.ensureXmppDmMamStateFn === "function" ? deps.ensureXmppDmMamStateFn(barePeer) : null;
    if (!mamState) return false;
    if (typeof deps.recoverStaleXmppMamLoadingFn === "function") {
      deps.recoverStaleXmppMamLoadingFn(mamState, { scope: "dm", peerJid: barePeer, reason: `${reason}-precheck` });
    }
    if (mamState.loading) return false;
    if (!force && mamState.complete) return false;
    if (force && typeof deps.xmppMamResetStateForForceReloadFn === "function") {
      deps.xmppMamResetStateForForceReloadFn(mamState, { includeTargetIndex: true });
    }
    const targetIndex = Math.max(0, Math.min(archiveTargets.length - 1, Number(mamState.targetIndex) || 0));
    const archiveTarget = archiveTargets[targetIndex] || archiveTargets[0];
    if (!archiveTarget) return false;
    const pageSize = Math.max(10, Math.min(200, Number(deps.XMPP_MAM_PAGE_SIZE) || 50));
    const maxRows = Math.max(10, Math.min(200, Number(limit) || pageSize));
    const beforeToken = mamState.before || "";
    const createIdFn = typeof deps.createIdFn === "function" ? deps.createIdFn : (() => `${Date.now()}`);
    const queryId = `mam-dm-${createIdFn().slice(0, 8)}-${mamState.pagesLoaded + 1}`;
    if (typeof deps.beginXmppMamLoadingFn === "function") deps.beginXmppMamLoadingFn(mamState, queryId);
    const iqBuilder = typeof deps.buildXmppMamQueryIqFn === "function"
      ? deps.buildXmppMamQueryIqFn({
        to: archiveTarget,
        queryId,
        withJid: barePeer,
        maxRows,
        beforeToken
      })
      : null;
    if (!iqBuilder) {
      if (typeof deps.endXmppMamLoadingFn === "function") deps.endXmppMamLoadingFn(mamState);
      return false;
    }
    if (typeof deps.addXmppDebugEventFn === "function") {
      deps.addXmppDebugEventFn("iq", "Requesting DM history", {
        peerJid: barePeer,
        target: archiveTarget,
        targetIndex: targetIndex + 1,
        targetCount: archiveTargets.length,
        max: maxRows,
        before: beforeToken || "(latest)",
        page: mamState.pagesLoaded + 1,
        reason
      });
    }
    try {
      deps.xmppConnection.sendIQ(
        iqBuilder,
        (stanza) => {
          if (typeof deps.endXmppMamLoadingFn === "function") deps.endXmppMamLoadingFn(mamState);
          mamState.targetIndex = targetIndex;
          const page = typeof deps.parseXmppMamFinPageFn === "function"
            ? deps.parseXmppMamFinPageFn(stanza)
            : { complete: false, firstId: "", lastId: "", count: null };
          if (typeof deps.xmppMamUpdateStateFromFinPageFn === "function") {
            deps.xmppMamUpdateStateFromFinPageFn(mamState, page);
          }
          const nextPrefetchPages = Math.max(1, Number(prefetchPages) || 1);
          if (nextPrefetchPages > 1 && !mamState.complete) {
            const setTimeoutFn = typeof deps.setTimeoutFn === "function" ? deps.setTimeoutFn : setTimeout;
            setTimeoutFn(() => {
              requestXmppDirectHistory(barePeer, {
                limit: maxRows,
                force: false,
                reason: `${reason}-prefetch`,
                prefetchPages: nextPrefetchPages - 1
              }, deps);
            }, 120);
          }
          const activeConversation = deps.getActiveConversationFn?.();
          const activePeer = activeConversation?.type === "dm"
            ? deps.xmppPeerJidForDmThreadFn?.(activeConversation.thread, deps.getCurrentAccountFn?.())
            : "";
          if (activePeer && deps.xmppBareJidFn(activePeer) === barePeer) {
            deps.renderMessagesFn?.();
          }
          deps.renderDmListFn?.();
          if (typeof deps.addXmppDebugEventFn === "function") {
            deps.addXmppDebugEventFn("iq", "DM history query completed", {
              peerJid: barePeer,
              queryId,
              page: mamState.pagesLoaded,
              complete: mamState.complete,
              first: page.firstId || "",
              last: page.lastId || "",
              count: page.count,
              canLoadMore: !mamState.complete
            });
          }
        },
        (stanza) => {
          if (typeof deps.endXmppMamLoadingFn === "function") deps.endXmppMamLoadingFn(mamState);
          const permanent = typeof deps.xmppMamErrorIsPermanentFn === "function"
            ? deps.xmppMamErrorIsPermanentFn(stanza)
            : false;
          const canFallbackTarget = permanent && (targetIndex + 1) < archiveTargets.length;
          if (canFallbackTarget && typeof deps.xmppMamPrepareFallbackTargetStateFn === "function") {
            deps.xmppMamPrepareFallbackTargetStateFn(mamState, targetIndex + 1);
            if (typeof deps.addXmppDebugEventFn === "function") {
              deps.addXmppDebugEventFn("iq", "DM history retrying alternate archive target", {
                peerJid: barePeer,
                fromTarget: archiveTarget,
                toTarget: archiveTargets[mamState.targetIndex] || ""
              });
            }
            requestXmppDirectHistory(barePeer, {
              limit: maxRows,
              force: false,
              reason: `${reason}-fallback-target`,
              prefetchPages
            }, deps);
            return;
          }
          if (permanent) mamState.complete = true;
          const activeConversation = deps.getActiveConversationFn?.();
          const activePeer = activeConversation?.type === "dm"
            ? deps.xmppPeerJidForDmThreadFn?.(activeConversation.thread, deps.getCurrentAccountFn?.())
            : "";
          if (activePeer && deps.xmppBareJidFn(activePeer) === barePeer) {
            deps.renderMessagesFn?.();
          }
          deps.renderDmListFn?.();
          if (typeof deps.addXmppDebugEventFn === "function") {
            deps.addXmppDebugEventFn("iq", "DM history query unavailable", {
              peerJid: barePeer,
              target: archiveTarget,
              queryId,
              page: mamState.pagesLoaded + 1,
              reason,
              permanent
            });
          }
        },
        Number(deps.XMPP_MAM_REQUEST_TIMEOUT_MS) || 8000
      );
    } catch (error) {
      if (typeof deps.endXmppMamLoadingFn === "function") deps.endXmppMamLoadingFn(mamState);
      if (typeof deps.addXmppDebugEventFn === "function") {
        deps.addXmppDebugEventFn("error", "Failed to send DM history query", {
          peerJid: barePeer,
          target: archiveTarget,
          queryId,
          reason,
          error: String(error?.message || error || "unknown")
        });
      }
      return false;
    }
    return true;
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
    createXmppMamState,
    ensureXmppMamStateByJid,
    xmppMamResetStateForForceReload,
    xmppMamPrepareFallbackTargetState,
    requestXmppRoomHistory,
    requestXmppDirectHistory
  });
  if (typeof globalScope.SHITCORD67_XEP_REGISTRY?.register === "function") {
    globalScope.SHITCORD67_XEP_REGISTRY.register("xep-0313_mam-loading", globalScope.SHITCORD67_XEP_0313_MAM_LOADING);
  }
})(typeof window !== "undefined" ? window : globalThis);
