/*
 * Attachment rendering runtime extracted from app.js.
 * Centralizes XEP-0066/0071/0231 media presentation helpers.
 */

function clampPdfZoom(value) {
  return Math.max(0.45, Math.min(3.25, Number(value) || 1));
}

function createPdfPreviewElement(sourceUrl, attachmentName = "PDF") {
  const pdfUrl = resolveMediaUrl(sourceUrl);
  const shell = document.createElement("div");
  shell.className = "message-pdf-viewer";
  const controls = document.createElement("div");
  controls.className = "message-pdf-controls";
  const prevBtn = document.createElement("button");
  prevBtn.type = "button";
  prevBtn.textContent = "←";
  prevBtn.title = "Previous page";
  const nextBtn = document.createElement("button");
  nextBtn.type = "button";
  nextBtn.textContent = "→";
  nextBtn.title = "Next page";
  const pageLabel = document.createElement("span");
  pageLabel.className = "message-pdf-controls__page";
  pageLabel.textContent = "Page 0 / 0";
  const zoomOutBtn = document.createElement("button");
  zoomOutBtn.type = "button";
  zoomOutBtn.textContent = "−";
  zoomOutBtn.title = "Zoom out";
  const zoomFitBtn = document.createElement("button");
  zoomFitBtn.type = "button";
  zoomFitBtn.textContent = "Fit";
  zoomFitBtn.title = "Fit width";
  const zoomInBtn = document.createElement("button");
  zoomInBtn.type = "button";
  zoomInBtn.textContent = "+";
  zoomInBtn.title = "Zoom in";
  controls.appendChild(prevBtn);
  controls.appendChild(nextBtn);
  controls.appendChild(pageLabel);
  controls.appendChild(zoomOutBtn);
  controls.appendChild(zoomFitBtn);
  controls.appendChild(zoomInBtn);
  shell.appendChild(controls);

  const viewport = document.createElement("div");
  viewport.className = "message-pdf-viewport";
  const canvas = document.createElement("canvas");
  canvas.className = "message-pdf-canvas";
  canvas.setAttribute("role", "img");
  canvas.setAttribute("aria-label", `${attachmentName} preview`);
  const status = document.createElement("div");
  status.className = "message-pdf-status";
  status.textContent = "Loading PDF preview…";
  viewport.appendChild(canvas);
  viewport.appendChild(status);
  shell.appendChild(viewport);

  const state = {
    document: null,
    page: 1,
    zoom: 1,
    fitWidth: true,
    renderingToken: 0,
    rendering: false
  };

  const setStatus = (text = "", { tone = "info" } = {}) => {
    const hasText = Boolean((text || "").trim());
    status.textContent = text;
    status.hidden = !hasText;
    status.dataset.tone = tone;
  };

  const updateControls = () => {
    const pages = state.document?.numPages || 0;
    pageLabel.textContent = pages > 0 ? `Page ${state.page} / ${pages}` : "Page 0 / 0";
    prevBtn.disabled = !state.document || state.page <= 1 || state.rendering;
    nextBtn.disabled = !state.document || state.page >= pages || state.rendering;
    zoomOutBtn.disabled = !state.document || state.rendering;
    zoomInBtn.disabled = !state.document || state.rendering;
    zoomFitBtn.disabled = !state.document || state.rendering;
    zoomFitBtn.classList.toggle("is-active", Boolean(state.fitWidth));
  };

  const currentScaleForViewport = (baseViewport) => {
    if (!state.fitWidth || !Number.isFinite(baseViewport?.width) || baseViewport.width <= 0) {
      return clampPdfZoom(state.zoom);
    }
    const available = Math.max(220, viewport.clientWidth - 18);
    return clampPdfZoom(available / baseViewport.width);
  };

  const renderCurrentPage = async () => {
    const doc = state.document;
    if (!doc) return;
    const page = Math.max(1, Math.min(doc.numPages, state.page));
    state.page = page;
    state.rendering = true;
    const token = ++state.renderingToken;
    updateControls();
    setStatus("Rendering page…");
    try {
      const pageProxy = await doc.getPage(page);
      if (token !== state.renderingToken) return;
      const baseViewport = pageProxy.getViewport({ scale: 1 });
      const targetScale = currentScaleForViewport(baseViewport);
      if (!state.fitWidth) state.zoom = targetScale;
      const targetViewport = pageProxy.getViewport({ scale: targetScale });
      const ratio = Math.max(1, window.devicePixelRatio || 1);
      canvas.width = Math.max(1, Math.floor(targetViewport.width * ratio));
      canvas.height = Math.max(1, Math.floor(targetViewport.height * ratio));
      canvas.style.width = `${Math.max(1, Math.floor(targetViewport.width))}px`;
      canvas.style.height = `${Math.max(1, Math.floor(targetViewport.height))}px`;
      const context = canvas.getContext("2d", { alpha: false });
      if (!context) throw new Error("Canvas context unavailable");
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, targetViewport.width, targetViewport.height);
      const renderTask = pageProxy.render({
        canvasContext: context,
        viewport: targetViewport
      });
      await renderTask.promise;
      if (token !== state.renderingToken) return;
      setStatus("");
    } catch (error) {
      if (token !== state.renderingToken) return;
      setStatus("Could not render this PDF page.", { tone: "error" });
      addDebugLog("warn", "PDF page render failed", { url: pdfUrl, error: String(error) });
    } finally {
      if (token === state.renderingToken) {
        state.rendering = false;
        updateControls();
      }
    }
  };

  const queueRender = () => {
    void renderCurrentPage();
  };

  prevBtn.addEventListener("click", () => {
    if (!state.document || state.page <= 1) return;
    state.page -= 1;
    queueRender();
  });
  nextBtn.addEventListener("click", () => {
    if (!state.document || state.page >= state.document.numPages) return;
    state.page += 1;
    queueRender();
  });
  zoomOutBtn.addEventListener("click", () => {
    state.fitWidth = false;
    state.zoom = clampPdfZoom(state.zoom / 1.12);
    queueRender();
  });
  zoomInBtn.addEventListener("click", () => {
    state.fitWidth = false;
    state.zoom = clampPdfZoom(state.zoom * 1.12);
    queueRender();
  });
  zoomFitBtn.addEventListener("click", () => {
    state.fitWidth = true;
    queueRender();
  });

  void ensurePdfRuntimeLoaded()
    .then(async (pdfjs) => {
      if (!pdfjs?.getDocument) {
        setStatus("Custom PDF renderer unavailable. Use open/download.", { tone: "error" });
        updateControls();
        return;
      }
      setStatus("Loading PDF document…");
      updateControls();
      const loadTask = pdfjs.getDocument({
        url: pdfUrl,
        disableWorker: true,
        isEvalSupported: false,
        withCredentials: false
      });
      const documentProxy = await loadTask.promise;
      state.document = documentProxy;
      state.page = 1;
      state.zoom = 1;
      state.fitWidth = true;
      updateControls();
      await renderCurrentPage();
    })
    .catch((error) => {
      setStatus("Could not load PDF preview.", { tone: "error" });
      updateControls();
      addDebugLog("warn", "PDF document load failed", { url: pdfUrl, error: String(error) });
    });

  updateControls();
  return shell;
}

function createVideoPreviewElement(sourceUrl, attachmentName = "Video", wrap = null, options = {}) {
  const opts = options && typeof options === "object" ? options : {};
  const animatedLoop = Boolean(opts.animatedLoop);
  const preferDirect = Boolean(opts.preferDirect);
  const cleanedSourceUrl = resolveMediaUrl(sourceUrl);
  const proxyCandidate = preferDirect ? "" : resolveMediaPlaybackUrl(cleanedSourceUrl, { kind: "video" });
  const candidates = [];
  if (proxyCandidate) candidates.push(proxyCandidate);
  if (cleanedSourceUrl && !candidates.includes(cleanedSourceUrl)) candidates.push(cleanedSourceUrl);
  if (candidates.length === 0) candidates.push(cleanedSourceUrl || sourceUrl || "");
  const preferNativeControls = document.body?.dataset?.platform === "android" || document.body?.dataset?.mobile === "on";
  const video = document.createElement("video");
  video.autoplay = animatedLoop;
  video.loop = animatedLoop;
  video.muted = animatedLoop;
  video.dataset.forceMuted = animatedLoop ? "1" : "0";
  video.controls = Boolean(preferNativeControls);
  video.playsInline = true;
  video.preload = "metadata";
  let candidateIndex = 0;
  let noteEl = null;
  const applyCandidate = () => {
    const candidateUrl = candidates[candidateIndex] || "";
    const source = document.createElement("source");
    source.src = candidateUrl;
    const mime = inferVideoMimeType(candidateUrl) || inferVideoMimeType(attachmentName || "");
    if (mime) source.type = mime;
    video.innerHTML = "";
    video.appendChild(source);
    video.src = candidateUrl;
    video.load();
    if (noteEl) {
      noteEl.remove();
      noteEl = null;
    }
    if (candidateIndex > 0 && wrap) {
      noteEl = document.createElement("div");
      noteEl.className = "message-embed-note";
      noteEl.textContent = "Using direct stream fallback for this video.";
      wrap.appendChild(noteEl);
    }
  };
  applyCandidate();
  if (!animatedLoop) {
    if (!preferNativeControls) {
      video.addEventListener("click", () => {
        if (video.paused || video.ended) {
          void video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    }
  }
  video.addEventListener("error", () => {
    if (candidateIndex + 1 < candidates.length) {
      candidateIndex += 1;
      applyCandidate();
      return;
    }
    if (wrap) {
      if (wrap.querySelector(".message-embed-note")) return;
      const note = document.createElement("div");
      note.className = "message-embed-note";
      note.textContent = "Video preview unavailable. Use open in new tab.";
      wrap.appendChild(note);
    }
  });
  applyMediaElementAudioPreferences(video, getPreferences());
  return video;
}

function formatVideoTimeLabel(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

const videoAttachmentHoverBindingByElement = new WeakMap();

function bindAttachmentPlayerHoverClass(wrap, player, hoverClass = "message-attachment--player-hover") {
  if (!(wrap instanceof HTMLElement) || !(player instanceof HTMLMediaElement)) return;
  let binding = videoAttachmentHoverBindingByElement.get(player);
  if (!binding) {
    binding = {
      wrap: null,
      onEnter: null,
      onLeave: null,
      onWrapLeave: null,
      hoverClass
    };
    binding.onEnter = () => {
      if (!(binding.wrap instanceof HTMLElement) || !binding.wrap.isConnected) return;
      binding.wrap.classList.add(binding.hoverClass);
    };
    binding.onLeave = () => {
      if (!(binding.wrap instanceof HTMLElement)) return;
      binding.wrap.classList.remove(binding.hoverClass);
    };
    binding.onWrapLeave = () => {
      if (!(binding.wrap instanceof HTMLElement)) return;
      binding.wrap.classList.remove(binding.hoverClass);
    };
    player.addEventListener("pointerenter", binding.onEnter);
    player.addEventListener("pointerleave", binding.onLeave);
    player.addEventListener("mouseenter", binding.onEnter);
    player.addEventListener("mouseleave", binding.onLeave);
    videoAttachmentHoverBindingByElement.set(player, binding);
  }
  if (binding.wrap instanceof HTMLElement && binding.wrap !== wrap) {
    binding.wrap.classList.remove(binding.hoverClass);
    binding.wrap.removeEventListener("mouseleave", binding.onWrapLeave);
  }
  binding.wrap = wrap;
  binding.hoverClass = hoverClass;
  wrap.addEventListener("mouseleave", binding.onWrapLeave);
}

function createVideoControlStrip(video, { label = "Video", runtimeKey = "" } = {}) {
  if (!(video instanceof HTMLVideoElement)) return null;
  const row = document.createElement("div");
  row.className = "message-video-controls";
  const playBtn = document.createElement("button");
  playBtn.type = "button";
  playBtn.textContent = "▶";
  playBtn.title = "Play/Pause";
  const backBtn = document.createElement("button");
  backBtn.type = "button";
  backBtn.textContent = "↺10";
  backBtn.title = "Seek back 10s";
  const forwardBtn = document.createElement("button");
  forwardBtn.type = "button";
  forwardBtn.textContent = "10↻";
  forwardBtn.title = "Seek forward 10s";
  const seek = document.createElement("input");
  seek.type = "range";
  seek.min = "0";
  seek.max = "1000";
  seek.step = "1";
  seek.value = "0";
  seek.className = "message-video-controls__seek";
  seek.title = "Seek";
  const muteBtn = document.createElement("button");
  muteBtn.type = "button";
  muteBtn.textContent = "🔊";
  muteBtn.title = "Mute/Unmute";
  const volume = document.createElement("input");
  volume.type = "range";
  volume.min = "0";
  volume.max = "100";
  volume.step = "1";
  volume.value = "100";
  volume.className = "message-video-controls__volume";
  volume.title = "Volume";
  const speed = document.createElement("select");
  speed.className = "message-video-controls__speed";
  [0.5, 0.75, 1, 1.25, 1.5, 2].forEach((rate) => {
    const option = document.createElement("option");
    option.value = String(rate);
    option.textContent = `${rate}x`;
    if (rate === 1) option.selected = true;
    speed.appendChild(option);
  });
  speed.title = "Playback speed";
  const time = document.createElement("span");
  time.className = "message-video-controls__time";
  time.textContent = "0:00 / 0:00";
  const pipBtn = document.createElement("button");
  pipBtn.type = "button";
  pipBtn.textContent = "Dock";
  pipBtn.title = "In-client PiP";
  if (!runtimeKey) {
    pipBtn.disabled = true;
    pipBtn.title = "In-client PiP unavailable here";
  }
  const nativePipBtn = document.createElement("button");
  nativePipBtn.type = "button";
  nativePipBtn.textContent = "PiP";
  nativePipBtn.title = "Native Picture-in-Picture";
  const canNativePip = Boolean(
    document.pictureInPictureEnabled
    && typeof video.requestPictureInPicture === "function"
  );
  if (!canNativePip) {
    nativePipBtn.disabled = true;
    nativePipBtn.title = "Native Picture-in-Picture unavailable";
  }
  const fullscreenBtn = document.createElement("button");
  fullscreenBtn.type = "button";
  fullscreenBtn.textContent = "⛶";
  fullscreenBtn.title = "Fullscreen";
  const preview = document.createElement("div");
  preview.className = "message-video-seek-preview";
  preview.hidden = true;
  const previewCanvas = document.createElement("canvas");
  previewCanvas.width = 160;
  previewCanvas.height = 90;
  previewCanvas.className = "message-video-seek-preview__canvas";
  previewCanvas.hidden = true;
  const previewTime = document.createElement("span");
  previewTime.className = "message-video-seek-preview__time";
  previewTime.textContent = "0:00";
  preview.appendChild(previewCanvas);
  preview.appendChild(previewTime);
  let seeking = false;
  let seekStartTime = 0;
  let seekWasPlaying = false;
  let previewVideo = null;
  let previewDisabled = false;
  let previewToken = 0;
  let seekPointerActive = false;
  let previewRaf = 0;
  let previewLastTime = Number.NaN;
  let previewSeekQueuedTime = Number.NaN;
  let previewSeekInFlight = false;

  const seekTargetTime = () => {
    const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0;
    if (duration <= 0) return 0;
    const ratio = Math.max(0, Math.min(1, Number(seek.value) / 1000));
    return ratio * duration;
  };

  const positionSeekPreview = () => {
    const ratio = Math.max(0, Math.min(1, Number(seek.value) / 1000));
    const usable = Math.max(0, seek.clientWidth - 10);
    const x = seek.offsetLeft + 5 + usable * ratio;
    preview.style.left = `${Math.round(x)}px`;
  };

  const sourceForPreview = () => {
    const explicit = (video.currentSrc || "").toString().trim();
    if (explicit) return explicit;
    const source = video.querySelector("source");
    const candidate = (source?.src || video.src || "").toString().trim();
    return candidate;
  };

  const ensurePreviewVideo = () => {
    if (previewDisabled) return null;
    if (previewVideo instanceof HTMLVideoElement) return previewVideo;
    const src = sourceForPreview();
    if (!src) {
      previewDisabled = true;
      return null;
    }
    const node = document.createElement("video");
    node.preload = "metadata";
    node.muted = true;
    node.playsInline = true;
    node.src = src;
    node.addEventListener("error", () => {
      previewDisabled = true;
      previewCanvas.hidden = true;
    });
    node.addEventListener("seeked", () => {
      previewSeekInFlight = false;
      if (previewDisabled) return;
      if (!Number.isFinite(node.videoWidth) || !Number.isFinite(node.videoHeight) || node.videoWidth <= 1 || node.videoHeight <= 1) return;
      try {
        const context = previewCanvas.getContext("2d");
        if (!context) return;
        context.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        context.drawImage(node, 0, 0, previewCanvas.width, previewCanvas.height);
        previewCanvas.hidden = false;
      } catch {
        previewDisabled = true;
        previewCanvas.hidden = true;
      } finally {
        if (Number.isFinite(previewSeekQueuedTime)) {
          const nextTarget = previewSeekQueuedTime;
          previewSeekQueuedTime = Number.NaN;
          queueSeekPreviewNode(nextTarget);
        }
      }
    });
    previewVideo = node;
    return previewVideo;
  };

  const queueSeekPreviewNode = (targetSeconds) => {
    const node = ensurePreviewVideo();
    if (!(node instanceof HTMLVideoElement) || previewDisabled) return;
    if (previewSeekInFlight) {
      previewSeekQueuedTime = targetSeconds;
      return;
    }
    previewSeekInFlight = true;
    try {
      node.currentTime = targetSeconds;
    } catch {
      previewSeekInFlight = false;
      previewDisabled = true;
      previewCanvas.hidden = true;
    }
  };

  const requestSeekPreviewFrame = (timeSeconds) => {
    if (!Number.isFinite(timeSeconds)) return;
    previewTime.textContent = formatVideoTimeLabel(timeSeconds);
    positionSeekPreview();
    if (previewDisabled) return;
    const node = ensurePreviewVideo();
    if (!(node instanceof HTMLVideoElement)) return;
    const duration = Number.isFinite(video.duration) && video.duration > 0
      ? video.duration
      : (Number.isFinite(node.duration) && node.duration > 0 ? node.duration : 0);
    const safeTarget = duration > 0
      ? Math.max(0, Math.min(Math.max(0, duration - 0.05), timeSeconds))
      : Math.max(0, timeSeconds);
    const token = ++previewToken;
    const seekPreviewNode = () => {
      if (token !== previewToken) return;
      queueSeekPreviewNode(safeTarget);
    };
    if (Number.isFinite(node.duration) && node.duration > 0) {
      seekPreviewNode();
      return;
    }
    node.addEventListener("loadedmetadata", seekPreviewNode, { once: true });
    if (node.readyState < 1) node.load();
  };

  const stopSeekPreviewLoop = () => {
    if (!previewRaf) return;
    cancelAnimationFrame(previewRaf);
    previewRaf = 0;
    previewLastTime = Number.NaN;
  };

  const seekPreviewLoopStep = () => {
    previewRaf = 0;
    if (!seeking || !seekPointerActive) return;
    const target = seekTargetTime();
    if (!Number.isFinite(previewLastTime) || Math.abs(target - previewLastTime) >= 0.03) {
      previewLastTime = target;
      requestSeekPreviewFrame(target);
    }
    previewRaf = requestAnimationFrame(seekPreviewLoopStep);
  };

  const startSeekPreviewLoop = () => {
    if (previewRaf) return;
    previewRaf = requestAnimationFrame(seekPreviewLoopStep);
  };

  const beginSeek = ({ showPreview = false } = {}) => {
    if (seeking) return;
    seeking = true;
    seekStartTime = Number.isFinite(video.currentTime) ? video.currentTime : 0;
    seekWasPlaying = !video.paused && !video.ended;
    if (seekWasPlaying) video.pause();
    preview.hidden = !showPreview;
    if (showPreview) {
      requestSeekPreviewFrame(seekTargetTime());
      startSeekPreviewLoop();
    } else {
      stopSeekPreviewLoop();
    }
  };

  const finishSeek = ({ cancel = false } = {}) => {
    if (!seeking) return;
    const nextTime = cancel ? seekStartTime : seekTargetTime();
    if (Number.isFinite(nextTime)) video.currentTime = Math.max(0, nextTime);
    seeking = false;
    stopSeekPreviewLoop();
    preview.hidden = true;
    if (!cancel && seekWasPlaying) {
      void video.play().catch(() => {});
    }
    seekWasPlaying = false;
    sync();
  };

  const sync = () => {
    const preferNativeControls = document.body?.dataset?.platform === "android" || document.body?.dataset?.mobile === "on";
    applyMediaElementAudioPreferences(video, getPreferences());
    playBtn.classList.toggle("is-active", !video.paused && !video.ended);
    playBtn.textContent = video.paused || video.ended ? "▶" : "⏸";
    muteBtn.textContent = video.muted || video.volume <= 0 ? "🔇" : "🔊";
    volume.value = String(Math.round((video.muted ? 0 : video.volume) * 100));
    const rate = Number(video.playbackRate || 1);
    const hasRate = [...speed.options].some((option) => Number(option.value) === rate);
    if (!hasRate) {
      const option = document.createElement("option");
      option.value = String(rate);
      option.textContent = `${rate}x`;
      speed.appendChild(option);
    }
    speed.value = String(rate);
    const hasDuration = Number.isFinite(video.duration) && video.duration > 0;
    const currentTime = Number.isFinite(video.currentTime) ? video.currentTime : 0;
    if (hasDuration && !seeking) {
      const ratio = Math.max(0, Math.min(1, currentTime / video.duration));
      seek.value = String(Math.round(ratio * 1000));
    }
    seek.disabled = !hasDuration;
    const shownCurrent = seeking && hasDuration
      ? (Number(seek.value) / 1000) * video.duration
      : currentTime;
    time.textContent = `${formatVideoTimeLabel(shownCurrent)} / ${formatVideoTimeLabel(video.duration)}`;
    const runtime = runtimeKey ? videoPipRuntimes.get(runtimeKey) : null;
    pipBtn.classList.toggle("is-active", Boolean(runtime?.inPip && videoPipActiveKey === runtimeKey));
    const nativePipActive = document.pictureInPictureElement === video;
    const dockPipActive = Boolean(runtime?.inPip && videoPipActiveKey === runtimeKey);
    nativePipBtn.classList.toggle("is-active", nativePipActive);
    if (canNativePip) {
      nativePipBtn.title = nativePipActive ? "Exit native Picture-in-Picture" : "Native Picture-in-Picture";
    }
    const shouldUseNativeControls = preferNativeControls || nativePipActive || dockPipActive;
    if (video.controls !== shouldUseNativeControls) {
      video.controls = shouldUseNativeControls;
    }
    fullscreenBtn.classList.toggle("is-active", document.fullscreenElement === video);
  };

  playBtn.addEventListener("click", () => {
    if (video.paused || video.ended) {
      void video.play().catch(() => {});
    } else {
      video.pause();
    }
  });
  backBtn.addEventListener("click", () => {
    const next = Math.max(0, (Number.isFinite(video.currentTime) ? video.currentTime : 0) - 10);
    video.currentTime = next;
    sync();
  });
  forwardBtn.addEventListener("click", () => {
    const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : Number.POSITIVE_INFINITY;
    const next = Math.min(duration, (Number.isFinite(video.currentTime) ? video.currentTime : 0) + 10);
    video.currentTime = Number.isFinite(next) ? next : video.currentTime;
    sync();
  });
  seek.addEventListener("input", () => {
    beginSeek({ showPreview: seekPointerActive });
    if (seekPointerActive) {
      preview.hidden = false;
      requestSeekPreviewFrame(seekTargetTime());
      startSeekPreviewLoop();
    } else {
      preview.hidden = true;
      stopSeekPreviewLoop();
    }
    sync();
  });
  seek.addEventListener("change", () => {
    finishSeek({ cancel: false });
  });
  seek.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !seeking) return;
    event.preventDefault();
    finishSeek({ cancel: true });
  });
  seek.addEventListener("blur", () => {
    if (!seeking) return;
    seekPointerActive = false;
    stopSeekPreviewLoop();
    finishSeek({ cancel: false });
  });
  seek.addEventListener("pointerdown", (event) => {
    seekPointerActive = true;
    try {
      seek.setPointerCapture(event.pointerId);
    } catch {
      // Ignore unsupported pointer capture.
    }
    if (seeking) {
      preview.hidden = false;
      requestSeekPreviewFrame(seekTargetTime());
      startSeekPreviewLoop();
    }
  });
  const clearSeekPointer = (event) => {
    if (event && "pointerId" in event) {
      try {
        seek.releasePointerCapture(event.pointerId);
      } catch {
        // Ignore unsupported pointer capture release.
      }
    }
    seekPointerActive = false;
    stopSeekPreviewLoop();
    if (seeking) preview.hidden = true;
  };
  seek.addEventListener("pointerup", clearSeekPointer);
  seek.addEventListener("pointercancel", clearSeekPointer);
  muteBtn.addEventListener("click", () => {
    video.muted = !video.muted;
    if (!video.muted && video.volume <= 0) video.volume = 0.5;
    sync();
  });
  volume.addEventListener("input", () => {
    const next = Math.max(0, Math.min(100, Number(volume.value))) / 100;
    video.muted = next === 0;
    video.volume = next;
    sync();
  });
  speed.addEventListener("change", () => {
    const next = Number(speed.value);
    if (!Number.isFinite(next) || next <= 0) return;
    video.playbackRate = next;
    sync();
  });
  pipBtn.addEventListener("click", () => {
    if (!runtimeKey) return;
    const runtime = videoPipRuntimes.get(runtimeKey);
    if (!runtime) return;
    const ok = setVideoRuntimePip(runtimeKey, !runtime.inPip);
    if (!ok) {
      addDebugLog("warn", "Video in-client PiP toggle failed", { label, key: runtimeKey });
    }
    sync();
  });
  nativePipBtn.addEventListener("click", async () => {
    if (!canNativePip) return;
    try {
      if (document.pictureInPictureElement === video) {
        if (typeof document.exitPictureInPicture === "function") {
          await document.exitPictureInPicture();
        }
      } else {
        if (document.pictureInPictureElement && typeof document.exitPictureInPicture === "function") {
          await document.exitPictureInPicture();
        }
        await video.requestPictureInPicture();
      }
    } catch (error) {
      addDebugLog("warn", "Native video PiP toggle failed", { label, key: runtimeKey || "", error: String(error) });
    } finally {
      sync();
    }
  });
  fullscreenBtn.addEventListener("click", async () => {
    try {
      if (document.fullscreenElement === video && document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (typeof video.requestFullscreen === "function") {
        await video.requestFullscreen();
      }
    } catch (error) {
      addDebugLog("warn", "Video fullscreen toggle failed", { label, error: String(error) });
    } finally {
      sync();
    }
  });

  ["play", "pause", "ended", "volumechange", "ratechange", "timeupdate", "loadedmetadata", "enterpictureinpicture", "leavepictureinpicture", "fullscreenchange"]
    .forEach((eventName) => video.addEventListener(eventName, sync));
  seek.addEventListener("pointermove", () => {
    if (!seeking || !seekPointerActive) return;
    requestSeekPreviewFrame(seekTargetTime());
    startSeekPreviewLoop();
  });
  sync();
  row.__sync = sync;

  row.appendChild(playBtn);
  row.appendChild(backBtn);
  row.appendChild(forwardBtn);
  row.appendChild(seek);
  row.appendChild(time);
  row.appendChild(muteBtn);
  row.appendChild(volume);
  row.appendChild(speed);
  row.appendChild(pipBtn);
  row.appendChild(nativePipBtn);
  row.appendChild(fullscreenBtn);
  row.appendChild(preview);
  return row;
}

function ensureMobileVideoPlayOverlay(video, container) {
  if (!(video instanceof HTMLVideoElement)) return;
  if (!(container instanceof HTMLElement)) return;
  if (document.body?.dataset?.mobile !== "on" && document.body?.dataset?.platform !== "android") return;
  if (video.controls) return;
  if (container.querySelector(".video-play-overlay")) return;
  container.classList.add("message-video-mount--overlay");
  const overlay = document.createElement("button");
  overlay.type = "button";
  overlay.className = "video-play-overlay";
  overlay.textContent = "▶";
  overlay.title = "Play video";
  const sync = () => {
    overlay.hidden = !video.paused && !video.ended;
  };
  overlay.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    void video.play().catch(() => {
      showToast("Tap play in native controls to start this video.", { tone: "warn" });
    });
    sync();
  });
  ["play", "pause", "ended", "loadeddata"].forEach((eventName) => {
    video.addEventListener(eventName, sync);
  });
  sync();
  container.appendChild(overlay);
}

function createGifControlStrip(video, { label = "GIF", mediaUrl = "" } = {}) {
  if (!(video instanceof HTMLVideoElement)) return null;
  const row = document.createElement("div");
  row.className = "message-gif-controls";
  const playBtn = document.createElement("button");
  playBtn.type = "button";
  playBtn.title = "Pause/Resume";
  const backFrameBtn = document.createElement("button");
  backFrameBtn.type = "button";
  backFrameBtn.textContent = "←F";
  backFrameBtn.title = "Step one frame backward";
  const nextFrameBtn = document.createElement("button");
  nextFrameBtn.type = "button";
  nextFrameBtn.textContent = "F→";
  nextFrameBtn.title = "Step one frame forward";
  const resetBtn = document.createElement("button");
  resetBtn.type = "button";
  resetBtn.textContent = "↺";
  resetBtn.title = "Reset to start";
  const loopModeBtn = document.createElement("button");
  loopModeBtn.type = "button";
  loopModeBtn.title = "Toggle play mode";
  const openBtn = document.createElement("button");
  openBtn.type = "button";
  openBtn.textContent = "↗";
  openBtn.title = "Open GIF URL";
  const frameStepSeconds = () => {
    const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0;
    if (duration <= 0) return 1 / 30;
    return Math.max(1 / 120, Math.min(1 / 12, duration / 300));
  };
  const clampSeek = (value) => {
    const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0;
    if (duration <= 0) return Math.max(0, value);
    return Math.max(0, Math.min(Math.max(0, duration - 0.01), value));
  };
  const sync = () => {
    const playing = !video.paused && !video.ended;
    playBtn.textContent = playing ? "⏸" : "▶";
    playBtn.classList.toggle("is-active", playing);
    const loopEnabled = video.loop !== false;
    loopModeBtn.textContent = loopEnabled ? "∞" : "1×";
    loopModeBtn.classList.toggle("is-active", loopEnabled);
    loopModeBtn.title = loopEnabled ? "Play mode: infinite loop" : "Play mode: once";
  };
  playBtn.addEventListener("click", () => {
    if (video.paused || video.ended) {
      void video.play().catch(() => {});
    } else {
      video.pause();
    }
    sync();
  });
  backFrameBtn.addEventListener("click", () => {
    video.pause();
    video.currentTime = clampSeek((Number.isFinite(video.currentTime) ? video.currentTime : 0) - frameStepSeconds());
    sync();
  });
  nextFrameBtn.addEventListener("click", () => {
    video.pause();
    video.currentTime = clampSeek((Number.isFinite(video.currentTime) ? video.currentTime : 0) + frameStepSeconds());
    sync();
  });
  resetBtn.addEventListener("click", () => {
    video.pause();
    video.currentTime = 0;
    sync();
  });
  loopModeBtn.addEventListener("click", () => {
    video.loop = !video.loop;
    sync();
  });
  openBtn.addEventListener("click", () => {
    openExternalUrlInClient(mediaUrl || video.currentSrc || video.src || "");
  });
  ["play", "pause", "ended", "loadedmetadata", "ratechange"].forEach((eventName) => {
    video.addEventListener(eventName, sync);
  });
  row.appendChild(playBtn);
  row.appendChild(backFrameBtn);
  row.appendChild(nextFrameBtn);
  row.appendChild(resetBtn);
  row.appendChild(loopModeBtn);
  row.appendChild(openBtn);
  row.__sync = sync;
  sync();
  return row;
}

function createDotLottieControlStrip(player, { label = "Sticker", mediaUrl = "" } = {}) {
  if (!(player instanceof HTMLElement)) return null;
  const row = document.createElement("div");
  row.className = "message-lottie-controls";
  const playBtn = document.createElement("button");
  playBtn.type = "button";
  playBtn.title = "Pause/Resume";
  const restartBtn = document.createElement("button");
  restartBtn.type = "button";
  restartBtn.textContent = "↺";
  restartBtn.title = "Restart";
  const seek = document.createElement("input");
  seek.type = "range";
  seek.min = "0";
  seek.max = "1000";
  seek.step = "1";
  seek.value = "0";
  seek.className = "message-lottie-controls__seek";
  seek.title = "Scrub";
  const frameLabel = document.createElement("span");
  frameLabel.className = "message-lottie-controls__time";
  frameLabel.textContent = "0%";
  const speed = document.createElement("select");
  speed.className = "message-lottie-controls__speed";
  [0.5, 0.75, 1, 1.25, 1.5, 2].forEach((rate) => {
    const option = document.createElement("option");
    option.value = String(rate);
    option.textContent = `${rate}x`;
    if (rate === 1) option.selected = true;
    speed.appendChild(option);
  });
  speed.title = "Playback speed";
  const loopBtn = document.createElement("button");
  loopBtn.type = "button";
  loopBtn.title = "Toggle loop";
  const openBtn = document.createElement("button");
  openBtn.type = "button";
  openBtn.textContent = "↗";
  openBtn.title = `Open ${(label || "sticker").toString()} URL`;

  let seeking = false;
  let seekWasPlaying = false;
  let localPlaying = true;
  let localLoop = player.hasAttribute("loop");
  let syncRaf = 0;

  const clampRatio = (value) => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
  const invoke = (names, ...args) => {
    for (const name of names) {
      const fn = player?.[name];
      if (typeof fn !== "function") continue;
      try {
        fn.apply(player, args);
        return true;
      } catch {
        // Continue with fallbacks.
      }
    }
    return false;
  };
  const readNumber = (names) => {
    for (const name of names) {
      const value = player?.[name];
      if (typeof value === "number" && Number.isFinite(value)) return value;
      if (typeof value === "string") {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) return parsed;
      }
    }
    for (const name of names) {
      const attr = player.getAttribute?.(name);
      if (typeof attr !== "string" || !attr.trim()) continue;
      const parsed = Number(attr);
      if (Number.isFinite(parsed)) return parsed;
    }
    return Number.NaN;
  };
  const readBoolean = (names) => {
    for (const name of names) {
      const value = player?.[name];
      if (typeof value === "boolean") return value;
      if (typeof value === "number" && Number.isFinite(value)) return value !== 0;
      if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        if (["true", "1", "on", "yes"].includes(normalized)) return true;
        if (["false", "0", "off", "no"].includes(normalized)) return false;
      }
    }
    for (const name of names) {
      const attr = player.getAttribute?.(name);
      if (typeof attr !== "string" || !attr.trim()) continue;
      const normalized = attr.trim().toLowerCase();
      if (["true", "1", "on", "yes", ""].includes(normalized)) return true;
      if (["false", "0", "off", "no"].includes(normalized)) return false;
    }
    return null;
  };
  const readString = (names) => {
    for (const name of names) {
      const value = player?.[name];
      if (typeof value === "string" && value.trim()) return value.trim();
    }
    for (const name of names) {
      const attr = player.getAttribute?.(name);
      if (typeof attr === "string" && attr.trim()) return attr.trim();
    }
    return "";
  };
  const totalFrames = () => {
    const value = readNumber(["totalFrames", "frames", "durationFrames", "frameCount"]);
    return Number.isFinite(value) && value > 0 ? value : Number.NaN;
  };
  const currentFrame = () => {
    const value = readNumber(["currentFrame", "frame", "currentRawFrame"]);
    return Number.isFinite(value) && value >= 0 ? value : Number.NaN;
  };
  const readProgressRatio = () => {
    const current = currentFrame();
    const total = totalFrames();
    if (Number.isFinite(current) && Number.isFinite(total) && total > 0) {
      return clampRatio(current / total);
    }
    const seeker = readNumber(["seeker", "currentSeeker", "progress", "currentProgress"]);
    if (Number.isFinite(seeker)) {
      if (seeker > 1) return clampRatio(seeker / 100);
      if (seeker >= 0) return clampRatio(seeker);
    }
    const duration = readNumber(["duration", "totalTime", "durationMs"]);
    const currentTime = readNumber(["currentTime", "time", "elapsedTime"]);
    if (Number.isFinite(duration) && duration > 0 && Number.isFinite(currentTime) && currentTime >= 0) {
      return clampRatio(currentTime / duration);
    }
    return clampRatio(Number(seek.value) / 1000);
  };
  const isPlaying = () => {
    const paused = readBoolean(["paused", "isPaused", "isFrozen", "stopped", "isStopped"]);
    if (typeof paused === "boolean") return !paused;
    const stateName = readString(["state", "playState", "status"]).toLowerCase();
    if (stateName) {
      if (stateName.includes("pause") || stateName.includes("stop") || stateName.includes("freeze")) return false;
      if (stateName.includes("play") || stateName.includes("run")) return true;
    }
    return localPlaying;
  };
  const loopEnabled = () => {
    const loop = readBoolean(["loop"]);
    if (typeof loop === "boolean") return loop;
    if (player.hasAttribute("loop")) return true;
    return localLoop;
  };
  const ensureSpeedOption = (rate) => {
    if (!Number.isFinite(rate) || rate <= 0) return;
    const hasOption = [...speed.options].some((option) => Number(option.value) === rate);
    if (hasOption) return;
    const option = document.createElement("option");
    option.value = String(rate);
    option.textContent = `${rate}x`;
    speed.appendChild(option);
  };
  const setSpeed = (value) => {
    const rate = Number(value);
    if (!Number.isFinite(rate) || rate <= 0) return false;
    let applied = invoke(["setSpeed"], rate);
    if (!applied) {
      try {
        if ("speed" in player) {
          player.speed = rate;
          applied = true;
        }
      } catch {
        // Continue with attribute fallback.
      }
    }
    if (!applied) {
      try {
        player.setAttribute("speed", String(rate));
        applied = true;
      } catch {
        // Ignore unsupported assignment.
      }
    }
    return applied;
  };
  const seekToRatio = (value) => {
    const ratio = clampRatio(value);
    const percent = ratio * 100;
    if (invoke(["seek"], `${Math.round(percent)}%`)) return true;
    if (invoke(["seek", "setSeeker", "setProgress"], percent)) return true;
    if (invoke(["seek", "setSeeker", "setProgress"], ratio)) return true;
    const total = totalFrames();
    if (Number.isFinite(total) && total > 0) {
      const frame = Math.round(total * ratio);
      if (invoke(["setFrame"], frame)) return true;
      if (invoke(["goToAndStop"], frame, true)) return true;
      try {
        if ("currentFrame" in player) {
          player.currentFrame = frame;
          return true;
        }
      } catch {
        // Ignore unsupported assignment.
      }
    }
    return false;
  };
  const supportsSeek = () => (
    typeof player.seek === "function"
    || typeof player.setSeeker === "function"
    || typeof player.setProgress === "function"
    || typeof player.setFrame === "function"
    || typeof player.goToAndStop === "function"
    || Number.isFinite(totalFrames())
  );
  const setPlaying = (enabled) => {
    localPlaying = Boolean(enabled);
    if (enabled) {
      invoke(["play", "resume", "unfreeze"]);
    } else {
      const paused = invoke(["pause", "freeze"]);
      if (!paused) invoke(["stop"]);
    }
  };
  const setLoop = (enabled) => {
    localLoop = Boolean(enabled);
    invoke(["setLoop"], localLoop);
    try {
      if ("loop" in player) player.loop = localLoop;
    } catch {
      // Ignore unsupported assignment.
    }
    if (localLoop) {
      player.setAttribute("loop", "");
    } else {
      player.removeAttribute("loop");
    }
  };
  const stopSyncLoop = () => {
    if (!syncRaf) return;
    cancelAnimationFrame(syncRaf);
    syncRaf = 0;
  };
  const syncLoopTick = () => {
    syncRaf = 0;
    if (!row.isConnected || !player.isConnected) return;
    sync();
    if (isPlaying()) syncRaf = requestAnimationFrame(syncLoopTick);
  };
  const ensureSyncLoop = () => {
    if (syncRaf || !isPlaying() || !row.isConnected || !player.isConnected) return;
    syncRaf = requestAnimationFrame(syncLoopTick);
  };
  const sync = () => {
    const playing = isPlaying();
    playBtn.textContent = playing ? "⏸" : "▶";
    playBtn.classList.toggle("is-active", playing);
    const loopOn = loopEnabled();
    loopBtn.textContent = loopOn ? "∞" : "1×";
    loopBtn.classList.toggle("is-active", loopOn);
    const rate = readNumber(["speed", "playbackRate"]);
    const resolvedRate = Number.isFinite(rate) && rate > 0 ? rate : 1;
    ensureSpeedOption(resolvedRate);
    speed.value = String(resolvedRate);
    const ratio = clampRatio(readProgressRatio());
    if (!seeking) {
      seek.value = String(Math.round(ratio * 1000));
    }
    seek.disabled = !supportsSeek();
    const total = totalFrames();
    const frame = currentFrame();
    if (Number.isFinite(total) && total > 0 && Number.isFinite(frame)) {
      const shownFrame = seeking
        ? Math.round((Number(seek.value) / 1000) * total)
        : Math.round(frame);
      frameLabel.textContent = `${Math.max(0, shownFrame)}f / ${Math.max(1, Math.round(total))}f`;
    } else {
      const shownRatio = seeking ? clampRatio(Number(seek.value) / 1000) : ratio;
      frameLabel.textContent = `${Math.round(shownRatio * 100)}%`;
    }
    if (playing) ensureSyncLoop();
    else stopSyncLoop();
  };
  const beginSeek = () => {
    if (seeking) return;
    seeking = true;
    seekWasPlaying = isPlaying();
    if (seekWasPlaying) setPlaying(false);
  };
  const finishSeek = () => {
    if (!seeking) return;
    seeking = false;
    if (seekWasPlaying) setPlaying(true);
    seekWasPlaying = false;
    sync();
  };

  playBtn.addEventListener("click", () => {
    setPlaying(!isPlaying());
    sync();
  });
  restartBtn.addEventListener("click", () => {
    seekToRatio(0);
    sync();
  });
  seek.addEventListener("input", () => {
    beginSeek();
    seekToRatio(Number(seek.value) / 1000);
    sync();
  });
  seek.addEventListener("change", finishSeek);
  seek.addEventListener("pointerdown", beginSeek);
  seek.addEventListener("pointerup", finishSeek);
  seek.addEventListener("pointercancel", finishSeek);
  seek.addEventListener("blur", finishSeek);
  speed.addEventListener("change", () => {
    const next = Number(speed.value);
    if (!Number.isFinite(next) || next <= 0) return;
    setSpeed(next);
    sync();
  });
  loopBtn.addEventListener("click", () => {
    setLoop(!loopEnabled());
    sync();
  });
  openBtn.addEventListener("click", () => {
    const sourceUrl = mediaUrl || player.getAttribute("src") || "";
    openExternalUrlInClient(sourceUrl);
  });
  [
    "load",
    "ready",
    "play",
    "pause",
    "stop",
    "complete",
    "frame",
    "render",
    "time",
    "freeze",
    "unfreeze"
  ].forEach((eventName) => {
    player.addEventListener(eventName, sync);
  });

  row.appendChild(playBtn);
  row.appendChild(restartBtn);
  row.appendChild(seek);
  row.appendChild(frameLabel);
  row.appendChild(speed);
  row.appendChild(loopBtn);
  row.appendChild(openBtn);
  row.__sync = sync;
  sync();
  return row;
}

function renderMessageAttachment(container, attachment, { swfKey = null } = {}) {
  if (!attachment || !attachment.url) return;
  const type = attachment.type || "gif";
  const mediaUrl = isAesgcmUrl(attachment.url) ? attachment.url : resolveMediaUrl(attachment.url);
  const wrap = document.createElement("div");
  wrap.className = `message-attachment message-attachment--${type}`;
  const bindAttachmentContextMenu = (
    target,
    {
      downloadExt = "bin",
      downloadName = attachment.name || "",
      allowDownload = true
    } = {}
  ) => {
    if (!(target instanceof HTMLElement) || !mediaUrl) return;
    target.addEventListener("contextmenu", (event) => {
      const items = [
        {
          label: "Copy Attachment URL",
          action: () => copyText(mediaUrl)
        }
      ];
      if (allowDownload) {
        items.push({
          label: "Download Attachment",
          action: () => {
            const baseName = downloadName || attachment.name || type || "attachment";
            triggerMediaDownload(mediaUrl, lightboxDownloadNameFromLabel(baseName, downloadExt));
          }
        });
      }
      openContextMenu(event, items);
    });
  };

  if (isAesgcmUrl(attachment.url)) {
    const card = document.createElement("div");
    card.className = "message-swf message-embed-note";
    const label = document.createElement("strong");
    label.textContent = attachment.name || "Encrypted attachment";
    const note = document.createElement("div");
    note.textContent = "Encrypted file (AES-GCM). Click to decrypt and download.";
    const downloadBtn = document.createElement("button");
    downloadBtn.type = "button";
    downloadBtn.className = "message-attachment-action";
    downloadBtn.textContent = "Decrypt & Download";
    downloadBtn.addEventListener("click", () => {
      void downloadAttachmentFile(attachment, "bin");
    });
    card.addEventListener("contextmenu", (event) => {
      openContextMenu(event, [
        {
          label: "Copy Encrypted URL",
          action: () => copyText(attachment.url)
        },
        {
          label: "Decrypt & Download",
          action: () => downloadAttachmentFile(attachment, "bin")
        }
      ]);
    });
    card.appendChild(label);
    card.appendChild(note);
    card.appendChild(downloadBtn);
    wrap.appendChild(card);
    container.appendChild(wrap);
    return;
  }

  if (type !== "swf" && !isMediaAttachmentAllowedOnce(attachment, swfKey) && shouldGateMediaUrl(mediaUrl)) {
    const host = mediaUrlHost(mediaUrl);
    const hostLabel = host || "external host";
    const kind = attachmentTypeDisplayLabel(type, mediaUrl);
    const gate = document.createElement("div");
    gate.className = "message-swf message-media-gate";
    gate.dataset.urlPinned = "off";
    gate.dataset.urlLatched = "off";
    const top = document.createElement("div");
    top.className = "message-media-gate__top";
    const icon = document.createElement("div");
    icon.className = "message-media-gate__icon";
    icon.setAttribute("aria-hidden", "true");
    icon.innerHTML = `
      <svg viewBox="0 0 24 24" width="18" height="18" focusable="false" aria-hidden="true">
        <path fill="currentColor" d="M12 2a4 4 0 0 0-4 4v2H7a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-8a3 3 0 0 0-3-3h-1V6a4 4 0 0 0-4-4Zm-2 6V6a2 2 0 1 1 4 0v2h-4Zm2 4a2 2 0 0 1 1 3.732V18h-2v-2.268A2 2 0 0 1 12 12Z"/>
      </svg>
    `;
    const textWrap = document.createElement("div");
    textWrap.className = "message-media-gate__text";
    const title = document.createElement("strong");
    title.textContent = `External ${kind} hidden`;
    const hostRow = document.createElement("div");
    hostRow.className = "message-media-gate__host-row";
    const info = document.createElement("div");
    info.className = "message-swf-meta message-media-gate__host";
    info.textContent = hostLabel;
    const iconRow = document.createElement("div");
    iconRow.className = "message-media-gate__icon-row";
    const openUrlBtn = document.createElement("button");
    openUrlBtn.type = "button";
    openUrlBtn.className = "message-media-gate__icon-btn";
    openUrlBtn.title = "Open URL";
    openUrlBtn.textContent = "↗";
    openUrlBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      openExternalUrlInClient(mediaUrl);
    });
    const revealUrlBtn = document.createElement("button");
    revealUrlBtn.type = "button";
    revealUrlBtn.className = "message-media-gate__icon-btn";
    revealUrlBtn.title = "Toggle full URL";
    revealUrlBtn.textContent = "⌗";
    const setUrlLatched = (latched) => {
      gate.dataset.urlLatched = latched ? "on" : "off";
      if (latched || gate.dataset.urlPinned === "on") {
        gate.classList.add("is-url-latched");
      } else {
        gate.classList.remove("is-url-latched");
      }
    };
    revealUrlBtn.addEventListener("click", () => {
      const pinned = gate.dataset.urlPinned === "on";
      const nextPinned = !pinned;
      gate.dataset.urlPinned = nextPinned ? "on" : "off";
      gate.classList.toggle("is-url-pinned", nextPinned);
      revealUrlBtn.classList.toggle("is-active", nextPinned);
      if (nextPinned) {
        setUrlLatched(true);
      } else if (!gate.matches(":hover")) {
        setUrlLatched(false);
      }
    });
    gate.addEventListener("mouseenter", () => {
      setUrlLatched(true);
    });
    gate.addEventListener("mouseleave", () => {
      if (gate.dataset.urlPinned === "on") return;
      setUrlLatched(false);
    });
    gate.addEventListener("focusin", () => {
      setUrlLatched(true);
    });
    gate.addEventListener("focusout", (event) => {
      if (gate.dataset.urlPinned === "on") return;
      const next = event.relatedTarget;
      if (next instanceof Node && gate.contains(next)) return;
      setUrlLatched(false);
    });
    hostRow.appendChild(info);
    const urlNote = document.createElement("div");
    urlNote.className = "message-embed-note message-media-gate__url";
    urlNote.textContent = mediaUrl;
    const controls = document.createElement("div");
    controls.className = "settings-inline-actions message-media-gate__controls";
    controls.hidden = false;
    const onceBtn = document.createElement("button");
    onceBtn.type = "button";
    onceBtn.className = "message-media-gate__option";
    onceBtn.textContent = "Once";
    onceBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      allowMediaAttachmentOnce(attachment, swfKey);
      showToast("Allowed once for this URL.");
      renderMessages();
    });
    const trustBtn = document.createElement("button");
    trustBtn.type = "button";
    trustBtn.className = "message-media-gate__option";
    const trustRule = suggestSubdomainTrustRule(host);
    trustBtn.textContent = trustRule.startsWith("*.") ? "Trust+" : "Trust";
    trustBtn.title = trustRule || hostLabel;
    trustBtn.disabled = !host;
    trustBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!host) {
        showToast("Could not detect media host for trust rule.", { tone: "error" });
        return;
      }
      const added = addMediaTrustRule(trustRule || host);
      if (added) {
        saveState();
        showToast(`Added trust rule: ${trustRule || host}`);
      } else {
        showToast(`Already trusted: ${trustRule || host}`);
      }
      renderMessages();
    });
    const trustSubdomainBtn = document.createElement("button");
    trustSubdomainBtn.type = "button";
    trustSubdomainBtn.className = "message-media-gate__option";
    trustSubdomainBtn.textContent = "Sub";
    trustSubdomainBtn.title = host ? `Trust only ${host}` : "Host unavailable";
    trustSubdomainBtn.disabled = !host;
    trustSubdomainBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!host) {
        showToast("Could not detect media host for trust rule.", { tone: "error" });
        return;
      }
      const added = addMediaTrustRule(host);
      if (added) {
        saveState();
        showToast(`Added trusted host: ${host}`);
      } else {
        showToast(`Host already trusted: ${host}`);
      }
      renderMessages();
    });
    const customRuleBtn = document.createElement("button");
    customRuleBtn.type = "button";
    customRuleBtn.className = "message-media-gate__option";
    customRuleBtn.textContent = "Rule";
    customRuleBtn.disabled = !host;
    customRuleBtn.addEventListener("click", async (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!host) {
        showToast("Could not detect media host for custom rule.", { tone: "error" });
        return;
      }
      const nextRule = await showInAppPromptDialog({
        title: "Media trust rule",
        message: "Media trust rule (domain, *.domain, or /regex/)",
        defaultValue: host
      });
      if (typeof nextRule !== "string") return;
      const added = addMediaTrustRule(nextRule);
      if (!added) {
        showToast("Rule already exists or invalid.");
        return;
      }
      saveState();
      showToast(`Added trust rule: ${nextRule}`);
      renderMessages();
    });
    const copyUrlBtn = document.createElement("button");
    copyUrlBtn.type = "button";
    copyUrlBtn.className = "message-media-gate__option";
    copyUrlBtn.textContent = "Copy";
    copyUrlBtn.addEventListener("click", async (event) => {
      event.preventDefault();
      event.stopPropagation();
      const copied = await copyText(mediaUrl);
      showToast(copied ? "URL copied." : "Could not copy URL.", { tone: copied ? "info" : "error" });
    });
    controls.appendChild(onceBtn);
    controls.appendChild(trustBtn);
    controls.appendChild(trustSubdomainBtn);
    controls.appendChild(customRuleBtn);
    controls.appendChild(copyUrlBtn);
    iconRow.appendChild(openUrlBtn);
    iconRow.appendChild(revealUrlBtn);
    hostRow.appendChild(iconRow);
    textWrap.appendChild(title);
    textWrap.appendChild(hostRow);
    textWrap.appendChild(urlNote);
    top.appendChild(icon);
    top.appendChild(textWrap);
    gate.appendChild(top);
    gate.appendChild(controls);
    wrap.appendChild(gate);
    container.appendChild(wrap);
    return;
  }

  if (type === "swf") {
    const card = document.createElement("div");
    card.className = "message-swf";
    const header = document.createElement("div");
    header.className = "message-swf-header";
    const title = document.createElement("strong");
    title.textContent = attachment.name || "SWF file";
    const controlRow = document.createElement("div");
    controlRow.className = "message-swf-top-controls";
    const saveIconBtn = document.createElement("button");
    saveIconBtn.type = "button";
    saveIconBtn.className = "message-swf-save-icon";
    saveIconBtn.title = "Download SWF";
    saveIconBtn.setAttribute("aria-label", "Download SWF");
    saveIconBtn.textContent = "💾";
    saveIconBtn.addEventListener("click", () => {
      void downloadAttachmentFile(attachment, "swf");
    });
    saveIconBtn.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      saveSwfToShelf(attachment);
    });
    const exportSavesBtn = document.createElement("button");
    exportSavesBtn.type = "button";
    exportSavesBtn.className = "message-swf-top-btn";
    exportSavesBtn.textContent = "Save↓";
    exportSavesBtn.title = "Export SWF saves";
    exportSavesBtn.addEventListener("click", () => exportSwfSavesNow());
    const importSavesBtn = document.createElement("button");
    importSavesBtn.type = "button";
    importSavesBtn.className = "message-swf-top-btn";
    importSavesBtn.textContent = "Save↑";
    importSavesBtn.title = "Import SWF saves";
    importSavesBtn.addEventListener("click", () => triggerImportSwfSaves());
    const audioIndicator = document.createElement("span");
    audioIndicator.className = "message-swf-audio-indicator";
    audioIndicator.textContent = "Audio Idle";
    audioIndicator.title = "Audio idle";
    const runtimeHealthBadge = document.createElement("span");
    runtimeHealthBadge.className = "message-swf-runtime-health";
    runtimeHealthBadge.textContent = "Runtime stable";
    runtimeHealthBadge.title = "Live runtime instance.";
    const playBtn = document.createElement("button");
    playBtn.type = "button";
    playBtn.className = "message-swf-top-btn";
    playBtn.textContent = "▶";
    playBtn.title = "Play";
    const pauseBtn = document.createElement("button");
    pauseBtn.type = "button";
    pauseBtn.className = "message-swf-top-btn";
    pauseBtn.textContent = "⏸";
    pauseBtn.title = "Pause";
    const fullscreenBtn = document.createElement("button");
    fullscreenBtn.type = "button";
    fullscreenBtn.className = "message-swf-top-btn";
    fullscreenBtn.textContent = "⛶";
    fullscreenBtn.title = "Fullscreen";
    const resetBtn = document.createElement("button");
    resetBtn.type = "button";
    resetBtn.className = "message-swf-top-btn";
    resetBtn.textContent = "↺";
    resetBtn.title = "Reset SWF";
    const resizeBtn = document.createElement("button");
    resizeBtn.type = "button";
    resizeBtn.className = "message-swf-top-btn";
    resizeBtn.textContent = "⇲";
    resizeBtn.title = "Resize player";
    const optimalBtn = document.createElement("button");
    optimalBtn.type = "button";
    optimalBtn.className = "message-swf-top-btn";
    optimalBtn.textContent = "◎";
    optimalBtn.title = "Optimal size";
    const soloBtn = document.createElement("button");
    soloBtn.type = "button";
    soloBtn.className = "message-swf-top-btn";
    soloBtn.textContent = "🎯";
    soloBtn.title = "Solo audio focus";
    const pipBtn = document.createElement("button");
    pipBtn.type = "button";
    pipBtn.className = "message-swf-top-btn";
    pipBtn.textContent = "📺";
    pipBtn.title = "Pin to PiP";
    header.appendChild(title);
    controlRow.appendChild(saveIconBtn);
    controlRow.appendChild(exportSavesBtn);
    controlRow.appendChild(importSavesBtn);
    controlRow.appendChild(playBtn);
    controlRow.appendChild(pauseBtn);
    controlRow.appendChild(fullscreenBtn);
    controlRow.appendChild(resetBtn);
    controlRow.appendChild(resizeBtn);
    controlRow.appendChild(optimalBtn);
    controlRow.appendChild(soloBtn);
    controlRow.appendChild(pipBtn);
    controlRow.appendChild(audioIndicator);
    controlRow.appendChild(runtimeHealthBadge);
    card.appendChild(header);

    const body = document.createElement("div");
    body.className = "message-swf-body";
    const audioRail = document.createElement("div");
    audioRail.className = "message-swf-audio-rail";
    let playerWrap = document.createElement("div");
    playerWrap.className = "message-swf-player";
    playerWrap.style.display = "grid";
    playerWrap.style.placeItems = "center";
    playerWrap.style.color = "#a6aeb9";
    playerWrap.style.fontSize = "0.78rem";
    playerWrap.textContent = "Loading SWF...";
    playerWrap.addEventListener("click", () => {
      if (!swfKey) return;
      const runtime = swfRuntimes.get(swfKey);
      if (!runtime) return;
      setSwfPlayback(swfKey, true, "user");
      if (runtime.audioEnabled) grantSwfAudioClickFocus(swfKey);
    });
    const audioToggleBtn = document.createElement("button");
    audioToggleBtn.type = "button";
    audioToggleBtn.className = "message-swf-audio-toggle";
    const prefs = getPreferences();
    const initialEnabled = prefs.swfAudio === "on";
    let audioEnabled = initialEnabled;
    audioToggleBtn.textContent = audioEnabled ? "🔊" : "🔇";
    audioToggleBtn.title = `${audioEnabled ? "Mute SWF audio" : "Unmute SWF audio"}. Right-click to pin (skip auto-mute).`;
    audioToggleBtn.setAttribute("aria-label", `${audioEnabled ? "Mute SWF audio" : "Unmute SWF audio"}. Right-click to pin (skip auto-mute).`);
    audioToggleBtn.addEventListener("click", () => {
      audioEnabled = !audioEnabled;
      audioToggleBtn.textContent = audioEnabled ? "🔊" : "🔇";
      audioToggleBtn.title = `${audioEnabled ? "Mute SWF audio" : "Unmute SWF audio"}. Right-click to pin (skip auto-mute).`;
      audioToggleBtn.setAttribute("aria-label", `${audioEnabled ? "Mute SWF audio" : "Unmute SWF audio"}. Right-click to pin (skip auto-mute).`);
      updateSwfRuntimeAudio(swfKey, { enabled: audioEnabled });
      if (audioEnabled) grantSwfAudioClickFocus(swfKey);
    });
    audioToggleBtn.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      const runtime = swfKey ? swfRuntimes.get(swfKey) : null;
      const pinned = !(runtime?.audioPinned || false);
      setSwfRuntimeAudioPinned(swfKey, pinned);
      addDebugLog("info", pinned ? "Pinned SWF audio (skip auto-mute)" : "Unpinned SWF audio (auto-mute applies)", {
        key: swfKey || null,
        name: attachment.name || "SWF file"
      });
    });
    const audioSlider = document.createElement("input");
    audioSlider.type = "range";
    audioSlider.min = "0";
    audioSlider.max = "100";
    audioSlider.step = "1";
    audioSlider.value = String(Math.round(prefs.swfVolume));
    audioSlider.className = "message-swf-audio-slider";
    audioSlider.title = "SWF volume";
    audioSlider.setAttribute("aria-label", "SWF volume");
    audioSlider.addEventListener("input", () => {
      updateSwfRuntimeAudio(swfKey, { volume: Number(audioSlider.value) });
      grantSwfAudioClickFocus(swfKey);
    });
    audioRail.appendChild(audioToggleBtn);
    audioRail.appendChild(audioSlider);
    body.appendChild(playerWrap);
    card.appendChild(body);
    const controlsStack = document.createElement("div");
    controlsStack.className = "message-swf-controls-stack";
    controlsStack.appendChild(controlRow);
    controlsStack.appendChild(audioRail);
    card.appendChild(controlsStack);
    let vuMeterFill = null;
    if (prefs.swfVuMeter === "on") {
      const details = document.createElement("details");
      details.className = "message-swf-vu";
      const summary = document.createElement("summary");
      summary.textContent = "Audio details";
      const meter = document.createElement("div");
      meter.className = "message-swf-vu__meter";
      vuMeterFill = document.createElement("div");
      vuMeterFill.className = "message-swf-vu__fill";
      meter.appendChild(vuMeterFill);
      details.appendChild(summary);
      details.appendChild(meter);
      card.appendChild(details);
    }
    if (swfKey) {
      swfPendingUi.set(swfKey, {
        audioToggleEl: audioToggleBtn,
        audioIndicatorEl: audioIndicator,
        vuMeterFillEl: vuMeterFill,
        healthBadgeEl: runtimeHealthBadge
      });
      refreshSwfRuntimeHealthUi(swfKey);
    }
    const runtimeInMap = swfKey ? swfRuntimes.get(swfKey) : null;
    soloBtn.classList.toggle("is-active", swfKey && swfSoloRuntimeKey === swfKey);
    pipBtn.classList.toggle("is-active", Boolean(runtimeInMap?.inPip));
    pipBtn.title = runtimeInMap?.inPip ? "Remove from PiP" : "Pin to PiP";
    const initialResizable = Boolean(
      runtimeInMap?.host instanceof HTMLElement
      && runtimeInMap.host.classList.contains("message-swf-player--resizable")
    ) || playerWrap.classList.contains("message-swf-player--resizable");
    resizeBtn.classList.toggle("is-active", initialResizable);
    if (runtimeInMap?.player instanceof HTMLElement) {
      attachExistingSwfRuntime(swfKey, playerWrap);
      applyPendingSwfUiBindings(swfKey);
    } else if (swfKey) {
      attachRufflePlayer(playerWrap, attachment, { autoplay: swfAutoplayFromPreferences(), runtimeKey: swfKey });
    }

    playBtn.addEventListener("click", () => {
      const runtime = swfKey ? swfRuntimes.get(swfKey) : null;
      if (runtime) {
        setSwfPlayback(swfKey, true, "user");
        grantSwfAudioClickFocus(swfKey);
      } else {
        attachRufflePlayer(playerWrap, attachment, { autoplay: swfAutoplayFromPreferences(), runtimeKey: swfKey });
      }
    });
    pauseBtn.addEventListener("click", () => {
      if (!swfKey) return;
      setSwfPlayback(swfKey, false, "user");
    });
    fullscreenBtn.addEventListener("click", () => {
      void openSwfFullscreen(swfKey, playerWrap, attachment);
    });
    resizeBtn.addEventListener("click", () => {
      const runtime = swfKey ? swfRuntimes.get(swfKey) : null;
      const target = runtime?.host instanceof HTMLElement ? runtime.host : playerWrap;
      target.classList.toggle("message-swf-player--resizable");
      playerWrap.classList.toggle("message-swf-player--resizable", target.classList.contains("message-swf-player--resizable"));
      resizeBtn.classList.toggle("is-active", target.classList.contains("message-swf-player--resizable"));
      requestSwfRuntimeLayoutSync();
    });
    optimalBtn.addEventListener("click", () => {
      const ok = applySwfOptimalSize(swfKey, playerWrap);
      if (!ok) {
        addDebugLog("info", "Optimal size not available yet; SWF metadata pending", { key: swfKey || null });
      }
    });
    resetBtn.addEventListener("click", () => {
      void resetSwfRuntime(swfKey, playerWrap, attachment);
    });
    soloBtn.addEventListener("click", () => {
      if (!swfKey) return;
      swfSoloRuntimeKey = swfSoloRuntimeKey === swfKey ? null : swfKey;
      soloBtn.classList.toggle("is-active", swfSoloRuntimeKey === swfKey);
      refreshSwfAudioFocus(swfKey);
    });
    pipBtn.addEventListener("click", () => {
      if (!swfKey || pipBtn.dataset.pending === "on") return;
      pipBtn.dataset.pending = "on";
      pipBtn.disabled = true;
      const run = async () => {
        const runtime = await ensureSwfRuntimeReadyForPip(swfKey, playerWrap, attachment);
        if (!runtime?.player) {
          showToast("SWF runtime is still loading. Try PiP again in a moment.", { tone: "error" });
          return;
        }
        const nextEnabled = !runtime.inPip;
        runtime.keepAlive = true;
        const ok = setSwfRuntimePip(swfKey, nextEnabled);
        const runtimeAfter = swfRuntimes.get(swfKey);
        const pipActive = Boolean(runtimeAfter?.inPip);
        pipBtn.classList.toggle("is-active", pipActive);
        pipBtn.title = pipActive ? "Remove from PiP" : "Pin to PiP";
        if (!ok) {
          showToast("Could not toggle PiP for this SWF.", { tone: "error" });
        }
        refreshSwfAudioFocus(swfKey);
      };
      void run().finally(() => {
        pipBtn.dataset.pending = "off";
        pipBtn.disabled = false;
      });
    });
    wrap.appendChild(card);
    container.appendChild(wrap);
    return;
  }

  if (type === "gif" || type === "video") {
    const videoLike = type === "video"
      || inferAttachmentTypeFromUrl(mediaUrl) === "video"
      || inferAttachmentTypeFromUrl(attachment.name || "") === "video";
    if (videoLike) {
      const gifLikeVideo = type === "gif";
      const label = attachment.name || (gifLikeVideo ? "GIF" : "Video");
      if (gifLikeVideo) {
        const video = createVideoPreviewElement(
          mediaUrl,
          label,
          wrap,
          {
            animatedLoop: true,
            preferDirect: true
          }
        );
        video.addEventListener("dblclick", () => {
          openMediaLightbox({ url: mediaUrl, label, video: true });
        });
        bindAttachmentContextMenu(video, {
          downloadExt: "mp4",
          downloadName: label
        });
        wrap.appendChild(video);
        const gifControls = createGifControlStrip(video, { label, mediaUrl });
        const gifMenuBtn = document.createElement("button");
        gifMenuBtn.type = "button";
        gifMenuBtn.className = "message-gif-hover-btn";
        gifMenuBtn.textContent = "⋯";
        gifMenuBtn.title = "GIF controls";
        gifMenuBtn.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          wrap.classList.toggle("message-attachment--gif-controls-open");
          if (gifControls && typeof gifControls.__sync === "function") gifControls.__sync();
        });
        wrap.appendChild(gifMenuBtn);
        if (gifControls) wrap.appendChild(gifControls);
      } else {
        const runtimeKey = swfKey ? `video:${swfKey}` : "";
        let runtime = runtimeKey ? videoPipRuntimes.get(runtimeKey) : null;
        if (!runtime?.video) {
          const video = createVideoPreviewElement(
            mediaUrl,
            label,
            wrap,
            {
              animatedLoop: false,
              preferDirect: false
            }
          );
          video.addEventListener("dblclick", () => {
            openMediaLightbox({ url: mediaUrl, label, video: true });
          });
          bindAttachmentContextMenu(video, {
            downloadExt: "mp4",
            downloadName: label
          });
          runtime = ensureVideoPipRuntime(runtimeKey, { video, label });
        } else {
          runtime.label = label;
        }
        const mount = document.createElement("div");
        mount.className = "message-video-mount";
        wrap.appendChild(mount);
        if (runtime?.video) {
          runtime.anchorHost = mount;
          if (runtime.inPip && videoPipActiveKey === runtime.key) {
            mount.innerHTML = "<div class=\"channel-empty\">Running in PiP panel.</div>";
            renderVideoPipDock();
          } else {
            runtime.inPip = false;
            mount.innerHTML = "";
            mount.appendChild(runtime.video);
            ensureMobileVideoPlayOverlay(runtime.video, mount);
            bindAttachmentPlayerHoverClass(wrap, runtime.video);
          }
          if (!(runtime.controlsEl instanceof HTMLElement)) {
            runtime.controlsEl = createVideoControlStrip(runtime.video, {
              label,
              runtimeKey: runtime.key
            });
            runtime.syncControls = runtime.controlsEl && typeof runtime.controlsEl.__sync === "function"
              ? runtime.controlsEl.__sync
              : null;
          }
          runtime.controlsHome = wrap;
          if (runtime.controlsEl instanceof HTMLElement) {
            runtime.controlsEl.classList.remove("message-video-controls--pip");
            if (!wrap.contains(runtime.controlsEl)) wrap.appendChild(runtime.controlsEl);
            if (runtime.syncControls instanceof Function) runtime.syncControls();
          }
        }
      }
    } else {
      const img = document.createElement("img");
      img.src = mediaUrl;
      img.loading = "eager";
      img.alt = attachment.name || "GIF";
      img.addEventListener("click", () => {
        openMediaLightbox({ url: mediaUrl, label: attachment.name || "GIF" });
      });
      bindAttachmentContextMenu(img, {
        downloadExt: "gif",
        downloadName: attachment.name || "gif"
      });
      wrap.appendChild(img);
    }
    container.appendChild(wrap);
    return;
  }

  if (type === "sticker" && attachment.format === "dotlottie") {
    const canRenderDotLottie = typeof customElements !== "undefined" && customElements.get("dotlottie-player");
    if (canRenderDotLottie) {
      const lottie = document.createElement("dotlottie-player");
      lottie.className = "message-lottie-player";
      lottie.setAttribute("src", mediaUrl);
      lottie.setAttribute("autoplay", "");
      lottie.setAttribute("loop", "");
      wrap.appendChild(lottie);
      bindAttachmentContextMenu(lottie, {
        downloadExt: "lottie",
        downloadName: attachment.name || "sticker"
      });
      const lottieControls = createDotLottieControlStrip(lottie, {
        label: attachment.name || "Sticker",
        mediaUrl
      });
      if (lottieControls) wrap.appendChild(lottieControls);
    } else {
      const fallback = document.createElement("div");
      fallback.className = "message-swf";
      fallback.textContent = "dotLottie runtime loading or unavailable.";
      const link = document.createElement("a");
      link.className = "message-swf-link";
      link.href = mediaUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Open .lottie file";
      fallback.appendChild(link);
      wrap.appendChild(fallback);
    }
    container.appendChild(wrap);
    return;
  }

  if (type === "svg") {
    const img = document.createElement("img");
    img.src = mediaUrl;
    img.loading = "eager";
    img.alt = attachment.name || "SVG";
    img.addEventListener("click", () => {
      openMediaLightbox({ url: mediaUrl, label: attachment.name || "SVG" });
    });
    bindAttachmentContextMenu(img, {
      downloadExt: "svg",
      downloadName: attachment.name || "image"
    });
    wrap.appendChild(img);
    container.appendChild(wrap);
    return;
  }

  if (type === "html") {
    const note = document.createElement("div");
    note.className = "message-embed-note";
    note.textContent = "HTML preview is disabled until you click load, to avoid auto-download prompts.";
    wrap.appendChild(note);
    const frame = document.createElement("iframe");
    frame.className = "message-html-frame";
    frame.loading = "lazy";
    frame.referrerPolicy = "no-referrer";
    frame.sandbox = "allow-scripts allow-forms allow-popups";
    frame.src = "about:blank";
    frame.hidden = true;
    wrap.appendChild(frame);
    const loadBtn = document.createElement("button");
    loadBtn.type = "button";
    loadBtn.className = "message-attachment-action";
    loadBtn.textContent = "Load HTML preview";
    loadBtn.addEventListener("click", () => {
      if (frame.dataset.loaded === "on") return;
      frame.dataset.loaded = "on";
      frame.hidden = false;
      frame.src = mediaUrl;
      loadBtn.disabled = true;
      loadBtn.textContent = "HTML preview loaded";
    });
    const shouldAutoLoad = !shouldGateMediaUrl(mediaUrl) || isMediaAttachmentAllowedOnce(attachment, swfKey);
    if (shouldAutoLoad) {
      frame.dataset.loaded = "on";
      frame.hidden = false;
      frame.src = mediaUrl;
      loadBtn.disabled = true;
      loadBtn.hidden = true;
      loadBtn.textContent = "HTML preview loaded";
      note.textContent = "HTML preview loaded.";
    }
    wrap.appendChild(loadBtn);
    const openBtn = document.createElement("a");
    openBtn.className = "message-swf-link";
    openBtn.href = mediaUrl;
    openBtn.target = "_blank";
    openBtn.rel = "noopener noreferrer";
    openBtn.textContent = "Open HTML in new tab";
    wrap.appendChild(openBtn);
    container.appendChild(wrap);
    return;
  }

  if (type === "pdf") {
    const note = document.createElement("div");
    note.className = "message-embed-note";
    note.textContent = "Custom PDF preview with page and zoom controls.";
    wrap.appendChild(note);
    const viewer = createPdfPreviewElement(mediaUrl, attachment.name || "PDF");
    wrap.appendChild(viewer);
    const openBtn = document.createElement("a");
    openBtn.className = "message-swf-link";
    openBtn.href = mediaUrl;
    openBtn.target = "_blank";
    openBtn.rel = "noopener noreferrer";
    openBtn.textContent = "Open PDF in new tab";
    wrap.appendChild(openBtn);
    const downloadBtn = document.createElement("a");
    downloadBtn.className = "message-swf-link";
    downloadBtn.href = mediaUrl;
    downloadBtn.download = attachment.name || "document.pdf";
    downloadBtn.textContent = "Download PDF";
    wrap.appendChild(downloadBtn);
    container.appendChild(wrap);
    return;
  }

  if (type === "audio") {
    const audio = document.createElement("audio");
    audio.controls = true;
    audio.preload = "none";
    audio.src = mediaUrl;
    audio.className = "message-audio";
    applyMediaElementAudioPreferences(audio, getPreferences());
    wrap.appendChild(audio);
    const openBtn = document.createElement("a");
    openBtn.className = "message-swf-link";
    openBtn.href = mediaUrl;
    openBtn.target = "_blank";
    openBtn.rel = "noopener noreferrer";
    openBtn.textContent = "Open audio file";
    wrap.appendChild(openBtn);
    container.appendChild(wrap);
    return;
  }

  if (type === "odf") {
    const frame = document.createElement("iframe");
    frame.className = "message-pdf-frame";
    frame.loading = "lazy";
    frame.referrerPolicy = "no-referrer";
    frame.src = mediaUrl;
    wrap.appendChild(frame);
    const openBtn = document.createElement("a");
    openBtn.className = "message-swf-link";
    openBtn.href = mediaUrl;
    openBtn.target = "_blank";
    openBtn.rel = "noopener noreferrer";
    openBtn.textContent = "Open document in new tab";
    wrap.appendChild(openBtn);
    const downloadBtn = document.createElement("a");
    downloadBtn.className = "message-swf-link";
    downloadBtn.href = mediaUrl;
    downloadBtn.download = attachment.name || "document";
    downloadBtn.textContent = "Download document";
    wrap.appendChild(downloadBtn);
    container.appendChild(wrap);
    return;
  }

  if (type === "rtf") {
    const pre = document.createElement("pre");
    pre.className = "message-text-file";
    pre.textContent = "Loading RTF preview…";
    wrap.appendChild(pre);
    const openBtn = document.createElement("a");
    openBtn.className = "message-swf-link";
    openBtn.href = mediaUrl;
    openBtn.target = "_blank";
    openBtn.rel = "noopener noreferrer";
    openBtn.textContent = "Open RTF file";
    wrap.appendChild(openBtn);
    container.appendChild(wrap);
    void loadTextAttachmentPreview(mediaUrl)
      .then((preview) => {
        pre.textContent = rtfToPlainText(preview) || "(empty file)";
      })
      .catch(() => {
        pre.textContent = "Could not load RTF preview.";
      });
    return;
  }

  if (type === "text") {
    const pre = document.createElement("pre");
    pre.className = "message-text-file";
    pre.textContent = "Loading text preview…";
    wrap.appendChild(pre);
    const openBtn = document.createElement("a");
    openBtn.className = "message-swf-link";
    openBtn.href = mediaUrl;
    openBtn.target = "_blank";
    openBtn.rel = "noopener noreferrer";
    openBtn.textContent = "Open text file";
    wrap.appendChild(openBtn);
    container.appendChild(wrap);
    void loadTextAttachmentPreview(mediaUrl)
      .then((preview) => {
        pre.textContent = preview || "(empty file)";
      })
      .catch(() => {
        pre.textContent = "Could not load preview.";
      });
    return;
  }

  if (type === "bin") {
    const pre = document.createElement("pre");
    pre.className = "message-text-file";
    pre.textContent = "Loading HEX preview…";
    wrap.appendChild(pre);
    const openBtn = document.createElement("a");
    openBtn.className = "message-swf-link";
    openBtn.href = mediaUrl;
    openBtn.target = "_blank";
    openBtn.rel = "noopener noreferrer";
    openBtn.textContent = "Open binary file";
    wrap.appendChild(openBtn);
    container.appendChild(wrap);
    void loadBinaryPreview(mediaUrl)
      .then((preview) => {
        pre.textContent = preview || "(empty file)";
      })
      .catch(() => {
        pre.textContent = "Could not load HEX preview.";
      });
    return;
  }

  if (type === "file") {
    const fileName = (attachment.name || mediaUrl.split("/").pop() || "").toString();
    const fileLooksVideo = inferAttachmentTypeFromUrl(fileName) === "video"
      || inferAttachmentTypeFromUrl(mediaUrl) === "video";
    if (fileLooksVideo) {
      const video = createVideoPreviewElement(mediaUrl, attachment.name || fileName || "Video", wrap);
      video.addEventListener("dblclick", () => {
        openMediaLightbox({ url: mediaUrl, label: attachment.name || "Video", video: true });
      });
      wrap.appendChild(video);
    }
    const note = document.createElement("div");
    note.className = "message-embed-note";
    note.textContent = attachment.name || mediaUrl.split("/").pop() || "Attached file";
    wrap.appendChild(note);
    const openBtn = document.createElement("a");
    openBtn.className = "message-swf-link";
    openBtn.href = mediaUrl;
    openBtn.target = "_blank";
    openBtn.rel = "noopener noreferrer";
    openBtn.textContent = "Open file";
    wrap.appendChild(openBtn);
    const downloadBtn = document.createElement("a");
    downloadBtn.className = "message-swf-link";
    downloadBtn.href = mediaUrl;
    downloadBtn.download = attachment.name || mediaUrl.split("/").pop() || "download";
    downloadBtn.textContent = "Download file";
    wrap.appendChild(downloadBtn);
    container.appendChild(wrap);
    return;
  }

  const img = document.createElement("img");
  img.src = mediaUrl;
  img.loading = "eager";
  img.alt = attachment.name || type.toUpperCase();
  img.addEventListener("click", () => {
    openMediaLightbox({ url: mediaUrl, label: attachment.name || type.toUpperCase() });
  });
  bindAttachmentContextMenu(img, {
    downloadExt: type === "svg" ? "svg" : "png",
    downloadName: attachment.name || type.toUpperCase()
  });
  wrap.appendChild(img);
  container.appendChild(wrap);
}
