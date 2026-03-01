(function initXep0333_0359_0372_0444_0482MessageBuilders(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_0333_0359_0372_0444_0482_BUILDERS) return;

  function preferredXmppReferenceIdForConversationMessage(conversation, message, deps = {}) {
    if (conversation?.type === "dm") {
      return typeof deps.preferredXmppDmReferenceIdForMessageFn === "function"
        ? deps.preferredXmppDmReferenceIdForMessageFn(message)
        : "";
    }
    return typeof deps.primaryXmppReferenceIdForMessageFn === "function"
      ? deps.primaryXmppReferenceIdForMessageFn(message)
      : "";
  }

  function buildXmppMessageBody(message, replyMeta = null, deps = {}) {
    const relayMessageBodyTextFn = deps.relayMessageBodyTextFn;
    const xmppReplyFallbackPrefixFn = deps.xmppReplyFallbackPrefixFn;
    const payload = typeof relayMessageBodyTextFn === "function" ? relayMessageBodyTextFn(message) : "";
    if (!replyMeta?.id) {
      return {
        body: payload,
        fallbackPrefixLength: 0
      };
    }
    const prefix = typeof xmppReplyFallbackPrefixFn === "function"
      ? xmppReplyFallbackPrefixFn(replyMeta)
      : "";
    return {
      body: `${prefix}${payload || ""}`,
      fallbackPrefixLength: prefix.length
    };
  }

  function resolveXmppReplyMetaForDm(thread, message, account, peerJid = "", deps = {}) {
    if (!thread || !message?.replyTo || typeof message.replyTo !== "object") return null;
    const findMessageInChannelFn = deps.findMessageInChannelFn;
    const preferredXmppDmReferenceIdForMessageFn = deps.preferredXmppDmReferenceIdForMessageFn;
    const getAccountByIdFn = deps.getAccountByIdFn;
    const normalizeXmppJidFn = deps.normalizeXmppJidFn;
    const displayNameForMessageFn = deps.displayNameForMessageFn;
    const explicitRef = (message.replyTo.stanzaId || "").toString().trim();
    const repliedMessageId = (message.replyTo.messageId || "").toString().trim();
    const targetMessage = repliedMessageId && typeof findMessageInChannelFn === "function"
      ? findMessageInChannelFn(thread, repliedMessageId)
      : null;
    const referenceId = explicitRef || (typeof preferredXmppDmReferenceIdForMessageFn === "function"
      ? preferredXmppDmReferenceIdForMessageFn(targetMessage)
      : "");
    if (!referenceId) return null;
    const targetAuthorAccount = targetMessage?.userId && typeof getAccountByIdFn === "function"
      ? getAccountByIdFn(targetMessage.userId)
      : null;
    const replyToJid = typeof normalizeXmppJidFn === "function"
      ? normalizeXmppJidFn(targetAuthorAccount?.xmppJid || peerJid || "")
      : "";
    const authorName = (message.replyTo.authorName
      || (typeof displayNameForMessageFn === "function" ? displayNameForMessageFn(targetMessage) : "")
      || "message").toString();
    const previewText = (message.replyTo.text || targetMessage?.text || "XMPP reply").toString();
    return {
      id: referenceId,
      to: replyToJid,
      authorName,
      text: previewText,
      isOwnTarget: Boolean(targetMessage?.userId && targetMessage.userId === account?.id)
    };
  }

  function resolveXmppReplyMetaForRoom(channel, message, roomJid = "", deps = {}) {
    if (!channel || !message?.replyTo || typeof message.replyTo !== "object") return null;
    const findMessageInChannelFn = deps.findMessageInChannelFn;
    const primaryXmppReferenceIdForMessageFn = deps.primaryXmppReferenceIdForMessageFn;
    const xmppBareJidFn = deps.xmppBareJidFn;
    const displayNameForMessageFn = deps.displayNameForMessageFn;
    const explicitRef = (message.replyTo.stanzaId || "").toString().trim();
    const repliedMessageId = (message.replyTo.messageId || "").toString().trim();
    const targetMessage = repliedMessageId && typeof findMessageInChannelFn === "function"
      ? findMessageInChannelFn(channel, repliedMessageId)
      : null;
    const referenceId = explicitRef || (typeof primaryXmppReferenceIdForMessageFn === "function"
      ? primaryXmppReferenceIdForMessageFn(targetMessage)
      : "");
    if (!referenceId) return null;
    const roomBare = typeof xmppBareJidFn === "function" ? xmppBareJidFn(roomJid) : "";
    const fallbackAuthor = (message.replyTo.authorName
      || (typeof displayNameForMessageFn === "function" ? displayNameForMessageFn(targetMessage) : "")
      || "message").toString().trim();
    const nick = (targetMessage?.xmppNick || fallbackAuthor).toString().replace(/\//g, " ").replace(/\s+/g, " ").trim();
    const replyToJid = roomBare && nick ? `${roomBare}/${nick.slice(0, 96)}` : roomBare;
    const previewText = (message.replyTo.text || targetMessage?.text || "XMPP reply").toString();
    return {
      id: referenceId,
      to: replyToJid,
      authorName: fallbackAuthor,
      text: previewText
    };
  }

  function appendXmppOriginIdNode(stanza, originId, deps = {}) {
    const value = (originId || "").toString().trim();
    if (!stanza || !value) return stanza;
    if (typeof deps.xmppEnsureBuilderAtMessageNodeFn === "function") deps.xmppEnsureBuilderAtMessageNodeFn(stanza);
    stanza.c("origin-id", { xmlns: "urn:xmpp:sid:0", id: value }).up();
    return stanza;
  }

  function appendXmppChatMarkableNode(stanza, deps = {}) {
    if (!stanza) return stanza;
    if (typeof deps.xmppEnsureBuilderAtMessageNodeFn === "function") deps.xmppEnsureBuilderAtMessageNodeFn(stanza);
    stanza.c("markable", { xmlns: (deps.chatMarkersNamespace || "").toString() }).up();
    return stanza;
  }

  function appendXmppMessageReplaceNode(stanza, targetRefId, deps = {}) {
    const refId = (targetRefId || "").toString().trim();
    if (!stanza || !refId) return stanza;
    if (typeof deps.xmppEnsureBuilderAtMessageNodeFn === "function") deps.xmppEnsureBuilderAtMessageNodeFn(stanza);
    stanza.c("replace", { xmlns: deps.messageCorrectNamespace || "urn:xmpp:message-correct:0", id: refId }).up();
    return stanza;
  }

  function appendXmppReactionsNode(stanza, targetRefId, emojis = [], deps = {}) {
    const refId = (targetRefId || "").toString().trim();
    if (!stanza || !refId) return stanza;
    if (typeof deps.xmppEnsureBuilderAtMessageNodeFn === "function") deps.xmppEnsureBuilderAtMessageNodeFn(stanza);
    stanza.c("reactions", { xmlns: (deps.reactionsNamespace || "").toString(), id: refId });
    const normalized = [...new Set(
      (Array.isArray(emojis) ? emojis : [])
        .map((emoji) => (emoji || "").toString().trim())
        .filter(Boolean)
    )].slice(0, 8);
    normalized.forEach((emoji) => {
      stanza.c("reaction").t(emoji).up();
    });
    stanza.up();
    return stanza;
  }

  function xmppShareableAttachmentsForStanza(message, { limit = 6, urlMax = 2048 } = {}, deps = {}) {
    if (typeof deps.relayTransportAttachmentsFn !== "function") return [];
    return deps.relayTransportAttachmentsFn(message?.attachments, {
      limit: Math.max(1, Math.min(8, Number(limit) || 6)),
      urlMax: Math.max(200, Math.min(4096, Number(urlMax) || 2048))
    });
  }

  function appendXmppAttachmentMetadataNodes(stanza, attachments = [], deps = {}) {
    if (!stanza) return stanza;
    const normalizeAttachmentsFn = deps.normalizeAttachmentsFn;
    const xmppEnsureBuilderAtMessageNodeFn = deps.xmppEnsureBuilderAtMessageNodeFn;
    const entries = typeof normalizeAttachmentsFn === "function" ? normalizeAttachmentsFn(attachments) : [];
    const items = entries
      .map((entry) => ({
        ...entry,
        url: (entry?.url || "").toString().trim()
      }))
      .filter((entry) => /^(https?:\/\/|xmpp:https?:\/\/)/i.test(entry.url));
    if (items.length === 0) return stanza;
    if (typeof xmppEnsureBuilderAtMessageNodeFn === "function") xmppEnsureBuilderAtMessageNodeFn(stanza);
    const seenUrls = new Set();
    items.forEach((entry) => {
      const rawUrl = (entry.url || "").toString().trim();
      const url = rawUrl.replace(/^xmpp:/i, "");
      if (!url || !/^https?:\/\//i.test(url)) return;
      const urlKey = url.toLowerCase();
      if (seenUrls.has(urlKey)) return;
      seenUrls.add(urlKey);
      const desc = (entry.name || `${entry.type || "file"} attachment`).toString().trim().slice(0, 180);
      const mediaType = (entry.mime || "").toString().trim().toLowerCase().slice(0, 160);
      stanza
        .c("x", { xmlns: "jabber:x:oob" })
        .c("url")
        .t(url)
        .up();
      if (desc) stanza.c("desc").t(desc).up();
      stanza.up();
      stanza
        .c("reference", {
          xmlns: "urn:xmpp:reference:0",
          type: "data",
          uri: url,
          name: desc.slice(0, 120),
          ...(mediaType ? { "media-type": mediaType } : {})
        })
        .up();
      stanza
        .c("media-sharing", { xmlns: "urn:xmpp:sims:1" })
        .c("file", { xmlns: "urn:xmpp:file:metadata:0" })
        .c("name")
        .t((entry.name || "").toString().trim().slice(0, 120) || (url.split("/").pop() || "attachment").slice(0, 120))
        .up();
      if (mediaType) stanza.c("media-type").t(mediaType).up();
      stanza.c("uri").t(url).up();
      stanza.up().up();
    });
    return stanza;
  }

  function appendXmppCallInviteNode(stanza, { url = "", audio = true, video = true } = {}, deps = {}) {
    if (!stanza) return stanza;
    const normalizeCallInviteUrlFn = deps.normalizeCallInviteUrlFn;
    const href = typeof normalizeCallInviteUrlFn === "function" ? normalizeCallInviteUrlFn(url) : "";
    if (!href) return stanza;
    if (typeof deps.xmppEnsureBuilderAtMessageNodeFn === "function") deps.xmppEnsureBuilderAtMessageNodeFn(stanza);
    stanza
      .c("invite", {
        xmlns: (deps.callInvitesNamespace || "").toString(),
        audio: audio ? "true" : "false",
        video: video ? "true" : "false"
      })
      .c("external", { uri: href })
      .up()
      .up();
    return stanza;
  }

  globalScope.SHITCORD67_XEP_0333_0359_0372_0444_0482_BUILDERS = Object.freeze({
    preferredXmppReferenceIdForConversationMessage,
    buildXmppMessageBody,
    resolveXmppReplyMetaForDm,
    resolveXmppReplyMetaForRoom,
    appendXmppOriginIdNode,
    appendXmppChatMarkableNode,
    appendXmppMessageReplaceNode,
    appendXmppReactionsNode,
    xmppShareableAttachmentsForStanza,
    appendXmppAttachmentMetadataNodes,
    appendXmppCallInviteNode
  });
  if (typeof globalScope.SHITCORD67_XEP_REGISTRY?.register === "function") {
    globalScope.SHITCORD67_XEP_REGISTRY.register(
      "xep-0333_0359_0372_0444_0482-message-builders",
      globalScope.SHITCORD67_XEP_0333_0359_0372_0444_0482_BUILDERS
    );
  }
})(typeof window !== "undefined" ? window : globalThis);
