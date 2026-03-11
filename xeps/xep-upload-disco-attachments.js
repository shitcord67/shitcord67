/*
 * XMPP upload/disco/attachment bridge extracted from app.js.
 * Functions here intentionally bind to app globals at call time.
 */

function normalizeRelayTransportAttachmentUrl(rawUrl) {
  return normalizeRelayTransportAttachmentUrlViaModule(rawUrl);
}

function relayTransportAttachments(attachments, { limit = 4, urlMax = 640 } = {}) {
  const safeLimit = Math.max(1, Math.min(8, Number(limit) || 4));
  const safeUrlMax = Math.max(120, Math.min(4096, Number(urlMax) || 640));
  return normalizeAttachments(Array.isArray(attachments) ? attachments : [])
    .map((entry) => {
      const resolvedUrl = normalizeRelayTransportAttachmentUrl(entry?.url || "");
      if (!resolvedUrl) return null;
      return {
        type: (entry.type || "file").toString().slice(0, 16),
        url: resolvedUrl.slice(0, safeUrlMax),
        name: (entry.name || "file").toString().slice(0, 80),
        format: (entry.format || "image").toString().slice(0, 24)
      };
    })
    .filter(Boolean)
    .slice(0, safeLimit);
}

function relayUnshareableAttachmentCount(attachments) {
  const items = normalizeAttachments(Array.isArray(attachments) ? attachments : []);
  if (items.length === 0) return 0;
  return items.reduce((count, entry) => (
    normalizeRelayTransportAttachmentUrl(entry?.url || "") ? count : count + 1
  ), 0);
}

function relayLocalAttachmentNotice(count) {
  const safeCount = Math.max(0, Number(count) || 0);
  if (safeCount <= 0) return "";
  return `[${safeCount} local attachment${safeCount === 1 ? "" : "s"} not shareable over relay]`;
}

function relayTransportPacketText(message) {
  const text = trimTextForTransport(message?.text || "");
  const notice = relayLocalAttachmentNotice(relayUnshareableAttachmentCount(message?.attachments));
  return [text, notice].filter(Boolean).join("\n");
}

function relayMessageBodyText(message) {
  const text = trimTextForTransport(message?.text || "");
  const links = relayTransportAttachments(message?.attachments, { limit: 3, urlMax: 640 })
    .map((entry) => entry.url)
    .filter(Boolean);
  const localNotice = relayLocalAttachmentNotice(relayUnshareableAttachmentCount(message?.attachments));
  if (links.length === 0 && !localNotice) return text;
  return [text, ...links, localNotice].filter(Boolean).join("\n");
}

function xmppStanzaStableId(stanza) {
  return xmppStanzaStableIdViaModule(stanza);
}

function xmppSyntheticMessageId({ from = "", ts = "", text = "", attachments = [], replyId = "" } = {}) {
  return xmppSyntheticMessageIdViaModule({ from, ts, text, attachments, replyId });
}

function primaryXmppReferenceIdForMessage(message) {
  return primaryXmppReferenceIdForMessageViaModule(message);
}

function preferredXmppDmReferenceIdForMessage(message) {
  return preferredXmppDmReferenceIdForMessageViaModule(message);
}

function preferredXmppReferenceIdForConversationMessage(conversation, message) {
  if (typeof XEP_0333_0359_0372_0444_0482_BUILDERS_GLOBAL.preferredXmppReferenceIdForConversationMessage !== "function") return "";
  return XEP_0333_0359_0372_0444_0482_BUILDERS_GLOBAL.preferredXmppReferenceIdForConversationMessage(conversation, message, {
    preferredXmppDmReferenceIdForMessageFn: preferredXmppDmReferenceIdForMessage,
    primaryXmppReferenceIdForMessageFn: primaryXmppReferenceIdForMessage
  });
}

function xmppReplyFallbackPrefix(replyMeta) {
  if (typeof XEP_0461_0428_REPLIES_GLOBAL.xmppReplyFallbackPrefix !== "function") return "";
  return XEP_0461_0428_REPLIES_GLOBAL.xmppReplyFallbackPrefix(replyMeta, {
    decodeHtmlEntitiesFn: decodeHtmlEntities
  });
}

function buildXmppMessageBody(message, replyMeta = null) {
  if (typeof XEP_0333_0359_0372_0444_0482_BUILDERS_GLOBAL.buildXmppMessageBody !== "function") {
    return { body: relayMessageBodyText(message), fallbackPrefixLength: 0 };
  }
  return XEP_0333_0359_0372_0444_0482_BUILDERS_GLOBAL.buildXmppMessageBody(message, replyMeta, {
    relayMessageBodyTextFn: relayMessageBodyText,
    xmppReplyFallbackPrefixFn: xmppReplyFallbackPrefix
  });
}

function resolveXmppReplyMetaForDm(thread, message, account, peerJid = "") {
  if (typeof XEP_0333_0359_0372_0444_0482_BUILDERS_GLOBAL.resolveXmppReplyMetaForDm !== "function") return null;
  return XEP_0333_0359_0372_0444_0482_BUILDERS_GLOBAL.resolveXmppReplyMetaForDm(thread, message, account, peerJid, {
    findMessageInChannelFn: findMessageInChannel,
    preferredXmppDmReferenceIdForMessageFn: preferredXmppDmReferenceIdForMessage,
    getAccountByIdFn: getAccountById,
    normalizeXmppJidFn: normalizeXmppJid,
    displayNameForMessageFn: displayNameForMessage
  });
}

function resolveXmppReplyMetaForRoom(channel, message, roomJid = "") {
  if (typeof XEP_0333_0359_0372_0444_0482_BUILDERS_GLOBAL.resolveXmppReplyMetaForRoom !== "function") return null;
  return XEP_0333_0359_0372_0444_0482_BUILDERS_GLOBAL.resolveXmppReplyMetaForRoom(channel, message, roomJid, {
    findMessageInChannelFn: findMessageInChannel,
    primaryXmppReferenceIdForMessageFn: primaryXmppReferenceIdForMessage,
    xmppBareJidFn: xmppBareJid,
    displayNameForMessageFn: displayNameForMessage
  });
}

function xmppEnsureBuilderAtMessageNode(stanza) {
  if (typeof XEP_0461_0428_REPLIES_GLOBAL.xmppEnsureBuilderAtMessageNode !== "function") return stanza;
  return XEP_0461_0428_REPLIES_GLOBAL.xmppEnsureBuilderAtMessageNode(stanza);
}

function appendXmppReplyNodes(stanza, replyMeta, fallbackPrefixLength = 0) {
  if (typeof XEP_0461_0428_REPLIES_GLOBAL.appendXmppReplyNodes !== "function") return stanza;
  return XEP_0461_0428_REPLIES_GLOBAL.appendXmppReplyNodes(stanza, replyMeta, fallbackPrefixLength, {
    xmppEnsureBuilderAtMessageNodeFn: xmppEnsureBuilderAtMessageNode
  });
}

function appendXmppOriginIdNode(stanza, originId) {
  if (typeof XEP_0333_0359_0372_0444_0482_BUILDERS_GLOBAL.appendXmppOriginIdNode !== "function") return stanza;
  return XEP_0333_0359_0372_0444_0482_BUILDERS_GLOBAL.appendXmppOriginIdNode(stanza, originId, {
    xmppEnsureBuilderAtMessageNodeFn: xmppEnsureBuilderAtMessageNode
  });
}

function appendXmppChatMarkableNode(stanza) {
  if (typeof XEP_0333_0359_0372_0444_0482_BUILDERS_GLOBAL.appendXmppChatMarkableNode !== "function") return stanza;
  return XEP_0333_0359_0372_0444_0482_BUILDERS_GLOBAL.appendXmppChatMarkableNode(stanza, {
    xmppEnsureBuilderAtMessageNodeFn: xmppEnsureBuilderAtMessageNode,
    chatMarkersNamespace: XMPP_CHAT_MARKERS_NAMESPACE
  });
}

function appendXmppMessageReplaceNode(stanza, targetRefId) {
  if (typeof XEP_0333_0359_0372_0444_0482_BUILDERS_GLOBAL.appendXmppMessageReplaceNode !== "function") return stanza;
  return XEP_0333_0359_0372_0444_0482_BUILDERS_GLOBAL.appendXmppMessageReplaceNode(stanza, targetRefId, {
    xmppEnsureBuilderAtMessageNodeFn: xmppEnsureBuilderAtMessageNode,
    messageCorrectNamespace: "urn:xmpp:message-correct:0"
  });
}

function appendXmppReceiptRequestNode(stanza) {
  if (typeof XEP_0184_0333_GLOBAL.appendXmppReceiptRequestNode !== "function") return stanza;
  return XEP_0184_0333_GLOBAL.appendXmppReceiptRequestNode(stanza, {
    xmppEnsureBuilderAtMessageNodeFn: xmppEnsureBuilderAtMessageNode,
    receiptsNamespace: XMPP_RECEIPTS_NAMESPACE
  });
}

function buildXmppReceiptAckStanza(to, stanzaMessageId, { type = "chat" } = {}) {
  if (typeof XEP_0184_0333_GLOBAL.buildXmppReceiptAckStanza !== "function") return null;
  return XEP_0184_0333_GLOBAL.buildXmppReceiptAckStanza({
    to,
    id: stanzaMessageId,
    type
  }, {
    $msg: globalThis.$msg,
    receiptsNamespace: XMPP_RECEIPTS_NAMESPACE
  });
}

function buildXmppChatMarkerAckStanza(to, stanzaMessageId, { type = "chat", marker = "received" } = {}) {
  if (typeof XEP_0184_0333_GLOBAL.buildXmppChatMarkerAckStanza !== "function") return null;
  return XEP_0184_0333_GLOBAL.buildXmppChatMarkerAckStanza({
    to,
    id: stanzaMessageId,
    type,
    marker
  }, {
    $msg: globalThis.$msg,
    chatMarkersNamespace: XMPP_CHAT_MARKERS_NAMESPACE
  });
}

function buildXmppDisplayedMarkerStanza(to, markerTargetId, markerStanzaId = "") {
  if (typeof XEP_0184_0333_GLOBAL.buildXmppDisplayedMarkerStanza !== "function") return null;
  return XEP_0184_0333_GLOBAL.buildXmppDisplayedMarkerStanza({
    to,
    id: markerTargetId,
    stanzaId: markerStanzaId
  }, {
    $msg: globalThis.$msg,
    chatMarkersNamespace: XMPP_CHAT_MARKERS_NAMESPACE
  });
}

function shouldSkipXmppDisplayedMarker(peerBare = "", targetId = "") {
  if (typeof XEP_0184_0333_GLOBAL.shouldSkipXmppDisplayedMarker !== "function") return true;
  return XEP_0184_0333_GLOBAL.shouldSkipXmppDisplayedMarker(peerBare, targetId, {
    lastSentDisplayedMarkerByPeerJid: xmppLastSentDisplayedMarkerByPeerJid
  });
}

function appendXmppReactionsNode(stanza, targetRefId, emojis = []) {
  if (typeof XEP_0333_0359_0372_0444_0482_BUILDERS_GLOBAL.appendXmppReactionsNode !== "function") return stanza;
  return XEP_0333_0359_0372_0444_0482_BUILDERS_GLOBAL.appendXmppReactionsNode(stanza, targetRefId, emojis, {
    xmppEnsureBuilderAtMessageNodeFn: xmppEnsureBuilderAtMessageNode,
    reactionsNamespace: XMPP_REACTIONS_NAMESPACE
  });
}

function xmppShareableAttachmentsForStanza(message, { limit = 6, urlMax = 2048 } = {}) {
  if (typeof XEP_0333_0359_0372_0444_0482_BUILDERS_GLOBAL.xmppShareableAttachmentsForStanza !== "function") {
    return relayTransportAttachments(message?.attachments, {
      limit: Math.max(1, Math.min(8, Number(limit) || 6)),
      urlMax: Math.max(200, Math.min(4096, Number(urlMax) || 2048))
    });
  }
  return XEP_0333_0359_0372_0444_0482_BUILDERS_GLOBAL.xmppShareableAttachmentsForStanza(message, { limit, urlMax }, {
    relayTransportAttachmentsFn: relayTransportAttachments
  });
}

function appendXmppAttachmentMetadataNodes(stanza, attachments = []) {
  if (typeof XEP_0333_0359_0372_0444_0482_BUILDERS_GLOBAL.appendXmppAttachmentMetadataNodes !== "function") return stanza;
  return XEP_0333_0359_0372_0444_0482_BUILDERS_GLOBAL.appendXmppAttachmentMetadataNodes(stanza, attachments, {
    normalizeAttachmentsFn: normalizeAttachments,
    xmppEnsureBuilderAtMessageNodeFn: xmppEnsureBuilderAtMessageNode
  });
}

function appendXmppCallInviteNode(stanza, {
  url = "",
  audio = true,
  video = true
} = {}) {
  if (typeof XEP_0333_0359_0372_0444_0482_BUILDERS_GLOBAL.appendXmppCallInviteNode !== "function") return stanza;
  return XEP_0333_0359_0372_0444_0482_BUILDERS_GLOBAL.appendXmppCallInviteNode(stanza, { url, audio, video }, {
    normalizeCallInviteUrlFn: normalizeCallInviteUrl,
    xmppEnsureBuilderAtMessageNodeFn: xmppEnsureBuilderAtMessageNode,
    callInvitesNamespace: XMPP_CALL_INVITES_NAMESPACE
  });
}

function xmppSendIqPromise(connection, iqBuilder, timeoutMs = 7000) {
  if (typeof XEP_0030_0166_CALL_DISCO_GLOBAL.xmppSendIqPromise !== "function") {
    if (!connection || typeof connection.sendIQ !== "function" || !iqBuilder) {
      return Promise.reject(new Error("XMPP IQ helper unavailable"));
    }
    return new Promise((resolve, reject) => {
      try {
        connection.sendIQ(
          iqBuilder,
          (result) => resolve(result),
          (error) => reject(error || new Error("XMPP IQ error")),
          Math.max(1000, Number(timeoutMs) || 7000)
        );
      } catch (error) {
        reject(error);
      }
    });
  }
  return XEP_0030_0166_CALL_DISCO_GLOBAL.xmppSendIqPromise(connection, iqBuilder, timeoutMs);
}

function xmppParseMaxUploadBytesFromDiscoInfo(stanza) {
  if (typeof XEP_0030_0166_CALL_DISCO_GLOBAL.xmppParseMaxUploadBytesFromDiscoInfo !== "function") return 0;
  return XEP_0030_0166_CALL_DISCO_GLOBAL.xmppParseMaxUploadBytesFromDiscoInfo(stanza, {
    xmppNodeTextFn: xmppNodeText
  });
}

async function xmppFetchDiscoInfo(jid, connection = xmppConnection) {
  if (typeof XEP_0030_0166_CALL_DISCO_GLOBAL.xmppFetchDiscoInfo !== "function") {
    throw new Error("XMPP discovery unavailable");
  }
  return XEP_0030_0166_CALL_DISCO_GLOBAL.xmppFetchDiscoInfo(jid, connection, {
    xmppSendIqPromiseFn: xmppSendIqPromise,
    $iq: globalThis.$iq,
    xmppNodeTextFn: xmppNodeText
  });
}

async function xmppFetchDiscoInfoCached(jid, { force = false, connection = xmppConnection } = {}) {
  if (typeof XEP_0030_0166_CALL_DISCO_GLOBAL.xmppFetchDiscoInfoCached !== "function") {
    throw new Error("Invalid discovery target");
  }
  return XEP_0030_0166_CALL_DISCO_GLOBAL.xmppFetchDiscoInfoCached(jid, { force, connection }, {
    bareJidFn: xmppBareJid,
    cacheByJid: xmppDiscoInfoCacheByJid,
    inFlightByJid: xmppDiscoInfoInFlightByJid,
    ttlMs: XMPP_DISCO_INFO_TTL_MS,
    xmppSendIqPromiseFn: xmppSendIqPromise,
    $iq: globalThis.$iq,
    xmppNodeTextFn: xmppNodeText
  });
}

function xmppCallCapabilityTargetsForConversation(conversation = getActiveConversation()) {
  if (typeof XEP_0030_0166_CALL_DISCO_GLOBAL.xmppCallCapabilityTargetsForConversation !== "function") return [];
  return XEP_0030_0166_CALL_DISCO_GLOBAL.xmppCallCapabilityTargetsForConversation(conversation, {
    getCurrentAccountFn: getCurrentAccount,
    xmppPeerJidForDmThreadFn: xmppPeerJidForDmThread,
    bareJidFn: xmppBareJid,
    domainFromJidFn: xmppDomainFromJid,
    getPreferencesFn: getPreferences
  });
}

function xmppClientDiscoFeatures() {
  if (typeof XEP_0030_0166_CALL_DISCO_GLOBAL.xmppClientDiscoFeatures !== "function") return [];
  return XEP_0030_0166_CALL_DISCO_GLOBAL.xmppClientDiscoFeatures({
    XMPP_CAPS_NAMESPACE,
    XMPP_JINGLE_NAMESPACE,
    XMPP_JINGLE_RTP_NAMESPACE,
    XMPP_JINGLE_RTP_INFO_NAMESPACE,
    XMPP_JINGLE_ICE_UDP_NAMESPACE,
    XMPP_JINGLE_MESSAGE_INIT_COMPAT_NAMESPACES,
    XMPP_CALL_INVITES_NAMESPACE,
    XMPP_JINGLE_AUDIO_NAMESPACE,
    XMPP_JINGLE_VIDEO_NAMESPACE,
    XMPP_JINGLE_RTP_RTCP_FB_NAMESPACE,
    XMPP_JINGLE_RTP_HDR_EXT_NAMESPACE,
    XMPP_JINGLE_RTP_SSMA_NAMESPACE,
    XMPP_JINGLE_RTP_RTCP_MUX_NAMESPACE,
    XMPP_JINGLE_GROUPING_NAMESPACE,
    XMPP_BOB_NAMESPACE,
    XMPP_SIMS_NAMESPACE,
    XMPP_FILE_METADATA_NAMESPACE,
    XMPP_REACTIONS_NAMESPACE,
    XMPP_MESSAGE_RETRACT_NAMESPACE,
    XMPP_FASTEN_NAMESPACE,
    XMPP_HINTS_NAMESPACE,
    XMPP_RECEIPTS_NAMESPACE,
    XMPP_CHATSTATES_NAMESPACE,
    XMPP_CHAT_MARKERS_NAMESPACE,
    XMPP_DIRECT_MUC_INVITE_NAMESPACE,
    XMPP_OCCUPANT_ID_NAMESPACE,
    XMPP_BOOKMARKS_NOTIFY_FEATURE,
    XMPP_IDLE_NAMESPACE,
    XMPP_EME_NAMESPACE,
    XMPP_OMEMO_NAMESPACE,
    XMPP_OMEMO_NAMESPACE_V2,
    XMPP_OMEMO_DEVICELIST_NOTIFY_FEATURE,
    XMPP_OMEMO_DEVICELIST_NOTIFY_FEATURE_V2,
    xmppOmemoRuntimeAvailableFn: xmppOmemoRuntimeAvailable
  });
}

function xmppRequiredCallFeatureBuckets() {
  if (typeof XEP_0030_0166_CALL_DISCO_GLOBAL.xmppRequiredCallFeatureBuckets !== "function") {
    return { core: [], media: [], transport: [], invite: [] };
  }
  return XEP_0030_0166_CALL_DISCO_GLOBAL.xmppRequiredCallFeatureBuckets({
    XMPP_JINGLE_NAMESPACE,
    XMPP_JINGLE_RTP_NAMESPACE,
    XMPP_JINGLE_AUDIO_NAMESPACE,
    XMPP_JINGLE_VIDEO_NAMESPACE,
    XMPP_JINGLE_ICE_UDP_NAMESPACE,
    XMPP_JINGLE_MESSAGE_INIT_COMPAT_NAMESPACES,
    XMPP_CALL_INVITES_NAMESPACE
  });
}

function xmppEvaluateCallFeatures(features = new Set()) {
  if (typeof XEP_0030_0166_CALL_DISCO_GLOBAL.xmppEvaluateCallFeatures !== "function") return { hasCore: false, hasMedia: false, hasTransport: false, hasInvite: false, ready: false };
  return XEP_0030_0166_CALL_DISCO_GLOBAL.xmppEvaluateCallFeatures(features, {
    xmppRequiredCallFeatureBucketsFn: xmppRequiredCallFeatureBuckets,
    XMPP_JINGLE_NAMESPACE,
    XMPP_JINGLE_RTP_NAMESPACE,
    XMPP_JINGLE_AUDIO_NAMESPACE,
    XMPP_JINGLE_VIDEO_NAMESPACE,
    XMPP_JINGLE_ICE_UDP_NAMESPACE,
    XMPP_JINGLE_MESSAGE_INIT_COMPAT_NAMESPACES,
    XMPP_CALL_INVITES_NAMESPACE
  });
}

function xmppCachedCallFeaturesForPeer(peerJid = "") {
  if (typeof XEP_0030_0166_CALL_DISCO_GLOBAL.xmppCachedCallFeaturesForPeer !== "function") return new Set();
  return XEP_0030_0166_CALL_DISCO_GLOBAL.xmppCachedCallFeaturesForPeer(peerJid, {
    bareJidFn: xmppBareJid,
    cacheByJid: xmppDiscoInfoCacheByJid
  });
}

function xmppNegotiatedCallMediaForPeer(peerJid = "", requestedMedia = XMPP_CALL_DEFAULT_MEDIA) {
  if (typeof XEP_0030_0166_CALL_DISCO_GLOBAL.xmppNegotiatedCallMediaForPeer !== "function") return ["audio"];
  return XEP_0030_0166_CALL_DISCO_GLOBAL.xmppNegotiatedCallMediaForPeer(peerJid, requestedMedia, {
    XMPP_CALL_DEFAULT_MEDIA,
    XMPP_JINGLE_AUDIO_NAMESPACE,
    XMPP_JINGLE_VIDEO_NAMESPACE,
    xmppCachedCallFeaturesForPeerFn: xmppCachedCallFeaturesForPeer
  });
}

function xmppShouldUseMinimalRtpForPeer(peerJid = "", media = ["audio", "video"]) {
  if (typeof XEP_0030_0166_CALL_DISCO_GLOBAL.xmppShouldUseMinimalRtpForPeer !== "function") return true;
  return XEP_0030_0166_CALL_DISCO_GLOBAL.xmppShouldUseMinimalRtpForPeer(peerJid, media, {
    XMPP_JINGLE_RTP_RTCP_FB_NAMESPACE,
    XMPP_JINGLE_RTP_HDR_EXT_NAMESPACE,
    XMPP_JINGLE_RTP_SSMA_NAMESPACE,
    XMPP_JINGLE_AUDIO_NAMESPACE,
    XMPP_JINGLE_VIDEO_NAMESPACE,
    xmppCachedCallFeaturesForPeerFn: xmppCachedCallFeaturesForPeer
  });
}

async function xmppAssessConversationCallInterop(conversation = getActiveConversation(), { force = false } = {}) {
  if (typeof XEP_0030_0166_CALL_DISCO_GLOBAL.xmppAssessConversationCallInterop !== "function") {
    return { ready: false, targets: [], chosenTarget: "", details: [], reason: "no-target" };
  }
  return XEP_0030_0166_CALL_DISCO_GLOBAL.xmppAssessConversationCallInterop(conversation, { force }, {
    xmppCallCapabilityTargetsForConversationFn: xmppCallCapabilityTargetsForConversation,
    xmppFetchDiscoInfoCachedFn: xmppFetchDiscoInfoCached,
    xmppEvaluateCallFeaturesFn: xmppEvaluateCallFeatures
  });
}

async function discoverXmppMucRooms({
  connection = xmppConnection,
  prefs = getPreferences(),
  force = false
} = {}) {
  if (!connection || !globalThis.$iq) return [];
  const mucService = resolveXmppMucService(prefs);
  if (!mucService) return [];
  const cacheKey = mucService.toLowerCase();
  const now = Date.now();
  const cached = xmppRoomDiscoveryCacheByService.get(cacheKey);
  if (!force && cached && cached.expiresAt > now) {
    return Array.isArray(cached.rooms) ? cached.rooms : [];
  }
  if (!force && xmppRoomDiscoveryInFlightByService.has(cacheKey)) {
    return xmppRoomDiscoveryInFlightByService.get(cacheKey);
  }
  const task = (async () => {
    try {
      const stanza = await xmppSendIqPromise(
        connection,
        globalThis.$iq({ type: "get", to: mucService }).c("query", { xmlns: "http://jabber.org/protocol/disco#items" }),
        7000
      );
      const rooms = [...stanza.getElementsByTagName("item")]
        .map((node) => {
          const jid = xmppBareJid(node.getAttribute("jid") || "");
          if (!jid || !looksLikeXmppMucJid(jid, prefs)) return null;
          return {
            jid,
            name: decodeHtmlEntities((node.getAttribute("name") || "").toString()).trim().slice(0, 90),
            autojoin: false,
            nick: ""
          };
        })
        .filter(Boolean)
        .slice(0, XMPP_ROOM_DISCOVERY_MAX_ITEMS);
      addXmppDebugEvent("iq", "Discovered MUC rooms via disco#items", {
        service: mucService,
        count: rooms.length
      });
      return rooms;
    } catch (error) {
      addXmppDebugEvent("iq", "MUC room discovery unavailable", {
        service: mucService,
        error: String(error?.message || error || "unknown")
      });
      return [];
    }
  })()
    .then((rooms) => {
      const normalizedRooms = Array.isArray(rooms) ? rooms : [];
      const ttl = normalizedRooms.length > 0
        ? XMPP_ROOM_DISCOVERY_TTL_MS
        : Math.max(60_000, Math.floor(XMPP_ROOM_DISCOVERY_TTL_MS / 4));
      xmppRoomDiscoveryCacheByService.set(cacheKey, {
        rooms: normalizedRooms,
        expiresAt: Date.now() + ttl
      });
      return normalizedRooms;
    })
    .finally(() => {
      xmppRoomDiscoveryInFlightByService.delete(cacheKey);
    });
  xmppRoomDiscoveryInFlightByService.set(cacheKey, task);
  return task;
}

async function discoverXmppHttpUploadService({ connection = xmppConnection, prefs = getPreferences(), force = false } = {}) {
  if (!connection || !globalThis.$iq) return null;
  const domain = xmppDomainFromJid(prefs?.xmppJid || "");
  if (!domain) return null;
  const cacheKey = domain.toLowerCase();
  const now = Date.now();
  const cached = xmppHttpUploadServiceCache.get(cacheKey);
  if (!force && cached && cached.expiresAt > now) {
    if (!cached.serviceJid || !cached.namespace) return null;
    return {
      serviceJid: cached.serviceJid,
      namespace: cached.namespace,
      maxFileSize: cached.maxFileSize
    };
  }
  if (!force && xmppHttpUploadDiscoveryInFlight.has(cacheKey)) {
    return xmppHttpUploadDiscoveryInFlight.get(cacheKey);
  }
  const task = (async () => {
    const candidates = new Set([domain, `upload.${domain}`]);
    try {
      const itemsStanza = await xmppSendIqPromise(
        connection,
        globalThis.$iq({ type: "get", to: domain }).c("query", { xmlns: "http://jabber.org/protocol/disco#items" }),
        7000
      );
      [...itemsStanza.getElementsByTagName("item")].forEach((node) => {
        const jid = xmppBareJid(node.getAttribute("jid") || "");
        if (jid) candidates.add(jid);
      });
    } catch {
      // Domain-level item discovery is optional; continue with known candidates.
    }
    const ordered = [...candidates]
      .map((jid) => xmppBareJid(jid))
      .filter(Boolean);
    for (const jid of ordered) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const info = await xmppFetchDiscoInfo(jid, connection);
        const namespace = info.features.has(XMPP_HTTP_UPLOAD_NAMESPACE)
          ? XMPP_HTTP_UPLOAD_NAMESPACE
          : (info.features.has(XMPP_HTTP_UPLOAD_LEGACY_NAMESPACE) ? XMPP_HTTP_UPLOAD_LEGACY_NAMESPACE : "");
        if (!namespace) continue;
        return {
          serviceJid: jid,
          namespace,
          maxFileSize: Math.max(0, Number(info.maxFileSize) || 0)
        };
      } catch {
        // Try next candidate.
      }
    }
    return null;
  })()
    .then((result) => {
      const ttl = result
        ? XMPP_HTTP_UPLOAD_DISCOVERY_TTL_MS
        : Math.max(90_000, Math.floor(XMPP_HTTP_UPLOAD_DISCOVERY_TTL_MS / 4));
      xmppHttpUploadServiceCache.set(cacheKey, {
        serviceJid: result?.serviceJid || "",
        namespace: result?.namespace || "",
        maxFileSize: result?.maxFileSize || 0,
        expiresAt: Date.now() + ttl
      });
      return result;
    })
    .finally(() => {
      xmppHttpUploadDiscoveryInFlight.delete(cacheKey);
    });
  xmppHttpUploadDiscoveryInFlight.set(cacheKey, task);
  return task;
}

function xmppAttachmentDefaultExtension(type = "", mime = "", currentName = "") {
  const normalizedType = (type || "").toString().toLowerCase();
  const normalizedMime = (mime || "").toString().toLowerCase();
  const normalizedName = (currentName || "").toString().toLowerCase();
  if (/\.[a-z0-9]{1,12}$/i.test(normalizedName)) return "";
  if (normalizedType === "pdf" || normalizedMime.includes("pdf")) return "pdf";
  if (normalizedType === "svg" || normalizedMime.includes("svg")) return "svg";
  if (normalizedType === "swf" || normalizedMime.includes("shockwave-flash")) return "swf";
  if (normalizedType === "audio") return "mp3";
  if (normalizedType === "video") return "mp4";
  if (normalizedType === "text" || normalizedType === "rtf" || normalizedMime.startsWith("text/")) return "txt";
  if (normalizedType === "odf") return "odt";
  if (normalizedType === "html" || normalizedMime.includes("html")) return "html";
  if (normalizedType === "bin") return "bin";
  if (normalizedType === "gif" || normalizedType === "sticker") return "png";
  return "bin";
}

function xmppAttachmentDefaultMimeType(type = "", format = "", fallbackName = "") {
  const normalizedType = (type || "").toString().toLowerCase();
  const normalizedFormat = (format || "").toString().toLowerCase();
  const lowerName = (fallbackName || "").toString().toLowerCase();
  if (normalizedType === "pdf" || /\.pdf$/i.test(lowerName)) return "application/pdf";
  if (normalizedType === "svg" || /\.svg$/i.test(lowerName)) return "image/svg+xml";
  if (normalizedType === "swf" || /\.swf$/i.test(lowerName)) return "application/x-shockwave-flash";
  if (normalizedType === "audio") return "audio/mpeg";
  if (normalizedType === "video") return inferVideoMimeType(lowerName) || "video/mp4";
  if (normalizedType === "text") return "text/plain";
  if (normalizedType === "rtf") return "application/rtf";
  if (normalizedType === "odf") return "application/vnd.oasis.opendocument.text";
  if (normalizedType === "html") return "text/html";
  if (normalizedType === "bin") return "application/octet-stream";
  if (normalizedType === "sticker" && normalizedFormat === "dotlottie") return "application/zip";
  return "image/png";
}

function xmppSafeUploadFileName(name = "", type = "", mime = "") {
  const raw = (name || "").toString().trim().slice(0, 120);
  const cleanedBase = (raw || `${type || "attachment"}-${Date.now().toString(36)}`)
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, " ")
    .replace(/^\.+/, "")
    .trim()
    .slice(0, 100) || `attachment-${Date.now().toString(36)}`;
  const ext = xmppAttachmentDefaultExtension(type, mime, cleanedBase);
  return ext && !/\.[a-z0-9]{1,12}$/i.test(cleanedBase)
    ? `${cleanedBase}.${ext}`
    : cleanedBase;
}

function xmppIsLocalHttpUrl(url = "") {
  const raw = (url || "").toString().trim();
  if (!raw) return false;
  try {
    const parsed = new URL(raw, window.location.href);
    if (!/^https?:$/.test(parsed.protocol)) return false;
    const host = (parsed.hostname || "").toLowerCase();
    return host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0" || host === "::1";
  } catch {
    return false;
  }
}

async function xmppAttachmentPayloadFromEntry(entry) {
  const sourceUrl = resolveMediaUrl((entry?.url || "").toString().trim());
  if (!sourceUrl) return null;
  if (/^https?:\/\//i.test(sourceUrl) && !xmppIsLocalHttpUrl(sourceUrl)) return null;
  const response = await fetch(sourceUrl, { cache: "no-store" });
  if (!response.ok) throw new Error(`Attachment fetch failed (${response.status})`);
  const blob = await response.blob();
  const fallbackMime = xmppAttachmentDefaultMimeType(entry?.type || "", entry?.format || "", entry?.name || sourceUrl);
  const contentType = (blob.type || fallbackMime || "application/octet-stream").toString();
  const fileName = xmppSafeUploadFileName(entry?.name || "", entry?.type || "", contentType);
  return {
    blob,
    size: Number(blob.size) || 0,
    contentType,
    fileName
  };
}

async function xmppHttpUploadRequestSlot(serviceInfo, payload, connection = xmppConnection) {
  if (!serviceInfo?.serviceJid || !serviceInfo.namespace || !payload) throw new Error("Missing upload slot request data");
  if (!globalThis.$iq) throw new Error("XMPP IQ builder unavailable");
  const requestAttrs = {
    xmlns: serviceInfo.namespace,
    filename: payload.fileName,
    size: String(Math.max(0, Math.floor(Number(payload.size) || 0)))
  };
  if (payload.contentType) requestAttrs["content-type"] = payload.contentType;
  const slotStanza = await xmppSendIqPromise(
    connection,
    globalThis.$iq({ type: "get", to: serviceInfo.serviceJid }).c("request", requestAttrs),
    XMPP_HTTP_UPLOAD_SLOT_TIMEOUT_MS
  );
  const slotNode = [...slotStanza.getElementsByTagName("slot")]
    .find((node) => xmppNodeHasXmlns(node, serviceInfo.namespace))
    || slotStanza.getElementsByTagName("slot")[0]
    || null;
  const putNode = slotNode ? slotNode.getElementsByTagName("put")[0] : null;
  const getNode = slotNode ? slotNode.getElementsByTagName("get")[0] : null;
  const putUrl = (putNode?.getAttribute("url") || "").toString().trim();
  const getUrl = (getNode?.getAttribute("url") || "").toString().trim();
  if (!/^https?:\/\//i.test(putUrl) || !/^https?:\/\//i.test(getUrl)) {
    throw new Error("XMPP upload slot missing PUT/GET URLs");
  }
  const headers = {};
  if (putNode) {
    [...putNode.getElementsByTagName("header")].forEach((node) => {
      const name = (node.getAttribute("name") || "").toString().trim();
      const value = xmppNodeText(node).trim();
      if (!name || !value || headers[name]) return;
      headers[name] = value;
    });
  }
  return { putUrl, getUrl, headers };
}

async function xmppHttpUploadPutFile(slot, payload) {
  if (!slot?.putUrl || !payload?.blob) throw new Error("Missing upload PUT payload");
  const headers = {};
  Object.entries(slot.headers || {}).forEach(([name, value]) => {
    const safeName = (name || "").toString().trim();
    const safeValue = (value || "").toString().trim();
    if (!safeName || !safeValue) return;
    const lower = safeName.toLowerCase();
    if (["host", "origin", "content-length", "cookie"].includes(lower)) return;
    headers[safeName] = safeValue;
  });
  if (!Object.keys(headers).some((key) => key.toLowerCase() === "content-type") && payload.contentType) {
    headers["Content-Type"] = payload.contentType;
  }
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), XMPP_HTTP_UPLOAD_PUT_TIMEOUT_MS);
  try {
    const response = await fetch(slot.putUrl, {
      method: "PUT",
      headers,
      body: payload.blob,
      signal: controller.signal
    });
    if (response.type === "opaque") return true;
    if (!response.ok) throw new Error(`Upload PUT failed (${response.status})`);
    return true;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function encryptAttachmentForOmemo(payload) {
  return encryptBlobForAesgcm(payload?.blob);
}

async function xmppOmemoEncryptAndUploadAttachments(message, { conversationId = "" } = {}) {
  const currentAttachments = normalizeAttachments(message?.attachments);
  if (currentAttachments.length === 0) return { attachments: [], urls: [], failed: 0 };
  const serviceInfo = await discoverXmppHttpUploadService();
  if (!serviceInfo) {
    addXmppDebugEvent("message", "OMEMO HTTP upload unavailable", {
      localAttachmentCount: relayUnshareableAttachmentCount(currentAttachments)
    });
    return { attachments: [], urls: [], failed: currentAttachments.length };
  }
  const maxByService = Math.max(0, Number(serviceInfo.maxFileSize) || 0);
  const hardLimit = maxByService > 0
    ? Math.min(XMPP_HTTP_UPLOAD_MAX_BYTES, maxByService)
    : XMPP_HTTP_UPLOAD_MAX_BYTES;
  const encryptedAttachments = [];
  const aesgcmUrls = [];
  let failedCount = 0;
  for (const entry of currentAttachments) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const payload = await xmppAttachmentPayloadFromEntry(entry);
      if (!payload) {
        failedCount += 1;
        continue;
      }
      if (payload.size <= 0 || payload.size > hardLimit) {
        failedCount += 1;
        addXmppDebugEvent("warn", "Skipped OMEMO attachment size limit", {
          name: entry?.name || "",
          bytes: payload.size,
          hardLimit
        });
        continue;
      }
      // eslint-disable-next-line no-await-in-loop
      const encrypted = await encryptAttachmentForOmemo(payload);
      // eslint-disable-next-line no-await-in-loop
      const slot = await xmppHttpUploadRequestSlot(serviceInfo, {
        fileName: payload.fileName,
        contentType: "application/octet-stream",
        size: encrypted.encryptedBlob.size,
        blob: encrypted.encryptedBlob
      });
      // eslint-disable-next-line no-await-in-loop
      await xmppHttpUploadPutFile(slot, {
        blob: encrypted.encryptedBlob,
        contentType: "application/octet-stream"
      });
      const aesgcmUrl = buildAesgcmUrl(slot.getUrl, encrypted.ivBytes, encrypted.keyBytes);
      if (!aesgcmUrl) {
        failedCount += 1;
        continue;
      }
      aesgcmUrls.push(aesgcmUrl);
      encryptedAttachments.push({
        type: "file",
        url: aesgcmUrl,
        name: payload.fileName,
        format: "aesgcm"
      });
    } catch (error) {
      failedCount += 1;
      addXmppDebugEvent("error", "OMEMO attachment encryption failed", {
        name: entry?.name || "",
        error: String(error?.message || error)
      });
    }
  }
  if (encryptedAttachments.length > 0 && message && typeof message === "object") {
    message.attachments = normalizeAttachments(encryptedAttachments);
    saveState();
    const activeConversation = getActiveConversation();
    if (conversationId && activeConversation?.id === conversationId) renderMessages();
  }
  return { attachments: encryptedAttachments, urls: aesgcmUrls, failed: failedCount };
}

function attachmentSignatureForXmppUpload(attachments) {
  return normalizeAttachments(attachments)
    .map((entry) => `${entry.type}|${entry.url}|${entry.name}|${entry.format}`)
    .join("||");
}

async function xmppPrepareMessageAttachmentsForUpload(message, { conversationId = "" } = {}) {
  const currentAttachments = normalizeAttachments(message?.attachments);
  if (currentAttachments.length === 0) return currentAttachments;
  const hasLocal = currentAttachments.some((entry) => !normalizeRelayTransportAttachmentUrl(entry?.url || ""));
  if (!hasLocal) return currentAttachments;
  const serviceInfo = await discoverXmppHttpUploadService();
  if (!serviceInfo) {
    addXmppDebugEvent("message", "XMPP HTTP upload unavailable; sending local attachment notice only", {
      localAttachmentCount: relayUnshareableAttachmentCount(currentAttachments)
    });
    return currentAttachments;
  }
  const maxByService = Math.max(0, Number(serviceInfo.maxFileSize) || 0);
  const hardLimit = maxByService > 0
    ? Math.min(XMPP_HTTP_UPLOAD_MAX_BYTES, maxByService)
    : XMPP_HTTP_UPLOAD_MAX_BYTES;
  const updated = [];
  let uploadedCount = 0;
  let failedCount = 0;
  for (const entry of currentAttachments) {
    const remoteUrl = normalizeRelayTransportAttachmentUrl(entry?.url || "");
    if (remoteUrl) {
      updated.push(entry);
      continue;
    }
    try {
      // eslint-disable-next-line no-await-in-loop
      const payload = await xmppAttachmentPayloadFromEntry(entry);
      if (!payload) {
        updated.push(entry);
        continue;
      }
      if (payload.size <= 0 || payload.size > hardLimit) {
        failedCount += 1;
        updated.push(entry);
        addXmppDebugEvent("warn", "Skipped XMPP HTTP upload for attachment size limit", {
          name: entry?.name || "",
          bytes: payload.size,
          hardLimit
        });
        continue;
      }
      // eslint-disable-next-line no-await-in-loop
      const slot = await xmppHttpUploadRequestSlot(serviceInfo, payload);
      // eslint-disable-next-line no-await-in-loop
      await xmppHttpUploadPutFile(slot, payload);
      const inferredType = inferAttachmentTypeFromUrl(slot.getUrl) || "file";
      const uploadedType = inferredType === "file"
        ? ((entry?.type || "").toString().trim().toLowerCase() || "file")
        : inferredType;
      updated.push({
        type: uploadedType,
        url: slot.getUrl,
        name: payload.fileName,
        format: entry.format || inferAttachmentFormat(uploadedType, slot.getUrl),
        mime: (payload.contentType || entry?.mime || "").toString().trim().toLowerCase().slice(0, 120)
      });
      uploadedCount += 1;
    } catch (error) {
      failedCount += 1;
      updated.push(entry);
      addXmppDebugEvent("error", "XMPP HTTP upload failed for attachment", {
        name: entry?.name || "",
        error: String(error?.message || error)
      });
    }
  }
  const normalizedUpdated = normalizeAttachments(updated);
  const changed = attachmentSignatureForXmppUpload(normalizedUpdated) !== attachmentSignatureForXmppUpload(currentAttachments);
  if (changed && message && typeof message === "object") {
    message.attachments = normalizedUpdated;
    saveState();
    const activeConversation = getActiveConversation();
    if (conversationId && activeConversation?.id === conversationId) renderMessages();
  }
  if (uploadedCount > 0) {
    if (failedCount > 0) {
      showToast(`${uploadedCount} attachment${uploadedCount === 1 ? "" : "s"} uploaded over XMPP (${failedCount} failed).`, { tone: "info" });
    } else {
      showToast(uploadedCount === 1 ? "Attachment uploaded over XMPP." : `${uploadedCount} attachments uploaded over XMPP.`, { tone: "info" });
    }
  }
  return normalizedUpdated;
}

function publishXmppMessageReaction(conversation, message, account) {
  const prefs = getPreferences();
  if (prefs.relayMode !== "xmpp" || relayStatus !== "connected" || !xmppConnection || !globalThis.$msg) {
    return { ok: false, reason: "xmpp-offline" };
  }
  if (!conversation || !message || !account?.id) return { ok: false, reason: "invalid-args" };
  const targetRefId = preferredXmppReferenceIdForConversationMessage(conversation, message);
  if (!targetRefId) return { ok: false, reason: "missing-reference" };
  const emojiSet = xmppReactionEmojisForActor(message, account.id);
  const reactionStanzaId = `s67-react-${createId().slice(0, 12)}`;
  const reactionOriginId = `s67-origin-${createId().slice(0, 12)}`;
  if (conversation.type === "dm" && conversation.thread) {
    const peerJid = xmppPeerJidForDmThread(conversation.thread, account);
    const dmRoom = relayRoomForDmThread(conversation.thread);
    const roomJid = xmppRoomJidForToken(dmRoom, prefs);
    if (peerJid) {
      const stanza = globalThis.$msg({ to: peerJid, type: "chat", id: reactionStanzaId });
      appendXmppReactionsNode(stanza, targetRefId, emojiSet);
      appendXmppOriginIdNode(stanza, reactionOriginId);
      appendXmppMessageProcessingHints(stanza, { encrypted: false, preferStore: true });
      xmppConnection.send(stanza);
      rememberXmppLocalSentRefs([reactionStanzaId, reactionOriginId]);
      message.xmppRefIds = normalizeXmppRefIdsList([
        ...(Array.isArray(message.xmppRefIds) ? message.xmppRefIds : []),
        targetRefId,
        reactionStanzaId,
        reactionOriginId
      ]);
      rememberXmppDmMessage(peerJid, reactionStanzaId, message);
      rememberXmppDmMessage(peerJid, reactionOriginId, message);
      addXmppDebugEvent("message", "Sent XMPP message reactions", {
        scope: "dm",
        to: peerJid,
        targetId: targetRefId,
        emojis: emojiSet,
        id: reactionStanzaId,
        originId: reactionOriginId
      });
      return { ok: true, id: reactionStanzaId, targetId: targetRefId };
    }
    if (roomJid) {
      const stanza = globalThis.$msg({ to: roomJid, type: "groupchat", id: reactionStanzaId });
      appendXmppReactionsNode(stanza, targetRefId, emojiSet);
      appendXmppOriginIdNode(stanza, reactionOriginId);
      appendXmppMessageProcessingHints(stanza, { encrypted: false, preferStore: true });
      xmppConnection.send(stanza);
      rememberXmppLocalSentRefs([reactionStanzaId, reactionOriginId]);
      message.xmppRefIds = normalizeXmppRefIdsList([
        ...(Array.isArray(message.xmppRefIds) ? message.xmppRefIds : []),
        targetRefId,
        reactionStanzaId,
        reactionOriginId
      ]);
      rememberXmppRoomMessage(roomJid, reactionStanzaId, message);
      rememberXmppRoomMessage(roomJid, reactionOriginId, message);
      addXmppDebugEvent("message", "Sent XMPP message reactions", {
        scope: "dm-room",
        to: roomJid,
        targetId: targetRefId,
        emojis: emojiSet,
        id: reactionStanzaId,
        originId: reactionOriginId
      });
      return { ok: true, id: reactionStanzaId, targetId: targetRefId };
    }
    return { ok: false, reason: "missing-dm-target" };
  }
  if (conversation.type === "channel" && conversation.channel) {
    if (!isXmppBackedChannel(conversation.channel)) return { ok: false, reason: "not-xmpp-channel" };
    let roomJid = xmppBareJid(conversation.channel.xmppRoomJid || "");
    if (!roomJid) {
      const roomToken = (conversation.channel.relayRoomToken || "").toString().trim();
      roomJid = xmppRoomJidForToken(roomToken || relayRoomForActiveConversation(), prefs);
    }
    if (!roomJid) return { ok: false, reason: "missing-room-target" };
    const stanza = globalThis.$msg({ to: roomJid, type: "groupchat", id: reactionStanzaId });
    appendXmppReactionsNode(stanza, targetRefId, emojiSet);
    appendXmppOriginIdNode(stanza, reactionOriginId);
    appendXmppMessageProcessingHints(stanza, { encrypted: false, preferStore: true });
    xmppConnection.send(stanza);
    rememberXmppLocalSentRefs([reactionStanzaId, reactionOriginId]);
    message.xmppRefIds = normalizeXmppRefIdsList([
      ...(Array.isArray(message.xmppRefIds) ? message.xmppRefIds : []),
      targetRefId,
      reactionStanzaId,
      reactionOriginId
    ]);
    rememberXmppRoomMessage(roomJid, reactionStanzaId, message);
    rememberXmppRoomMessage(roomJid, reactionOriginId, message);
    addXmppDebugEvent("message", "Sent XMPP message reactions", {
      scope: "muc",
      to: roomJid,
      targetId: targetRefId,
      emojis: emojiSet,
      id: reactionStanzaId,
      originId: reactionOriginId
    });
    return { ok: true, id: reactionStanzaId, targetId: targetRefId };
  }
  return { ok: false, reason: "unsupported-conversation" };
}

function publishXmppMessageCorrection(conversation, message, account) {
  const prefs = getPreferences();
  if (prefs.relayMode !== "xmpp" || relayStatus !== "connected" || !xmppConnection || !globalThis.$msg) {
    return { ok: false, reason: "xmpp-offline" };
  }
  if (!conversation || !message || !account) return { ok: false, reason: "invalid-args" };
  if ((message.userId || "") !== account.id) return { ok: false, reason: "not-author" };
  const targetRefId = preferredXmppReferenceIdForConversationMessage(conversation, message);
  if (!targetRefId) return { ok: false, reason: "missing-reference" };
  const correctionStanzaId = `s67-edit-${createId().slice(0, 12)}`;
  const correctionOriginId = `s67-origin-${createId().slice(0, 12)}`;
  if (conversation.type === "dm" && conversation.thread) {
    const peerJid = xmppPeerJidForDmThread(conversation.thread, account);
    const dmRoom = relayRoomForDmThread(conversation.thread);
    const roomJid = xmppRoomJidForToken(dmRoom, prefs);
    if (peerJid) {
      const replyMeta = resolveXmppReplyMetaForDm(conversation.thread, message, account, peerJid);
      const bodyPayload = buildXmppMessageBody(message, replyMeta);
      if (!(bodyPayload.body || "").trim()) return { ok: false, reason: "empty-body" };
      const xmppAttachments = xmppShareableAttachmentsForStanza(message);
      const stanza = globalThis.$msg({ to: peerJid, type: "chat", id: correctionStanzaId })
        .c("body").t(bodyPayload.body);
      appendXmppReplyNodes(stanza, replyMeta, bodyPayload.fallbackPrefixLength);
      appendXmppMessageReplaceNode(stanza, targetRefId);
      appendXmppOriginIdNode(stanza, correctionOriginId);
      appendXmppMessageProcessingHints(stanza, { encrypted: false, preferStore: true });
      appendXmppAttachmentMetadataNodes(stanza, xmppAttachments);
      appendXmppChatMarkableNode(stanza);
      appendXmppReceiptRequestNode(stanza);
      xmppConnection.send(stanza);
      rememberXmppLocalSentRefs([correctionStanzaId, correctionOriginId]);
      rememberXmppPendingReceipt(correctionStanzaId, conversation.thread, message, peerJid);
      message.xmppRefIds = normalizeXmppRefIdsList([
        ...(Array.isArray(message.xmppRefIds) ? message.xmppRefIds : []),
        targetRefId,
        correctionStanzaId,
        correctionOriginId
      ]);
      rememberXmppDmMessage(peerJid, correctionStanzaId, message);
      rememberXmppDmMessage(peerJid, correctionOriginId, message);
      addXmppDebugEvent("message", "Sent XMPP message correction", {
        scope: "dm",
        to: peerJid,
        replaceId: targetRefId,
        id: correctionStanzaId,
        originId: correctionOriginId
      });
      return { ok: true, id: correctionStanzaId, targetId: targetRefId };
    }
    if (roomJid) {
      const replyMeta = resolveXmppReplyMetaForRoom(conversation.thread, message, roomJid);
      const bodyPayload = buildXmppMessageBody(message, replyMeta);
      if (!(bodyPayload.body || "").trim()) return { ok: false, reason: "empty-body" };
      const xmppAttachments = xmppShareableAttachmentsForStanza(message);
      const stanza = globalThis.$msg({ to: roomJid, type: "groupchat", id: correctionStanzaId })
        .c("body").t(bodyPayload.body);
      appendXmppReplyNodes(stanza, replyMeta, bodyPayload.fallbackPrefixLength);
      appendXmppMessageReplaceNode(stanza, targetRefId);
      appendXmppOriginIdNode(stanza, correctionOriginId);
      appendXmppMessageProcessingHints(stanza, { encrypted: false, preferStore: true });
      appendXmppAttachmentMetadataNodes(stanza, xmppAttachments);
      xmppConnection.send(stanza);
      rememberXmppLocalSentRefs([correctionStanzaId, correctionOriginId]);
      message.xmppStanzaId = correctionStanzaId;
      message.xmppRefIds = normalizeXmppRefIdsList([
        ...(Array.isArray(message.xmppRefIds) ? message.xmppRefIds : []),
        targetRefId,
        correctionStanzaId,
        correctionOriginId
      ]);
      rememberXmppRoomMessage(roomJid, correctionStanzaId, message);
      rememberXmppRoomMessage(roomJid, correctionOriginId, message);
      addXmppDebugEvent("message", "Sent XMPP message correction", {
        scope: "dm-room",
        to: roomJid,
        replaceId: targetRefId,
        id: correctionStanzaId,
        originId: correctionOriginId
      });
      return { ok: true, id: correctionStanzaId, targetId: targetRefId };
    }
    return { ok: false, reason: "missing-dm-target" };
  }
  if (conversation.type === "channel" && conversation.channel) {
    if (!isXmppBackedChannel(conversation.channel)) return { ok: false, reason: "not-xmpp-channel" };
    let roomJid = xmppBareJid(conversation.channel.xmppRoomJid || "");
    if (!roomJid) {
      const roomToken = (conversation.channel.relayRoomToken || "").toString().trim();
      roomJid = xmppRoomJidForToken(roomToken || relayRoomForActiveConversation(), prefs);
    }
    if (!roomJid) return { ok: false, reason: "missing-room-target" };
    const replyMeta = resolveXmppReplyMetaForRoom(conversation.channel, message, roomJid);
    const bodyPayload = buildXmppMessageBody(message, replyMeta);
    if (!(bodyPayload.body || "").trim()) return { ok: false, reason: "empty-body" };
    const xmppAttachments = xmppShareableAttachmentsForStanza(message);
    const stanza = globalThis.$msg({ to: roomJid, type: "groupchat", id: correctionStanzaId })
      .c("body").t(bodyPayload.body);
    appendXmppReplyNodes(stanza, replyMeta, bodyPayload.fallbackPrefixLength);
    appendXmppMessageReplaceNode(stanza, targetRefId);
    appendXmppOriginIdNode(stanza, correctionOriginId);
    appendXmppMessageProcessingHints(stanza, { encrypted: false, preferStore: true });
    appendXmppAttachmentMetadataNodes(stanza, xmppAttachments);
    xmppConnection.send(stanza);
    rememberXmppLocalSentRefs([correctionStanzaId, correctionOriginId]);
    message.xmppStanzaId = correctionStanzaId;
    message.xmppRefIds = normalizeXmppRefIdsList([
      ...(Array.isArray(message.xmppRefIds) ? message.xmppRefIds : []),
      targetRefId,
      correctionStanzaId,
      correctionOriginId
    ]);
    rememberXmppRoomMessage(roomJid, correctionStanzaId, message);
    rememberXmppRoomMessage(roomJid, correctionOriginId, message);
    addXmppDebugEvent("message", "Sent XMPP message correction", {
      scope: "muc",
      to: roomJid,
      replaceId: targetRefId,
      id: correctionStanzaId,
      originId: correctionOriginId
    });
    return { ok: true, id: correctionStanzaId, targetId: targetRefId };
  }
  return { ok: false, reason: "unsupported-conversation" };
}

function publishRelayChannelMessage(channel, message, account) {
  const prefs = getPreferences();
  if (!["local", "ws", "http", "xmpp"].includes(prefs.relayMode)) return false;
  if (!channel || !message || !account) return false;
  const guild = getActiveGuild();
  const room = relayRoomForActiveConversation();
  if (!room) return false;
  if (prefs.relayMode === "local") {
    return sendLocalRelayPacket({
      type: "chat",
      room,
      clientId: ensureLocalRelayClientId(),
      guildName: guild?.name || "",
      channelName: channel.name || "",
      message: {
        id: message.id,
        text: relayTransportPacketText(message),
        ts: message.ts || new Date().toISOString(),
        authorUsername: account.username,
        authorDisplay: displayNameForAccount(account, guild?.id || null),
        attachments: relayTransportAttachments(message.attachments, { limit: 4, urlMax: 640 })
      }
    });
  }
  if (prefs.relayMode === "xmpp") {
    if (!xmppConnection) return false;
    if (relayStatus !== "connected") return false;
    const roomJid = xmppRoomJidForToken(room, prefs);
    if (!roomJid) {
      setRelayStatus("error", "XMPP MUC service not configured.");
      return false;
    }
    joinXmppRoom(room, account);
    void (async () => {
      if (!xmppConnection || relayStatus !== "connected") return;
      const roomBare = xmppBareJid(roomJid);
      const omemoEnabled = roomBare ? xmppOmemoEnabledForPeer(roomBare, prefs) : false;
      let omemoAttachmentUrls = [];
      if (omemoEnabled && roomBare) {
        const omemoAttachments = await xmppOmemoEncryptAndUploadAttachments(message, { conversationId: channel.id || "" });
        omemoAttachmentUrls = omemoAttachments.urls || [];
        if (normalizeAttachments(message.attachments).length > 0 && omemoAttachmentUrls.length === 0) {
          showToast("OMEMO attachment encryption failed. Message not sent.", { tone: "error" });
          return;
        }
      } else {
        await xmppPrepareMessageAttachmentsForUpload(message, { conversationId: channel.id || "" });
        if (!xmppConnection || relayStatus !== "connected") return;
      }
      const replyMeta = resolveXmppReplyMetaForRoom(channel, message, roomJid);
      const bodyPayload = buildXmppMessageBody(message, replyMeta);
      let baseBody = (bodyPayload.body || "").trim();
      if (!baseBody && omemoAttachmentUrls.length === 0) return;
      if (omemoEnabled && omemoAttachmentUrls.length > 0 && baseBody) {
        showToast("OMEMO attachments must be sent without extra text. Text was not sent.", { tone: "error" });
        baseBody = "";
        message.text = "";
      }
      const omemoBody = omemoAttachmentUrls.length > 0
        ? omemoAttachmentUrls.join("\n")
        : baseBody;
      const stanzaId = `s67-${createId().slice(0, 12)}`;
      const originId = `s67-origin-${createId().slice(0, 12)}`;
      const stanza = globalThis.$msg({ to: roomJid, type: "groupchat", id: stanzaId })
        .c("body")
        .t(omemoEnabled ? "This message is encrypted with OMEMO." : baseBody);
      appendXmppReplyNodes(stanza, replyMeta, bodyPayload.fallbackPrefixLength);
      appendXmppOriginIdNode(stanza, originId);
      appendXmppMessageProcessingHints(stanza, { encrypted: omemoEnabled, preferStore: !omemoEnabled });
      if (omemoEnabled && roomBare) {
        const ownBare = xmppBareJid(prefs.xmppJid || "");
        if (ownBare) {
          await xmppOmemoEnsureOwnBundle(ownBare);
          const occupantMap = xmppOccupantsByRoomJid.get(roomBare);
          const recipientJids = occupantMap
            ? [...occupantMap.values()].map((entry) => xmppBareJid(entry?.jid || "")).filter(Boolean)
            : [];
          if (recipientJids.length === 0) {
            showToast("OMEMO groupchat requires real JIDs (non-anonymous room).", { tone: "error" });
            return;
          }
          const refreshOmemoSessions = async () => {
            await xmppOmemoEnsureOwnBundle(ownBare, { force: true });
            for (const recipientJid of recipientJids) {
              // eslint-disable-next-line no-await-in-loop
              await xmppOmemoFetchDeviceList(recipientJid);
              // eslint-disable-next-line no-await-in-loop
              await xmppOmemoEnsurePeerSessions(recipientJid, ownBare);
            }
          };
          const omemoNamespace = xmppOmemoNamespaceForSend(recipientJids);
          let encryptedPayload = await xmppOmemoEncryptMessageForPeers(recipientJids, omemoBody, ownBare);
          if (!encryptedPayload) {
            await refreshOmemoSessions();
            encryptedPayload = await xmppOmemoEncryptMessageForPeers(recipientJids, omemoBody, ownBare);
            if (!encryptedPayload) {
              showToast("OMEMO groupchat encryption failed.", { tone: "error" });
              return;
            }
          }
          appendXmppOmemoEncryptedNode(stanza, encryptedPayload, { namespace: omemoNamespace });
          appendXmppEmeNode(stanza, { namespace: omemoNamespace, name: "OMEMO" });
          message.xmppEncrypted = true;
          message.xmppEncryptedType = omemoNamespace === XMPP_OMEMO_NAMESPACE_V2 ? "omemo2" : "omemo";
          message.xmppEncryptedLabel = "OMEMO";
          saveState();
        }
      } else {
        appendXmppAttachmentMetadataNodes(stanza, xmppShareableAttachmentsForStanza(message));
      }
      xmppConnection.send(stanza);
      rememberXmppLocalSentRefs([stanzaId, originId]);
      message.xmppStanzaId = stanzaId;
      message.xmppRefIds = normalizeXmppRefIdsList([
        ...(Array.isArray(message.xmppRefIds) ? message.xmppRefIds : []),
        stanzaId,
        originId
      ]);
      rememberXmppRoomMessage(roomJid, stanzaId, message);
      rememberXmppRoomMessage(roomJid, originId, message);
    })().catch((error) => {
      addXmppDebugEvent("error", "Failed to publish XMPP room message", {
        roomJid,
        error: String(error?.message || error)
      });
    });
    return true;
  }
  if (prefs.relayMode === "http") {
    const endpoint = new URL(normalizeRelayUrl(prefs.relayUrl).replace(/^ws:/i, "http:").replace(/^wss:/i, "https:"));
    endpoint.pathname = "/chat";
    const payload = {
      type: "chat",
      room,
      clientId: relayClientId(),
      guildName: guild?.name || "",
      channelName: channel.name || "",
      message: {
        id: message.id,
        text: relayTransportPacketText(message),
        ts: message.ts || new Date().toISOString(),
        authorUsername: account.username,
        authorDisplay: displayNameForAccount(account, guild?.id || null),
        attachments: relayTransportAttachments(message.attachments, { limit: 4, urlMax: 640 })
      }
    };
    fetch(endpoint.toString(), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    }).catch(() => {
      setRelayStatus("error", "HTTP relay post failed");
    });
    return true;
  }
  if (!relaySocket || relaySocket.readyState !== WebSocket.OPEN) return false;
  if (relayJoinedRoom !== room) joinRelayRoom(room);
  return sendRelayPacket({
    type: "chat",
    room,
    clientId: relayClientId(),
    guildName: guild?.name || "",
    channelName: channel.name || "",
    message: {
      id: message.id,
      text: relayTransportPacketText(message),
      ts: message.ts || new Date().toISOString(),
      authorUsername: account.username,
      authorDisplay: displayNameForAccount(account, guild?.id || null),
      attachments: relayTransportAttachments(message.attachments, { limit: 4, urlMax: 640 })
    }
  });
}

function publishRelayDirectMessage(thread, message, account) {
  const prefs = getPreferences();
  if (!["local", "ws", "http", "xmpp"].includes(prefs.relayMode)) return false;
  if (!thread || !message || !account) return false;
  const room = relayRoomForDmThread(thread);
  if (!room) return false;
  if (prefs.relayMode === "local") {
    return sendLocalRelayPacket({
      type: "chat",
      room,
      clientId: ensureLocalRelayClientId(),
      guildName: "",
      channelName: "dm",
      message: {
        id: message.id,
        text: relayTransportPacketText(message),
        ts: message.ts || new Date().toISOString(),
        authorUsername: account.username,
        authorDisplay: account.displayName || account.username,
        attachments: relayTransportAttachments(message.attachments, { limit: 4, urlMax: 640 })
      }
    });
  }
  if (prefs.relayMode === "xmpp") {
    if (!xmppConnection) return false;
    if (relayStatus !== "connected") return false;
    const peerJid = xmppPeerJidForDmThread(thread, account);
    const roomJid = xmppRoomJidForToken(room, prefs);
    if (!peerJid && !roomJid) {
      setRelayStatus("error", "XMPP MUC service not configured.");
      return false;
    }
    void (async () => {
      if (!xmppConnection || relayStatus !== "connected") return;
      if (peerJid) {
        const peerBare = xmppBareJid(peerJid);
        const omemoEnabled = peerBare ? xmppOmemoEnabledForPeer(peerBare, prefs) : false;
        const hasAttachments = normalizeAttachments(message.attachments).length > 0;
        let omemoAttachmentUrls = [];
        if (omemoEnabled && hasAttachments) {
          const omemoAttachments = await xmppOmemoEncryptAndUploadAttachments(message, { conversationId: thread.id || "" });
          omemoAttachmentUrls = omemoAttachments.urls || [];
          if (omemoAttachmentUrls.length === 0) {
            showToast("OMEMO attachment encryption failed. Message not sent.", { tone: "error" });
            if (peerBare && addSystemDmMessageByPeerJid(peerBare, "OMEMO attachment encryption failed; message was not sent.")) {
              refreshDmUiForPeerJid(peerBare);
            }
            return;
          }
        }
        if (!omemoEnabled) {
          await xmppPrepareMessageAttachmentsForUpload(message, { conversationId: thread.id || "" });
          if (!xmppConnection || relayStatus !== "connected") return;
        }
        const stanzaId = `s67-${createId().slice(0, 12)}`;
        const originId = `s67-origin-${createId().slice(0, 12)}`;
        const replyMeta = resolveXmppReplyMetaForDm(thread, message, account, peerJid);
        const bodyPayload = buildXmppMessageBody(message, replyMeta);
        let baseBody = (bodyPayload.body || "").trim();
        if (!baseBody && omemoAttachmentUrls.length === 0) return;
        if (omemoEnabled && omemoAttachmentUrls.length > 0 && baseBody) {
          showToast("OMEMO attachments must be sent without extra text. Text was not sent.", { tone: "error" });
          baseBody = "";
          message.text = "";
        }
        const omemoBody = omemoAttachmentUrls.length > 0
          ? omemoAttachmentUrls.join("\n")
          : baseBody;
        const stanza = globalThis.$msg({ to: peerJid, type: "chat", id: stanzaId });
        stanza.c("body").t(omemoEnabled ? "This message is encrypted with OMEMO." : baseBody).up();
        appendXmppReplyNodes(stanza, replyMeta, bodyPayload.fallbackPrefixLength);
        appendXmppOriginIdNode(stanza, originId);
        appendXmppMessageProcessingHints(stanza, { encrypted: omemoEnabled, preferStore: !omemoEnabled });
        if (omemoEnabled) {
          const ownBare = xmppBareJid(prefs.xmppJid || "");
          if (!ownBare) {
            showToast("OMEMO encryption requires a valid XMPP JID.", { tone: "error" });
            return;
          }
          await xmppOmemoEnsureOwnBundle(ownBare);
          const omemoNamespace = xmppOmemoNamespaceForSend([peerBare]);
          const refreshOmemoSessions = async () => {
            await xmppOmemoEnsureOwnBundle(ownBare, { force: true });
            await xmppOmemoFetchDeviceList(peerBare);
            await xmppOmemoEnsurePeerSessions(peerBare, ownBare);
          };
          let encryptedPayload = await xmppOmemoEncryptMessageForPeers([peerBare], omemoBody, ownBare);
          if (!encryptedPayload) {
            await refreshOmemoSessions();
            encryptedPayload = await xmppOmemoEncryptMessageForPeers([peerBare], omemoBody, ownBare);
            if (!encryptedPayload) {
              showToast("OMEMO encryption failed. Message not sent.", { tone: "error" });
              addXmppDebugEvent("error", "OMEMO DM encryption failed", {
                to: peerBare || ""
              });
              return;
            }
          }
          appendXmppOmemoEncryptedNode(stanza, encryptedPayload, { namespace: omemoNamespace });
          appendXmppEmeNode(stanza, { namespace: omemoNamespace, name: "OMEMO" });
          message.xmppEncrypted = true;
          message.xmppEncryptedType = omemoNamespace === XMPP_OMEMO_NAMESPACE_V2 ? "omemo2" : "omemo";
          message.xmppEncryptedLabel = "OMEMO";
          saveState();
        } else {
          appendXmppAttachmentMetadataNodes(stanza, xmppShareableAttachmentsForStanza(message));
        }
        const callInvite = parseCallInviteFromText(message.text || "");
        if (!omemoEnabled && callInvite?.url) {
          appendXmppCallInviteNode(stanza, {
            url: callInvite.url,
            audio: true,
            video: true
          });
          addXmppDebugEvent("call", "Sent call-invite in DM", {
            to: peerJid,
            id: stanzaId,
            url: callInvite.url,
            screenShare: Boolean(callInvite.screenShare)
          });
        }
        appendXmppChatMarkableNode(stanza);
        appendXmppReceiptRequestNode(stanza);
        xmppConnection.send(stanza);
        rememberXmppLocalSentRefs([stanzaId, originId]);
        rememberXmppPendingReceipt(stanzaId, thread, message, peerJid);
        message.xmppStanzaId = stanzaId;
        message.xmppRefIds = normalizeXmppRefIdsList([
          ...(Array.isArray(message.xmppRefIds) ? message.xmppRefIds : []),
          stanzaId,
          originId
        ]);
        rememberXmppDmMessage(peerJid, stanzaId, message);
        rememberXmppDmMessage(peerJid, originId, message);
        return;
      }
      await xmppPrepareMessageAttachmentsForUpload(message, { conversationId: thread.id || "" });
      if (!xmppConnection || relayStatus !== "connected") return;
      joinXmppRoom(room, account);
      const stanzaId = `s67-${createId().slice(0, 12)}`;
      const originId = `s67-origin-${createId().slice(0, 12)}`;
      const replyMeta = resolveXmppReplyMetaForRoom(thread, message, roomJid);
      const bodyPayload = buildXmppMessageBody(message, replyMeta);
      if (!(bodyPayload.body || "").trim()) return;
      const stanza = globalThis.$msg({ to: roomJid, type: "groupchat", id: stanzaId })
        .c("body")
        .t(bodyPayload.body);
      appendXmppReplyNodes(stanza, replyMeta, bodyPayload.fallbackPrefixLength);
      appendXmppOriginIdNode(stanza, originId);
      appendXmppMessageProcessingHints(stanza, { encrypted: false, preferStore: true });
      appendXmppAttachmentMetadataNodes(stanza, xmppShareableAttachmentsForStanza(message));
      xmppConnection.send(stanza);
      rememberXmppLocalSentRefs([stanzaId, originId]);
      message.xmppStanzaId = stanzaId;
      message.xmppRefIds = normalizeXmppRefIdsList([
        ...(Array.isArray(message.xmppRefIds) ? message.xmppRefIds : []),
        stanzaId,
        originId
      ]);
      rememberXmppRoomMessage(roomJid, stanzaId, message);
      rememberXmppRoomMessage(roomJid, originId, message);
    })().catch((error) => {
      addXmppDebugEvent("error", "Failed to publish XMPP direct message", {
        peerJid: peerJid || "",
        roomJid: roomJid || "",
        error: String(error?.message || error)
      });
    });
    return true;
  }
  if (prefs.relayMode === "http") {
    const endpoint = new URL(normalizeRelayUrl(prefs.relayUrl).replace(/^ws:/i, "http:").replace(/^wss:/i, "https:"));
    endpoint.pathname = "/chat";
    fetch(endpoint.toString(), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        type: "chat",
        room,
        clientId: relayClientId(),
        guildName: "",
        channelName: "dm",
        message: {
          id: message.id,
          text: relayTransportPacketText(message),
          ts: message.ts || new Date().toISOString(),
          authorUsername: account.username,
          authorDisplay: account.displayName || account.username,
          attachments: relayTransportAttachments(message.attachments, { limit: 4, urlMax: 640 })
        }
      })
    }).catch(() => {
      setRelayStatus("error", "HTTP relay post failed");
    });
    return true;
  }
  if (!relaySocket || relaySocket.readyState !== WebSocket.OPEN) return false;
  if (relayJoinedRoom !== room) joinRelayRoom(room);
  return sendRelayPacket({
    type: "chat",
    room,
    clientId: relayClientId(),
    guildName: "",
    channelName: "dm",
    message: {
      id: message.id,
      text: relayTransportPacketText(message),
      ts: message.ts || new Date().toISOString(),
      authorUsername: account.username,
      authorDisplay: account.displayName || account.username,
      attachments: relayTransportAttachments(message.attachments, { limit: 4, urlMax: 640 })
    }
  });
}
