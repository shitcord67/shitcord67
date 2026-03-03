/*
 * SWF runtime/PiP lifecycle extracted from app.js.
 * Keeps media transport and runtime orchestration in xeps/.
 */

function activateSwfPipTab(runtimeKey) {
  if (!runtimeKey) return;
  if (!swfPipTabs.includes(runtimeKey)) swfPipTabs.push(runtimeKey);
  swfPipActiveKey = runtimeKey;
  swfPipManuallyHidden = false;
  renderSwfPipDock();
}

function removeSwfPipTab(runtimeKey) {
  const index = swfPipTabs.indexOf(runtimeKey);
  if (index >= 0) swfPipTabs.splice(index, 1);
  if (swfPipActiveKey === runtimeKey) {
    swfPipActiveKey = swfPipTabs[swfPipTabs.length - 1] || null;
  }
  renderSwfPipDock();
}

function collectLiveSwfRuntimeKeys() {
  const keys = new Set();
  state.guilds.forEach((guild) => {
    guild.channels.forEach((channel) => {
      channel.messages.forEach((message) => {
        (message.attachments || []).forEach((attachment, index) => {
          if (attachment?.type === "swf") keys.add(`${message.id}:${index}`);
        });
      });
    });
  });
  state.dmThreads.forEach((thread) => {
    (thread.messages || []).forEach((message) => {
      (message.attachments || []).forEach((attachment, index) => {
        if (attachment?.type === "swf") keys.add(`${message.id}:${index}`);
      });
    });
  });
  return keys;
}

function attachmentUsesInlineVideoControls(attachment) {
  if (!attachment || typeof attachment !== "object") return false;
  const type = (attachment.type || "").toString().toLowerCase();
  const mediaUrl = resolveMediaUrl(attachment.url || "");
  const videoLike = type === "video"
    || inferAttachmentTypeFromUrl(mediaUrl) === "video"
    || inferAttachmentTypeFromUrl(attachment.name || "") === "video";
  return videoLike && type !== "gif";
}

function collectLiveVideoPipRuntimeKeys(messageBucket = []) {
  const keys = new Set();
  (Array.isArray(messageBucket) ? messageBucket : []).forEach((message) => {
    (message?.attachments || []).forEach((attachment, index) => {
      if (attachmentUsesInlineVideoControls(attachment)) keys.add(`video:${message.id}:${index}`);
    });
  });
  return keys;
}

function ensureVideoPipRuntime(runtimeKey, { video = null, label = "" } = {}) {
  if (!runtimeKey) return null;
  let runtime = videoPipRuntimes.get(runtimeKey) || null;
  if (!runtime) {
    runtime = {
      key: runtimeKey,
      video: null,
      controlsEl: null,
      syncControls: null,
      controlsHome: null,
      anchorHost: null,
      label: "",
      inPip: false
    };
    videoPipRuntimes.set(runtimeKey, runtime);
  }
  if (video instanceof HTMLVideoElement) runtime.video = video;
  if (label) runtime.label = label;
  return runtime;
}

function restoreVideoRuntimeControls(runtime) {
  if (!runtime?.controlsEl || !(runtime.controlsEl instanceof HTMLElement)) return;
  runtime.controlsEl.classList.remove("message-video-controls--pip");
  const home = runtime.controlsHome;
  if (!(home instanceof HTMLElement) || !home.isConnected) return;
  if (!home.contains(runtime.controlsEl)) home.appendChild(runtime.controlsEl);
}

function destroyVideoPipRuntime(runtimeKey, { force = false } = {}) {
  const runtime = videoPipRuntimes.get(runtimeKey);
  if (!runtime) return false;
  if (!force && runtime.inPip) return false;
  if (runtime.controlsEl instanceof HTMLElement) {
    restoreVideoRuntimeControls(runtime);
    runtime.controlsEl.remove();
  }
  if (runtime.video instanceof HTMLVideoElement) {
    runtime.video.classList.remove("message-video--pip-floating");
    runtime.video.style.left = "";
    runtime.video.style.top = "";
    runtime.video.style.width = "";
    runtime.video.style.height = "";
    runtime.video.style.zIndex = "";
  }
  videoPipRuntimes.delete(runtimeKey);
  if (videoPipActiveKey === runtimeKey) {
    videoPipActiveKey = null;
    renderVideoPipDock();
  }
  return true;
}

function renderVideoPipDock() {
  if (!(ui.videoPipDock instanceof HTMLElement) || !(ui.videoPipHost instanceof HTMLElement)) return;
  const runtime = videoPipActiveKey ? videoPipRuntimes.get(videoPipActiveKey) : null;
  const hasActive = Boolean(runtime?.inPip && runtime.video instanceof HTMLVideoElement);
  ui.videoPipDock.classList.toggle("video-pip--hidden", !hasActive);
  ui.videoPipDock.classList.toggle("video-pip--collapsed", Boolean(videoPipCollapsed));
  ui.videoPipHost.innerHTML = "";
  if (!hasActive) {
    if (ui.videoPipTitle) ui.videoPipTitle.textContent = "Video PiP";
    videoPipActiveKey = null;
    videoPipRuntimes.forEach((entry) => {
      restoreVideoRuntimeControls(entry);
      if (entry?.syncControls instanceof Function) entry.syncControls();
    });
    return;
  }
  if (ui.videoPipTitle) ui.videoPipTitle.textContent = runtime.label || "Video";
  ui.videoPipHost.appendChild(runtime.video);
  runtime.video.classList.add("message-video--pip-floating");
  if (runtime.controlsEl instanceof HTMLElement) {
    runtime.controlsEl.classList.remove("message-video-controls--pip");
    restoreVideoRuntimeControls(runtime);
  }
  updateVideoPipDockLayout();
  videoPipRuntimes.forEach((entry) => {
    if (entry?.key !== runtime.key) restoreVideoRuntimeControls(entry);
    if (entry?.syncControls instanceof Function) entry.syncControls();
  });
}

function pipViewportMargins() {
  const appEl = document.getElementById("app");
  const appRect = appEl?.getBoundingClientRect?.();
  const appStyles = appEl ? window.getComputedStyle(appEl) : null;
  const paddingTop = appStyles ? Number.parseFloat(appStyles.paddingTop) || 0 : 0;
  const paddingRight = appStyles ? Number.parseFloat(appStyles.paddingRight) || 0 : 0;
  const paddingBottom = appStyles ? Number.parseFloat(appStyles.paddingBottom) || 0 : 0;
  const paddingLeft = appStyles ? Number.parseFloat(appStyles.paddingLeft) || 0 : 0;
  return {
    left: Math.max(8, Math.round((appRect?.left || 0) + paddingLeft + 8)),
    top: Math.max(8, Math.round((appRect?.top || 0) + paddingTop + 8)),
    right: Math.max(8, Math.round(Math.max(0, window.innerWidth - (appRect?.right || window.innerWidth)) + paddingRight + 8)),
    bottom: Math.max(8, Math.round(Math.max(0, window.innerHeight - (appRect?.bottom || window.innerHeight)) + paddingBottom + 8))
  };
}

function clampPipDockAboveComposer(dockElement) {
  if (!(dockElement instanceof HTMLElement) || !dockElement.isConnected) return false;
  const rect = dockElement.getBoundingClientRect();
  if (!(Number.isFinite(rect.width) && Number.isFinite(rect.height) && rect.width > 1 && rect.height > 1)) return false;
  const margins = pipViewportMargins();
  const maxLeft = Math.max(margins.left, window.innerWidth - rect.width - margins.right);
  const composerRect = ui.messageForm?.getBoundingClientRect?.();
  const maxTopByViewport = window.innerHeight - rect.height - margins.bottom;
  const maxTopByComposer = composerRect
    ? composerRect.top - rect.height - margins.bottom
    : maxTopByViewport;
  const maxTop = Math.max(margins.top, Math.min(maxTopByViewport, maxTopByComposer));
  const nextLeft = Math.max(margins.left, Math.min(maxLeft, rect.left));
  const nextTop = Math.max(margins.top, Math.min(maxTop, rect.top));
  if (Math.abs(nextLeft - rect.left) < 0.5 && Math.abs(nextTop - rect.top) < 0.5) return false;
  dockElement.style.left = `${Math.round(nextLeft)}px`;
  dockElement.style.top = `${Math.round(nextTop)}px`;
  dockElement.style.right = "auto";
  dockElement.style.bottom = "auto";
  return true;
}

function updateVideoPipDockLayout() {
  if (!(ui.videoPipDock instanceof HTMLElement) || ui.videoPipDock.classList.contains("video-pip--hidden")) return;
  if (pipDragState?.dragging && pipDragState.target === "video") return;
  if (pipResizeState?.resizing && pipResizeState.target === "video") return;
  const prefs = getPreferences();
  const storedSize = prefs.videoPipSize && typeof prefs.videoPipSize === "object" ? prefs.videoPipSize : null;
  if (Number.isFinite(storedSize?.width) && storedSize.width > 0) {
    ui.videoPipDock.style.width = `${Math.round(storedSize.width)}px`;
  }
  if (Number.isFinite(storedSize?.height) && storedSize.height > 0) {
    ui.videoPipDock.style.height = `${Math.round(storedSize.height)}px`;
  }
  if (
    prefs.videoPipPosition?.manual
    && Number.isFinite(prefs.videoPipPosition.left)
    && Number.isFinite(prefs.videoPipPosition.top)
  ) {
    const margins = pipViewportMargins();
    const manualRect = ui.videoPipDock.getBoundingClientRect();
    const manualWidth = manualRect.width || 420;
    const manualHeight = manualRect.height || 280;
    const manualLeft = Math.max(
      margins.left,
      Math.min(window.innerWidth - manualWidth - margins.right, prefs.videoPipPosition.left)
    );
    const manualTop = Math.max(
      margins.top,
      Math.min(window.innerHeight - manualHeight - margins.bottom, prefs.videoPipPosition.top)
    );
    ui.videoPipDock.style.left = `${Math.round(manualLeft)}px`;
    ui.videoPipDock.style.top = `${Math.round(manualTop)}px`;
    ui.videoPipDock.style.right = "auto";
    ui.videoPipDock.style.bottom = "auto";
    clampPipDockAboveComposer(ui.videoPipDock);
    return;
  }
  const rect = ui.videoPipDock.getBoundingClientRect();
  const width = rect.width || 420;
  const height = rect.height || 280;
  const composerRect = ui.messageForm?.getBoundingClientRect?.();
  const margins = pipViewportMargins();
  let left = Math.max(margins.left, window.innerWidth - width - Math.max(14, margins.right));
  let top = Math.max(margins.top, window.innerHeight - height - Math.max(208, margins.bottom));
  if (composerRect) {
    top = Math.max(margins.top, composerRect.top - height - margins.bottom);
  }
  if (ui.swfPipDock instanceof HTMLElement && !ui.swfPipDock.classList.contains("swf-pip--hidden")) {
    const swfRect = ui.swfPipDock.getBoundingClientRect();
    const candidateLeft = swfRect.left - width - 12;
    if (candidateLeft > margins.left) {
      left = candidateLeft;
      top = Math.max(margins.top, swfRect.top);
    }
  }
  ui.videoPipDock.style.left = `${Math.round(left)}px`;
  ui.videoPipDock.style.top = `${Math.round(top)}px`;
  ui.videoPipDock.style.right = "auto";
  ui.videoPipDock.style.bottom = "auto";
  clampPipDockAboveComposer(ui.videoPipDock);
}

function setVideoRuntimePip(runtimeKey, enabled) {
  const runtime = videoPipRuntimes.get(runtimeKey);
  if (!runtime?.video) return false;
  if (enabled) {
    if (videoPipActiveKey && videoPipActiveKey !== runtimeKey) {
      setVideoRuntimePip(videoPipActiveKey, false);
    }
    videoPipActiveKey = runtimeKey;
    runtime.inPip = true;
    if (runtime.anchorHost instanceof HTMLElement) {
      runtime.anchorHost.innerHTML = "<div class=\"channel-empty\">Running in PiP panel.</div>";
    }
    renderVideoPipDock();
    return true;
  }
  runtime.inPip = false;
  runtime.video.classList.remove("message-video--pip-floating");
  if (runtime.anchorHost instanceof HTMLElement && runtime.anchorHost.isConnected) {
    runtime.anchorHost.innerHTML = "";
    runtime.anchorHost.appendChild(runtime.video);
  }
  restoreVideoRuntimeControls(runtime);
  if (videoPipActiveKey === runtimeKey) videoPipActiveKey = null;
  renderVideoPipDock();
  return true;
}

function shouldPreserveSwfRuntime(runtimeKey, runtime, liveSwfKeys = null) {
  if (!runtime) return false;
  if (runtime.keepAlive === true) return true;
  if (runtime.pendingPip === true) return true;
  if (runtime.inPip || runtime.pipTransitioning || runtime.parked) return true;
  if (swfPipTabs.includes(runtimeKey)) return true;
  if (liveSwfKeys instanceof Set && liveSwfKeys.has(runtimeKey)) return true;
  return false;
}

function ensurePreservedSwfRuntimeHost(runtimeKey, runtime, reason = "preserve") {
  if (!runtime?.player || !(runtime.player instanceof HTMLElement)) return false;
  if (shouldUseAnchoredBodySwfRuntime(runtimeKey)) {
    const bodyHost = ensureSwfRuntimeBodyHost(runtimeKey, runtime);
    if (bodyHost instanceof HTMLElement) {
      runtime.host = bodyHost;
      runtime.pipTransitioning = false;
      return true;
    }
  }
  if (runtime.host instanceof HTMLElement && runtime.host.isConnected) return true;
  if (runtime.inPip && recoverDetachedSwfPipHost(runtimeKey)) return true;
  let host = runtime.host instanceof HTMLElement ? runtime.host : null;
  if (!(host instanceof HTMLElement)) {
    host = document.createElement("div");
    host.className = "message-swf-player";
  }
  if (!host.classList.contains("message-swf-player")) host.classList.add("message-swf-player");
  if (!host.contains(runtime.player)) {
    host.innerHTML = "";
    host.appendChild(runtime.player);
  }
  const lot = ensureSwfRuntimeParkingLot();
  host.classList.remove("swf-pip-player", "message-swf-player--pip-floating");
  host.classList.add("message-swf-player--parked");
  lot.appendChild(host);
  runtime.host = host;
  runtime.originHost = host;
  runtime.inPip = false;
  runtime.pipHost = null;
  runtime.pipTransitioning = false;
  runtime.parked = true;
  addDebugLog("warn", "Preserved SWF runtime by parking detached host", { key: runtimeKey, reason });
  return true;
}

function destroySwfRuntime(runtimeKey, {
  force = false,
  removeHost = true,
  reason = "cleanup",
  liveSwfKeys = null
} = {}) {
  if (!runtimeKey) return false;
  const runtime = swfRuntimes.get(runtimeKey);
  if (!runtime) return false;
  setSwfRuntimeHoverState(runtimeKey, false);
  clearSwfRuntimeHoverOffTimer(runtimeKey);
  clearSwfRuntimeHoverClass(runtime);
  if (!force && shouldPreserveSwfRuntime(runtimeKey, runtime, liveSwfKeys)) {
    ensurePreservedSwfRuntimeHost(runtimeKey, runtime, reason);
    addDebugLog("warn", "Skipped SWF runtime destroy because runtime is preserved", {
      key: runtimeKey,
      reason
    });
    return false;
  }
  if (runtime.observer) {
    runtime.observer.disconnect();
    runtime.observer = null;
  }
  runtime.anchorHost = null;
  const removeLiveHost = removeHost || Boolean(runtime.bodyHosted || shouldUseAnchoredBodySwfRuntime(runtimeKey));
  if (removeLiveHost && runtime.host instanceof HTMLElement) runtime.host.remove();
  swfRuntimes.delete(runtimeKey);
  noteSwfRuntimeEvent(runtimeKey, "destroyed");
  removeSwfPipTab(runtimeKey);
  if (swfSoloRuntimeKey === runtimeKey) swfSoloRuntimeKey = null;
  swfPendingUi.delete(runtimeKey);
  swfPendingAudio.delete(runtimeKey);
  refreshSwfRuntimeHealthUi(runtimeKey);
  refreshSwfAudioFocus();
  requestSwfRuntimeLayoutSync();
  addDebugLog("info", "Destroyed SWF runtime", { key: runtimeKey, reason, force });
  return true;
}

function swfRuntimeTelemetryEntry(runtimeKey) {
  if (!runtimeKey) return null;
  if (!swfRuntimeTelemetry.has(runtimeKey)) {
    swfRuntimeTelemetry.set(runtimeKey, {
      created: 0,
      destroyed: 0,
      reused: 0,
      lastEvent: "",
      lastAt: ""
    });
  }
  return swfRuntimeTelemetry.get(runtimeKey) || null;
}

function noteSwfRuntimeEvent(runtimeKey, eventName) {
  const entry = swfRuntimeTelemetryEntry(runtimeKey);
  if (!entry) return;
  if (eventName === "created") entry.created += 1;
  if (eventName === "destroyed") entry.destroyed += 1;
  if (eventName === "reused") entry.reused += 1;
  entry.lastEvent = eventName;
  entry.lastAt = new Date().toISOString();
}

function refreshSwfRuntimeHealthUi(runtimeKey) {
  if (!runtimeKey) return;
  const runtime = swfRuntimes.get(runtimeKey);
  const el = runtime?.healthBadgeEl instanceof HTMLElement ? runtime.healthBadgeEl : null;
  if (!el) return;
  const entry = swfRuntimeTelemetry.get(runtimeKey);
  if (!entry) {
    el.textContent = "Runtime stable";
    el.title = "Live runtime instance.";
    return;
  }
  const reloads = Math.max(0, entry.created - 1);
  if (reloads > 0 || entry.destroyed > 0) {
    el.textContent = `Runtime reloads: ${reloads}`;
  } else {
    el.textContent = "Runtime stable";
  }
  const at = entry.lastAt ? formatFullTimestamp(entry.lastAt) : "n/a";
  el.title = [
    `Created: ${entry.created}`,
    `Reused: ${entry.reused}`,
    `Destroyed: ${entry.destroyed}`,
    `Last event: ${entry.lastEvent || "n/a"} (${at})`
  ].join(" | ");
}

function applyPendingSwfUiBindings(runtimeKey) {
  if (!runtimeKey) return;
  const pendingUi = swfPendingUi.get(runtimeKey);
  if (!pendingUi) return;
  const runtime = swfRuntimes.get(runtimeKey);
  if (!runtime) return;
  runtime.audioToggleEl = pendingUi.audioToggleEl || null;
  runtime.audioIndicatorEl = pendingUi.audioIndicatorEl || null;
  runtime.vuMeterFillEl = pendingUi.vuMeterFillEl || null;
  runtime.healthBadgeEl = pendingUi.healthBadgeEl || null;
  swfPendingUi.delete(runtimeKey);
  refreshSwfRuntimeHealthUi(runtimeKey);
}

function activeConversationHasLiveSwfRuntime(messageBucket = []) {
  if (!Array.isArray(messageBucket) || messageBucket.length === 0) return false;
  for (const message of messageBucket) {
    const attachments = normalizeAttachments(message?.attachments);
    for (let index = 0; index < attachments.length; index += 1) {
      if (attachments[index]?.type !== "swf") continue;
      const key = `${message.id}:${index}`;
      const runtime = swfRuntimes.get(key);
      if (runtime?.player) return true;
    }
  }
  return false;
}

function mixRenderSignatureHash(hash, value) {
  const token = (value || "").toString();
  let mixed = Number(hash) >>> 0;
  for (let index = 0; index < token.length; index += 1) {
    mixed ^= token.charCodeAt(index);
    mixed = Math.imul(mixed, 16777619);
  }
  return mixed >>> 0;
}

function conversationRenderDigest(messageBucket) {
  const list = Array.isArray(messageBucket) ? messageBucket : [];
  let hash = 2166136261;
  list.forEach((message) => {
    if (!message || typeof message !== "object") {
      hash = mixRenderSignatureHash(hash, "null-message");
      return;
    }
    hash = mixRenderSignatureHash(hash, message.id || "");
    hash = mixRenderSignatureHash(hash, message.editedAt || "");
    hash = mixRenderSignatureHash(hash, message.ts || "");
    hash = mixRenderSignatureHash(hash, message.retracted ? "1" : "0");
    hash = mixRenderSignatureHash(hash, message.pinned ? "1" : "0");
    const reactions = normalizeReactions(message.reactions);
    hash = mixRenderSignatureHash(hash, String(reactions.length));
    reactions.forEach((entry) => {
      hash = mixRenderSignatureHash(hash, entry.emoji || "");
      hash = mixRenderSignatureHash(hash, (Array.isArray(entry.userIds) ? entry.userIds : []).join(","));
    });
    const attachments = normalizeAttachments(message.attachments);
    hash = mixRenderSignatureHash(hash, String(attachments.length));
    attachments.forEach((entry) => {
      hash = mixRenderSignatureHash(hash, entry.type || "");
      hash = mixRenderSignatureHash(hash, entry.url || "");
    });
    const poll = normalizePoll(message.poll);
    hash = mixRenderSignatureHash(hash, poll ? "1" : "0");
    if (poll) {
      hash = mixRenderSignatureHash(hash, poll.closed ? "1" : "0");
      poll.options.forEach((option) => {
        hash = mixRenderSignatureHash(hash, option.id || "");
        hash = mixRenderSignatureHash(hash, (Array.isArray(option.voterIds) ? option.voterIds : []).join(","));
      });
    }
  });
  return hash.toString(36);
}

function conversationRenderSignature(conversationId, messageBucket, activeFindId = "") {
  const list = Array.isArray(messageBucket) ? messageBucket : [];
  const first = list[0] || null;
  const last = list[list.length - 1] || null;
  const digest = conversationRenderDigest(list);
  return [
    conversationId || "",
    list.length,
    first?.id || "",
    first?.editedAt || first?.ts || "",
    last?.id || "",
    last?.editedAt || last?.ts || "",
    digest,
    activeFindId || ""
  ].join("|");
}

function shouldUseAnchoredBodySwfRuntime(runtimeKey) {
  const key = (runtimeKey || "").toString();
  if (!key || key.startsWith("shelf:")) return false;
  return key.includes(":");
}

function setSwfRuntimeHoverState(runtimeKey, hovered) {
  const runtime = swfRuntimes.get(runtimeKey);
  if (!runtime) return;
  const active = Boolean(hovered);
  const pendingOffTimer = swfRuntimeHoverOffTimerByKey.get(runtimeKey);
  if (pendingOffTimer) {
    clearTimeout(pendingOffTimer);
    swfRuntimeHoverOffTimerByKey.delete(runtimeKey);
  }
  const attachment = runtime.anchorHost instanceof HTMLElement
    ? runtime.anchorHost.closest(".message-attachment--swf")
    : null;
  if (active) {
    runtime.runtimeHover = true;
    if (attachment instanceof HTMLElement) {
      attachment.classList.add("message-attachment--swf-runtime-hover");
    }
    return;
  }
  runtime.runtimeHover = false;
  if (!(attachment instanceof HTMLElement)) return;
  const clearHover = () => {
    swfRuntimeHoverOffTimerByKey.delete(runtimeKey);
    if (!attachment.isConnected) return;
    if (attachment.matches(":hover") || attachment.matches(":focus-within")) return;
    attachment.classList.remove("message-attachment--swf-runtime-hover");
  };
  swfRuntimeHoverOffTimerByKey.set(runtimeKey, setTimeout(clearHover, 220));
}

function clearSwfRuntimeHoverOffTimer(runtimeKey) {
  const pending = swfRuntimeHoverOffTimerByKey.get(runtimeKey);
  if (!pending) return;
  clearTimeout(pending);
  swfRuntimeHoverOffTimerByKey.delete(runtimeKey);
}

function clearSwfRuntimeHoverClass(runtime) {
  const attachment = runtime?.anchorHost instanceof HTMLElement
    ? runtime.anchorHost.closest(".message-attachment--swf")
    : null;
  if (attachment instanceof HTMLElement) {
    attachment.classList.remove("message-attachment--swf-runtime-hover");
  }
}

function ensureSwfRuntimeBodyHost(runtimeKey, runtime) {
  if (!runtime?.player || !(runtime.player instanceof HTMLElement)) return null;
  if (!shouldUseAnchoredBodySwfRuntime(runtimeKey)) return runtime.host instanceof HTMLElement ? runtime.host : null;
  let host = runtime.host instanceof HTMLElement ? runtime.host : null;
  if (!(host instanceof HTMLElement) || host.parentElement !== document.body) {
    host = document.createElement("div");
    host.className = "message-swf-player";
    host.appendChild(runtime.player);
    document.body.appendChild(host);
    runtime.host = host;
  } else if (!host.contains(runtime.player)) {
    host.innerHTML = "";
    host.appendChild(runtime.player);
  }
  if (host.dataset.hoverBridgeBound !== "on") {
    host.dataset.hoverBridgeBound = "on";
    host.addEventListener("mouseenter", () => {
      setSwfRuntimeHoverState(runtimeKey, true);
    });
    host.addEventListener("mouseleave", () => {
      setSwfRuntimeHoverState(runtimeKey, false);
    });
  }
  host.classList.remove("message-swf-player--parked");
  return host;
}

function requestSwfRuntimeLayoutSync() {
  if (swfAnchorLayoutRaf) return;
  swfAnchorLayoutRaf = requestAnimationFrame(() => {
    swfAnchorLayoutRaf = 0;
    positionSwfAnchoredRuntimeHosts();
    positionSwfPipRuntimeHosts();
  });
}

function activeMessageViewportRect() {
  if (!(ui.messageList instanceof HTMLElement) || !ui.messageList.isConnected) return null;
  const rect = ui.messageList.getBoundingClientRect();
  if (!Number.isFinite(rect.width) || !Number.isFinite(rect.height) || rect.width <= 1 || rect.height <= 1) return null;
  let left = rect.left;
  let top = rect.top;
  let right = rect.right;
  let bottom = rect.bottom;
  const panelRect = ui.chatPanel instanceof HTMLElement ? ui.chatPanel.getBoundingClientRect() : null;
  if (panelRect) {
    left = Math.max(left, panelRect.left);
    right = Math.min(right, panelRect.right);
    top = Math.max(top, panelRect.top);
    bottom = Math.min(bottom, panelRect.bottom);
  }
  const headerRect = ui.chatHeader instanceof HTMLElement ? ui.chatHeader.getBoundingClientRect() : null;
  if (headerRect) {
    top = Math.max(top, headerRect.bottom);
  }
  const composerRect = ui.composerStack instanceof HTMLElement ? ui.composerStack.getBoundingClientRect() : null;
  if (composerRect) {
    bottom = Math.min(bottom, composerRect.top);
  }
  if (!(right > left && bottom > top)) return null;
  return {
    left,
    top,
    right,
    bottom,
    width: right - left,
    height: bottom - top
  };
}

function initializeSwfLayoutObservers() {
  if (swfLayoutResizeObserver || swfLayoutMutationObserver) return;
  if (typeof ResizeObserver === "function") {
    swfLayoutResizeObserver = new ResizeObserver(() => {
      requestSwfRuntimeLayoutSync();
    });
    [
      ui.messageList,
      ui.chatHeader,
      ui.composerStack,
      ui.chatPanel,
      ui.messageForm
    ].forEach((element) => {
      if (element instanceof HTMLElement) swfLayoutResizeObserver.observe(element);
    });
  }
  if (ui.messageList instanceof HTMLElement && typeof MutationObserver === "function") {
    swfLayoutMutationObserver = new MutationObserver(() => {
      requestSwfRuntimeLayoutSync();
    });
    swfLayoutMutationObserver.observe(ui.messageList, { childList: true, subtree: true });
  }
}

function initializePipDockResizeObservers() {
  if (typeof ResizeObserver !== "function") return;
  if (!swfPipDockResizeObserver && ui.swfPipDock instanceof HTMLElement) {
    swfPipDockResizeObserver = new ResizeObserver(() => {
      clampPipDockAboveComposer(ui.swfPipDock);
      requestSwfRuntimeLayoutSync();
      updateVideoPipDockLayout();
    });
    swfPipDockResizeObserver.observe(ui.swfPipDock);
  }
  if (!videoPipDockResizeObserver && ui.videoPipDock instanceof HTMLElement) {
    videoPipDockResizeObserver = new ResizeObserver(() => {
      if (pipResizeState?.resizing && pipResizeState.target === "video") return;
      clampPipDockAboveComposer(ui.videoPipDock);
      requestSwfRuntimeLayoutSync();
    });
    videoPipDockResizeObserver.observe(ui.videoPipDock);
  }
}

function rectIntersection(rectA, rectB) {
  if (!rectA || !rectB) return null;
  const left = Math.max(rectA.left, rectB.left);
  const top = Math.max(rectA.top, rectB.top);
  const right = Math.min(rectA.right, rectB.right);
  const bottom = Math.min(rectA.bottom, rectB.bottom);
  if (right <= left || bottom <= top) return null;
  return {
    left,
    top,
    right,
    bottom,
    width: right - left,
    height: bottom - top
  };
}

function positionSwfAnchoredRuntimeHosts() {
  const messageViewport = activeMessageViewportRect();
  swfRuntimes.forEach((runtime, runtimeKey) => {
    if (!runtime || !shouldUseAnchoredBodySwfRuntime(runtimeKey) || runtime.inPip || runtime.floating) return;
    const host = ensureSwfRuntimeBodyHost(runtimeKey, runtime);
    if (!(host instanceof HTMLElement)) return;
    if (document.fullscreenElement && host === document.fullscreenElement) return;
    const anchor = runtime.anchorHost instanceof HTMLElement && runtime.anchorHost.isConnected
      ? runtime.anchorHost
      : null;
    if (!anchor) {
      setSwfRuntimeHoverState(runtimeKey, false);
      host.classList.add("message-swf-player--parked");
      runtime.parked = true;
      applySwfVisibilityPlayback(runtimeKey, false);
      return;
    }
    let rect = anchor.getBoundingClientRect();
    const liveResizeActive = host.classList.contains("message-swf-player--resizable");
    if (liveResizeActive) {
      const liveRect = host.getBoundingClientRect();
      if (Number.isFinite(liveRect.height) && liveRect.height > 2) {
        const nextHeight = Math.round(Math.max(150, liveRect.height));
        if (Math.abs((rect.height || 0) - nextHeight) > 1) {
          anchor.style.minHeight = `${nextHeight}px`;
          anchor.style.height = `${nextHeight}px`;
          anchor.dataset.swfLiveSize = "on";
          rect = anchor.getBoundingClientRect();
        }
      }
    } else if (anchor.dataset.swfLiveSize === "on") {
      anchor.dataset.swfLiveSize = "off";
      anchor.style.removeProperty("height");
      anchor.style.removeProperty("min-height");
      rect = anchor.getBoundingClientRect();
    }
    const clipBounds = messageViewport ? rectIntersection(rect, messageViewport) : rect;
    const visible = Boolean(clipBounds)
      && Number.isFinite(clipBounds.width)
      && Number.isFinite(clipBounds.height)
      && clipBounds.width > 2
      && clipBounds.height > 2
      && clipBounds.bottom > 0
      && clipBounds.right > 0
      && clipBounds.top < window.innerHeight
      && clipBounds.left < window.innerWidth;
    const rawVisible = Number.isFinite(rect.width)
      && Number.isFinite(rect.height)
      && rect.width > 2
      && rect.height > 2
      && rect.bottom > 0
      && rect.right > 0
      && rect.top < window.innerHeight
      && rect.left < window.innerWidth;
    host.classList.remove("message-swf-player--parked", "swf-pip-player", "message-swf-player--pip-floating");
    host.style.position = "fixed";
    host.style.borderColor = "";
    host.style.background = "";
    host.style.boxShadow = "";
    host.style.clipPath = "";
    host.style.overflow = "hidden";
    host.style.left = `${rect.left}px`;
    host.style.top = `${rect.top}px`;
    host.style.width = `${Math.max(1, rect.width)}px`;
    host.style.height = `${Math.max(1, rect.height)}px`;
    host.style.zIndex = "1";
    host.style.pointerEvents = visible ? "auto" : "none";
    host.style.opacity = visible ? "1" : "0";
    host.style.visibility = visible ? "visible" : "hidden";
    if (messageViewport && rawVisible) {
      const clipTop = Math.max(0, messageViewport.top - rect.top);
      const clipRight = Math.max(0, rect.right - messageViewport.right);
      const clipBottom = Math.max(0, rect.bottom - messageViewport.bottom);
      const clipLeft = Math.max(0, messageViewport.left - rect.left);
      if (clipTop > 0 || clipRight > 0 || clipBottom > 0 || clipLeft > 0) {
        host.style.clipPath = `inset(${clipTop}px ${clipRight}px ${clipBottom}px ${clipLeft}px round 6px)`;
      }
    }
    runtime.parked = !visible;
    if (!visible) setSwfRuntimeHoverState(runtimeKey, false);
    applySwfVisibilityPlayback(runtimeKey, visible);
  });
}

function attachExistingSwfRuntime(runtimeKey, hostElement) {
  const runtime = swfRuntimes.get(runtimeKey);
  if (!runtime?.player || !(hostElement instanceof HTMLElement)) return false;
  setSwfRuntimeHoverState(runtimeKey, false);
  if (shouldUseAnchoredBodySwfRuntime(runtimeKey)) runtime.bodyHosted = true;
  if (!hostElement.classList.contains("message-swf-player")) hostElement.classList.add("message-swf-player");
  const liveHost = ensureSwfRuntimeBodyHost(runtimeKey, runtime);
  if (!(liveHost instanceof HTMLElement)) return false;
  runtime.anchorHost = hostElement;
  runtime.originHost = hostElement;
  runtime.parked = false;
  hostElement.innerHTML = runtime.inPip
    ? "<div class=\"channel-empty\">Running in PiP tab.</div>"
    : "";
  if (!runtime.inPip && !runtime.floating) bindSwfVisibilityObserver(runtimeKey);
  requestSwfRuntimeLayoutSync();
  return hostElement;
}

function ensureSwfRuntimeParkingLot() {
  let lot = document.getElementById("swfRuntimeParkingLot");
  if (lot instanceof HTMLElement) return lot;
  lot = document.createElement("div");
  lot.id = "swfRuntimeParkingLot";
  lot.setAttribute("aria-hidden", "true");
  lot.style.position = "fixed";
  lot.style.left = "-20000px";
  lot.style.top = "-20000px";
  lot.style.width = "1px";
  lot.style.height = "1px";
  lot.style.opacity = "0";
  lot.style.pointerEvents = "none";
  lot.style.overflow = "hidden";
  document.body.appendChild(lot);
  return lot;
}

function parkSwfRuntimeHost(runtimeKey) {
  const runtime = swfRuntimes.get(runtimeKey);
  if (!runtime?.player || !(runtime.host instanceof HTMLElement)) return false;
  setSwfRuntimeHoverState(runtimeKey, false);
  if (runtime.observer) {
    runtime.observer.disconnect();
    runtime.observer = null;
  }
  const host = ensureSwfRuntimeBodyHost(runtimeKey, runtime) || runtime.host;
  if (!(host instanceof HTMLElement)) return false;
  host.classList.remove("swf-pip-player", "message-swf-player--pip-floating");
  host.classList.add("message-swf-player--parked");
  if (!shouldUseAnchoredBodySwfRuntime(runtimeKey)) {
    const lot = ensureSwfRuntimeParkingLot();
    lot.appendChild(host);
  }
  runtime.anchorHost = null;
  runtime.inPip = false;
  runtime.pipHost = null;
  runtime.pipTransitioning = false;
  runtime.parked = true;
  applySwfVisibilityPlayback(runtimeKey, false);
  addDebugLog("info", "Parked SWF runtime host for later reattach", { key: runtimeKey });
  return true;
}

function recoverDetachedSwfPipHost(runtimeKey) {
  const runtime = swfRuntimes.get(runtimeKey);
  if (!runtime?.player || !(runtime.player instanceof HTMLElement)) return false;
  let host = runtime.host instanceof HTMLElement ? runtime.host : null;
  if (!host) {
    host = document.createElement("div");
    host.className = "message-swf-player";
  }
  if (!host.classList.contains("message-swf-player")) host.classList.add("message-swf-player");
  if (!host.contains(runtime.player)) {
    host.innerHTML = "";
    host.appendChild(runtime.player);
  }
  if (!host.isConnected || host.parentElement !== document.body) {
    document.body.appendChild(host);
  }
  host.classList.remove("message-swf-player--parked");
  host.classList.add("swf-pip-player", "message-swf-player--pip-floating");
  runtime.host = host;
  runtime.pipHost = host;
  runtime.inPip = true;
  runtime.pipTransitioning = false;
  runtime.parked = false;
  addDebugLog("warn", "Recovered detached SWF PiP runtime host", { key: runtimeKey });
  return true;
}

function setSwfRuntimePip(runtimeKey, enabled) {
  const runtime = swfRuntimes.get(runtimeKey);
  if (!runtime?.player) return false;
  setSwfRuntimeHoverState(runtimeKey, false);
  const host = ensureSwfRuntimeBodyHost(runtimeKey, runtime) || runtime.host;
  if (!(host instanceof HTMLElement)) return false;
  runtime.host = host;
  if (enabled) {
    runtime.keepAlive = true;
    if (runtime.loading) {
      runtime.pendingPip = true;
      activateSwfPipTab(runtimeKey);
      addDebugLog("info", "Queued SWF PiP until runtime load completes", { key: runtimeKey });
      return true;
    }
    runtime.pendingPip = false;
    if (runtime.observer) {
      runtime.observer.disconnect();
      runtime.observer = null;
    }
    if (runtime.inPip) {
      if (!runtime.host.isConnected && !recoverDetachedSwfPipHost(runtimeKey)) return false;
      activateSwfPipTab(runtimeKey);
      requestSwfRuntimeLayoutSync();
      setSwfPlayback(runtimeKey, true, "user");
      return true;
    }
    runtime.pipTransitioning = true;
    runtime.inPip = true;
    runtime.originHost = runtime.anchorHost instanceof HTMLElement ? runtime.anchorHost : runtime.originHost;
    runtime.pipHost = runtime.host;
    runtime.parked = false;
    runtime.host.classList.remove("message-swf-player--parked");
    runtime.pipHost.classList.add("swf-pip-player", "message-swf-player--pip-floating");
    if (runtime.anchorHost instanceof HTMLElement) {
      runtime.anchorHost.innerHTML = "<div class=\"channel-empty\">Running in PiP tab.</div>";
    }
    runtime.pipTransitioning = false;
    activateSwfPipTab(runtimeKey);
    requestSwfRuntimeLayoutSync();
    setSwfPlayback(runtimeKey, true, "user");
    return true;
  }
  runtime.pipTransitioning = true;
  runtime.inPip = false;
  runtime.pendingPip = false;
  runtime.host.classList.remove("swf-pip-player", "message-swf-player--pip-floating");
  runtime.pipHost = null;
  runtime.pipTransitioning = false;
  runtime.parked = false;
  if (runtime.anchorHost instanceof HTMLElement) runtime.anchorHost.innerHTML = "";
  bindSwfVisibilityObserver(runtimeKey);
  removeSwfPipTab(runtimeKey);
  requestSwfRuntimeLayoutSync();
  setSwfPlayback(runtimeKey, true, "user");
  return true;
}

function renderSwfPipDock() {
  const hasTabs = swfPipTabs.length > 0;
  ui.swfPipDock.classList.toggle("swf-pip--hidden", !hasTabs || swfPipManuallyHidden);
  ui.swfPipDock.classList.toggle("swf-pip--collapsed", swfPipCollapsed);
  ui.swfPipTabs.innerHTML = "";
  if (ui.swfPipControls instanceof HTMLElement) {
    ui.swfPipControls.innerHTML = "";
    ui.swfPipControls.hidden = true;
  }
  if (!hasTabs) {
    requestSwfRuntimeLayoutSync();
    updateVideoPipDockLayout();
    return;
  }
  updateSwfPipDockLayout();
  if (!swfPipActiveKey || !swfPipTabs.includes(swfPipActiveKey)) swfPipActiveKey = swfPipTabs[0];
  // Render tabs first so host geometry is accurate before placing floating players.
  swfPipTabs.forEach((runtimeKey) => {
    const runtime = swfRuntimes.get(runtimeKey);
    if (!runtime) return;
    const tabBtn = document.createElement("button");
    tabBtn.type = "button";
    tabBtn.className = "swf-pip__tab";
    tabBtn.classList.toggle("active", runtimeKey === swfPipActiveKey);
    tabBtn.textContent = runtime.attachment?.name || "SWF";
    tabBtn.title = runtime.attachment?.name || "SWF";
    tabBtn.addEventListener("click", () => {
      swfPipActiveKey = runtimeKey;
      renderSwfPipDock();
      refreshSwfAudioFocus(runtimeKey);
    });
    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "swf-pip__tab-close";
    closeBtn.textContent = "✕";
    closeBtn.title = "Remove from PiP";
    closeBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      setSwfRuntimePip(runtimeKey, false);
      refreshSwfAudioFocus();
    });
    tabBtn.appendChild(closeBtn);
    ui.swfPipTabs.appendChild(tabBtn);
  });
  // Keep live Ruffle nodes attached to avoid destroy/recreate cycles.
  positionSwfPipRuntimeHosts();
  renderSwfPipDockControls(swfPipActiveKey);
  const activeRuntime = swfRuntimes.get(swfPipActiveKey);
  if (!activeRuntime?.pipHost) return;
  setSwfPlayback(swfPipActiveKey, true, "user");
  requestSwfRuntimeLayoutSync();
  updateVideoPipDockLayout();
}

function renderSwfPipDockControls(runtimeKey = "") {
  if (!(ui.swfPipControls instanceof HTMLElement)) return;
  ui.swfPipControls.innerHTML = "";
  const runtime = runtimeKey ? swfRuntimes.get(runtimeKey) : null;
  if (!runtime) {
    ui.swfPipControls.hidden = true;
    return;
  }
  ui.swfPipControls.hidden = false;
  const makeButton = (label, title, onClick, { active = false } = {}) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.title = title;
    if (active) button.classList.add("is-active");
    button.addEventListener("click", onClick);
    return button;
  };
  const playBtn = makeButton(
    runtime.playing ? "⏸" : "▶",
    runtime.playing ? "Pause SWF" : "Play SWF",
    () => {
      setSwfPlayback(runtimeKey, !runtime.playing, "user");
      renderSwfPipDockControls(runtimeKey);
    },
    { active: runtime.playing }
  );
  const muteBtn = makeButton(
    runtime.audioEnabled ? "🔊" : "🔇",
    runtime.audioEnabled ? "Mute SWF audio" : "Unmute SWF audio",
    () => {
      updateSwfRuntimeAudio(runtimeKey, { enabled: !runtime.audioEnabled });
      if (!runtime.audioEnabled) grantSwfAudioClickFocus(runtimeKey);
      renderSwfPipDockControls(runtimeKey);
    },
    { active: runtime.audioEnabled }
  );
  const resetBtn = makeButton("↺", "Reset SWF", () => {
    const swfAttachment = runtime.attachment?.url ? runtime.attachment : null;
    if (!swfAttachment) return;
    const host = runtime.host instanceof HTMLElement
      ? runtime.host
      : (runtime.pipHost instanceof HTMLElement ? runtime.pipHost : runtime.originHost);
    if (!(host instanceof HTMLElement)) return;
    void resetSwfRuntime(runtimeKey, host, swfAttachment);
    renderSwfPipDockControls(runtimeKey);
  });
  const fullscreenBtn = makeButton("⛶", "Fullscreen SWF", () => {
    const swfAttachment = runtime.attachment?.url ? runtime.attachment : null;
    if (!swfAttachment) return;
    const host = runtime.host instanceof HTMLElement
      ? runtime.host
      : (runtime.pipHost instanceof HTMLElement ? runtime.pipHost : runtime.originHost);
    if (!(host instanceof HTMLElement)) return;
    void openSwfFullscreen(runtimeKey, host, swfAttachment);
  });
  const removeBtn = makeButton("✕", "Remove from PiP", () => {
    setSwfRuntimePip(runtimeKey, false);
    refreshSwfAudioFocus();
  });
  ui.swfPipControls.appendChild(playBtn);
  ui.swfPipControls.appendChild(muteBtn);
  ui.swfPipControls.appendChild(resetBtn);
  ui.swfPipControls.appendChild(fullscreenBtn);
  ui.swfPipControls.appendChild(removeBtn);
}

function positionSwfPipRuntimeHosts() {
  const pipRect = ui.swfPipHost.getBoundingClientRect();
  const dockRect = ui.swfPipDock.getBoundingClientRect();
  const collapsedAnchorLeft = Math.max(8, dockRect.right - 2);
  const collapsedAnchorTop = Math.max(8, dockRect.bottom - 2);
  swfPipTabs.forEach((runtimeKey) => {
    const runtime = swfRuntimes.get(runtimeKey);
    if (!runtime?.pipHost) return;
    const bodyHost = ensureSwfRuntimeBodyHost(runtimeKey, runtime);
    if (bodyHost instanceof HTMLElement) runtime.pipHost = bodyHost;
    if (!runtime.pipHost.isConnected) {
      if (!recoverDetachedSwfPipHost(runtimeKey)) return;
    }
    const visible = (
      runtimeKey === swfPipActiveKey
      && !ui.swfPipDock.classList.contains("swf-pip--hidden")
      && !swfPipCollapsed
    );
    runtime.pipHost.style.display = "block";
    runtime.pipHost.style.pointerEvents = visible ? "auto" : "none";
    runtime.pipHost.style.opacity = visible ? "1" : "0";
    runtime.pipHost.style.visibility = visible ? "visible" : "hidden";
    runtime.pipHost.style.zIndex = visible ? "9210" : "1";
    if (visible) {
      runtime.pipHost.style.borderColor = "";
      runtime.pipHost.style.background = "";
      runtime.pipHost.style.boxShadow = "";
      runtime.pipHost.style.left = `${pipRect.left}px`;
      runtime.pipHost.style.top = `${pipRect.top}px`;
      runtime.pipHost.style.width = `${Math.max(1, pipRect.width)}px`;
      runtime.pipHost.style.height = `${Math.max(1, pipRect.height)}px`;
    } else {
      runtime.pipHost.style.borderColor = "transparent";
      runtime.pipHost.style.background = "transparent";
      runtime.pipHost.style.boxShadow = "none";
      runtime.pipHost.style.left = `${collapsedAnchorLeft}px`;
      runtime.pipHost.style.top = `${collapsedAnchorTop}px`;
      runtime.pipHost.style.width = "1px";
      runtime.pipHost.style.height = "1px";
    }
  });
}

function updateSwfPipDockLayout() {
  if (!(ui.swfPipDock instanceof HTMLElement)) return;
  if (pipDragState?.dragging && pipDragState.target === "swf") return;
  const prefs = getPreferences();
  const storedSize = prefs.swfPipSize && typeof prefs.swfPipSize === "object" ? prefs.swfPipSize : null;
  if (Number.isFinite(storedSize?.width) && storedSize.width > 0) {
    ui.swfPipDock.style.width = `${Math.round(storedSize.width)}px`;
  }
  if (Number.isFinite(storedSize?.height) && storedSize.height > 0) {
    ui.swfPipDock.style.height = `${Math.round(storedSize.height)}px`;
  }
  if (
    prefs.swfPipPosition?.manual
    && Number.isFinite(prefs.swfPipPosition.left)
    && Number.isFinite(prefs.swfPipPosition.top)
  ) {
    const margins = pipViewportMargins();
    const rect = ui.swfPipDock.getBoundingClientRect();
    const width = rect.width || 420;
    const height = rect.height || 320;
    const left = Math.max(margins.left, Math.min(window.innerWidth - width - margins.right, prefs.swfPipPosition.left));
    const top = Math.max(margins.top, Math.min(window.innerHeight - height - margins.bottom, prefs.swfPipPosition.top));
    ui.swfPipDock.style.left = `${Math.round(left)}px`;
    ui.swfPipDock.style.top = `${Math.round(top)}px`;
    ui.swfPipDock.style.right = "auto";
    ui.swfPipDock.style.bottom = "auto";
    clampPipDockAboveComposer(ui.swfPipDock);
    return;
  }
  const composerRect = ui.messageForm?.getBoundingClientRect?.();
  const margins = pipViewportMargins();
  if (!composerRect) {
    ui.swfPipDock.style.maxHeight = `${Math.max(160, window.innerHeight - (margins.top + margins.bottom + 8))}px`;
    ui.swfPipDock.style.left = `${Math.max(margins.left, window.innerWidth - 420 - Math.max(14, margins.right))}px`;
    ui.swfPipDock.style.top = `${Math.max(margins.top, window.innerHeight - 420 - margins.bottom)}px`;
    ui.swfPipDock.style.right = "auto";
    ui.swfPipDock.style.bottom = "auto";
    clampPipDockAboveComposer(ui.swfPipDock);
    return;
  }
  const maxHeight = Math.max(140, composerRect.top - margins.bottom - 4);
  ui.swfPipDock.style.maxHeight = `${Math.round(maxHeight)}px`;
  const rect = ui.swfPipDock.getBoundingClientRect();
  const width = rect.width || 420;
  const height = rect.height || 320;
  const left = Math.max(margins.left, Math.min(window.innerWidth - width - margins.right, composerRect.right - width));
  const maxTopAboveComposer = composerRect.top - height - margins.bottom;
  const top = Math.max(margins.top, maxTopAboveComposer);
  ui.swfPipDock.style.left = `${Math.round(left)}px`;
  ui.swfPipDock.style.top = `${Math.round(top)}px`;
  ui.swfPipDock.style.right = "auto";
  ui.swfPipDock.style.bottom = "auto";
  clampPipDockAboveComposer(ui.swfPipDock);
}

async function openSavedSwfFromShelf(entry) {
  const key = `shelf:${entry.url}`;
  let runtime = swfRuntimes.get(key);
  if (!runtime?.host) {
    const host = document.createElement("div");
    host.className = "message-swf-player";
    host.style.position = "fixed";
    host.style.left = "-2000px";
    host.style.top = "-2000px";
    host.style.width = "640px";
    host.style.height = "480px";
    document.body.appendChild(host);
    attachRufflePlayer(host, entry, { autoplay: "on", runtimeKey: key });
    for (let attempt = 0; attempt < 10; attempt += 1) {
      await nextFrame();
      runtime = swfRuntimes.get(key);
      if (runtime?.host) break;
    }
  }
  const host = runtime?.host || null;
  if (!host) return;
  await openSwfFullscreen(key, host, entry);
}

function setSwfPlayback(runtimeKey, shouldPlay, reason = "system") {
  const runtime = swfRuntimes.get(runtimeKey);
  if (!runtime?.player) return false;
  if (!(runtime.host instanceof HTMLElement) || !runtime.host.isConnected) {
    runtime.playing = Boolean(shouldPlay);
    if (!shouldPlay || reason !== "system") runtime.autoPausedByVisibility = false;
    return false;
  }
  if (shouldPlay && reason === "system" && !runtime.allowAutoPlay && !runtime.manualPlay) return false;
  try {
    if (shouldPlay) {
      if (typeof runtime.player.play === "function") runtime.player.play();
      runtime.playing = true;
      runtime.autoPausedByVisibility = false;
      if (reason !== "system") runtime.manualPlay = true;
    } else {
      if (typeof runtime.player.pause === "function") runtime.player.pause();
      runtime.playing = false;
      runtime.autoPausedByMute = false;
      if (reason !== "system") runtime.autoPausedByVisibility = false;
    }
    refreshSwfAudioFocus(shouldPlay ? runtimeKey : null);
    return true;
  } catch (error) {
    addDebugLog("warn", "SWF playback toggle failed", { key: runtimeKey, shouldPlay, error: String(error) });
    return false;
  }
}

function runtimeIsVisible(runtime) {
  if (!runtime?.host || !runtime.host.isConnected) return false;
  if (runtime.host.style.visibility === "hidden" || runtime.host.style.opacity === "0") return false;
  const rect = runtime.host.getBoundingClientRect();
  if (!Number.isFinite(rect.width) || !Number.isFinite(rect.height)) return false;
  if (rect.width <= 2 || rect.height <= 2) return false;
  if (!(rect.bottom > 0 && rect.right > 0 && rect.top < window.innerHeight && rect.left < window.innerWidth)) return false;
  if (runtime.anchorHost instanceof HTMLElement && runtime.anchorHost.isConnected) {
    const viewport = activeMessageViewportRect();
    if (viewport && !rectIntersection(rect, viewport)) return false;
  }
  return true;
}

function runtimeDistanceToViewportCenter(runtime) {
  if (!runtimeIsVisible(runtime)) return Number.POSITIVE_INFINITY;
  const rect = runtime.host.getBoundingClientRect();
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  const runtimeX = rect.left + rect.width / 2;
  const runtimeY = rect.top + rect.height / 2;
  return Math.hypot(centerX - runtimeX, centerY - runtimeY);
}

function pickCenteredRuntimeKey(canUse, { guildId = null, preferredKey = null } = {}) {
  const candidates = [];
  swfRuntimes.forEach((runtime, key) => {
    if (!canUse(key, runtime)) return;
    if (guildId !== null && (runtime.guildId || "__ungrouped__") !== guildId) return;
    candidates.push({ key, runtime, dist: runtimeDistanceToViewportCenter(runtime) });
  });
  if (candidates.length === 0) return null;
  const fullscreenEntry = candidates.find(({ runtime }) => document.fullscreenElement && runtime.host === document.fullscreenElement);
  if (fullscreenEntry) return fullscreenEntry.key;
  const preferred = preferredKey ? candidates.find((entry) => entry.key === preferredKey) : null;
  if (preferred && Number.isFinite(preferred.dist)) return preferred.key;
  const visible = candidates.filter((entry) => Number.isFinite(entry.dist));
  if (visible.length === 0) return candidates[0].key;
  visible.sort((a, b) => a.dist - b.dist);
  return visible[0].key;
}

function updateSwfAudioUi(runtimeKey) {
  const runtime = swfRuntimes.get(runtimeKey);
  if (!runtime) return;
  const prefs = getPreferences();
  if (runtime.audioToggleEl instanceof HTMLElement) {
    const muted = !runtime.audioEnabled;
    const pinSuffix = runtime.audioPinned ? " (Pinned)" : "";
    const titleText = `${muted ? "Unmute SWF audio" : "Mute SWF audio"}${pinSuffix}. Right-click to ${runtime.audioPinned ? "unpin" : "pin"} (skip auto-mute).`;
    runtime.audioToggleEl.textContent = muted ? "🔇" : "🔊";
    runtime.audioToggleEl.title = titleText;
    runtime.audioToggleEl.setAttribute("aria-label", titleText);
    runtime.audioToggleEl.classList.toggle("is-pinned", Boolean(runtime.audioPinned));
    runtime.audioToggleEl.dataset.pinned = runtime.audioPinned ? "on" : "off";
  }
  if (runtime.audioIndicatorEl instanceof HTMLElement) {
    const audible = runtime.playing && runtime.audioEnabled && !runtime.audioSuppressed;
    if (!runtime.audioEnabled) {
      runtime.audioIndicatorEl.textContent = "Muted";
      runtime.audioIndicatorEl.title = "Muted";
    } else if (runtime.audioSuppressed) {
      if (prefs.swfQuickAudioMode === "click" && !runtime.audioClickAllowed) {
        runtime.audioIndicatorEl.textContent = "Click to hear";
        runtime.audioIndicatorEl.title = "Click this SWF to route audio focus to it";
      } else {
        runtime.audioIndicatorEl.textContent = "Suppressed";
        runtime.audioIndicatorEl.title = "Suppressed by audio focus";
      }
    } else if (audible) {
      runtime.audioIndicatorEl.textContent = "Audio Active";
      runtime.audioIndicatorEl.title = "Audio active";
    } else {
      runtime.audioIndicatorEl.textContent = "Audio Idle";
      runtime.audioIndicatorEl.title = "Audio idle";
    }
    runtime.audioIndicatorEl.classList.toggle("is-active", audible);
    runtime.audioIndicatorEl.classList.toggle("is-pinned", Boolean(runtime.audioPinned));
  }
  if (runtime.vuMeterFillEl instanceof HTMLElement) {
    const audible = runtime.playing && runtime.audioEnabled && !runtime.audioSuppressed;
    runtime.vuMeterFillEl.classList.toggle("is-active", audible);
    runtime.vuMeterFillEl.style.width = audible ? `${42 + Math.round(Math.random() * 54)}%` : "0%";
  }
  refreshSwfRuntimeHealthUi(runtimeKey);
}


function applySwfAudioToRuntime(runtimeKey) {
  const runtime = swfRuntimes.get(runtimeKey);
  if (!runtime?.player) return;
  if (!(runtime.host instanceof HTMLElement) || !runtime.host.isConnected) return;
  const prefs = getPreferences();
  const audioEnabled = typeof runtime.audioEnabled === "boolean"
    ? runtime.audioEnabled
    : prefs.swfAudio === "on";
  const volumePercent = Number.isFinite(runtime.audioVolume)
    ? runtime.audioVolume
    : prefs.swfVolume;
  const effectiveAudioEnabled = audioEnabled && !runtime.audioSuppressed;
  const volume = effectiveAudioEnabled ? Math.min(100, Math.max(0, volumePercent)) / 100 : 0;
  const shouldPauseOnSuppressed = prefs.swfPauseOnMute === "on" && runtime.audioSuppressed;
  try {
    if ("volume" in runtime.player) runtime.player.volume = volume;
    if (typeof runtime.player.set_volume === "function") runtime.player.set_volume(volume);
    if ("muted" in runtime.player) runtime.player.muted = !effectiveAudioEnabled;
    if (shouldPauseOnSuppressed && runtime.playing && typeof runtime.player.pause === "function") {
      runtime.player.pause();
      runtime.autoPausedByMute = true;
    }
    if (!shouldPauseOnSuppressed && runtime.autoPausedByMute && runtime.playing && typeof runtime.player.play === "function") {
      runtime.player.play();
      runtime.autoPausedByMute = false;
    }
  } catch (error) {
    addDebugLog("warn", "Failed to apply SWF audio settings", { key: runtimeKey, error: String(error) });
  }
}

function applySwfAudioToAllRuntimes() {
  refreshSwfAudioFocus();
}

function updateSwfRuntimeAudio(runtimeKey, { enabled, volume } = {}) {
  if (!runtimeKey) return;
  const runtime = swfRuntimes.get(runtimeKey);
  if (!runtime) {
    const nextPending = swfPendingAudio.get(runtimeKey) || {};
    if (typeof enabled === "boolean") nextPending.enabled = enabled;
    if (Number.isFinite(volume)) nextPending.volume = Math.min(100, Math.max(0, volume));
    swfPendingAudio.set(runtimeKey, nextPending);
    return;
  }
  if (typeof enabled === "boolean") runtime.audioEnabled = enabled;
  if (Number.isFinite(volume)) runtime.audioVolume = Math.min(100, Math.max(0, volume));
  refreshSwfAudioFocus(enabled ? runtimeKey : null);
}

function setSwfRuntimeAudioPinned(runtimeKey, pinned) {
  if (!runtimeKey) return;
  const runtime = swfRuntimes.get(runtimeKey);
  if (!runtime) {
    const nextPending = swfPendingAudio.get(runtimeKey) || {};
    nextPending.pinned = Boolean(pinned);
    swfPendingAudio.set(runtimeKey, nextPending);
    return;
  }
  runtime.audioPinned = Boolean(pinned);
  refreshSwfAudioFocus(runtimeKey);
}

function getSwfRuntimeMetadata(runtimeKey) {
  const runtime = swfRuntimes.get(runtimeKey);
  if (!runtime?.player || typeof runtime.player.ruffle !== "function") return null;
  try {
    const api = runtime.player.ruffle();
    if (!api?.metadata) return null;
    runtime.metadata = api.metadata;
    return runtime.metadata;
  } catch {
    return runtime?.metadata || null;
  }
}

function computeFittedSwfSize(width, height, {
  minWidth = 240,
  minHeight = 160,
  maxWidth = 1200,
  maxHeight = 900
} = {}) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return null;
  const aspect = width / height;
  let targetWidth = width;
  let targetHeight = height;
  if (targetWidth > maxWidth) {
    targetWidth = maxWidth;
    targetHeight = targetWidth / aspect;
  }
  if (targetHeight > maxHeight) {
    targetHeight = maxHeight;
    targetWidth = targetHeight * aspect;
  }
  if (targetWidth < minWidth) {
    targetWidth = minWidth;
    targetHeight = targetWidth / aspect;
  }
  if (targetHeight < minHeight) {
    targetHeight = minHeight;
    targetWidth = targetHeight * aspect;
  }
  return {
    width: Math.round(targetWidth),
    height: Math.round(targetHeight)
  };
}

function applySwfMetadataSize(runtimeKey, hostElement) {
  if (!runtimeKey || !hostElement) return false;
  const metadata = getSwfRuntimeMetadata(runtimeKey);
  if (!metadata) return false;
  const width = Number(metadata.width);
  const height = Number(metadata.height);
  const fitted = computeFittedSwfSize(width, height, {
    minWidth: 260,
    minHeight: 180,
    maxWidth: 760,
    maxHeight: 520
  });
  if (!fitted) return false;
  hostElement.style.width = `${fitted.width}px`;
  hostElement.style.height = `${fitted.height}px`;
  hostElement.style.aspectRatio = `${Math.round(width)} / ${Math.round(height)}`;
  return true;
}

function applySwfOptimalSize(runtimeKey, hostElement) {
  if (!hostElement) return false;
  const metadata = runtimeKey ? getSwfRuntimeMetadata(runtimeKey) : null;
  if (!metadata) {
    addDebugLog("info", "SWF metadata unavailable for optimal size", { key: runtimeKey || null });
    return false;
  }
  const width = Number(metadata.width);
  const height = Number(metadata.height);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    addDebugLog("info", "SWF metadata missing dimensions for optimal size", { key: runtimeKey || null, metadata });
    return false;
  }
  const fitted = computeFittedSwfSize(width, height);
  if (!fitted) return false;
  hostElement.style.width = `${fitted.width}px`;
  hostElement.style.height = `${fitted.height}px`;
  hostElement.style.aspectRatio = `${Math.round(width)} / ${Math.round(height)}`;
  hostElement.classList.add("message-swf-player--resizable");
  addDebugLog("info", "Applied SWF optimal size", { key: runtimeKey || null, width: fitted.width, height: fitted.height });
  return true;
}

async function openSwfFullscreen(runtimeKey, hostElement, attachment) {
  let runtime = runtimeKey ? swfRuntimes.get(runtimeKey) : null;
  if (!runtime && hostElement && attachment) {
    attachRufflePlayer(hostElement, attachment, { autoplay: "on", runtimeKey });
    for (let attempt = 0; attempt < 8; attempt += 1) {
      await nextFrame();
      runtime = runtimeKey ? swfRuntimes.get(runtimeKey) : null;
      if (runtime?.host) break;
    }
  }
  const target = runtime?.host || hostElement;
  if (!target || typeof target.requestFullscreen !== "function") return;
  try {
    await target.requestFullscreen();
    fullscreenRuntimeKey = runtimeKey;
    if (runtimeKey) setSwfPlayback(runtimeKey, true, "user");
  } catch (error) {
    addDebugLog("warn", "SWF fullscreen request failed", { key: runtimeKey, error: String(error) });
  }
}

async function ensureSwfRuntimeReadyForPip(runtimeKey, hostElement, attachment) {
  if (!runtimeKey) return null;
  let runtime = swfRuntimes.get(runtimeKey);
  if (runtime) {
    runtime.keepAlive = true;
    runtime.pendingPip = true;
  }
  if (runtime?.player instanceof HTMLElement && !runtime.loading) return runtime;
  if (!(hostElement instanceof HTMLElement) || !attachment) return runtime || null;
  attachRufflePlayer(hostElement, attachment, { autoplay: swfAutoplayFromPreferences(), runtimeKey });
  for (let attempt = 0; attempt < 90; attempt += 1) {
    await nextFrame();
    runtime = swfRuntimes.get(runtimeKey);
    if (runtime) {
      runtime.keepAlive = true;
      runtime.pendingPip = true;
    }
    if (runtime?.player instanceof HTMLElement && !runtime.loading) return runtime;
  }
  return runtime || null;
}

async function resetSwfRuntime(runtimeKey, hostElement, attachment) {
  const confirmed = await showInAppConfirmDialog({
    title: "Reset SWF?",
    message: "Reset this SWF to the beginning?",
    confirmLabel: "Reset",
    cancelLabel: "Cancel",
    danger: true
  });
  if (!confirmed) return;
  const runtime = runtimeKey ? swfRuntimes.get(runtimeKey) : null;
  if (runtimeKey && runtime) {
    swfPendingUi.set(runtimeKey, {
      audioToggleEl: runtime.audioToggleEl || null,
      audioIndicatorEl: runtime.audioIndicatorEl || null,
      vuMeterFillEl: runtime.vuMeterFillEl || null,
      healthBadgeEl: runtime.healthBadgeEl || null
    });
  }
  if (runtime?.observer) runtime.observer.disconnect();
  if (runtimeKey) {
    destroySwfRuntime(runtimeKey, { force: true, reason: "user-reset", removeHost: false });
  }
  if (hostElement) {
    hostElement.innerHTML = "";
    hostElement.textContent = "Resetting SWF...";
  }
  attachRufflePlayer(hostElement, attachment, { autoplay: swfAutoplayFromPreferences(), runtimeKey });
}

function swfVisibilityTarget(runtime) {
  if (!runtime) return null;
  if (runtime.inPip || runtime.floating) return runtime.host instanceof HTMLElement ? runtime.host : null;
  if (runtime.anchorHost instanceof HTMLElement && runtime.anchorHost.isConnected) return runtime.anchorHost;
  return runtime.host instanceof HTMLElement ? runtime.host : null;
}

function applySwfVisibilityPlayback(runtimeKey, isVisible) {
  const runtime = swfRuntimes.get(runtimeKey);
  if (!runtime) return;
  if (isVisible) {
    if (!runtime.autoPausedByVisibility) return;
    const resumed = setSwfPlayback(runtimeKey, true, "system");
    if (resumed) runtime.autoPausedByVisibility = false;
    return;
  }
  if (!runtime.playing) return;
  const paused = setSwfPlayback(runtimeKey, false, "system");
  if (paused) runtime.autoPausedByVisibility = true;
}

function bindSwfVisibilityObserver(runtimeKey) {
  const runtime = swfRuntimes.get(runtimeKey);
  if (!runtime?.host || !runtime.player) return;
  if (runtime.observer) {
    runtime.observer.disconnect();
    runtime.observer = null;
  }
  const target = swfVisibilityTarget(runtime);
  if (!(target instanceof HTMLElement)) return;
  runtime.observerTarget = target;
  runtime.observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.target !== runtime.observerTarget) return;
      if (currentViewerRuntimeKey === runtimeKey) return;
      if (document.fullscreenElement && runtime.host === document.fullscreenElement) return;
      applySwfVisibilityPlayback(runtimeKey, entry.isIntersecting);
    });
  }, { threshold: 0.22 });
  runtime.observer.observe(target);
}

function ensureSwfAudioUnlockedByGesture() {
  if (!swfAudioUnlockArmed) return;
  swfAudioUnlockArmed = false;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  try {
    const ctx = new AudioCtx();
    void ctx.resume()
      .catch(() => null)
      .finally(() => {
        window.setTimeout(() => {
          if (typeof ctx.close === "function") {
            void ctx.close().catch(() => null);
          }
        }, 120);
      });
  } catch {
    // Ignore unlock bootstrap errors on restrictive browsers.
  }
}

function attachRufflePlayer(playerWrap, attachment, { autoplay = "on", runtimeKey = null } = {}) {
  if (runtimeKey) {
    const existing = swfRuntimes.get(runtimeKey);
    if (existing?.player instanceof HTMLElement && existing.host instanceof HTMLElement) {
      noteSwfRuntimeEvent(runtimeKey, "reused");
      attachExistingSwfRuntime(runtimeKey, playerWrap);
      refreshSwfRuntimeHealthUi(runtimeKey);
      return;
    }
  }
  const mediaUrl = resolveMediaUrl(attachment.url);
  const hasRuffle = Boolean(window.RufflePlayer?.newest);
  if (!hasRuffle) {
    playerWrap.style.display = "grid";
    playerWrap.style.placeItems = "center";
    playerWrap.style.color = "#a6aeb9";
    playerWrap.style.fontSize = "0.78rem";
    playerWrap.textContent = "Ruffle loading or unavailable. Falling back to file link.";
    addDebugLog("warn", "Ruffle runtime unavailable for SWF message", { url: mediaUrl, name: attachment.name || "" });
    return;
  }
  try {
    const ruffle = window.RufflePlayer.newest();
    const player = ruffle.createPlayer();
    if (runtimeKey) {
      player.addEventListener("pointerdown", () => {
        ensureSwfAudioUnlockedByGesture();
        grantSwfAudioClickFocus(runtimeKey);
        setSwfPlayback(runtimeKey, true, "user");
      });
    }
    if (runtimeKey) noteSwfRuntimeEvent(runtimeKey, "created");
    player.style.width = "100%";
    player.style.height = "100%";
    if (typeof player.ruffle === "function") {
      try {
        player.ruffle().config = {
          ...(player.ruffle().config || {}),
          scale: "showAll",
          forceScale: true,
          letterbox: "on",
          openUrlMode: "deny"
        };
      } catch {
        // Ignore config API failures and fall back to load options.
      }
    }
    if (runtimeKey) {
      player.addEventListener("loadedmetadata", () => {
        const metadata = getSwfRuntimeMetadata(runtimeKey);
        if (metadata) {
          applySwfMetadataSize(runtimeKey, playerWrap);
          addDebugLog("info", "SWF metadata loaded", { key: runtimeKey, metadata });
        }
      });
    }
    const bodyHosted = Boolean(runtimeKey && shouldUseAnchoredBodySwfRuntime(runtimeKey));
    let runtimeHost = playerWrap;
    if (bodyHosted) {
      runtimeHost = document.createElement("div");
      runtimeHost.className = "message-swf-player";
      runtimeHost.appendChild(player);
      document.body.appendChild(runtimeHost);
      playerWrap.innerHTML = "<div class=\"channel-empty\">Live SWF runtime active.</div>";
    } else {
      playerWrap.innerHTML = "";
      playerWrap.appendChild(player);
    }
    if (runtimeKey) {
      const existingRuntime = swfRuntimes.get(runtimeKey) || {};
      if (existingRuntime.host instanceof HTMLElement && existingRuntime.host !== runtimeHost) {
        existingRuntime.host.remove();
      }
      const activeGuildId = getActiveGuild()?.id || null;
      swfRuntimes.set(runtimeKey, {
        key: runtimeKey,
        attachment: { ...attachment },
        player,
        host: runtimeHost,
        originHost: playerWrap,
        anchorHost: bodyHosted ? playerWrap : null,
        bodyHosted,
        guildId: activeGuildId,
        playing: autoplay !== "off",
        allowAutoPlay: autoplay !== "off",
        manualPlay: false,
        autoPausedByMute: false,
        autoPausedByVisibility: existingRuntime.autoPausedByVisibility === true,
        observer: null,
        floating: false,
        restoreStyle: "",
        inPip: existingRuntime.inPip === true,
        pipHost: existingRuntime.pipHost || null,
        pipTransitioning: existingRuntime.pipTransitioning === true,
        pendingPip: existingRuntime.pendingPip === true,
        parked: existingRuntime.parked === true,
        keepAlive: existingRuntime.keepAlive === true,
        loading: true,
        audioEnabled: getPreferences().swfAudio === "on",
        audioVolume: getPreferences().swfVolume,
        audioSuppressed: false,
        audioPinned: false,
        audioClickAllowed: getPreferences().swfQuickAudioMode === "on",
        audioToggleEl: null,
        audioIndicatorEl: null,
        vuMeterFillEl: null,
        healthBadgeEl: null
      });
      refreshSwfRuntimeHealthUi(runtimeKey);
      requestSwfRuntimeLayoutSync();
    }
    const rawAttachmentUrl = (attachment?.url || "").toString().trim();
    const rawAttachmentName = (attachment?.name || "").toString().trim();
    const addUrlVariant = (target, candidate) => {
      const value = (candidate || "").toString().trim();
      if (!value) return;
      if (!target.includes(value)) target.push(value);
    };
    const buildSwfUrlCandidates = () => {
      const candidates = [];
      addUrlVariant(candidates, resolveMediaPlaybackUrl(mediaUrl, { kind: "swf" }));
      addUrlVariant(candidates, mediaUrl);
      try {
        addUrlVariant(candidates, decodeURI(mediaUrl));
      } catch {
        // ignore decode failures
      }
      if (rawAttachmentUrl) {
        const rawWithoutDotSlash = rawAttachmentUrl.replace(/^\.\//, "");
        addUrlVariant(candidates, rawAttachmentUrl);
        addUrlVariant(candidates, rawWithoutDotSlash);
        addUrlVariant(candidates, `./${rawWithoutDotSlash}`);
        addUrlVariant(candidates, `/${rawWithoutDotSlash.replace(/^\/+/, "")}`);
        if (!/^[a-z][a-z0-9+.-]*:/i.test(rawWithoutDotSlash) && !rawWithoutDotSlash.startsWith("swf/")) {
          addUrlVariant(candidates, `swf/${rawWithoutDotSlash.replace(/^\/+/, "")}`);
          addUrlVariant(candidates, `/swf/${rawWithoutDotSlash.replace(/^\/+/, "")}`);
        }
        if (rawWithoutDotSlash.startsWith("swf/")) {
          const stripped = rawWithoutDotSlash.slice(4);
          addUrlVariant(candidates, stripped);
          addUrlVariant(candidates, `/${stripped.replace(/^\/+/, "")}`);
        }
      }
      if (rawAttachmentName && rawAttachmentName.includes("/")) {
        const nameWithoutDotSlash = rawAttachmentName.replace(/^\.\//, "");
        addUrlVariant(candidates, nameWithoutDotSlash);
        addUrlVariant(candidates, `./${nameWithoutDotSlash}`);
        addUrlVariant(candidates, `/${nameWithoutDotSlash.replace(/^\/+/, "")}`);
        if (!nameWithoutDotSlash.startsWith("swf/")) {
          addUrlVariant(candidates, `swf/${nameWithoutDotSlash.replace(/^\/+/, "")}`);
          addUrlVariant(candidates, `/swf/${nameWithoutDotSlash.replace(/^\/+/, "")}`);
        }
      }
      const resolvedCandidates = [];
      candidates.forEach((candidate) => {
        addUrlVariant(resolvedCandidates, resolveMediaPlaybackUrl(candidate, { kind: "swf" }) || resolveMediaUrl(candidate) || candidate);
      });
      const withLocalhostFallbacks = [];
      const addLocalhostVariants = (value) => {
        addUrlVariant(withLocalhostFallbacks, value);
        try {
          const parsed = new URL(value);
          const host = (parsed.hostname || "").toLowerCase();
          if (!["localhost", "127.0.0.1"].includes(host)) return;
          if (parsed.protocol === "https:") {
            parsed.protocol = "http:";
            addUrlVariant(withLocalhostFallbacks, parsed.toString());
          } else if (parsed.protocol === "http:") {
            parsed.protocol = "https:";
            addUrlVariant(withLocalhostFallbacks, parsed.toString());
          }
          try {
            const current = new URL(window.location.href);
            const currentHost = (current.hostname || "").toLowerCase();
            if (["localhost", "127.0.0.1"].includes(currentHost)) {
              const remapped = new URL(value);
              remapped.protocol = current.protocol;
              remapped.hostname = current.hostname;
              remapped.port = current.port;
              addUrlVariant(withLocalhostFallbacks, remapped.toString());
            }
          } catch {
            // ignore current origin remap failures
          }
        } catch {
          // ignore URL parse failures
        }
      };
      resolvedCandidates.forEach(addLocalhostVariants);
      return withLocalhostFallbacks;
    };
    const urlCandidates = buildSwfUrlCandidates();
    const swfFileName = (attachment?.name || "").toString().trim();
    const resolveSwfBaseCandidate = (candidate) => {
      const value = (candidate || "").toString().trim();
      if (!value) return "./";
      try {
        const parsed = new URL(value, window.location.href);
        const pathname = (parsed.pathname || "/").toString();
        const slashIndex = pathname.lastIndexOf("/");
        parsed.pathname = slashIndex >= 0 ? pathname.slice(0, slashIndex + 1) : "/";
        parsed.search = "";
        parsed.hash = "";
        return parsed.toString();
      } catch {
        const stripped = value.split("#")[0].split("?")[0];
        const slashIndex = stripped.lastIndexOf("/");
        if (slashIndex < 0) return "./";
        return stripped.slice(0, slashIndex + 1);
      }
    };
    const canAttemptDataLoad = (candidate) => {
      if (!candidate) return false;
      if (/^data:/i.test(candidate)) return false;
      return !isExternalMediaUrl(candidate);
    };
    const tryDataLoad = async (candidate) => {
      if (!canAttemptDataLoad(candidate)) return false;
      try {
        const response = await fetch(candidate, { cache: "no-store" });
        if (!response.ok) return false;
        const buffer = await response.arrayBuffer();
        if (!buffer || buffer.byteLength === 0) return false;
        await Promise.resolve(player.load({
          data: buffer,
          swfFileName: swfFileName || undefined,
          base: resolveSwfBaseCandidate(candidate),
          autoplay,
          unmuteOverlay: "hidden",
          scale: "showAll",
          forceScale: true,
          letterbox: "on",
          openUrlMode: "deny"
        }));
        addDebugLog("info", "Ruffle loaded SWF via data payload", { url: candidate, name: swfFileName || "" });
        return true;
      } catch (error) {
        addDebugLog("warn", "Ruffle data payload load failed", { url: candidate, error: String(error) });
        return false;
      }
    };
    const loadWithFallback = async () => {
      const resolveLoadState = () => {
        const runtime = runtimeKey ? swfRuntimes.get(runtimeKey) : null;
        const host = runtime?.player === player && runtime.host instanceof HTMLElement
          ? runtime.host
          : playerWrap;
        const preserved = runtimeKey ? shouldPreserveSwfRuntime(runtimeKey, runtime) : false;
        return { runtime, host, preserved };
      };
      const destroyDetachedRuntime = () => {
        if (!runtimeKey) return false;
        const runtime = swfRuntimes.get(runtimeKey);
        if (!runtime || runtime.player !== player || !runtime.loading) return false;
        return destroySwfRuntime(runtimeKey, { reason: "load-detached", removeHost: true });
      };
      let loadState = resolveLoadState();
      let mounted = loadState.host instanceof HTMLElement
        && loadState.host.isConnected
        && (ui.messageList.isConnected || ui.swfViewerDialog.open || loadState.preserved);
      if (!mounted) {
        for (let attempt = 0; attempt < 10; attempt += 1) {
          await nextFrame();
          loadState = resolveLoadState();
          if (
            runtimeKey
            && loadState.runtime?.inPip
            && (!(loadState.host instanceof HTMLElement) || !loadState.host.isConnected)
          ) {
            recoverDetachedSwfPipHost(runtimeKey);
            loadState = resolveLoadState();
          }
          mounted = loadState.host instanceof HTMLElement
            && loadState.host.isConnected
            && (ui.messageList.isConnected || ui.swfViewerDialog.open || loadState.preserved);
          if (mounted) break;
        }
      }
      if (!mounted && !loadState.preserved) {
        addDebugLog("info", "Skipped SWF load because runtime never mounted", { url: mediaUrl });
        destroyDetachedRuntime();
        return;
      }
      if (!mounted && loadState.preserved) {
        if (runtimeKey && loadState.runtime) ensurePreservedSwfRuntimeHost(runtimeKey, loadState.runtime, "load-not-mounted");
        addDebugLog("warn", "Continuing SWF load while runtime is detached but preserved", { key: runtimeKey, url: mediaUrl });
      }
      let loaded = false;
      for (const candidate of urlCandidates) {
        let activeState = resolveLoadState();
        if (
          runtimeKey
          && activeState.runtime?.inPip
          && (!(activeState.host instanceof HTMLElement) || !activeState.host.isConnected)
        ) {
          recoverDetachedSwfPipHost(runtimeKey);
          activeState = resolveLoadState();
        }
        if (!(activeState.host instanceof HTMLElement) || !activeState.host.isConnected) {
          if (!activeState.preserved) {
            addDebugLog("info", "Aborted SWF load because runtime became detached", { url: candidate });
            destroyDetachedRuntime();
            return;
          }
          if (runtimeKey && activeState.runtime) ensurePreservedSwfRuntimeHost(runtimeKey, activeState.runtime, "load-detached");
          addDebugLog("info", "SWF runtime detached during load but preserved", { key: runtimeKey, url: candidate });
        }
        try {
          await Promise.resolve(player.load({
            url: candidate,
            autoplay,
            unmuteOverlay: "hidden",
            scale: "showAll",
            forceScale: true,
            letterbox: "on",
            openUrlMode: "deny"
          }));
          addDebugLog("info", "Ruffle loaded SWF via object payload", { url: candidate, name: attachment.name || "" });
          loaded = true;
          break;
        } catch (errorObjectMode) {
          addDebugLog("warn", "Ruffle object payload load failed", { url: candidate, error: String(errorObjectMode) });
          try {
            await Promise.resolve(player.load(candidate));
            addDebugLog("info", "Ruffle loaded SWF via string payload", { url: candidate, name: attachment.name || "" });
            loaded = true;
            break;
          } catch (errorStringMode) {
            addDebugLog("warn", "Ruffle string payload load failed", { url: candidate, error: String(errorStringMode) });
            const dataLoaded = await tryDataLoad(candidate);
            if (dataLoaded) {
              loaded = true;
              break;
            }
          }
        }
      }
      if (!loaded) {
        const failedState = resolveLoadState();
        const corsHint = isExternalMediaUrl(mediaUrl)
          ? " External host may be blocking CORS for this app origin."
          : "";
        const failureText = `Ruffle could not load this SWF.${corsHint} Open Debug Console for details.`;
        if (failedState.host instanceof HTMLElement && failedState.host.isConnected) {
          failedState.host.textContent = failureText;
        } else if (playerWrap instanceof HTMLElement && playerWrap.isConnected) {
          playerWrap.textContent = failureText;
        }
        if (runtimeKey) {
          const runtime = swfRuntimes.get(runtimeKey);
          if (runtime?.player === player) {
            runtime.loading = false;
            runtime.pendingPip = false;
          }
          if (!failedState.preserved) {
            destroySwfRuntime(runtimeKey, { reason: "load-failed", removeHost: false });
          } else {
            if (runtime) ensurePreservedSwfRuntimeHost(runtimeKey, runtime, "load-failed");
            addDebugLog("warn", "Preserved SWF runtime after load failure because runtime is pinned/parked", { key: runtimeKey });
          }
          refreshSwfRuntimeHealthUi(runtimeKey);
        }
        return;
      }
      if (runtimeKey) {
        const runtime = swfRuntimes.get(runtimeKey);
        if (!runtime || runtime.player !== player) return;
        runtime.attachment = { ...attachment };
        runtime.player = player;
        const activeHost = (runtime.bodyHosted ? ensureSwfRuntimeBodyHost(runtimeKey, runtime) : runtime.host) || playerWrap;
        if (activeHost instanceof HTMLElement && !activeHost.contains(player)) {
          activeHost.innerHTML = "";
          activeHost.appendChild(player);
        }
        runtime.host = activeHost;
        if (!runtime.inPip && !runtime.parked) {
          runtime.originHost = runtime.anchorHost instanceof HTMLElement ? runtime.anchorHost : activeHost;
        }
        runtime.guildId = getActiveGuild()?.id || runtime.guildId || null;
        runtime.playing = autoplay !== "off";
        runtime.allowAutoPlay = autoplay !== "off";
        runtime.loading = false;
        const shouldPromoteToPip = runtime.pendingPip === true;
        runtime.pendingPip = false;
        applyPendingSwfUiBindings(runtimeKey);
        const pendingAudio = swfPendingAudio.get(runtimeKey);
        if (pendingAudio) {
          if (typeof pendingAudio.enabled === "boolean") runtime.audioEnabled = pendingAudio.enabled;
          if (Number.isFinite(pendingAudio.volume)) runtime.audioVolume = pendingAudio.volume;
          if (typeof pendingAudio.pinned === "boolean") runtime.audioPinned = pendingAudio.pinned;
          swfPendingAudio.delete(runtimeKey);
        }
        refreshSwfAudioFocus();
        refreshSwfRuntimeHealthUi(runtimeKey);
        requestSwfRuntimeLayoutSync();
        if (!runtime.inPip && !runtime.parked) bindSwfVisibilityObserver(runtimeKey);
        if (shouldPromoteToPip) setSwfRuntimePip(runtimeKey, true);
      }
    };
    void loadWithFallback();
  } catch {
    addDebugLog("error", "Ruffle player creation failed", { url: mediaUrl, name: attachment.name || "" });
    playerWrap.textContent = "Ruffle failed to load this SWF.";
  }
}

function openSwfViewer(attachment, runtimeKey = null) {
  currentViewerSwf = { name: attachment.name || "SWF file", url: attachment.url };
  currentViewerRuntimeKey = runtimeKey;
  ui.swfViewerTitle.textContent = currentViewerSwf.name;
  ui.swfViewerZoomInput.value = "100";
  ui.swfViewerDialog.showModal();
  ui.swfViewerHost.innerHTML = "";
  ui.swfViewerHost.style.display = "block";
  const host = document.createElement("div");
  host.className = "message-swf-player";
  host.style.width = "960px";
  host.style.height = "70vh";
  host.style.transformOrigin = "top left";
  ui.swfViewerHost.appendChild(host);
  const runtime = runtimeKey ? swfRuntimes.get(runtimeKey) : null;
  if (runtime?.player instanceof HTMLElement && runtime.host instanceof HTMLElement) {
    runtime.floating = true;
    runtime.restoreStyle = runtime.host.getAttribute("style") || "";
    runtime.host.classList.add("message-swf-player--floating");
    positionFloatingSwfHost(runtime);
    ui.swfViewerHost.innerHTML = "<div class=\"channel-empty\">Using the live running SWF instance.</div>";
    setSwfPlayback(runtimeKey, true, "user");
  } else {
    attachRufflePlayer(host, currentViewerSwf, { autoplay: "on", runtimeKey });
  }
  host.style.transform = "scale(1)";
}

function applySwfViewerZoom() {
  const floatingRuntime = currentViewerRuntimeKey ? swfRuntimes.get(currentViewerRuntimeKey) : null;
  const host = floatingRuntime?.floating
    ? floatingRuntime.host
    : ui.swfViewerHost.firstElementChild;
  if (!(host instanceof HTMLElement)) return;
  const zoomPercent = Math.max(50, Math.min(200, Number(ui.swfViewerZoomInput.value) || 100));
  const factor = zoomPercent / 100;
  if (floatingRuntime?.floating) {
    host.dataset.zoom = String(factor);
    applyFloatingTransform(floatingRuntime);
  } else {
    host.style.transform = `scale(${factor})`;
    host.style.transformOrigin = "top left";
  }
}

function applyFloatingTransform(runtime) {
  if (!runtime?.host) return;
  const factor = Number(runtime.host.dataset.zoom || "1");
  runtime.host.style.transform = `scale(${factor})`;
  runtime.host.style.transformOrigin = "top left";
}

function positionFloatingSwfHost(runtime) {
  if (!runtime?.host || !ui.swfViewerDialog.open) return;
  const rect = ui.swfViewerHost.getBoundingClientRect();
  runtime.host.style.left = `${Math.max(8, rect.left)}px`;
  runtime.host.style.top = `${Math.max(8, rect.top)}px`;
  runtime.host.style.width = `${Math.max(280, rect.width)}px`;
  runtime.host.style.height = `${Math.max(220, rect.height)}px`;
  applyFloatingTransform(runtime);
}

function closeSwfViewerAndRestore() {
  const runtimeKey = currentViewerRuntimeKey;
  currentViewerRuntimeKey = null;
  const runtime = runtimeKey ? swfRuntimes.get(runtimeKey) : null;
  if (runtime?.player instanceof HTMLElement) {
    if (runtime.floating && runtime.host instanceof HTMLElement) {
      runtime.host.classList.remove("message-swf-player--floating");
      runtime.host.setAttribute("style", runtime.restoreStyle || "");
      delete runtime.host.dataset.zoom;
      runtime.floating = false;
    } else if (runtime.originHost?.isConnected && runtime.host instanceof HTMLElement && runtime.host !== runtime.originHost) {
      runtime.originHost.replaceWith(runtime.host);
      runtime.originHost = runtime.host;
    }
    if (runtimeKey) bindSwfVisibilityObserver(runtimeKey);
    requestSwfRuntimeLayoutSync();
  }
  if (ui.swfViewerDialog.open) ui.swfViewerDialog.close();
}
