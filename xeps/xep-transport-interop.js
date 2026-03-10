/*
 * XMPP transport/XEP interop bridge extracted from app.js.
 * Functions here intentionally bind to app globals at call time.
 */

function xmppBareJid(value) {
  return xmppBareJidViaXep(value);
}

function xmppRoomNodeForToken(roomToken) {
  return xmppRoomNodeForTokenViaXep(roomToken);
}

function looksLikeXmppMucJid(roomJid, prefs = getPreferences()) {
  return looksLikeXmppMucJidViaXep(roomJid, prefs);
}

function isXmppMucRoomJid(roomJid, prefs = getPreferences()) {
  return isXmppMucRoomJidViaXep(roomJid, prefs);
}

function xmppRoomJidForToken(roomToken, prefs = getPreferences()) {
  return xmppRoomJidForTokenViaXep(roomToken, prefs);
}

function clearXmppPingLoop() {
  if (typeof XEP_0199_0410_0313_PRESENCE_PING_GLOBAL.clearXmppPingLoop !== "function") return;
  XEP_0199_0410_0313_PRESENCE_PING_GLOBAL.clearXmppPingLoop({
    getPingTimerFn: () => xmppPingTimer,
    setPingTimerFn: (value) => { xmppPingTimer = value; },
    setPingOutstandingIdFn: (value) => { xmppPingOutstandingId = value; },
    setPingOutstandingAtFn: (value) => { xmppPingOutstandingAt = value; }
  });
}

function sendXmppPing(connection = xmppConnection, { timeoutMs = XMPP_PING_TIMEOUT_MS } = {}) {
  if (typeof XEP_0199_0410_0313_PRESENCE_PING_GLOBAL.sendXmppPing !== "function") {
    if (!connection || typeof connection.sendIQ !== "function" || typeof globalThis.$iq !== "function") return false;
    const pingId = `ping-${createId().slice(0, 8)}`;
    xmppPingOutstandingId = pingId;
    xmppPingOutstandingAt = Date.now();
    const stanza = globalThis.$iq({ type: "get", id: pingId }).c("ping", { xmlns: "urn:xmpp:ping" });
    connection.sendIQ(
      stanza,
      () => {
        if (xmppPingOutstandingId === pingId) {
          xmppPingOutstandingId = "";
          xmppPingOutstandingAt = 0;
        }
        addXmppDebugEvent("iq", "XMPP ping ok (fallback)", { id: pingId });
      },
      (error) => {
        if (xmppPingOutstandingId === pingId) {
          xmppPingOutstandingId = "";
          xmppPingOutstandingAt = 0;
        }
        addXmppDebugEvent("error", "XMPP ping failed (fallback)", {
          id: pingId,
          error: trimXmppRaw(xmppSerializePayload(error))
        });
      },
      Math.max(1000, Number(timeoutMs) || XMPP_PING_TIMEOUT_MS)
    );
    return true;
  }
  return XEP_0199_0410_0313_PRESENCE_PING_GLOBAL.sendXmppPing(connection, { timeoutMs }, {
    $iq: globalThis.$iq,
    getPingOutstandingIdFn: () => xmppPingOutstandingId,
    setPingOutstandingIdFn: (value) => { xmppPingOutstandingId = value; },
    setPingOutstandingAtFn: (value) => { xmppPingOutstandingAt = value; },
    addXmppDebugEventFn: addXmppDebugEvent,
    xmppSerializePayloadFn: xmppSerializePayload,
    trimXmppRawFn: trimXmppRaw
  });
}

function startXmppPingLoop(connection = xmppConnection) {
  if (typeof XEP_0199_0410_0313_PRESENCE_PING_GLOBAL.startXmppPingLoop !== "function") {
    clearXmppPingLoop();
    xmppPingTimer = setInterval(() => {
      if (relayStatus !== "connected" || !xmppConnection) return;
      sendXmppPing(xmppConnection);
      requestXmppSmAck(xmppConnection, { reason: "ping-loop", minIntervalMs: XMPP_SM_ACK_REQUEST_INTERVAL_MS });
    }, XMPP_PING_INTERVAL_MS);
    return;
  }
  XEP_0199_0410_0313_PRESENCE_PING_GLOBAL.startXmppPingLoop(connection, {
    $iq: globalThis.$iq,
    intervalMs: XMPP_PING_INTERVAL_MS,
    getXmppConnectionFn: () => xmppConnection,
    getRelayStatusFn: () => relayStatus,
    sendXmppPingFn: (conn) => {
      const sent = sendXmppPing(conn);
      requestXmppSmAck(conn, { reason: "ping-loop", minIntervalMs: XMPP_SM_ACK_REQUEST_INTERVAL_MS });
      return sent;
    },
    clearXmppPingLoopFn: () => clearXmppPingLoop(),
    setPingTimerFn: (value) => { xmppPingTimer = value; },
    getPingTimerFn: () => xmppPingTimer,
    setPingOutstandingIdFn: (value) => { xmppPingOutstandingId = value; },
    setPingOutstandingAtFn: (value) => { xmppPingOutstandingAt = value; }
  });
}

function resetXmppSmRuntime({ keepSupport = false, reason = "" } = {}) {
  if (typeof XEP_0198_STREAM_MANAGEMENT_GLOBAL.resetXmppSmState !== "function") {
    xmppSmState = {
      supported: Boolean(keepSupport && xmppSmState?.supported),
      enabled: false,
      allowResume: false,
      resumed: false,
      failed: false,
      id: "",
      inboundHandledCount: 0,
      outboundStanzaCount: 0,
      lastAckedByServer: 0,
      lastEnableAt: 0,
      lastAckAt: 0,
      lastAckRequestAt: 0
    };
    return xmppSmState;
  }
  const next = XEP_0198_STREAM_MANAGEMENT_GLOBAL.resetXmppSmState(xmppSmState, { keepSupport });
  if (getPreferences().relayMode === "xmpp" && reason) {
    addXmppDebugEvent("connect", "Reset XMPP stream-management runtime state", { keepSupport, reason });
  }
  return next;
}

function noteXmppSmOutboundStanza(stanza) {
  if (typeof XEP_0198_STREAM_MANAGEMENT_GLOBAL.noteXmppSmOutboundStanza !== "function") return;
  XEP_0198_STREAM_MANAGEMENT_GLOBAL.noteXmppSmOutboundStanza(xmppSmState, stanza);
}

function noteXmppSmInboundStanza(stanza) {
  if (typeof XEP_0198_STREAM_MANAGEMENT_GLOBAL.noteXmppSmInboundStanza !== "function") return;
  XEP_0198_STREAM_MANAGEMENT_GLOBAL.noteXmppSmInboundStanza(xmppSmState, stanza);
}

function maybeEnableXmppStreamManagement(connection = xmppConnection, { allowResume = true, reason = "" } = {}) {
  if (typeof XEP_0198_STREAM_MANAGEMENT_GLOBAL.maybeEnableXmppStreamManagement !== "function") return false;
  return XEP_0198_STREAM_MANAGEMENT_GLOBAL.maybeEnableXmppStreamManagement(
    connection,
    xmppSmState,
    { allowResume, reason },
    {
      Strophe: globalThis.Strophe,
      streamManagementNamespace: XMPP_STREAM_MANAGEMENT_NAMESPACE,
      xmppNodeHasXmlnsFn: xmppNodeHasXmlns,
      addXmppDebugEventFn: addXmppDebugEvent
    }
  );
}

function requestXmppSmAck(connection = xmppConnection, { reason = "", minIntervalMs = XMPP_SM_ACK_REQUEST_INTERVAL_MS } = {}) {
  if (typeof XEP_0198_STREAM_MANAGEMENT_GLOBAL.requestXmppSmAck !== "function") return false;
  return XEP_0198_STREAM_MANAGEMENT_GLOBAL.requestXmppSmAck(
    connection,
    xmppSmState,
    { reason, minIntervalMs },
    {
      Strophe: globalThis.Strophe,
      streamManagementNamespace: XMPP_STREAM_MANAGEMENT_NAMESPACE,
      addXmppDebugEventFn: addXmppDebugEvent
    }
  );
}

function maybeRequestXmppSmAckForBacklog(connection = xmppConnection, {
  reason = "",
  minUnacked = 8,
  minIntervalMs = 5000
} = {}) {
  if (typeof XEP_0198_STREAM_MANAGEMENT_GLOBAL.maybeRequestXmppSmAckForBacklog !== "function") return false;
  return XEP_0198_STREAM_MANAGEMENT_GLOBAL.maybeRequestXmppSmAckForBacklog(
    connection,
    xmppSmState,
    { reason, minUnacked, minIntervalMs },
    {
      Strophe: globalThis.Strophe,
      streamManagementNamespace: XMPP_STREAM_MANAGEMENT_NAMESPACE,
      addXmppDebugEventFn: addXmppDebugEvent
    }
  );
}

function handleXmppSmStanza(stanza, connection = xmppConnection) {
  if (typeof XEP_0198_STREAM_MANAGEMENT_GLOBAL.handleXmppSmStanza !== "function") return { handled: false, type: "" };
  return XEP_0198_STREAM_MANAGEMENT_GLOBAL.handleXmppSmStanza(
    stanza,
    { streamManagementNamespace: XMPP_STREAM_MANAGEMENT_NAMESPACE },
    {
      smState: xmppSmState,
      connection,
      Strophe: globalThis.Strophe,
      xmppNodeHasXmlnsFn: xmppNodeHasXmlns,
      addXmppDebugEventFn: addXmppDebugEvent
    }
  );
}

function clearXmppMucSelfPing(roomJid = "") {
  if (typeof XEP_0199_0410_0313_PRESENCE_PING_GLOBAL.clearXmppMucSelfPing !== "function") return;
  XEP_0199_0410_0313_PRESENCE_PING_GLOBAL.clearXmppMucSelfPing(roomJid, {
    bareJidFn: xmppBareJid,
    mucSelfPingStateByRoomJid: xmppMucSelfPingStateByRoomJid
  });
}

function clearAllXmppMucSelfPings() {
  if (typeof XEP_0199_0410_0313_PRESENCE_PING_GLOBAL.clearAllXmppMucSelfPings !== "function") return;
  XEP_0199_0410_0313_PRESENCE_PING_GLOBAL.clearAllXmppMucSelfPings({
    mucSelfPingStateByRoomJid: xmppMucSelfPingStateByRoomJid
  });
}

function xmppMucSelfPingTarget(roomJid = "", fallbackNick = "") {
  if (typeof XEP_0199_0410_0313_PRESENCE_PING_GLOBAL.xmppMucSelfPingTarget !== "function") return "";
  return XEP_0199_0410_0313_PRESENCE_PING_GLOBAL.xmppMucSelfPingTarget(roomJid, fallbackNick, {
    bareJidFn: xmppBareJid,
    mucJoinStateByRoomJid: xmppMucJoinStateByRoomJid,
    getCurrentAccountFn: getCurrentAccount,
    sanitizeChannelNameFn: sanitizeChannelName
  });
}

function scheduleXmppMucSelfPing(roomJid = "", {
  immediate = false,
  reason = ""
} = {}) {
  if (typeof XEP_0199_0410_0313_PRESENCE_PING_GLOBAL.scheduleXmppMucSelfPing !== "function") return false;
  return XEP_0199_0410_0313_PRESENCE_PING_GLOBAL.scheduleXmppMucSelfPing(roomJid, { immediate, reason }, {
    bareJidFn: xmppBareJid,
    mucSelfPingStateByRoomJid: xmppMucSelfPingStateByRoomJid,
    getXmppConnectionFn: () => xmppConnection,
    getRelayStatusFn: () => relayStatus,
    clearXmppMucSelfPingFn: (jid) => clearXmppMucSelfPing(jid),
    sendXmppMucSelfPingFn: (jid, options) => sendXmppMucSelfPing(jid, options),
    mucSelfPingIntervalMs: XMPP_MUC_SELF_PING_INTERVAL_MS
  });
}

function sendXmppMucSelfPing(roomJid = "", { reason = "manual" } = {}) {
  if (typeof XEP_0199_0410_0313_PRESENCE_PING_GLOBAL.sendXmppMucSelfPing !== "function") return false;
  return XEP_0199_0410_0313_PRESENCE_PING_GLOBAL.sendXmppMucSelfPing(roomJid, { reason }, {
    bareJidFn: xmppBareJid,
    $iq: globalThis.$iq,
    mucJoinStateByRoomJid: xmppMucJoinStateByRoomJid,
    mucSelfPingStateByRoomJid: xmppMucSelfPingStateByRoomJid,
    getXmppConnectionFn: () => xmppConnection,
    getRelayStatusFn: () => relayStatus,
    scheduleXmppMucSelfPingFn: (jid, options) => scheduleXmppMucSelfPing(jid, options),
    xmppMucSelfPingTargetFn: (jid) => xmppMucSelfPingTarget(jid),
    xmppStanzaErrorDetailsFn: xmppStanzaErrorDetails,
    addXmppDebugEventFn: addXmppDebugEvent,
    joinXmppRoomFn: joinXmppRoom,
    getCurrentAccountFn: getCurrentAccount,
    mucSelfPingTimeoutMs: XMPP_MUC_SELF_PING_TIMEOUT_MS,
    rejoinAfterFailures: XMPP_MUC_SELF_PING_REJOIN_AFTER_FAILURES,
    rejoinCooldownMs: XMPP_MUC_SELF_PING_REJOIN_COOLDOWN_MS
  });
}

function decodeHtmlEntities(text) {
  if (typeof XEP_0066_0071_0231_MEDIA_GLOBAL.decodeHtmlEntities === "function") {
    return XEP_0066_0071_0231_MEDIA_GLOBAL.decodeHtmlEntities(text);
  }
  return (text || "").toString();
}

function detectImageMimeFromBase64(bin) {
  const value = (bin || "").toString().trim();
  if (!value) return "";
  if (value.startsWith("iVBORw0KGgo")) return "image/png";
  if (value.startsWith("/9j/")) return "image/jpeg";
  if (value.startsWith("R0lGOD")) return "image/gif";
  if (value.startsWith("UklGR")) return "image/webp";
  if (value.startsWith("PHN2Zy") || value.startsWith("PD94bWwg") || value.startsWith("PCFET0NU")) return "image/svg+xml";
  return "";
}

function messageMatchesXmppReference(message, referenceId) {
  return messageMatchesXmppReferenceViaXep(message, referenceId);
}

function normalizeXmppProcessingHints(value) {
  return normalizeXmppProcessingHintsViaXep(value);
}

function applyXmppCorrectionToMessageEntry(target, {
  text = "",
  attachments = [],
  timestamp = "",
  editorUserId = "",
  editorName = "",
  stanzaId = "",
  stanzaRefs = [],
  processingHints = null
} = {}) {
  if (!target) return { handled: false, changed: false };
  let contentChanged = false;
  let metaChanged = false;
  const nextText = clampMessageTextForStorage((text || "").toString());
  if (nextText.trim() && nextText !== (target.text || "").toString()) {
    if (!Array.isArray(target.editHistory)) target.editHistory = [];
    target.editHistory.unshift({
      editedAt: Number.isFinite(Date.parse(timestamp || "")) ? new Date(timestamp).toISOString() : new Date().toISOString(),
      editorUserId: editorUserId || target.userId || "",
      editorName: editorName || displayNameForMessage(target) || "xmpp",
      previousText: (target.text || "").toString()
    });
    if (target.editHistory.length > 25) target.editHistory = target.editHistory.slice(0, 25);
    target.text = nextText;
    contentChanged = true;
  }
  const currentAttachments = normalizeAttachments(target.attachments);
  const nextAttachments = normalizeAttachments(attachments);
  const attachmentSignature = (items) => items
    .map((entry) => `${entry.type || ""}|${entry.url || ""}|${entry.name || ""}|${entry.format || ""}`)
    .join("||");
  if (nextAttachments.length > 0 && attachmentSignature(nextAttachments) !== attachmentSignature(currentAttachments)) {
    target.attachments = nextAttachments;
    contentChanged = true;
  }
  const mergedRefIds = normalizeXmppRefIdsList([
    ...normalizeXmppRefIdsList(target.xmppRefIds),
    ...normalizeXmppRefIdsList(stanzaRefs),
    stanzaId
  ]);
  const currentRefIds = normalizeXmppRefIdsList(target.xmppRefIds);
  if (mergedRefIds.length !== currentRefIds.length || mergedRefIds.some((entry, index) => entry !== currentRefIds[index])) {
    target.xmppRefIds = mergedRefIds;
    metaChanged = true;
  }
  if (stanzaId && (target.xmppStanzaId || "").toString() !== stanzaId) {
    target.xmppStanzaId = stanzaId;
    metaChanged = true;
  }
  const nextProcessingHints = normalizeXmppProcessingHints(processingHints);
  const currentProcessingHints = normalizeXmppProcessingHints(target.xmppProcessingHints);
  if (JSON.stringify(nextProcessingHints) !== JSON.stringify(currentProcessingHints)) {
    target.xmppProcessingHints = nextProcessingHints;
    metaChanged = true;
  }
  if (contentChanged) {
    target.editedAt = Number.isFinite(Date.parse(timestamp || "")) ? new Date(timestamp).toISOString() : new Date().toISOString();
    target.editedByUserId = editorUserId || target.userId || "";
    target.editedByName = editorName || displayNameForMessage(target) || "xmpp";
    target.editedByStaff = false;
  }
  return {
    handled: true,
    changed: contentChanged || metaChanged,
    contentChanged
  };
}

function applyXmppReactionsForActor(target, actorUserId, emojis = [], { processingHints = null } = {}) {
  const actorId = (actorUserId || "").toString().trim();
  if (!target || !actorId) return { handled: false, changed: false };
  const normalized = [...new Set(
    (Array.isArray(emojis) ? emojis : [])
      .map((emoji) => (emoji || "").toString().trim())
      .filter(Boolean)
  )].slice(0, 8);
  const before = normalizeReactions(target.reactions)
    .map((entry) => `${entry.emoji}|${entry.userIds.join(",")}`)
    .join("||");
  let next = normalizeReactions(target.reactions)
    .map((entry) => ({
      emoji: entry.emoji,
      userIds: entry.userIds.filter((id) => (id || "").toString() !== actorId)
    }))
    .filter((entry) => entry.userIds.length > 0);
  normalized.forEach((emoji) => {
    let row = next.find((entry) => entry.emoji === emoji);
    if (!row) {
      row = { emoji, userIds: [] };
      next.push(row);
    }
    if (!row.userIds.includes(actorId)) row.userIds.push(actorId);
  });
  target.reactions = next;
  const nextProcessingHints = normalizeXmppProcessingHints(processingHints);
  if (nextProcessingHints) target.xmppProcessingHints = nextProcessingHints;
  const after = normalizeReactions(target.reactions)
    .map((entry) => `${entry.emoji}|${entry.userIds.join(",")}`)
    .join("||");
  return {
    handled: true,
    changed: before !== after
  };
}

function applyXmppRetractionToMessageEntry(target, {
  timestamp = "",
  editorUserId = "",
  editorName = "",
  stanzaId = "",
  stanzaRefs = [],
  processingHints = null
} = {}) {
  if (!target) return { handled: false, changed: false, contentChanged: false };
  const retractedText = "[Message retracted]";
  let contentChanged = false;
  let metaChanged = false;
  const previousText = (target.text || "").toString();
  const previousAttachments = normalizeAttachments(target.attachments);
  const previousReactions = normalizeReactions(target.reactions);
  if (previousText !== retractedText || target.retracted !== true) {
    if (!Array.isArray(target.editHistory)) target.editHistory = [];
    target.editHistory.unshift({
      editedAt: Number.isFinite(Date.parse(timestamp || "")) ? new Date(timestamp).toISOString() : new Date().toISOString(),
      editorUserId: editorUserId || target.userId || "",
      editorName: editorName || displayNameForMessage(target) || "xmpp",
      previousText
    });
    if (target.editHistory.length > 25) target.editHistory = target.editHistory.slice(0, 25);
    target.text = retractedText;
    target.retracted = true;
    contentChanged = true;
  }
  if (previousAttachments.length > 0) {
    target.attachments = [];
    contentChanged = true;
  }
  if (previousReactions.length > 0) {
    target.reactions = [];
    contentChanged = true;
  }
  const mergedRefIds = normalizeXmppRefIdsList([
    ...normalizeXmppRefIdsList(target.xmppRefIds),
    ...normalizeXmppRefIdsList(stanzaRefs),
    stanzaId
  ]);
  const currentRefIds = normalizeXmppRefIdsList(target.xmppRefIds);
  if (mergedRefIds.length !== currentRefIds.length || mergedRefIds.some((entry, index) => entry !== currentRefIds[index])) {
    target.xmppRefIds = mergedRefIds;
    metaChanged = true;
  }
  if (stanzaId && (target.xmppStanzaId || "").toString() !== stanzaId) {
    target.xmppStanzaId = stanzaId;
    metaChanged = true;
  }
  const nextProcessingHints = normalizeXmppProcessingHints(processingHints);
  const currentProcessingHints = normalizeXmppProcessingHints(target.xmppProcessingHints);
  if (JSON.stringify(nextProcessingHints) !== JSON.stringify(currentProcessingHints)) {
    target.xmppProcessingHints = nextProcessingHints;
    metaChanged = true;
  }
  if (contentChanged) {
    target.editedAt = Number.isFinite(Date.parse(timestamp || "")) ? new Date(timestamp).toISOString() : new Date().toISOString();
    target.editedByUserId = editorUserId || target.userId || "";
    target.editedByName = editorName || displayNameForMessage(target) || "xmpp";
    target.editedByStaff = false;
  }
  return {
    handled: true,
    changed: contentChanged || metaChanged,
    contentChanged
  };
}

function trimXmppPendingReceiptMap(limit = 600) {
  if (typeof XEP_0184_0333_0359_DELIVERY_INDEXES_GLOBAL.trimXmppPendingReceiptMap !== "function") return;
  XEP_0184_0333_0359_DELIVERY_INDEXES_GLOBAL.trimXmppPendingReceiptMap(limit, {
    xmppPendingReceiptByStanzaId
  });
}

function rememberXmppPendingReceipt(stanzaId, thread, message, peerJid = "") {
  if (typeof XEP_0184_0333_0359_DELIVERY_INDEXES_GLOBAL.rememberXmppPendingReceipt !== "function") return;
  XEP_0184_0333_0359_DELIVERY_INDEXES_GLOBAL.rememberXmppPendingReceipt(stanzaId, thread, message, peerJid, {
    xmppPendingReceiptByStanzaId,
    xmppBareJidFn: xmppBareJid
  });
}

function resolveXmppOutboundDmMessageByReference(stanzaId, peerJid = "") {
  if (typeof XEP_0184_0333_0359_DELIVERY_INDEXES_GLOBAL.resolveXmppOutboundDmMessageByReference !== "function") {
    return { thread: null, message: null };
  }
  return XEP_0184_0333_0359_DELIVERY_INDEXES_GLOBAL.resolveXmppOutboundDmMessageByReference(stanzaId, peerJid, {
    xmppPendingReceiptByStanzaId,
    xmppBareJidFn: xmppBareJid,
    getCurrentAccountFn: getCurrentAccount,
    state,
    findMessageInChannelFn: findMessageInChannel,
    getAccountByIdFn: getAccountById,
    messageMatchesXmppReferenceFn: messageMatchesXmppReference
  });
}

function markXmppMessageDeliveredByReceipt(stanzaId, peerJid = "") {
  if (typeof XEP_0184_0333_0359_DELIVERY_INDEXES_GLOBAL.markXmppMessageDeliveredByReceipt !== "function") return false;
  return XEP_0184_0333_0359_DELIVERY_INDEXES_GLOBAL.markXmppMessageDeliveredByReceipt(stanzaId, peerJid, {
    xmppPendingReceiptByStanzaId,
    xmppBareJidFn: xmppBareJid,
    normalizeXmppRefIdsListFn: normalizeXmppRefIdsList,
    getCurrentAccountFn: getCurrentAccount,
    state,
    findMessageInChannelFn: findMessageInChannel,
    getAccountByIdFn: getAccountById,
    messageMatchesXmppReferenceFn: messageMatchesXmppReference
  });
}

function markXmppMessageReadByMarker(stanzaId, peerJid = "") {
  if (typeof XEP_0184_0333_0359_DELIVERY_INDEXES_GLOBAL.markXmppMessageReadByMarker !== "function") return false;
  return XEP_0184_0333_0359_DELIVERY_INDEXES_GLOBAL.markXmppMessageReadByMarker(stanzaId, peerJid, {
    xmppPendingReceiptByStanzaId,
    xmppBareJidFn: xmppBareJid,
    normalizeXmppRefIdsListFn: normalizeXmppRefIdsList,
    getCurrentAccountFn: getCurrentAccount,
    state,
    findMessageInChannelFn: findMessageInChannel,
    getAccountByIdFn: getAccountById,
    messageMatchesXmppReferenceFn: messageMatchesXmppReference
  });
}

function xmppNormalizeBobCid(value = "") {
  if (typeof XEP_0066_0071_0231_MEDIA_GLOBAL.xmppNormalizeBobCid !== "function") return "";
  return XEP_0066_0071_0231_MEDIA_GLOBAL.xmppNormalizeBobCid(value);
}

function xmppInlineBobEntries(stanza) {
  if (typeof XEP_0066_0071_0231_MEDIA_GLOBAL.xmppInlineBobEntries !== "function") return [];
  return XEP_0066_0071_0231_MEDIA_GLOBAL.xmppInlineBobEntries(stanza, {
    xmppElementsByLocalNameFn: xmppElementsByLocalName,
    xmppNodeHasXmlnsFn: xmppNodeHasXmlns,
    xmppNodeTextFn: xmppNodeText
  });
}

function xmppParseBobDataNode(node) {
  if (typeof XEP_0066_0071_0231_MEDIA_GLOBAL.xmppParseBobDataNode !== "function") return null;
  return XEP_0066_0071_0231_MEDIA_GLOBAL.xmppParseBobDataNode(node, {
    xmppNodeHasXmlnsFn: xmppNodeHasXmlns,
    xmppNodeTextFn: xmppNodeText
  });
}

function xmppExtractBobCidCandidates(stanza) {
  if (typeof XEP_0066_0071_0231_MEDIA_GLOBAL.xmppExtractBobCidCandidates !== "function") return [];
  return XEP_0066_0071_0231_MEDIA_GLOBAL.xmppExtractBobCidCandidates(stanza, {
    xmppElementsByLocalNameFn: xmppElementsByLocalName,
    xmppNodeHasXmlnsFn: xmppNodeHasXmlns,
    xmppNodeTextFn: xmppNodeText
  });
}

async function xmppFetchBobByCid(rawCid = "", { toCandidates = [], connection = xmppConnection } = {}) {
  const cidValue = (rawCid || "").toString().trim();
  const cidKey = xmppNormalizeBobCid(cidValue);
  if (!cidKey || !connection || !globalThis.$iq) return null;
  const cached = xmppBobCacheByCid.get(cidKey);
  if (cached?.url) return cached;
  if (xmppBobFetchInFlightByCid.has(cidKey)) {
    return xmppBobFetchInFlightByCid.get(cidKey);
  }
  const requestCidCandidates = [...new Set(
    [cidValue, cidKey]
      .map((entry) => (entry || "").toString().trim())
      .filter(Boolean)
  )];
  const toList = [...new Set(
    (Array.isArray(toCandidates) ? toCandidates : [])
      .map((entry) => (entry || "").toString().trim())
      .filter(Boolean)
  )];
  const requestTask = (async () => {
    for (const to of toList.length > 0 ? toList : [""]) {
      for (const requestCid of requestCidCandidates) {
        try {
          const stanza = await xmppSendIqPromise(
            connection,
            globalThis.$iq({ type: "get", ...(to ? { to } : {}) }).c("data", { xmlns: XMPP_BOB_NAMESPACE, cid: requestCid }),
            7000
          );
          const dataNode = xmppElementsByLocalName(stanza, "data")
            .find((node) => xmppNodeHasXmlns(node, XMPP_BOB_NAMESPACE)) || null;
          const parsed = xmppParseBobDataNode(dataNode);
          if (!parsed?.url) continue;
          xmppBobCacheByCid.set(parsed.cidKey, parsed);
          return parsed;
        } catch {
          // Try the next target/cid candidate.
        }
      }
    }
    return null;
  })().finally(() => {
    xmppBobFetchInFlightByCid.delete(cidKey);
  });
  xmppBobFetchInFlightByCid.set(cidKey, requestTask);
  return requestTask;
}

function xmppResolveDeferredBobForMessage({
  stanza,
  message = null,
  from = "",
  fallbackAttachmentText = false,
  onUpdated = null
} = {}) {
  if (!stanza || !message) return;
  const cidCandidates = xmppExtractBobCidCandidates(stanza);
  if (cidCandidates.length === 0) return;
  const existing = normalizeAttachments(Array.isArray(message.attachments) ? message.attachments : []);
  const prefersSticker = fallbackAttachmentText || xmppLooksLikeAttachmentFallbackText(message.text || "");
  const toCandidates = [
    (from || "").toString().trim(),
    xmppBareJid(from || "")
  ].filter(Boolean);
  void (async () => {
    const entries = [];
    for (const candidate of cidCandidates) {
      const resolved = await xmppFetchBobByCid(candidate.cid || candidate.cidKey, { toCandidates });
      if (!resolved?.url) continue;
      entries.push({
        url: resolved.url,
        name: candidate.name || (prefersSticker ? "sticker" : resolved.name || ""),
        mime: candidate.mime || resolved.mime || ""
      });
    }
    if (entries.length === 0) return;
    const resolvedAttachments = xmppAttachmentsFromOobEntries(entries);
    if (resolvedAttachments.length === 0) return;
    const nextAttachments = normalizeAttachments([...existing, ...resolvedAttachments]);
    if (nextAttachments.length === 0) return;
    const previousSerialized = JSON.stringify(existing);
    const nextSerialized = JSON.stringify(nextAttachments);
    let changed = false;
    if (previousSerialized !== nextSerialized) {
      message.attachments = nextAttachments;
      changed = true;
    }
    if (prefersSticker && xmppLooksLikeAttachmentFallbackText(message.text || "") && nextAttachments.length > 0) {
      message.text = "";
      changed = true;
    }
    if (!changed) return;
    saveState();
    if (typeof onUpdated === "function") onUpdated();
  })();
}

function xmppExtractOobAttachments(stanza) {
  if (typeof XEP_0066_0071_0231_MEDIA_GLOBAL.xmppExtractOobAttachments !== "function") return [];
  return XEP_0066_0071_0231_MEDIA_GLOBAL.xmppExtractOobAttachments(stanza, {
    xmppElementsByLocalNameFn: xmppElementsByLocalName,
    xmppNodeHasXmlnsFn: xmppNodeHasXmlns,
    xmppNodeTextFn: xmppNodeText,
    inferAttachmentTypeFromUrlFn: inferAttachmentTypeFromUrl,
    inferAttachmentTypeFromMimeFn: inferAttachmentTypeFromMime
  });
}

function xmppHasOobAttachmentHint(stanza) {
  if (typeof XEP_0066_0071_0231_MEDIA_GLOBAL.xmppHasOobAttachmentHint !== "function") return false;
  return XEP_0066_0071_0231_MEDIA_GLOBAL.xmppHasOobAttachmentHint(stanza, {
    xmppElementsByLocalNameFn: xmppElementsByLocalName,
    xmppNodeHasXmlnsFn: xmppNodeHasXmlns,
    xmppNodeTextFn: xmppNodeText
  });
}

function xmppExtractOobUrls(stanza) {
  if (typeof XEP_0066_0071_0231_MEDIA_GLOBAL.xmppExtractOobUrls !== "function") {
    return xmppExtractOobAttachments(stanza).map((entry) => entry.url);
  }
  return XEP_0066_0071_0231_MEDIA_GLOBAL.xmppExtractOobUrls(stanza, {
    xmppElementsByLocalNameFn: xmppElementsByLocalName,
    xmppNodeHasXmlnsFn: xmppNodeHasXmlns,
    xmppNodeTextFn: xmppNodeText,
    inferAttachmentTypeFromUrlFn: inferAttachmentTypeFromUrl,
    inferAttachmentTypeFromMimeFn: inferAttachmentTypeFromMime
  });
}

function xmppExtractLooseAttachmentEntries(stanza, { hintName = "", hintMime = "" } = {}) {
  if (typeof XEP_0066_0071_0231_MEDIA_GLOBAL.xmppExtractLooseAttachmentEntries !== "function") return [];
  return XEP_0066_0071_0231_MEDIA_GLOBAL.xmppExtractLooseAttachmentEntries(stanza, {
    hintName,
    hintMime
  }, {
    xmppSerializePayloadFn: xmppSerializePayload,
    inferAttachmentTypeFromUrlFn: inferAttachmentTypeFromUrl,
    inferAttachmentTypeFromMimeFn: inferAttachmentTypeFromMime
  });
}

function xmppAttachmentsFromOobEntries(entries) {
  if (typeof XEP_0066_0071_0231_MEDIA_GLOBAL.xmppAttachmentsFromOobEntries !== "function") return [];
  return XEP_0066_0071_0231_MEDIA_GLOBAL.xmppAttachmentsFromOobEntries(entries, {
    inferAttachmentTypeFromUrlFn: inferAttachmentTypeFromUrl,
    inferAttachmentTypeFromMimeFn: inferAttachmentTypeFromMime,
    inferAttachmentFormatFn: inferAttachmentFormat,
    normalizeAttachmentsFn: normalizeAttachments
  });
}

function xmppAttachmentsFromUrls(urls) {
  if (typeof XEP_0066_0071_0231_MEDIA_GLOBAL.xmppAttachmentsFromUrls !== "function") {
    const entries = Array.isArray(urls) ? urls.map((url) => ({ url })) : [];
    return xmppAttachmentsFromOobEntries(entries);
  }
  return XEP_0066_0071_0231_MEDIA_GLOBAL.xmppAttachmentsFromUrls(urls, {
    inferAttachmentTypeFromUrlFn: inferAttachmentTypeFromUrl,
    inferAttachmentTypeFromMimeFn: inferAttachmentTypeFromMime,
    inferAttachmentFormatFn: inferAttachmentFormat,
    normalizeAttachmentsFn: normalizeAttachments
  });
}

function xmppLooksLikeAttachmentFallbackText(text = "") {
  if (typeof XEP_0066_0071_0231_MEDIA_GLOBAL.xmppLooksLikeAttachmentFallbackText !== "function") return false;
  return XEP_0066_0071_0231_MEDIA_GLOBAL.xmppLooksLikeAttachmentFallbackText(text);
}

function xmppXhtmlNodeToInlineText(node) {
  if (typeof XEP_0066_0071_0231_MEDIA_GLOBAL.xmppXhtmlNodeToInlineText !== "function") return "";
  return XEP_0066_0071_0231_MEDIA_GLOBAL.xmppXhtmlNodeToInlineText(node, {
    xmppElementsByLocalNameFn: xmppElementsByLocalName
  });
}

function xmppPreferredBodyText(stanza) {
  if (typeof XEP_0066_0071_0231_MEDIA_GLOBAL.xmppPreferredBodyText !== "function") return "";
  return XEP_0066_0071_0231_MEDIA_GLOBAL.xmppPreferredBodyText(stanza, {
    xmppElementsByLocalNameFn: xmppElementsByLocalName,
    xmppNodeHasXmlnsFn: xmppNodeHasXmlns,
    xmppNodeTextFn: xmppNodeText
  });
}

function xmppRoomMessageIndex(roomJid) {
  if (typeof XEP_0184_0333_0359_DELIVERY_INDEXES_GLOBAL.xmppRoomMessageIndex !== "function") return null;
  return XEP_0184_0333_0359_DELIVERY_INDEXES_GLOBAL.xmppRoomMessageIndex(roomJid, {
    xmppBareJidFn: xmppBareJid,
    xmppRoomMessageIndexByJid
  });
}

function rememberXmppRoomMessage(roomJid, stanzaId, message) {
  if (typeof XEP_0184_0333_0359_DELIVERY_INDEXES_GLOBAL.rememberXmppRoomMessage !== "function") return;
  XEP_0184_0333_0359_DELIVERY_INDEXES_GLOBAL.rememberXmppRoomMessage(roomJid, stanzaId, message, {
    xmppBareJidFn: xmppBareJid,
    xmppRoomMessageIndexByJid,
    displayNameForMessageFn: displayNameForMessage
  });
}

function xmppDmMessageIndex(peerJid) {
  if (typeof XEP_0184_0333_0359_DELIVERY_INDEXES_GLOBAL.xmppDmMessageIndex !== "function") return null;
  return XEP_0184_0333_0359_DELIVERY_INDEXES_GLOBAL.xmppDmMessageIndex(peerJid, {
    xmppBareJidFn: xmppBareJid,
    xmppDmMessageIndexByPeerJid
  });
}

function rememberXmppDmMessage(peerJid, stanzaId, message) {
  if (typeof XEP_0184_0333_0359_DELIVERY_INDEXES_GLOBAL.rememberXmppDmMessage !== "function") return;
  XEP_0184_0333_0359_DELIVERY_INDEXES_GLOBAL.rememberXmppDmMessage(peerJid, stanzaId, message, {
    xmppBareJidFn: xmppBareJid,
    xmppDmMessageIndexByPeerJid,
    displayNameForMessageFn: displayNameForMessage
  });
}

function xmppStanzaReferenceIds(stanza) {
  if (typeof XEP_0308_0359_0424_0444_MESSAGE_UPDATES_GLOBAL.xmppStanzaReferenceIds !== "function") return [];
  return XEP_0308_0359_0424_0444_MESSAGE_UPDATES_GLOBAL.xmppStanzaReferenceIds(stanza);
}

function findXmppRoomMessageByStanzaId(roomJid, stanzaId) {
  const key = (stanzaId || "").toString().trim();
  if (!roomJid || !key) return null;
  const index = xmppRoomMessageIndex(roomJid);
  if (!index) return null;
  return index.get(key) || null;
}

function findXmppRoomMessageByAnyId(roomJid, messageRefId) {
  const key = (messageRefId || "").toString().trim();
  if (!roomJid || !key) return null;
  const mapped = findXmppRoomMessageByStanzaId(roomJid, key);
  if (mapped) return mapped;
  const channel = findXmppRoomChannelByJid(roomJid);
  if (!channel || !Array.isArray(channel.messages)) return null;
  const matched = channel.messages.find((entry) => (
    (entry?.id || "").toString() === key
    || (entry?.xmppStanzaId || "").toString() === key
    || (Array.isArray(entry?.xmppRefIds) && entry.xmppRefIds.some((ref) => (ref || "").toString() === key))
    || ((entry?.relayId || "").toString().endsWith(`::${key}`))
  )) || null;
  if (!matched) return null;
  return {
    messageId: matched.id || "",
    authorName: displayNameForMessage(matched),
    text: (matched.text || "").toString().slice(0, 180)
  };
}

function findXmppDmMessageByAnyId(peerJid, messageRefId) {
  const key = (messageRefId || "").toString().trim();
  const barePeer = xmppBareJid(peerJid);
  if (!barePeer || !key) return null;
  const index = xmppDmMessageIndex(barePeer);
  if (index && index.has(key)) {
    return index.get(key) || null;
  }
  const current = getCurrentAccount();
  if (!current) return null;
  const peer = getAccountByXmppJid(barePeer);
  if (!peer || peer.id === current.id) return null;
  const thread = state.dmThreads.find((entry) => (
    Array.isArray(entry?.participantIds)
    && entry.participantIds.includes(current.id)
    && entry.participantIds.includes(peer.id)
  )) || null;
  if (!thread || !Array.isArray(thread.messages)) return null;
  const matched = thread.messages.find((entry) => (
    (entry?.id || "").toString() === key
    || (entry?.xmppStanzaId || "").toString() === key
    || (Array.isArray(entry?.xmppRefIds) && entry.xmppRefIds.some((ref) => (ref || "").toString() === key))
    || ((entry?.relayId || "").toString().endsWith(`::${key}`))
  )) || null;
  if (!matched) return null;
  return {
    messageId: matched.id || "",
    authorName: displayNameForMessage(matched),
    text: (matched.text || "").toString().slice(0, 180)
  };
}

function findXmppDmThreadByPeerJid(peerJid) {
  const barePeer = xmppBareJid(peerJid);
  const current = getCurrentAccount();
  const peer = getAccountByXmppJid(barePeer);
  if (!barePeer || !current || !peer || peer.id === current.id) return null;
  return state.dmThreads.find((entry) => (
    Array.isArray(entry?.participantIds)
    && entry.participantIds.includes(current.id)
    && entry.participantIds.includes(peer.id)
  )) || null;
}

function applyXmppDmMessageCorrection(peerJid, targetRefId, payload = {}) {
  if (typeof XEP_0308_0359_0424_0444_MESSAGE_UPDATES_GLOBAL.applyXmppDmMessageCorrection !== "function") {
    return { handled: false, changed: false, contentChanged: false, thread: null };
  }
  return XEP_0308_0359_0424_0444_MESSAGE_UPDATES_GLOBAL.applyXmppDmMessageCorrection(peerJid, targetRefId, payload, {
    bareJidFn: xmppBareJid,
    findXmppDmThreadByPeerJidFn: findXmppDmThreadByPeerJid,
    findXmppDmMessageByAnyIdFn: findXmppDmMessageByAnyId,
    messageMatchesXmppReferenceFn: messageMatchesXmppReference,
    applyXmppCorrectionToMessageEntryFn: applyXmppCorrectionToMessageEntry,
    normalizeXmppRefIdsListFn: normalizeXmppRefIdsList,
    rememberXmppDmMessageFn: rememberXmppDmMessage
  });
}

function applyXmppRoomMessageCorrection(roomJid, targetRefId, payload = {}) {
  if (typeof XEP_0308_0359_0424_0444_MESSAGE_UPDATES_GLOBAL.applyXmppRoomMessageCorrection !== "function") {
    return { handled: false, changed: false, contentChanged: false, channel: null };
  }
  return XEP_0308_0359_0424_0444_MESSAGE_UPDATES_GLOBAL.applyXmppRoomMessageCorrection(roomJid, targetRefId, payload, {
    bareJidFn: xmppBareJid,
    xmppRoomByJid,
    findRelayTargetChannelByRoomFn: findRelayTargetChannelByRoom,
    findXmppRoomChannelByJidFn: findXmppRoomChannelByJid,
    findXmppRoomMessageByAnyIdFn: findXmppRoomMessageByAnyId,
    messageMatchesXmppReferenceFn: messageMatchesXmppReference,
    applyXmppCorrectionToMessageEntryFn: applyXmppCorrectionToMessageEntry,
    normalizeXmppRefIdsListFn: normalizeXmppRefIdsList,
    rememberXmppRoomMessageFn: rememberXmppRoomMessage
  });
}

function applyXmppDmReactionUpdate(peerJid, targetRefId, payload = {}) {
  if (typeof XEP_0308_0359_0424_0444_MESSAGE_UPDATES_GLOBAL.applyXmppDmReactionUpdate !== "function") {
    return { handled: false, changed: false, thread: null };
  }
  return XEP_0308_0359_0424_0444_MESSAGE_UPDATES_GLOBAL.applyXmppDmReactionUpdate(peerJid, targetRefId, payload, {
    bareJidFn: xmppBareJid,
    findXmppDmThreadByPeerJidFn: findXmppDmThreadByPeerJid,
    findXmppDmMessageByAnyIdFn: findXmppDmMessageByAnyId,
    messageMatchesXmppReferenceFn: messageMatchesXmppReference,
    applyXmppReactionsForActorFn: applyXmppReactionsForActor,
    normalizeXmppRefIdsListFn: normalizeXmppRefIdsList,
    rememberXmppDmMessageFn: rememberXmppDmMessage
  });
}

function applyXmppRoomReactionUpdate(roomJid, targetRefId, payload = {}) {
  if (typeof XEP_0308_0359_0424_0444_MESSAGE_UPDATES_GLOBAL.applyXmppRoomReactionUpdate !== "function") {
    return { handled: false, changed: false, channel: null };
  }
  return XEP_0308_0359_0424_0444_MESSAGE_UPDATES_GLOBAL.applyXmppRoomReactionUpdate(roomJid, targetRefId, payload, {
    bareJidFn: xmppBareJid,
    xmppRoomByJid,
    findRelayTargetChannelByRoomFn: findRelayTargetChannelByRoom,
    findXmppRoomChannelByJidFn: findXmppRoomChannelByJid,
    findXmppRoomMessageByAnyIdFn: findXmppRoomMessageByAnyId,
    messageMatchesXmppReferenceFn: messageMatchesXmppReference,
    canonicalXmppRoomReactionActorIdFn: canonicalXmppRoomReactionActorId,
    applyXmppReactionsForActorFn: applyXmppReactionsForActor,
    normalizeXmppRefIdsListFn: normalizeXmppRefIdsList,
    rememberXmppRoomMessageFn: rememberXmppRoomMessage
  });
}

function applyXmppDmMessageRetraction(peerJid, targetRefId, payload = {}) {
  if (typeof XEP_0308_0359_0424_0444_MESSAGE_UPDATES_GLOBAL.applyXmppDmMessageRetraction !== "function") {
    return { handled: false, changed: false, contentChanged: false, thread: null };
  }
  return XEP_0308_0359_0424_0444_MESSAGE_UPDATES_GLOBAL.applyXmppDmMessageRetraction(peerJid, targetRefId, payload, {
    bareJidFn: xmppBareJid,
    findXmppDmThreadByPeerJidFn: findXmppDmThreadByPeerJid,
    findXmppDmMessageByAnyIdFn: findXmppDmMessageByAnyId,
    messageMatchesXmppReferenceFn: messageMatchesXmppReference,
    applyXmppRetractionToMessageEntryFn: applyXmppRetractionToMessageEntry,
    normalizeXmppRefIdsListFn: normalizeXmppRefIdsList,
    rememberXmppDmMessageFn: rememberXmppDmMessage
  });
}

function applyXmppRoomMessageRetraction(roomJid, targetRefId, payload = {}) {
  if (typeof XEP_0308_0359_0424_0444_MESSAGE_UPDATES_GLOBAL.applyXmppRoomMessageRetraction !== "function") {
    return { handled: false, changed: false, contentChanged: false, channel: null };
  }
  return XEP_0308_0359_0424_0444_MESSAGE_UPDATES_GLOBAL.applyXmppRoomMessageRetraction(roomJid, targetRefId, payload, {
    bareJidFn: xmppBareJid,
    xmppRoomByJid,
    findRelayTargetChannelByRoomFn: findRelayTargetChannelByRoom,
    findXmppRoomChannelByJidFn: findXmppRoomChannelByJid,
    findXmppRoomMessageByAnyIdFn: findXmppRoomMessageByAnyId,
    messageMatchesXmppReferenceFn: messageMatchesXmppReference,
    applyXmppRetractionToMessageEntryFn: applyXmppRetractionToMessageEntry,
    normalizeXmppRefIdsListFn: normalizeXmppRefIdsList,
    rememberXmppRoomMessageFn: rememberXmppRoomMessage
  });
}

function applyXmppCorrectionFallback(targetRefId, payload = {}) {
  if (typeof XEP_0308_0359_0424_0444_MESSAGE_UPDATES_GLOBAL.applyXmppCorrectionFallback !== "function") {
    return { handled: false, changed: false, contentChanged: false, scope: "", thread: null, channel: null };
  }
  return XEP_0308_0359_0424_0444_MESSAGE_UPDATES_GLOBAL.applyXmppCorrectionFallback(targetRefId, payload, {
    dmThreads: state.dmThreads,
    guilds: state.guilds,
    messageMatchesXmppReferenceFn: messageMatchesXmppReference,
    applyXmppCorrectionToMessageEntryFn: applyXmppCorrectionToMessageEntry,
    getCurrentAccountFn: getCurrentAccount,
    getAccountByIdFn: getAccountById,
    bareJidFn: xmppBareJid,
    normalizeXmppRefIdsListFn: normalizeXmppRefIdsList,
    rememberXmppDmMessageFn: rememberXmppDmMessage,
    rememberXmppRoomMessageFn: rememberXmppRoomMessage
  });
}

function applyXmppReactionFallback(targetRefId, payload = {}) {
  if (typeof XEP_0308_0359_0424_0444_MESSAGE_UPDATES_GLOBAL.applyXmppReactionFallback !== "function") {
    return { handled: false, changed: false, scope: "", thread: null, channel: null };
  }
  return XEP_0308_0359_0424_0444_MESSAGE_UPDATES_GLOBAL.applyXmppReactionFallback(targetRefId, payload, {
    dmThreads: state.dmThreads,
    guilds: state.guilds,
    messageMatchesXmppReferenceFn: messageMatchesXmppReference,
    applyXmppReactionsForActorFn: applyXmppReactionsForActor,
    bareJidFn: xmppBareJid,
    canonicalXmppRoomReactionActorIdFn: canonicalXmppRoomReactionActorId
  });
}

function applyXmppRetractionFallback(targetRefId, payload = {}) {
  if (typeof XEP_0308_0359_0424_0444_MESSAGE_UPDATES_GLOBAL.applyXmppRetractionFallback !== "function") {
    return { handled: false, changed: false, contentChanged: false, scope: "", thread: null, channel: null };
  }
  return XEP_0308_0359_0424_0444_MESSAGE_UPDATES_GLOBAL.applyXmppRetractionFallback(targetRefId, payload, {
    dmThreads: state.dmThreads,
    guilds: state.guilds,
    messageMatchesXmppReferenceFn: messageMatchesXmppReference,
    applyXmppRetractionToMessageEntryFn: applyXmppRetractionToMessageEntry
  });
}

function hydrateXmppRepliesForRoom(roomToken, roomJid, stanzaId, referenced) {
  if (typeof XEP_0461_0428_REPLIES_GLOBAL.hydrateXmppRepliesForRoom !== "function") return false;
  return XEP_0461_0428_REPLIES_GLOBAL.hydrateXmppRepliesForRoom(roomToken, roomJid, stanzaId, referenced, {
    findRelayTargetChannelByRoomFn: findRelayTargetChannelByRoom,
    findXmppRoomChannelByJidFn: findXmppRoomChannelByJid,
    displayNameForMessageFn: displayNameForMessage
  });
}

function hydrateXmppRepliesForDm(peerJid, stanzaId, referenced) {
  if (typeof XEP_0461_0428_REPLIES_GLOBAL.hydrateXmppRepliesForDm !== "function") return false;
  return XEP_0461_0428_REPLIES_GLOBAL.hydrateXmppRepliesForDm(peerJid, stanzaId, referenced, {
    bareJidFn: xmppBareJid,
    getCurrentAccountFn: getCurrentAccount,
    getAccountByXmppJidFn: getAccountByXmppJid,
    dmThreads: state.dmThreads,
    displayNameForMessageFn: displayNameForMessage
  });
}

function xmppReplyMetaFromStanza(stanza, roomJid = "", peerJid = "") {
  if (typeof XEP_0461_0428_REPLIES_GLOBAL.xmppReplyMetaFromStanza !== "function") return null;
  return XEP_0461_0428_REPLIES_GLOBAL.xmppReplyMetaFromStanza(stanza, roomJid, peerJid, {
    xmppNodeHasXmlnsFn: xmppNodeHasXmlns,
    xmppNodeHasXmlnsPrefixFn: xmppNodeHasXmlnsPrefix,
    normalizeXmppJidFn: normalizeXmppJid,
    findXmppRoomMessageByAnyIdFn: findXmppRoomMessageByAnyId,
    findXmppDmMessageByAnyIdFn: findXmppDmMessageByAnyId,
    xmppNodeTextFn: xmppNodeText,
    decodeHtmlEntitiesFn: decodeHtmlEntities
  });
}

function xmppPresenceShowToPresence(node) {
  if (typeof XEP_0199_0410_0313_PRESENCE_PING_GLOBAL.xmppPresenceShowToPresence !== "function") return "online";
  return XEP_0199_0410_0313_PRESENCE_PING_GLOBAL.xmppPresenceShowToPresence(node, {
    xmppNodeTextFn: xmppNodeText
  });
}

function xmppHandleIncomingPingGet(stanza) {
  if (typeof XEP_0199_0410_0313_PRESENCE_PING_GLOBAL.xmppHandleIncomingPingGet !== "function") return null;
  return XEP_0199_0410_0313_PRESENCE_PING_GLOBAL.xmppHandleIncomingPingGet(stanza, {
    xmppNodeHasXmlnsFn: xmppNodeHasXmlns,
    xmppConnection,
    $iq: globalThis.$iq
  });
}

function maybeFetchXmppAvatarForJid(jid, { photoHash = "", clearAvatar = false } = {}) {
  const bare = xmppBareJid(jid);
  if (!bare || !xmppConnection || !globalThis.$iq) return;
  const account = ensureAccountByXmppJid(bare, bare.split("@")[0] || "");
  if (!account) return;
  if (clearAvatar) {
    account.avatarUrl = "";
    xmppAvatarMissingByJid.add(bare);
    xmppAvatarHashByJid.delete(bare);
    saveState();
    renderDmList();
    renderMemberList();
    renderMessages();
    return;
  }
  const currentHash = (xmppAvatarHashByJid.get(bare) || "").toString();
  const requestedHash = (photoHash || "").toString().trim();
  if (!requestedHash && account.avatarUrl) return;
  if (!requestedHash && currentHash && account.avatarUrl) return;
  if (!requestedHash && xmppAvatarMissingByJid.has(bare) && !currentHash) return;
  if (requestedHash && currentHash && requestedHash === currentHash && account.avatarUrl) return;
  if (xmppAvatarFetchInFlight.has(bare)) return;
  xmppAvatarFetchInFlight.add(bare);
  const applyAvatar = (bin, mime = "", hashMarker = "") => {
    const cleanBin = (bin || "").toString().trim().replace(/\s+/g, "");
    if (!cleanBin) return false;
    const sniffedMime = detectImageMimeFromBase64(cleanBin);
    const safeMime = /^image\/[a-z0-9.+-]+$/i.test((mime || "").toString())
      ? mime.toLowerCase()
      : (sniffedMime || "image/jpeg");
    account.avatarUrl = `data:${safeMime};base64,${cleanBin}`;
    xmppAvatarMissingByJid.delete(bare);
    if (hashMarker) xmppAvatarHashByJid.set(bare, hashMarker);
    saveState();
    renderDmList();
    renderMemberList();
    renderMessages();
    if (ui.selfMenuDialog?.open) renderSelfPopout();
    if (ui.userPopoutDialog?.open) {
      const selected = selectedUserPopoutId ? getAccountById(selectedUserPopoutId) : null;
      const fallbackName = ui.userPopoutName?.textContent || "Unknown";
      renderUserPopout(selected, fallbackName, {
        focusQuickDm: false,
        resetQuickDmInput: false,
        refreshPrivateFields: false
      });
    }
    return true;
  };
  const markMissingAvatar = () => {
    if (!account.avatarUrl && xmppAvatarMissingByJid.has(bare)) return;
    account.avatarUrl = "";
    xmppAvatarMissingByJid.add(bare);
    saveState();
    renderDmList();
    renderMemberList();
    renderMessages();
    if (ui.selfMenuDialog?.open) renderSelfPopout();
    if (ui.userPopoutDialog?.open) {
      const selected = selectedUserPopoutId ? getAccountById(selectedUserPopoutId) : null;
      const fallbackName = ui.userPopoutName?.textContent || "Unknown";
      renderUserPopout(selected, fallbackName, {
        focusQuickDm: false,
        resetQuickDmInput: false,
        refreshPrivateFields: false
      });
    }
  };
  const fetchVCardAvatar = () => {
    const iq = globalThis.$iq({ type: "get", to: bare }).c("vCard", { xmlns: "vcard-temp" });
    xmppConnection.sendIQ(
      iq,
      (stanza) => {
        try {
          const photoNode = [...stanza.getElementsByTagName("PHOTO")][0] || null;
          const binNode = photoNode ? [...photoNode.getElementsByTagName("BINVAL")][0] : null;
          const typeNode = photoNode ? [...photoNode.getElementsByTagName("TYPE")][0] : null;
          const bin = xmppNodeText(binNode).trim().replace(/\s+/g, "");
          const mime = xmppNodeText(typeNode).trim().toLowerCase();
          const applied = applyAvatar(bin, mime, requestedHash || currentHash || "vcard");
          if (applied) {
            if (!requestedHash && !currentHash) xmppAvatarHashByJid.set(bare, "vcard");
          } else {
            markMissingAvatar();
          }
        } catch {
          // Ignore malformed vCard payloads.
        } finally {
          xmppAvatarFetchInFlight.delete(bare);
        }
      },
      () => {
        xmppAvatarFetchInFlight.delete(bare);
      },
      7000
    );
  };
  const fetchPepAvatarDataById = (itemId, mimeHint = "", { fallback = null } = {}) => {
    const targetId = (itemId || "").toString().trim();
    if (!targetId) {
      if (typeof fallback === "function") fallback();
      return;
    }
    const pepIq = globalThis.$iq({ type: "get", to: bare })
      .c("pubsub", { xmlns: "http://jabber.org/protocol/pubsub" })
      .c("items", { node: "urn:xmpp:avatar:data" })
      .c("item", { id: targetId });
    xmppConnection.sendIQ(
      pepIq,
      (stanza) => {
        try {
          const dataNode = [...stanza.getElementsByTagName("data")]
            .find((node) => xmppNodeHasXmlns(node, "urn:xmpp:avatar:data")) || null;
          const bin = xmppNodeText(dataNode).trim().replace(/\s+/g, "");
          const ok = applyAvatar(bin, mimeHint, targetId);
          if (ok) {
            xmppAvatarFetchInFlight.delete(bare);
            return;
          }
        } catch {
          // Fall back to vCard below.
        }
        if (typeof fallback === "function") {
          fallback();
        } else {
          fetchVCardAvatar();
        }
      },
      () => {
        if (typeof fallback === "function") {
          fallback();
        } else {
          fetchVCardAvatar();
        }
      },
      7000
    );
  };
  const fetchPepAvatarFromMetadata = ({ fallback = null } = {}) => {
    const pepIq = globalThis.$iq({ type: "get", to: bare })
      .c("pubsub", { xmlns: "http://jabber.org/protocol/pubsub" })
      .c("items", { node: "urn:xmpp:avatar:metadata" });
    xmppConnection.sendIQ(
      pepIq,
      (stanza) => {
        try {
          const metadataNode = [...stanza.getElementsByTagName("metadata")]
            .find((node) => xmppNodeHasXmlns(node, "urn:xmpp:avatar:metadata")) || null;
          const infoNodes = metadataNode
            ? [...metadataNode.getElementsByTagName("info")]
            : [];
          const candidates = infoNodes
            .map((node) => ({
              id: (node?.getAttribute?.("id") || "").toString().trim(),
              type: (node?.getAttribute?.("type") || "").toString().trim().toLowerCase(),
              bytes: Number(node?.getAttribute?.("bytes") || 0)
            }))
            .filter((entry) => entry.id);
          const preferred = candidates.find((entry) => /^image\//i.test(entry.type))
            || candidates[0]
            || null;
          if (preferred?.id) {
            fetchPepAvatarDataById(preferred.id, preferred.type, { fallback });
            return;
          }
        } catch {
          // Fall through to fallback below.
        }
        if (typeof fallback === "function") {
          fallback();
        } else {
          fetchVCardAvatar();
        }
      },
      () => {
        if (typeof fallback === "function") {
          fallback();
        } else {
          fetchVCardAvatar();
        }
      },
      7000
    );
  };
  if (requestedHash) {
    fetchPepAvatarDataById(requestedHash, "", { fallback: fetchVCardAvatar });
    return;
  }
  fetchPepAvatarFromMetadata({ fallback: fetchVCardAvatar });
}

function xmppMucOccupantByNick(roomJid, nick = "") {
  if (typeof XEP_0421_0045_MUC_ACTOR_CACHE_GLOBAL.xmppMucOccupantByNick !== "function") return null;
  return XEP_0421_0045_MUC_ACTOR_CACHE_GLOBAL.xmppMucOccupantByNick(roomJid, nick, {
    xmppBareJidFn: xmppBareJid,
    xmppOccupantsByRoomJid
  });
}

function xmppMucOccupantById(roomJid, occupantId = "") {
  if (typeof XEP_0421_0045_MUC_ACTOR_CACHE_GLOBAL.xmppMucOccupantById !== "function") return null;
  return XEP_0421_0045_MUC_ACTOR_CACHE_GLOBAL.xmppMucOccupantById(roomJid, occupantId, {
    xmppBareJidFn: xmppBareJid,
    xmppOccupantsByRoomJid
  });
}

function xmppMucOccupantAvatarKey(roomJid, nick = "") {
  if (typeof XEP_0421_0045_MUC_ACTOR_CACHE_GLOBAL.xmppMucOccupantAvatarKey !== "function") return "";
  return XEP_0421_0045_MUC_ACTOR_CACHE_GLOBAL.xmppMucOccupantAvatarKey(roomJid, nick, {
    xmppBareJidFn: xmppBareJid
  });
}

function xmppKnownMucOccupantKey(roomJid, nick = "") {
  if (typeof XEP_0421_0045_MUC_ACTOR_CACHE_GLOBAL.xmppKnownMucOccupantKey !== "function") {
    return xmppMucOccupantAvatarKey(roomJid, nick);
  }
  return XEP_0421_0045_MUC_ACTOR_CACHE_GLOBAL.xmppKnownMucOccupantKey(roomJid, nick, {
    xmppBareJidFn: xmppBareJid
  });
}

function rememberKnownXmppMucOccupantJid(roomJid, nick = "", jid = "") {
  if (typeof XEP_0421_0045_MUC_ACTOR_CACHE_GLOBAL.rememberKnownXmppMucOccupantJid !== "function") return false;
  return XEP_0421_0045_MUC_ACTOR_CACHE_GLOBAL.rememberKnownXmppMucOccupantJid(roomJid, nick, jid, {
    xmppBareJidFn: xmppBareJid,
    xmppKnownMucOccupantJidByKey
  });
}

function knownXmppMucOccupantJid(roomJid, nick = "") {
  if (typeof XEP_0421_0045_MUC_ACTOR_CACHE_GLOBAL.knownXmppMucOccupantJid !== "function") return "";
  return XEP_0421_0045_MUC_ACTOR_CACHE_GLOBAL.knownXmppMucOccupantJid(roomJid, nick, {
    xmppBareJidFn: xmppBareJid,
    xmppKnownMucOccupantJidByKey
  });
}

function inferXmppAuthorJidFromRoomHistory(roomJid, nick = "") {
  if (typeof XEP_0421_0045_MUC_ACTOR_CACHE_GLOBAL.inferXmppAuthorJidFromRoomHistory !== "function") return "";
  return XEP_0421_0045_MUC_ACTOR_CACHE_GLOBAL.inferXmppAuthorJidFromRoomHistory(roomJid, nick, {
    xmppBareJidFn: xmppBareJid,
    xmppKnownMucOccupantJidByKey,
    findXmppRoomChannelByJidFn: findXmppRoomChannelByJid,
    getAccountByIdFn: getAccountById
  });
}

function resolveXmppRoomActorUserId(roomJid, nick = "", stanza = null, occupantIdHint = "") {
  if (typeof XEP_0421_0045_MUC_ACTOR_CACHE_GLOBAL.resolveXmppRoomActorUserId !== "function") return "";
  return XEP_0421_0045_MUC_ACTOR_CACHE_GLOBAL.resolveXmppRoomActorUserId(roomJid, nick, stanza, occupantIdHint, {
    xmppBareJidFn: xmppBareJid,
    xmppOccupantIdFromStanzaFn: xmppOccupantIdFromStanza,
    getCurrentAccountFn: getCurrentAccount,
    xmppMucJoinStateByRoomJid,
    xmppOccupantsByRoomJid,
    xmppMucMessageAuthorJidFn: xmppMucMessageAuthorJid,
    getAccountByIdFn: getAccountById,
    xmppKnownMucOccupantJidByKey,
    findXmppRoomChannelByJidFn: findXmppRoomChannelByJid,
    ensureAccountByXmppJidFn: ensureAccountByXmppJid
  });
}

function canonicalXmppRoomReactionActorId(roomJid, actorUserId = "") {
  const fallbackActorId = (actorUserId || "").toString().trim();
  if (typeof XEP_0421_0045_MUC_ACTOR_CACHE_GLOBAL.canonicalXmppRoomReactionActorId !== "function") return fallbackActorId;
  return XEP_0421_0045_MUC_ACTOR_CACHE_GLOBAL.canonicalXmppRoomReactionActorId(roomJid, actorUserId, {
    parseXmppRoomAliasActorIdFn: parseXmppRoomAliasActorId,
    xmppBareJidFn: xmppBareJid,
    xmppOccupantIdFromStanzaFn: xmppOccupantIdFromStanza,
    getCurrentAccountFn: getCurrentAccount,
    xmppMucJoinStateByRoomJid,
    xmppOccupantsByRoomJid,
    xmppMucMessageAuthorJidFn: xmppMucMessageAuthorJid,
    getAccountByIdFn: getAccountById,
    xmppKnownMucOccupantJidByKey,
    findXmppRoomChannelByJidFn: findXmppRoomChannelByJid,
    ensureAccountByXmppJidFn: ensureAccountByXmppJid
  });
}

function xmppAvatarUrlForKnownRoomNick(roomJid, nick = "", guildId = null) {
  if (typeof XEP_0421_0045_MUC_ACTOR_CACHE_GLOBAL.xmppAvatarUrlForKnownRoomNick !== "function") return "";
  return XEP_0421_0045_MUC_ACTOR_CACHE_GLOBAL.xmppAvatarUrlForKnownRoomNick(roomJid, nick, guildId, {
    xmppBareJidFn: xmppBareJid,
    xmppKnownMucOccupantJidByKey,
    findXmppRoomChannelByJidFn: findXmppRoomChannelByJid,
    getAccountByIdFn: getAccountById,
    getAccountByXmppJidFn: getAccountByXmppJid,
    resolveAccountAvatarFn: resolveAccountAvatar,
    isRenderableAvatarUrlFn: isRenderableAvatarUrl,
    maybeFetchXmppAvatarForJidFn: maybeFetchXmppAvatarForJid
  });
}

function xmppMucAvatarUrlForOccupant(roomJid, nick = "") {
  const key = xmppMucOccupantAvatarKey(roomJid, nick);
  if (!key) return "";
  return (xmppMucAvatarByOccupantKey.get(key) || "").toString();
}

function maybeFetchXmppMucAvatar(roomJid, nick, fullOccupantJid = "") {
  const key = xmppMucOccupantAvatarKey(roomJid, nick);
  const toJid = normalizeXmppJid(fullOccupantJid || "");
  if (!key || !toJid || !xmppConnection || !globalThis.$iq) return;
  if (xmppMucAvatarByOccupantKey.has(key)) return;
  if (xmppMucAvatarFetchInFlight.has(key)) return;
  xmppMucAvatarFetchInFlight.add(key);
  const iq = globalThis.$iq({ type: "get", to: toJid }).c("vCard", { xmlns: "vcard-temp" });
  xmppConnection.sendIQ(
    iq,
    (stanza) => {
      try {
        const photoNode = [...stanza.getElementsByTagName("PHOTO")][0] || null;
        const binNode = photoNode ? [...photoNode.getElementsByTagName("BINVAL")][0] : null;
        const typeNode = photoNode ? [...photoNode.getElementsByTagName("TYPE")][0] : null;
        const bin = xmppNodeText(binNode).trim().replace(/\s+/g, "");
        const mimeRaw = xmppNodeText(typeNode).trim().toLowerCase();
        if (!bin) return;
        const sniffed = detectImageMimeFromBase64(bin);
        const safeMime = /^image\/[a-z0-9.+-]+$/i.test(mimeRaw) ? mimeRaw : (sniffed || "image/jpeg");
        xmppMucAvatarByOccupantKey.set(key, `data:${safeMime};base64,${bin}`);
        const activeRoom = xmppBareJid(getActiveChannel()?.xmppRoomJid || "");
        if (activeRoom && activeRoom === xmppBareJid(roomJid)) {
          renderMemberList();
          renderMessages();
        }
      } finally {
        xmppMucAvatarFetchInFlight.delete(key);
      }
    },
    () => {
      xmppMucAvatarFetchInFlight.delete(key);
    },
    7000
  );
}

function upsertXmppContactRequest(kind, jid, { name = "", source = "" } = {}) {
  const bare = xmppBareJid(jid);
  if (!bare) return false;
  const account = ensureAccountByXmppJid(bare, name || bare.split("@")[0] || "");
  const map = kind === "outgoing" ? xmppOutgoingContactRequestsByJid : xmppIncomingContactRequestsByJid;
  map.set(bare, {
    jid: bare,
    accountId: account?.id || "",
    name: (name || account?.displayName || bare.split("@")[0] || "").toString().slice(0, 60),
    source: (source || "").toString().slice(0, 32),
    ts: new Date().toISOString()
  });
  return true;
}

function clearXmppContactRequest(kind, jid) {
  const bare = xmppBareJid(jid);
  if (!bare) return false;
  const map = kind === "outgoing" ? xmppOutgoingContactRequestsByJid : xmppIncomingContactRequestsByJid;
  return map.delete(bare);
}

function listXmppContactRequests(kind = "incoming") {
  const map = kind === "outgoing" ? xmppOutgoingContactRequestsByJid : xmppIncomingContactRequestsByJid;
  return [...map.values()].sort((a, b) => {
    const aTs = toTimestampMs(a?.ts);
    const bTs = toTimestampMs(b?.ts);
    return bTs - aTs;
  });
}

function acceptXmppContactRequest(jid) {
  const bare = xmppBareJid(jid);
  if (!bare || !xmppConnection || relayStatus !== "connected" || !globalThis.$pres) return false;
  xmppConnection.send(globalThis.$pres({ to: bare, type: "subscribed" }));
  xmppConnection.send(globalThis.$pres({ to: bare, type: "subscribe" }));
  clearXmppContactRequest("incoming", bare);
  upsertXmppContactRequest("outgoing", bare, { source: "accept" });
  return true;
}

function declineXmppContactRequest(jid) {
  const bare = xmppBareJid(jid);
  if (!bare || !xmppConnection || relayStatus !== "connected" || !globalThis.$pres) return false;
  xmppConnection.send(globalThis.$pres({ to: bare, type: "unsubscribed" }));
  clearXmppContactRequest("incoming", bare);
  return true;
}

function cancelXmppOutgoingContactRequest(jid) {
  const bare = xmppBareJid(jid);
  if (!bare || !xmppConnection || relayStatus !== "connected" || !globalThis.$pres) return false;
  xmppConnection.send(globalThis.$pres({ to: bare, type: "unsubscribe" }));
  clearXmppContactRequest("outgoing", bare);
  return true;
}

function findXmppRoomChannelByJid(roomJid) {
  return findXmppRoomChannelByJidViaXep(roomJid);
}

function isKnownXmppRoomJid(roomJid, prefs = getPreferences()) {
  return isKnownXmppRoomJidViaXep(roomJid, prefs);
}

function xmppStanzaErrorDetails(stanza) {
  return xmppStanzaErrorDetailsViaXep(stanza);
}

function xmppMucJoinErrorHint(condition) {
  return xmppMucJoinErrorHintViaXep(condition);
}

function reportXmppMucJoinError(roomJid, nick, stanza) {
  const bareRoom = xmppBareJid(roomJid);
  if (!bareRoom) return;
  const details = xmppStanzaErrorDetails(stanza) || { condition: "", text: "", type: "", by: "" };
  const condition = details.condition || "unknown-error";
  const joinHint = xmppMucJoinErrorHint(condition);
  const token = xmppRoomByJid.get(bareRoom) || `xmpp:${bareRoom}`;
  const channel = findXmppRoomChannelByJid(bareRoom);
  const mappedChannel = channel || findRelayTargetChannelByRoom(token);
  if (mappedChannel) {
    const reasonText = [condition, details.text].filter(Boolean).join(" · ");
    addSystemMessage(
      mappedChannel,
      `XMPP room join failed (${reasonText || "unknown error"}).${joinHint ? ` ${joinHint}` : ""}`
    );
  }
  const toastMessage = `Could not join ${bareRoom}: ${condition}${details.text ? ` — ${details.text}` : ""}`;
  showToast(toastMessage, { tone: "error" });
  addXmppDebugEvent("presence", "MUC join failed", {
    roomJid: bareRoom,
    nick: nick || "",
    condition,
    text: details.text || "",
    errorType: details.type || "",
    by: details.by || "",
    hint: joinHint
  });
  xmppRoomByJid.delete(bareRoom);
  clearXmppMucSelfPing(bareRoom);
  const joinState = xmppMucJoinStateByRoomJid.get(bareRoom) || {};
  xmppMucJoinStateByRoomJid.set(bareRoom, {
    ...joinState,
    nick: nick || joinState.nick || "",
    roomToken: joinState.roomToken || token,
    pending: false,
    lastErrorAt: new Date().toISOString(),
    lastErrorCondition: condition,
    lastErrorText: details.text || ""
  });
  renderChannels();
  if (mappedChannel && state.activeChannelId === mappedChannel.id) renderMessages();
}

function xmppOmemoStoreForAccount(jid) {
  return xmppOmemoStoreRegistry.getStoreForAccount(jid, {
    toBareJid: (value) => xmppBareJid(value || ""),
    StoreCtor: XmppOmemoStore
  });
}

function xmppOmemoEnabledForPeer(peerBare, prefs = getPreferences()) {
  return xmppOmemoEnabledForPeerFromPrefs(peerBare, prefs, normalizeToggle);
}

function xmppOmemoSetPeerEnabled(peerBare, enabled, prefs = getPreferences()) {
  if (!peerBare) return;
  state.preferences = xmppOmemoApplyPeerEnabled(prefs, peerBare, enabled, normalizeToggle);
  saveState();
}

function xmppOmemoNamespaceCandidatesForPeer(peerJid = "", {
  includeLegacy = true
} = {}) {
  const bare = xmppBareJid(peerJid);
  const cachedPreferred = bare ? (xmppOmemoPreferredNamespaceByJid.get(bare) || "") : "";
  const discoFeatures = bare ? xmppCachedCallFeaturesForPeer(bare) : new Set();
  return xmppOmemoBuildNamespaceCandidates({
    cachedPreferred,
    discoFeatures,
    includeLegacy
  });
}

function xmppPreferredOmemoNamespaceForPeer(peerJid = "") {
  return xmppOmemoNamespaceCandidatesForPeer(peerJid)[0] || XMPP_OMEMO_NAMESPACE;
}

async function xmppOmemoEnsureLocalIdentity(ownBare) {
  await ensureXmppOmemoRuntime();
  return xmppOmemoEnsureLocalIdentityCore(ownBare, {
    runtimeAvailableFn: xmppOmemoRuntimeAvailable,
    storeForAccountFn: xmppOmemoStoreForAccount
  });
}

async function xmppOmemoFetchDeviceList(jid, { connection = xmppConnection } = {}) {
  return xmppOmemoFetchDeviceListCore(jid, {
    toBareJid: (value) => xmppBareJid(value || ""),
    connection,
    namespaceCandidatesFn: xmppOmemoNamespaceCandidatesForPeer,
    namespaceNodeSetFn: xmppOmemoNamespaceNodeSet,
    sendIqPromiseFn: xmppSendIqPromise,
    nodeHasAnyXmlnsFn: xmppNodeHasAnyXmlns,
    preferredNamespaceByJid: xmppOmemoPreferredNamespaceByJid,
    deviceListByJid: xmppOmemoDeviceListByJid,
    omemoNamespaces: XMPP_OMEMO_NAMESPACES,
    debugEventFn: addXmppDebugEvent
  });
}

async function xmppOmemoPublishDeviceList(ownBare, deviceIds, {
  connection = xmppConnection,
  namespaces = XMPP_OMEMO_NAMESPACES
} = {}) {
  return xmppOmemoPublishDeviceListCore(ownBare, deviceIds, {
    connection,
    namespaces,
    namespaceNodeSetFn: xmppOmemoNamespaceNodeSet,
    sendIqPromiseFn: xmppSendIqPromise,
    preferredNamespaceByJid: xmppOmemoPreferredNamespaceByJid,
    deviceListByJid: xmppOmemoDeviceListByJid,
    debugEventFn: addXmppDebugEvent
  });
}

async function xmppOmemoPublishBundle(ownBare, bundle, {
  connection = xmppConnection,
  namespaces = XMPP_OMEMO_NAMESPACES
} = {}) {
  return xmppOmemoPublishBundleCore(ownBare, bundle, {
    connection,
    namespaces,
    namespaceNodeSetFn: xmppOmemoNamespaceNodeSet,
    sendIqPromiseFn: xmppSendIqPromise,
    preferredNamespaceByJid: xmppOmemoPreferredNamespaceByJid,
    signedPreKeyId: XMPP_OMEMO_SIGNED_PREKEY_ID,
    debugEventFn: addXmppDebugEvent
  });
}

function xmppOmemoNamespaceForSend(targetJids = []) {
  const targets = Array.isArray(targetJids) ? targetJids : [targetJids];
  const preferredNamespaces = targets
    .map((jid) => xmppPreferredOmemoNamespaceForPeer(jid))
    .filter(Boolean);
  return xmppOmemoSelectNamespaceForSend(preferredNamespaces);
}

async function xmppOmemoEnsureOwnBundle(ownBare, { force = false } = {}) {
  await ensureXmppOmemoRuntime();
  return xmppOmemoEnsureOwnBundleCore(ownBare, {
    force,
    ensureLocalIdentityFn: xmppOmemoEnsureLocalIdentity,
    fetchDeviceListFn: xmppOmemoFetchDeviceList,
    publishDeviceListFn: xmppOmemoPublishDeviceList,
    publishBundleFn: xmppOmemoPublishBundle,
    deviceListByJid: xmppOmemoDeviceListByJid,
    preKeyCount: XMPP_OMEMO_PREKEY_COUNT,
    signedPreKeyId: XMPP_OMEMO_SIGNED_PREKEY_ID,
    arrayBufferToBase64
  });
}

async function xmppOmemoFetchBundle(jid, deviceId, { connection = xmppConnection } = {}) {
  return xmppOmemoFetchBundleCore(jid, deviceId, {
    toBareJid: (value) => xmppBareJid(value || ""),
    connection,
    bundleCache: xmppOmemoBundleByJidDevice,
    namespaceCandidatesFn: xmppOmemoNamespaceCandidatesForPeer,
    namespaceNodeSetFn: xmppOmemoNamespaceNodeSet,
    sendIqPromiseFn: xmppSendIqPromise,
    nodeHasAnyXmlnsFn: xmppNodeHasAnyXmlns,
    nodeTextFn: xmppNodeText,
    omemoNamespaces: XMPP_OMEMO_NAMESPACES,
    preferredNamespaceByJid: xmppOmemoPreferredNamespaceByJid,
    signedPreKeyId: XMPP_OMEMO_SIGNED_PREKEY_ID,
    debugEventFn: addXmppDebugEvent
  });
}

async function xmppOmemoEnsureSession(peerBare, deviceId, ownBare) {
  await ensureXmppOmemoRuntime();
  return xmppOmemoEnsureSessionCore(peerBare, deviceId, ownBare, {
    runtimeAvailableFn: xmppOmemoRuntimeAvailable,
    storeForAccountFn: xmppOmemoStoreForAccount,
    fetchBundleFn: xmppOmemoFetchBundle,
    sessionSetupInFlight: xmppOmemoSessionSetupInFlight,
    base64ToArrayBuffer,
    signedPreKeyId: XMPP_OMEMO_SIGNED_PREKEY_ID
  });
}

async function xmppOmemoEnsurePeerSessions(peerBare, ownBare) {
  return xmppOmemoEnsurePeerSessionsCore(peerBare, ownBare, {
    deviceListByJid: xmppOmemoDeviceListByJid,
    fetchDeviceListFn: xmppOmemoFetchDeviceList,
    ensureSessionFn: xmppOmemoEnsureSession
  });
}

async function xmppOmemoEncryptMessage(peerBare, plaintext, ownBare) {
  return xmppOmemoEncryptMessageForPeers([peerBare], plaintext, ownBare);
}

async function xmppOmemoGatherDeviceTargets(peers = [], ownBare = "") {
  return xmppOmemoGatherDeviceTargetsCore(peers, ownBare, {
    toBareJid: (value) => xmppBareJid(value || ""),
    fetchDeviceListFn: xmppOmemoFetchDeviceList,
    storeForAccountFn: xmppOmemoStoreForAccount
  });
}

async function xmppOmemoEncryptMessageForPeers(peers, plaintext, ownBare) {
  await ensureXmppOmemoRuntime();
  if (!xmppOmemoRuntimeAvailable()) return null;
  const store = await xmppOmemoEnsureLocalIdentity(ownBare);
  if (!store) return null;
  const senderDeviceId = await store.getLocalRegistrationId();
  if (!senderDeviceId) return null;
  const encodeMessageKeyPayload = (value) => {
    if (!value) return "";
    if (typeof value === "string") return btoa(value);
    if (ArrayBuffer.isView(value)) {
      const view = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
      return arrayBufferToBase64(view.buffer.slice(view.byteOffset, view.byteOffset + view.byteLength));
    }
    if (value instanceof ArrayBuffer) return arrayBufferToBase64(value);
    return "";
  };
  let targets = [];
  try {
    targets = await xmppOmemoGatherDeviceTargets([...peers, ownBare], ownBare);
  } catch (error) {
    addXmppDebugEvent("error", "OMEMO device collision", { error: String(error?.message || error) });
    return null;
  }
  if (targets.length === 0) return null;
  const contentPayload = await xmppOmemoEncryptPlaintextContentCore(plaintext, {
    arrayBufferToBase64,
    concatArrayBuffers
  });
  if (!contentPayload) return null;
  const messageKeys = {};
  let successCount = 0;
  for (const target of targets) {
    const jid = xmppBareJid(target?.jid || "");
    const deviceId = Number(target?.deviceId || 0);
    if (!jid || !Number.isFinite(deviceId) || deviceId <= 0) continue;
    const address = new globalThis.libsignal.SignalProtocolAddress(jid, deviceId);
    await xmppOmemoEnsureSession(jid, deviceId, ownBare);
    let sessionCipher = new globalThis.libsignal.SessionCipher(store, address);
    try {
      // eslint-disable-next-line no-await-in-loop
      const payload = await sessionCipher.encrypt(contentPayload.keyAndTag);
      const payloadBase64 = encodeMessageKeyPayload(payload?.body);
      if (!payloadBase64) throw new Error("Missing OMEMO key payload");
      messageKeys[String(deviceId)] = {
        payload: payloadBase64,
        prekey: Number(payload.type) === 3
      };
      successCount += 1;
    } catch (error) {
      addXmppDebugEvent("error", "OMEMO encryption failed for device", {
        peer: jid,
        device: String(deviceId),
        error: String(error?.message || error)
      });
      const sessionId = `${jid}.${deviceId}`;
      const canResetSession = typeof store.removeSession === "function";
      if (!canResetSession) continue;
      try {
        // eslint-disable-next-line no-await-in-loop
        await store.removeSession(sessionId);
      } catch {
        // continue with forced re-prime path below
      }
      // eslint-disable-next-line no-await-in-loop
      await xmppOmemoEnsureSession(jid, deviceId, ownBare);
      sessionCipher = new globalThis.libsignal.SessionCipher(store, address);
      try {
        // eslint-disable-next-line no-await-in-loop
        const retryPayload = await sessionCipher.encrypt(contentPayload.keyAndTag);
        const payloadBase64 = encodeMessageKeyPayload(retryPayload?.body);
        if (!payloadBase64) throw new Error("Missing OMEMO key payload");
        messageKeys[String(deviceId)] = {
          payload: payloadBase64,
          prekey: Number(retryPayload.type) === 3
        };
        successCount += 1;
        addXmppDebugEvent("runtime", "OMEMO encryption recovered after session reset", {
          peer: jid,
          device: String(deviceId)
        });
      } catch (retryError) {
        addXmppDebugEvent("error", "OMEMO encryption retry failed", {
          peer: jid,
          device: String(deviceId),
          error: String(retryError?.message || retryError)
        });
      }
    }
  }
  if (successCount === 0) return null;
  return {
    sid: String(senderDeviceId),
    keys: messageKeys,
    iv: contentPayload.ivBase64,
    payload: contentPayload.payloadBase64
  };
}

async function xmppOmemoDecryptPayload(peerBare, payload, ownBare) {
  await ensureXmppOmemoRuntime();
  if (!xmppOmemoRuntimeAvailable()) return null;
  if (!payload || !payload.keys) return null;
  const store = await xmppOmemoEnsureLocalIdentity(ownBare);
  if (!store) return null;
  const deviceId = await store.getLocalRegistrationId();
  if (!deviceId) return null;
  const keyEntry = payload.keys[String(deviceId)];
  if (!keyEntry || !keyEntry.payload) return null;
  const senderDevice = payload.sid;
  if (!senderDevice) return null;
  if (!keyEntry.prekey) {
    await xmppOmemoEnsureSession(peerBare, senderDevice, ownBare);
  }
  const address = new globalThis.libsignal.SignalProtocolAddress(peerBare, Number(senderDevice || 0));
  const sessionCipher = new globalThis.libsignal.SessionCipher(store, address);
  const cipherBytes = base64ToArrayBuffer(keyEntry.payload);
  const keyAndTag = keyEntry.prekey
    ? await sessionCipher.decryptPreKeyWhisperMessage(cipherBytes, "binary")
    : await sessionCipher.decryptWhisperMessage(cipherBytes, "binary");
  return xmppOmemoDecryptContentFromKeyAndPayloadCore(keyAndTag, payload, {
    base64ToArrayBuffer,
    concatArrayBuffers
  });
}

function xmppOmemoTryDecryptIntoMessage({
  stanza,
  message,
  peerBare,
  ownBare,
  onUpdated
}) {
  xmppOmemoTryDecryptIntoMessageCore({
    stanza,
    message,
    peerBare,
    ownBare,
    onUpdated,
    runtimeAvailableFn: xmppOmemoRuntimeAvailable,
    parseEncryptedPayloadFn: xmppOmemoParseEncryptedPayload,
    decryptPayloadFn: xmppOmemoDecryptPayload,
    extractAesgcmUrlsFn: extractAesgcmUrls,
    stripAesgcmUrlsFn: stripAesgcmUrls,
    normalizeAttachmentsFn: normalizeAttachments,
    saveStateFn: saveState,
    debugEventFn: addXmppDebugEvent,
    inFlightByMessageId: xmppOmemoDecryptInFlightByMessageId,
    resolveMessageIdFn: ({ stanza: inputStanza, message: inputMessage, peerBare: inputPeer }) => {
      return `${inputPeer}|${inputMessage.id || xmppStanzaStableId(inputStanza) || createId().slice(0, 8)}`;
    }
  });
}

function resolveOmemoHeaderState(conversation, account = getCurrentAccount()) {
  if (!conversation || conversation.type !== "dm" || !account) return { visible: false };
  const peerJid = xmppPeerJidForDmThread(conversation.thread, account);
  const peerBare = xmppBareJid(peerJid || "");
  if (!peerBare) return { visible: false };
  const prefs = getPreferences();
  const enabled = xmppOmemoEnabledForPeer(peerBare, prefs);
  const runtimeReady = xmppOmemoRuntimeAvailable();
  const connected = prefs.relayMode === "xmpp" && relayStatus === "connected";
  return {
    visible: true,
    peerBare,
    enabled,
    runtimeReady,
    connected
  };
}

function updateOmemoHeaderControl(conversation = getActiveConversation(), account = getCurrentAccount()) {
  if (!ui.omemoHeaderBtn) return;
  const state = resolveOmemoHeaderState(conversation, account);
  if (!state.visible) {
    ui.omemoHeaderBtn.hidden = true;
    ui.omemoHeaderBtn.setAttribute("aria-hidden", "true");
    return;
  }
  ui.omemoHeaderBtn.hidden = false;
  ui.omemoHeaderBtn.setAttribute("aria-hidden", "false");
  ui.omemoHeaderBtn.textContent = state.enabled ? "🔒" : "🔓";
  ui.omemoHeaderBtn.setAttribute("aria-pressed", state.enabled ? "true" : "false");
  const detail = !state.runtimeReady
    ? "OMEMO runtime unavailable"
    : (!state.connected ? "XMPP offline" : "XMPP connected");
  ui.omemoHeaderBtn.title = `OMEMO ${state.enabled ? "on" : "off"} · ${detail}`;
}

function ensureXmppMamState(roomJid) {
  if (typeof XEP_0313_MAM_LOADING_GLOBAL.ensureXmppMamStateByJid !== "function") return null;
  return XEP_0313_MAM_LOADING_GLOBAL.ensureXmppMamStateByJid(
    xmppMamStateByRoomJid,
    roomJid,
    { includeTargetIndex: false },
    { xmppBareJidFn: xmppBareJid }
  );
}

function ensureXmppDmMamState(peerJid) {
  if (typeof XEP_0313_MAM_LOADING_GLOBAL.ensureXmppMamStateByJid !== "function") return null;
  return XEP_0313_MAM_LOADING_GLOBAL.ensureXmppMamStateByJid(
    xmppMamStateByPeerJid,
    peerJid,
    { includeTargetIndex: true },
    { xmppBareJidFn: xmppBareJid }
  );
}

function beginXmppMamLoading(mamState, queryId = "") {
  if (typeof XEP_0313_MAM_LOADING_GLOBAL.beginXmppMamLoading !== "function") return;
  XEP_0313_MAM_LOADING_GLOBAL.beginXmppMamLoading(mamState, queryId);
}

function endXmppMamLoading(mamState) {
  if (typeof XEP_0313_MAM_LOADING_GLOBAL.endXmppMamLoading !== "function") return;
  XEP_0313_MAM_LOADING_GLOBAL.endXmppMamLoading(mamState);
}

function recoverStaleXmppMamLoading(mamState, details = {}) {
  if (typeof XEP_0313_MAM_LOADING_GLOBAL.recoverStaleXmppMamLoading !== "function") return false;
  return XEP_0313_MAM_LOADING_GLOBAL.recoverStaleXmppMamLoading(mamState, details, {
    staleMs: XMPP_MAM_LOADING_STALE_MS,
    endXmppMamLoadingFn: endXmppMamLoading,
    addXmppDebugEventFn: addXmppDebugEvent
  });
}

function xmppMamArchiveTargetJid(prefs = getPreferences()) {
  if (typeof XEP_0313_MAM_LOADING_GLOBAL.xmppMamArchiveTargetJid !== "function") return "";
  return XEP_0313_MAM_LOADING_GLOBAL.xmppMamArchiveTargetJid(prefs, {
    xmppDomainFromJidFn: xmppDomainFromJid
  });
}

function buildXmppMamQueryIq({
  to = "",
  queryId = "",
  withJid = "",
  maxRows = XMPP_MAM_PAGE_SIZE,
  beforeToken = ""
} = {}) {
  if (typeof XEP_0313_MAM_LOADING_GLOBAL.buildXmppMamQueryIq !== "function") return null;
  return XEP_0313_MAM_LOADING_GLOBAL.buildXmppMamQueryIq({
    to,
    queryId,
    withJid,
    maxRows,
    beforeToken,
    mamNamespace: XMPP_MAM_NAMESPACE
  }, {
    $iq: globalThis.$iq
  });
}

function parseXmppMamFinPage(stanza) {
  if (typeof XEP_0313_MAM_LOADING_GLOBAL.parseXmppMamFinPage !== "function") {
    return { complete: false, firstId: "", lastId: "", count: null };
  }
  return XEP_0313_MAM_LOADING_GLOBAL.parseXmppMamFinPage(stanza, {
    mamNamespace: XMPP_MAM_NAMESPACE
  }, {
    xmppNodeHasXmlnsFn: xmppNodeHasXmlns,
    xmppNodeTextFn: xmppNodeText
  });
}

function xmppMamErrorIsPermanent(stanza) {
  if (typeof XEP_0313_MAM_LOADING_GLOBAL.xmppMamErrorIsPermanent !== "function") return false;
  return XEP_0313_MAM_LOADING_GLOBAL.xmppMamErrorIsPermanent(stanza);
}

function xmppMamUpdateStateFromFinPage(mamState, page) {
  if (typeof XEP_0313_MAM_LOADING_GLOBAL.xmppMamUpdateStateFromFinPage !== "function") return mamState;
  return XEP_0313_MAM_LOADING_GLOBAL.xmppMamUpdateStateFromFinPage(mamState, page);
}

function xmppMamResetStateForForceReload(mamState, { includeTargetIndex = false } = {}) {
  if (typeof XEP_0313_MAM_LOADING_GLOBAL.xmppMamResetStateForForceReload !== "function") return mamState;
  return XEP_0313_MAM_LOADING_GLOBAL.xmppMamResetStateForForceReload(mamState, { includeTargetIndex });
}

function xmppMamPrepareFallbackTargetState(mamState, nextTargetIndex = 0) {
  if (typeof XEP_0313_MAM_LOADING_GLOBAL.xmppMamPrepareFallbackTargetState !== "function") return mamState;
  return XEP_0313_MAM_LOADING_GLOBAL.xmppMamPrepareFallbackTargetState(mamState, nextTargetIndex);
}

function requestXmppRoomHistory(roomJid, {
  limit = XMPP_MAM_PAGE_SIZE,
  force = false,
  reason = "manual",
  prefetchPages = 1
} = {}) {
  if (typeof XEP_0313_MAM_LOADING_GLOBAL.requestXmppRoomHistory !== "function") return false;
  return XEP_0313_MAM_LOADING_GLOBAL.requestXmppRoomHistory(roomJid, {
    limit,
    force,
    reason,
    prefetchPages
  }, {
    XMPP_MAM_PAGE_SIZE,
    XMPP_MAM_REQUEST_TIMEOUT_MS,
    xmppConnection,
    $iq: globalThis.$iq,
    setTimeoutFn: setTimeout,
    xmppBareJidFn: xmppBareJid,
    ensureXmppMamStateFn: ensureXmppMamState,
    recoverStaleXmppMamLoadingFn: recoverStaleXmppMamLoading,
    xmppMamResetStateForForceReloadFn: xmppMamResetStateForForceReload,
    createIdFn: createId,
    beginXmppMamLoadingFn: beginXmppMamLoading,
    endXmppMamLoadingFn: endXmppMamLoading,
    buildXmppMamQueryIqFn: buildXmppMamQueryIq,
    parseXmppMamFinPageFn: parseXmppMamFinPage,
    xmppMamUpdateStateFromFinPageFn: xmppMamUpdateStateFromFinPage,
    xmppMamErrorIsPermanentFn: xmppMamErrorIsPermanent,
    getActiveChannelFn: getActiveChannel,
    renderMessagesFn: renderMessages,
    renderChannelsFn: renderChannels,
    addXmppDebugEventFn: addXmppDebugEvent
  });
}

function requestXmppDirectHistory(peerJid, {
  limit = XMPP_MAM_PAGE_SIZE,
  force = false,
  reason = "manual",
  prefetchPages = 1
} = {}) {
  if (typeof XEP_0313_MAM_LOADING_GLOBAL.requestXmppDirectHistory !== "function") return false;
  return XEP_0313_MAM_LOADING_GLOBAL.requestXmppDirectHistory(peerJid, {
    limit,
    force,
    reason,
    prefetchPages
  }, {
    XMPP_MAM_PAGE_SIZE,
    XMPP_MAM_REQUEST_TIMEOUT_MS,
    xmppConnection,
    $iq: globalThis.$iq,
    setTimeoutFn: setTimeout,
    getPreferencesFn: getPreferences,
    getActiveConversationFn: getActiveConversation,
    xmppPeerJidForDmThreadFn: xmppPeerJidForDmThread,
    getCurrentAccountFn: getCurrentAccount,
    xmppBareJidFn: xmppBareJid,
    xmppMamArchiveTargetJidFn: xmppMamArchiveTargetJid,
    ensureXmppDmMamStateFn: ensureXmppDmMamState,
    recoverStaleXmppMamLoadingFn: recoverStaleXmppMamLoading,
    xmppMamResetStateForForceReloadFn: xmppMamResetStateForForceReload,
    xmppMamPrepareFallbackTargetStateFn: xmppMamPrepareFallbackTargetState,
    createIdFn: createId,
    beginXmppMamLoadingFn: beginXmppMamLoading,
    endXmppMamLoadingFn: endXmppMamLoading,
    buildXmppMamQueryIqFn: buildXmppMamQueryIq,
    parseXmppMamFinPageFn: parseXmppMamFinPage,
    xmppMamUpdateStateFromFinPageFn: xmppMamUpdateStateFromFinPage,
    xmppMamErrorIsPermanentFn: xmppMamErrorIsPermanent,
    renderMessagesFn: renderMessages,
    renderDmListFn: renderDmList,
    addXmppDebugEventFn: addXmppDebugEvent
  });
}

function isXmppBackedChannel(channel) {
  if (typeof XEP_0045_0503_ROOM_LIFECYCLE_GLOBAL.isXmppBackedChannel !== "function") return false;
  return XEP_0045_0503_ROOM_LIFECYCLE_GLOBAL.isXmppBackedChannel(channel, {
    normalizeXmppJidFn: normalizeXmppJid
  });
}

function isXmppBackedGuild(guild) {
  if (typeof XEP_0045_0503_ROOM_LIFECYCLE_GLOBAL.isXmppBackedGuild !== "function") return false;
  return XEP_0045_0503_ROOM_LIFECYCLE_GLOBAL.isXmppBackedGuild(guild, {
    normalizeXmppJidFn: normalizeXmppJid
  });
}

function xmppDomainFromJid(jid) {
  return xmppDomainFromJidViaModule(jid);
}

function shouldUsePlainOnlySasl(jid, wsUrl = "") {
  if (typeof XEP_0280_0352_CSI_CARBONS_GLOBAL.shouldUsePlainOnlySasl !== "function") return false;
  return XEP_0280_0352_CSI_CARBONS_GLOBAL.shouldUsePlainOnlySasl(jid, wsUrl, {
    xmppDomainFromJidFn: xmppDomainFromJid,
    XMPP_PLAIN_ONLY_DOMAINS,
    normalizeXmppWsUrlFn: normalizeXmppWsUrl
  });
}

function stropheConnectionOptionsForXmpp({ jid, wsUrl }) {
  if (typeof XEP_0280_0352_CSI_CARBONS_GLOBAL.stropheConnectionOptionsForXmpp !== "function") {
    return { keepalive: true };
  }
  return XEP_0280_0352_CSI_CARBONS_GLOBAL.stropheConnectionOptionsForXmpp({ jid, wsUrl }, {
    Strophe: globalThis.Strophe,
    xmppDomainFromJidFn: xmppDomainFromJid,
    XMPP_PLAIN_ONLY_DOMAINS,
    normalizeXmppWsUrlFn: normalizeXmppWsUrl,
    normalizeXmppJidFn: normalizeXmppJid,
    addXmppDebugEventFn: addXmppDebugEvent
  });
}

function enableXmppCarbons(connection) {
  if (typeof XEP_0280_0352_CSI_CARBONS_GLOBAL.enableXmppCarbons !== "function") return;
  XEP_0280_0352_CSI_CARBONS_GLOBAL.enableXmppCarbons(connection, {
    $iq: globalThis.$iq,
    addXmppDebugEventFn: addXmppDebugEvent
  });
}

function xmppStreamFeaturesNode(connection = xmppConnection) {
  if (typeof XEP_0280_0352_CSI_CARBONS_GLOBAL.xmppStreamFeaturesNode !== "function") return null;
  return XEP_0280_0352_CSI_CARBONS_GLOBAL.xmppStreamFeaturesNode(connection);
}

function xmppServerSupportsCsi(connection = xmppConnection) {
  if (typeof XEP_0280_0352_CSI_CARBONS_GLOBAL.xmppServerSupportsCsi !== "function") return false;
  return XEP_0280_0352_CSI_CARBONS_GLOBAL.xmppServerSupportsCsi(connection, {
    xmppNodeHasXmlnsFn: xmppNodeHasXmlns,
    XMPP_CSI_NAMESPACE
  });
}

function xmppBuildClientStateNode(state = "active") {
  if (typeof XEP_0280_0352_CSI_CARBONS_GLOBAL.xmppBuildClientStateNode !== "function") return null;
  return XEP_0280_0352_CSI_CARBONS_GLOBAL.xmppBuildClientStateNode(state, {
    XMPP_CSI_NAMESPACE,
    Strophe: globalThis.Strophe,
    documentRef: typeof document !== "undefined" ? document : null
  });
}

function sendXmppClientStateHint(state = "active", { force = false, reason = "" } = {}) {
  if (typeof XEP_0280_0352_CSI_CARBONS_GLOBAL.sendXmppClientStateHint !== "function") return false;
  return XEP_0280_0352_CSI_CARBONS_GLOBAL.sendXmppClientStateHint(state, { force, reason }, {
    XMPP_CSI_NAMESPACE,
    Strophe: globalThis.Strophe,
    documentRef: typeof document !== "undefined" ? document : null,
    xmppConnection,
    relayStatus,
    xmppCsiSupportedRef: {
      get: () => xmppCsiSupported,
      set: (value) => {
        xmppCsiSupported = Boolean(value);
      }
    },
    xmppCsiStateRef: {
      get: () => xmppCsiState,
      set: (value) => {
        xmppCsiState = (value || "").toString();
      }
    },
    addXmppDebugEventFn: addXmppDebugEvent
  });
}

function syncXmppClientStateHint({ force = false, reason = "" } = {}) {
  if (typeof XEP_0280_0352_CSI_CARBONS_GLOBAL.syncXmppClientStateHint !== "function") return false;
  return XEP_0280_0352_CSI_CARBONS_GLOBAL.syncXmppClientStateHint({ force, reason }, {
    XMPP_CSI_NAMESPACE,
    Strophe: globalThis.Strophe,
    documentRef: typeof document !== "undefined" ? document : null,
    xmppConnection,
    relayStatus,
    xmppCsiSupportedRef: {
      get: () => xmppCsiSupported,
      set: (value) => {
        xmppCsiSupported = Boolean(value);
      }
    },
    xmppCsiStateRef: {
      get: () => xmppCsiState,
      set: (value) => {
        xmppCsiState = (value || "").toString();
      }
    },
    addXmppDebugEventFn: addXmppDebugEvent
  });
}

function refreshXmppCsiCapability(connection = xmppConnection) {
  if (typeof XEP_0280_0352_CSI_CARBONS_GLOBAL.refreshXmppCsiCapability !== "function") return false;
  return XEP_0280_0352_CSI_CARBONS_GLOBAL.refreshXmppCsiCapability(connection, {
    XMPP_CSI_NAMESPACE,
    xmppNodeHasXmlnsFn: xmppNodeHasXmlns,
    xmppCsiSupportedRef: {
      get: () => xmppCsiSupported,
      set: (value) => {
        xmppCsiSupported = Boolean(value);
      }
    },
    xmppCsiStateRef: {
      get: () => xmppCsiState,
      set: (value) => {
        xmppCsiState = (value || "").toString();
      }
    },
    addXmppDebugEventFn: addXmppDebugEvent
  });
}

function resolveXmppMucService(prefs = getPreferences()) {
  if (typeof XEP_0280_0352_CSI_CARBONS_GLOBAL.resolveXmppMucService !== "function") return "";
  return XEP_0280_0352_CSI_CARBONS_GLOBAL.resolveXmppMucService(prefs, {
    normalizeXmppMucServiceFn: normalizeXmppMucService,
    xmppDomainFromJidFn: xmppDomainFromJid
  });
}

function xmppMamForwardedMessagesFromStanza(stanza) {
  if (typeof XEP_0280_0352_CSI_CARBONS_GLOBAL.xmppMamForwardedMessagesFromStanza !== "function") return [];
  return XEP_0280_0352_CSI_CARBONS_GLOBAL.xmppMamForwardedMessagesFromStanza(stanza, {
    mamNamespace: XMPP_MAM_NAMESPACE
  }, {
    xmppNodeHasXmlnsFn: xmppNodeHasXmlns,
    xmppStanzaDelayTimestampFn: xmppStanzaDelayTimestamp
  });
}

function xmppCarbonForwardedMessagesFromStanza(stanza) {
  if (typeof XEP_0280_0352_CSI_CARBONS_GLOBAL.xmppCarbonForwardedMessagesFromStanza !== "function") return [];
  return XEP_0280_0352_CSI_CARBONS_GLOBAL.xmppCarbonForwardedMessagesFromStanza(stanza, {}, {
    xmppNodeHasXmlnsFn: xmppNodeHasXmlns,
    xmppStanzaDelayTimestampFn: xmppStanzaDelayTimestamp
  });
}
