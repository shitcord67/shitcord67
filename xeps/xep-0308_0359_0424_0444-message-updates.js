(function initXep0308_0359_0424_0444MessageUpdates(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_XEP_0308_0359_0424_0444_MESSAGE_UPDATES) return;

  function xmppStanzaReferenceIds(stanza) {
    if (!stanza || typeof stanza.getElementsByTagName !== "function") return [];
    const out = [];
    const seen = new Set();
    const push = (value) => {
      const key = (value || "").toString().trim();
      if (!key || seen.has(key)) return;
      seen.add(key);
      out.push(key);
    };
    [...stanza.getElementsByTagName("stanza-id")].forEach((node) => {
      push(node.getAttribute?.("id") || "");
    });
    [...stanza.getElementsByTagName("origin-id")].forEach((node) => {
      push(node.getAttribute?.("id") || "");
    });
    // Prefix-tolerant fallback for clients emitting sid:stanza-id or sid:origin-id.
    [...stanza.getElementsByTagName("*")].forEach((node) => {
      const local = ((node?.localName || node?.nodeName || "").toString().split(":").pop() || "").toLowerCase();
      if (local === "stanza-id" || local === "origin-id") {
        push(node.getAttribute?.("id") || "");
      }
    });
    push(stanza.getAttribute?.("id") || "");
    return out;
  }

  function applyXmppDmMessageCorrection(peerJid, targetRefId, payload = {}, deps = {}) {
    const bareJidFn = deps.bareJidFn;
    const findXmppDmThreadByPeerJidFn = deps.findXmppDmThreadByPeerJidFn;
    const findXmppDmMessageByAnyIdFn = deps.findXmppDmMessageByAnyIdFn;
    const messageMatchesXmppReferenceFn = deps.messageMatchesXmppReferenceFn;
    const applyXmppCorrectionToMessageEntryFn = deps.applyXmppCorrectionToMessageEntryFn;
    const normalizeXmppRefIdsListFn = deps.normalizeXmppRefIdsListFn;
    const rememberXmppDmMessageFn = deps.rememberXmppDmMessageFn;
    const barePeer = typeof bareJidFn === "function" ? bareJidFn(peerJid) : "";
    if (!barePeer || !targetRefId) return { handled: false, changed: false, contentChanged: false, thread: null };
    const thread = typeof findXmppDmThreadByPeerJidFn === "function" ? findXmppDmThreadByPeerJidFn(barePeer) : null;
    if (!thread || !Array.isArray(thread.messages)) return { handled: false, changed: false, contentChanged: false, thread: null };
    const mapped = typeof findXmppDmMessageByAnyIdFn === "function" ? findXmppDmMessageByAnyIdFn(barePeer, targetRefId) : null;
    const target = thread.messages.find((entry) => (
      (typeof messageMatchesXmppReferenceFn === "function" ? messageMatchesXmppReferenceFn(entry, targetRefId) : false)
      || (mapped?.messageId && (entry?.id || "").toString() === mapped.messageId)
    )) || null;
    if (!target) return { handled: false, changed: false, contentChanged: false, thread };
    const applied = typeof applyXmppCorrectionToMessageEntryFn === "function"
      ? applyXmppCorrectionToMessageEntryFn(target, payload)
      : { handled: false, changed: false, contentChanged: false };
    const trackedRefs = typeof normalizeXmppRefIdsListFn === "function"
      ? normalizeXmppRefIdsListFn([
        ...(Array.isArray(target.xmppRefIds) ? target.xmppRefIds : []),
        target.xmppStanzaId || "",
        targetRefId,
        ...(Array.isArray(payload?.stanzaRefs) ? payload.stanzaRefs : []),
        payload?.stanzaId || ""
      ])
      : [];
    if (typeof rememberXmppDmMessageFn === "function") trackedRefs.forEach((refId) => rememberXmppDmMessageFn(barePeer, refId, target));
    return {
      ...applied,
      thread
    };
  }

  function applyXmppRoomMessageCorrection(roomJid, targetRefId, payload = {}, deps = {}) {
    const bareJidFn = deps.bareJidFn;
    const xmppRoomByJid = deps.xmppRoomByJid;
    const findRelayTargetChannelByRoomFn = deps.findRelayTargetChannelByRoomFn;
    const findXmppRoomChannelByJidFn = deps.findXmppRoomChannelByJidFn;
    const findXmppRoomMessageByAnyIdFn = deps.findXmppRoomMessageByAnyIdFn;
    const messageMatchesXmppReferenceFn = deps.messageMatchesXmppReferenceFn;
    const applyXmppCorrectionToMessageEntryFn = deps.applyXmppCorrectionToMessageEntryFn;
    const normalizeXmppRefIdsListFn = deps.normalizeXmppRefIdsListFn;
    const rememberXmppRoomMessageFn = deps.rememberXmppRoomMessageFn;
    const bareRoom = typeof bareJidFn === "function" ? bareJidFn(roomJid) : "";
    if (!bareRoom || !targetRefId) return { handled: false, changed: false, contentChanged: false, channel: null };
    const roomToken = xmppRoomByJid?.get?.(bareRoom) || `xmpp:${bareRoom}`;
    const channel = (typeof findRelayTargetChannelByRoomFn === "function" ? findRelayTargetChannelByRoomFn(roomToken) : null)
      || (typeof findXmppRoomChannelByJidFn === "function" ? findXmppRoomChannelByJidFn(bareRoom) : null);
    if (!channel || !Array.isArray(channel.messages)) return { handled: false, changed: false, contentChanged: false, channel: null };
    const mapped = typeof findXmppRoomMessageByAnyIdFn === "function" ? findXmppRoomMessageByAnyIdFn(bareRoom, targetRefId) : null;
    const target = channel.messages.find((entry) => (
      (typeof messageMatchesXmppReferenceFn === "function" ? messageMatchesXmppReferenceFn(entry, targetRefId) : false)
      || (mapped?.messageId && (entry?.id || "").toString() === mapped.messageId)
    )) || null;
    if (!target) return { handled: false, changed: false, contentChanged: false, channel };
    const applied = typeof applyXmppCorrectionToMessageEntryFn === "function"
      ? applyXmppCorrectionToMessageEntryFn(target, payload)
      : { handled: false, changed: false, contentChanged: false };
    const trackedRefs = typeof normalizeXmppRefIdsListFn === "function"
      ? normalizeXmppRefIdsListFn([
        ...(Array.isArray(target.xmppRefIds) ? target.xmppRefIds : []),
        target.xmppStanzaId || "",
        targetRefId,
        ...(Array.isArray(payload?.stanzaRefs) ? payload.stanzaRefs : []),
        payload?.stanzaId || ""
      ])
      : [];
    if (typeof rememberXmppRoomMessageFn === "function") trackedRefs.forEach((refId) => rememberXmppRoomMessageFn(bareRoom, refId, target));
    return {
      ...applied,
      channel
    };
  }

  function applyXmppDmReactionUpdate(peerJid, targetRefId, payload = {}, deps = {}) {
    const bareJidFn = deps.bareJidFn;
    const findXmppDmThreadByPeerJidFn = deps.findXmppDmThreadByPeerJidFn;
    const findXmppDmMessageByAnyIdFn = deps.findXmppDmMessageByAnyIdFn;
    const messageMatchesXmppReferenceFn = deps.messageMatchesXmppReferenceFn;
    const applyXmppReactionsForActorFn = deps.applyXmppReactionsForActorFn;
    const normalizeXmppRefIdsListFn = deps.normalizeXmppRefIdsListFn;
    const rememberXmppDmMessageFn = deps.rememberXmppDmMessageFn;
    const barePeer = typeof bareJidFn === "function" ? bareJidFn(peerJid) : "";
    if (!barePeer || !targetRefId) return { handled: false, changed: false, thread: null };
    const thread = typeof findXmppDmThreadByPeerJidFn === "function" ? findXmppDmThreadByPeerJidFn(barePeer) : null;
    if (!thread || !Array.isArray(thread.messages)) return { handled: false, changed: false, thread: null };
    const mapped = typeof findXmppDmMessageByAnyIdFn === "function" ? findXmppDmMessageByAnyIdFn(barePeer, targetRefId) : null;
    const target = thread.messages.find((entry) => (
      (typeof messageMatchesXmppReferenceFn === "function" ? messageMatchesXmppReferenceFn(entry, targetRefId) : false)
      || (mapped?.messageId && (entry?.id || "").toString() === mapped.messageId)
    )) || null;
    if (!target) return { handled: false, changed: false, thread };
    const applied = typeof applyXmppReactionsForActorFn === "function"
      ? applyXmppReactionsForActorFn(target, payload.actorUserId, payload.emojis, { processingHints: payload.processingHints })
      : { handled: false, changed: false };
    const mergedRefIds = typeof normalizeXmppRefIdsListFn === "function"
      ? normalizeXmppRefIdsListFn([
        ...(typeof normalizeXmppRefIdsListFn === "function" ? normalizeXmppRefIdsListFn(target.xmppRefIds) : []),
        ...(typeof normalizeXmppRefIdsListFn === "function" ? normalizeXmppRefIdsListFn(payload.stanzaRefs) : []),
        payload.stanzaId || ""
      ])
      : [];
    const currentRefIds = typeof normalizeXmppRefIdsListFn === "function"
      ? normalizeXmppRefIdsListFn(target.xmppRefIds)
      : [];
    let metaChanged = false;
    if (mergedRefIds.length !== currentRefIds.length || mergedRefIds.some((entry, index) => entry !== currentRefIds[index])) {
      target.xmppRefIds = mergedRefIds;
      metaChanged = true;
    }
    const trackedRefs = typeof normalizeXmppRefIdsListFn === "function"
      ? normalizeXmppRefIdsListFn([
        ...(Array.isArray(target.xmppRefIds) ? target.xmppRefIds : []),
        target.xmppStanzaId || "",
        targetRefId,
        ...(Array.isArray(payload?.stanzaRefs) ? payload.stanzaRefs : []),
        payload?.stanzaId || ""
      ])
      : [];
    if (typeof rememberXmppDmMessageFn === "function") trackedRefs.forEach((refId) => rememberXmppDmMessageFn(barePeer, refId, target));
    return {
      handled: true,
      changed: Boolean(applied.changed || metaChanged),
      thread
    };
  }

  function applyXmppRoomReactionUpdate(roomJid, targetRefId, payload = {}, deps = {}) {
    const bareJidFn = deps.bareJidFn;
    const xmppRoomByJid = deps.xmppRoomByJid;
    const findRelayTargetChannelByRoomFn = deps.findRelayTargetChannelByRoomFn;
    const findXmppRoomChannelByJidFn = deps.findXmppRoomChannelByJidFn;
    const findXmppRoomMessageByAnyIdFn = deps.findXmppRoomMessageByAnyIdFn;
    const messageMatchesXmppReferenceFn = deps.messageMatchesXmppReferenceFn;
    const canonicalXmppRoomReactionActorIdFn = deps.canonicalXmppRoomReactionActorIdFn;
    const applyXmppReactionsForActorFn = deps.applyXmppReactionsForActorFn;
    const normalizeXmppRefIdsListFn = deps.normalizeXmppRefIdsListFn;
    const rememberXmppRoomMessageFn = deps.rememberXmppRoomMessageFn;
    const bareRoom = typeof bareJidFn === "function" ? bareJidFn(roomJid) : "";
    if (!bareRoom || !targetRefId) return { handled: false, changed: false, channel: null };
    const roomToken = xmppRoomByJid?.get?.(bareRoom) || `xmpp:${bareRoom}`;
    const channel = (typeof findRelayTargetChannelByRoomFn === "function" ? findRelayTargetChannelByRoomFn(roomToken) : null)
      || (typeof findXmppRoomChannelByJidFn === "function" ? findXmppRoomChannelByJidFn(bareRoom) : null);
    if (!channel || !Array.isArray(channel.messages)) return { handled: false, changed: false, channel: null };
    const mapped = typeof findXmppRoomMessageByAnyIdFn === "function" ? findXmppRoomMessageByAnyIdFn(bareRoom, targetRefId) : null;
    const target = channel.messages.find((entry) => (
      (typeof messageMatchesXmppReferenceFn === "function" ? messageMatchesXmppReferenceFn(entry, targetRefId) : false)
      || (mapped?.messageId && (entry?.id || "").toString() === mapped.messageId)
    )) || null;
    if (!target) return { handled: false, changed: false, channel };
    const canonicalActorId = typeof canonicalXmppRoomReactionActorIdFn === "function"
      ? canonicalXmppRoomReactionActorIdFn(bareRoom, payload.actorUserId || "")
      : (payload.actorUserId || "").toString().trim();
    const aliasActorId = typeof canonicalXmppRoomReactionActorIdFn === "function"
      ? canonicalXmppRoomReactionActorIdFn(bareRoom, payload.aliasActorId || "")
      : (payload.aliasActorId || "").toString().trim();
    let aliasChanged = false;
    if (aliasActorId && aliasActorId !== canonicalActorId && typeof applyXmppReactionsForActorFn === "function") {
      aliasChanged = applyXmppReactionsForActorFn(target, aliasActorId, [], {
        processingHints: payload.processingHints
      }).changed;
    }
    const applied = typeof applyXmppReactionsForActorFn === "function"
      ? applyXmppReactionsForActorFn(target, canonicalActorId, payload.emojis, { processingHints: payload.processingHints })
      : { handled: false, changed: false };
    const mergedRefIds = typeof normalizeXmppRefIdsListFn === "function"
      ? normalizeXmppRefIdsListFn([
        ...(typeof normalizeXmppRefIdsListFn === "function" ? normalizeXmppRefIdsListFn(target.xmppRefIds) : []),
        ...(typeof normalizeXmppRefIdsListFn === "function" ? normalizeXmppRefIdsListFn(payload.stanzaRefs) : []),
        payload.stanzaId || ""
      ])
      : [];
    const currentRefIds = typeof normalizeXmppRefIdsListFn === "function"
      ? normalizeXmppRefIdsListFn(target.xmppRefIds)
      : [];
    let metaChanged = false;
    if (mergedRefIds.length !== currentRefIds.length || mergedRefIds.some((entry, index) => entry !== currentRefIds[index])) {
      target.xmppRefIds = mergedRefIds;
      metaChanged = true;
    }
    const trackedRefs = typeof normalizeXmppRefIdsListFn === "function"
      ? normalizeXmppRefIdsListFn([
        ...(Array.isArray(target.xmppRefIds) ? target.xmppRefIds : []),
        target.xmppStanzaId || "",
        targetRefId,
        ...(Array.isArray(payload?.stanzaRefs) ? payload.stanzaRefs : []),
        payload?.stanzaId || ""
      ])
      : [];
    if (typeof rememberXmppRoomMessageFn === "function") trackedRefs.forEach((refId) => rememberXmppRoomMessageFn(bareRoom, refId, target));
    return {
      handled: true,
      changed: Boolean(applied.changed || metaChanged || aliasChanged),
      channel
    };
  }

  function applyXmppDmMessageRetraction(peerJid, targetRefId, payload = {}, deps = {}) {
    const bareJidFn = deps.bareJidFn;
    const findXmppDmThreadByPeerJidFn = deps.findXmppDmThreadByPeerJidFn;
    const findXmppDmMessageByAnyIdFn = deps.findXmppDmMessageByAnyIdFn;
    const messageMatchesXmppReferenceFn = deps.messageMatchesXmppReferenceFn;
    const applyXmppRetractionToMessageEntryFn = deps.applyXmppRetractionToMessageEntryFn;
    const normalizeXmppRefIdsListFn = deps.normalizeXmppRefIdsListFn;
    const rememberXmppDmMessageFn = deps.rememberXmppDmMessageFn;
    const barePeer = typeof bareJidFn === "function" ? bareJidFn(peerJid) : "";
    if (!barePeer || !targetRefId) return { handled: false, changed: false, contentChanged: false, thread: null };
    const thread = typeof findXmppDmThreadByPeerJidFn === "function" ? findXmppDmThreadByPeerJidFn(barePeer) : null;
    if (!thread || !Array.isArray(thread.messages)) return { handled: false, changed: false, contentChanged: false, thread: null };
    const mapped = typeof findXmppDmMessageByAnyIdFn === "function" ? findXmppDmMessageByAnyIdFn(barePeer, targetRefId) : null;
    const target = thread.messages.find((entry) => (
      (typeof messageMatchesXmppReferenceFn === "function" ? messageMatchesXmppReferenceFn(entry, targetRefId) : false)
      || (mapped?.messageId && (entry?.id || "").toString() === mapped.messageId)
    )) || null;
    if (!target) return { handled: false, changed: false, contentChanged: false, thread };
    const applied = typeof applyXmppRetractionToMessageEntryFn === "function"
      ? applyXmppRetractionToMessageEntryFn(target, payload)
      : { handled: false, changed: false, contentChanged: false };
    const trackedRefs = typeof normalizeXmppRefIdsListFn === "function"
      ? normalizeXmppRefIdsListFn([
        ...(Array.isArray(target.xmppRefIds) ? target.xmppRefIds : []),
        target.xmppStanzaId || "",
        targetRefId,
        ...(Array.isArray(payload?.stanzaRefs) ? payload.stanzaRefs : []),
        payload?.stanzaId || ""
      ])
      : [];
    if (typeof rememberXmppDmMessageFn === "function") trackedRefs.forEach((refId) => rememberXmppDmMessageFn(barePeer, refId, target));
    return {
      ...applied,
      thread
    };
  }

  function applyXmppRoomMessageRetraction(roomJid, targetRefId, payload = {}, deps = {}) {
    const bareJidFn = deps.bareJidFn;
    const xmppRoomByJid = deps.xmppRoomByJid;
    const findRelayTargetChannelByRoomFn = deps.findRelayTargetChannelByRoomFn;
    const findXmppRoomChannelByJidFn = deps.findXmppRoomChannelByJidFn;
    const findXmppRoomMessageByAnyIdFn = deps.findXmppRoomMessageByAnyIdFn;
    const messageMatchesXmppReferenceFn = deps.messageMatchesXmppReferenceFn;
    const applyXmppRetractionToMessageEntryFn = deps.applyXmppRetractionToMessageEntryFn;
    const normalizeXmppRefIdsListFn = deps.normalizeXmppRefIdsListFn;
    const rememberXmppRoomMessageFn = deps.rememberXmppRoomMessageFn;
    const bareRoom = typeof bareJidFn === "function" ? bareJidFn(roomJid) : "";
    if (!bareRoom || !targetRefId) return { handled: false, changed: false, contentChanged: false, channel: null };
    const roomToken = xmppRoomByJid?.get?.(bareRoom) || `xmpp:${bareRoom}`;
    const channel = (typeof findRelayTargetChannelByRoomFn === "function" ? findRelayTargetChannelByRoomFn(roomToken) : null)
      || (typeof findXmppRoomChannelByJidFn === "function" ? findXmppRoomChannelByJidFn(bareRoom) : null);
    if (!channel || !Array.isArray(channel.messages)) return { handled: false, changed: false, contentChanged: false, channel: null };
    const mapped = typeof findXmppRoomMessageByAnyIdFn === "function" ? findXmppRoomMessageByAnyIdFn(bareRoom, targetRefId) : null;
    const target = channel.messages.find((entry) => (
      (typeof messageMatchesXmppReferenceFn === "function" ? messageMatchesXmppReferenceFn(entry, targetRefId) : false)
      || (mapped?.messageId && (entry?.id || "").toString() === mapped.messageId)
    )) || null;
    if (!target) return { handled: false, changed: false, contentChanged: false, channel };
    const applied = typeof applyXmppRetractionToMessageEntryFn === "function"
      ? applyXmppRetractionToMessageEntryFn(target, payload)
      : { handled: false, changed: false, contentChanged: false };
    const trackedRefs = typeof normalizeXmppRefIdsListFn === "function"
      ? normalizeXmppRefIdsListFn([
        ...(Array.isArray(target.xmppRefIds) ? target.xmppRefIds : []),
        target.xmppStanzaId || "",
        targetRefId,
        ...(Array.isArray(payload?.stanzaRefs) ? payload.stanzaRefs : []),
        payload?.stanzaId || ""
      ])
      : [];
    if (typeof rememberXmppRoomMessageFn === "function") trackedRefs.forEach((refId) => rememberXmppRoomMessageFn(bareRoom, refId, target));
    return {
      ...applied,
      channel
    };
  }

  function applyXmppCorrectionFallback(targetRefId, payload = {}, deps = {}) {
    const key = (targetRefId || "").toString().trim();
    if (!key) return { handled: false, changed: false, contentChanged: false, scope: "", thread: null, channel: null };
    const dmThreads = Array.isArray(deps.dmThreads) ? deps.dmThreads : [];
    const guilds = Array.isArray(deps.guilds) ? deps.guilds : [];
    const messageMatchesXmppReferenceFn = deps.messageMatchesXmppReferenceFn;
    const applyXmppCorrectionToMessageEntryFn = deps.applyXmppCorrectionToMessageEntryFn;
    const getCurrentAccountFn = deps.getCurrentAccountFn;
    const getAccountByIdFn = deps.getAccountByIdFn;
    const bareJidFn = deps.bareJidFn;
    const normalizeXmppRefIdsListFn = deps.normalizeXmppRefIdsListFn;
    const rememberXmppDmMessageFn = deps.rememberXmppDmMessageFn;
    const rememberXmppRoomMessageFn = deps.rememberXmppRoomMessageFn;
    for (const thread of dmThreads) {
      if (!thread || !Array.isArray(thread.messages)) continue;
      const target = thread.messages.find((entry) => (
        typeof messageMatchesXmppReferenceFn === "function" ? messageMatchesXmppReferenceFn(entry, key) : false
      )) || null;
      if (!target) continue;
      const applied = typeof applyXmppCorrectionToMessageEntryFn === "function"
        ? applyXmppCorrectionToMessageEntryFn(target, payload)
        : { handled: false, changed: false, contentChanged: false };
      const current = typeof getCurrentAccountFn === "function" ? getCurrentAccountFn() : null;
      const participantIds = Array.isArray(thread.participantIds) ? thread.participantIds : [];
      const peerId = participantIds.find((id) => id && id !== current?.id) || "";
      const peerJid = typeof bareJidFn === "function"
        ? bareJidFn(typeof getAccountByIdFn === "function" ? getAccountByIdFn(peerId)?.xmppJid || "" : "")
        : "";
      const trackedRefs = typeof normalizeXmppRefIdsListFn === "function"
        ? normalizeXmppRefIdsListFn([
          ...(Array.isArray(target.xmppRefIds) ? target.xmppRefIds : []),
          target.xmppStanzaId || "",
          key,
          ...(Array.isArray(payload?.stanzaRefs) ? payload.stanzaRefs : []),
          payload?.stanzaId || ""
        ])
        : [];
      if (peerJid && typeof rememberXmppDmMessageFn === "function") trackedRefs.forEach((refId) => rememberXmppDmMessageFn(peerJid, refId, target));
      return { ...applied, scope: "dm", thread, channel: null };
    }
    for (const guild of guilds) {
      const channels = Array.isArray(guild?.channels) ? guild.channels : [];
      for (const channel of channels) {
        if (!channel || !Array.isArray(channel.messages)) continue;
        const target = channel.messages.find((entry) => (
          typeof messageMatchesXmppReferenceFn === "function" ? messageMatchesXmppReferenceFn(entry, key) : false
        )) || null;
        if (!target) continue;
        const applied = typeof applyXmppCorrectionToMessageEntryFn === "function"
          ? applyXmppCorrectionToMessageEntryFn(target, payload)
          : { handled: false, changed: false, contentChanged: false };
        const roomJid = typeof bareJidFn === "function" ? bareJidFn(channel.xmppRoomJid || "") : "";
        const trackedRefs = typeof normalizeXmppRefIdsListFn === "function"
          ? normalizeXmppRefIdsListFn([
            ...(Array.isArray(target.xmppRefIds) ? target.xmppRefIds : []),
            target.xmppStanzaId || "",
            key,
            ...(Array.isArray(payload?.stanzaRefs) ? payload.stanzaRefs : []),
            payload?.stanzaId || ""
          ])
          : [];
        if (roomJid && typeof rememberXmppRoomMessageFn === "function") trackedRefs.forEach((refId) => rememberXmppRoomMessageFn(roomJid, refId, target));
        return { ...applied, scope: "muc", thread: null, channel };
      }
    }
    return { handled: false, changed: false, contentChanged: false, scope: "", thread: null, channel: null };
  }

  function applyXmppReactionFallback(targetRefId, payload = {}, deps = {}) {
    const key = (targetRefId || "").toString().trim();
    if (!key) return { handled: false, changed: false, scope: "", thread: null, channel: null };
    const dmThreads = Array.isArray(deps.dmThreads) ? deps.dmThreads : [];
    const guilds = Array.isArray(deps.guilds) ? deps.guilds : [];
    const messageMatchesXmppReferenceFn = deps.messageMatchesXmppReferenceFn;
    const applyXmppReactionsForActorFn = deps.applyXmppReactionsForActorFn;
    const bareJidFn = deps.bareJidFn;
    const canonicalXmppRoomReactionActorIdFn = deps.canonicalXmppRoomReactionActorIdFn;
    for (const thread of dmThreads) {
      if (!thread || !Array.isArray(thread.messages)) continue;
      const target = thread.messages.find((entry) => (
        typeof messageMatchesXmppReferenceFn === "function" ? messageMatchesXmppReferenceFn(entry, key) : false
      )) || null;
      if (!target) continue;
      const applied = typeof applyXmppReactionsForActorFn === "function"
        ? applyXmppReactionsForActorFn(target, payload.actorUserId, payload.emojis, { processingHints: payload.processingHints })
        : { handled: false, changed: false };
      return { handled: true, changed: Boolean(applied.changed), scope: "dm", thread, channel: null };
    }
    for (const guild of guilds) {
      const channels = Array.isArray(guild?.channels) ? guild.channels : [];
      for (const channel of channels) {
        if (!channel || !Array.isArray(channel.messages)) continue;
        const target = channel.messages.find((entry) => (
          typeof messageMatchesXmppReferenceFn === "function" ? messageMatchesXmppReferenceFn(entry, key) : false
        )) || null;
        if (!target) continue;
        const roomJid = typeof bareJidFn === "function" ? bareJidFn(channel.xmppRoomJid || "") : "";
        const canonicalActorId = roomJid && typeof canonicalXmppRoomReactionActorIdFn === "function"
          ? canonicalXmppRoomReactionActorIdFn(roomJid, payload.actorUserId || "")
          : (payload.actorUserId || "").toString().trim();
        const aliasActorId = roomJid && typeof canonicalXmppRoomReactionActorIdFn === "function"
          ? canonicalXmppRoomReactionActorIdFn(roomJid, payload.aliasActorId || "")
          : (payload.aliasActorId || "").toString().trim();
        let aliasChanged = false;
        if (aliasActorId && aliasActorId !== canonicalActorId && typeof applyXmppReactionsForActorFn === "function") {
          aliasChanged = applyXmppReactionsForActorFn(target, aliasActorId, [], {
            processingHints: payload.processingHints
          }).changed;
        }
        const applied = typeof applyXmppReactionsForActorFn === "function"
          ? applyXmppReactionsForActorFn(target, canonicalActorId, payload.emojis, { processingHints: payload.processingHints })
          : { handled: false, changed: false };
        return { handled: true, changed: Boolean(applied.changed || aliasChanged), scope: "muc", thread: null, channel };
      }
    }
    return { handled: false, changed: false, scope: "", thread: null, channel: null };
  }

  function applyXmppRetractionFallback(targetRefId, payload = {}, deps = {}) {
    const key = (targetRefId || "").toString().trim();
    if (!key) return { handled: false, changed: false, contentChanged: false, scope: "", thread: null, channel: null };
    const dmThreads = Array.isArray(deps.dmThreads) ? deps.dmThreads : [];
    const guilds = Array.isArray(deps.guilds) ? deps.guilds : [];
    const messageMatchesXmppReferenceFn = deps.messageMatchesXmppReferenceFn;
    const applyXmppRetractionToMessageEntryFn = deps.applyXmppRetractionToMessageEntryFn;
    for (const thread of dmThreads) {
      if (!thread || !Array.isArray(thread.messages)) continue;
      const target = thread.messages.find((entry) => (
        typeof messageMatchesXmppReferenceFn === "function" ? messageMatchesXmppReferenceFn(entry, key) : false
      )) || null;
      if (!target) continue;
      const applied = typeof applyXmppRetractionToMessageEntryFn === "function"
        ? applyXmppRetractionToMessageEntryFn(target, payload)
        : { handled: false, changed: false, contentChanged: false };
      return { ...applied, scope: "dm", thread, channel: null };
    }
    for (const guild of guilds) {
      const channels = Array.isArray(guild?.channels) ? guild.channels : [];
      for (const channel of channels) {
        if (!channel || !Array.isArray(channel.messages)) continue;
        const target = channel.messages.find((entry) => (
          typeof messageMatchesXmppReferenceFn === "function" ? messageMatchesXmppReferenceFn(entry, key) : false
        )) || null;
        if (!target) continue;
        const applied = typeof applyXmppRetractionToMessageEntryFn === "function"
          ? applyXmppRetractionToMessageEntryFn(target, payload)
          : { handled: false, changed: false, contentChanged: false };
        return { ...applied, scope: "muc", thread: null, channel };
      }
    }
    return { handled: false, changed: false, contentChanged: false, scope: "", thread: null, channel: null };
  }

  globalScope.SHITCORD67_XEP_0308_0359_0424_0444_MESSAGE_UPDATES = Object.freeze({
    xmppStanzaReferenceIds,
    applyXmppDmMessageCorrection,
    applyXmppRoomMessageCorrection,
    applyXmppDmReactionUpdate,
    applyXmppRoomReactionUpdate,
    applyXmppDmMessageRetraction,
    applyXmppRoomMessageRetraction,
    applyXmppCorrectionFallback,
    applyXmppReactionFallback,
    applyXmppRetractionFallback
  });
  if (typeof globalScope.SHITCORD67_XEP_REGISTRY?.register === "function") {
    globalScope.SHITCORD67_XEP_REGISTRY.register(
      "xep-0308_0359_0424_0444-message-updates",
      globalScope.SHITCORD67_XEP_0308_0359_0424_0444_MESSAGE_UPDATES
    );
  }
})(typeof window !== "undefined" ? window : globalThis);
