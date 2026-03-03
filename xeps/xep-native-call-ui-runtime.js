/*
 * Native XMPP call UI/runtime helpers extracted from app.js.
 * Functions here intentionally bind to app globals at call time.
 */

function xmppRemoteStreamListForSession(sessionId = "") {
  const sid = (sessionId || "").toString().trim();
  if (!sid) return [];
  const streamMap = xmppCallRemoteStreamsBySessionId.get(sid);
  if (streamMap instanceof Map && streamMap.size > 0) {
    return [...streamMap.values()].filter((stream) => stream instanceof MediaStream);
  }
  const pcEntry = xmppCallPeerConnectionBySessionId.get(sid) || null;
  const pc = pcEntry?.pc || null;
  if (!pc) return [];
  const tracks = pc.getReceivers()
    .map((receiver) => receiver?.track)
    .filter((track) => track instanceof MediaStreamTrack);
  if (tracks.length <= 0) return [];
  return [new MediaStream(tracks)];
}

function clearXmppRemoteTrackWaitHint(sessionId = "") {
  const sid = (sessionId || "").toString().trim();
  if (!sid) return;
  const timerId = xmppCallRemoteTrackWaitTimerBySessionId.get(sid);
  if (timerId) clearTimeout(timerId);
  xmppCallRemoteTrackWaitTimerBySessionId.delete(sid);
}

function scheduleXmppRemoteTrackWaitHint(sessionId = "", delayMs = 12000) {
  const sid = (sessionId || "").toString().trim();
  if (!sid) return;
  clearXmppRemoteTrackWaitHint(sid);
  const timerId = window.setTimeout(() => {
    xmppCallRemoteTrackWaitTimerBySessionId.delete(sid);
    const session = xmppCallSessionById.get(sid) || null;
    if (!session) return;
    if (xmppRemoteStreamListForSession(sid).length > 0) return;
    const pcEntry = xmppCallPeerConnectionBySessionId.get(sid) || null;
    const state = (pcEntry?.pc?.connectionState || "").toString().trim().toLowerCase();
    if (!["connected", "connecting", "new"].includes(state)) return;
    const peer = xmppBareJid(session.peerJid || "");
    const message = peer
      ? `Connected to ${peer}, but no remote media tracks yet.`
      : "Connected, but no remote media tracks yet.";
    showToast(message, { tone: "error", duration: 3200 });
    addXmppDebugEvent("call", "Remote media not received yet", { sid, peer, state });
  }, Math.max(3000, Number(delayMs) || 12000));
  xmppCallRemoteTrackWaitTimerBySessionId.set(sid, timerId);
}

function describeMediaAccessError(error, fallback = "Could not access local media devices.") {
  const name = (error?.name || "").toString();
  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    return "Media permission denied. Allow microphone/camera and retry.";
  }
  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return "No compatible microphone/camera device found.";
  }
  if (name === "NotReadableError" || name === "TrackStartError") {
    return "Media device is busy or not readable right now.";
  }
  if (name === "OverconstrainedError" || name === "ConstraintNotSatisfiedError") {
    return "Selected media device constraints are unsupported.";
  }
  if (name === "AbortError") {
    return "Media request was aborted.";
  }
  return fallback;
}

function showXmppMediaAccessError(message = "Could not access local media devices.") {
  const now = Date.now();
  if (now - xmppMediaAccessToastAt < 2500) return;
  xmppMediaAccessToastAt = now;
  showToast(message, { tone: "error", duration: 3200 });
}

function showXmppScreenShareWarning(message = "") {
  const text = (message || "").toString().trim();
  if (!text) return;
  const now = Date.now();
  if (now - xmppScreenShareWarningToastAt < 6000) return;
  xmppScreenShareWarningToastAt = now;
  showToast(text, { tone: "info", duration: 3600 });
}

function showXmppMediaDeviceChangeToast(ok = true) {
  const now = Date.now();
  if (now - xmppMediaDeviceChangeToastAt < 3200) return;
  xmppMediaDeviceChangeToastAt = now;
  showToast(
    ok
      ? "Call devices changed. Refreshed local media."
      : "Call devices changed. Local media refresh failed.",
    { tone: ok ? "info" : "error", duration: 3000 }
  );
}

function queueXmppMediaDeviceChangeRefresh({ reason = "devicechange" } = {}) {
  if (xmppMediaDeviceChangeTimer) clearTimeout(xmppMediaDeviceChangeTimer);
  xmppMediaDeviceChangeTimer = window.setTimeout(async () => {
    xmppMediaDeviceChangeTimer = 0;
    if (xmppMediaDeviceChangeInFlight) return;
    xmppMediaDeviceChangeInFlight = true;
    const sid = (xmppActiveNativeCallSessionId || "").toString().trim();
    try {
      await refreshMediaDeviceSnapshot({ force: true });
      if (!sid) return;
      if (!xmppCallSessionById.has(sid)) {
        if (xmppActiveNativeCallSessionId === sid) renderNativeXmppCallSurface(sid);
        return;
      }
      const refreshed = await xmppReacquireLocalMediaForSession(sid).catch(() => false);
      showXmppMediaDeviceChangeToast(Boolean(refreshed));
      addXmppDebugEvent(
        refreshed ? "runtime" : "error",
        refreshed ? "Native call local media refreshed after device change" : "Native call local media refresh failed after device change",
        { sid, reason: (reason || "").toString() }
      );
      if (xmppActiveNativeCallSessionId === sid) renderNativeXmppCallSurface(sid);
    } finally {
      xmppMediaDeviceChangeInFlight = false;
    }
  }, 220);
}

function ensureXmppMediaDeviceChangeBinding() {
  if (xmppMediaDeviceChangeBound) return;
  const mediaDevices = navigator.mediaDevices;
  if (!mediaDevices) return;
  if (typeof mediaDevices.addEventListener === "function") {
    mediaDevices.addEventListener("devicechange", () => {
      queueXmppMediaDeviceChangeRefresh({ reason: "navigator-devicechange" });
    });
    xmppMediaDeviceChangeBound = true;
    return;
  }
  if ("ondevicechange" in mediaDevices) {
    mediaDevices.ondevicechange = () => {
      queueXmppMediaDeviceChangeRefresh({ reason: "navigator-devicechange-fallback" });
    };
    xmppMediaDeviceChangeBound = true;
  }
}

function xmppDebugTokenFragment(value = "") {
  const raw = (value || "").toString().trim();
  if (!raw) return "";
  if (raw.length <= 8) return raw;
  return `${raw.slice(0, 4)}...${raw.slice(-2)}`;
}

function xmppNativeCallDebugSnapshot(sessionId = "") {
  const sid = (sessionId || "").toString().trim();
  if (!sid) return null;
  const session = xmppCallSessionById.get(sid) || null;
  if (!session) return null;
  const pcEntry = xmppCallPeerConnectionBySessionId.get(sid) || null;
  const pc = pcEntry?.pc || null;
  const callSnapshot = xmppCallSessionDebugSnapshot(session) || null;
  const localSnapshot = xmppLocalMediaSnapshot(sid);
  const pendingReprime = xmppCallPendingReprimeBySessionId.get(sid) || null;
  const remoteStreams = xmppRemoteStreamListForSession(sid);
  const localTransport = session.localTransport && typeof session.localTransport === "object"
    ? session.localTransport
    : null;
  const remoteTransport = session.remoteTransport && typeof session.remoteTransport === "object"
    ? session.remoteTransport
    : null;
  const describeTrack = (track) => {
    if (!(track instanceof MediaStreamTrack)) return null;
    return {
      id: (track.id || "").toString(),
      kind: (track.kind || "").toString(),
      enabled: Boolean(track.enabled),
      muted: Boolean(track.muted),
      readyState: (track.readyState || "").toString(),
      label: (track.label || "").toString()
    };
  };
  const describeStream = (stream, index) => {
    if (!(stream instanceof MediaStream)) return null;
    return {
      index,
      id: (stream.id || "").toString(),
      audioTracks: stream.getAudioTracks().map(describeTrack).filter(Boolean),
      videoTracks: stream.getVideoTracks().map(describeTrack).filter(Boolean)
    };
  };
  const createdAtMs = Number(session.createdAt) || 0;
  const pendingRequestedAt = Number(pendingReprime?.requestedAt) || 0;
  return {
    generatedAt: new Date().toISOString(),
    session: {
      id: sid,
      sid: callSnapshot?.sid || sid.slice(0, 8),
      peer: xmppBareJid(session.peerJid || ""),
      peerFullJid: (session.peerFullJid || "").toString().trim(),
      direction: (session.direction || "").toString().trim().toLowerCase(),
      state: (session.state || "").toString().trim().toLowerCase(),
      media: Array.isArray(session.media) ? session.media : [],
      localRole: (session.localJingleRole || "").toString().trim().toLowerCase(),
      remoteRole: (session.remoteJingleRole || "").toString().trim().toLowerCase(),
      localMediaMode: (session.localMediaMode || "camera").toString().trim().toLowerCase(),
      inviteSignal: (session.inviteSignal || "").toString().trim().toLowerCase(),
      screenShare: Boolean(session.screenShare),
      createdAt: createdAtMs > 0 ? new Date(createdAtMs).toISOString() : "",
      ageMs: createdAtMs > 0 ? Math.max(0, Date.now() - createdAtMs) : 0,
      signalTimeoutActive: Boolean(session.timeoutId),
      acceptTimeoutActive: Boolean(session.acceptTimeoutId),
      pendingLocalRenegotiation: Boolean(session.pendingLocalRenegotiation)
    },
    taskState: {
      taskQueued: xmppCallSessionTaskChainBySessionId.has(sid),
      pendingReprime: Boolean(pendingReprime),
      pendingReprimeAgeMs: pendingRequestedAt > 0 ? Math.max(0, Date.now() - pendingRequestedAt) : 0,
      pendingRemoteIceCandidates: Array.isArray(pcEntry?.pendingRemoteCandidates) ? pcEntry.pendingRemoteCandidates.length : 0,
      localCandidateCacheSize: pcEntry?.localCandidateKeys instanceof Set ? pcEntry.localCandidateKeys.size : 0
    },
    jingle: {
      localCandidates: Array.isArray(session.localCandidates) ? session.localCandidates.length : 0,
      remoteCandidates: Array.isArray(session.remoteCandidates) ? session.remoteCandidates.length : 0,
      remoteContents: Array.isArray(session.remoteContents)
        ? session.remoteContents.map((entry) => ({
          name: (entry?.name || "").toString().trim(),
          media: (entry?.media || "").toString().trim().toLowerCase(),
          senders: (entry?.senders || "").toString().trim().toLowerCase(),
          creator: (entry?.creator || "").toString().trim().toLowerCase()
        }))
        : [],
      localTransport: localTransport
        ? {
          ufrag: xmppDebugTokenFragment(localTransport.ufrag || ""),
          pwd: xmppDebugTokenFragment(localTransport.pwd || "")
        }
        : null,
      remoteTransport: remoteTransport
        ? {
          ufrag: xmppDebugTokenFragment(remoteTransport.ufrag || ""),
          pwd: xmppDebugTokenFragment(remoteTransport.pwd || "")
        }
        : null
    },
    localMedia: {
      hasStream: localSnapshot.stream instanceof MediaStream,
      streamId: localSnapshot.stream instanceof MediaStream ? (localSnapshot.stream.id || "").toString() : "",
      mode: localSnapshot.mode,
      audioEnabled: Boolean(localSnapshot.audioEnabled),
      videoEnabled: Boolean(localSnapshot.videoEnabled),
      audioTracks: localSnapshot.audioTracks.map(describeTrack).filter(Boolean),
      videoTracks: localSnapshot.videoTracks.map(describeTrack).filter(Boolean)
    },
    remoteMedia: {
      streamCount: remoteStreams.length,
      streams: remoteStreams.map((stream, index) => describeStream(stream, index)).filter(Boolean)
    },
    peerConnection: pc
      ? {
        connectionState: (pc.connectionState || "").toString(),
        iceConnectionState: (pc.iceConnectionState || "").toString(),
        iceGatheringState: (pc.iceGatheringState || "").toString(),
        signalingState: (pc.signalingState || "").toString(),
        canTrickleIceCandidates: typeof pc.canTrickleIceCandidates === "boolean" ? pc.canTrickleIceCandidates : null,
        localDescription: {
          type: (pc.localDescription?.type || "").toString(),
          sdpLength: (pc.localDescription?.sdp || "").toString().length
        },
        remoteDescription: {
          type: (pc.remoteDescription?.type || "").toString(),
          sdpLength: (pc.remoteDescription?.sdp || "").toString().length
        },
        senders: pc.getSenders().map((sender, index) => ({
          index,
          kind: (sender?.track?.kind || "").toString(),
          trackId: (sender?.track?.id || "").toString(),
          enabled: sender?.track ? Boolean(sender.track.enabled) : false,
          readyState: (sender?.track?.readyState || "").toString()
        })),
        receivers: pc.getReceivers().map((receiver, index) => ({
          index,
          kind: (receiver?.track?.kind || "").toString(),
          trackId: (receiver?.track?.id || "").toString(),
          muted: receiver?.track ? Boolean(receiver.track.muted) : false,
          readyState: (receiver?.track?.readyState || "").toString()
        })),
        transceivers: pc.getTransceivers().map((transceiver, index) => ({
          index,
          mid: (transceiver?.mid || "").toString(),
          direction: (transceiver?.direction || "").toString(),
          currentDirection: (transceiver?.currentDirection || "").toString(),
          senderKind: (transceiver?.sender?.track?.kind || "").toString(),
          receiverKind: (transceiver?.receiver?.track?.kind || "").toString()
        }))
      }
      : null
  };
}

function xmppForceNativeCallSessionReprime(sessionId = "") {
  const sid = (sessionId || "").toString().trim();
  if (!sid) return false;
  const session = xmppCallSessionById.get(sid) || null;
  if (!session) return false;
  const peerTarget = xmppNormalizeCallTargetJid(session.peerFullJid || session.peerJid || "", { preferFull: true })
    || xmppBareJid(session.peerJid || "");
  const localRole = xmppResolveLocalJingleRole({ session });
  const remoteType = localRole === "initiator" ? "answer" : "offer";
  const queued = xmppRequestSessionReprime(sid, {
    peerJid: peerTarget || session.peerJid || "",
    media: xmppCallSessionMediaList(session),
    remoteContents: Array.isArray(session.remoteContents) ? session.remoteContents : [],
    remoteTransport: session.remoteTransport && typeof session.remoteTransport === "object" ? session.remoteTransport : null,
    remoteType,
    localRole,
    applyCandidates: Array.isArray(session.remoteCandidates) ? session.remoteCandidates : [],
    forceLocalTransportUpdate: true,
    reason: "manual-debug"
  });
  if (queued) {
    addXmppDebugEvent("runtime", "Manual native XMPP re-prime queued", {
      sid,
      peer: xmppBareJid(session.peerJid || ""),
      remoteType
    });
  }
  return queued;
}

function xmppForceNativeCallSessionTransportRefresh(sessionId = "") {
  const sid = (sessionId || "").toString().trim();
  if (!sid) return false;
  const session = xmppCallSessionById.get(sid) || null;
  if (!session) return false;
  const peerTarget = xmppNormalizeCallTargetJid(session.peerFullJid || session.peerJid || "", { preferFull: true })
    || xmppBareJid(session.peerJid || "");
  if (!peerTarget) return false;
  const queued = xmppQueueTransportInfoGatherAndSend(peerTarget, sid, { force: true });
  if (queued) {
    addXmppDebugEvent("runtime", "Manual native XMPP transport refresh queued", {
      sid,
      peer: xmppBareJid(session.peerJid || "")
    });
  }
  return queued;
}

function xmppForceNativeCallSessionTerminate(sessionId = "") {
  const sid = (sessionId || "").toString().trim();
  if (!sid) return false;
  const session = xmppCallSessionById.get(sid) || null;
  if (!session) return false;
  const peerBare = xmppBareJid(session.peerJid || "");
  const peerTarget = xmppNormalizeCallTargetJid(session.peerFullJid || session.peerJid || "", { preferFull: true })
    || peerBare;
  if (peerTarget) {
    xmppSendJingleSessionTerminate(peerTarget, sid, {
      reason: "success",
      text: "Force-terminated from native call debug dialog"
    });
  }
  if (peerBare && addSystemDmMessageByPeerJid(peerBare, `Force-terminated XMPP call (${sid.slice(0, 8)}) from debug dialog.`)) {
    refreshDmUiForPeerJid(peerBare);
  }
  forgetXmppCallSession(sid);
  return true;
}

function renderNativeXmppCallDebugDialog(sessionId = "") {
  const sid = (sessionId || "").toString().trim();
  if (!sid || nativeCallDebugDialogSessionId !== sid) return null;
  const snapshot = xmppNativeCallDebugSnapshot(sid);
  if (!snapshot) return null;
  const panel = document.createElement("section");
  panel.className = "native-call-debug";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", `Native call debug ${sid.slice(0, 8)}`);
  const header = document.createElement("div");
  header.className = "native-call-debug__header";
  const title = document.createElement("strong");
  title.textContent = `Native Call Debug ${sid.slice(0, 8)}`;
  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.textContent = "Close";
  closeBtn.addEventListener("click", () => {
    nativeCallDebugDialogSessionId = "";
    if (xmppActiveNativeCallSessionId === sid) renderNativeXmppCallSurface(sid);
  });
  header.appendChild(title);
  header.appendChild(closeBtn);
  const actions = document.createElement("div");
  actions.className = "native-call-debug__actions";
  const reprimeBtn = document.createElement("button");
  reprimeBtn.type = "button";
  reprimeBtn.textContent = "Force Re-prime";
  reprimeBtn.addEventListener("click", () => {
    const ok = xmppForceNativeCallSessionReprime(sid);
    showToast(ok ? "Queued manual re-prime." : "Could not queue re-prime.", { tone: ok ? "info" : "error", duration: 2400 });
    if (ok && xmppActiveNativeCallSessionId === sid) {
      window.setTimeout(() => renderNativeXmppCallSurface(sid), 90);
    }
  });
  const transportBtn = document.createElement("button");
  transportBtn.type = "button";
  transportBtn.textContent = "Force Transport";
  transportBtn.addEventListener("click", () => {
    const ok = xmppForceNativeCallSessionTransportRefresh(sid);
    showToast(ok ? "Queued transport-info refresh." : "Could not queue transport refresh.", { tone: ok ? "info" : "error", duration: 2400 });
    if (ok && xmppActiveNativeCallSessionId === sid) {
      window.setTimeout(() => renderNativeXmppCallSurface(sid), 90);
    }
  });
  const copyBtn = document.createElement("button");
  copyBtn.type = "button";
  copyBtn.textContent = "Copy Snapshot";
  copyBtn.addEventListener("click", () => {
    const latest = xmppNativeCallDebugSnapshot(sid);
    if (!latest) {
      showToast("Debug snapshot unavailable.", { tone: "error", duration: 2200 });
      return;
    }
    void copyText(JSON.stringify(latest, null, 2)).then((ok) => {
      showToast(ok ? "Debug snapshot copied." : "Failed to copy snapshot.", { tone: ok ? "info" : "error", duration: 2400 });
    });
  });
  const refreshBtn = document.createElement("button");
  refreshBtn.type = "button";
  refreshBtn.textContent = "Refresh";
  refreshBtn.addEventListener("click", () => {
    if (xmppActiveNativeCallSessionId === sid) renderNativeXmppCallSurface(sid);
  });
  const terminateBtn = document.createElement("button");
  terminateBtn.type = "button";
  terminateBtn.className = "is-danger";
  terminateBtn.textContent = "Force Terminate";
  terminateBtn.addEventListener("click", () => {
    const ok = xmppForceNativeCallSessionTerminate(sid);
    showToast(ok ? "Native call force-terminated." : "Could not terminate native call.", { tone: ok ? "info" : "error", duration: 2600 });
  });
  actions.appendChild(reprimeBtn);
  actions.appendChild(transportBtn);
  actions.appendChild(copyBtn);
  actions.appendChild(refreshBtn);
  actions.appendChild(terminateBtn);
  const hint = document.createElement("p");
  hint.className = "native-call-debug__hint";
  hint.textContent = "Manual diagnostics for interop failures. ICE credentials are masked in this snapshot.";
  const pre = document.createElement("pre");
  pre.className = "native-call-debug__pre";
  pre.textContent = JSON.stringify(snapshot, null, 2);
  panel.appendChild(header);
  panel.appendChild(actions);
  panel.appendChild(hint);
  panel.appendChild(pre);
  return panel;
}

function renderNativeXmppCallSurface(sessionId = "") {
  const sid = (sessionId || "").toString().trim();
  if (!sid) return;
  const overlay = ensureMediaLightbox();
  const stage = overlay.querySelector(".media-lightbox__stage");
  const caption = overlay.querySelector(".media-lightbox__caption");
  if (!stage || !caption) return;
  const session = xmppCallSessionById.get(sid) || null;
  const peer = xmppBareJid(session?.peerJid || "");
  const pcEntry = xmppCallPeerConnectionBySessionId.get(sid) || null;
  const pcState = (pcEntry?.pc?.connectionState || "").toString().trim();
  const iceState = (pcEntry?.pc?.iceConnectionState || "").toString().trim();
  stage.innerHTML = "";
  const shell = document.createElement("div");
  shell.className = "native-call-surface";
  const header = document.createElement("div");
  header.className = "native-call-surface__header";
  const title = document.createElement("strong");
  title.textContent = `Native XMPP Call ${sid.slice(0, 8)}`;
  const meta = document.createElement("span");
  const state = (session?.state || "starting").toString().trim();
  const flags = [
    session?.pendingLocalRenegotiation ? "reprime" : "",
    xmppCallSessionTaskChainBySessionId.has(sid) ? "queued" : "",
    xmppCallPendingReprimeBySessionId.has(sid) ? "debounce" : ""
  ].filter(Boolean);
  const stateBits = [
    peer || "peer",
    state,
    pcState ? `pc:${pcState}` : "",
    iceState ? `ice:${iceState}` : "",
    ...(flags.length > 0 ? flags : [])
  ].filter(Boolean);
  meta.textContent = stateBits.join(" · ");
  const actions = document.createElement("div");
  actions.className = "native-call-surface__actions";
  const localSnapshot = xmppLocalMediaSnapshot(sid);
  const micBtn = document.createElement("button");
  micBtn.type = "button";
  micBtn.className = "native-call-surface__toggle";
  micBtn.textContent = localSnapshot.audioEnabled ? "Mute Mic" : "Unmute Mic";
  micBtn.title = localSnapshot.audioEnabled ? "Mute microphone" : "Unmute microphone";
  micBtn.disabled = localSnapshot.audioTracks.length === 0;
  if (localSnapshot.audioEnabled) micBtn.classList.add("is-active");
  micBtn.addEventListener("click", async () => {
    if (localSnapshot.audioTracks.length === 0) {
      await xmppEnsureLocalMediaAttached(sid, { screenShare: localSnapshot.mode === "screen" });
    }
    const nextEnabled = !xmppLocalMediaSnapshot(sid).audioEnabled;
    xmppSetLocalTracksEnabled(sid, "audio", nextEnabled);
  });
  const camBtn = document.createElement("button");
  camBtn.type = "button";
  camBtn.className = "native-call-surface__toggle";
  camBtn.textContent = localSnapshot.videoEnabled ? "Stop Cam" : "Start Cam";
  camBtn.title = localSnapshot.videoEnabled ? "Disable camera" : "Enable camera";
  camBtn.disabled = localSnapshot.videoTracks.length === 0 && localSnapshot.mode !== "camera";
  if (localSnapshot.videoEnabled) camBtn.classList.add("is-active");
  camBtn.addEventListener("click", async () => {
    if (xmppLocalMediaSnapshot(sid).videoTracks.length === 0) {
      await xmppEnsureLocalMediaAttached(sid, { screenShare: localSnapshot.mode === "screen" });
    }
    const nextEnabled = !xmppLocalMediaSnapshot(sid).videoEnabled;
    xmppSetLocalTracksEnabled(sid, "video", nextEnabled);
  });
  const screenBtn = document.createElement("button");
  screenBtn.type = "button";
  screenBtn.className = "native-call-surface__toggle";
  const screenActive = localSnapshot.mode === "screen";
  screenBtn.textContent = screenActive ? "Stop Share" : "Share Screen";
  screenBtn.title = screenActive ? "Stop screen sharing" : "Share your screen";
  if (screenActive) screenBtn.classList.add("is-active");
  const screenCapability = screenShareCapabilitySnapshot();
  if (!screenCapability.ok) {
    screenBtn.disabled = true;
    screenBtn.title = screenCapability.reason || "Screen sharing unavailable";
  }
  screenBtn.addEventListener("click", async () => {
    if (!screenShareCapabilitySnapshot().ok && !screenActive) {
      const cap = screenShareCapabilitySnapshot();
      showToast(cap.reason || "Screen sharing unavailable.", { tone: "error" });
      return;
    }
    await xmppSwitchLocalMediaMode(sid, screenActive ? "camera" : "screen");
  });
  const audioTestBtn = document.createElement("button");
  audioTestBtn.type = "button";
  audioTestBtn.className = "native-call-surface__toggle";
  const audioTestActive = isNativeCallAudioTestActive(sid);
  audioTestBtn.textContent = audioTestActive ? "Stop Test" : "Test Audio";
  audioTestBtn.title = audioTestActive
    ? "Stop local audio test clip"
    : "Play local rickroll.ogg to test output audio";
  if (audioTestActive) audioTestBtn.classList.add("is-active");
  audioTestBtn.addEventListener("click", () => {
    if (isNativeCallAudioTestActive(sid)) {
      stopNativeCallAudioTest();
      if (xmppActiveNativeCallSessionId === sid) renderNativeXmppCallSurface(sid);
      return;
    }
    void startNativeCallAudioTest(sid);
  });
  const copyBtn = document.createElement("button");
  copyBtn.type = "button";
  copyBtn.textContent = "Copy SID";
  copyBtn.addEventListener("click", () => {
    void copyText(sid).then((ok) => showToast(ok ? "Session ID copied." : "Failed to copy session ID.", { tone: ok ? "info" : "error" }));
  });
  const refreshBtn = document.createElement("button");
  refreshBtn.type = "button";
  refreshBtn.textContent = "Refresh";
  refreshBtn.addEventListener("click", () => renderNativeXmppCallSurface(sid));
  const debugBtn = document.createElement("button");
  debugBtn.type = "button";
  debugBtn.className = "native-call-surface__toggle";
  const debugOpen = nativeCallDebugDialogSessionId === sid;
  debugBtn.textContent = debugOpen ? "Debug On" : "Debug";
  debugBtn.title = debugOpen ? "Hide native call debug dialog" : "Open native call debug dialog";
  if (debugOpen) debugBtn.classList.add("is-active");
  debugBtn.addEventListener("click", () => {
    nativeCallDebugDialogSessionId = nativeCallDebugDialogSessionId === sid ? "" : sid;
    renderNativeXmppCallSurface(sid);
  });
  const endBtn = document.createElement("button");
  endBtn.type = "button";
  endBtn.textContent = "End";
  endBtn.className = "native-call-surface__end";
  endBtn.addEventListener("click", () => {
    const targetPeer = xmppBareJid(session?.peerJid || "");
    if (targetPeer) {
      xmppSendJingleSessionTerminate(targetPeer, sid, {
        reason: "success",
        text: "Ended from in-app native call surface"
      });
    }
    forgetXmppCallSession(sid);
    closeMediaLightbox();
  });
  const rejoinBtn = document.createElement("button");
  rejoinBtn.type = "button";
  rejoinBtn.textContent = "Rejoin";
  rejoinBtn.className = "native-call-surface__toggle";
  const canRejoin = ["peer-left", "terminated"].includes((session?.state || "").toString().trim().toLowerCase());
  rejoinBtn.disabled = !canRejoin;
  rejoinBtn.title = canRejoin ? "Start a fresh call proposal to this peer" : "Rejoin is available after the peer leaves";
  rejoinBtn.addEventListener("click", () => {
    void xmppRejoinNativeCallSession(sid);
  });
  actions.appendChild(micBtn);
  actions.appendChild(camBtn);
  actions.appendChild(screenBtn);
  actions.appendChild(audioTestBtn);
  actions.appendChild(copyBtn);
  actions.appendChild(refreshBtn);
  actions.appendChild(debugBtn);
  actions.appendChild(rejoinBtn);
  actions.appendChild(endBtn);
  header.appendChild(title);
  header.appendChild(meta);
  header.appendChild(actions);
  const devicesRow = document.createElement("div");
  devicesRow.className = "native-call-surface__devices";
  const prefs = getPreferences();
  const audioSelect = document.createElement("select");
  audioSelect.className = "native-call-surface__select";
  const videoSelect = document.createElement("select");
  videoSelect.className = "native-call-surface__select";
  const outputSelect = document.createElement("select");
  outputSelect.className = "native-call-surface__select";
  const buildSelectOptions = (select, items, selectedId, fallbackLabel) => {
    select.innerHTML = "";
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = fallbackLabel;
    select.appendChild(defaultOption);
    let hasSelected = !selectedId;
    items.forEach((device, index) => {
      const option = document.createElement("option");
      option.value = device.id;
      option.textContent = formatMediaDeviceLabel(device, `${fallbackLabel} ${index + 1}`);
      if (device.id === selectedId) {
        option.selected = true;
        hasSelected = true;
      }
      select.appendChild(option);
    });
    if (selectedId && !hasSelected) {
      const option = document.createElement("option");
      option.value = selectedId;
      option.textContent = "Previously selected (missing)";
      option.selected = true;
      select.appendChild(option);
    }
  };
  buildSelectOptions(audioSelect, mediaDeviceSnapshot.audio || [], prefs.callAudioInputId, "Default Mic");
  buildSelectOptions(videoSelect, mediaDeviceSnapshot.video || [], prefs.callVideoInputId, "Default Camera");
  buildSelectOptions(outputSelect, mediaDeviceSnapshot.output || [], prefs.callAudioOutputId, "Default Speaker");
  audioSelect.addEventListener("change", () => {
    state.preferences = getPreferences();
    state.preferences.callAudioInputId = audioSelect.value;
    saveState();
    void xmppReacquireLocalMediaForSession(sid);
    showToast("Microphone device updated.");
  });
  videoSelect.addEventListener("change", () => {
    state.preferences = getPreferences();
    state.preferences.callVideoInputId = videoSelect.value;
    saveState();
    void xmppReacquireLocalMediaForSession(sid);
    showToast("Camera device updated.");
  });
  outputSelect.addEventListener("change", () => {
    state.preferences = getPreferences();
    state.preferences.callAudioOutputId = outputSelect.value;
    saveState();
    const remoteVideos = shell.querySelectorAll(".native-call-surface__tile video:not([muted])");
    remoteVideos.forEach((video) => {
      void applyAudioOutputDeviceToElement(video, outputSelect.value);
    });
    if (!canSetAudioOutputDevice()) {
      showToast("Audio output switching is not supported in this runtime.", { tone: "error" });
      return;
    }
    showToast("Audio output device updated.");
  });
  const audioWrap = document.createElement("label");
  audioWrap.className = "native-call-surface__device";
  audioWrap.textContent = "Mic";
  audioWrap.appendChild(audioSelect);
  const videoWrap = document.createElement("label");
  videoWrap.className = "native-call-surface__device";
  videoWrap.textContent = "Cam";
  videoWrap.appendChild(videoSelect);
  const outputWrap = document.createElement("label");
  outputWrap.className = "native-call-surface__device";
  outputWrap.textContent = "Out";
  outputWrap.appendChild(outputSelect);
  devicesRow.appendChild(audioWrap);
  devicesRow.appendChild(videoWrap);
  devicesRow.appendChild(outputWrap);
  const debugDialog = renderNativeXmppCallDebugDialog(sid);
  const grid = document.createElement("div");
  grid.className = "native-call-surface__grid";
  const localStream = xmppCallLocalMediaStreamBySessionId.get(sid) || null;
  if (localStream instanceof MediaStream) {
    const localTile = document.createElement("div");
    localTile.className = "native-call-surface__tile";
    const localMeta = xmppLocalMediaSnapshot(sid);
    localTile.classList.toggle("native-call-surface__tile--muted", localMeta.audioTracks.length > 0 && !localMeta.audioEnabled);
    localTile.classList.toggle("native-call-surface__tile--video-off", localMeta.videoTracks.length > 0 && !localMeta.videoEnabled);
    const video = document.createElement("video");
    video.className = "native-call-surface__video";
    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;
    video.srcObject = localStream;
    const label = document.createElement("span");
    label.className = "native-call-surface__label";
    const badges = [];
    if (localMeta.audioTracks.length > 0 && !localMeta.audioEnabled) badges.push("mic off");
    if (localMeta.videoTracks.length > 0 && !localMeta.videoEnabled) badges.push("cam off");
    label.textContent = badges.length > 0 ? `You · ${badges.join(" · ")}` : "You";
    localTile.appendChild(video);
    localTile.appendChild(label);
    grid.appendChild(localTile);
  }
  const remoteStreams = xmppRemoteStreamListForSession(sid);
  remoteStreams.forEach((stream, index) => {
    const tile = document.createElement("div");
    tile.className = "native-call-surface__tile";
    if (session?.remoteMuted) tile.classList.add("native-call-surface__tile--muted");
    if (session?.remoteVideoMuted) tile.classList.add("native-call-surface__tile--video-off");
    const video = document.createElement("video");
    video.className = "native-call-surface__video";
    video.autoplay = true;
    video.playsInline = true;
    video.srcObject = stream;
    void applyAudioOutputDeviceToElement(video, prefs.callAudioOutputId || "");
    const label = document.createElement("span");
    label.className = "native-call-surface__label";
    const baseLabel = index === 0 ? (peer || "Peer") : `${peer || "Peer"} ${index + 1}`;
    const badges = [];
    if (session?.remoteMuted) badges.push("mic off");
    if (session?.remoteVideoMuted) badges.push("cam off");
    label.textContent = badges.length > 0 ? `${baseLabel} · ${badges.join(" · ")}` : baseLabel;
    tile.appendChild(video);
    tile.appendChild(label);
    grid.appendChild(tile);
  });
  if (!localStream && remoteStreams.length === 0) {
    const empty = document.createElement("div");
    empty.className = "native-call-surface__empty";
    empty.textContent = "Waiting for local/remote media tracks...";
    grid.appendChild(empty);
  }
  shell.appendChild(header);
  shell.appendChild(devicesRow);
  if (debugDialog) shell.appendChild(debugDialog);
  shell.appendChild(grid);
  stage.appendChild(shell);
  caption.textContent = `Native session ${sid.slice(0, 8)} · l${Array.isArray(session?.localCandidates) ? session.localCandidates.length : 0}/r${Array.isArray(session?.remoteCandidates) ? session.remoteCandidates.length : 0}`;
  if (!mediaDeviceSnapshot.ready && !mediaDeviceSnapshot.loading) {
    void refreshMediaDeviceSnapshot().then(() => {
      if (xmppActiveNativeCallSessionId === sid) renderNativeXmppCallSurface(sid);
    });
  }
}

async function xmppRejoinNativeCallSession(sessionId = "") {
  const sid = (sessionId || "").toString().trim();
  if (!sid) return false;
  const session = xmppCallSessionById.get(sid) || null;
  const peer = xmppBareJid(session?.peerJid || session?.peerFullJid || "");
  if (!session || !peer) {
    showToast("Missing peer info for rejoin.", { tone: "error", duration: 2400 });
    return false;
  }
  const media = Array.isArray(session.media) && session.media.length > 0 ? session.media : XMPP_CALL_DEFAULT_MEDIA;
  const started = xmppStartOutgoingCallProposal({
    peerJid: peer,
    peerTargetJid: session.peerFullJid || peer,
    media,
    screenShare: Boolean(session.screenShare),
    conversationId: (session.conversationId || "").toString(),
    conversationType: (session.conversationType || "dm").toString(),
    interopTarget: (session.interopTarget || peer).toString(),
    room: (session.room || "").toString()
  });
  if (!started) {
    showToast("Failed to send rejoin proposal.", { tone: "error", duration: 2800 });
    return false;
  }
  return true;
}

function openNativeXmppCallSurface(sessionId = "") {
  const sid = (sessionId || "").toString().trim();
  if (!sid) return;
  ensureXmppMediaDeviceChangeBinding();
  if (nativeCallAudioTestSessionId && nativeCallAudioTestSessionId !== sid) {
    stopNativeCallAudioTest();
  }
  if (nativeCallDebugDialogSessionId && nativeCallDebugDialogSessionId !== sid) {
    nativeCallDebugDialogSessionId = "";
  }
  xmppActiveNativeCallSessionId = sid;
  scheduleXmppRemoteTrackWaitHint(sid);
  const overlay = ensureMediaLightbox();
  renderNativeXmppCallSurface(sid);
  overlay.hidden = false;
  document.body.style.overflow = "hidden";
  overlay.focus({ preventScroll: true });
}
