(function initXep0184_0333_0359DeliveryIndexes(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_0184_0333_0359_DELIVERY_INDEXES) return;

  function trimXmppPendingReceiptMap(limit = 600, deps = {}) {
    const max = Math.max(64, Number(limit) || 600);
    while (deps.xmppPendingReceiptByStanzaId?.size > max) {
      const oldest = deps.xmppPendingReceiptByStanzaId.keys().next().value;
      if (!oldest) break;
      deps.xmppPendingReceiptByStanzaId.delete(oldest);
    }
  }

  function rememberXmppPendingReceipt(stanzaId, thread, message, peerJid = "", deps = {}) {
    const key = (stanzaId || "").toString().trim();
    if (!key || !thread?.id || !message?.id) return;
    message.xmppStanzaId = key;
    message.xmppDeliveryState = "sent";
    message.xmppDeliveryAt = "";
    deps.xmppPendingReceiptByStanzaId?.set?.(key, {
      threadId: thread.id,
      messageId: message.id,
      peerJid: typeof deps.xmppBareJidFn === "function" ? deps.xmppBareJidFn(peerJid) : "",
      sentAt: Date.now()
    });
    trimXmppPendingReceiptMap(600, deps);
  }

  function resolveXmppOutboundDmMessageByReference(stanzaId, peerJid = "", deps = {}) {
    const key = (stanzaId || "").toString().trim();
    if (!key) return { thread: null, message: null };
    const normalizedPeer = typeof deps.xmppBareJidFn === "function" ? deps.xmppBareJidFn(peerJid) : "";
    const current = typeof deps.getCurrentAccountFn === "function" ? deps.getCurrentAccountFn() : null;
    const ownUserId = (current?.id || "").toString();
    const isOwnMessage = (message) => {
      if (!message) return false;
      if (!ownUserId) return true;
      return (message.userId || "").toString() === ownUserId;
    };
    const pending = deps.xmppPendingReceiptByStanzaId?.get?.(key);
    if (pending?.threadId && pending?.messageId) {
      const scopedThread = (deps.state?.dmThreads || []).find((entry) => entry.id === pending.threadId) || null;
      const scopedMessage = scopedThread && typeof deps.findMessageInChannelFn === "function"
        ? deps.findMessageInChannelFn(scopedThread, pending.messageId)
        : null;
      if (scopedThread && scopedMessage && isOwnMessage(scopedMessage)) {
        return {
          thread: scopedThread,
          message: scopedMessage
        };
      }
    }
    const threadHasPeer = (thread) => {
      if (!normalizedPeer) return true;
      return (thread?.participantIds || []).some((id) => (
        (typeof deps.xmppBareJidFn === "function" ? deps.xmppBareJidFn(deps.getAccountByIdFn?.(id)?.xmppJid || "") : "") === normalizedPeer
      ));
    };
    const findInThread = (thread) => {
      const found = (thread?.messages || []).find((message) => (
        isOwnMessage(message)
        && (typeof deps.messageMatchesXmppReferenceFn === "function" ? deps.messageMatchesXmppReferenceFn(message, key) : false)
      )) || null;
      return found;
    };
    const threads = deps.state?.dmThreads || [];
    if (normalizedPeer) {
      for (const thread of threads) {
        if (!threadHasPeer(thread)) continue;
        const found = findInThread(thread);
        if (!found) continue;
        return {
          thread,
          message: found
        };
      }
    }
    for (const thread of threads) {
      const found = findInThread(thread);
      if (found) {
        return {
          thread,
          message: found
        };
      }
    }
    return { thread: null, message: null };
  }

  function markXmppMessageDeliveredByReceipt(stanzaId, peerJid = "", deps = {}) {
    const key = (stanzaId || "").toString().trim();
    if (!key) return false;
    const { thread: targetThread, message: targetMessage } = resolveXmppOutboundDmMessageByReference(key, peerJid, deps);
    deps.xmppPendingReceiptByStanzaId?.delete?.(key);
    if (!targetMessage || !targetThread) return false;
    const aliasRefs = typeof deps.normalizeXmppRefIdsListFn === "function"
      ? deps.normalizeXmppRefIdsListFn([
        (targetMessage.xmppStanzaId || "").toString().trim(),
        ...(Array.isArray(targetMessage.xmppRefIds) ? targetMessage.xmppRefIds : [])
      ])
      : [];
    aliasRefs.forEach((refId) => {
      const aliasKey = (refId || "").toString().trim();
      if (!aliasKey) return;
      deps.xmppPendingReceiptByStanzaId?.delete?.(aliasKey);
    });
    const nowIso = new Date().toISOString();
    const currentState = (targetMessage.xmppDeliveryState || "").toString().toLowerCase();
    let changed = false;
    if (currentState !== "read" && currentState !== "delivered") {
      targetMessage.xmppDeliveryState = "delivered";
      changed = true;
    }
    if (!targetMessage.xmppDeliveryAt) {
      targetMessage.xmppDeliveryAt = nowIso;
      changed = true;
    }
    return changed;
  }

  function markXmppMessageReadByMarker(stanzaId, peerJid = "", deps = {}) {
    const key = (stanzaId || "").toString().trim();
    if (!key) return false;
    const { thread, message } = resolveXmppOutboundDmMessageByReference(key, peerJid, deps);
    deps.xmppPendingReceiptByStanzaId?.delete?.(key);
    if (!thread || !message) return false;
    const aliasRefs = typeof deps.normalizeXmppRefIdsListFn === "function"
      ? deps.normalizeXmppRefIdsListFn([
        (message.xmppStanzaId || "").toString().trim(),
        ...(Array.isArray(message.xmppRefIds) ? message.xmppRefIds : [])
      ])
      : [];
    aliasRefs.forEach((refId) => {
      const aliasKey = (refId || "").toString().trim();
      if (!aliasKey) return;
      deps.xmppPendingReceiptByStanzaId?.delete?.(aliasKey);
    });
    const nowIso = new Date().toISOString();
    const current = typeof deps.getCurrentAccountFn === "function" ? deps.getCurrentAccountFn() : null;
    const ownUserId = (current?.id || "").toString();
    const targetIndex = (thread.messages || []).findIndex((entry) => entry === message);
    if (targetIndex < 0) return false;
    let changed = false;
    for (let i = 0; i <= targetIndex; i += 1) {
      const entry = thread.messages[i];
      if (!entry) continue;
      if (ownUserId && (entry.userId || "").toString() !== ownUserId) continue;
      const hasXmppReference = Boolean(
        (entry.xmppStanzaId || "").toString().trim()
        || (Array.isArray(entry.xmppRefIds) && entry.xmppRefIds.length > 0)
        || (entry.xmppDeliveryState || "").toString().trim()
      );
      if (!hasXmppReference) continue;
      const state = (entry.xmppDeliveryState || "").toString().toLowerCase();
      if (state !== "read") {
        entry.xmppDeliveryState = "read";
        changed = true;
      }
      if (!entry.xmppReadAt) {
        entry.xmppReadAt = nowIso;
        changed = true;
      }
      if (!entry.xmppDeliveryAt) {
        entry.xmppDeliveryAt = nowIso;
        changed = true;
      }
    }
    return changed;
  }

  function xmppRoomMessageIndex(roomJid, deps = {}) {
    const key = typeof deps.xmppBareJidFn === "function" ? deps.xmppBareJidFn(roomJid) : "";
    if (!key) return null;
    if (!deps.xmppRoomMessageIndexByJid?.has?.(key)) {
      deps.xmppRoomMessageIndexByJid?.set?.(key, new Map());
    }
    return deps.xmppRoomMessageIndexByJid?.get?.(key) || null;
  }

  function rememberXmppRoomMessage(roomJid, stanzaId, message, deps = {}) {
    const key = (stanzaId || "").toString().trim();
    if (!roomJid || !key || !message) return;
    const index = xmppRoomMessageIndex(roomJid, deps);
    if (!index) return;
    index.set(key, {
      messageId: (message.id || "").toString(),
      authorName: (typeof deps.displayNameForMessageFn === "function" ? deps.displayNameForMessageFn(message) : "") || "",
      text: (message.text || "").toString().slice(0, 180)
    });
    if (index.size > 600) {
      const first = index.keys().next().value;
      if (first) index.delete(first);
    }
  }

  function xmppDmMessageIndex(peerJid, deps = {}) {
    const key = typeof deps.xmppBareJidFn === "function" ? deps.xmppBareJidFn(peerJid) : "";
    if (!key) return null;
    if (!deps.xmppDmMessageIndexByPeerJid?.has?.(key)) {
      deps.xmppDmMessageIndexByPeerJid?.set?.(key, new Map());
    }
    return deps.xmppDmMessageIndexByPeerJid?.get?.(key) || null;
  }

  function rememberXmppDmMessage(peerJid, stanzaId, message, deps = {}) {
    const key = (stanzaId || "").toString().trim();
    if (!peerJid || !key || !message) return;
    const index = xmppDmMessageIndex(peerJid, deps);
    if (!index) return;
    index.set(key, {
      messageId: (message.id || "").toString(),
      authorName: (typeof deps.displayNameForMessageFn === "function" ? deps.displayNameForMessageFn(message) : "") || "",
      text: (message.text || "").toString().slice(0, 180)
    });
    if (index.size > 600) {
      const first = index.keys().next().value;
      if (first) index.delete(first);
    }
  }

  function isXmppLocalSentRefId(refId, deps = {}) {
    const key = (refId || "").toString().trim();
    if (!key) return false;
    const seenAt = deps.xmppLocalSentRefIdSeenAt?.get?.(key) || 0;
    if (!seenAt) return false;
    const ttlMs = Math.max(1000, Number(deps.XMPP_LOCAL_SENT_REF_TTL_MS) || 180000);
    const now = Date.now();
    if ((now - seenAt) > ttlMs) {
      deps.xmppLocalSentRefIdSeenAt?.delete?.(key);
      return false;
    }
    return true;
  }

  globalScope.SHITCORD67_XEP_0184_0333_0359_DELIVERY_INDEXES = Object.freeze({
    trimXmppPendingReceiptMap,
    rememberXmppPendingReceipt,
    resolveXmppOutboundDmMessageByReference,
    markXmppMessageDeliveredByReceipt,
    markXmppMessageReadByMarker,
    xmppRoomMessageIndex,
    rememberXmppRoomMessage,
    xmppDmMessageIndex,
    rememberXmppDmMessage,
    isXmppLocalSentRefId
  });
})(typeof globalThis !== "undefined" ? globalThis : window);
