(function initXep0184_0333MarkerFlow(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_0184_0333_MARKER_FLOW) return;

  function latestXmppPeerMessageReferenceIdForDmThread(thread, accountId, deps = {}) {
    if (!thread || !accountId || !Array.isArray(thread.messages)) return "";
    const ownId = accountId.toString();
    const preferredRefFn = deps.preferredXmppDmReferenceIdForMessageFn;
    const primaryRefFn = deps.primaryXmppReferenceIdForMessageFn;
    for (let i = thread.messages.length - 1; i >= 0; i -= 1) {
      const message = thread.messages[i];
      if (!message) continue;
      const authorId = (message.userId || "").toString();
      if (authorId && authorId === ownId) continue;
      const preferredId = typeof preferredRefFn === "function" ? preferredRefFn(message) : "";
      const primaryId = typeof primaryRefFn === "function" ? primaryRefFn(message) : "";
      const stanzaId = (message.xmppStanzaId || "").toString().trim();
      const refList = Array.isArray(message.xmppRefIds) ? message.xmppRefIds : [];
      const firstRef = refList.find((entry) => (entry || "").toString().trim()) || "";
      const fallbackRef = (firstRef || "").toString().trim();
      const referenceId = preferredId || primaryId || stanzaId || fallbackRef;
      if (referenceId) return referenceId;
    }
    return "";
  }

  function sendXmppDisplayedMarkerToPeer(peerJid, markerTargetId, {
    trigger = ""
  } = {}, deps = {}) {
    const bareJidFn = deps.xmppBareJidFn;
    const peerBare = typeof bareJidFn === "function" ? bareJidFn(peerJid) : "";
    const targetId = (markerTargetId || "").toString().trim();
    if (!peerBare || !targetId) return false;
    if (!deps.xmppConnection || typeof deps.xmppConnection.send !== "function") return false;
    if (typeof deps.shouldSkipXmppDisplayedMarkerFn === "function"
      && deps.shouldSkipXmppDisplayedMarkerFn(peerBare, targetId)) {
      return false;
    }
    const createIdFn = typeof deps.createIdFn === "function" ? deps.createIdFn : (() => `${Date.now()}`);
    const markerStanzaId = `s67-mark-${createIdFn().slice(0, 12)}`;
    if (typeof deps.buildXmppDisplayedMarkerStanzaFn !== "function") return false;
    const markerStanza = deps.buildXmppDisplayedMarkerStanzaFn(peerBare, targetId, markerStanzaId);
    if (!markerStanza) return false;
    deps.xmppConnection.send(markerStanza);
    if (typeof deps.rememberXmppLocalSentRefsFn === "function") {
      deps.rememberXmppLocalSentRefsFn([markerStanzaId]);
    }
    deps.lastSentDisplayedMarkerByPeerJid?.set?.(peerBare, targetId);
    if (typeof deps.addXmppDebugEventFn === "function") {
      deps.addXmppDebugEventFn("message", "Sent XMPP chat marker", {
        to: peerBare,
        marker: "displayed",
        id: targetId,
        stanzaId: markerStanzaId,
        trigger: trigger || ""
      });
    }
    return true;
  }

  function maybePublishXmppDisplayedMarkerForDmThread(thread, accountId, {
    trigger = ""
  } = {}, deps = {}) {
    if (typeof deps.getPreferencesFn !== "function") return false;
    const prefs = deps.getPreferencesFn();
    if (prefs?.relayMode !== "xmpp") return false;
    if ((deps.relayStatus || "").toString() !== "connected") return false;
    if (!deps.xmppConnection || typeof deps.xmppConnection.send !== "function" || typeof deps.$msg !== "function") return false;
    if (!thread || !accountId) return false;
    const account = typeof deps.getAccountByIdFn === "function" ? deps.getAccountByIdFn(accountId) : null;
    if (!account) return false;
    const peerJid = typeof deps.xmppPeerJidForDmThreadFn === "function"
      ? deps.xmppPeerJidForDmThreadFn(thread, account)
      : "";
    const peerBare = typeof deps.xmppBareJidFn === "function" ? deps.xmppBareJidFn(peerJid) : "";
    if (!peerBare) return false;
    const markerTargetId = typeof deps.latestXmppPeerMessageReferenceIdForDmThreadFn === "function"
      ? deps.latestXmppPeerMessageReferenceIdForDmThreadFn(thread, accountId)
      : "";
    if (!markerTargetId) return false;
    if (typeof deps.sendXmppDisplayedMarkerToPeerFn !== "function") return false;
    return deps.sendXmppDisplayedMarkerToPeerFn(peerBare, markerTargetId, { trigger: trigger || "thread-read" });
  }

  globalScope.SHITCORD67_XEP_0184_0333_MARKER_FLOW = Object.freeze({
    latestXmppPeerMessageReferenceIdForDmThread,
    sendXmppDisplayedMarkerToPeer,
    maybePublishXmppDisplayedMarkerForDmThread
  });
  if (typeof globalScope.SHITCORD67_XEP_REGISTRY?.register === "function") {
    globalScope.SHITCORD67_XEP_REGISTRY.register("xep-0184_0333-marker-flow", globalScope.SHITCORD67_XEP_0184_0333_MARKER_FLOW);
  }
})(typeof window !== "undefined" ? window : globalThis);
