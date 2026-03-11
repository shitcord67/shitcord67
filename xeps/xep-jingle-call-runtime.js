/*
 * Jingle/native-call runtime helpers extracted from app.js.
 * Functions here intentionally bind to app globals at call time.
 */

function xmppPeerJidForConversation(conversation = getActiveConversation(), current = getCurrentAccount()) {
  if (!conversation || conversation.type !== "dm") return "";
  return xmppPeerJidForDmThread(conversation.thread, current);
}

function xmppSessionDebugToken(session = null) {
  if (!session || typeof session !== "object") return "";
  const id = (session.id || "").toString().trim();
  if (!id) return "";
  const sid = id.slice(0, 6);
  const state = (session.state || "idle").toString().trim().toLowerCase() || "idle";
  const pending = session.pendingLocalRenegotiation ? "R" : "";
  const queued = xmppCallSessionTaskChainBySessionId.has(id) ? "Q" : "";
  const reprime = xmppCallPendingReprimeBySessionId.has(id) ? "P" : "";
  const localCount = Array.isArray(session.localCandidates) ? session.localCandidates.length : 0;
  const remoteCount = Array.isArray(session.remoteCandidates) ? session.remoteCandidates.length : 0;
  return `${sid}:${state}${pending || queued || reprime ? `[${pending}${queued}${reprime}]` : ""} l${localCount}/r${remoteCount}`;
}

function xmppCallDebugSummaryForConversation(conversation = getActiveConversation(), current = getCurrentAccount()) {
  if (!conversation || conversation.type !== "dm") return "";
  const peer = xmppPeerJidForConversation(conversation, current);
  const peerBare = xmppBareJid(peer);
  if (!peerBare) return "";
  const sessions = [...xmppCallSessionById.values()]
    .filter((session) => xmppBareJid(session?.peerJid || "") === peerBare)
    .sort((a, b) => (Number(b?.createdAt) || 0) - (Number(a?.createdAt) || 0));
  if (sessions.length <= 0) return "";
  const tokens = sessions
    .slice(0, 2)
    .map((session) => xmppSessionDebugToken(session))
    .filter(Boolean);
  if (tokens.length <= 0) return "";
  return `XMPP ${tokens.join(" | ")}${sessions.length > tokens.length ? " …" : ""}`;
}

function xmppCallSessionDebugSnapshot(session = null) {
  if (!session || typeof session !== "object") return null;
  const id = (session.id || "").toString().trim();
  if (!id) return null;
  const peer = xmppBareJid(session.peerJid || "");
  const createdAt = Number(session.createdAt) || 0;
  const queuedTask = xmppCallSessionTaskChainBySessionId.has(id);
  const pendingReprime = xmppCallPendingReprimeBySessionId.has(id);
  const localCandidates = Array.isArray(session.localCandidates) ? session.localCandidates.length : 0;
  const remoteCandidates = Array.isArray(session.remoteCandidates) ? session.remoteCandidates.length : 0;
  const media = Array.isArray(session.media)
    ? session.media.map((entry) => (entry || "").toString().trim().toLowerCase()).filter(Boolean)
    : [];
  return {
    id,
    sid: id.slice(0, 8),
    peer,
    direction: (session.direction || "").toString().trim().toLowerCase(),
    state: (session.state || "").toString().trim().toLowerCase(),
    media,
    localRole: (session.localJingleRole || "").toString().trim().toLowerCase(),
    remoteRole: (session.remoteJingleRole || "").toString().trim().toLowerCase(),
    pendingLocalRenegotiation: Boolean(session.pendingLocalRenegotiation),
    queuedTask,
    pendingReprime,
    localCandidates,
    remoteCandidates,
    createdAt: createdAt > 0 ? new Date(createdAt).toISOString() : ""
  };
}

function xmppCallDebugSnapshotForConversation(conversation = getActiveConversation(), current = getCurrentAccount()) {
  if (!conversation || conversation.type !== "dm") return [];
  const peer = xmppPeerJidForConversation(conversation, current);
  const peerBare = xmppBareJid(peer);
  if (!peerBare) return [];
  return [...xmppCallSessionById.values()]
    .filter((session) => xmppBareJid(session?.peerJid || "") === peerBare)
    .sort((a, b) => (Number(b?.createdAt) || 0) - (Number(a?.createdAt) || 0))
    .map((session) => xmppCallSessionDebugSnapshot(session))
    .filter(Boolean);
}

function xmppCallDebugSnapshotAll() {
  return [...xmppCallSessionById.values()]
    .sort((a, b) => (Number(b?.createdAt) || 0) - (Number(a?.createdAt) || 0))
    .map((session) => xmppCallSessionDebugSnapshot(session))
    .filter(Boolean);
}

function xmppFormatCallSnapshotLine(snapshot = null) {
  if (!snapshot) return "";
  const bits = [
    snapshot.sid || "",
    snapshot.direction || "unknown",
    snapshot.state || "idle"
  ];
  if (Array.isArray(snapshot.media) && snapshot.media.length > 0) bits.push(snapshot.media.join("+"));
  bits.push(`l${Number(snapshot.localCandidates) || 0}/r${Number(snapshot.remoteCandidates) || 0}`);
  const flags = [
    snapshot.pendingLocalRenegotiation ? "R" : "",
    snapshot.queuedTask ? "Q" : "",
    snapshot.pendingReprime ? "P" : ""
  ].filter(Boolean).join("");
  if (flags) bits.push(`[${flags}]`);
  return bits.filter(Boolean).join(" ");
}

function clearXmppCallSignalTimeout(sessionId = "") {
  const id = (sessionId || "").toString();
  if (!id) return;
  const entry = xmppCallSessionById.get(id);
  if (!entry) return;
  if (entry.timeoutId) clearTimeout(entry.timeoutId);
  entry.timeoutId = 0;
}

function xmppTrackTransportInfoNotice(sessionId = "", candidateCount = 0) {
  const sid = (sessionId || "").toString().trim();
  if (!sid) {
    return { shouldAnnounce: false, packetCount: 0, totalCandidates: 0 };
  }
  const now = Date.now();
  const count = Math.max(0, Number(candidateCount) || 0);
  const previous = xmppCallTransportInfoNoticeBySessionId.get(sid) || {
    packetCount: 0,
    totalCandidates: 0,
    lastAnnouncedAt: 0
  };
  const packetCount = previous.packetCount + 1;
  const totalCandidates = previous.totalCandidates + count;
  const shouldAnnounce = (
    packetCount <= 1
    || now - (Number(previous.lastAnnouncedAt) || 0) >= XMPP_CALL_TRANSPORT_NOTICE_INTERVAL_MS
  );
  xmppCallTransportInfoNoticeBySessionId.set(sid, {
    packetCount,
    totalCandidates,
    lastAnnouncedAt: shouldAnnounce ? now : previous.lastAnnouncedAt
  });
  return { shouldAnnounce, packetCount, totalCandidates };
}

function forgetXmppCallSession(sessionId = "") {
  const id = (sessionId || "").toString();
  if (!id) return;
  const entry = xmppCallSessionById.get(id);
  if (!entry) return;
  clearXmppRemoteTrackWaitHint(id);
  xmppCallSessionTaskChainBySessionId.delete(id);
  const pendingReprime = xmppCallPendingReprimeBySessionId.get(id);
  if (pendingReprime?.timerId) clearTimeout(pendingReprime.timerId);
  xmppCallPendingReprimeBySessionId.delete(id);
  xmppCallIceGatherInFlightBySessionId.delete(id);
  xmppCallTransportInfoNoticeBySessionId.delete(id);
  xmppCallQualitySnapshotBySessionId.delete(id);
  xmppCallQualityRefreshInFlight.delete(id);
  xmppStopLocalMediaStreamForSession(id);
  xmppCallRemoteStreamsBySessionId.delete(id);
  if (typeof clearXmppNativeCallRemoteAudioSinks === "function") {
    clearXmppNativeCallRemoteAudioSinks(id);
  }
  stopXmppCallSpeakingMonitor(id);
  stopXmppNativeCallTileSpeakingMonitor(id);
  xmppCloseSessionPeerConnection(id);
  clearXmppCallSignalTimeout(id);
  if (entry.acceptTimeoutId) clearTimeout(entry.acceptTimeoutId);
  entry.acceptTimeoutId = null;
  const inviteId = (entry.callInviteId || "").toString().trim();
  if (inviteId) xmppCallSessionIdByInviteId.delete(inviteId);
  [...xmppCallSessionIdByInviteId.entries()].forEach(([key, value]) => {
    if ((value || "").toString().trim() === id) xmppCallSessionIdByInviteId.delete(key);
  });
  if (nativeCallAudioTestSessionId === id) {
    stopNativeCallAudioTest();
  }
  if (nativeCallDebugDialogSessionId === id) {
    nativeCallDebugDialogSessionId = "";
  }
  xmppCallSessionById.delete(id);
  if (xmppActiveNativeCallSessionId === id) closeMediaLightbox();
  const peer = xmppBareJid(entry.peerJid || "");
  if (peer && xmppLatestIncomingCallSessionByPeer.get(peer) === id) xmppLatestIncomingCallSessionByPeer.delete(peer);
  if (peer && xmppLatestOutgoingCallSessionByPeer.get(peer) === id) xmppLatestOutgoingCallSessionByPeer.delete(peer);
}

function xmppEnqueueSessionJingleTask(sessionId, label = "task", task = null) {
  const sid = (sessionId || "").toString().trim();
  if (!sid || typeof task !== "function") return Promise.resolve(null);
  const previous = xmppCallSessionTaskChainBySessionId.get(sid) || Promise.resolve();
  const run = previous
    .catch(() => null)
    .then(() => Promise.resolve(task()))
    .catch((error) => {
      addXmppDebugEvent("error", "Queued XMPP session task failed", {
        sid,
        label: (label || "task").toString(),
        error: String(error?.message || error)
      });
      return null;
    });
  xmppCallSessionTaskChainBySessionId.set(sid, run);
  run.finally(() => {
    if (xmppCallSessionTaskChainBySessionId.get(sid) === run) {
      xmppCallSessionTaskChainBySessionId.delete(sid);
    }
  });
  return run;
}

function xmppRequestSessionReprime(sessionId, {
  peerJid = "",
  media = [],
  remoteContents = [],
  remoteTransport = null,
  remoteType = "offer",
  localRole = "responder",
  applyCandidates = [],
  forceLocalTransportUpdate = false,
  reason = "update"
} = {}) {
  const sid = (sessionId || "").toString().trim();
  if (!sid) return false;
  const session = xmppCallSessionById.get(sid) || null;
  if (session) session.pendingLocalRenegotiation = true;
  const existing = xmppCallPendingReprimeBySessionId.get(sid) || null;
  if (existing?.timerId) clearTimeout(existing.timerId);
  const mergedCandidates = [
    ...(Array.isArray(existing?.request?.applyCandidates) ? existing.request.applyCandidates : []),
    ...(Array.isArray(applyCandidates) ? applyCandidates : [])
  ];
  const mergedRequest = {
    peerJid: xmppBareJid(peerJid || existing?.request?.peerJid || session?.peerJid || ""),
    media: Array.isArray(media) && media.length > 0
      ? media
      : (Array.isArray(existing?.request?.media) ? existing.request.media : (session?.media || [])),
    remoteContents: Array.isArray(remoteContents) && remoteContents.length > 0
      ? remoteContents
      : (Array.isArray(existing?.request?.remoteContents) ? existing.request.remoteContents : (session?.remoteContents || [])),
    remoteTransport: remoteTransport || existing?.request?.remoteTransport || session?.remoteTransport || null,
    remoteType: (remoteType || existing?.request?.remoteType || "offer").toString().trim().toLowerCase() === "answer" ? "answer" : "offer",
    localRole: (localRole || existing?.request?.localRole || session?.localJingleRole || "responder").toString().trim().toLowerCase() || "responder",
    applyCandidates: mergedCandidates,
    forceLocalTransportUpdate: Boolean(forceLocalTransportUpdate || existing?.request?.forceLocalTransportUpdate),
    reason: (reason || existing?.request?.reason || "update").toString().trim()
  };
  const timerId = window.setTimeout(() => {
    const pending = xmppCallPendingReprimeBySessionId.get(sid);
    if (!pending) return;
    xmppCallPendingReprimeBySessionId.delete(sid);
    const latest = xmppCallSessionById.get(sid) || null;
    if (latest) latest.pendingLocalRenegotiation = false;
    void xmppEnqueueSessionJingleTask(sid, `reprime/${pending.request.reason || "update"}`, async () => {
      const req = pending.request;
      const primed = await xmppPrimePeerConnectionFromJingle(sid, {
        peerJid: req.peerJid,
        media: req.media,
        remoteContents: req.remoteContents,
        remoteTransport: req.remoteTransport,
        remoteType: req.remoteType,
        localRole: req.localRole
      });
      let applied = { attempted: 0, applied: 0, queued: 0 };
      if (Array.isArray(req.applyCandidates) && req.applyCandidates.length > 0) {
        applied = await xmppApplyRemoteIceCandidatesForSession(sid, req.applyCandidates);
      }
      if (req.forceLocalTransportUpdate && req.peerJid) {
        xmppQueueTransportInfoGatherAndSend(req.peerJid, sid, { force: true });
      }
      addXmppDebugEvent("runtime", "Completed batched XMPP session re-prime", {
        sid,
        reason: req.reason || "update",
        primed: Boolean(primed),
        attempted: applied.attempted || 0,
        applied: applied.applied || 0,
        queued: applied.queued || 0
      });
      return true;
    });
  }, XMPP_CALL_REPRIME_DEBOUNCE_MS);
  xmppCallPendingReprimeBySessionId.set(sid, {
    timerId,
    requestedAt: Date.now(),
    request: mergedRequest
  });
  return true;
}

function stopMediaStreamTracksSafe(stream = null) {
  if (!(stream instanceof MediaStream)) return;
  try {
    stream.getTracks().forEach((track) => {
      try {
        track.stop();
      } catch {
        // Ignore track stop failures.
      }
    });
  } catch {
    // Ignore stream cleanup failures.
  }
}

function stopLocalAuxMediaForSessionEntry(entry = null) {
  if (!entry || typeof entry !== "object") return;
  const streams = Array.isArray(entry.streams) ? entry.streams : [];
  streams.forEach((item) => {
    if (!(item instanceof MediaStream)) return;
    stopMediaStreamTracksSafe(item);
  });
  if (entry.audioContext && typeof entry.audioContext.close === "function") {
    try {
      entry.audioContext.close();
    } catch {
      // Ignore audio context close failures.
    }
  }
}

function xmppStopLocalMediaStreamForSession(sessionId = "") {
  const sid = (sessionId || "").toString().trim();
  if (!sid) return;
  const stream = xmppCallLocalMediaStreamBySessionId.get(sid);
  if (!stream) return;
  stopMediaStreamTracksSafe(stream);
  xmppCallLocalMediaStreamBySessionId.delete(sid);
  const aux = xmppCallLocalAuxStreamsBySessionId.get(sid);
  stopLocalAuxMediaForSessionEntry(aux);
  xmppCallLocalAuxStreamsBySessionId.delete(sid);
}

async function requestUserMediaWithFallback({ audioId = "", videoId = "", wantsVideo = true } = {}) {
  if (!navigator.mediaDevices?.getUserMedia) return null;
  const audioConstraint = audioId ? { deviceId: { exact: audioId } } : true;
  const videoConstraint = wantsVideo ? (videoId ? { deviceId: { exact: videoId } } : true) : false;
  let lastError = null;
  try {
    return await navigator.mediaDevices.getUserMedia({ audio: audioConstraint, video: videoConstraint });
  } catch (error) {
    lastError = error;
    try {
      return await navigator.mediaDevices.getUserMedia({ audio: true, video: wantsVideo });
    } catch (fallbackError) {
      lastError = fallbackError;
      addXmppDebugEvent("error", "Local getUserMedia request failed", {
        audioId: audioId || "",
        videoId: videoId || "",
        wantsVideo: Boolean(wantsVideo),
        error: String(lastError?.message || lastError)
      });
      return null;
    }
  }
}

function mixMediaStreamAudioTracks(streams = []) {
  const sources = streams
    .filter((stream) => stream instanceof MediaStream)
    .map((stream) => ({
      stream,
      tracks: stream.getAudioTracks()
    }))
    .filter((entry) => entry.tracks.length > 0);
  if (sources.length === 0) return { stream: null, audioContext: null };
  if (sources.length === 1 && sources[0].tracks.length === 1) {
    return { stream: sources[0].stream, audioContext: null };
  }
  if (typeof AudioContext !== "function" && typeof webkitAudioContext !== "function") {
    return { stream: sources[0].stream, audioContext: null };
  }
  const Ctx = typeof AudioContext === "function" ? AudioContext : webkitAudioContext;
  const audioContext = new Ctx();
  const destination = audioContext.createMediaStreamDestination();
  sources.forEach(({ stream }) => {
    try {
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(destination);
    } catch {
      // Ignore source connection failures.
    }
  });
  return { stream: destination.stream, audioContext };
}

async function xmppAcquireLocalMediaStreamForSession(sessionId, {
  screenShare = false,
  forceNew = false,
  screenOptions = null
} = {}) {
  const sid = (sessionId || "").toString().trim();
  if (!sid) return null;
  const existing = xmppCallLocalMediaStreamBySessionId.get(sid) || null;
  if (existing && !forceNew) return existing;
  const wantsScreen = Boolean(screenShare);
  const prefs = getPreferences();
  const audioDeviceId = prefs.callAudioInputId || "";
  const videoDeviceId = prefs.callVideoInputId || "";
  const includeSystemAudio = screenOptions && typeof screenOptions.includeSystemAudio === "boolean"
    ? screenOptions.includeSystemAudio
    : (prefs.callScreenSystemAudio || "on") !== "off";
  const includeMic = screenOptions && typeof screenOptions.includeMic === "boolean"
    ? screenOptions.includeMic
    : (prefs.callScreenMicMix || "on") !== "off";
  let nextAux = null;
  let stream = null;
  let displayError = null;
  let usedDisplayCapture = false;
  if (wantsScreen && navigator.mediaDevices?.getDisplayMedia) {
    let micStream = null;
    try {
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: Boolean(includeSystemAudio)
      });
      usedDisplayCapture = Boolean(stream);
    } catch (error) {
      displayError = error;
      try {
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false
        });
        usedDisplayCapture = Boolean(stream);
      } catch (fallbackError) {
        displayError = fallbackError;
        stream = null;
      }
    }
    if (stream && includeMic && navigator.mediaDevices?.getUserMedia) {
      try {
        micStream = await requestUserMediaWithFallback({ audioId: audioDeviceId, wantsVideo: false });
      } catch {
        // Optional mic merge failed; keep screen-only stream.
      }
    }
    if (stream) {
      const audioSources = [];
      if (stream.getAudioTracks().length > 0) audioSources.push(stream);
      if (micStream && micStream.getAudioTracks().length > 0) audioSources.push(micStream);
      if (audioSources.length > 0) {
        const mixed = mixMediaStreamAudioTracks(audioSources);
        if (mixed.stream && mixed.stream.getAudioTracks().length > 0) {
          stream.getAudioTracks().forEach((track) => stream.removeTrack(track));
          mixed.stream.getAudioTracks().forEach((track) => stream.addTrack(track));
        }
        if (micStream || mixed.audioContext) {
          nextAux = {
            streams: [micStream].filter(Boolean),
            audioContext: mixed.audioContext || null
          };
        }
      }
    }
  }
  if (!stream && navigator.mediaDevices?.getUserMedia) {
    stream = await requestUserMediaWithFallback({
      audioId: audioDeviceId,
      videoId: videoDeviceId,
      wantsVideo: !wantsScreen
    });
    if (stream && wantsScreen && !usedDisplayCapture) {
      showToast("Screen capture unavailable. Using camera/mic fallback.", { tone: "error", duration: 3200 });
    }
  }
  if (!stream) {
    const message = wantsScreen
      ? describeMediaAccessError(displayError, "Could not start screen share capture.")
      : "Could not access microphone/camera. Check permissions and retry.";
    showXmppMediaAccessError(message);
    addXmppDebugEvent("error", "Failed acquiring local media stream for XMPP session", {
      sid,
      wantsScreen,
      displayError: displayError ? String(displayError?.message || displayError) : "",
      audioDeviceId,
      videoDeviceId
    });
    return null;
  }
  if (!wantsScreen) {
    stream.getVideoTracks().forEach((track) => {
      track.enabled = false;
    });
    const liveSession = xmppCallSessionById.get(sid) || null;
    if (liveSession) liveSession.localVideoMuted = true;
  }
  xmppCallLocalMediaStreamBySessionId.set(sid, stream);
  if (nextAux) {
    xmppCallLocalAuxStreamsBySessionId.set(sid, nextAux);
  } else if (forceNew) {
    xmppCallLocalAuxStreamsBySessionId.delete(sid);
  }
  return stream;
}

async function xmppAttachLocalMediaToSessionPeerConnection(sessionId, {
  screenShare = false,
  forceNewStream = false,
  screenOptions = null
} = {}) {
  const sid = (sessionId || "").toString().trim();
  if (!sid) return false;
  const session = xmppCallSessionById.get(sid) || null;
  const entry = xmppEnsureSessionPeerConnection(sid, {
    peerJid: session?.peerJid || "",
    media: xmppCallSessionMediaList(session),
    createLocalOffer: session?.direction === "outgoing"
  });
  if (!entry?.pc) return false;
  const previousStream = xmppCallLocalMediaStreamBySessionId.get(sid) || null;
  const previousAux = xmppCallLocalAuxStreamsBySessionId.get(sid) || null;
  const stream = await xmppAcquireLocalMediaStreamForSession(sid, {
    screenShare,
    forceNew: Boolean(forceNewStream),
    screenOptions
  });
  if (!stream) return false;
  const tracks = stream.getTracks();
  if (tracks.length <= 0) return false;
  for (const track of tracks) {
    const kind = (track.kind || "").toLowerCase();
    if (!kind) continue;
    const transceiver = entry.pc.getTransceivers()
      .find((candidate) => (candidate?.receiver?.track?.kind || candidate?.sender?.track?.kind || "").toLowerCase() === kind) || null;
    if (transceiver?.sender) {
      try {
        await transceiver.sender.replaceTrack(track);
        continue;
      } catch {
        // Fall through to addTrack.
      }
    }
    try {
      entry.pc.addTrack(track, stream);
    } catch {
      // Ignore addTrack failures.
    }
  }
  if (forceNewStream && previousStream && previousStream !== stream) {
    stopMediaStreamTracksSafe(previousStream);
    stopLocalAuxMediaForSessionEntry(previousAux);
  }
  if (session) {
    session.localMediaMode = screenShare ? "screen" : "camera";
  }
  if (screenShare) {
    stream.getVideoTracks().forEach((track) => {
      track.addEventListener("ended", () => {
        const activeSession = xmppCallSessionById.get(sid) || null;
        if (!activeSession || activeSession.localMediaMode !== "screen") return;
        void xmppSwitchLocalMediaMode(sid, "camera");
      }, { once: true });
    });
  }
  if (xmppActiveNativeCallSessionId === sid) renderNativeXmppCallSurface(sid);
  return true;
}

function xmppLocalMediaSnapshot(sessionId = "") {
  const sid = (sessionId || "").toString().trim();
  const session = xmppCallSessionById.get(sid) || null;
  const stream = xmppCallLocalMediaStreamBySessionId.get(sid) || null;
  const audioTracks = stream ? stream.getAudioTracks() : [];
  const videoTracks = stream ? stream.getVideoTracks() : [];
  const audioEnabled = audioTracks.some((track) => track.enabled);
  const videoEnabled = videoTracks.some((track) => track.enabled);
  return {
    session,
    stream,
    audioTracks,
    videoTracks,
    audioEnabled,
    videoEnabled,
    mode: (session?.localMediaMode || "camera").toString().trim() || "camera"
  };
}

function formatMediaDeviceLabel(device, fallback) {
  if (!device) return fallback;
  const label = (device.label || "").toString().trim();
  return label || fallback;
}

function canSetAudioOutputDevice() {
  return typeof HTMLMediaElement !== "undefined"
    && typeof HTMLMediaElement.prototype?.setSinkId === "function";
}

async function applyAudioOutputDeviceToElement(element, deviceId = "") {
  if (!(element instanceof HTMLMediaElement)) return false;
  if (!canSetAudioOutputDevice()) return false;
  const targetId = normalizeMediaDeviceId(deviceId);
  try {
    await element.setSinkId(targetId || "");
    return true;
  } catch {
    return false;
  }
}

async function refreshMediaDeviceSnapshot({ force = false } = {}) {
  if (!navigator.mediaDevices?.enumerateDevices) return mediaDeviceSnapshot;
  if (mediaDeviceSnapshot.loading) return mediaDeviceSnapshot;
  if (!force && mediaDeviceSnapshot.ready) return mediaDeviceSnapshot;
  mediaDeviceSnapshot.loading = true;
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const audio = devices
      .filter((device) => device.kind === "audioinput")
      .map((device) => ({ id: device.deviceId, label: device.label || "" }));
    const video = devices
      .filter((device) => device.kind === "videoinput")
      .map((device) => ({ id: device.deviceId, label: device.label || "" }));
    const output = devices
      .filter((device) => device.kind === "audiooutput")
      .map((device) => ({ id: device.deviceId, label: device.label || "" }));
    mediaDeviceSnapshot = {
      audio,
      video,
      output,
      ready: true,
      loading: false
    };
  } catch {
    mediaDeviceSnapshot.loading = false;
  }
  return mediaDeviceSnapshot;
}

async function xmppReacquireLocalMediaForSession(sessionId = "") {
  const sid = (sessionId || "").toString().trim();
  if (!sid) return false;
  const before = xmppLocalMediaSnapshot(sid);
  const mode = before.mode;
  const peerJid = before.session?.peerJid || "";
  await xmppAttachLocalMediaToSessionPeerConnection(sid, {
    screenShare: mode === "screen",
    forceNewStream: true
  });
  const after = xmppLocalMediaSnapshot(sid);
  if (before.audioTracks.length > 0) xmppSetLocalTracksEnabled(sid, "audio", before.audioEnabled);
  if (before.videoTracks.length > 0) xmppSetLocalTracksEnabled(sid, "video", before.videoEnabled);
  if (peerJid) {
    xmppQueueTransportInfoGatherAndSend(peerJid, sid, { force: true });
  }
  if (xmppActiveNativeCallSessionId === sid) renderNativeXmppCallSurface(sid);
  return Boolean(after.stream);
}

async function xmppReplaceLocalCameraTrackForSession(sessionId = "", deviceId = "") {
  const sid = (sessionId || "").toString().trim();
  if (!sid || !navigator.mediaDevices?.getUserMedia) return false;
  const snapshot = xmppLocalMediaSnapshot(sid);
  if (!snapshot.stream || snapshot.mode !== "camera") return false;
  const entry = xmppCallPeerConnectionBySessionId.get(sid) || null;
  const pc = entry?.pc || null;
  if (!pc) return false;
  const normalizedDeviceId = normalizeMediaDeviceId(deviceId);
  const videoConstraint = normalizedDeviceId ? { deviceId: { exact: normalizedDeviceId } } : true;
  let captureStream = null;
  try {
    captureStream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: videoConstraint
    });
    const nextTrack = captureStream.getVideoTracks()[0] || null;
    if (!(nextTrack instanceof MediaStreamTrack)) return false;
    const localStream = snapshot.stream;
    const currentTrack = localStream.getVideoTracks()[0] || null;
    const sender = pc.getSenders()
      .find((candidate) => (candidate?.track?.kind || "").toLowerCase() === "video") || null;
    if (sender && typeof sender.replaceTrack === "function") {
      await sender.replaceTrack(nextTrack);
    } else {
      try {
        pc.addTrack(nextTrack, localStream);
      } catch {
        return false;
      }
    }
    if (currentTrack && currentTrack !== nextTrack) {
      localStream.removeTrack(currentTrack);
      try {
        currentTrack.stop();
      } catch {
        // Ignore old track shutdown failures.
      }
    }
    localStream.addTrack(nextTrack);
    if (!snapshot.videoEnabled) {
      nextTrack.enabled = false;
      const session = xmppCallSessionById.get(sid) || null;
      if (session) session.localVideoMuted = true;
    }
    return true;
  } catch {
    return false;
  } finally {
    if (captureStream instanceof MediaStream) {
      captureStream.getTracks().forEach((track) => {
        if (!snapshot.stream?.getTracks().includes(track)) {
          try {
            track.stop();
          } catch {
            // Ignore temp stream cleanup failures.
          }
        }
      });
    }
    if (xmppActiveNativeCallSessionId === sid) renderNativeXmppCallSurface(sid);
  }
}

async function xmppReplaceLocalAudioTrackForSession(sessionId = "", deviceId = "") {
  const sid = (sessionId || "").toString().trim();
  if (!sid || !navigator.mediaDevices?.getUserMedia) return false;
  const snapshot = xmppLocalMediaSnapshot(sid);
  if (!snapshot.stream || snapshot.mode !== "camera") return false;
  const entry = xmppCallPeerConnectionBySessionId.get(sid) || null;
  const pc = entry?.pc || null;
  if (!pc) return false;
  const normalizedDeviceId = normalizeMediaDeviceId(deviceId);
  const audioConstraint = normalizedDeviceId ? { deviceId: { exact: normalizedDeviceId } } : true;
  let captureStream = null;
  try {
    captureStream = await navigator.mediaDevices.getUserMedia({
      audio: audioConstraint,
      video: false
    });
    const nextTrack = captureStream.getAudioTracks()[0] || null;
    if (!(nextTrack instanceof MediaStreamTrack)) return false;
    const localStream = snapshot.stream;
    const currentTrack = localStream.getAudioTracks()[0] || null;
    const sender = pc.getSenders()
      .find((candidate) => (candidate?.track?.kind || "").toLowerCase() === "audio") || null;
    if (sender && typeof sender.replaceTrack === "function") {
      await sender.replaceTrack(nextTrack);
    } else {
      try {
        pc.addTrack(nextTrack, localStream);
      } catch {
        return false;
      }
    }
    if (currentTrack && currentTrack !== nextTrack) {
      localStream.removeTrack(currentTrack);
      try {
        currentTrack.stop();
      } catch {
        // Ignore old track shutdown failures.
      }
    }
    localStream.addTrack(nextTrack);
    if (!snapshot.audioEnabled) {
      nextTrack.enabled = false;
      const session = xmppCallSessionById.get(sid) || null;
      if (session) session.localMuted = true;
    }
    return true;
  } catch {
    return false;
  } finally {
    if (captureStream instanceof MediaStream) {
      captureStream.getTracks().forEach((track) => {
        if (!snapshot.stream?.getTracks().includes(track)) {
          try {
            track.stop();
          } catch {
            // Ignore temp stream cleanup failures.
          }
        }
      });
    }
    if (xmppActiveNativeCallSessionId === sid) renderNativeXmppCallSurface(sid);
  }
}

function xmppContentModifyCatalogForSession(sessionId = "", session = null, { localRole = "initiator" } = {}) {
  const sid = (sessionId || "").toString().trim();
  if (!sid) return [];
  if (Array.isArray(session?.localContents) && session.localContents.length > 0) {
    return session.localContents
      .map((entry, index) => ({
        name: (entry?.name || `${entry?.media || "audio"}${index}`).toString().trim(),
        media: (entry?.media || "").toString().trim().toLowerCase(),
        creator: (entry?.creator || "").toString().trim().toLowerCase() || "",
        senders: (entry?.senders || "both").toString().trim().toLowerCase() || "both",
        payloadTypes: Array.isArray(entry?.payloadTypes) ? entry.payloadTypes : [],
        rtcpFeedback: Array.isArray(entry?.rtcpFeedback) ? entry.rtcpFeedback : [],
        transport: entry?.transport && typeof entry.transport === "object" ? entry.transport : null
      }))
      .filter((entry) => entry.name && (entry.media === "audio" || entry.media === "video"));
  }
  if (Array.isArray(session?.remoteContents) && session.remoteContents.length > 0) {
    return session.remoteContents
      .map((entry, index) => ({
        name: (entry?.name || `${entry?.media || "audio"}${index}`).toString().trim(),
        media: (entry?.media || "").toString().trim().toLowerCase(),
        creator: (entry?.creator || "").toString().trim().toLowerCase() || "",
        payloadTypes: Array.isArray(entry?.payloadTypes) ? entry.payloadTypes : [],
        rtcpFeedback: Array.isArray(entry?.rtcpFeedback) ? entry.rtcpFeedback : [],
        transport: entry?.transport && typeof entry.transport === "object" ? entry.transport : null
      }))
      .filter((entry) => entry.name && (entry.media === "audio" || entry.media === "video"));
  }
  const localSdp = (xmppCallPeerConnectionBySessionId.get(sid)?.pc?.localDescription?.sdp || "").toString();
  if (localSdp && typeof xmppBuildJingleContentsFromSdp === "function") {
    const built = xmppBuildJingleContentsFromSdp(localSdp, { localRole });
    if (Array.isArray(built) && built.length > 0) {
      return built
        .map((entry, index) => ({
          name: (entry?.name || `${entry?.media || "audio"}${index}`).toString().trim(),
          media: (entry?.media || "").toString().trim().toLowerCase(),
          creator: (entry?.creator || "").toString().trim().toLowerCase() || "",
          payloadTypes: Array.isArray(entry?.payloadTypes) ? entry.payloadTypes : [],
          rtcpFeedback: Array.isArray(entry?.rtcpFeedback) ? entry.rtcpFeedback : [],
          transport: entry?.transport && typeof entry.transport === "object" ? entry.transport : null
        }))
        .filter((entry) => entry.name && (entry.media === "audio" || entry.media === "video"));
    }
  }
  return xmppCallSessionMediaList(session).map((mediaType) => ({
    name: `${mediaType}`,
    media: mediaType,
    creator: localRole,
    payloadTypes: [],
    rtcpFeedback: [],
    transport: null
  }));
}

function xmppSetLocalTracksEnabled(sessionId = "", kind = "", enabled = true, { suppressSessionInfo = false } = {}) {
  const sid = (sessionId || "").toString().trim();
  if (!sid) return false;
  const snapshot = xmppLocalMediaSnapshot(sid);
  const tracks = kind === "audio" ? snapshot.audioTracks : (kind === "video" ? snapshot.videoTracks : []);
  if (tracks.length === 0) return false;
  tracks.forEach((track) => {
    track.enabled = enabled;
  });
  if (snapshot.session) {
    if (kind === "audio") snapshot.session.localMuted = !enabled;
    if (kind === "video") snapshot.session.localVideoMuted = !enabled;
  }
  if (kind === "audio" && snapshot.session?.peerJid && !suppressSessionInfo) {
    xmppSendJingleSessionInfo(snapshot.session.peerJid, sid, { info: enabled ? "unmute" : "mute" });
  }
  if (snapshot.session?.peerJid) {
    const localRole = (snapshot.session.localJingleRole || (snapshot.session.direction === "outgoing" ? "initiator" : "responder"))
      .toString()
      .trim()
      .toLowerCase() === "initiator"
      ? "initiator"
      : "responder";
    const senders = xmppJingleSendersForLocalEnabled(enabled, localRole);
    const contents = xmppContentModifyCatalogForSession(sid, snapshot.session, { localRole });
    const updates = contents
      .filter((entry) => (entry.media || "").toString().trim().toLowerCase() === kind)
      .map((entry, index) => ({
        ...entry,
        name: (entry.name || `${kind}${index}`).toString().trim(),
        media: kind,
        senders,
        creator: (entry.creator || localRole).toString().trim().toLowerCase() || localRole
      }));
    if (updates.length > 0) {
      xmppSendJingleContentModify(snapshot.session.peerJid, sid, updates);
    }
  }
  if (xmppActiveNativeCallSessionId === sid) renderNativeXmppCallSurface(sid);
  return true;
}

async function xmppSetLocalSessionHold(sessionId = "", hold = true) {
  const sid = (sessionId || "").toString().trim();
  if (!sid) return false;
  const session = xmppCallSessionById.get(sid) || null;
  if (!session) return false;
  const nextHold = Boolean(hold);
  if (Boolean(session.localHold) === nextHold) return true;
  const snapshot = xmppLocalMediaSnapshot(sid);
  if (nextHold) {
    session.localHold = true;
    session.localHoldRestore = {
      audioEnabled: Boolean(snapshot.audioEnabled),
      videoEnabled: Boolean(snapshot.videoEnabled)
    };
    if (snapshot.audioTracks.length > 0) xmppSetLocalTracksEnabled(sid, "audio", false, { suppressSessionInfo: true });
    if (snapshot.videoTracks.length > 0) xmppSetLocalTracksEnabled(sid, "video", false, { suppressSessionInfo: true });
    if (session.peerJid) xmppSendJingleSessionInfo(session.peerJid, sid, { info: "hold" });
  } else {
    session.localHold = false;
    const restore = session.localHoldRestore && typeof session.localHoldRestore === "object"
      ? session.localHoldRestore
      : {};
    const restoreAudio = typeof restore.audioEnabled === "boolean" ? restore.audioEnabled : true;
    const restoreVideo = typeof restore.videoEnabled === "boolean" ? restore.videoEnabled : true;
    if (snapshot.audioTracks.length > 0) xmppSetLocalTracksEnabled(sid, "audio", restoreAudio, { suppressSessionInfo: true });
    if (snapshot.videoTracks.length > 0) xmppSetLocalTracksEnabled(sid, "video", restoreVideo, { suppressSessionInfo: true });
    session.localHoldRestore = null;
    if (session.peerJid) xmppSendJingleSessionInfo(session.peerJid, sid, { info: "active" });
  }
  addXmppDebugEvent("call", nextHold ? "Local call hold enabled" : "Local call hold disabled", {
    sid,
    peer: xmppBareJid(session.peerJid || "")
  });
  if (xmppActiveNativeCallSessionId === sid) renderNativeXmppCallSurface(sid);
  return true;
}

async function xmppEnsureLocalMediaAttached(sessionId = "", { screenShare = false } = {}) {
  const sid = (sessionId || "").toString().trim();
  if (!sid) return null;
  if (xmppCallLocalMediaStreamBySessionId.get(sid)) {
    return xmppCallLocalMediaStreamBySessionId.get(sid) || null;
  }
  await xmppAttachLocalMediaToSessionPeerConnection(sid, { screenShare });
  return xmppCallLocalMediaStreamBySessionId.get(sid) || null;
}

async function xmppSwitchLocalMediaMode(sessionId = "", mode = "camera", { screenOptions = null } = {}) {
  const sid = (sessionId || "").toString().trim();
  if (!sid) return false;
  const before = xmppLocalMediaSnapshot(sid);
  const wantsScreen = mode === "screen";
  if (wantsScreen) {
    const capability = screenShareCapabilitySnapshot();
    if (!capability.ok) {
      showToast(capability.reason || "Screen sharing unavailable.", { tone: "error" });
      return false;
    }
    if (capability.warning) {
      showXmppScreenShareWarning(capability.warning);
    }
  }
  const attached = await xmppAttachLocalMediaToSessionPeerConnection(sid, {
    screenShare: wantsScreen,
    forceNewStream: true,
    screenOptions
  });
  if (!attached) {
    const failureMessage = wantsScreen
      ? "Screen share start canceled or unavailable. Keeping current media."
      : "Could not switch back to camera. Keeping current media.";
    showToast(failureMessage, { tone: "error", duration: 2800 });
    return false;
  }
  const session = xmppCallSessionById.get(sid) || null;
  if (session) session.localMediaMode = wantsScreen ? "screen" : "camera";
  if (before.audioTracks.length > 0) xmppSetLocalTracksEnabled(sid, "audio", before.audioEnabled);
  if (before.videoTracks.length > 0) xmppSetLocalTracksEnabled(sid, "video", before.videoEnabled);
  if (session?.peerJid) {
    const localRole = (session.localJingleRole || (session.direction === "outgoing" ? "initiator" : "responder"))
      .toString()
      .trim()
      .toLowerCase() === "initiator"
      ? "initiator"
      : "responder";
    const snapshot = xmppLocalMediaSnapshot(sid);
    const senders = xmppJingleSendersForLocalEnabled(snapshot.videoEnabled, localRole);
    const contents = xmppContentModifyCatalogForSession(sid, session, { localRole });
    const updates = contents
      .filter((entry) => (entry.media || "").toString().trim().toLowerCase() === "video")
      .map((entry, index) => ({
        ...entry,
        name: (entry.name || `video${index}`).toString().trim(),
        media: "video",
        senders,
        creator: (entry.creator || localRole).toString().trim().toLowerCase() || localRole
      }));
    if (updates.length > 0) {
      xmppSendJingleContentModify(session.peerJid, sid, updates);
    }
    xmppQueueTransportInfoGatherAndSend(session.peerJid, sid, { force: true });
  }
  if (xmppActiveNativeCallSessionId === sid) renderNativeXmppCallSurface(sid);
  return true;
}

function xmppSendJingleMessageAction(peerJid, action = "propose", {
  sessionId = "",
  media = XMPP_CALL_DEFAULT_MEDIA,
  preferFull = false
} = {}) {
  const to = xmppNormalizeCallTargetJid(peerJid, { preferFull });
  const id = (sessionId || "").toString().trim();
  if (!to || !id || !xmppConnection || relayStatus !== "connected" || !globalThis.$msg) return false;
  const barePeer = xmppBareJid(to);
  const cachedDisco = barePeer ? xmppDiscoInfoCacheByJid.get(barePeer) : null;
  const featureList = Array.isArray(cachedDisco?.features) ? cachedDisco.features : [];
  const featureSet = new Set(featureList);
  const plan = (typeof XEP_0353_JINGLE_MESSAGE_PARSE_GLOBAL.xmppBuildJingleMessageSendPlan === "function")
    ? XEP_0353_JINGLE_MESSAGE_PARSE_GLOBAL.xmppBuildJingleMessageSendPlan({
      to,
      action,
      sessionId: id,
      featureSet,
      media
    }, {
      namespaceV0: XMPP_JINGLE_MESSAGE_INIT_NAMESPACE,
      namespaceV1: XMPP_JINGLE_MESSAGE_INIT_NAMESPACE_V1,
      defaultMedia: XMPP_CALL_DEFAULT_MEDIA
    })
    : null;
  const tag = (plan?.action || (action || "").toString().trim().toLowerCase());
  if (!tag || !["propose", "proceed", "accept", "retract", "reject", "ringing"].includes(tag)) return false;
  const uniqueNamespaces = Array.isArray(plan?.namespaces) && plan.namespaces.length > 0
    ? plan.namespaces
    : (typeof XEP_0353_JINGLE_MESSAGE_PARSE_GLOBAL.xmppJingleMessageNamespacesForFeatures === "function"
      ? XEP_0353_JINGLE_MESSAGE_PARSE_GLOBAL.xmppJingleMessageNamespacesForFeatures(featureSet, {
        namespaceV0: XMPP_JINGLE_MESSAGE_INIT_NAMESPACE,
        namespaceV1: XMPP_JINGLE_MESSAGE_INIT_NAMESPACE_V1
      })
      : [XMPP_JINGLE_MESSAGE_INIT_NAMESPACE_V1, XMPP_JINGLE_MESSAGE_INIT_NAMESPACE]);
  const sendMedia = Array.isArray(plan?.media) ? plan.media : media;
  const builtStanzas = (typeof XEP_0353_JINGLE_MESSAGE_PARSE_GLOBAL.xmppBuildJingleMessageStanzas === "function")
    ? XEP_0353_JINGLE_MESSAGE_PARSE_GLOBAL.xmppBuildJingleMessageStanzas({
      to,
      action: tag,
      sessionId: id,
      namespaces: uniqueNamespaces,
      media: sendMedia
    }, {
      $msg: globalThis.$msg,
      rtpNamespace: XMPP_JINGLE_RTP_NAMESPACE,
      defaultMedia: XMPP_CALL_DEFAULT_MEDIA
    })
    : [];
  const stanzasToSend = builtStanzas.length > 0
    ? builtStanzas
    : uniqueNamespaces
      .map((namespace) => {
        const builder = globalThis.$msg({ to, type: "chat" }).c(tag, { xmlns: namespace, id });
        if (tag === "propose") {
          const medias = [...new Set(
            (Array.isArray(sendMedia) ? sendMedia : XMPP_CALL_DEFAULT_MEDIA)
              .map((item) => (item || "").toString().trim().toLowerCase())
              .filter((item) => item === "audio" || item === "video")
          )];
          (medias.length > 0 ? medias : XMPP_CALL_DEFAULT_MEDIA).forEach((mediaType) => {
            builder.c("description", { xmlns: XMPP_JINGLE_RTP_NAMESPACE, media: mediaType }).up();
          });
        }
        return builder;
      })
      .filter(Boolean);
  let sentCount = 0;
  stanzasToSend.forEach((builder) => {
    xmppConnection.send(builder);
    sentCount += 1;
  });
  if (sentCount <= 0) return false;
  addXmppDebugEvent("call", "Sent Jingle Message", {
    to,
    action: tag,
    id,
    xmlns: uniqueNamespaces.join(","),
    media: tag === "propose" ? (sendMedia || []) : []
  });
  const shouldCompatLog = (typeof XEP_0353_JINGLE_MESSAGE_PARSE_GLOBAL.xmppShouldLogJingleMessageCompatFallback === "function")
    ? XEP_0353_JINGLE_MESSAGE_PARSE_GLOBAL.xmppShouldLogJingleMessageCompatFallback(featureSet, uniqueNamespaces, {
      namespaceV0: XMPP_JINGLE_MESSAGE_INIT_NAMESPACE,
      namespaceV1: XMPP_JINGLE_MESSAGE_INIT_NAMESPACE_V1
    })
    : (!featureSet.has(XMPP_JINGLE_MESSAGE_INIT_NAMESPACE) && !featureSet.has(XMPP_JINGLE_MESSAGE_INIT_NAMESPACE_V1) && uniqueNamespaces.length > 1);
  if (shouldCompatLog) {
    addXmppDebugEvent("call", "Sent Jingle Message compatibility fallback", {
      to,
      action: tag,
      id,
      namespaces: uniqueNamespaces
    });
  }
  addXmppDebugEvent("message", "Sent XMPP jingle-message action", { to, action: tag, id });
  return true;
}

function getGuildNotificationMode(guildId) {
  if (!guildId) return "all";
  const prefs = getPreferences();
  return prefs.guildNotifications[guildId] || "all";
}

function setGuildNotificationMode(guildId, mode) {
  if (!guildId) return;
  state.preferences = getPreferences();
  state.preferences.guildNotifications = {
    ...state.preferences.guildNotifications,
    [guildId]: normalizeGuildNotificationMode(mode)
  };
}

function applyGuildNotificationModeToStats(stats, mode) {
  if (mode === "mute") return { unread: 0, mentions: 0 };
  if (mode === "mentions") return { unread: 0, mentions: stats.mentions };
  return stats;
}

function isForumThreadCollapsed(channelId, threadId) {
  if (!channelId || !threadId) return false;
  const prefs = getPreferences();
  return Boolean(prefs.forumCollapsedThreads?.[channelId]?.[threadId]);
}

function setForumThreadCollapsed(channelId, threadId, collapsed) {
  if (!channelId || !threadId) return;
  state.preferences = getPreferences();
  const current = state.preferences.forumCollapsedThreads || {};
  state.preferences.forumCollapsedThreads = {
    ...current,
    [channelId]: {
      ...(current[channelId] || {}),
      [threadId]: Boolean(collapsed)
    }
  };
}

function getForumThreadReadTimestamp(channelId, threadId) {
  if (!channelId || !threadId) return "";
  const prefs = getPreferences();
  return prefs.forumThreadReadState?.[channelId]?.[threadId] || "";
}

function setForumThreadReadTimestamp(channelId, threadId, tsValue) {
  if (!channelId || !threadId) return;
  state.preferences = getPreferences();
  const current = state.preferences.forumThreadReadState || {};
  state.preferences.forumThreadReadState = {
    ...current,
    [channelId]: {
      ...(current[channelId] || {}),
      [threadId]: typeof tsValue === "string" ? tsValue : new Date().toISOString()
    }
  };
}

function getForumThreadSortMode(channelId) {
  if (!channelId) return "latest";
  const prefs = getPreferences();
  return prefs.forumThreadSort?.[channelId] === "created" ? "created" : "latest";
}

function setForumThreadSortMode(channelId, mode) {
  if (!channelId) return;
  state.preferences = getPreferences();
  state.preferences.forumThreadSort = {
    ...(state.preferences.forumThreadSort || {}),
    [channelId]: mode === "created" ? "created" : "latest"
  };
}

function getForumThreadTagFilter(channelId) {
  if (!channelId) return [];
  const prefs = getPreferences();
  return Array.isArray(prefs.forumThreadTagFilter?.[channelId]) ? prefs.forumThreadTagFilter[channelId] : [];
}

function setForumThreadTagFilter(channelId, tagIds) {
  if (!channelId) return;
  state.preferences = getPreferences();
  const current = state.preferences.forumThreadTagFilter || {};
  const normalized = [...new Set((Array.isArray(tagIds) ? tagIds : []).map((id) => (id || "").toString()).filter(Boolean))].slice(0, 8);
  if (normalized.length === 0) {
    const next = { ...current };
    delete next[channelId];
    state.preferences.forumThreadTagFilter = next;
    return;
  }
  state.preferences.forumThreadTagFilter = {
    ...current,
    [channelId]: normalized
  };
}

function toggleForumThreadTagFilter(channelId, tagId) {
  if (!channelId || !tagId) return;
  const current = getForumThreadTagFilter(channelId);
  const has = current.includes(tagId);
  const next = has ? current.filter((entry) => entry !== tagId) : [...current, tagId];
  setForumThreadTagFilter(channelId, next);
}

function isForumThreadUnreadOnly(channelId) {
  if (!channelId) return false;
  const prefs = getPreferences();
  return Boolean(prefs.forumThreadUnreadOnly?.[channelId]);
}

function setForumThreadUnreadOnly(channelId, enabled) {
  if (!channelId) return;
  state.preferences = getPreferences();
  const current = state.preferences.forumThreadUnreadOnly || {};
  if (!enabled) {
    const next = { ...current };
    delete next[channelId];
    state.preferences.forumThreadUnreadOnly = next;
    return;
  }
  state.preferences.forumThreadUnreadOnly = {
    ...current,
    [channelId]: true
  };
}

function isForumThreadMyOnly(channelId) {
  if (!channelId) return false;
  const prefs = getPreferences();
  return Boolean(prefs.forumThreadMyOnly?.[channelId]);
}

function setForumThreadMyOnly(channelId, enabled) {
  if (!channelId) return;
  state.preferences = getPreferences();
  const current = state.preferences.forumThreadMyOnly || {};
  if (!enabled) {
    const next = { ...current };
    delete next[channelId];
    state.preferences.forumThreadMyOnly = next;
    return;
  }
  state.preferences.forumThreadMyOnly = {
    ...current,
    [channelId]: true
  };
}

function isSpaceGroupCollapsed(spaceId) {
  if (!spaceId) return false;
  const prefs = getPreferences();
  return Boolean(prefs.spaceGroupCollapsed?.[spaceId]);
}

function setSpaceGroupCollapsed(spaceId, collapsed) {
  if (!spaceId) return;
  state.preferences = getPreferences();
  const current = state.preferences.spaceGroupCollapsed || {};
  if (!collapsed) {
    const next = { ...current };
    delete next[spaceId];
    state.preferences.spaceGroupCollapsed = next;
    return;
  }
  state.preferences.spaceGroupCollapsed = {
    ...current,
    [spaceId]: true
  };
}

function forumTagsForChannel(channel) {
  return normalizeForumTags(channel?.forumTags || []);
}

function resolveForumTagByName(channel, name) {
  const normalizedName = sanitizeForumTagName(name);
  if (!normalizedName) return null;
  const tags = forumTagsForChannel(channel);
  return tags.find((tag) => tag.name === normalizedName) || null;
}

function swfAutoplayFromPreferences() {
  return getPreferences().swfAutoplay === "off" ? "off" : "on";
}

function resolveAccountGuildNickname(account, guildId) {
  if (!account || !guildId) return "";
  if (!account.guildProfiles || typeof account.guildProfiles !== "object") return "";
  const profile = account.guildProfiles[guildId];
  return (profile?.nickname || "").toString().trim().slice(0, 32);
}

function displayNameForAccount(account, guildId = null) {
  if (!account) return "Unknown";
  const nick = resolveAccountGuildNickname(account, guildId);
  if (nick) return nick;
  return account.displayName || account.username;
}

function accountBareXmppJid(account) {
  return xmppBareJid(account?.xmppJid || "");
}

function dmPrimaryLabelForAccount(account) {
  if (!account) return "Unknown DM";
  const bareJid = accountBareXmppJid(account);
  if (bareJid) return bareJid;
  return `@${account.username || "unknown"}`;
}

function dmSecondaryLabelForAccount(account) {
  if (!account) return "";
  const bareJid = accountBareXmppJid(account);
  if (bareJid) return `xmpp:${bareJid}`;
  const display = displayNameForAccount(account, null);
  const fallback = `@${account.username || "unknown"}`;
  return display && display !== account.username ? display : fallback;
}

function resolveAccountAvatar(account, guildId = null) {
  const fallback = {
    color: account?.avatarColor || "#57f287",
    url: account?.avatarUrl || ""
  };
  if (!account || !guildId || !account.guildProfiles || typeof account.guildProfiles !== "object") {
    return fallback;
  }
  const profile = account.guildProfiles[guildId];
  if (!profile || typeof profile !== "object") return fallback;
  return {
    color: (profile.avatarColor || fallback.color || "#57f287").toString(),
    url: (profile.avatarUrl || fallback.url || "").toString()
  };
}

function resolveAccountBanner(account, guildId = null) {
  const fallback = (account?.banner || "").toString();
  if (!account || !guildId || !account.guildProfiles || typeof account.guildProfiles !== "object") return fallback;
  const profile = account.guildProfiles[guildId];
  if (!profile || typeof profile !== "object") return fallback;
  return (profile.banner || fallback || "").toString();
}

function getMemberTopRoleColor(server, accountId) {
  const roles = getMemberRoles(server, accountId).filter((role) => role.name !== "@everyone");
  if (roles.length === 0) return "";
  const top = roles[roles.length - 1];
  return (top?.color || "").toString();
}

function getMemberTopRoleName(server, accountId) {
  const roles = getMemberRoles(server, accountId).filter((role) => role.name !== "@everyone");
  if (roles.length === 0) return "";
  return (roles[roles.length - 1]?.name || "").toString();
}

function parseStatusExpiryAt(value) {
  const now = new Date();
  if (value === "30m") return new Date(now.getTime() + 30 * 60 * 1000).toISOString();
  if (value === "1h") return new Date(now.getTime() + 60 * 60 * 1000).toISOString();
  if (value === "4h") return new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString();
  if (value === "today") {
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    return end.toISOString();
  }
  return null;
}

function statusExpiryPreset(account) {
  if (!account?.customStatusExpiresAt) return "never";
  const expiry = new Date(account.customStatusExpiresAt).getTime();
  const now = Date.now();
  const delta = Math.max(0, expiry - now);
  if (delta <= 35 * 60 * 1000) return "30m";
  if (delta <= 65 * 60 * 1000) return "1h";
  if (delta <= 4.5 * 60 * 60 * 1000) return "4h";
  return "today";
}

function resolveAccountStatus(account, guildId = null) {
  if (!account) return { text: "", emoji: "" };
  if (guildId && account.guildProfiles && typeof account.guildProfiles === "object") {
    const profile = account.guildProfiles[guildId];
    const guildStatus = (profile?.status || "").toString().trim().slice(0, 80);
    if (guildStatus) {
      return {
        text: guildStatus,
        emoji: (profile?.statusEmoji || account.customStatusEmoji || "").toString().trim().slice(0, 4)
      };
    }
  }
  return {
    text: (account.customStatus || "").trim(),
    emoji: (account.customStatusEmoji || "").trim().slice(0, 4)
  };
}

function pruneExpiredStatuses() {
  let changed = false;
  const now = Date.now();
  state.accounts.forEach((account) => {
    if (!account?.customStatusExpiresAt) return;
    const expiry = Date.parse(account.customStatusExpiresAt);
    if (!Number.isFinite(expiry) || expiry > now) return;
    account.customStatus = "";
    account.customStatusEmoji = "";
    account.customStatusExpiresAt = null;
    changed = true;
  });
  return changed;
}

function displayStatus(account, guildId = null) {
  if (!account) return "Offline";
  const status = resolveAccountStatus(account, guildId);
  const statusText = status.text;
  if (statusText) {
    const emoji = status.emoji;
    return emoji ? `${emoji} ${statusText}` : statusText;
  }
  return presenceLabel(account.presence);
}

function accountDecorationEmoji(account) {
  return (account?.avatarDecoration || "").toString().trim().slice(0, 4);
}

function accountGuildTag(account) {
  return (account?.guildTag || "").toString().trim().slice(0, 8);
}

function resolveGuildTagGuild(account) {
  if (!account) return null;
  const explicitId = normalizeGuildTagGuildId(account.guildTagGuildId);
  if (explicitId) {
    const explicitGuild = state.guilds.find((guild) => guild.id === explicitId) || null;
    if (explicitGuild) return explicitGuild;
  }
  const memberGuilds = state.guilds.filter((guild) => Array.isArray(guild.memberIds) && guild.memberIds.includes(account.id));
  const activeGuild = getActiveGuild();
  if (activeGuild && memberGuilds.some((guild) => guild.id === activeGuild.id)) return activeGuild;
  const tagToken = accountGuildTag(account).toLowerCase();
  if (tagToken) {
    const matched = memberGuilds.find((guild) => (guild.name || "").toLowerCase().replace(/\s+/g, "").includes(tagToken));
    if (matched) return matched;
  }
  return memberGuilds[0] || null;
}

function accountProfileEffect(account) {
  return normalizeProfileEffect(account?.profileEffect);
}

function accountNameplateSvg(account) {
  const raw = (account?.profileNameplateSvg || "").toString().trim().slice(0, 280);
  if (!raw) return "";
  if (/^data:image\/svg\+xml/i.test(raw)) return raw;
  if (/^https?:\/\//i.test(raw)) return raw;
  return "";
}

function showGuildTagInfo(account) {
  if (!account) return;
  const tag = accountGuildTag(account);
  if (!tag) return;
  const guild = resolveGuildTagGuild(account);
  if (!ui.guildTagInfoDialog) {
    const fallback = guild ? `${tag} · ${guild.name}` : `${tag} · no linked guild`;
    showToast(fallback);
    return;
  }
  const owner = guild?.ownerId ? getAccountById(guild.ownerId) : null;
  const linkedGuildName = guild?.name || "No linked guild";
  const tagOwnerName = displayNameForAccount(account, guild?.id || null);
  if (ui.guildTagInfoTag) ui.guildTagInfoTag.textContent = tag;
  if (ui.guildTagInfoAccount) ui.guildTagInfoAccount.textContent = `Tag owner: ${tagOwnerName}`;
  if (ui.guildTagInfoGuildName) ui.guildTagInfoGuildName.textContent = linkedGuildName;
  if (ui.guildTagInfoMeta) {
    if (guild) {
      const memberCount = Array.isArray(guild.memberIds) ? guild.memberIds.length : 0;
      const channelCount = Array.isArray(guild.channels) ? guild.channels.length : 0;
      ui.guildTagInfoMeta.textContent = `${memberCount} member${memberCount === 1 ? "" : "s"} · ${channelCount} channel${channelCount === 1 ? "" : "s"}`;
    } else {
      ui.guildTagInfoMeta.textContent = "Tag is not linked to a visible guild yet.";
    }
  }
  if (ui.guildTagInfoDescription) {
    ui.guildTagInfoDescription.textContent = guild?.description?.trim() || "No guild description.";
  }
  if (ui.guildTagInfoOwner) {
    ui.guildTagInfoOwner.textContent = owner
      ? `Owner: ${displayNameForAccount(owner, guild?.id || null)}`
      : "Owner: unknown";
  }
  if (ui.guildTagInfoAccent) {
    ui.guildTagInfoAccent.style.background = guild?.accentColor || "#5865f2";
    ui.guildTagInfoAccent.title = guild?.accentColor || "Default accent";
  }
  if (!ui.guildTagInfoDialog.open) ui.guildTagInfoDialog.showModal();
}

function channelTypePrefix(channel) {
  if (!channel || channel.type === "text") return "#";
  if (channel.type === "announcement") return "📣";
  if (channel.type === "forum") return "🗂";
  if (channel.type === "media") return "🖼";
  if (channel.type === "voice") return "🔊";
  if (channel.type === "stage") return "🎙";
  return "#";
}

function channelTypeSymbol(channel) {
  if (!channel || channel.type === "text") return "#";
  if (channel.type === "announcement") return "📣";
  if (channel.type === "forum") return "🧵";
  if (channel.type === "media") return "🖼";
  if (channel.type === "voice") return "🔊";
  if (channel.type === "stage") return "🎙";
  return "#";
}

function channelHeaderGlyph(channel, mode = "channel") {
  if (mode === "dm") return "@";
  if (!channel || channel.type === "text") return "#";
  if (channel.type === "announcement") return "!";
  if (channel.type === "forum") return "≡";
  if (channel.type === "media") return "▦";
  if (channel.type === "voice") return "◉";
  if (channel.type === "stage") return "◎";
  return "#";
}

function setActiveChannelDescription(text) {
  const nextText = (text || "").toString().trim();
  if (!ui.activeChannelDescription) return;
  ui.activeChannelDescription.textContent = nextText;
  ui.activeChannelDescription.title = nextText;
  ui.activeChannelDescription.classList.toggle("chat-channel-description--empty", !nextText);
}

function setActiveChannelHeader(label, glyph = "#", title = "", description = "") {
  if (ui.activeChannelLabel) ui.activeChannelLabel.textContent = label || "";
  if (ui.activeChannelGlyph) ui.activeChannelGlyph.textContent = glyph || "#";
  if (ui.activeChannelName) {
    ui.activeChannelName.title = title || label || "";
  }
  setActiveChannelDescription(description);
}

function setActiveChannelTopic(text) {
  const nextText = (text || "").toString().trim();
  if (ui.activeChannelTopic) {
    ui.activeChannelTopic.textContent = nextText;
    ui.activeChannelTopic.classList.toggle("chat-topic--empty", !nextText);
  }
}

function activeConversationReferenceText() {
  const conversation = getActiveConversation();
  if (!conversation) return "";
  if (conversation.type === "dm") {
    const current = getCurrentAccount();
    const peerId = conversation.thread?.participantIds?.find((id) => id !== current?.id);
    const peer = peerId ? getAccountById(peerId) : null;
    return peer ? dmSecondaryLabelForAccount(peer) : "@dm";
  }
  const channel = conversation.channel;
  if (!channel) return "";
  const roomJid = (channel.xmppRoomJid || "").toString().trim();
  if (roomJid) return typeof xmppBareJid === "function" ? xmppBareJid(roomJid) : roomJid;
  const relayRoom = (channel.relayRoomToken || "").toString().trim();
  if (/^xmpp:/i.test(relayRoom)) return relayRoom.replace(/^xmpp:/i, "");
  return `#${channel.name}`;
}

function resizeComposerInput() {
  if (!(ui.messageInput instanceof HTMLTextAreaElement)) return;
  ui.messageInput.style.height = "0px";
  const next = Math.max(40, Math.min(160, ui.messageInput.scrollHeight));
  ui.messageInput.style.height = `${next}px`;
}

function isLikelyUrl(value) {
  return /^https?:\/\//i.test((value || "").trim());
}

function isLikelyRichTextLink(value) {
  const token = (value || "").toString().trim();
  return (
    /^https?:\/\//i.test(token)
    || /^mailto:[^\s]+$/i.test(token)
    || /^xmpp:[^\s]+$/i.test(token)
    || /^s67cmd:[^\s]+$/i.test(token)
    || /^(?:www\.)?[a-z0-9][a-z0-9-]*(?:\.[a-z0-9-]+)+(?:\/[^\s]*)?$/i.test(token)
  );
}

function sanitizeRichTextHref(value) {
  return sanitizeRichTextHrefViaModule(value);
}

function isInlineCommandHref(value) {
  return isInlineCommandHrefViaModule(value);
}

function normalizeSlashCommandInvocation(rawValue) {
  return normalizeSlashCommandInvocationViaModule(rawValue);
}

function invokeInlineCommand(rawValue, { submit = false } = {}) {
  const commandText = normalizeSlashCommandInvocation(rawValue);
  if (!commandText) return false;
  const account = getCurrentAccount();
  const conversation = getActiveConversation();
  if (!account || !conversation || !(ui.messageInput instanceof HTMLTextAreaElement)) {
    showToast("Open a conversation first.", { tone: "error" });
    return false;
  }
  const nextComposerText = submit || /\s/.test(commandText.slice(1))
    ? commandText
    : `${commandText} `;
  ui.messageInput.value = trimTextForConversation(nextComposerText, conversation);
  const caret = ui.messageInput.value.length;
  ui.messageInput.setSelectionRange(caret, caret);
  resizeComposerInput();
  setComposerDraft(conversation.id, ui.messageInput.value);
  queueComposerDraftSave();
  renderSlashSuggestions();
  renderComposerMeta();
  ui.messageInput.focus();
  if (submit) {
    ui.messageForm.requestSubmit();
  }
  return true;
}

function isLikelyImageDataUrl(value) {
  return isLikelyImageDataUrlViaModule(value);
}

function isRenderableAvatarUrl(value) {
  return isRenderableAvatarUrlViaModule(value);
}

function normalizeRenderableAvatarUrl(value) {
  return normalizeRenderableAvatarUrlViaModule(value);
}

function extractUrlFromBackgroundImageValue(value) {
  return extractUrlFromBackgroundImageValueViaModule(value);
}

function avatarUrlHintFromElement(element) {
  if (!(element instanceof HTMLElement)) return "";
  const mediaNode = element.querySelector(".avatar-media");
  if (mediaNode instanceof HTMLImageElement) {
    const src = (mediaNode.currentSrc || mediaNode.src || "").toString().trim();
    if (src) return src;
  }
  const inlineValue = extractUrlFromBackgroundImageValue(element.style.backgroundImage || "");
  if (inlineValue) return inlineValue;
  try {
    const computedValue = getComputedStyle(element).backgroundImage || "";
    return extractUrlFromBackgroundImageValue(computedValue);
  } catch {
    return "";
  }
}

function applyBannerStyle(element, bannerValue) {
  const value = (bannerValue || "").trim();
  if (!value) {
    element.style.background = "linear-gradient(120deg, #5160f7, #2b45d4)";
    element.style.backgroundImage = "";
    return;
  }
  if (isLikelyUrl(value)) {
    element.style.background = "#2f3136";
    element.style.backgroundImage = `url(${value})`;
    element.style.backgroundSize = "cover";
    element.style.backgroundPosition = "center";
    return;
  }
  element.style.backgroundImage = "";
  element.style.background = value;
}

function applyAvatarStyle(element, account, guildId = null) {
  if (!(element instanceof HTMLElement)) return;
  const avatar = resolveAccountAvatar(account, guildId);
  element.textContent = "";
  const staleMedia = element.querySelector(".avatar-media");
  if (staleMedia instanceof HTMLElement) staleMedia.remove();
  delete element.dataset.initial;
  element.removeAttribute("aria-label");
  element.style.backgroundImage = "";
  const resolvedColor = avatar.color || "#57f287";
  element.style.backgroundColor = isDefaultAvatarColor(resolvedColor)
    ? fallbackAvatarColorForAccount(account, guildId, resolvedColor)
    : resolvedColor;
  if (isRenderableAvatarUrl(avatar.url || "")) {
    const media = document.createElement("img");
    media.className = "avatar-media";
    media.src = avatar.url;
    media.alt = "";
    media.loading = "lazy";
    media.decoding = "async";
    media.referrerPolicy = "no-referrer";
    media.addEventListener("error", () => {
      media.remove();
      applyAvatarInitialGlyph(element, displayNameForAccount(account, guildId) || account?.username || "?");
    }, { once: true });
    element.appendChild(media);
    return;
  }
  applyAvatarInitialGlyph(element, displayNameForAccount(account, guildId) || account?.username || "?");
}

function applyAvatarDecoration(element, account) {
  if (!(element instanceof HTMLElement)) return;
  element.classList.toggle("has-decoration", false);
  const existing = element.querySelector(".avatar-decoration");
  if (existing) existing.remove();
  const emoji = accountDecorationEmoji(account);
  if (!emoji) return;
  const badge = document.createElement("span");
  badge.className = "avatar-decoration";
  badge.textContent = emoji;
  badge.title = "Avatar decoration";
  element.appendChild(badge);
  element.classList.toggle("has-decoration", true);
}

function applyNameplateStyle(element, account) {
  if (!(element instanceof HTMLElement)) return;
  const image = accountNameplateSvg(account);
  if (!image) {
    element.style.removeProperty("--nameplate-image");
    element.classList.remove("has-nameplate");
    return;
  }
  element.style.setProperty("--nameplate-image", `url(${image})`);
  element.classList.add("has-nameplate");
}

function renderProfileAvatarPreview() {
  if (!ui.profileAvatarPreview) return;
  ui.profileAvatarPreview.style.backgroundImage = "";
  ui.profileAvatarPreview.style.backgroundColor = ui.profileAvatarInput.value.trim() || "#57f287";
  const avatarUrl = ui.profileAvatarUrlInput.value.trim();
  if (isRenderableAvatarUrl(avatarUrl)) {
    ui.profileAvatarPreview.style.backgroundImage = `url(${avatarUrl})`;
    ui.profileAvatarPreview.style.backgroundSize = "cover";
    ui.profileAvatarPreview.style.backgroundPosition = "center";
  }
}

function renderProfileIdentityPreview() {
  if (!ui.profileIdentityPreview) return;
  const previewAccount = {
    username: "preview",
    displayName: ui.displayNameInput?.value?.trim() || "Preview User",
    avatarColor: ui.profileAvatarInput?.value?.trim() || "#57f287",
    avatarUrl: ui.profileAvatarUrlInput?.value?.trim() || "",
    banner: ui.profileBannerInput?.value?.trim() || "",
    customStatus: ui.profileStatusInput?.value?.trim() || "",
    customStatusEmoji: ui.profileStatusEmojiInput?.value?.trim() || "",
    presence: ui.presenceInput?.value || "online",
    avatarDecoration: ui.profileAvatarDecorationInput?.value?.trim() || "",
    guildTag: ui.profileGuildTagInput?.value?.trim().slice(0, 8).toUpperCase() || "",
    profileEffect: normalizeProfileEffect(ui.profileEffectInput?.value),
    profileNameplateSvg: ui.profileNameplateSvgInput?.value?.trim() || ""
  };
  applyAvatarStyle(ui.profileIdentityPreviewAvatar, previewAccount, null);
  applyAvatarDecoration(ui.profileIdentityPreviewAvatar, previewAccount);
  applyBannerStyle(ui.profileIdentityPreviewBanner, previewAccount.banner);
  ui.profileIdentityPreviewName.textContent = previewAccount.displayName;
  applyNameplateStyle(ui.profileIdentityPreviewName, previewAccount);
  const tag = accountGuildTag(previewAccount);
  if (tag) {
    ui.profileIdentityPreviewName.appendChild(document.createTextNode(" "));
    const chip = document.createElement("span");
    chip.className = "guild-tag-chip";
    chip.textContent = tag;
    ui.profileIdentityPreviewName.appendChild(chip);
  }
  ui.profileIdentityPreviewStatus.textContent = displayStatus(previewAccount, null);
  ui.profileIdentityPreview.classList.remove("profile-effect-aurora", "profile-effect-flame", "profile-effect-ocean");
  const effect = accountProfileEffect(previewAccount);
  if (effect !== "none") ui.profileIdentityPreview.classList.add(`profile-effect-${effect}`);
}

function setProfileAvatarUploadHint(text, isError = false) {
  if (!ui.profileAvatarUploadHint) return;
  ui.profileAvatarUploadHint.textContent = text;
  ui.profileAvatarUploadHint.style.color = isError ? "#f28b82" : "#aeb4bf";
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("file_read_failed"));
    reader.readAsDataURL(file);
  });
}

function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "";
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${bytes} B`;
}

function inferAttachmentTypeFromFile(file) {
  if (!file) return null;
  const name = (file.name || "").toLowerCase();
  const mime = (file.type || "").toLowerCase();
  if (name.endsWith(".pdf") || mime === "application/pdf") return "pdf";
  if (name.endsWith(".rtf") || mime === "application/rtf" || mime === "text/rtf") return "rtf";
  if (name.endsWith(".odt") || name.endsWith(".ods") || name.endsWith(".odp")
    || mime.includes("vnd.oasis.opendocument")) return "odf";
  if (/\.(doc|docx|xls|xlsx|ppt|pptx)$/i.test(name) || mime.includes("officedocument") || mime === "application/msword") return "odf";
  if (/\.(mp3|ogg|wav|m4a|flac)$/i.test(name) || /^audio\//i.test(mime)) return "audio";
  if (/\.(mp4|webm|mov|m4v|ogv|m3u8|mkv|avi|wmv|mpe?g|m2ts|ts)$/i.test(name) || /^video\//i.test(mime)) return "video";
  if (/\.(txt|md|log|json|js|ts|css|xml|yml|yaml|ini|toml)$/i.test(name) || /^text\//i.test(mime)) return "text";
  if (name.endsWith(".swf")) return "swf";
  if (name.endsWith(".svg") || mime === "image/svg+xml") return "svg";
  if (name.endsWith(".html") || name.endsWith(".htm") || mime === "text/html") return "html";
  if (name.endsWith(".bin")) return "bin";
  if (name.endsWith(".gif") || name.endsWith(".webp") || /^image\//i.test(mime)) return "gif";
  return "gif";
}

function inferAttachmentTypeFromNameAndMime(name = "", mime = "") {
  const normalizedName = (name || "").toString().trim().toLowerCase();
  const normalizedMime = (mime || "").toString().trim().toLowerCase();
  if (normalizedName || normalizedMime) {
    return inferAttachmentTypeFromFile({
      name: normalizedName,
      type: normalizedMime
    });
  }
  return "gif";
}

function getComposerAttachAllowedTypes() {
  return new Set(["pdf", "text", "odf", "rtf", "bin", "gif", "video", "audio", "swf", "svg", "html"]);
}

function syncPrimaryComposerAttachment() {
  composerPendingAttachment = composerPendingAttachments[0] || null;
}

function composerAttachmentPreviewLabel(entry) {
  if (!entry) return "file";
  const label = entry.name || "file";
  const type = (entry.type || "file").toUpperCase();
  const size = formatFileSize(Number(entry.sizeBytes || 0));
  return size ? `${type}: ${label} (${size})` : `${type}: ${label}`;
}

function renderComposerAttachmentList() {
  if (!ui.composerAttachmentList) return;
  ui.composerAttachmentList.innerHTML = "";
  composerPendingAttachments.forEach((entry, index) => {
    const row = document.createElement("button");
    row.type = "button";
    row.className = "composer-attachment-chip";
    row.title = composerAttachmentPreviewLabel(entry);
    const thumb = document.createElement("span");
    thumb.className = "composer-attachment-chip__thumb";
    const visualType = (entry?.type || "").toString().toLowerCase();
    const visualUrl = resolveMediaUrl((entry?.url || "").toString());
    const canPreviewImage = ["gif", "svg", "sticker"].includes(visualType);
    const canPreviewVideo = visualType === "video";
    if (canPreviewVideo && visualUrl) {
      const video = document.createElement("video");
      video.src = visualUrl;
      video.muted = true;
      video.playsInline = true;
      video.preload = "metadata";
      video.loop = true;
      video.setAttribute("aria-hidden", "true");
      video.addEventListener("loadeddata", () => {
        void video.play().catch(() => {});
      }, { once: true });
      thumb.appendChild(video);
    } else if (canPreviewImage && visualUrl) {
      const img = document.createElement("img");
      img.src = visualUrl;
      img.alt = "";
      img.loading = "eager";
      img.setAttribute("aria-hidden", "true");
      thumb.appendChild(img);
    } else {
      const icon = document.createElement("span");
      icon.className = "composer-attachment-chip__icon";
      const iconByType = {
        audio: "♪",
        swf: "📼",
        pdf: "📄",
        text: "TXT",
        html: "</>",
        odf: "DOC",
        rtf: "RTF",
        bin: "BIN"
      };
      icon.textContent = iconByType[visualType] || "FILE";
      thumb.appendChild(icon);
    }
    const label = document.createElement("span");
    label.textContent = entry.name || "file";
    const remove = document.createElement("span");
    remove.className = "composer-attachment-chip__remove";
    remove.textContent = "✕";
    row.appendChild(thumb);
    row.appendChild(label);
    row.appendChild(remove);
    row.addEventListener("click", () => {
      if (!visualUrl) return;
      if (canPreviewVideo) {
        openMediaLightbox({ url: visualUrl, label: entry.name || "Video", video: true });
        return;
      }
      if (canPreviewImage) {
        openMediaLightbox({ url: visualUrl, label: entry.name || "Attachment" });
        return;
      }
      openExternalUrlInClient(visualUrl);
    });
    remove.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      composerPendingAttachments.splice(index, 1);
      syncPrimaryComposerAttachment();
      if (composerPendingAttachments.length === 0) {
        clearComposerPendingAttachment();
        return;
      }
      setComposerPendingAttachment(null);
      renderComposerMeta();
    });
    ui.composerAttachmentList.appendChild(row);
  });
}

function clearComposerPendingAttachment() {
  composerPendingAttachments = [];
  composerPendingAttachment = null;
  if (ui.composerAttachmentBar) ui.composerAttachmentBar.classList.add("composer-reply--hidden");
  if (ui.composerAttachmentText) ui.composerAttachmentText.textContent = "";
  if (ui.composerAttachmentList) ui.composerAttachmentList.innerHTML = "";
  if (ui.saveComposerAttachmentBtn) ui.saveComposerAttachmentBtn.hidden = true;
  if (ui.quickAttachInput) ui.quickAttachInput.value = "";
  renderComposerMeta();
}

function setComposerPendingAttachment(entry, { append = true } = {}) {
  if (entry) {
    if (!append) composerPendingAttachments = [];
    composerPendingAttachments.push(entry);
    composerPendingAttachments = composerPendingAttachments.slice(-6);
  }
  syncPrimaryComposerAttachment();
  if (!composerPendingAttachment) {
    clearComposerPendingAttachment();
    return;
  }
  if (ui.composerAttachmentText) {
    ui.composerAttachmentText.textContent = composerPendingAttachments.length > 1
      ? `Attached ${composerPendingAttachments.length} files`
      : `Attached ${composerAttachmentPreviewLabel(composerPendingAttachment)}`;
  }
  renderComposerAttachmentList();
  if (ui.composerAttachmentBar) ui.composerAttachmentBar.classList.remove("composer-reply--hidden");
  if (ui.saveComposerAttachmentBtn) ui.saveComposerAttachmentBtn.hidden = false;
  renderComposerMeta();
}

async function attachFileToComposer(file) {
  if (!file) return false;
  const type = inferAttachmentTypeFromFile(file);
  const allowed = getComposerAttachAllowedTypes();
  if (!allowed.has(type)) return false;
  const url = await readFileAsDataUrl(file);
  const fallbackMime = xmppAttachmentDefaultMimeType(type, "image", file.name || "");
  const mime = (file.type || fallbackMime || "").toString().trim().toLowerCase();
  setComposerPendingAttachment({
    type,
    url,
    name: file.name || `${type}-${Date.now()}`,
    sizeBytes: Number(file.size) || 0,
    mime
  }, { append: true });
  return true;
}

async function attachDataUrlAttachmentToComposer({
  dataUrl = "",
  name = "",
  mime = "",
  sizeBytes = 0
} = {}) {
  const normalizedUrl = (dataUrl || "").toString().trim();
  if (!/^data:/i.test(normalizedUrl)) return false;
  const normalizedName = (name || "").toString().trim().slice(0, 160) || `file-${Date.now()}`;
  const normalizedMime = (mime || "").toString().trim().toLowerCase();
  const type = inferAttachmentTypeFromNameAndMime(normalizedName, normalizedMime);
  const allowed = getComposerAttachAllowedTypes();
  if (!allowed.has(type)) return false;
  const fallbackMime = xmppAttachmentDefaultMimeType(type, "image", normalizedName);
  setComposerPendingAttachment({
    type,
    url: normalizedUrl,
    name: normalizedName,
    sizeBytes: Number(sizeBytes) || 0,
    mime: normalizedMime || fallbackMime || ""
  }, { append: true });
  return true;
}

function pickerTabForAttachmentType(type) {
  if (type === "pdf") return "pdf";
  if (type === "text") return "text";
  if (type === "rtf" || type === "odf" || type === "bin") return "docs";
  if (type === "html") return "html";
  if (type === "swf") return "swf";
  if (type === "svg") return "svg";
  return "gif";
}

function saveComposerAttachmentToPicker() {
  if (!composerPendingAttachment) return false;
  const guild = getActiveGuild();
  if (!guild) return false;
  let savedAny = false;
  composerPendingAttachments.forEach((pending, index) => {
    const type = pending.type || "pdf";
    const tab = pickerTabForAttachmentType(type);
    const baseName = (pending.name || `${type}-${Date.now()}-${index}`).toString().trim().slice(0, 64);
    const extension = type === "pdf"
      ? ".pdf"
      : type === "text"
        ? ".txt"
        : type === "rtf"
          ? ".rtf"
          : type === "odf"
            ? ".odt"
            : type === "bin"
              ? ".bin"
              : "";
    const resolvedName = baseName.includes(".") || !extension ? baseName : `${baseName}${extension}`;
    const entry = {
      name: sanitizeMediaName(resolvedName, `${tab}-${Date.now().toString().slice(-4)}`),
      url: pending.url,
      format: "image",
      type
    };
    if (upsertGuildResource(tab, entry)) savedAny = true;
  });
  if (!savedAny) return false;
  saveState();
  return true;
}

async function applyProfileAvatarFile(file) {
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    setProfileAvatarUploadHint("Invalid file type. Please choose an image.", true);
    return;
  }
  if (file.size > PROFILE_AVATAR_MAX_BYTES) {
    setProfileAvatarUploadHint("Image is too large. Max size is 2 MB.", true);
    return;
  }
  try {
    const dataUrl = await readFileAsDataUrl(file);
    if (!isLikelyImageDataUrl(dataUrl)) {
      setProfileAvatarUploadHint("Unsupported image format.", true);
      return;
    }
    ui.profileAvatarUrlInput.value = dataUrl;
    renderProfileAvatarPreview();
    setProfileAvatarUploadHint(`Loaded ${file.name} (${Math.ceil(file.size / 1024)} KB).`);
  } catch {
    setProfileAvatarUploadHint("Failed to load image file.", true);
  }
}

function normalizeReactions(reactions) {
  if (!Array.isArray(reactions)) return [];
  const byEmoji = new Map();
  reactions.forEach((item) => {
    const emoji = (item?.emoji || "").toString();
    if (!emoji) return;
    if (!byEmoji.has(emoji)) {
      byEmoji.set(emoji, { emoji, userIds: [] });
    }
    const row = byEmoji.get(emoji);
    const seen = new Set(row.userIds);
    const sourceIds = Array.isArray(item?.userIds) ? item.userIds : [];
    sourceIds.forEach((rawId) => {
      const actorId = (rawId || "").toString().trim();
      if (!actorId || seen.has(actorId)) return;
      seen.add(actorId);
      row.userIds.push(actorId);
    });
  });
  return [...byEmoji.values()].filter((entry) => entry.userIds.length > 0);
}

function canonicalReactionActorIdForConversation(actorUserId, conversation = null) {
  const actorId = (actorUserId || "").toString().trim();
  if (!actorId) return "";
  const account = typeof getAccountByXmppJid === "function" ? getAccountByXmppJid(actorId) : null;
  if (account?.id) return account.id;
  if (!conversation || conversation.type !== "channel" || !conversation.channel) return actorId;
  const roomJid = xmppBareJid(conversation.channel.xmppRoomJid || "");
  if (!roomJid) return actorId;
  return canonicalXmppRoomReactionActorId(roomJid, actorId) || actorId;
}

function normalizeReactionsForConversation(reactions, conversation = null) {
  const normalized = normalizeReactions(reactions);
  if (!conversation) return normalized;
  const rows = normalized.map((entry) => ({
    emoji: entry.emoji,
    userIds: []
  }));
  normalized.forEach((entry, index) => {
    const row = rows[index];
    const seen = new Set();
    entry.userIds.forEach((actorId) => {
      const canonical = canonicalReactionActorIdForConversation(actorId, conversation);
      if (!canonical || seen.has(canonical)) return;
      seen.add(canonical);
      row.userIds.push(canonical);
    });
  });
  return normalizeReactions(rows);
}

function reactionDisplayNameForActorId(actorUserId, { conversation = null, guildId = null } = {}) {
  const actorId = canonicalReactionActorIdForConversation(actorUserId, conversation) || (actorUserId || "").toString().trim();
  if (!actorId) return "Unknown";
  const account = getAccountById(actorId);
  if (account) return displayNameForAccount(account, guildId);
  const alias = parseXmppRoomAliasActorId(actorId);
  if (alias?.occupantId) {
    const occupant = xmppMucOccupantById(alias.roomJid, alias.occupantId);
    if (occupant?.accountId) {
      const linked = getAccountById(occupant.accountId);
      if (linked) return displayNameForAccount(linked, guildId);
    }
    if (occupant?.nick) return occupant.nick;
    return `occupant ${alias.occupantId.slice(0, 8)}`;
  }
  if (alias?.nick) return alias.nick;
  return actorId;
}

function normalizeMessageReactionsForConversation(message, conversation = null) {
  if (!message || typeof message !== "object") return false;
  const before = xmppReactionSignature(message.reactions);
  const next = normalizeReactionsForConversation(message.reactions, conversation);
  const after = xmppReactionSignature(next);
  if (before === after) return false;
  message.reactions = next;
  return true;
}

function normalizeAttachments(attachments) {
  if (!Array.isArray(attachments)) return [];
  const allowedTypes = new Set(["gif", "video", "sticker", "svg", "swf", "html", "pdf", "audio", "text", "odf", "rtf", "bin", "file"]);
  const allowedFormats = new Set(["image", "dotlottie", "apng"]);
  const normalizeMime = (value = "") => {
    const token = (value || "").toString().trim().toLowerCase();
    return /^[a-z0-9.+-]+\/[a-z0-9.+-]+$/.test(token) ? token.slice(0, 120) : "";
  };
  const seen = new Set();
  return attachments
    .filter((item) => item && typeof item.type === "string" && typeof item.url === "string")
    .map((item) => ({
      type: allowedTypes.has(item.type) ? item.type : "gif",
      url: canonicalizeAttachmentUrlForStorage(item.url, { kind: item.type }),
      name: (item.name || "").toString().slice(0, 120),
      format: allowedFormats.has(item.format) ? item.format : "image",
      mime: normalizeMime(item.mime || "")
    }))
    .filter((item) => {
      const key = `${item.type}|${item.url}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 6);
}

function normalizePoll(poll) {
  if (!poll || typeof poll !== "object") return null;
  const question = (poll.question || "").toString().trim().slice(0, 220);
  if (!question) return null;
  const options = Array.isArray(poll.options)
    ? poll.options
        .map((option) => ({
          id: (option?.id || createId()).toString().slice(0, 64),
          label: (option?.label || "").toString().trim().slice(0, 120),
          voterIds: Array.isArray(option?.voterIds) ? option.voterIds.filter(Boolean) : []
        }))
        .filter((option) => option.label)
    : [];
  if (options.length < 2) return null;
  return {
    question,
    options: options.slice(0, 12),
    allowsMulti: Boolean(poll.allowsMulti),
    closed: Boolean(poll.closed),
    createdBy: (poll.createdBy || "").toString().slice(0, 64)
  };
}

function normalizeForumTags(value) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  return value
    .map((tag) => {
      const name = sanitizeForumTagName(tag?.name || "");
      if (!name || seen.has(name)) return null;
      seen.add(name);
      const color = /^#[0-9a-f]{3,8}$/i.test((tag?.color || "").toString()) ? tag.color : "#5865f2";
      return {
        id: (tag?.id || createId()).toString().slice(0, 64),
        name,
        color
      };
    })
    .filter(Boolean)
    .slice(0, 24);
}

function normalizeThreadTagIds(value, forumTags) {
  if (!Array.isArray(value) || !Array.isArray(forumTags) || forumTags.length === 0) return [];
  const valid = new Set(forumTags.map((tag) => tag.id));
  return [...new Set(value.map((entry) => (entry || "").toString()).filter((id) => valid.has(id)))].slice(0, 8);
}

function normalizeScheduledMessages(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      const conversationType = entry?.conversationType === "dm" ? "dm" : "channel";
      const conversationId = (entry?.conversationId || "").toString();
      const authorId = (entry?.authorId || "").toString();
      const text = clampMessageTextForStorage(entry?.text || "");
      const sendAt = typeof entry?.sendAt === "string" ? entry.sendAt : "";
      if (!conversationId || !authorId || !text.trim()) return null;
      if (!toTimestampMs(sendAt)) return null;
      return {
        id: (entry?.id || createId()).toString().slice(0, 64),
        conversationType,
        conversationId,
        guildId: (entry?.guildId || "").toString().slice(0, 64),
        authorId,
        text,
        createdAt: typeof entry?.createdAt === "string" ? entry.createdAt : new Date().toISOString(),
        sendAt,
        replyTo: entry?.replyTo && typeof entry.replyTo === "object"
          ? {
              messageId: (entry.replyTo.messageId || "").toString().slice(0, 64),
              authorName: (entry.replyTo.authorName || "").toString().slice(0, 60),
              text: (entry.replyTo.text || "").toString().slice(0, 180),
              threadId: (entry.replyTo.threadId || "").toString().slice(0, 64)
            }
          : null
      };
    })
    .filter(Boolean)
    .slice(0, 300);
}

function normalizeSavedSwfs(list) {
  if (!Array.isArray(list)) return [];
  return list
    .filter((entry) => entry && typeof entry.url === "string")
    .map((entry) => ({
      name: (entry.name || "swf").toString().slice(0, 120),
      url: canonicalizeAttachmentUrlForStorage(entry.url, { kind: "swf" })
    }))
    .slice(0, 24);
}

function sanitizeMediaName(value, fallback = "resource") {
  const cleaned = (value || "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 32);
  return cleaned || fallback;
}

function ensureGuildMediaCollections(guild) {
  if (!guild) return;
  if (!Array.isArray(guild.customEmojis)) guild.customEmojis = [];
  if (!Array.isArray(guild.customStickers)) guild.customStickers = [];
  if (!Array.isArray(guild.customGifs)) guild.customGifs = [];
  if (!Array.isArray(guild.customSvgs)) guild.customSvgs = [];
  if (!Array.isArray(guild.customPdfs)) guild.customPdfs = [];
  if (!Array.isArray(guild.customTexts)) guild.customTexts = [];
  if (!Array.isArray(guild.customDocs)) guild.customDocs = [];
  if (!Array.isArray(guild.customSwfs)) guild.customSwfs = [];
  if (!Array.isArray(guild.customHtmls)) guild.customHtmls = [];
}

function getGuildResourceBucket(guild, tab) {
  ensureGuildMediaCollections(guild);
  if (tab === "emoji") return guild.customEmojis;
  if (tab === "sticker") return guild.customStickers;
  if (tab === "gif") return guild.customGifs;
  if (tab === "svg") return guild.customSvgs;
  if (tab === "pdf") return guild.customPdfs;
  if (tab === "text") return guild.customTexts;
  if (tab === "docs") return guild.customDocs;
  if (tab === "swf") return guild.customSwfs;
  if (tab === "html") return guild.customHtmls;
  return [];
}

function upsertGuildResource(tab, entry) {
  const guild = getActiveGuild();
  if (!guild || !entry?.url) return false;
  const bucket = getGuildResourceBucket(guild, tab);
  const name = sanitizeMediaName(entry.name || `${tab}-${bucket.length + 1}`);
  const normalized = {
    id: entry.id || createId(),
    name,
    url: entry.url,
    format: entry.format || "image",
    type: (entry.type || "").toString()
  };
  const existingIndex = bucket.findIndex((item) => item.name === normalized.name);
  if (existingIndex >= 0) {
    bucket[existingIndex] = { ...bucket[existingIndex], ...normalized };
  } else {
    bucket.unshift(normalized);
  }
  return true;
}

function loadScriptTag(src, type = "text/javascript") {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-src="${src}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), { once: true });
      if (existing.dataset.loaded === "1") resolve();
      return;
    }
    const script = document.createElement("script");
    script.async = true;
    script.dataset.src = src;
    if (type === "module") script.type = "module";
    script.src = src;
    script.addEventListener("load", () => {
      script.dataset.loaded = "1";
      resolve();
    }, { once: true });
    script.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), { once: true });
    document.head.appendChild(script);
  });
}

async function localRuntimeExists(src) {
  const isScriptLikeContentType = (contentType = "") => {
    const value = (contentType || "").toLowerCase();
    if (!value) return true;
    if (value.includes("javascript")) return true;
    if (value.includes("ecmascript")) return true;
    if (value.includes("application/octet-stream")) return true;
    // Guard against dev servers returning index.html for missing files.
    if (value.includes("text/html")) return false;
    return true;
  };
  try {
    const headResponse = await fetch(src, { method: "HEAD", cache: "no-store" });
    if (headResponse.ok) {
      return isScriptLikeContentType(headResponse.headers.get("content-type") || "");
    }
    if (![403, 405, 501].includes(Number(headResponse.status) || 0)) return false;
  } catch {
    // Fall through to GET probe when HEAD is blocked or unsupported.
  }
  try {
    const getResponse = await fetch(src, {
      method: "GET",
      cache: "no-store",
      headers: { Range: "bytes=0-0" }
    });
    if (!getResponse.ok) return false;
    return isScriptLikeContentType(getResponse.headers.get("content-type") || "");
  } catch {
    return false;
  }
}

async function deployMediaRuntimes() {
  let shouldRerender = false;
  const localRuffleCandidates = [
    "vendor/ruffle/ruffle.js"
  ];
  for (const candidate of localRuffleCandidates) {
    if (window.RufflePlayer?.newest) break;
    try {
      // eslint-disable-next-line no-await-in-loop
      const exists = await localRuntimeExists(candidate);
      if (!exists) continue;
      // eslint-disable-next-line no-await-in-loop
      await loadScriptTag(candidate);
      if (window.RufflePlayer?.newest) {
        delete window.__S67_RUFFLE_STUB;
        shouldRerender = true;
        addDebugLog("info", "Loaded local Ruffle runtime", { src: candidate });
        break;
      }
      if (window.__S67_RUFFLE_STUB) {
        addDebugLog("warn", "Local Ruffle runtime stub loaded; real runtime still missing", { src: candidate });
      } else {
        addDebugLog("warn", "Local Ruffle runtime missing after load", { src: candidate });
      }
    } catch (error) {
      addDebugLog("warn", "Local Ruffle runtime candidate failed", { src: candidate, error: String(error) });
    }
  }
  if (!window.RufflePlayer?.newest) {
    const remoteRuffleCandidates = [
      "https://unpkg.com/@ruffle-rs/ruffle",
      "https://cdn.jsdelivr.net/npm/@ruffle-rs/ruffle"
    ];
    for (const candidate of remoteRuffleCandidates) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await loadScriptTag(candidate);
        shouldRerender = true;
        addDebugLog("info", "Loaded CDN Ruffle runtime", { src: candidate });
        break;
      } catch (error) {
        addDebugLog("warn", "CDN Ruffle runtime candidate failed", { src: candidate, error: String(error) });
      }
    }
  }
  if (!window.RufflePlayer?.newest) {
    addDebugLog("warn", "Failed to load Ruffle runtime (local + CDN fallbacks)");
    // SWF fallback card remains available.
  }
  const localDotLottieCandidates = [
    "vendor/dotlottie/dotlottie-player.mjs"
  ];
  for (const candidate of localDotLottieCandidates) {
    if (typeof customElements !== "undefined" && customElements.get("dotlottie-player")) break;
    try {
      // eslint-disable-next-line no-await-in-loop
      const exists = await localRuntimeExists(candidate);
      if (!exists) continue;
      // eslint-disable-next-line no-await-in-loop
      await loadScriptTag(candidate, "module");
      if (typeof customElements !== "undefined" && customElements.get("dotlottie-player")) {
        delete window.__S67_DOTLOTTIE_STUB;
        shouldRerender = true;
        addDebugLog("info", "Loaded local dotLottie runtime", { src: candidate });
        break;
      }
      if (window.__S67_DOTLOTTIE_STUB) {
        addDebugLog("warn", "Local dotLottie runtime stub loaded; real runtime still missing", { src: candidate });
      } else {
        addDebugLog("warn", "Local dotLottie runtime missing after load", { src: candidate });
      }
    } catch (error) {
      addDebugLog("warn", "Local dotLottie runtime candidate failed", { src: candidate, error: String(error) });
    }
  }
  if (!(typeof customElements !== "undefined" && customElements.get("dotlottie-player"))) {
    const remoteDotLottieCandidates = [
      "https://unpkg.com/@dotlottie/player-component@2.7.12/dist/dotlottie-player.mjs",
      "https://cdn.jsdelivr.net/npm/@dotlottie/player-component@2.7.12/dist/dotlottie-player.mjs"
    ];
    for (const candidate of remoteDotLottieCandidates) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await loadScriptTag(candidate, "module");
        shouldRerender = true;
        addDebugLog("info", "Loaded CDN dotLottie runtime", { src: candidate });
        break;
      } catch (error) {
        addDebugLog("warn", "CDN dotLottie runtime candidate failed", { src: candidate, error: String(error) });
      }
    }
  }
  if (!(typeof customElements !== "undefined" && customElements.get("dotlottie-player"))) {
    addDebugLog("warn", "Failed to load dotLottie runtime (local + CDN fallbacks)");
    // dotLottie falls back to link/file preview behavior.
  }
  if (shouldRerender && state.currentAccountId) {
    renderMessages();
    if (mediaPickerOpen && mediaPickerTab === "swf") renderMediaPicker();
  }
}

function resolveMediaUrl(url) {
  const raw = (url || "").toString().trim();
  if (!raw) return raw;
  if (/^(file|content):\/\//i.test(raw)) {
    try {
      const cap = globalThis.Capacitor || null;
      const convert = typeof cap?.convertFileSrc === "function" ? cap.convertFileSrc.bind(cap) : null;
      if (convert) return convert(raw);
    } catch {
      // Fall back to raw URL.
    }
    return raw;
  }
  try {
    return new URL(raw, window.location.href).href;
  } catch {
    return raw;
  }
}

function canonicalizeAttachmentUrlForStorage(url, { kind = "" } = {}) {
  const raw = (url || "").toString().trim();
  if (!raw) return "";
  if (/^(data:|blob:|aesgcm:)/i.test(raw)) return raw;
  const normalizedKind = (kind || "").toString().trim().toLowerCase();
  if (!/^[a-z][a-z0-9+.-]*:/i.test(raw)) {
    const cleaned = raw.replace(/^\.\//, "");
    if (cleaned.startsWith("/")) return cleaned;
    if (normalizedKind === "swf" && cleaned.startsWith("swf/")) return `/${cleaned}`;
    return raw;
  }
  try {
    const parsed = new URL(raw, window.location.href);
    if (!/^https?:$/i.test(parsed.protocol || "")) return raw;
    const current = new URL(window.location.href);
    const host = (parsed.hostname || "").toLowerCase();
    const currentHost = (current.hostname || "").toLowerCase();
    const localHost = host === "localhost" || host === "127.0.0.1";
    const sameHost = host === currentHost;
    const samePort = (parsed.port || "") === (current.port || "");
    if (!(localHost || (sameHost && samePort))) return parsed.href;
    return `${parsed.pathname || "/"}${parsed.search || ""}${parsed.hash || ""}`;
  } catch {
    return raw;
  }
}

function mediaProxyUrl(url) {
  const resolved = resolveMediaUrl(url);
  if (!resolved) return "";
  try {
    const parsed = new URL(resolved);
    if (!/^https?:$/i.test(parsed.protocol)) return "";
    if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") return resolved;
  } catch {
    return "";
  }
  return `${XMPP_LOCAL_AUTH_GATEWAY_URL}/media-proxy?url=${encodeURIComponent(resolved)}`;
}

function resolveMediaPlaybackUrl(url, { kind = "" } = {}) {
  const resolved = resolveMediaUrl(url);
  const normalizedKind = (kind || "").toString().toLowerCase();
  if (!resolved) return resolved;
  if (!["video", "swf"].includes(normalizedKind)) return resolved;
  if (!isExternalMediaUrl(resolved)) return resolved;
  if (normalizedKind === "video") {
    const host = mediaUrlHost(resolved);
    const accountDomain = xmppDomainFromJid(getPreferences().xmppJid || "");
    if (accountDomain && (host === accountDomain || host.endsWith(`.${accountDomain}`))) {
      return resolved;
    }
    if (isTrustedMediaUrl(resolved)) return resolved;
  }
  const proxied = mediaProxyUrl(resolved);
  return proxied || resolved;
}

function mediaUrlHost(url) {
  try {
    return new URL(url, window.location.href).hostname.toLowerCase();
  } catch {
    return "";
  }
}

function isIpLikeHost(host) {
  return /^[0-9.]+$/.test(host) || host.includes(":");
}

function registrableDomainForHost(host) {
  const normalized = (host || "").toString().trim().toLowerCase();
  if (!normalized || normalized === "localhost" || isIpLikeHost(normalized)) return normalized;
  const labels = normalized.split(".").filter(Boolean);
  if (labels.length <= 2) return normalized;
  const commonSecondLevel = new Set(["co.uk", "org.uk", "gov.uk", "ac.uk", "com.au", "net.au", "org.au", "co.jp", "com.br"]);
  const suffix2 = labels.slice(-2).join(".");
  if (commonSecondLevel.has(suffix2) && labels.length >= 3) {
    return labels.slice(-3).join(".");
  }
  return labels.slice(-2).join(".");
}

function suggestSubdomainTrustRule(host) {
  const cleaned = (host || "").toString().trim().toLowerCase();
  if (!cleaned) return "";
  const domain = registrableDomainForHost(cleaned);
  if (!domain || domain === cleaned) return cleaned;
  return `*.${domain}`;
}

function normalizeMediaPrivacyUrl(url) {
  return normalizeMediaPrivacyUrlViaModule(url);
}

function mediaPrivacyUrlKeys(url, { includePathVariant = false } = {}) {
  const keys = new Set();
  const normalized = normalizeMediaPrivacyUrl(url);
  if (normalized) keys.add(normalized);
  const resolved = resolveMediaUrl(url);
  if (resolved) keys.add(resolved);
  if (includePathVariant) {
    try {
      const parsed = new URL(normalized || resolved, window.location.href);
      parsed.search = "";
      parsed.hash = "";
      keys.add(parsed.href);
    } catch {
      // Skip invalid URLs.
    }
  }
  return [...keys].filter(Boolean);
}

function allowMediaUrlOnce(url) {
  mediaPrivacyUrlKeys(url, { includePathVariant: true }).forEach((key) => {
    mediaAllowOnceUrls.add(key);
  });
}

function mediaAllowOnceAttachmentKey(attachment, contextKey = "") {
  if (!attachment || typeof attachment !== "object") return "";
  const mediaUrl = (attachment?.url || "").toString().trim();
  if (!mediaUrl) return "";
  const normalized = mediaPrivacyUrlKeys(mediaUrl, { includePathVariant: true })[0] || normalizeMediaPrivacyUrl(mediaUrl);
  if (!normalized) return "";
  return [
    (contextKey || "").toString(),
    (attachment?.type || "").toString(),
    normalized
  ].join("|");
}

function allowMediaAttachmentOnce(attachment, contextKey = "") {
  const key = mediaAllowOnceAttachmentKey(attachment, contextKey);
  if (key) mediaAllowOnceAttachmentKeys.add(key);
  const mediaUrl = (attachment?.url || "").toString().trim();
  if (mediaUrl) allowMediaUrlOnce(mediaUrl);
}

function isMediaAttachmentAllowedOnce(attachment, contextKey = "") {
  const key = mediaAllowOnceAttachmentKey(attachment, contextKey);
  return Boolean(key && mediaAllowOnceAttachmentKeys.has(key));
}

function isExternalMediaUrl(url) {
  return isExternalMediaUrlViaModule(url);
}

function doesMediaRuleMatchHost(rule, host) {
  return doesMediaRuleMatchHostViaModule(rule, host);
}

function isBuiltInTrustedMediaHost(host = "") {
  return isBuiltInTrustedMediaHostViaModule(host);
}

function normalizeMediaRuleToken(rule) {
  return normalizeMediaRuleTokenViaModule(rule);
}

function isBlockedMediaUrl(url) {
  const normalized = normalizeMediaPrivacyUrl(url);
  const host = mediaUrlHost(normalized);
  if (!host) return false;
  const prefs = getPreferences();
  return prefs.mediaDenyRules.some((rule) => doesMediaRuleMatchHost(rule, host));
}

function isTrustedMediaUrl(url) {
  if (isBlockedMediaUrl(url)) return false;
  const candidates = mediaPrivacyUrlKeys(url, { includePathVariant: true });
  if (candidates.some((entry) => mediaAllowOnceUrls.has(entry))) return true;
  const normalized = candidates[0] || normalizeMediaPrivacyUrl(url);
  const host = mediaUrlHost(normalized);
  if (!host) return false;
  const prefs = getPreferences();
  const accountDomain = xmppDomainFromJid(prefs.xmppJid || "");
  if (accountDomain && (host === accountDomain || host.endsWith(`.${accountDomain}`))) {
    return true;
  }
  if (isBuiltInTrustedMediaHost(host)) return true;
  return prefs.mediaTrustRules.some((rule) => doesMediaRuleMatchHost(rule, host));
}

function shouldGateMediaUrl(url) {
  const normalized = normalizeMediaPrivacyUrl(url);
  if (!isExternalMediaUrl(normalized)) return false;
  if (isBlockedMediaUrl(normalized)) return true;
  const prefs = getPreferences();
  if (prefs.mediaPrivacyMode === "off") return false;
  return !isTrustedMediaUrl(normalized);
}

function addMediaTrustRule(rule) {
  const cleaned = normalizeMediaRuleToken(rule);
  if (!cleaned) return false;
  state.preferences = getPreferences();
  const current = normalizeMediaTrustRules(state.preferences.mediaTrustRules);
  if (current.includes(cleaned)) return false;
  state.preferences.mediaTrustRules = [cleaned, ...current].slice(0, 120);
  return true;
}

function removeMediaTrustRule(rule) {
  const cleaned = normalizeMediaRuleToken(rule);
  if (!cleaned) return false;
  state.preferences = getPreferences();
  const current = normalizeMediaTrustRules(state.preferences.mediaTrustRules);
  if (!current.includes(cleaned)) return false;
  state.preferences.mediaTrustRules = current.filter((entry) => entry !== cleaned);
  return true;
}

function addMediaDenyRule(rule) {
  const cleaned = normalizeMediaRuleToken(rule);
  if (!cleaned) return false;
  state.preferences = getPreferences();
  const current = normalizeMediaDenyRules(state.preferences.mediaDenyRules);
  if (current.includes(cleaned)) return false;
  state.preferences.mediaDenyRules = [cleaned, ...current].slice(0, 120);
  return true;
}

function removeMediaDenyRule(rule) {
  const cleaned = normalizeMediaRuleToken(rule);
  if (!cleaned) return false;
  state.preferences = getPreferences();
  const current = normalizeMediaDenyRules(state.preferences.mediaDenyRules);
  if (!current.includes(cleaned)) return false;
  state.preferences.mediaDenyRules = current.filter((entry) => entry !== cleaned);
  return true;
}

function addDebugLog(level, message, data = null) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    message,
    data
  };
  debugLogs.push(entry);
  if (debugLogs.length > 220) debugLogs.shift();
}
