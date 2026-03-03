/*
 * Overlay, toast, media lightbox, and external-open runtime extracted from app.js.
 */

(function initAppOverlayRuntime(globalScope) {
  if (!globalScope || globalScope.SHITCORD67_APP_OVERLAY_RUNTIME) return;

function copyTextToChannelWithFeedback(channel, value, {
  successText = "Copied.",
  emptyText = "Nothing to copy.",
  failureText = "Failed to copy."
} = {}) {
  const text = (value || "").toString();
  if (!text.trim()) {
    addSystemMessage(channel, emptyText);
    return;
  }
  void copyText(text).then((ok) => {
    addSystemMessage(channel, ok ? successText : failureText);
  });
}

function ensureToastHost() {
  let host = document.getElementById("appToastHost");
  if (host) return host;
  host = document.createElement("div");
  host.id = "appToastHost";
  host.className = "toast-host";
  host.setAttribute("role", "status");
  host.setAttribute("aria-live", "polite");
  document.body.appendChild(host);
  return host;
}

function showToast(message, { tone = "info", duration = 1800 } = {}) {
  if (!message) return;
  const host = ensureToastHost();
  host.textContent = message;
  host.classList.toggle("is-error", tone === "error");
  host.classList.add("is-visible");
  if (toastHideTimer) clearTimeout(toastHideTimer);
  toastHideTimer = setTimeout(() => {
    host.classList.remove("is-visible");
  }, Math.max(500, Number(duration) || 1800));
}

function ensureMediaLightbox() {
  let overlay = document.getElementById("mediaLightbox");
  if (overlay) return overlay;
  overlay = document.createElement("div");
  overlay.id = "mediaLightbox";
  overlay.className = "media-lightbox";
  overlay.tabIndex = -1;
  overlay.hidden = true;
  overlay.innerHTML = [
    "<button type=\"button\" class=\"media-lightbox__close\" data-lightbox-close=\"1\" aria-label=\"Close\">✕</button>",
    "<div class=\"media-lightbox__stage\"></div>",
    "<div class=\"media-lightbox__caption\"></div>"
  ].join("");
  const closeBtn = overlay.querySelector(".media-lightbox__close");
  closeBtn?.addEventListener("click", () => {
    closeMediaLightbox();
  });
  const shouldKeepOpenForTarget = (target) => {
    if (!(target instanceof HTMLElement)) return false;
    if (target.closest("[data-lightbox-close=\"1\"]")) return false;
    if (target.closest(".media-lightbox__media")) return true;
    if (target.closest(".media-lightbox__actions")) return true;
    if (target.closest(".native-call-surface")) return true;
    if (target.closest(".message-swf-link")) return true;
    if (target.closest(".external-link-gate")) return true;
    if (target.closest(".incoming-call-gate")) return true;
    if (target.closest(".in-app-confirm")) return true;
    return false;
  };
  overlay.addEventListener("click", (event) => {
    if (!(event.target instanceof HTMLElement)) return;
    if (event.target.closest("[data-lightbox-close=\"1\"]")) {
      closeMediaLightbox();
      return;
    }
    if (shouldKeepOpenForTarget(event.target)) return;
    closeMediaLightbox();
  });
  document.body.appendChild(overlay);
  return overlay;
}

function hasPinnedNativeCallLightbox() {
  const sid = (xmppActiveNativeCallSessionId || "").toString().trim();
  if (!sid) return false;
  if (!xmppCallSessionById.has(sid)) return false;
  const overlay = document.getElementById("mediaLightbox");
  if (!overlay || overlay.hidden) return false;
  return Boolean(overlay.querySelector(".native-call-surface"));
}

function hasPinnedWebCallLightbox() {
  if (!activeWebCallLightbox) return false;
  const overlay = document.getElementById("mediaLightbox");
  if (!overlay || overlay.hidden) return false;
  return true;
}

function isNativeCallAudioTestActive(sessionId = "") {
  const sid = (sessionId || "").toString().trim();
  if (!sid || nativeCallAudioTestSessionId !== sid) return false;
  const audio = nativeCallAudioTestElement;
  if (!(audio instanceof HTMLAudioElement)) return false;
  return !audio.paused && !audio.ended;
}

function stopNativeCallAudioTest() {
  const audio = nativeCallAudioTestElement;
  if (audio instanceof HTMLAudioElement) {
    try {
      audio.pause();
      audio.currentTime = 0;
      audio.removeAttribute("src");
      audio.load();
    } catch {
      // Ignore audio cleanup failures.
    }
    audio.onended = null;
    audio.onerror = null;
  }
  nativeCallAudioTestElement = null;
  nativeCallAudioTestSessionId = "";
}

async function startNativeCallAudioTest(sessionId = "") {
  const sid = (sessionId || "").toString().trim();
  if (!sid) return false;
  const clipUrl = resolveMediaUrl("./rickroll.ogg");
  if (!clipUrl) return false;
  if (nativeCallAudioTestSessionId && nativeCallAudioTestSessionId !== sid) {
    stopNativeCallAudioTest();
  }
  let audio = nativeCallAudioTestElement;
  if (!(audio instanceof HTMLAudioElement)) {
    audio = new Audio();
    audio.preload = "auto";
    nativeCallAudioTestElement = audio;
  }
  nativeCallAudioTestSessionId = sid;
  audio.onended = () => {
    stopNativeCallAudioTest();
    if (xmppActiveNativeCallSessionId === sid) renderNativeXmppCallSurface(sid);
  };
  audio.onerror = () => {
    stopNativeCallAudioTest();
    showToast("Could not play local rickroll.ogg clip.", { tone: "error", duration: 2600 });
    if (xmppActiveNativeCallSessionId === sid) renderNativeXmppCallSurface(sid);
  };
  try {
    audio.pause();
    audio.src = clipUrl;
    audio.currentTime = 0;
    void applyAudioOutputDeviceToElement(audio, getPreferences().callAudioOutputId || "");
    await audio.play();
    if (xmppActiveNativeCallSessionId === sid) renderNativeXmppCallSurface(sid);
    return true;
  } catch {
    stopNativeCallAudioTest();
    showToast("Audio playback was blocked. Click the page and try again.", { tone: "error", duration: 2800 });
    if (xmppActiveNativeCallSessionId === sid) renderNativeXmppCallSurface(sid);
    return false;
  }
}

function closeMediaLightbox({ force = false } = {}) {
  if (!force && (hasPinnedNativeCallLightbox() || hasPinnedWebCallLightbox())) return false;
  const overlay = document.getElementById("mediaLightbox");
  if (!overlay) return false;
  overlay.hidden = true;
  const stage = overlay.querySelector(".media-lightbox__stage");
  if (stage) stage.innerHTML = "";
  xmppActiveNativeCallSessionId = "";
  nativeCallDebugDialogSessionId = "";
  if (nativeCallSurfaceTickerId) {
    clearTimeout(nativeCallSurfaceTickerId);
    nativeCallSurfaceTickerId = 0;
  }
  nativeCallSurfaceTickerSessionId = "";
  if (activeWebCallLightbox) {
    const { conversationId, conversationType, screenShare, fromLabel, incoming } = activeWebCallLightbox;
    activeWebCallLightbox = null;
    const conversation = resolveConversationById(conversationId, conversationType);
    if (conversation) {
      const endedText = incoming
        ? `Call with ${fromLabel || "peer"} ended.`
        : `Your ${screenShare ? "screen-share" : "voice/video"} call ended.`;
      if (addSystemMessageToConversation(conversation, endedText)) {
        refreshConversationUi(conversation);
        saveState();
      }
    }
  }
  stopWebCallRingtone();
  stopNativeCallAudioTest();
  document.body.style.removeProperty("overflow");
  return true;
}

function lightboxDownloadNameFromLabel(label = "", fallbackExt = "bin") {
  const ext = (fallbackExt || "bin").toString().replace(/^\./, "").toLowerCase() || "bin";
  const base = (label || "media")
    .toString()
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, " ")
    .slice(0, 64)
    || "media";
  if (/\.[a-z0-9]{1,8}$/i.test(base)) return base;
  return `${base}.${ext}`;
}

function triggerMediaDownload(url, filename = "media.bin") {
  const href = resolveMediaUrl((url || "").toString().trim());
  if (!href) return;
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = filename || "media.bin";
  anchor.rel = "noopener noreferrer";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

function bindMediaPreviewContextMenu(target, {
  url = "",
  label = "media",
  fallbackExt = "bin"
} = {}) {
  if (!(target instanceof HTMLElement)) return;
  const mediaUrl = resolveMediaUrl(url);
  if (!mediaUrl) return;
  target.addEventListener("contextmenu", (event) => {
    openContextMenu(event, [
      {
        label: "Copy Media URL",
        action: () => copyText(mediaUrl)
      },
      {
        label: "Download Media",
        action: () => {
          triggerMediaDownload(mediaUrl, lightboxDownloadNameFromLabel(label, fallbackExt));
        }
      }
    ]);
  });
}

function showInAppConfirmDialog({
  title = "Confirm action",
  message = "",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  hideCancel = false
} = {}) {
  return new Promise((resolve) => {
    const overlay = ensureMediaLightbox();
    const stage = overlay.querySelector(".media-lightbox__stage");
    const caption = overlay.querySelector(".media-lightbox__caption");
    if (!stage || !caption) {
      resolve(false);
      return;
    }
    stage.innerHTML = "";
    const card = document.createElement("div");
    card.className = "in-app-confirm";
    const heading = document.createElement("strong");
    heading.textContent = title;
    const body = document.createElement("div");
    body.className = "in-app-confirm__body";
    body.textContent = message || "";
    const actions = document.createElement("div");
    actions.className = "in-app-confirm__actions";
    const confirmBtn = document.createElement("button");
    confirmBtn.type = "button";
    confirmBtn.textContent = confirmLabel;
    if (danger) confirmBtn.classList.add("is-danger");
    let settled = false;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      closeMediaLightbox();
      resolve(Boolean(result));
    };
    confirmBtn.addEventListener("click", () => finish(true));
    actions.appendChild(confirmBtn);
    if (!hideCancel) {
      const cancelBtn = document.createElement("button");
      cancelBtn.type = "button";
      cancelBtn.textContent = cancelLabel;
      cancelBtn.addEventListener("click", () => finish(false));
      actions.appendChild(cancelBtn);
    }
    card.appendChild(heading);
    if (message) card.appendChild(body);
    card.appendChild(actions);
    stage.appendChild(card);
    caption.textContent = "Confirmation";
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    overlay.focus({ preventScroll: true });
  });
}

function showInAppAlertDialog({
  title = "Notice",
  message = "",
  confirmLabel = "OK"
} = {}) {
  return showInAppConfirmDialog({
    title,
    message,
    confirmLabel,
    hideCancel: true
  });
}

function showInAppPromptDialog({
  title = "Enter value",
  message = "",
  defaultValue = "",
  placeholder = "",
  confirmLabel = "OK",
  cancelLabel = "Cancel",
  multiline = false
} = {}) {
  return new Promise((resolve) => {
    const overlay = ensureMediaLightbox();
    const stage = overlay.querySelector(".media-lightbox__stage");
    const caption = overlay.querySelector(".media-lightbox__caption");
    if (!stage || !caption) {
      resolve(null);
      return;
    }
    stage.innerHTML = "";
    const card = document.createElement("div");
    card.className = "in-app-confirm";
    const heading = document.createElement("strong");
    heading.textContent = title;
    const body = document.createElement("div");
    body.className = "in-app-confirm__body";
    body.textContent = message || "";
    const input = multiline ? document.createElement("textarea") : document.createElement("input");
    input.className = "in-app-confirm__input";
    input.value = (defaultValue ?? "").toString();
    input.placeholder = placeholder || "";
    if (!multiline) input.type = "text";
    const actions = document.createElement("div");
    actions.className = "in-app-confirm__actions";
    const confirmBtn = document.createElement("button");
    confirmBtn.type = "button";
    confirmBtn.textContent = confirmLabel;
    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.textContent = cancelLabel;
    let settled = false;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      closeMediaLightbox();
      resolve(value);
    };
    confirmBtn.addEventListener("click", () => finish(input.value));
    cancelBtn.addEventListener("click", () => finish(null));
    input.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        finish(null);
        return;
      }
      if (!multiline && event.key === "Enter") {
        event.preventDefault();
        finish(input.value);
      }
    });
    actions.appendChild(confirmBtn);
    actions.appendChild(cancelBtn);
    card.appendChild(heading);
    if (message) card.appendChild(body);
    card.appendChild(input);
    card.appendChild(actions);
    stage.appendChild(card);
    caption.textContent = "Input";
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    overlay.focus({ preventScroll: true });
    requestAnimationFrame(() => {
      try {
        input.focus();
        input.select?.();
      } catch {
        // Ignore focus failures.
      }
    });
  });
}

function showInAppCopyDialog(text = "") {
  return new Promise((resolve) => {
    const overlay = ensureMediaLightbox();
    const stage = overlay.querySelector(".media-lightbox__stage");
    const caption = overlay.querySelector(".media-lightbox__caption");
    if (!stage || !caption) {
      resolve(false);
      return;
    }
    stage.innerHTML = "";
    const card = document.createElement("div");
    card.className = "in-app-confirm";
    const heading = document.createElement("strong");
    heading.textContent = "Copy text";
    const body = document.createElement("div");
    body.className = "in-app-confirm__body";
    body.textContent = "Select the text below and copy it.";
    const area = document.createElement("textarea");
    area.className = "in-app-confirm__input";
    area.readOnly = true;
    area.value = (text ?? "").toString();
    const actions = document.createElement("div");
    actions.className = "in-app-confirm__actions";
    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.textContent = "Close";
    closeBtn.addEventListener("click", () => {
      closeMediaLightbox();
      resolve(true);
    });
    actions.appendChild(closeBtn);
    card.appendChild(heading);
    card.appendChild(body);
    card.appendChild(area);
    card.appendChild(actions);
    stage.appendChild(card);
    caption.textContent = "Manual copy";
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    overlay.focus({ preventScroll: true });
    requestAnimationFrame(() => {
      try {
        area.focus();
        area.select();
      } catch {
        // Ignore focus failures.
      }
    });
  });
}

function openMediaLightbox({ url, label = "", video = false } = {}) {
  if (!url) return;
  const mediaUrl = resolveMediaUrl(url);
  const overlay = ensureMediaLightbox();
  const stage = overlay.querySelector(".media-lightbox__stage");
  const caption = overlay.querySelector(".media-lightbox__caption");
  if (!stage || !caption) return;
  stage.innerHTML = "";
  let media = null;
  const normalizedLabel = (label || "").toString().trim() || "media";
  const fallbackExt = video ? "mp4" : "png";
  if (video) {
    media = createVideoPreviewElement(mediaUrl, label || "Video", stage);
    media.className = "media-lightbox__media";
    bindMediaPreviewContextMenu(media, {
      url: mediaUrl,
      label: normalizedLabel,
      fallbackExt
    });
  } else {
    media = document.createElement("img");
    media.className = "media-lightbox__media";
    media.alt = label || "media preview";
    media.loading = "eager";
    media.src = mediaUrl;
    media.addEventListener("error", () => {
      const note = document.createElement("div");
      note.className = "message-embed-note";
      note.textContent = "Preview unavailable. Open in a new tab.";
      const openLink = document.createElement("a");
      openLink.className = "message-swf-link";
      openLink.href = mediaUrl;
      openLink.target = "_blank";
      openLink.rel = "noopener noreferrer";
      openLink.textContent = "Open media";
      stage.innerHTML = "";
      stage.appendChild(note);
      stage.appendChild(openLink);
    });
    bindMediaPreviewContextMenu(media, {
      url: mediaUrl,
      label: normalizedLabel,
      fallbackExt: /\.svg(\?|#|$)/i.test(mediaUrl) ? "svg" : fallbackExt
    });
  }
  stage.appendChild(media);
  const actions = document.createElement("div");
  actions.className = "media-lightbox__actions";
  const copyBtn = document.createElement("button");
  copyBtn.type = "button";
  copyBtn.textContent = "Copy URL";
  copyBtn.addEventListener("click", async () => {
    const copied = await copyText(mediaUrl);
    showToast(copied ? "URL copied." : "Could not copy URL.", { tone: copied ? "info" : "error" });
  });
  const downloadBtn = document.createElement("button");
  downloadBtn.type = "button";
  downloadBtn.textContent = "Download";
  downloadBtn.addEventListener("click", () => {
    const resolvedExt = /\.svg(\?|#|$)/i.test(mediaUrl)
      ? "svg"
      : fallbackExt;
    triggerMediaDownload(mediaUrl, lightboxDownloadNameFromLabel(normalizedLabel, resolvedExt));
  });
  actions.appendChild(copyBtn);
  actions.appendChild(downloadBtn);
  stage.appendChild(actions);
  caption.textContent = label || "";
  overlay.hidden = false;
  document.body.style.overflow = "hidden";
  overlay.focus({ preventScroll: true });
}

function showExternalLinkPrompt(targetUrl, { allowEmbed = true } = {}) {
  const overlay = ensureMediaLightbox();
  const stage = overlay.querySelector(".media-lightbox__stage");
  const caption = overlay.querySelector(".media-lightbox__caption");
  if (!stage || !caption) return;
  stage.innerHTML = "";
  const gate = document.createElement("div");
  gate.className = "external-link-gate";
  const title = document.createElement("strong");
  title.textContent = "Open external link?";
  const preview = document.createElement("code");
  preview.className = "external-link-gate__url";
  preview.textContent = targetUrl;
  const actions = document.createElement("div");
  actions.className = "external-link-gate__actions";
  const confirmBtn = document.createElement("button");
  confirmBtn.type = "button";
  confirmBtn.textContent = "Confirm";
  confirmBtn.addEventListener("click", () => {
    if (!allowEmbed) {
      showToast("External protocols are blocked in-app.", { tone: "warn" });
      closeMediaLightbox();
      return;
    }
    stage.innerHTML = "";
    const frame = document.createElement("iframe");
    frame.className = "media-lightbox__media media-lightbox__media--frame";
    frame.src = targetUrl;
    frame.loading = "eager";
    frame.referrerPolicy = "no-referrer";
    frame.allow = "fullscreen";
    const controls = document.createElement("div");
    controls.className = "external-link-gate__actions";
    const externalBtn = document.createElement("button");
    externalBtn.type = "button";
    externalBtn.textContent = "Open External";
    externalBtn.addEventListener("click", () => {
      if (nativeWindowOpen) {
        nativeWindowOpen(targetUrl, "_blank", "noopener,noreferrer");
      } else {
        window.location.href = targetUrl;
      }
    });
    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.textContent = "Close";
    closeBtn.addEventListener("click", () => closeMediaLightbox());
    controls.appendChild(externalBtn);
    controls.appendChild(closeBtn);
    stage.appendChild(frame);
    stage.appendChild(controls);
    caption.textContent = targetUrl;
  });
  const denyBtn = document.createElement("button");
  denyBtn.type = "button";
  denyBtn.textContent = "Deny";
  denyBtn.addEventListener("click", () => closeMediaLightbox());
  actions.appendChild(confirmBtn);
  actions.appendChild(denyBtn);
  gate.appendChild(title);
  gate.appendChild(preview);
  gate.appendChild(actions);
  stage.appendChild(gate);
  caption.textContent = "External link request";
  overlay.hidden = false;
  document.body.style.overflow = "hidden";
  overlay.focus({ preventScroll: true });
}

function openExternalUrlInClient(rawUrl) {
  const targetUrl = resolveMediaUrl((rawUrl || "").toString().trim());
  if (!targetUrl) return;
  const allowEmbed = /^https?:\/\//i.test(targetUrl);
  showExternalLinkPrompt(targetUrl, { allowEmbed });
}

if (nativeWindowOpen && window.__s67ExternalOpenProxy !== true) {
  window.__s67ExternalOpenProxy = true;
  window.open = (url) => {
    const targetUrl = (url || "").toString();
    if (/^s67:/i.test(targetUrl)) {
      return nativeWindowOpen(targetUrl, "_blank", "noopener");
    }
    openExternalUrlInClient(targetUrl);
    return null;
  };
}

window.addEventListener("s67-open-external-url", (event) => {
  const requestedUrl = (event?.detail || "").toString();
  if (!requestedUrl) return;
  openExternalUrlInClient(requestedUrl);
});

  globalScope.SHITCORD67_APP_OVERLAY_RUNTIME = Object.freeze({
    copyTextToChannelWithFeedback,
    ensureToastHost,
    showToast,
    ensureMediaLightbox,
    hasPinnedNativeCallLightbox,
    hasPinnedWebCallLightbox,
    isNativeCallAudioTestActive,
    stopNativeCallAudioTest,
    startNativeCallAudioTest,
    closeMediaLightbox,
    lightboxDownloadNameFromLabel,
    triggerMediaDownload,
    bindMediaPreviewContextMenu,
    showInAppConfirmDialog,
    showInAppAlertDialog,
    showInAppPromptDialog,
    showInAppCopyDialog,
    openMediaLightbox,
    showExternalLinkPrompt,
    openExternalUrlInClient
  });
})(typeof window !== "undefined" ? window : globalThis);
