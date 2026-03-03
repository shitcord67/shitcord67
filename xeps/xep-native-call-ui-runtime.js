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

function closeNativeCallPickerDialogByClass(className = "") {
  const selector = (className || "").toString().trim();
  if (!selector) return;
  document.querySelectorAll(`dialog.${selector}`).forEach((dialog) => {
    if (!(dialog instanceof HTMLDialogElement)) return;
    try {
      if (dialog.open) dialog.close();
    } catch {
      // Ignore close failures.
    }
    dialog.remove();
  });
}

function resolveNativeCallElectronBridge() {
  const runtime = resolveElectronRuntime({ refresh: true });
  const bridge = runtime?.bridge || null;
  if (!bridge || typeof bridge !== "object") return null;
  return bridge;
}

async function openNativeCallScreenSharePicker(sessionId = "") {
  const sid = (sessionId || "").toString().trim();
  if (!sid) return false;
  const bridge = resolveNativeCallElectronBridge();
  const hasElectronSourcePicker = Boolean(
    bridge
    && typeof bridge.listDisplayCaptureSources === "function"
    && typeof bridge.setDisplayCaptureSource === "function"
  );
  closeNativeCallPickerDialogByClass("native-call-picker-dialog--screen");
  const dialog = document.createElement("dialog");
  dialog.className = "native-call-picker-dialog native-call-picker-dialog--screen";
  const shell = document.createElement("div");
  shell.className = "native-call-picker-dialog__shell";
  const heading = document.createElement("h3");
  heading.textContent = "Share Screen";
  const sub = document.createElement("p");
  sub.className = "native-call-picker-dialog__meta";
  sub.textContent = hasElectronSourcePicker
    ? "Choose a monitor or window."
    : "Your browser picker can include tabs, windows, and screens.";
  const prefs = getPreferences();
  const optionsRow = document.createElement("div");
  optionsRow.className = "native-call-picker-dialog__options";
  const systemAudioWrap = document.createElement("label");
  const systemAudioInput = document.createElement("input");
  systemAudioInput.type = "checkbox";
  systemAudioInput.checked = (prefs.callScreenSystemAudio || "on") !== "off";
  systemAudioWrap.appendChild(systemAudioInput);
  systemAudioWrap.appendChild(document.createTextNode(" Share system/tab audio"));
  const micMixWrap = document.createElement("label");
  const micMixInput = document.createElement("input");
  micMixInput.type = "checkbox";
  micMixInput.checked = (prefs.callScreenMicMix || "on") !== "off";
  micMixWrap.appendChild(micMixInput);
  micMixWrap.appendChild(document.createTextNode(" Mix microphone"));
  optionsRow.appendChild(systemAudioWrap);
  optionsRow.appendChild(micMixWrap);
  const grid = document.createElement("div");
  grid.className = "native-call-source-grid";
  const status = document.createElement("p");
  status.className = "native-call-picker-dialog__meta";
  status.textContent = hasElectronSourcePicker
    ? "Loading capture sources…"
    : "Click Start Share to open the browser source picker.";
  const actions = document.createElement("div");
  actions.className = "native-call-picker-dialog__actions";
  const startBtn = document.createElement("button");
  startBtn.type = "button";
  startBtn.textContent = "Start Share";
  const cancelBtn = document.createElement("button");
  cancelBtn.type = "button";
  cancelBtn.textContent = "Cancel";
  cancelBtn.addEventListener("click", () => dialog.close());
  startBtn.addEventListener("click", async () => {
    state.preferences = getPreferences();
    state.preferences.callScreenSystemAudio = systemAudioInput.checked ? "on" : "off";
    state.preferences.callScreenMicMix = micMixInput.checked ? "on" : "off";
    saveState();
    dialog.close();
    await xmppSwitchLocalMediaMode(sid, "screen", {
      screenOptions: {
        includeSystemAudio: systemAudioInput.checked,
        includeMic: micMixInput.checked
      }
    });
  });
  actions.appendChild(startBtn);
  actions.appendChild(cancelBtn);
  shell.appendChild(heading);
  shell.appendChild(sub);
  shell.appendChild(optionsRow);
  shell.appendChild(status);
  shell.appendChild(grid);
  shell.appendChild(actions);
  dialog.appendChild(shell);
  dialog.addEventListener("close", () => {
    dialog.remove();
  });
  document.body.appendChild(dialog);
  try {
    dialog.showModal();
  } catch {
    dialog.setAttribute("open", "open");
  }
  if (!hasElectronSourcePicker) {
    grid.innerHTML = "";
    startBtn.disabled = false;
    return true;
  }
  const listed = await bridge.listDisplayCaptureSources();
  if (!listed?.ok) {
    status.textContent = listed?.error || "Failed to list display capture sources.";
    status.classList.add("is-error");
    return false;
  }
  const sources = Array.isArray(listed.sources) ? listed.sources : [];
  if (sources.length <= 0) {
    status.textContent = "No display sources are available right now.";
    status.classList.add("is-error");
    return false;
  }
  status.textContent = "Select a source to start sharing.";
  grid.innerHTML = "";
  startBtn.disabled = true;
  sources.forEach((source, index) => {
    const sourceId = (source?.id || "").toString().trim();
    if (!sourceId) return;
    const card = document.createElement("button");
    card.type = "button";
    card.className = "native-call-source-card";
    const thumb = document.createElement("img");
    thumb.className = "native-call-source-card__thumb";
    thumb.alt = (source?.name || `source-${index + 1}`).toString();
    thumb.src = (source?.thumbnailDataUrl || "").toString().trim() || "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
    const body = document.createElement("span");
    body.className = "native-call-source-card__body";
    const title = document.createElement("strong");
    title.textContent = (source?.name || `Source ${index + 1}`).toString().trim() || `Source ${index + 1}`;
    const meta = document.createElement("small");
    meta.textContent = source?.type === "screen" ? "Monitor" : "Window";
    body.appendChild(title);
    body.appendChild(meta);
    card.appendChild(thumb);
    card.appendChild(body);
    card.addEventListener("click", async () => {
      const saved = await bridge.setDisplayCaptureSource(sourceId);
      if (!saved?.ok) {
        showToast(saved?.error || "Could not queue selected display source.", { tone: "error", duration: 2600 });
        return;
      }
      state.preferences = getPreferences();
      state.preferences.callScreenSystemAudio = systemAudioInput.checked ? "on" : "off";
      state.preferences.callScreenMicMix = micMixInput.checked ? "on" : "off";
      saveState();
      dialog.close();
      await xmppSwitchLocalMediaMode(sid, "screen", {
        screenOptions: {
          includeSystemAudio: systemAudioInput.checked,
          includeMic: micMixInput.checked
        }
      });
    });
    grid.appendChild(card);
  });
  return true;
}

function buildNativeCallDeviceSelectOptions(select, items, selectedId, fallbackLabel) {
  select.innerHTML = "";
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = fallbackLabel;
  select.appendChild(defaultOption);
  let hasSelected = !selectedId;
  (Array.isArray(items) ? items : []).forEach((device, index) => {
    const option = document.createElement("option");
    option.value = (device?.id || "").toString();
    option.textContent = formatMediaDeviceLabel(device, `${fallbackLabel} ${index + 1}`);
    if (option.value === selectedId) {
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
}

async function openNativeCallCameraPicker(sessionId = "") {
  const sid = (sessionId || "").toString().trim();
  if (!sid) return false;
  if (!navigator.mediaDevices?.getUserMedia) {
    showToast("Camera preview is unavailable in this runtime.", { tone: "error", duration: 2600 });
    return false;
  }
  await refreshMediaDeviceSnapshot({ force: false });
  closeNativeCallPickerDialogByClass("native-call-picker-dialog--camera");
  const dialog = document.createElement("dialog");
  dialog.className = "native-call-picker-dialog native-call-picker-dialog--camera";
  const shell = document.createElement("div");
  shell.className = "native-call-picker-dialog__shell";
  const heading = document.createElement("h3");
  heading.textContent = "Camera Preview";
  const select = document.createElement("select");
  select.className = "native-call-surface__select";
  const prefs = getPreferences();
  buildNativeCallDeviceSelectOptions(select, mediaDeviceSnapshot.video || [], prefs.callVideoInputId || "", "Default Camera");
  const status = document.createElement("p");
  status.className = "native-call-picker-dialog__meta";
  const preview = document.createElement("video");
  preview.className = "native-call-camera-preview";
  preview.autoplay = true;
  preview.muted = true;
  preview.playsInline = true;
  const actions = document.createElement("div");
  actions.className = "native-call-picker-dialog__actions";
  const useBtn = document.createElement("button");
  useBtn.type = "button";
  useBtn.textContent = "Use Selected";
  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.textContent = "Close";
  actions.appendChild(useBtn);
  actions.appendChild(closeBtn);
  shell.appendChild(heading);
  shell.appendChild(select);
  shell.appendChild(status);
  shell.appendChild(preview);
  shell.appendChild(actions);
  dialog.appendChild(shell);
  let previewStream = null;
  const stopPreview = () => {
    if (!(previewStream instanceof MediaStream)) return;
    previewStream.getTracks().forEach((track) => {
      try {
        track.stop();
      } catch {
        // Ignore preview stop failures.
      }
    });
    previewStream = null;
    preview.srcObject = null;
  };
  const startPreview = async () => {
    stopPreview();
    const targetId = (select.value || "").toString().trim();
    const videoConstraint = targetId ? { deviceId: { exact: targetId } } : true;
    try {
      previewStream = await navigator.mediaDevices.getUserMedia({ audio: false, video: videoConstraint });
      preview.srcObject = previewStream;
      status.textContent = "Preview active.";
      status.classList.remove("is-error");
    } catch (error) {
      status.textContent = describeMediaAccessError(error, "Could not start camera preview.");
      status.classList.add("is-error");
    }
  };
  select.addEventListener("change", () => {
    void startPreview();
  });
  useBtn.addEventListener("click", async () => {
    state.preferences = getPreferences();
    state.preferences.callVideoInputId = (select.value || "").toString().trim();
    saveState();
    const ok = await xmppReacquireLocalMediaForSession(sid).catch(() => false);
    showToast(ok ? "Camera device updated." : "Failed to switch camera device.", {
      tone: ok ? "info" : "error",
      duration: 2600
    });
    if (xmppActiveNativeCallSessionId === sid) renderNativeXmppCallSurface(sid);
    dialog.close();
  });
  closeBtn.addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => {
    stopPreview();
    dialog.remove();
  });
  document.body.appendChild(dialog);
  try {
    dialog.showModal();
  } catch {
    dialog.setAttribute("open", "open");
  }
  await startPreview();
  return true;
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

function clearNativeCallSurfaceTicker() {
  if (nativeCallSurfaceTickerId) clearTimeout(nativeCallSurfaceTickerId);
  nativeCallSurfaceTickerId = 0;
  nativeCallSurfaceTickerSessionId = "";
}

function scheduleNativeCallSurfaceTicker(sessionId = "") {
  const sid = (sessionId || "").toString().trim();
  if (!sid || xmppActiveNativeCallSessionId !== sid) {
    if (nativeCallSurfaceTickerSessionId === sid || !sid) clearNativeCallSurfaceTicker();
    return;
  }
  if (nativeCallSurfaceTickerId && nativeCallSurfaceTickerSessionId === sid) return;
  clearNativeCallSurfaceTicker();
  nativeCallSurfaceTickerSessionId = sid;
  nativeCallSurfaceTickerId = window.setTimeout(() => {
    nativeCallSurfaceTickerId = 0;
    if (xmppActiveNativeCallSessionId !== sid) {
      clearNativeCallSurfaceTicker();
      return;
    }
    renderNativeXmppCallSurface(sid);
  }, 1000);
}

function formatNativeCallDuration(ms = 0) {
  const totalSeconds = Math.max(0, Math.floor((Number(ms) || 0) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function computeXmppCallQualityLevel({ rttMs = 0, lossPercent = 0, pcState = "", iceState = "" } = {}) {
  const pc = (pcState || "").toString().trim().toLowerCase();
  const ice = (iceState || "").toString().trim().toLowerCase();
  if (["failed", "disconnected", "closed"].includes(pc) || ["failed", "disconnected", "closed"].includes(ice)) {
    return "poor";
  }
  const rtt = Math.max(0, Number(rttMs) || 0);
  const loss = Math.max(0, Number(lossPercent) || 0);
  if (rtt >= 450 || loss >= 0.12) return "poor";
  if (rtt >= 220 || loss >= 0.05) return "fair";
  return "good";
}

async function refreshXmppCallQualitySnapshot(sessionId = "", { force = false } = {}) {
  const sid = (sessionId || "").toString().trim();
  if (!sid) return null;
  const entry = xmppCallPeerConnectionBySessionId.get(sid) || null;
  const pc = entry?.pc || null;
  if (!pc || typeof pc.getStats !== "function") return null;
  if (xmppCallQualityRefreshInFlight.has(sid)) return xmppCallQualitySnapshotBySessionId.get(sid) || null;
  const now = Date.now();
  const previous = xmppCallQualitySnapshotBySessionId.get(sid) || null;
  if (!force && previous && now - (Number(previous.ts) || 0) < 2500) return previous;
  xmppCallQualityRefreshInFlight.add(sid);
  try {
    const stats = await pc.getStats();
    let selectedPair = null;
    let totalPackets = 0;
    let totalLost = 0;
    for (const report of stats.values()) {
      if (!report || typeof report !== "object") continue;
      if (
        report.type === "candidate-pair"
        && (report.selected || report.nominated || report.state === "succeeded")
      ) {
        if (!selectedPair || report.selected || report.nominated) selectedPair = report;
      }
      if (report.type === "inbound-rtp" && !report.isRemote) {
        const recv = Number(report.packetsReceived) || 0;
        const lost = Math.max(0, Number(report.packetsLost) || 0);
        totalPackets += Math.max(0, recv) + lost;
        totalLost += lost;
      }
    }
    const rttMs = Math.max(0, Number(selectedPair?.currentRoundTripTime || 0) * 1000);
    const lossPercent = totalPackets > 0 ? (totalLost / totalPackets) : 0;
    const pcState = (pc.connectionState || "").toString().trim().toLowerCase();
    const iceState = (pc.iceConnectionState || "").toString().trim().toLowerCase();
    const snapshot = {
      ts: now,
      rttMs,
      lossPercent,
      level: computeXmppCallQualityLevel({ rttMs, lossPercent, pcState, iceState })
    };
    xmppCallQualitySnapshotBySessionId.set(sid, snapshot);
    return snapshot;
  } catch {
    return xmppCallQualitySnapshotBySessionId.get(sid) || null;
  } finally {
    xmppCallQualityRefreshInFlight.delete(sid);
  }
}

function xmppCallQualityChipData(sessionId = "", {
  pcState = "",
  iceState = ""
} = {}) {
  const sid = (sessionId || "").toString().trim();
  if (!sid) return { level: "fair", text: "Quality ?" };
  const snapshot = xmppCallQualitySnapshotBySessionId.get(sid) || null;
  if (!snapshot) return { level: "fair", text: "Quality …" };
  const rttText = Number.isFinite(snapshot.rttMs) && snapshot.rttMs > 0
    ? `${Math.round(snapshot.rttMs)}ms`
    : "";
  const lossText = Number.isFinite(snapshot.lossPercent) && snapshot.lossPercent >= 0
    ? `${Math.round(snapshot.lossPercent * 1000) / 10}%`
    : "";
  const details = [rttText, lossText ? `loss ${lossText}` : ""].filter(Boolean).join(" · ");
  const level = computeXmppCallQualityLevel({
    rttMs: snapshot.rttMs,
    lossPercent: snapshot.lossPercent,
    pcState,
    iceState
  });
  return {
    level,
    text: details ? `Quality ${level} · ${details}` : `Quality ${level}`
  };
}

function appendNativeCallTileBadges(tile, badges = []) {
  if (!(tile instanceof HTMLElement)) return;
  const list = Array.isArray(badges)
    ? badges.map((entry) => (entry || "").toString().trim()).filter(Boolean)
    : [];
  if (list.length === 0) return;
  const wrap = document.createElement("div");
  wrap.className = "native-call-surface__badges";
  list.slice(0, 3).forEach((label) => {
    const chip = document.createElement("span");
    chip.className = "native-call-surface__badge";
    chip.textContent = label;
    wrap.appendChild(chip);
  });
  tile.appendChild(wrap);
}

function ensureXmppNativeCallSpeakingContext() {
  if (xmppCallSpeakingAudioContext) return xmppCallSpeakingAudioContext;
  try {
    xmppCallSpeakingAudioContext = new (window.AudioContext || window.webkitAudioContext)();
  } catch {
    xmppCallSpeakingAudioContext = null;
  }
  return xmppCallSpeakingAudioContext;
}

function xmppAnalyzeNativeCallSpeakingLevel(analyser, buffer) {
  if (!analyser || !buffer) return 0;
  analyser.getByteTimeDomainData(buffer);
  let sum = 0;
  for (let i = 0; i < buffer.length; i += 1) {
    const centered = (buffer[i] - 128) / 128;
    sum += centered * centered;
  }
  return Math.sqrt(sum / buffer.length);
}

function updateXmppNativeCallTileSpeakingUi(sessionId = "", state = null) {
  const sid = (sessionId || "").toString().trim();
  if (!sid || !(state && state.speakingByKey instanceof Map)) return;
  const surface = document.querySelector(`.native-call-surface[data-session-id="${sid}"]`);
  if (!(surface instanceof HTMLElement)) return;
  const tiles = surface.querySelectorAll(".native-call-surface__tile[data-native-call-speaker-key]");
  tiles.forEach((tile) => {
    if (!(tile instanceof HTMLElement)) return;
    const key = (tile.dataset.nativeCallSpeakerKey || "").toString().trim();
    tile.classList.toggle("native-call-surface__tile--speaking", Boolean(state.speakingByKey.get(key)));
  });
}

function syncXmppNativeCallSpeakingAnalyzers(sessionId = "", state = null) {
  const sid = (sessionId || "").toString().trim();
  if (!sid || !state || !(state.participants instanceof Map)) return;
  const localStream = xmppCallLocalMediaStreamBySessionId.get(sid) || null;
  const remoteStreams = xmppRemoteStreamListForSession(sid);
  const desired = [];
  if (localStream instanceof MediaStream) {
    desired.push({ key: "local", stream: localStream, local: true });
  }
  remoteStreams.forEach((stream, index) => {
    if (!(stream instanceof MediaStream)) return;
    const track = stream.getAudioTracks()[0] || null;
    const streamKey = (stream.id || track?.id || `${index + 1}`).toString().trim();
    desired.push({ key: `remote:${streamKey}`, stream, local: false });
  });
  const desiredKeys = new Set(desired.map((entry) => entry.key));
  state.participants.forEach((entry, key) => {
    if (desiredKeys.has(key)) return;
    if (entry?.source && typeof entry.source.disconnect === "function") {
      try {
        entry.source.disconnect();
      } catch {
        // Ignore analyser disconnect failures during stream churn.
      }
    }
    state.participants.delete(key);
    state.speakingByKey.delete(key);
  });
  desired.forEach((entry) => {
    const track = entry.stream.getAudioTracks()[0] || null;
    const existing = state.participants.get(entry.key) || null;
    const trackId = (track?.id || "").toString();
    if (existing && existing.stream === entry.stream && existing.trackId === trackId) {
      existing.trackEnabled = Boolean(track?.enabled);
      return;
    }
    if (existing?.source && typeof existing.source.disconnect === "function") {
      try {
        existing.source.disconnect();
      } catch {
        // Ignore analyser disconnect failures during stream replacement.
      }
    }
    if (!(entry.stream instanceof MediaStream) || !track) {
      state.participants.delete(entry.key);
      state.speakingByKey.set(entry.key, false);
      return;
    }
    try {
      const analyser = state.ctx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.28;
      const source = state.ctx.createMediaStreamSource(entry.stream);
      source.connect(analyser);
      state.participants.set(entry.key, {
        key: entry.key,
        stream: entry.stream,
        local: Boolean(entry.local),
        source,
        analyser,
        buffer: new Uint8Array(analyser.fftSize),
        trackId,
        trackEnabled: Boolean(track.enabled),
        lastAboveAt: 0,
        level: 0
      });
    } catch {
      state.participants.delete(entry.key);
      state.speakingByKey.set(entry.key, false);
    }
  });
}

function tickXmppNativeCallTileSpeakingMonitor(sessionId = "") {
  const sid = (sessionId || "").toString().trim();
  const state = xmppNativeCallTileSpeakingStateBySessionId.get(sid) || null;
  if (!sid || !state) return;
  if (xmppActiveNativeCallSessionId !== sid || !xmppCallSessionById.has(sid)) {
    stopXmppNativeCallTileSpeakingMonitor(sid);
    return;
  }
  syncXmppNativeCallSpeakingAnalyzers(sid, state);
  const now = Date.now();
  state.participants.forEach((entry, key) => {
    const level = entry?.analyser ? xmppAnalyzeNativeCallSpeakingLevel(entry.analyser, entry.buffer) : 0;
    const above = level >= 0.048;
    if (above) entry.lastAboveAt = now;
    const held = now - (Number(entry.lastAboveAt) || 0) <= 320;
    const speaking = Boolean(entry.trackEnabled) && (above || held);
    entry.level = level;
    state.speakingByKey.set(key, speaking);
  });
  updateXmppNativeCallTileSpeakingUi(sid, state);
  state.timerId = window.setTimeout(() => tickXmppNativeCallTileSpeakingMonitor(sid), 130);
}

function ensureXmppNativeCallTileSpeakingMonitor(sessionId = "") {
  const sid = (sessionId || "").toString().trim();
  if (!sid) return;
  let state = xmppNativeCallTileSpeakingStateBySessionId.get(sid) || null;
  if (!state) {
    const ctx = ensureXmppNativeCallSpeakingContext();
    if (!ctx) return;
    state = {
      ctx,
      timerId: 0,
      participants: new Map(),
      speakingByKey: new Map()
    };
    xmppNativeCallTileSpeakingStateBySessionId.set(sid, state);
  }
  if (state.ctx?.state === "suspended" && typeof state.ctx.resume === "function") {
    void state.ctx.resume().catch(() => null);
  }
  syncXmppNativeCallSpeakingAnalyzers(sid, state);
  if (!state.timerId) {
    state.timerId = window.setTimeout(() => tickXmppNativeCallTileSpeakingMonitor(sid), 80);
  }
}

function stopXmppNativeCallTileSpeakingMonitor(sessionId = "") {
  const sid = (sessionId || "").toString().trim();
  if (!sid) return;
  const state = xmppNativeCallTileSpeakingStateBySessionId.get(sid) || null;
  if (!state) return;
  if (state.timerId) clearTimeout(state.timerId);
  state.timerId = 0;
  state.participants.forEach((entry) => {
    if (entry?.source && typeof entry.source.disconnect === "function") {
      try {
        entry.source.disconnect();
      } catch {
        // Ignore analyser disconnect failures during teardown.
      }
    }
  });
  xmppNativeCallTileSpeakingStateBySessionId.delete(sid);
}

function xmppNativeCallTileSpeakingSnapshot(sessionId = "") {
  const sid = (sessionId || "").toString().trim();
  if (!sid) return new Map();
  const state = xmppNativeCallTileSpeakingStateBySessionId.get(sid) || null;
  return state?.speakingByKey instanceof Map ? state.speakingByKey : new Map();
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
  const pcStateLower = pcState.toLowerCase();
  const iceStateLower = iceState.toLowerCase();
  stage.innerHTML = "";
  const shell = document.createElement("div");
  shell.className = "native-call-surface";
  shell.dataset.sessionId = sid;
  const header = document.createElement("div");
  header.className = "native-call-surface__header";
  const title = document.createElement("strong");
  title.textContent = `Native XMPP Call ${sid.slice(0, 8)}`;
  const meta = document.createElement("span");
  const state = (session?.state || "starting").toString().trim();
  const createdAtMsRaw = Number(session?.createdAt);
  const createdAtMs = Number.isFinite(createdAtMsRaw) && createdAtMsRaw > 0
    ? createdAtMsRaw
    : Date.parse((session?.createdAt || "").toString());
  const durationText = Number.isFinite(createdAtMs) && createdAtMs > 0
    ? formatNativeCallDuration(Date.now() - createdAtMs)
    : "";
  const flags = [
    session?.pendingLocalRenegotiation ? "reprime" : "",
    xmppCallSessionTaskChainBySessionId.has(sid) ? "queued" : "",
    xmppCallPendingReprimeBySessionId.has(sid) ? "debounce" : "",
    session?.localHold ? "hold" : "",
    session?.remoteHold ? "peer-hold" : ""
  ].filter(Boolean);
  const stateBits = [
    peer || "peer",
    state,
    durationText ? `dur:${durationText}` : "",
    pcState ? `pc:${pcState}` : "",
    iceState ? `ice:${iceState}` : "",
    ...(flags.length > 0 ? flags : [])
  ].filter(Boolean);
  meta.textContent = stateBits.join(" · ");
  void refreshXmppCallQualitySnapshot(sid, { force: false });
  const quality = xmppCallQualityChipData(sid, { pcState: pcStateLower, iceState: iceStateLower });
  const qualityChip = document.createElement("span");
  qualityChip.className = `native-call-surface__quality native-call-surface__quality--${quality.level}`;
  qualityChip.textContent = quality.text;
  qualityChip.title = "Estimated from WebRTC connection stats (RTT and packet loss).";
  const reconnectNoticeNeeded = ["disconnected", "failed"].includes(pcStateLower)
    || ["disconnected", "failed"].includes(iceStateLower);
  const reconnectNotice = reconnectNoticeNeeded
    ? document.createElement("div")
    : null;
  if (reconnectNotice) {
    reconnectNotice.className = "native-call-surface__notice";
    const detail = [
      pcState ? `pc:${pcState}` : "",
      iceState ? `ice:${iceState}` : ""
    ].filter(Boolean).join(" · ");
    const label = document.createElement("span");
    label.textContent = detail
      ? `Connection unstable (${detail}).`
      : "Connection unstable.";
    const recoverBtn = document.createElement("button");
    recoverBtn.type = "button";
    recoverBtn.textContent = "Recover";
    recoverBtn.addEventListener("click", async () => {
      recoverBtn.disabled = true;
      const refreshed = await xmppReacquireLocalMediaForSession(sid).catch(() => false);
      const peerJid = xmppBareJid(session?.peerJid || "");
      if (peerJid) xmppQueueTransportInfoGatherAndSend(peerJid, sid, { force: true });
      showToast(
        refreshed ? "Recovery refresh queued." : "Recovery refresh failed.",
        { tone: refreshed ? "info" : "error", duration: 2600 }
      );
      if (xmppActiveNativeCallSessionId === sid) renderNativeXmppCallSurface(sid);
    });
    reconnectNotice.appendChild(label);
    reconnectNotice.appendChild(recoverBtn);
  }
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
    if (screenActive) {
      await xmppSwitchLocalMediaMode(sid, "camera");
      return;
    }
    await openNativeCallScreenSharePicker(sid);
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
  const holdBtn = document.createElement("button");
  holdBtn.type = "button";
  holdBtn.className = "native-call-surface__toggle";
  const localHoldActive = Boolean(session?.localHold);
  holdBtn.textContent = localHoldActive ? "Resume" : "Hold";
  holdBtn.title = localHoldActive ? "Resume call media and notify peer" : "Temporarily hold local call media";
  if (localHoldActive) holdBtn.classList.add("is-active");
  holdBtn.addEventListener("click", async () => {
    holdBtn.disabled = true;
    const liveSession = xmppCallSessionById.get(sid) || null;
    const nextHold = !Boolean(liveSession?.localHold);
    const ok = await xmppSetLocalSessionHold(sid, nextHold).catch(() => false);
    showToast(ok ? (nextHold ? "Call on hold." : "Call resumed.") : "Hold/resume failed.", {
      tone: ok ? "info" : "error",
      duration: 2400
    });
    if (xmppActiveNativeCallSessionId === sid) renderNativeXmppCallSurface(sid);
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
  const reconnectBtn = document.createElement("button");
  reconnectBtn.type = "button";
  reconnectBtn.className = "native-call-surface__toggle";
  reconnectBtn.textContent = "Reconnect";
  reconnectBtn.title = "Queue media re-prime and transport refresh without ending the call";
  reconnectBtn.addEventListener("click", async () => {
    reconnectBtn.disabled = true;
    const refreshed = await xmppReacquireLocalMediaForSession(sid).catch(() => false);
    const reprimeQueued = xmppForceNativeCallSessionReprime(sid);
    const transportQueued = xmppForceNativeCallSessionTransportRefresh(sid);
    const ok = refreshed || reprimeQueued || transportQueued;
    showToast(
      ok ? "Soft reconnect queued." : "Soft reconnect failed.",
      { tone: ok ? "info" : "error", duration: 2600 }
    );
    if (xmppActiveNativeCallSessionId === sid) renderNativeXmppCallSurface(sid);
  });
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
    clearNativeCallSurfaceTicker();
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
  actions.appendChild(holdBtn);
  actions.appendChild(audioTestBtn);
  actions.appendChild(copyBtn);
  actions.appendChild(refreshBtn);
  actions.appendChild(reconnectBtn);
  actions.appendChild(debugBtn);
  actions.appendChild(rejoinBtn);
  actions.appendChild(endBtn);
  header.appendChild(title);
  header.appendChild(meta);
  header.appendChild(qualityChip);
  header.appendChild(actions);
  if (reconnectNotice) shell.appendChild(reconnectNotice);
  const devicesRow = document.createElement("div");
  devicesRow.className = "native-call-surface__devices";
  const prefs = getPreferences();
  const audioSelect = document.createElement("select");
  audioSelect.className = "native-call-surface__select";
  const videoSelect = document.createElement("select");
  videoSelect.className = "native-call-surface__select";
  const outputSelect = document.createElement("select");
  outputSelect.className = "native-call-surface__select";
  buildNativeCallDeviceSelectOptions(audioSelect, mediaDeviceSnapshot.audio || [], prefs.callAudioInputId, "Default Mic");
  buildNativeCallDeviceSelectOptions(videoSelect, mediaDeviceSnapshot.video || [], prefs.callVideoInputId, "Default Camera");
  buildNativeCallDeviceSelectOptions(outputSelect, mediaDeviceSnapshot.output || [], prefs.callAudioOutputId, "Default Speaker");
  const setInputSelectBusy = (busy = false) => {
    audioSelect.disabled = busy;
    videoSelect.disabled = busy;
  };
  const applyLocalInputDeviceChange = async ({ kind = "audio", label = "Microphone" } = {}) => {
    setInputSelectBusy(true);
    try {
      const ok = await xmppReacquireLocalMediaForSession(sid).catch(() => false);
      showToast(
        ok ? `${label} device updated.` : `Failed to switch ${label.toLowerCase()} device.`,
        { tone: ok ? "info" : "error", duration: 2600 }
      );
      if (xmppActiveNativeCallSessionId === sid) renderNativeXmppCallSurface(sid);
      addXmppDebugEvent(
        ok ? "runtime" : "error",
        ok ? "Applied native call input device change" : "Failed native call input device change",
        { sid, kind }
      );
    } finally {
      setInputSelectBusy(false);
    }
  };
  audioSelect.addEventListener("change", () => {
    state.preferences = getPreferences();
    state.preferences.callAudioInputId = audioSelect.value;
    saveState();
    void applyLocalInputDeviceChange({ kind: "audio", label: "Microphone" });
  });
  videoSelect.addEventListener("change", () => {
    state.preferences = getPreferences();
    state.preferences.callVideoInputId = videoSelect.value;
    saveState();
    void applyLocalInputDeviceChange({ kind: "video", label: "Camera" });
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
  const camPreviewBtn = document.createElement("button");
  camPreviewBtn.type = "button";
  camPreviewBtn.className = "native-call-surface__device-preview";
  camPreviewBtn.textContent = "Preview";
  camPreviewBtn.title = "Open camera picker with live preview";
  camPreviewBtn.addEventListener("click", () => {
    void openNativeCallCameraPicker(sid);
  });
  videoWrap.appendChild(camPreviewBtn);
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
  ensureXmppNativeCallTileSpeakingMonitor(sid);
  const speakingByKey = xmppNativeCallTileSpeakingSnapshot(sid);
  if (localStream instanceof MediaStream) {
    const localTile = document.createElement("div");
    localTile.className = "native-call-surface__tile";
    localTile.dataset.nativeCallSpeakerKey = "local";
    const localMeta = xmppLocalMediaSnapshot(sid);
    const localVideoHidden = localMeta.videoTracks.length > 0 && !localMeta.videoEnabled;
    localTile.classList.toggle("native-call-surface__tile--muted", localMeta.audioTracks.length > 0 && !localMeta.audioEnabled);
    localTile.classList.toggle("native-call-surface__tile--video-off", localVideoHidden);
    localTile.classList.toggle("native-call-surface__tile--speaking", Boolean(speakingByKey.get("local")));
    const video = document.createElement("video");
    video.className = "native-call-surface__video";
    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;
    video.srcObject = localStream;
    video.classList.toggle("native-call-surface__video--hidden", localVideoHidden);
    if (localVideoHidden) {
      const placeholder = document.createElement("div");
      placeholder.className = "native-call-surface__avatar-placeholder";
      placeholder.textContent = "You";
      localTile.appendChild(placeholder);
    }
    const label = document.createElement("span");
    label.className = "native-call-surface__label";
    const badges = [];
    if (session?.localHold) badges.push("on hold");
    if (localMeta.audioTracks.length > 0 && !localMeta.audioEnabled) badges.push("mic off");
    if (localMeta.videoTracks.length > 0 && !localMeta.videoEnabled) badges.push("cam off");
    if (session?.pendingLocalRenegotiation || xmppCallSessionTaskChainBySessionId.has(sid)) badges.push("reconnecting");
    label.textContent = "You";
    localTile.appendChild(video);
    appendNativeCallTileBadges(localTile, badges);
    localTile.appendChild(label);
    grid.appendChild(localTile);
  }
  const remoteStreams = xmppRemoteStreamListForSession(sid);
  remoteStreams.forEach((stream, index) => {
    const tile = document.createElement("div");
    tile.className = "native-call-surface__tile";
    const remoteTrack = stream.getAudioTracks()[0] || null;
    const remoteKeySeed = (stream.id || remoteTrack?.id || `${index + 1}`).toString().trim();
    const speakerKey = `remote:${remoteKeySeed}`;
    tile.dataset.nativeCallSpeakerKey = speakerKey;
    const remoteVideoHidden = Boolean(session?.remoteVideoMuted);
    if (session?.remoteMuted) tile.classList.add("native-call-surface__tile--muted");
    if (remoteVideoHidden) tile.classList.add("native-call-surface__tile--video-off");
    tile.classList.toggle("native-call-surface__tile--speaking", Boolean(speakingByKey.get(speakerKey)));
    const video = document.createElement("video");
    video.className = "native-call-surface__video";
    video.autoplay = true;
    video.playsInline = true;
    video.srcObject = stream;
    video.classList.toggle("native-call-surface__video--hidden", remoteVideoHidden);
    if (remoteVideoHidden) {
      const placeholder = document.createElement("div");
      placeholder.className = "native-call-surface__avatar-placeholder";
      placeholder.textContent = (peer || "Peer").slice(0, 24);
      tile.appendChild(placeholder);
    }
    void applyAudioOutputDeviceToElement(video, prefs.callAudioOutputId || "");
    const label = document.createElement("span");
    label.className = "native-call-surface__label";
    const baseLabel = index === 0 ? (peer || "Peer") : `${peer || "Peer"} ${index + 1}`;
    const badges = [];
    if (session?.remoteHold) badges.push("on hold");
    if (session?.remoteMuted) badges.push("mic off");
    if (session?.remoteVideoMuted) badges.push("cam off");
    label.textContent = baseLabel;
    tile.appendChild(video);
    appendNativeCallTileBadges(tile, badges);
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
  scheduleNativeCallSurfaceTicker(sid);
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
  if (nativeCallSurfaceTickerSessionId && nativeCallSurfaceTickerSessionId !== sid) {
    clearNativeCallSurfaceTicker();
  }
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
