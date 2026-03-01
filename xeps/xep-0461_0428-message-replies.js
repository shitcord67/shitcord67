(function initXep0461_0428MessageReplies(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_0461_0428_REPLIES) return;

  const XMPP_REPLY_NAMESPACE = "urn:xmpp:reply:0";
  const XMPP_FALLBACK_NAMESPACE = "urn:xmpp:fallback:0";

  function hydrateXmppRepliesForRoom(roomToken, roomJid, stanzaId, referenced, deps = {}) {
    if (!roomToken || !roomJid || !stanzaId || !referenced) return false;
    const findRelayTargetChannelByRoomFn = deps.findRelayTargetChannelByRoomFn;
    const findXmppRoomChannelByJidFn = deps.findXmppRoomChannelByJidFn;
    const displayNameForMessageFn = deps.displayNameForMessageFn;
    const targetChannel = (typeof findRelayTargetChannelByRoomFn === "function" ? findRelayTargetChannelByRoomFn(roomToken) : null)
      || (typeof findXmppRoomChannelByJidFn === "function" ? findXmppRoomChannelByJidFn(roomJid) : null);
    if (!targetChannel || !Array.isArray(targetChannel.messages)) return false;
    let changed = false;
    targetChannel.messages.forEach((entry) => {
      if (!entry?.replyTo || typeof entry.replyTo !== "object") return;
      if ((entry.replyTo.messageId || "").toString()) return;
      if ((entry.replyTo.stanzaId || "").toString() !== stanzaId) return;
      entry.replyTo.messageId = referenced.id || "";
      entry.replyTo.authorName = (typeof displayNameForMessageFn === "function" ? displayNameForMessageFn(referenced) : "")
        || entry.replyTo.authorName
        || "message";
      entry.replyTo.text = (referenced.text || "").toString().slice(0, 180) || entry.replyTo.text || "XMPP reply";
      changed = true;
    });
    return changed;
  }

  function hydrateXmppRepliesForDm(peerJid, stanzaId, referenced, deps = {}) {
    const bareJidFn = deps.bareJidFn;
    const getCurrentAccountFn = deps.getCurrentAccountFn;
    const getAccountByXmppJidFn = deps.getAccountByXmppJidFn;
    const displayNameForMessageFn = deps.displayNameForMessageFn;
    const dmThreads = Array.isArray(deps.dmThreads) ? deps.dmThreads : [];
    const barePeer = typeof bareJidFn === "function" ? bareJidFn(peerJid) : "";
    if (!barePeer || !stanzaId || !referenced) return false;
    const current = typeof getCurrentAccountFn === "function" ? getCurrentAccountFn() : null;
    const peer = typeof getAccountByXmppJidFn === "function" ? getAccountByXmppJidFn(barePeer) : null;
    if (!current || !peer || peer.id === current.id) return false;
    const thread = dmThreads.find((entry) => (
      Array.isArray(entry?.participantIds)
      && entry.participantIds.includes(current.id)
      && entry.participantIds.includes(peer.id)
    )) || null;
    if (!thread || !Array.isArray(thread.messages)) return false;
    let changed = false;
    thread.messages.forEach((entry) => {
      if (!entry?.replyTo || typeof entry.replyTo !== "object") return;
      if ((entry.replyTo.messageId || "").toString()) return;
      if ((entry.replyTo.stanzaId || "").toString() !== stanzaId) return;
      entry.replyTo.messageId = referenced.id || "";
      entry.replyTo.authorName = (typeof displayNameForMessageFn === "function" ? displayNameForMessageFn(referenced) : "")
        || entry.replyTo.authorName
        || "message";
      entry.replyTo.text = (referenced.text || "").toString().slice(0, 180) || entry.replyTo.text || "XMPP reply";
      changed = true;
    });
    return changed;
  }

  function xmppReplyMetaFromStanza(stanza, roomJid = "", peerJid = "", deps = {}) {
    if (!stanza || typeof stanza.getElementsByTagName !== "function") return null;
    const xmppNodeHasXmlnsFn = deps.xmppNodeHasXmlnsFn;
    const xmppNodeHasXmlnsPrefixFn = deps.xmppNodeHasXmlnsPrefixFn;
    const normalizeXmppJidFn = deps.normalizeXmppJidFn;
    const findXmppRoomMessageByAnyIdFn = deps.findXmppRoomMessageByAnyIdFn;
    const findXmppDmMessageByAnyIdFn = deps.findXmppDmMessageByAnyIdFn;
    const xmppNodeTextFn = deps.xmppNodeTextFn;
    const decodeHtmlEntitiesFn = deps.decodeHtmlEntitiesFn;

    const replyNode = [...stanza.getElementsByTagName("reply")]
      .find((node) => (
        (typeof xmppNodeHasXmlnsFn === "function" ? xmppNodeHasXmlnsFn(node, XMPP_REPLY_NAMESPACE) : false)
        || (typeof xmppNodeHasXmlnsPrefixFn === "function" ? xmppNodeHasXmlnsPrefixFn(node, "urn:xmpp:reply") : false)
      )) || null;
    const repliedId = (replyNode?.getAttribute("id") || "").toString().trim();
    if (!repliedId) return null;
    const replyToJid = typeof normalizeXmppJidFn === "function"
      ? normalizeXmppJidFn(replyNode?.getAttribute("to") || "")
      : "";
    const replyNick = (replyToJid.split("/")[1] || replyToJid.split("@")[0] || "").toString().trim();
    const known = roomJid
      ? (typeof findXmppRoomMessageByAnyIdFn === "function" ? findXmppRoomMessageByAnyIdFn(roomJid, repliedId) : null)
      : (peerJid ? (typeof findXmppDmMessageByAnyIdFn === "function" ? findXmppDmMessageByAnyIdFn(peerJid, repliedId) : null) : null);
    const fallbackNode = [...stanza.getElementsByTagName("fallback")]
      .find((node) => (
        (typeof xmppNodeHasXmlnsFn === "function" ? xmppNodeHasXmlnsFn(node, XMPP_FALLBACK_NAMESPACE) : false)
        || (typeof xmppNodeHasXmlnsPrefixFn === "function" ? xmppNodeHasXmlnsPrefixFn(node, "urn:xmpp:fallback") : false)
      ) && (
        (node.getAttribute("for") || "") === XMPP_REPLY_NAMESPACE
      )) || null;
    const fallbackBody = fallbackNode ? fallbackNode.getElementsByTagName("body")[0] : null;
    const bodyRaw = (typeof xmppNodeTextFn === "function" ? xmppNodeTextFn(stanza.getElementsByTagName("body")[0] || null) : "").toString();
    const rangeStart = Number.parseInt(fallbackBody?.getAttribute("start") || "", 10);
    const rangeEnd = Number.parseInt(fallbackBody?.getAttribute("end") || "", 10);
    let fallbackText = "";
    if (Number.isFinite(rangeStart) && Number.isFinite(rangeEnd) && rangeEnd > rangeStart && bodyRaw) {
      fallbackText = bodyRaw.slice(rangeStart, rangeEnd).replace(/\s+/g, " ").trim();
    }
    if (!fallbackText && bodyRaw) {
      const quoteLines = [];
      bodyRaw.split(/\r?\n/).forEach((line) => {
        const match = line.match(/^>\s?(.*)$/);
        if (!match) return;
        quoteLines.push((match[1] || "").trim());
      });
      fallbackText = quoteLines.join(" ").replace(/\s+/g, " ").trim();
    }
    const decodedText = typeof decodeHtmlEntitiesFn === "function"
      ? decodeHtmlEntitiesFn((known?.text || fallbackText || "XMPP reply").toString())
      : (known?.text || fallbackText || "XMPP reply").toString();
    return {
      stanzaId: repliedId,
      messageId: (known?.messageId || "").toString(),
      authorName: (known?.authorName || replyNick || "message").toString().slice(0, 60),
      text: decodedText.slice(0, 180)
    };
  }

  function xmppReplyFallbackPrefix(replyMeta, deps = {}) {
    if (!replyMeta || typeof replyMeta !== "object") return "";
    const decodeHtmlEntitiesFn = deps.decodeHtmlEntitiesFn;
    const decode = typeof decodeHtmlEntitiesFn === "function"
      ? decodeHtmlEntitiesFn
      : ((value) => (value || "").toString());
    const name = decode((replyMeta.authorName || "message").toString())
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 60) || "message";
    const preview = decode((replyMeta.text || "XMPP reply").toString())
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 140) || "XMPP reply";
    return `> ${name}: ${preview}\n\n`;
  }

  function xmppEnsureBuilderAtMessageNode(stanza) {
    if (!stanza || typeof stanza.up !== "function") return stanza;
    const currentNodeName = (stanza?.node?.nodeName || "").toString().toLowerCase();
    if (currentNodeName && currentNodeName !== "message") stanza.up();
    return stanza;
  }

  function appendXmppReplyNodes(stanza, replyMeta, fallbackPrefixLength = 0, deps = {}) {
    if (!stanza || !replyMeta?.id) return stanza;
    const ensureBuilderFn = typeof deps.xmppEnsureBuilderAtMessageNodeFn === "function"
      ? deps.xmppEnsureBuilderAtMessageNodeFn
      : xmppEnsureBuilderAtMessageNode;
    ensureBuilderFn(stanza);
    const attrs = {
      xmlns: XMPP_REPLY_NAMESPACE,
      id: replyMeta.id
    };
    if (replyMeta.to) attrs.to = replyMeta.to;
    stanza.c("reply", attrs).up();
    if (fallbackPrefixLength > 0) {
      stanza
        .c("fallback", { xmlns: XMPP_FALLBACK_NAMESPACE, for: XMPP_REPLY_NAMESPACE })
        .c("body", { start: "0", end: String(fallbackPrefixLength) })
        .up()
        .up();
    }
    return stanza;
  }

  globalScope.SHITCORD67_XEP_0461_0428_REPLIES = Object.freeze({
    hydrateXmppRepliesForRoom,
    hydrateXmppRepliesForDm,
    xmppReplyMetaFromStanza,
    xmppReplyFallbackPrefix,
    xmppEnsureBuilderAtMessageNode,
    appendXmppReplyNodes
  });
  if (typeof globalScope.SHITCORD67_XEP_REGISTRY?.register === "function") {
    globalScope.SHITCORD67_XEP_REGISTRY.register("xep-0461_0428-message-replies", globalScope.SHITCORD67_XEP_0461_0428_REPLIES);
  }
})(typeof window !== "undefined" ? window : globalThis);
