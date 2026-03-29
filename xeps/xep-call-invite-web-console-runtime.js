/*
 * XMPP call-invite/web-call + XMPP console runtime helpers extracted from app.js.
 * Functions here intentionally bind to app globals at call time.
 */

function shortHashToken(rawValue = "") {
  const input = (rawValue || "").toString();
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function conversationCallRoomName(conversation = getActiveConversation(), roomOverride = "") {
  const override = normalizeConferenceRoomToken(roomOverride);
  if (override) return override;
  if (!conversation) return "";
  const prefs = getPreferences();
  const prefix = normalizeConferenceRoomPrefix(prefs.callRoomPrefix);
  const relayRoom = relayRoomForActiveConversation() || "";
  if (conversation.type === "dm") {
    const threadId = (conversation.thread?.id || "dm").toString();
    const peer = dmPeerAccountForThread(conversation.thread, state.currentAccountId || "");
    const peerSeed = (peer?.xmppJid || peer?.username || peer?.id || "").toString().toLowerCase();
    const seed = `dm:${threadId}:${relayRoom}:${peerSeed}`;
    const hash = shortHashToken(seed).slice(0, 8);
    return normalizeConferenceRoomToken(`${prefix}-dm-${hash}`).slice(0, 64);
  }
  const guildId = (state.activeGuildId || "").toString();
  const channelId = (conversation.channel?.id || "").toString();
  const channelType = (conversation.channel?.type || "text").toString();
  const channelName = normalizeConferenceRoomToken((conversation.channel?.name || "room").toString());
  const seed = `guild:${guildId}:${channelId}:${relayRoom}:${channelType}:${channelName}`;
  const hash = shortHashToken(seed).slice(0, 8);
  return normalizeConferenceRoomToken(`${prefix}-${channelType}-${channelName || "room"}-${hash}`).slice(0, 64);
}

function conversationCallUrl(conversation = getActiveConversation(), { roomOverride = "", screenShare = false } = {}) {
  const room = conversationCallRoomName(conversation, roomOverride);
  if (!room) return "";
  const base = normalizeConferenceProviderUrl(getPreferences().callProviderUrl);
  const hashParams = ["config.prejoinPageEnabled=true"];
  if (screenShare) hashParams.push("config.startScreenSharing=true");
  return `${base}/${encodeURIComponent(room)}#${hashParams.join("&")}`;
}

function normalizeCallInviteUrl(rawUrl = "") {
  return normalizeCallInviteUrlViaXep(rawUrl);
}

function stripTrailingUrlPunctuation(value = "") {
  return stripTrailingUrlPunctuationViaXep(value);
}

function looksLikeConferenceCallUrl(rawUrl = "") {
  return looksLikeConferenceCallUrlViaXep(rawUrl);
}

function parseCallInviteFromText(text = "") {
  return parseCallInviteFromTextViaXep(text);
}

function rememberXmppDirectMucInviteSeen(key = "") {
  return rememberXmppDirectMucInviteSeenViaXep(key);
}

function xmppSendDirectMucInvite(peerJid = "", roomJid = "", {
  reason = "",
  password = "",
  thread = "",
  continueThread = false,
  preferFull = true
} = {}) {
  if (!xmppConnection || !globalThis.$msg || relayStatus !== "connected") {
    return { ok: false, reason: "xmpp-offline" };
  }
  const to = xmppNormalizeCallTargetJid(peerJid, { preferFull }) || xmppBareJid(peerJid);
  const roomBare = normalizeXmppRoomJoinArg(roomJid);
  if (!to) return { ok: false, reason: "invalid-peer" };
  if (!roomBare) return { ok: false, reason: "invalid-room" };
  const stanzaId = `mucinv-${createId().slice(0, 12)}`;
  const reasonText = (reason || "").toString().trim().slice(0, 280);
  const passwordText = (password || "").toString().trim().slice(0, 120);
  const threadText = (thread || "").toString().trim().slice(0, 160);
  const attrs = {
    xmlns: XMPP_DIRECT_MUC_INVITE_NAMESPACE,
    jid: roomBare
  };
  if (reasonText) attrs.reason = reasonText;
  if (passwordText) attrs.password = passwordText;
  if (threadText) attrs.thread = threadText;
  if (continueThread) attrs.continue = "true";
  const stanza = globalThis.$msg({ to, type: "chat", id: stanzaId });
  const inviteBuilder = stanza.c("x", attrs);
  if (reasonText) inviteBuilder.c("reason").t(reasonText).up();
  if (passwordText) inviteBuilder.c("password").t(passwordText).up();
  inviteBuilder.up();
  const fallbackBody = `XMPP room invite: ${roomBare}${reasonText ? ` (${reasonText})` : ""}`;
  stanza.c("body").t(fallbackBody.slice(0, 320)).up();
  xmppConnection.send(stanza);
  addXmppDebugEvent("message", "Sent direct MUC invite", {
    to,
    roomJid: roomBare,
    id: stanzaId,
    reason: reasonText || "",
    hasPassword: Boolean(passwordText),
    continueThread: Boolean(continueThread)
  });
  return {
    ok: true,
    id: stanzaId,
    to,
    roomJid: roomBare
  };
}

function xmppSendCallInviteAction(peerJid = "", action = "invite", {
  inviteId = "",
  sessionId = "",
  url = "",
  fallbackBody = "",
  preferFull = false,
  messageType = "chat",
  audio = true,
  video = true
} = {}) {
  if (!xmppConnection || !globalThis.$msg || relayStatus !== "connected") return false;
  const stanzaType = (messageType || "chat").toString().trim().toLowerCase() === "groupchat"
    ? "groupchat"
    : "chat";
  const to = stanzaType === "groupchat"
    ? xmppBareJid(peerJid)
    : (xmppNormalizeCallTargetJid(peerJid, { preferFull }) || xmppBareJid(peerJid));
  if (!to) return false;
  const tag = (action || "").toString().trim().toLowerCase();
  if (!["invite", "accept", "reject", "retract", "left"].includes(tag)) return false;
  const trimmedInviteId = (inviteId || "").toString().trim();
  const trimmedSessionId = (sessionId || "").toString().trim();
  const trimmedFallbackBody = (fallbackBody || "").toString().trim();
  const stanzaId = tag === "invite"
    ? (trimmedInviteId || `ci-${createId().slice(0, 12)}`)
    : `ci-${createId().slice(0, 12)}`;
  if (tag !== "invite" && !trimmedInviteId) return false;
  const attrs = { xmlns: XMPP_CALL_INVITES_NAMESPACE, audio: audio ? "true" : "false", video: video ? "true" : "false" };
  if (tag === "invite") attrs.id = stanzaId;
  else attrs.id = trimmedInviteId;
  const stanza = globalThis.$msg({ to, type: stanzaType, id: stanzaId });
  const builder = stanza.c(tag, attrs);
  if ((tag === "invite" || tag === "accept") && trimmedSessionId) {
    builder.c("jingle", { xmlns: XMPP_JINGLE_NAMESPACE, sid: trimmedSessionId }).up();
  }
  if ((tag === "invite" || tag === "accept") && url) {
    builder.c("external", { uri: url }).up();
  }
  builder.up();
  if (XMPP_CALL_MESSAGE_NAMESPACE) {
    const legacyTag = tag === "invite" ? "propose" : (tag === "left" ? "finish" : tag);
    const legacyAttrs = { xmlns: XMPP_CALL_MESSAGE_NAMESPACE, video: video ? "true" : "false", multi: "false" };
    if (legacyTag === "propose") legacyAttrs.id = stanzaId;
    else legacyAttrs.id = trimmedInviteId;
    const legacyBuilder = stanza.c(legacyTag, legacyAttrs);
    if ((legacyTag === "propose" || legacyTag === "accept") && trimmedSessionId) {
      legacyBuilder.c("jingle", { xmlns: XMPP_CALL_MESSAGE_NAMESPACE, sid: trimmedSessionId }).up();
    }
    legacyBuilder.up();
  }
  if (trimmedFallbackBody) {
    stanza.c("body").t(trimmedFallbackBody.slice(0, 220)).up();
  }
  stanza.c("no-copy", { xmlns: "urn:xmpp:hints" }).up();
  stanza.c("no-store", { xmlns: "urn:xmpp:hints" }).up();
  xmppConnection.send(stanza);
  addXmppDebugEvent("call", `Sent call-invite ${tag}`, {
    to,
    messageType: stanzaType,
    id: trimmedInviteId || stanzaId,
    url,
    audio,
    video,
    preferFull: Boolean(preferFull),
    fallbackBody: trimmedFallbackBody ? "yes" : "no"
  });
  return stanzaId;
}

function resolveConversationById(conversationId = "", typeHint = "") {
  const id = (conversationId || "").toString().trim();
  if (!id) return null;
  if (typeHint === "dm") {
    const thread = state.dmThreads.find((entry) => entry.id === id) || null;
    return thread ? { type: "dm", thread, id: thread.id } : null;
  }
  if (typeHint === "channel") {
    const channel = findChannelById(id);
    return channel ? { type: "channel", channel, id: channel.id } : null;
  }
  const thread = state.dmThreads.find((entry) => entry.id === id) || null;
  if (thread) return { type: "dm", thread, id: thread.id };
  const channel = findChannelById(id);
  if (channel) return { type: "channel", channel, id: channel.id };
  return null;
}

function addSystemMessageToConversation(conversation, text) {
  if (!conversation || !text) return false;
  if (conversation.type === "dm") {
    const thread = conversation.thread;
    if (!thread || !Array.isArray(thread.messages)) return false;
    thread.messages.push({
      id: createId(),
      userId: null,
      authorName: "system",
      text: (text || "").toString().slice(0, 480),
      ts: new Date().toISOString(),
      reactions: [],
      attachments: []
    });
    return true;
  }
  if (conversation.type === "channel" && conversation.channel) {
    addSystemMessage(conversation.channel, text);
    return true;
  }
  return false;
}

function refreshConversationUi(conversation) {
  if (!conversation) return;
  if (conversation.type === "dm") {
    renderDmList();
    if (state.viewMode === "dm" && state.activeDmId === conversation.thread?.id) {
      renderMessages();
    }
    return;
  }
  if (conversation.type === "channel") {
    renderChannels();
    renderServers();
    if (state.activeChannelId === conversation.channel?.id) {
      renderMessages();
    }
  }
}

function stopWebCallRingtone(token = "") {
  if (token && token !== webCallRingtoneToken) return;
  if (webCallRingtoneInterval) {
    clearInterval(webCallRingtoneInterval);
    webCallRingtoneInterval = null;
  }
  if (webCallRingtoneContext && typeof webCallRingtoneContext.close === "function") {
    try {
      webCallRingtoneContext.close();
    } catch {
      // Ignore close failures.
    }
  }
  webCallRingtoneContext = null;
  webCallRingtoneToken = "";
}

function startWebCallRingtone(token) {
  if (!token) return;
  if (webCallRingtoneToken === token) return;
  stopWebCallRingtone();
  webCallRingtoneToken = token;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  try {
    const ctx = new AudioCtx();
    const gain = ctx.createGain();
    gain.gain.value = 0.12;
    gain.connect(ctx.destination);
    const playBeep = () => {
      if (ctx.state === "suspended") {
        void ctx.resume().catch(() => {});
      }
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = 520;
      osc.connect(gain);
      const now = ctx.currentTime;
      osc.start(now);
      osc.stop(now + 0.36);
    };
    playBeep();
    webCallRingtoneInterval = window.setInterval(playBeep, 1400);
    webCallRingtoneContext = ctx;
  } catch {
    // AudioContext can fail without user gesture; ignore.
  }
}

function buildWebCallInviteToken({ url = "", messageId = "", fromId = "" } = {}) {
  return buildWebCallInviteTokenViaXep({ url, messageId, fromId });
}

function markWebCallInviteSeen(token) {
  markWebCallInviteSeenViaXep(token);
}

function openWebCallLightbox(url, {
  conversation = null,
  screenShare = false,
  incoming = false,
  fromLabel = ""
} = {}) {
  if (!url) return;
  const conv = conversation || getActiveConversation();
  const title = screenShare ? "Screen-share call" : "Voice/video call";
  activeWebCallLightbox = conv
    ? {
        conversationId: conv.id || "",
        conversationType: conv.type || "",
        screenShare: Boolean(screenShare),
        fromLabel: fromLabel || "",
        incoming: Boolean(incoming),
        startedAt: Date.now(),
        url
      }
    : null;
  openConferenceLightbox(url, { title });
  if (conv) {
    const systemText = incoming
      ? `Joined ${fromLabel || "peer"} ${screenShare ? "screen-share" : "voice/video"} call.`
      : `You started a ${screenShare ? "screen-share" : "voice/video"} call.`;
    if (addSystemMessageToConversation(conv, systemText)) {
      refreshConversationUi(conv);
      saveState();
    }
  }
}

function ensureXmppCallSpeakingContext() {
  if (xmppCallSpeakingAudioContext) return xmppCallSpeakingAudioContext;
  try {
    xmppCallSpeakingAudioContext = new (window.AudioContext || window.webkitAudioContext)();
  } catch {
    xmppCallSpeakingAudioContext = null;
  }
  return xmppCallSpeakingAudioContext;
}

function xmppAnalyzeSpeakingLevel(analyser, buffer) {
  if (!analyser || !buffer) return 0;
  analyser.getByteTimeDomainData(buffer);
  let sum = 0;
  for (let i = 0; i < buffer.length; i += 1) {
    const centered = (buffer[i] - 128) / 128;
    sum += centered * centered;
  }
  return Math.sqrt(sum / buffer.length);
}

function updateXmppCallSpeakingUi(sessionId, speaking = {}) {
  const sid = (sessionId || "").toString().trim();
  if (!sid) return;
  const bar = document.querySelector(`.call-grid[data-session-id="${sid}"]`);
  if (!bar) return;
  const localEl = bar.querySelector("[data-call-speaker=\"local\"]");
  if (localEl) localEl.classList.toggle("call-tile--speaking", Boolean(speaking.local));
  if (speaking.remote && typeof speaking.remote === "object") {
    Object.entries(speaking.remote).forEach(([key, value]) => {
      const target = bar.querySelector(`[data-call-speaker="${key}"]`);
      if (target) target.classList.toggle("call-tile--speaking", Boolean(value));
    });
  }
}

function ensureXmppCallSpeakingMonitor(sessionId = "") {
  const sid = (sessionId || "").toString().trim();
  if (!sid) return;
  if (xmppCallSpeakingStateBySessionId.has(sid)) return;
  const session = xmppCallSessionById.get(sid) || null;
  if (!session) return;
  const ctx = ensureXmppCallSpeakingContext();
  if (!ctx) return;
  void ctx.resume().catch(() => null);
  const state = {
    local: null,
    remote: null,
    peerKey: xmppBareJid(session.peerJid || "") || "peer",
    rafId: 0
  };
  const buildAnalyzer = (stream) => {
    if (!stream || stream.getAudioTracks().length === 0) return null;
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    const source = ctx.createMediaStreamSource(stream);
    source.connect(analyser);
    return { analyser, source, buffer: new Uint8Array(analyser.fftSize) };
  };
  const refreshAnalyzers = () => {
    const localStream = xmppCallLocalMediaStreamBySessionId.get(sid) || null;
    if (!state.local || state.local.stream !== localStream) {
      if (state.local?.source) state.local.source.disconnect();
      const analyzer = buildAnalyzer(localStream);
      state.local = analyzer ? { stream: localStream, ...analyzer } : null;
    }
    const remoteStreams = xmppRemoteStreamListForSession(sid);
    const primaryRemote = remoteStreams[0] || null;
    if (!state.remote || state.remote.stream !== primaryRemote) {
      if (state.remote?.source) state.remote.source.disconnect();
      const analyzer = buildAnalyzer(primaryRemote);
      state.remote = analyzer ? { stream: primaryRemote, ...analyzer } : null;
    }
  };
  const tick = () => {
    refreshAnalyzers();
    const localLevel = state.local?.analyser ? xmppAnalyzeSpeakingLevel(state.local.analyser, state.local.buffer) : 0;
    const remoteLevel = state.remote?.analyser ? xmppAnalyzeSpeakingLevel(state.remote.analyser, state.remote.buffer) : 0;
    const speaking = {
      local: localLevel > 0.05,
      remote: { [state.peerKey]: remoteLevel > 0.05 }
    };
    updateXmppCallSpeakingUi(sid, speaking);
    state.rafId = window.requestAnimationFrame(tick);
  };
  state.rafId = window.requestAnimationFrame(tick);
  xmppCallSpeakingStateBySessionId.set(sid, state);
}

function stopXmppCallSpeakingMonitor(sessionId = "") {
  const sid = (sessionId || "").toString().trim();
  if (!sid) return;
  const state = xmppCallSpeakingStateBySessionId.get(sid);
  if (!state) return;
  if (state.rafId) cancelAnimationFrame(state.rafId);
  if (state.local?.source) state.local.source.disconnect();
  if (state.remote?.source) state.remote.source.disconnect();
  xmppCallSpeakingStateBySessionId.delete(sid);
}

function refreshCallBarForPeer(peerJid = "") {
  const peerBare = xmppBareJid(peerJid || "");
  if (!peerBare) return;
  const conversation = getActiveConversation();
  if (!conversation || conversation.type !== "dm") return;
  const current = getCurrentAccount();
  const activePeer = xmppBareJid(xmppPeerJidForDmThread(conversation.thread, current));
  if (activePeer && activePeer === peerBare) {
    renderMessages();
  }
}

function bindCallGateButton(button, handler) {
  if (!(button instanceof HTMLElement) || typeof handler !== "function") return;
  let lastTouchAt = 0;
  const run = (event, fromTouch = false) => {
    if (fromTouch) {
      lastTouchAt = Date.now();
      event?.preventDefault?.();
    } else if (lastTouchAt && Date.now() - lastTouchAt < 750) {
      event?.preventDefault?.();
      return;
    }
    const result = handler(event);
    if (result && typeof result.then === "function") void result;
  };
  button.addEventListener("pointerup", (event) => {
    if (event.pointerType !== "touch") return;
    run(event, true);
  });
  button.addEventListener("click", (event) => run(event, false));
}

function clearStaleXmppNativeCallSurface() {
  const activeSid = (xmppActiveNativeCallSessionId || "").toString().trim();
  if (!activeSid) return;
  const session = xmppCallSessionById.get(activeSid) || null;
  const state = (session?.state || "").toString().trim().toLowerCase();
  const staleStates = new Set(["peer-left", "terminated", "ended", "idle", "proceed-timeout"]);
  if (session && !staleStates.has(state)) return;
  xmppActiveNativeCallSessionId = "";
  if (typeof nativeCallSurfaceTickerId !== "undefined" && nativeCallSurfaceTickerId) {
    clearTimeout(nativeCallSurfaceTickerId);
    nativeCallSurfaceTickerId = 0;
  }
  if (typeof nativeCallSurfaceTickerSessionId !== "undefined") {
    nativeCallSurfaceTickerSessionId = "";
  }
}

function showIncomingWebCallPrompt({
  conversation,
  url,
  screenShare = false,
  fromLabel = "Peer",
  inviteToken = ""
} = {}) {
  if (!conversation || !url) return;
  const overlay = ensureMediaLightbox();
  const stage = overlay.querySelector(".media-lightbox__stage");
  const caption = overlay.querySelector(".media-lightbox__caption");
  if (!stage || !caption) return;
  stage.innerHTML = "";
  const gate = document.createElement("div");
  gate.className = "incoming-call-gate";
  const title = document.createElement("strong");
  title.className = "incoming-call-gate__title";
  title.textContent = screenShare ? "Incoming screen-share call" : "Incoming voice/video call";
  const meta = document.createElement("div");
  meta.className = "incoming-call-gate__meta";
  meta.textContent = `${fromLabel} is calling`;
  const urlPreview = document.createElement("div");
  urlPreview.className = "incoming-call-gate__url";
  urlPreview.textContent = url;
  const actions = document.createElement("div");
  actions.className = "incoming-call-gate__actions";
  const acceptBtn = document.createElement("button");
  acceptBtn.type = "button";
  acceptBtn.className = "incoming-call-gate__accept";
  acceptBtn.textContent = "Join Call";
  bindCallGateButton(acceptBtn, () => {
    stopWebCallRingtone(inviteToken);
    if (inviteToken) {
      const pending = webCallInvitePendingByToken.get(inviteToken);
      if (pending?.timeoutId) clearTimeout(pending.timeoutId);
      if (pending?.xmppInviteId && pending?.xmppPeerJid) {
        xmppSendCallInviteAction(pending.xmppPeerJid, "accept", {
          inviteId: pending.xmppInviteId,
          url
        });
      }
      webCallInvitePendingByToken.delete(inviteToken);
      if (pending?.xmppInviteId) xmppCallInviteTokenById.delete(pending.xmppInviteId);
    }
    openWebCallLightbox(url, {
      conversation,
      screenShare,
      incoming: true,
      fromLabel
    });
  });
  const declineBtn = document.createElement("button");
  declineBtn.type = "button";
  declineBtn.className = "incoming-call-gate__decline";
  declineBtn.textContent = "Ignore";
  bindCallGateButton(declineBtn, () => {
    stopWebCallRingtone(inviteToken);
    if (inviteToken) {
      const pending = webCallInvitePendingByToken.get(inviteToken);
      if (pending?.timeoutId) clearTimeout(pending.timeoutId);
      if (pending?.xmppInviteId && pending?.xmppPeerJid) {
        xmppSendCallInviteAction(pending.xmppPeerJid, "reject", {
          inviteId: pending.xmppInviteId,
          url
        });
      }
      webCallInvitePendingByToken.delete(inviteToken);
      if (pending?.xmppInviteId) xmppCallInviteTokenById.delete(pending.xmppInviteId);
    }
    closeMediaLightbox();
  });
  const copyBtn = document.createElement("button");
  copyBtn.type = "button";
  copyBtn.textContent = "Copy Link";
  bindCallGateButton(copyBtn, () => {
    void copyText(url).then((ok) => showToast(ok ? "Call link copied." : "Failed to copy call link.", { tone: ok ? "info" : "error" }));
  });
  actions.appendChild(acceptBtn);
  actions.appendChild(declineBtn);
  actions.appendChild(copyBtn);
  gate.appendChild(title);
  gate.appendChild(meta);
  gate.appendChild(urlPreview);
  gate.appendChild(actions);
  stage.appendChild(gate);
  caption.textContent = "Incoming call";
  overlay.hidden = false;
  document.body.style.overflow = "hidden";
  overlay.focus({ preventScroll: true });
}

async function acceptIncomingXmppCall(sessionId = "") {
  const sid = (sessionId || "").toString().trim();
  if (!sid) return false;
  const session = xmppCallSessionById.get(sid) || null;
  const peerBare = xmppBareJid(session?.peerJid || "");
  const peerTarget = xmppResolveSessionPeerJid(session, peerBare, { preferFull: true });
  if (!session || !peerBare) return false;
  if (session.state === "proceeded" || session.state === "accepted") {
    showToast("Call already accepted. Waiting for session-initiate.", { tone: "info", duration: 2400 });
    openNativeXmppCallSurface(sid);
    return true;
  }
  const isJinglePhase = (session.state || "").includes("session");
  if (isJinglePhase) {
    const ok = await xmppSendJingleSessionAccept(peerTarget || peerBare, sid, {
      media: Array.isArray(session?.media) && session.media.length > 0 ? session.media : XMPP_CALL_DEFAULT_MEDIA,
      screenShare: Boolean(session?.screenShare)
    });
    if (!ok) return false;
    if (addSystemDmMessageByPeerJid(peerBare, `Sent XMPP session-accept (${sid.slice(0, 8)}).`)) {
      refreshDmUiForPeerJid(peerBare);
    }
    openNativeXmppCallSurface(sid);
    return true;
  }
  if (xmppSessionIsMujiCallInvite(session)) {
    const sent = xmppSendMujiCallInviteActionForSession(session, "accept");
    const mujiRoom = xmppBareJid(session?.mujiRoomJid || "");
    const joinResult = mujiRoom
      ? handleJoinXmppCommand(mujiRoom, getCurrentAccount(), { focus: true })
      : { ok: false, joined: false, roomJid: "", message: "" };
    const latest = xmppCallSessionById.get(sid) || null;
    if (latest) {
      latest.state = "accepted";
      if (joinResult?.roomJid) latest.mujiRoomJid = joinResult.roomJid;
      latest.mujiJoined = Boolean(joinResult?.joined);
    }
    const roomLabel = (mujiRoom || peerBare).split("@")[0] || mujiRoom || peerBare;
    const summary = [
      sent ? "Accepted Muji call invite." : "Joined Muji room without sending explicit accept.",
      joinResult?.roomJid
        ? (joinResult.joined
          ? `Joining ${joinResult.roomJid}.`
          : `Mapped ${joinResult.roomJid} into XMPP Spaces.`)
        : ""
    ].filter(Boolean).join(" ");
    showToast(summary || `Accepted room call invite for ${roomLabel}.`);
    const conversation = resolveConversationById(latest?.conversationId || "", latest?.conversationType || "");
    if (conversation) {
      if (addSystemMessageToConversation(conversation, summary || `Accepted room call invite (${sid.slice(0, 8)}).`)) {
        refreshConversationUi(conversation);
      }
    }
    return Boolean(sent || joinResult?.ok);
  }
  const callInviteId = (session.callInviteId || "").toString().trim();
  const callInviteOnly = Boolean(
    callInviteId
    && (session.inviteSignal || "").toString().trim().toLowerCase() === "call-invite"
    && !session.callInviteHasJingleSid
  );
  const peerFull = (session.peerFullJid || peerTarget || "").toString().trim();
  const peerResource = peerFull.includes("/") ? peerFull.split("/").slice(1).join("/") : "";
  const isMovimPeer = peerResource.toLowerCase().startsWith("movim");
  const movimAcceptNamespaces = ["urn:xmpp:jingle:jingle-message:0", "urn:xmpp:jingle-message:0"];
  const movimProceedNamespaces = ["urn:xmpp:jingle-message:0"];
  const sentCallInviteAccept = callInviteId
    ? Boolean(xmppSendCallInviteAction(peerTarget || peerBare, "accept", {
      inviteId: callInviteId,
      ...(callInviteOnly ? {} : { sessionId: sid }),
      audio: session.media?.includes("audio") !== false,
      video: session.media?.includes("video") !== false
    }))
    : false;
  const sentProceed = callInviteOnly
    ? false
    : xmppSendJingleMessageAction(peerTarget || peerBare, "proceed", {
      sessionId: sid,
      namespaces: isMovimPeer ? movimProceedNamespaces : xmppPreferredJingleMessageNamespaces(session),
      preferFull: true
    });
  const sentProceedBare = false;
  // Keep compatibility action opt-in per session to avoid duplicate JMI state on strict clients.
  const sentAcceptCompat = (callInviteOnly || isMovimPeer || !session.sendAcceptCompat)
    ? false
    : xmppSendJingleMessageAction(peerTarget || peerBare, "accept", {
      sessionId: sid,
      namespaces: xmppPreferredJingleMessageNamespaces(session),
      preferFull: true
    });
  const sentAcceptCompatBare = false;
  const sent = Boolean(sentCallInviteAccept || sentProceed || sentProceedBare || sentAcceptCompat || sentAcceptCompatBare);
  if (sent) {
    const entry = xmppCallSessionById.get(sid);
    if (entry) {
      entry.state = callInviteOnly ? "accepted" : "proceeded";
      try {
        const info = await xmppFetchDiscoInfoCached(peerBare, { force: false });
        const evalResult = xmppEvaluateCallFeatures(info?.features || new Set());
        entry.interopReady = Boolean(evalResult.ready);
        entry.interopFeatureReason = evalResult.ready ? "ok" : "missing-features";
        addXmppDebugEvent("call", "Call interop check for incoming propose", {
          peer: peerBare,
          ready: evalResult.ready,
          features: [...(info?.features || [])]
        });
      } catch (error) {
        entry.interopReady = false;
        entry.interopFeatureReason = "discovery-failed";
        addXmppDebugEvent("call", "Call interop check failed for incoming propose", {
          peer: peerBare,
          error: String(error?.message || error)
        });
      }
      if (!entry.fallbackInviteSent) {
        if (entry.acceptTimeoutId) clearTimeout(entry.acceptTimeoutId);
        const timeoutMs = isMovimPeer ? Math.min(2500, XMPP_CALL_SIGNAL_TIMEOUT_MS) : XMPP_CALL_SIGNAL_TIMEOUT_MS;
        entry.acceptTimeoutId = window.setTimeout(() => {
          void (async () => {
            const current = xmppCallSessionById.get(sid);
            if (!current || (current.state || "").includes("session")) return;
            const currentPeerFull = (current.peerFullJid || peerFull || peerTarget || "").toString().trim();
            const currentResource = currentPeerFull.includes("/") ? currentPeerFull.split("/").slice(1).join("/") : "";
            const isMovimTimeoutPeer = isMovimPeer || currentResource.toLowerCase().startsWith("movim");
            const proposedMedia = Array.isArray(current?.proposedMedia)
              ? current.proposedMedia.filter((entry) => entry === "audio" || entry === "video")
              : [];
            const fallbackMedia = proposedMedia.length > 0
              ? proposedMedia
              : (Array.isArray(current?.media) && current.media.length > 0 ? current.media : XMPP_CALL_DEFAULT_MEDIA);
            const shouldAttemptResponderInitiate = Boolean(
              XMPP_CALL_ENABLE_RESPONDER_SESSION_INITIATE_FALLBACK
              && !current.responderInitiateAttempted
              && (
                isMovimTimeoutPeer
                || current.interopReady === false
                || current.interopFeatureReason === "discovery-failed"
              )
            );
            if (isMovimTimeoutPeer) {
              addXmppDebugEvent("call", "Movim stalled before session-initiate", {
                peer: peerBare,
                sid,
                error: "setCodecPreferences on undefined video transceiver"
              });
              showToast("Movim stalled before session-initiate (caller JS crash).", { tone: "error", duration: 4200 });
              if (addSystemDmMessageByPeerJid(peerBare, `Movim stalled before session-initiate (${sid.slice(0, 8)}). Likely Movim JS error: setCodecPreferences on missing video transceiver. Ask the caller to update Movim or try enabling video.`)) {
                refreshDmUiForPeerJid(peerBare);
              }
            } else {
              showToast("No session-initiate received yet. The caller may not support native calls.", { tone: "error", duration: 3200 });
              const reasonLabel = (current.interopFeatureReason || "").toString().trim();
              const systemDetail = shouldAttemptResponderInitiate
                ? `No session-initiate received for XMPP call (${sid.slice(0, 8)}). Trying responder-side session-initiate fallback for this peer.`
                : `No session-initiate received for XMPP call (${sid.slice(0, 8)}). Keeping the native call idle; no local Web Call fallback was opened.`;
              addXmppDebugEvent("call", "Peer stalled before session-initiate", {
                peer: peerBare,
                sid,
                interopReady: current.interopReady !== false,
                reason: reasonLabel || "unknown"
              });
              if (addSystemDmMessageByPeerJid(peerBare, systemDetail)) {
                refreshDmUiForPeerJid(peerBare);
              }
            }
            if (shouldAttemptResponderInitiate) {
              current.responderInitiateAttempted = true;
              current.state = "responder-session-initiate";
              const retryTarget = xmppResolveSessionPeerJid(current, peerBare, { preferFull: true }) || peerBare;
              const peerKind = isMovimTimeoutPeer ? "Movim" : "peer";
              addXmppDebugEvent("call", "Attempting responder session-initiate fallback", {
                peer: retryTarget,
                sid
              });
              if (addSystemDmMessageByPeerJid(peerBare, `Attempting responder session-initiate fallback for ${peerKind} (${sid.slice(0, 8)}).`)) {
                refreshDmUiForPeerJid(peerBare);
              }
              if (typeof xmppSendJingleSessionInitiate !== "function") {
                addXmppDebugEvent("error", "Responder session-initiate fallback unavailable", {
                  peer: retryTarget,
                  sid
                });
                current.state = "proceed-timeout";
              } else {
                const initiated = await xmppSendJingleSessionInitiate(retryTarget, sid, {
                  media: fallbackMedia,
                  screenShare: Boolean(current?.screenShare),
                  onSuccess: () => {
                    const latest = xmppCallSessionById.get(sid);
                    if (latest) latest.state = "session-initiate-sent";
                    if (addSystemDmMessageByPeerJid(peerBare, `Sent XMPP session-initiate (${sid.slice(0, 8)}) via responder fallback.`)) {
                      refreshDmUiForPeerJid(peerBare);
                    }
                  },
                  onError: () => {
                    const latest = xmppCallSessionById.get(sid);
                    if (latest) latest.state = "proceed-timeout";
                  }
                });
                if (initiated) return;
                current.state = "proceed-timeout";
              }
            }
            if (!current.fallbackInviteSent) {
              current.fallbackInviteSent = true;
              current.state = "proceed-timeout";
              if (xmppActiveNativeCallSessionId === sid) closeMediaLightbox();
            }
          })();
        }, timeoutMs);
      }
    }
    const acceptedLabel = callInviteOnly ? "invite" : "proposal";
    if (addSystemDmMessageByPeerJid(peerBare, `Accepted XMPP call ${acceptedLabel} (${sid.slice(0, 8)}). Waiting for session-initiate.`)) {
      refreshDmUiForPeerJid(peerBare);
    }
    openNativeXmppCallSurface(sid);
    refreshCallBarForPeer(peerBare);
  } else {
    addXmppDebugEvent("call", "Failed to send incoming call accept signaling", {
      peer: peerBare,
      sid,
      peerTarget: peerTarget || peerBare,
      callInviteId,
      callInviteOnly,
      isMovimPeer
    });
    showToast("Failed to send XMPP call accept signaling.", { tone: "error", duration: 3200 });
  }
  return sent;
}

function declineIncomingXmppCall(sessionId = "") {
  const sid = (sessionId || "").toString().trim();
  if (!sid) return false;
  const session = xmppCallSessionById.get(sid) || null;
  const peerBare = xmppBareJid(session?.peerJid || "");
  const peerTarget = xmppResolveSessionPeerJid(session, peerBare, { preferFull: true });
  if (!session || !peerBare) return false;
  if (xmppSessionIsMujiCallInvite(session)) {
    const action = ["accepted", "joined", "in-room"].includes((session.state || "").toString().trim().toLowerCase())
      ? "left"
      : "reject";
    const sent = xmppSendMujiCallInviteActionForSession(session, action);
    forgetXmppCallSession(sid);
    return sent;
  }
  const isJinglePhase = (session.state || "").includes("session");
  const callInviteId = (session.callInviteId || "").toString().trim();
  const sent = isJinglePhase
    ? xmppSendJingleSessionTerminate(peerTarget || peerBare, sid, { reason: "decline", text: "Call rejected" })
    : Boolean(
      (callInviteId
        ? xmppSendCallInviteAction(peerTarget || peerBare, "reject", {
          inviteId: callInviteId,
          audio: session.media?.includes("audio") !== false,
          video: session.media?.includes("video") !== false
        })
        : false)
      || xmppSendJingleMessageAction(peerTarget || peerBare, "reject", {
        sessionId: sid,
        namespaces: xmppPreferredJingleMessageNamespaces(session),
        preferFull: true
      })
    );
  forgetXmppCallSession(sid);
  return sent;
}

function showIncomingXmppCallPrompt({
  sessionId = "",
  peerLabel = "Peer",
  screenShare = false
} = {}) {
  const sid = (sessionId || "").toString().trim();
  if (!sid) return;
  clearStaleXmppNativeCallSurface();
  const overlay = ensureMediaLightbox();
  const stage = overlay.querySelector(".media-lightbox__stage");
  const caption = overlay.querySelector(".media-lightbox__caption");
  if (!stage || !caption) return;
  stage.innerHTML = "";
  const gate = document.createElement("div");
  gate.className = "incoming-call-gate";
  const title = document.createElement("strong");
  title.className = "incoming-call-gate__title";
  title.textContent = screenShare ? "Incoming XMPP screen-share call" : "Incoming XMPP voice/video call";
  const meta = document.createElement("div");
  meta.className = "incoming-call-gate__meta";
  meta.textContent = `${peerLabel} is calling`;
  const actions = document.createElement("div");
  actions.className = "incoming-call-gate__actions";
  const acceptBtn = document.createElement("button");
  acceptBtn.type = "button";
  acceptBtn.className = "incoming-call-gate__accept";
  acceptBtn.textContent = "Accept";
  bindCallGateButton(acceptBtn, async () => {
    acceptBtn.disabled = true;
    declineBtn.disabled = true;
    stopWebCallRingtone(sid);
    const ok = await acceptIncomingXmppCall(sid);
    if (ok) {
      openNativeXmppCallSurface(sid);
      return;
    }
    acceptBtn.disabled = false;
    declineBtn.disabled = false;
  });
  const declineBtn = document.createElement("button");
  declineBtn.type = "button";
  declineBtn.className = "incoming-call-gate__decline";
  declineBtn.textContent = "Decline";
  bindCallGateButton(declineBtn, () => {
    stopWebCallRingtone(sid);
    declineIncomingXmppCall(sid);
    closeMediaLightbox();
  });
  actions.appendChild(acceptBtn);
  actions.appendChild(declineBtn);
  gate.appendChild(title);
  gate.appendChild(meta);
  gate.appendChild(actions);
  stage.appendChild(gate);
  caption.textContent = "Incoming XMPP call";
  overlay.hidden = false;
  document.body.style.overflow = "hidden";
  overlay.focus({ preventScroll: true });
}

function maybeHandleIncomingWebCallInvite({
  conversation,
  message,
  fromAccount,
  history = false
} = {}) {
  if (!conversation || !message || history) return;
  const current = getCurrentAccount();
  if (current && message.userId === current.id) return;
  let invite = parseCallInviteFromText(message.text || "");
  if (!invite) {
    const attachmentUrl = Array.isArray(message.attachments)
      ? message.attachments
        .map((entry) => normalizeCallInviteUrl((entry?.url || "").toString()))
        .find((entry) => entry && looksLikeConferenceCallUrl(entry))
      : "";
    if (attachmentUrl) {
      invite = {
        url: attachmentUrl,
        screenShare: false,
        providerMatches: false
      };
    }
  }
  if (!invite || !invite.url) return;
  const sentAt = toTimestampMs(message.ts);
  if (!Number.isFinite(sentAt)) return;
  if (Date.now() - sentAt > WEB_CALL_INVITE_MAX_AGE_MS) return;
  const fromId = fromAccount?.id || message.userId || "";
  const token = buildWebCallInviteToken({
    url: invite.url,
    messageId: message.id || message.xmppStanzaId || "",
    fromId
  });
  if (!token || webCallInviteSeenTokens.has(token)) return;
  markWebCallInviteSeen(token);
  const fromLabel = fromAccount
    ? displayNameForAccount(fromAccount, findGuildByChannelId(conversation.channel?.id || "")?.id || null)
    : "Peer";
  startWebCallRingtone(token);
  const pendingTimeoutId = window.setTimeout(() => {
    webCallInvitePendingByToken.delete(token);
    stopWebCallRingtone(token);
    const missedText = `${fromLabel} called but you missed it.`;
    if (addSystemMessageToConversation(conversation, missedText)) {
      refreshConversationUi(conversation);
      saveState();
    }
  }, WEB_CALL_INVITE_TIMEOUT_MS);
  webCallInvitePendingByToken.set(token, {
    conversationId: conversation.id || "",
    conversationType: conversation.type || "",
    fromLabel,
    timeoutId: pendingTimeoutId
  });
  const incomingText = `${fromLabel} started a ${invite.screenShare ? "screen-share" : "voice/video"} call.`;
  if (addSystemMessageToConversation(conversation, incomingText)) {
    refreshConversationUi(conversation);
    saveState();
  }
  showIncomingWebCallPrompt({
    conversation,
    url: invite.url,
    screenShare: invite.screenShare,
    fromLabel,
    inviteToken: token
  });
}

function maybeHandleIncomingXmppCallInvite({
  conversation,
  peerJid = "",
  invite = null,
  history = false
} = {}) {
  if (!conversation || !invite || history) return false;
  const url = normalizeCallInviteUrl((invite.url || "").toString());
  if (!url) return false;
  const inviteId = (invite.id || "").toString().trim();
  const peerBare = xmppBareJid(peerJid || "");
  const token = buildWebCallInviteToken({
    url,
    messageId: inviteId || url,
    fromId: peerBare || "xmpp"
  });
  if (!token || webCallInviteSeenTokens.has(token)) return false;
  markWebCallInviteSeen(token);
  const pendingTimeoutId = window.setTimeout(() => {
    if (!token) return;
    webCallInvitePendingByToken.delete(token);
    if (inviteId) xmppCallInviteTokenById.delete(inviteId);
  }, WEB_CALL_INVITE_TIMEOUT_MS);
  webCallInvitePendingByToken.set(token, {
    conversationId: conversation.id || "",
    conversationType: conversation.type || "",
    fromLabel: peerBare || "Peer",
    timeoutId: pendingTimeoutId,
    xmppInviteId: inviteId || "",
    xmppPeerJid: peerBare || "",
    url
  });
  if (inviteId) xmppCallInviteTokenById.set(inviteId, token);
  showIncomingWebCallPrompt({
    conversation,
    url,
    screenShare: Boolean(invite.screenShare),
    fromLabel: peerBare || "Peer",
    inviteToken: token
  });
  return true;
}

function postCallInviteToConversation(conversation, account, url, { screenShare = false } = {}) {
  if (!conversation || !account || !url) return false;
  const message = {
    id: createId(),
    userId: account.id,
    authorName: "",
    text: `${screenShare ? "🖥️ Screen-share call" : "📞 Voice/video call"}: ${url}`,
    ts: new Date().toISOString(),
    reactions: [],
    attachments: []
  };
  if (conversation.type === "dm") {
    conversation.thread.messages.push(message);
    publishRelayDirectMessage(conversation.thread, message, account);
    return true;
  }
  if (conversation.channel?.type === "voice" || conversation.channel?.type === "stage") {
    return false;
  }
  conversation.channel.messages.push(message);
  publishRelayChannelMessage(conversation.channel, message, account);
  return true;
}

function postWebCallInviteForConversation({
  conversation = null,
  conversationId = "",
  conversationType = "",
  screenShare = false,
  roomOverride = "",
  forcePost = true,
  showToastInfo = true,
  allowActiveFallback = true
} = {}) {
  const account = getCurrentAccount();
  const resolved = conversation
    || resolveConversationById(conversationId, conversationType)
    || (allowActiveFallback ? getActiveConversation() : null);
  if (!resolved) {
    if (showToastInfo) showToast("No conversation available for call invite.", { tone: "error" });
    return "";
  }
  const url = conversationCallUrl(resolved, { roomOverride, screenShare });
  if (!url) {
    if (showToastInfo) showToast("Could not resolve call room URL.", { tone: "error" });
    return "";
  }
  if (forcePost) {
    if (!account) {
      if (showToastInfo) showToast("No account available to post call invite.", { tone: "error" });
      return "";
    }
    const posted = postCallInviteToConversation(resolved, account, url, { screenShare });
    if (posted) {
      saveState();
      refreshConversationUi(resolved);
    } else if (showToastInfo) {
      showToast("Could not post call invite in this conversation.", { tone: "error" });
      return "";
    }
  }
  return url;
}

function openConferenceLightbox(url, { title = "Realtime call" } = {}) {
  if (!url) return;
  const overlay = ensureMediaLightbox();
  const stage = overlay.querySelector(".media-lightbox__stage");
  const caption = overlay.querySelector(".media-lightbox__caption");
  if (!stage || !caption) return;
  stage.innerHTML = "";

  const frame = document.createElement("iframe");
  frame.className = "media-lightbox__media media-lightbox__media--frame";
  frame.src = url;
  frame.loading = "eager";
  frame.allow = "camera; microphone; display-capture; fullscreen; autoplay; clipboard-write";
  frame.referrerPolicy = "no-referrer";

  const controls = document.createElement("div");
  controls.className = "external-link-gate__actions";

  const externalBtn = document.createElement("button");
  externalBtn.type = "button";
  externalBtn.textContent = "Open External";
  externalBtn.addEventListener("click", () => {
    if (nativeWindowOpen) nativeWindowOpen(url, "_blank", "noopener,noreferrer");
    else openExternalUrlInClient(url);
  });

  const copyBtn = document.createElement("button");
  copyBtn.type = "button";
  copyBtn.textContent = "Copy URL";
  copyBtn.addEventListener("click", async () => {
    const ok = await copyText(url);
    showToast(ok ? "Call URL copied." : "Could not copy call URL.", { tone: ok ? "info" : "error" });
  });

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.textContent = /call/i.test((title || "").toString()) ? "Leave Call" : "Close";
  closeBtn.addEventListener("click", () => closeMediaLightbox({ force: true }));

  controls.appendChild(externalBtn);
  controls.appendChild(copyBtn);
  controls.appendChild(closeBtn);

  stage.appendChild(frame);
  stage.appendChild(controls);
  caption.textContent = title;
  overlay.hidden = false;
  document.body.style.overflow = "hidden";
  overlay.focus({ preventScroll: true });
}

function launchConversationCall({
  screenShare = false,
  roomOverride = "",
  copyOnly = false,
  autoPost = true,
  allowNative = true
} = {}) {
  const conversation = getActiveConversation();
  const account = getCurrentAccount();
  if (!conversation) {
    showToast("Open a channel or DM first.", { tone: "error" });
    return "";
  }
  if (allowNative && !copyOnly && conversation.type === "dm" && canAttemptNativeXmppCall()) {
    void launchNativeXmppConversationCall({ screenShare, allowWebFallback: false }).then((ok) => {
      if (ok) return;
      launchConversationCall({
        screenShare,
        roomOverride,
        copyOnly,
        autoPost,
        allowNative: false
      });
    });
    return "";
  }
  const url = conversationCallUrl(conversation, { roomOverride, screenShare });
  if (!url) {
    showToast("Could not resolve call room URL.", { tone: "error" });
    return "";
  }
  if (copyOnly) {
    void copyText(url).then((ok) => showToast(ok ? "Call link copied." : "Failed to copy call link.", { tone: ok ? "info" : "error" }));
    return url;
  }
  openWebCallLightbox(url, { conversation, screenShare, incoming: false });
  if (autoPost && getPreferences().callAutoPost === "on" && account) {
    const posted = postCallInviteToConversation(conversation, account, url, { screenShare });
    if (posted) {
      saveState();
      renderMessages();
      renderChannels();
      renderDmList();
    }
  }
  return url;
}

function canAttemptNativeXmppCall() {
  const prefs = getPreferences();
  return Boolean(
    prefs.relayMode === "xmpp"
    && relayStatus === "connected"
    && xmppConnection
    && typeof globalThis.RTCPeerConnection === "function"
  );
}

function xmppSerializePayload(payload) {
  if (!payload) return "";
  try {
    if (typeof payload === "string") return payload;
    if (typeof payload.tree === "function") {
      const node = payload.tree();
      if (node) return new XMLSerializer().serializeToString(node);
    }
    if (payload.nodeType) return new XMLSerializer().serializeToString(payload);
    if (typeof payload.toString === "function") return payload.toString();
    return JSON.stringify(payload);
  } catch {
    return String(payload);
  }
}

function trimXmppRaw(value, limit = XMPP_DEBUG_RAW_TRUNCATE) {
  const text = (value || "").toString();
  if (text.length <= limit) return text;
  return `${text.slice(0, limit)} ... [truncated ${text.length - limit} chars]`;
}

function addXmppDebugEvent(category, message, data = null) {
  const entry = {
    ts: new Date().toISOString(),
    category: (category || "misc").toString(),
    message: (message || "").toString(),
    data
  };
  xmppDebugEvents.push(entry);
  if (xmppDebugEvents.length > XMPP_DEBUG_EVENT_LIMIT) xmppDebugEvents.shift();
  const electronBridge = globalThis?.s67Electron || null;
  if (electronBridge && typeof electronBridge.emitLogEvent === "function") {
    try {
      const sid = (data && typeof data === "object")
        ? (
          data.sid
          || data.sessionId
          || data.session_id
          || data.jingleSid
          || ""
        )
        : "";
      electronBridge.emitLogEvent({
        ts: entry.ts,
        source: "renderer-xmpp",
        category: entry.category,
        message: entry.message,
        data: entry.data,
        sessionId: String(sid || "").trim()
      });
    } catch {
      // Ignore IPC log mirror failures.
    }
  }
  if (ui.xmppConsoleDialog?.open && !xmppDebugPaused) renderXmppConsoleDialog();
}

function formatXmppConsoleLogs() {
  const normalizedFilter = (xmppDebugFilter || "all").toString();
  const searchToken = (xmppDebugSearch || "").toString().trim().toLowerCase();
  const filtered = xmppDebugEvents.filter((entry) => {
    const category = (entry.category || "").toLowerCase();
    const message = (entry.message || "").toLowerCase();
    let dataText = "";
    if (entry.data != null) {
      try {
        dataText = JSON.stringify(entry.data).toLowerCase();
      } catch {
        dataText = String(entry.data).toLowerCase();
      }
    }
    if (normalizedFilter !== "all") {
      if (normalizedFilter === "message" && !["message", "stanza"].includes(category)) return false;
      else if (normalizedFilter === "raw" && category !== "raw") return false;
      else if (normalizedFilter !== "message" && normalizedFilter !== "raw" && category !== normalizedFilter) return false;
    }
    if (!searchToken) return true;
    return message.includes(searchToken) || dataText.includes(searchToken) || category.includes(searchToken);
  });
  const runtime = {
    relayMode: getPreferences().relayMode,
    relayStatus,
    xmppConnected: Boolean(xmppConnection),
    xmppRuntimeReady,
    xmppRuntimeLastError: xmppRuntimeLastError || "",
    filter: normalizedFilter,
    search: searchToken || "",
    paused: xmppDebugPaused,
    eventsTotal: xmppDebugEvents.length,
    eventsShown: filtered.length,
    activeCallSessions: xmppCallDebugSnapshotAll().slice(0, 8)
  };
  const lines = filtered.map((entry) => {
    const head = `[${entry.ts}] [${entry.category}] ${entry.message}`;
    if (entry.data == null) return head;
    let body = "";
    try {
      body = typeof entry.data === "string" ? entry.data : JSON.stringify(entry.data, null, 2);
    } catch {
      body = String(entry.data);
    }
    return `${head}\n${trimXmppRaw(body)}`;
  });
  return `${JSON.stringify(runtime, null, 2)}\n\n${lines.join("\n\n") || "(no XMPP events yet)"}`;
}

function renderXmppConsoleDialog() {
  if (!ui.xmppConsoleOutput) return;
  const nativeCreds = typeof window !== "undefined" ? (window.SHITCORD67_NATIVE_CREDENTIALS || null) : null;
  const isAndroid = Boolean(nativeCreds && typeof nativeCreds.isAndroid === "function" && nativeCreds.isAndroid());
  if (ui.xmppConsoleDocsChangeBtn) {
    ui.xmppConsoleDocsChangeBtn.hidden = !isAndroid;
    ui.xmppConsoleDocsChangeBtn.disabled = !isAndroid;
  }
  if (ui.xmppConsoleDocsDebugBtn) {
    ui.xmppConsoleDocsDebugBtn.hidden = !isAndroid;
    ui.xmppConsoleDocsDebugBtn.disabled = !isAndroid;
    if (!ui.xmppConsoleDocsDebugBtn.dataset.enabled) {
      ui.xmppConsoleDocsDebugBtn.dataset.enabled = "off";
      ui.xmppConsoleDocsDebugBtn.textContent = "Enable Docs Debug Logs";
    }
  }
  if (ui.xmppConsoleFilterInput) ui.xmppConsoleFilterInput.value = xmppDebugFilter;
  if (ui.xmppConsoleSearchInput && ui.xmppConsoleSearchInput.value !== xmppDebugSearch) ui.xmppConsoleSearchInput.value = xmppDebugSearch;
  if (ui.pauseXmppConsoleBtn) ui.pauseXmppConsoleBtn.textContent = xmppDebugPaused ? "Resume" : "Pause";
  ui.xmppConsoleOutput.textContent = formatXmppConsoleLogs();
}

function openXmppConsoleDialog() {
  renderXmppConsoleDialog();
  ui.xmppConsoleDialog?.showModal();
}

function xmppConsoleScopeTargetFromConversation(conversation = getActiveConversation(), account = getCurrentAccount()) {
  if (!conversation) return { kind: "", token: "" };
  if (conversation.type === "dm" && conversation.thread) {
    const peerJid = xmppPeerJidForDmThread(conversation.thread, account);
    const token = xmppBareJid(peerJid);
    if (token) return { kind: "dm", token };
  }
  if (conversation.type === "channel" && conversation.channel?.xmppRoomJid) {
    const token = xmppBareJid(conversation.channel.xmppRoomJid);
    if (token) return { kind: "room", token };
  }
  return { kind: "", token: "" };
}

function applyXmppConsoleScopeArg(rawArg = "", conversation = getActiveConversation(), account = getCurrentAccount()) {
  const argText = (rawArg || "").toString().trim();
  if (!argText || /^all$/i.test(argText) || /^clear$/i.test(argText) || /^reset$/i.test(argText)) {
    xmppDebugSearch = "";
    return { ok: true, scoped: false, token: "", message: "Opened full XMPP inspector log." };
  }
  const scopeFromConversation = xmppConsoleScopeTargetFromConversation(conversation, account);
  const [scopeRaw, ...rest] = argText.split(/\s+/).filter(Boolean);
  const scope = (scopeRaw || "").toString().trim().toLowerCase();
  let token = "";
  if (scope === "here") {
    token = scopeFromConversation.token;
  } else if (scope === "dm" || scope === "peer" || scope === "jid" || scope === "user") {
    token = xmppBareJid(rest.join(" ")) || (scopeFromConversation.kind === "dm" ? scopeFromConversation.token : "");
  } else if (scope === "room" || scope === "channel" || scope === "muc") {
    token = xmppBareJid(rest.join(" ")) || (scopeFromConversation.kind === "room" ? scopeFromConversation.token : "");
  } else {
    token = xmppBareJid(argText) || argText.toLowerCase();
  }
  if (!token) {
    return {
      ok: false,
      scoped: false,
      token: "",
      message: "No XMPP DM/room scope was found. Try /xmppconsole all."
    };
  }
  xmppDebugSearch = token;
  return { ok: true, scoped: true, token, message: `Opened XMPP inspector scoped to "${token}".` };
}
