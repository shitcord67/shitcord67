/*
 * Core app runtime extracted from app.js.
 * Loaded before app.js to provide shared platform, state, and UI bindings.
 */

function detectRuntimePlatform() {
  const ua = String(navigator.userAgent || "").toLowerCase();
  const platform = String(navigator.userAgentData?.platform || navigator.platform || "").toLowerCase();
  const haystack = `${ua} ${platform}`;
  const isAndroid = haystack.includes("android");
  const isiOS = /(iphone|ipad|ipod)/.test(haystack);
  const isMobile = isAndroid || isiOS || haystack.includes("mobile");
  return { isAndroid, isiOS, isMobile };
}

function looksLikeElectronUserAgent() {
  const ua = String(navigator.userAgent || "").toLowerCase();
  return /\belectron\/\d+/i.test(ua);
}

function applyPlatformMediaTweaks() {
  if (typeof document === "undefined" || !document.body) return;
  const preferNativeControls = document.body.dataset.platform === "android" || document.body.dataset.mobile === "on";
  document.querySelectorAll("video").forEach((node) => {
    if (!(node instanceof HTMLVideoElement)) return;
    if (preferNativeControls) node.controls = true;
  });
  videoPipRuntimes.forEach((runtime) => {
    if (runtime?.syncControls instanceof Function) runtime.syncControls();
  });
}

function applyRuntimePlatformHints() {
  if (typeof document === "undefined" || !document.body) return;
  const { isAndroid, isiOS, isMobile } = detectRuntimePlatform();
  document.body.dataset.platform = isAndroid ? "android" : isiOS ? "ios" : "desktop";
  document.body.dataset.mobile = isMobile ? "on" : "off";
  applyPlatformMediaTweaks();
  scheduleRuntimeSafeAreaUpdate();
}


function applyPlatformRuntimeInfo(info = {}) {
  if (!info || typeof info !== "object") return;
  const next = {
    ...platformRuntimeInfo,
    ...info
  };
  platformRuntimeInfo = next;
  const prefs = getPreferences();
  const override = normalizePlatformOverride(prefs.platformOverride);
  if (override && override !== "auto") {
    platformRuntimeInfo.override = override;
    if (override.includes(":")) {
      const [platform, sessionType] = override.split(":");
      platformRuntimeInfo.platform = platform || platformRuntimeInfo.platform;
      platformRuntimeInfo.sessionType = sessionType || platformRuntimeInfo.sessionType;
    } else {
      platformRuntimeInfo.platform = override;
    }
  }
}

function initElectronPlatformBridge() {
  const runtime = resolveElectronRuntime({ refresh: true });
  if (runtime?.bridge) {
    const { bridge } = runtime;
    if (typeof bridge.onPlatformInfo === "function") {
      bridge.onPlatformInfo((payload) => {
        applyPlatformRuntimeInfo(payload || {});
        renderPlatformDetectedNote();
      });
    }
    if (typeof bridge.requestPlatformInfo === "function") {
      bridge.requestPlatformInfo();
    }
    if (typeof bridge.onDevtoolsUnavailable === "function") {
      bridge.onDevtoolsUnavailable((payload) => {
        const reason = (payload?.reason || "").toString().trim();
        showToast(reason || "DevTools is unavailable in this runtime.", { tone: "error", duration: 4200 });
        if (typeof openXmppConsoleDialog === "function") openXmppConsoleDialog();
      });
    }
    return;
  }
  if (!runtime?.ipcRenderer) return;
  runtime.ipcRenderer.on("s67-platform-info", (_event, payload) => {
    applyPlatformRuntimeInfo(payload || {});
    renderPlatformDetectedNote();
  });
  runtime.ipcRenderer.send("s67-request-platform-info");
  runtime.ipcRenderer.on("s67-devtools-unavailable", (_event, payload) => {
    const reason = (payload?.reason || "").toString().trim();
    showToast(reason || "DevTools is unavailable in this runtime.", { tone: "error", duration: 4200 });
    if (typeof openXmppConsoleDialog === "function") openXmppConsoleDialog();
  });
}

function requestDevtoolsToggle() {
  const runtime = resolveElectronRuntime({ refresh: true });
  if (runtime?.bridge && typeof runtime.bridge.toggleDevtools === "function") {
    runtime.bridge.toggleDevtools();
    return true;
  }
  if (runtime?.ipcRenderer) {
    runtime.ipcRenderer.send("s67-toggle-devtools");
    return true;
  }
  if (!looksLikeElectronUserAgent() || typeof window === "undefined") return false;
  try {
    if (typeof window.open === "function") {
      window.open("s67://devtools/toggle", "_blank", "noopener");
    }
    window.location.href = "s67://devtools/toggle";
    return true;
  } catch {
    return false;
  }
}

function screenShareCapabilitySnapshot() {
  const platform = (platformRuntimeInfo.platform || "web").toString().toLowerCase();
  const sessionType = (platformRuntimeInfo.sessionType || "").toString().toLowerCase();
  const pipewire = (platformRuntimeInfo.pipewire || "on").toString().toLowerCase();
  const hasDisplay = Boolean(navigator.mediaDevices?.getDisplayMedia);
  if (!hasDisplay) {
    return { ok: false, reason: "Screen sharing is unavailable in this browser." };
  }
  if (platform === "android" || platform === "ios") {
    return { ok: false, reason: "Screen sharing is not supported on mobile yet." };
  }
  if (platform === "linux" && sessionType === "wayland") {
    if (pipewire === "off") {
      return { ok: true, warning: "Wayland screen share is configured with PipeWire off; capture may fail without PipeWire + xdg-desktop-portal." };
    }
    return { ok: true, warning: "Wayland screen sharing depends on PipeWire + xdg-desktop-portal." };
  }
  return { ok: true, warning: "" };
}

function currentPlatformDetectedLabel() {
  const info = platformRuntimeInfo || {};
  const platform = (info.platform || "web").toString();
  const sessionType = (info.sessionType || "").toString();
  const displayServer = (info.displayServer || "").toString();
  if (platform === "linux") {
    const suffix = sessionType && sessionType !== "n/a"
      ? `${sessionType}${displayServer && displayServer !== "unknown" ? `:${displayServer}` : ""}`
      : "unknown";
    return `Linux · ${suffix}`;
  }
  if (platform === "windows") return "Windows";
  if (platform === "darwin") return "macOS";
  if (platform === "android") return "Android";
  if (platform === "ios") return "iOS";
  return "Web";
}

function renderPlatformDetectedNote() {
  if (!ui.platformDetectedNote) return;
  const label = currentPlatformDetectedLabel();
  const override = normalizePlatformOverride(getPreferences().platformOverride);
  const overrideLabel = override && override !== "auto" ? ` (override: ${override})` : "";
  ui.platformDetectedNote.textContent = `Detected platform: ${label}${overrideLabel}.`;
  renderRuntimeDiagnosticsNote();
}

function runtimeDiagnosticsSnapshot() {
  const runtime = resolveElectronRuntime({ refresh: true });
  const hasBridge = Boolean(runtime?.bridge);
  const hasIpcRenderer = Boolean(runtime?.ipcRenderer);
  const inElectronShell = looksLikeElectronUserAgent();
  const route = hasBridge
    ? "preload-bridge"
    : (hasIpcRenderer ? "window.require" : (inElectronShell ? "electron-no-bridge" : "web"));
  const canToggleDevtools = hasBridge
    ? typeof runtime?.bridge?.toggleDevtools === "function"
    : (hasIpcRenderer || inElectronShell);
  return {
    route,
    hasBridge,
    hasIpcRenderer,
    inElectronShell,
    canToggleDevtools
  };
}

function renderRuntimeDiagnosticsNote() {
  if (!ui.runtimeDiagnosticsNote) return;
  const diagnostics = runtimeDiagnosticsSnapshot();
  if (diagnostics.route === "web") {
    ui.runtimeDiagnosticsNote.textContent = "Runtime diagnostics: web context (no Electron IPC bridge detected).";
    return;
  }
  const detail = diagnostics.route === "preload-bridge"
    ? "Preload bridge active"
    : diagnostics.route === "window.require"
      ? "Legacy window.require path active"
      : "Electron shell detected (bridge missing)";
  const ipcDetail = diagnostics.hasBridge || diagnostics.hasIpcRenderer ? "IPC ready" : "IPC unavailable";
  const devtoolsDetail = diagnostics.canToggleDevtools
    ? (diagnostics.route === "electron-no-bridge" ? "DevTools toggle fallback available" : "DevTools toggle available")
    : "DevTools toggle unavailable";
  ui.runtimeDiagnosticsNote.textContent = `Runtime diagnostics: ${detail} · ${ipcDetail} · ${devtoolsDetail}.`;
}

function renderEmojiToCanvasData(text, { size = 32 } = {}) {
  if (typeof document === "undefined") return "";
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.clearRect(0, 0, size, size);
  ctx.textBaseline = "top";
  ctx.font = `${size}px sans-serif`;
  ctx.fillText(text, 0, 0);
  return canvas.toDataURL();
}

let cachedBrandEmojiSupport = null;

function supportsEmojiGlyph(emoji) {
  if (cachedBrandEmojiSupport !== null) return cachedBrandEmojiSupport;
  const rendered = renderEmojiToCanvasData(emoji);
  const missing = renderEmojiToCanvasData(SHITCORD_EMOJI_FALLBACK_GLYPH);
  if (!rendered || !missing) {
    cachedBrandEmojiSupport = false;
    return cachedBrandEmojiSupport;
  }
  cachedBrandEmojiSupport = rendered !== missing;
  return cachedBrandEmojiSupport;
}

const MOBILE_SIDEBAR_BREAKPOINT_PX = 760;
const mobileLayoutMediaQuery = typeof window !== "undefined" && typeof window.matchMedia === "function"
  ? window.matchMedia(`(max-width: ${MOBILE_SIDEBAR_BREAKPOINT_PX}px)`)
  : null;

let runtimeSafeAreaRaf = 0;
let runtimeImeOffsetPx = 0;
let runtimeKeyboardAdjustRaf = 0;
let mobileSwipeNavState = null;

function normalizeNativeAndroidInsets(rawInsets) {
  if (typeof normalizeNativeAndroidInsetsViaModule === "function") {
    return normalizeNativeAndroidInsetsViaModule(rawInsets);
  }
  if (!rawInsets || typeof rawInsets !== "object") return null;
  const top = Number(rawInsets.top);
  const right = Number(rawInsets.right);
  const bottom = Number(rawInsets.bottom);
  const left = Number(rawInsets.left);
  if (![top, right, bottom, left].every((value) => Number.isFinite(value) && value >= 0)) {
    return null;
  }
  return {
    top: Math.round(top),
    right: Math.round(right),
    bottom: Math.round(bottom),
    left: Math.round(left)
  };
}

function captureRuntimeMessageListAnchor(list) {
  if (!(list instanceof HTMLElement)) return null;
  const listRect = list.getBoundingClientRect();
  const rows = [...list.querySelectorAll(".message[data-message-id]")];
  for (const row of rows) {
    if (!(row instanceof HTMLElement)) continue;
    const rect = row.getBoundingClientRect();
    if (rect.bottom < listRect.top + 2) continue;
    return {
      messageId: (row.dataset.messageId || "").toString(),
      offsetTop: rect.top - listRect.top
    };
  }
  return null;
}

function restoreRuntimeMessageListAnchor(list, anchor) {
  if (!(list instanceof HTMLElement) || !anchor?.messageId) return false;
  const row = list.querySelector(`[data-message-id="${anchor.messageId}"]`);
  if (!(row instanceof HTMLElement)) return false;
  const listRect = list.getBoundingClientRect();
  const rect = row.getBoundingClientRect();
  list.scrollTop += (rect.top - listRect.top) - (Number(anchor.offsetTop) || 0);
  return true;
}

function scheduleRuntimeKeyboardListAdjust() {
  if (typeof window === "undefined") return;
  const list = document.getElementById("messageList");
  if (!(list instanceof HTMLElement)) return;
  const anchor = captureRuntimeMessageListAnchor(list);
  if (runtimeKeyboardAdjustRaf) window.cancelAnimationFrame(runtimeKeyboardAdjustRaf);
  runtimeKeyboardAdjustRaf = window.requestAnimationFrame(() => {
    runtimeKeyboardAdjustRaf = 0;
    const currentList = document.getElementById("messageList");
    if (!(currentList instanceof HTMLElement)) return;
    if (anchor) {
      restoreRuntimeMessageListAnchor(currentList, anchor);
    }
    if (typeof updateJumpToBottomButton === "function") updateJumpToBottomButton();
  });
}

function updateRuntimeSafeArea() {
  runtimeSafeAreaRaf = 0;
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (!root) return;
  const body = document.body || null;
  const nativeInsets = normalizeNativeAndroidInsets(window.__shitcord67AndroidInsets);
  const hasNativeInsets = Boolean(nativeInsets && (nativeInsets.top || nativeInsets.right || nativeInsets.bottom || nativeInsets.left));
  const isAndroid = body?.dataset?.platform === "android" || hasNativeInsets;
  const isMobileRuntime = body?.dataset?.mobile === "on" || isAndroid;
  const viewport = window.visualViewport;
  let safeTop = 0;
  let safeRight = 0;
  let safeBottom = 0;
  let safeLeft = 0;
  if (viewport) {
    const offsetTop = Number.isFinite(viewport.offsetTop) ? viewport.offsetTop : 0;
    const offsetLeft = Number.isFinite(viewport.offsetLeft) ? viewport.offsetLeft : 0;
    const height = Number.isFinite(viewport.height) ? viewport.height : window.innerHeight;
    const width = Number.isFinite(viewport.width) ? viewport.width : window.innerWidth;
    const innerHeight = Number.isFinite(window.innerHeight) ? window.innerHeight : height;
    const innerWidth = Number.isFinite(window.innerWidth) ? window.innerWidth : width;
    safeTop = Math.max(0, offsetTop);
    safeLeft = Math.max(0, offsetLeft);
    safeBottom = Math.max(0, innerHeight - (height + offsetTop));
    safeRight = Math.max(0, innerWidth - (width + offsetLeft));
  }
  if (nativeInsets) {
    safeTop = Math.max(safeTop, nativeInsets.top);
    safeRight = Math.max(safeRight, nativeInsets.right);
    safeBottom = Math.max(safeBottom, nativeInsets.bottom);
    safeLeft = Math.max(safeLeft, nativeInsets.left);
  }
  const viewportHeight = viewport && Number.isFinite(viewport.height) ? viewport.height : window.innerHeight;
  const viewportOffsetTop = viewport && Number.isFinite(viewport.offsetTop) ? viewport.offsetTop : 0;
  const keyboardGap = Math.max(0, (Number.isFinite(window.innerHeight) ? window.innerHeight : viewportHeight) - (viewportHeight + viewportOffsetTop));
  const imeOffset = isMobileRuntime && keyboardGap >= 64 ? keyboardGap : 0;
  const roundedImeOffsetPx = Math.round(imeOffset);
  const imeOffsetChanged = Math.abs(runtimeImeOffsetPx - roundedImeOffsetPx) >= 6;
  runtimeImeOffsetPx = roundedImeOffsetPx;
  if (isAndroid) {
    const keyboardLikelyOpen = keyboardGap >= 110;
    const screenHeight = Number.isFinite(window.screen?.height) ? window.screen.height : 0;
    const screenWidth = Number.isFinite(window.screen?.width) ? window.screen.width : 0;
    const availHeight = Number.isFinite(window.screen?.availHeight) ? window.screen.availHeight : 0;
    const availWidth = Number.isFinite(window.screen?.availWidth) ? window.screen.availWidth : 0;
    const innerHeight = Number.isFinite(window.innerHeight) ? window.innerHeight : 0;
    const innerWidth = Number.isFinite(window.innerWidth) ? window.innerWidth : 0;
    const statusGuess = screenHeight && innerHeight ? Math.max(0, screenHeight - innerHeight) : 0;
    const navHeightGuess = screenHeight && availHeight ? Math.max(0, screenHeight - availHeight) : 0;
    const navWidthGuess = screenWidth && availWidth ? Math.max(0, screenWidth - availWidth) : 0;
    const nativeTop = hasNativeInsets ? Math.max(0, Math.round(nativeInsets.top || 0)) : 0;
    const nativeBottom = hasNativeInsets ? Math.max(0, Math.round(nativeInsets.bottom || 0)) : 0;
    const fallbackTop = Math.max(nativeTop, 56, hasNativeInsets ? 0 : Math.round(statusGuess * 0.65));
    const fallbackBottom = hasNativeInsets
      ? Math.max(34, nativeBottom)
      : Math.max(42, Math.round(navHeightGuess), Math.round(statusGuess * 0.45));
    const fallbackSide = hasNativeInsets
      ? 0
      : Math.max(0, Math.round(navWidthGuess * 0.5), screenWidth > 0 && innerWidth > 0 && innerWidth < screenWidth ? 8 : 0);
    const nextTop = `${fallbackTop}px`;
    const nextBottom = `${keyboardLikelyOpen ? 0 : fallbackBottom}px`;
    const nextSide = `${fallbackSide}px`;
    root.style.setProperty("--android-safe-extra-top", nextTop);
    root.style.setProperty("--android-safe-extra-bottom", nextBottom);
    root.style.setProperty("--android-safe-extra-left", nextSide);
    root.style.setProperty("--android-safe-extra-right", nextSide);
    if (body) {
      body.style.setProperty("--android-safe-extra-top", nextTop);
      body.style.setProperty("--android-safe-extra-bottom", nextBottom);
      body.style.setProperty("--android-safe-extra-left", nextSide);
      body.style.setProperty("--android-safe-extra-right", nextSide);
    }
  }
  const nextImeOffset = `${roundedImeOffsetPx}px`;
  root.style.setProperty("--runtime-ime-offset", nextImeOffset);
  const nextSafeTop = `${Math.round(safeTop)}px`;
  const nextSafeRight = `${Math.round(safeRight)}px`;
  const nextSafeBottom = `${Math.round(safeBottom)}px`;
  const nextSafeLeft = `${Math.round(safeLeft)}px`;
  root.style.setProperty("--runtime-safe-top", nextSafeTop);
  root.style.setProperty("--runtime-safe-right", nextSafeRight);
  root.style.setProperty("--runtime-safe-bottom", nextSafeBottom);
  root.style.setProperty("--runtime-safe-left", nextSafeLeft);
  if (body) {
    body.style.setProperty("--runtime-ime-offset", nextImeOffset);
    body.style.setProperty("--runtime-safe-top", nextSafeTop);
    body.style.setProperty("--runtime-safe-right", nextSafeRight);
    body.style.setProperty("--runtime-safe-bottom", nextSafeBottom);
    body.style.setProperty("--runtime-safe-left", nextSafeLeft);
    if (isMobileRuntime) {
      body.dataset.keyboardOpen = roundedImeOffsetPx >= 64 ? "on" : "off";
    } else if (body.dataset.keyboardOpen) {
      body.dataset.keyboardOpen = "off";
    }
  }
  if (isMobileRuntime && imeOffsetChanged) scheduleRuntimeKeyboardListAdjust();
}

function scheduleRuntimeSafeAreaUpdate() {
  if (runtimeSafeAreaRaf) return;
  runtimeSafeAreaRaf = window.requestAnimationFrame(updateRuntimeSafeArea);
}

if (typeof window !== "undefined") {
  scheduleRuntimeSafeAreaUpdate();
  window.addEventListener("resize", scheduleRuntimeSafeAreaUpdate, { passive: true });
  window.addEventListener("orientationchange", scheduleRuntimeSafeAreaUpdate, { passive: true });
  window.addEventListener("shitcord67:android-insets", scheduleRuntimeSafeAreaUpdate, { passive: true });
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", scheduleRuntimeSafeAreaUpdate, { passive: true });
    window.visualViewport.addEventListener("scroll", scheduleRuntimeSafeAreaUpdate, { passive: true });
  }
}

const MEDIA_TABS = ["gif", "sticker", "emoji", "swf", "svg", "pdf", "text", "docs", "html"];
const PROFILE_AVATAR_MAX_BYTES = 2 * 1024 * 1024;
const SHARD_ECONOMY = {
  starter: 20,
  messageEvery: 5,
  reactionEvery: 3,
  pollWorth: 4,
  badgeWorth: 3
};
const COSMETIC_ROTATION_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000;
const COSMETIC_ROTATION_ANCHOR_MS = Date.UTC(2024, 0, 1, 0, 0, 0);
const COSMETIC_SEASONS = [
  { key: "spring", label: "Spring Bloom", months: [2, 3, 4] },
  { key: "summer", label: "Summer Heat", months: [5, 6, 7] },
  { key: "autumn", label: "Autumn Circuit", months: [8, 9, 10] },
  { key: "winter", label: "Winter Pulse", months: [11, 0, 1] }
];
const COSMETIC_CATALOG = [
  { id: "decor_starlight", type: "decor", name: "Starlight", value: "✨", cost: 14, note: "Classic sparkle trim." },
  { id: "decor_flame", type: "decor", name: "Hotshot", value: "🔥", cost: 16, note: "Fire badge for high-energy profiles." },
  { id: "decor_diamond", type: "decor", name: "Rare Cut", value: "💎", cost: 18, note: "Glossy collector badge." },
  { id: "nameplate_aurora", type: "nameplate", name: "Aurora Ribbon", value: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 96'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' x2='1' y1='0' y2='1'%3E%3Cstop offset='0' stop-color='%2335c7a4'%3E%3Canimate attributeName='stop-color' values='%2335c7a4;%233f71ff;%238f56f2;%2335c7a4' dur='7s' repeatCount='indefinite'/%3E%3C/stop%3E%3Cstop offset='0.5' stop-color='%233f71ff'%3E%3Canimate attributeName='stop-color' values='%233f71ff;%238f56f2;%2335c7a4;%233f71ff' dur='7s' repeatCount='indefinite'/%3E%3C/stop%3E%3Cstop offset='1' stop-color='%238f56f2'%3E%3Canimate attributeName='stop-color' values='%238f56f2;%2335c7a4;%233f71ff;%238f56f2' dur='7s' repeatCount='indefinite'/%3E%3C/stop%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='320' height='96' rx='24' fill='url(%23g)'/%3E%3Crect width='96' height='96' rx='24' fill='rgba(255,255,255,0.16)'%3E%3Canimate attributeName='x' values='-110;340' dur='5.2s' repeatCount='indefinite'/%3E%3C/rect%3E%3C/svg%3E", cost: 28, note: "SMIL animated aurora sweep." },
  { id: "nameplate_flare", type: "nameplate", name: "Solar Flare", value: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 96'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' x2='1' y1='0.2' y2='0.8'%3E%3Cstop offset='0' stop-color='%23ff8a00'%3E%3Canimate attributeName='stop-color' values='%23ff8a00;%23ff3f5f;%23a62eff;%23ff8a00' dur='6.2s' repeatCount='indefinite'/%3E%3C/stop%3E%3Cstop offset='0.55' stop-color='%23ff3f5f'%3E%3Canimate attributeName='stop-color' values='%23ff3f5f;%23a62eff;%23ff8a00;%23ff3f5f' dur='6.2s' repeatCount='indefinite'/%3E%3C/stop%3E%3Cstop offset='1' stop-color='%23a62eff'%3E%3Canimate attributeName='stop-color' values='%23a62eff;%23ff8a00;%23ff3f5f;%23a62eff' dur='6.2s' repeatCount='indefinite'/%3E%3C/stop%3E%3C/linearGradient%3E%3CradialGradient id='flare' cx='0.2' cy='0.5' r='0.6'%3E%3Cstop offset='0' stop-color='rgba(255,255,255,0.45)'/%3E%3Cstop offset='1' stop-color='rgba(255,255,255,0)'/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width='320' height='96' rx='24' fill='url(%23g)'/%3E%3Cellipse cx='28' cy='48' rx='40' ry='42' fill='url(%23flare)'%3E%3Canimate attributeName='cx' values='26;300;26' dur='7.5s' repeatCount='indefinite'/%3E%3C/ellipse%3E%3C/svg%3E", cost: 30, note: "SMIL animated warm flare." },
  { id: "nameplate_wave", type: "nameplate", name: "Ocean Wave", value: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 96'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' x2='1' y1='0' y2='1'%3E%3Cstop offset='0' stop-color='%231da8ff'%3E%3Canimate attributeName='stop-color' values='%231da8ff;%232ed6c4;%232d5bff;%231da8ff' dur='8s' repeatCount='indefinite'/%3E%3C/stop%3E%3Cstop offset='0.55' stop-color='%232ed6c4'%3E%3Canimate attributeName='stop-color' values='%232ed6c4;%232d5bff;%231da8ff;%232ed6c4' dur='8s' repeatCount='indefinite'/%3E%3C/stop%3E%3Cstop offset='1' stop-color='%232d5bff'%3E%3Canimate attributeName='stop-color' values='%232d5bff;%231da8ff;%232ed6c4;%232d5bff' dur='8s' repeatCount='indefinite'/%3E%3C/stop%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='320' height='96' rx='24' fill='url(%23g)'/%3E%3Cpath d='M-24 66 C 16 52, 54 80, 100 66 C 146 52, 184 80, 230 66 C 274 53, 312 79, 354 66 L 354 110 L -24 110 Z' fill='rgba(255,255,255,0.22)'%3E%3CanimateTransform attributeName='transform' type='translate' values='0 0;-28 0;0 0' dur='6.6s' repeatCount='indefinite'/%3E%3C/path%3E%3C/svg%3E", cost: 30, note: "SMIL animated ocean shimmer." },
  { id: "effect_aurora", type: "effect", name: "Aurora", value: "aurora", cost: 20, note: "Green-blue-purple banner motion." },
  { id: "effect_flame", type: "effect", name: "Flame", value: "flame", cost: 22, note: "Orange-pink energetic sweep." },
  { id: "effect_ocean", type: "effect", name: "Ocean", value: "ocean", cost: 22, note: "Blue-cyan depth gradient." }
];
const COSMETIC_BUNDLE_CATALOG = [
  {
    id: "bundle_radiant_duo",
    name: "Radiant Duo",
    note: "Spark + aurora starter pack.",
    itemIds: ["decor_starlight", "effect_aurora"],
    discount: 4,
    seasons: ["spring", "winter"]
  },
  {
    id: "bundle_heatwave",
    name: "Heatwave Set",
    note: "Hotshot, Solar Flare, and Flame effect.",
    itemIds: ["decor_flame", "nameplate_flare", "effect_flame"],
    discount: 10,
    seasons: ["summer", "autumn"]
  },
  {
    id: "bundle_tidal_shine",
    name: "Tidal Shine",
    note: "Rare Cut with ocean visuals.",
    itemIds: ["decor_diamond", "nameplate_wave", "effect_ocean"],
    discount: 9,
    seasons: ["summer", "winter"]
  },
  {
    id: "bundle_aurora_crown",
    name: "Aurora Crown",
    note: "Premium gradient identity stack.",
    itemIds: ["decor_diamond", "nameplate_aurora", "effect_aurora"],
    discount: 8,
    seasons: ["spring", "autumn"]
  }
];
const mediaAllowOnceUrls = new Set();
const mediaAllowOnceAttachmentKeys = new Set();
const EMOJI_LIBRARY = [
  { name: "grinning", value: "😀", aliases: ["smile"], keywords: ["happy", "face"] },
  { name: "joy", value: "😂", aliases: ["lol"], keywords: ["laugh", "tears"] },
  { name: "smile", value: "😄", aliases: ["happy"], keywords: ["grin", "face"] },
  { name: "thinking", value: "🤔", aliases: ["hmm"], keywords: ["question", "idea"] },
  { name: "sob", value: "😭", aliases: ["cry"], keywords: ["sad", "tears"] },
  { name: "fire", value: "🔥", aliases: ["lit"], keywords: ["hot", "flame"] },
  { name: "thumbsup", value: "👍", aliases: ["approve"], keywords: ["yes", "ok"] },
  { name: "heart", value: "❤️", aliases: ["love"], keywords: ["like", "favorite"] },
  { name: "party", value: "🥳", aliases: ["celebrate"], keywords: ["birthday", "yay"] },
  { name: "eyes", value: "👀", aliases: ["look"], keywords: ["watch", "seeing"] },
  { name: "skull", value: "💀", aliases: ["dead"], keywords: ["bones", "spooky"] },
  { name: "sparkles", value: "✨", aliases: ["shine"], keywords: ["star", "magic"] },
  { name: "pray", value: "🙏", aliases: ["please"], keywords: ["thanks", "hope"] },
  { name: "ok_hand", value: "👌", aliases: ["ok"], keywords: ["good", "fine"] },
  { name: "wave", value: "👋", aliases: ["hello"], keywords: ["hi", "bye"] },
  { name: "clap", value: "👏", aliases: ["applause"], keywords: ["bravo", "hands"] },
  { name: "rocket", value: "🚀", aliases: ["launch"], keywords: ["ship", "space"] },
  { name: "tada", value: "🎉", aliases: ["confetti"], keywords: ["party", "celebration"] },
  { name: "100", value: "💯", aliases: ["perfect"], keywords: ["score", "full"] },
  { name: "warning", value: "⚠️", aliases: ["alert"], keywords: ["danger", "caution"] },
  { name: "check", value: "✅", aliases: ["done"], keywords: ["complete", "ok"] },
  { name: "x", value: "❌", aliases: ["no"], keywords: ["cancel", "wrong"] },
  { name: "bulb", value: "💡", aliases: ["idea"], keywords: ["light", "think"] },
  { name: "nerd", value: "🤓", aliases: ["smart"], keywords: ["glasses", "geek"] },
  { name: "sunglasses", value: "😎", aliases: ["cool"], keywords: ["sun", "vibe"] },
  { name: "angry", value: "😠", aliases: ["mad"], keywords: ["rage", "upset"] },
  { name: "sleeping", value: "😴", aliases: ["tired"], keywords: ["zzz", "rest"] },
  { name: "poop", value: "💩", aliases: ["shit"], keywords: ["funny", "pile"] },
  { name: "cat", value: "🐱", aliases: ["kitty"], keywords: ["pet", "animal"] },
  { name: "dog", value: "🐶", aliases: ["puppy"], keywords: ["pet", "animal"] },
  { name: "star", value: "⭐", aliases: ["favorite"], keywords: ["rating", "shine"] },
  { name: "moon", value: "🌙", aliases: ["night"], keywords: ["sleep", "sky"] }
];
const STICKER_LIBRARY = [
  { name: "blob wave", url: "https://media.tenor.com/LrSL7XDKVbgAAAAC/pepe-wave.gif" },
  { name: "cat vibing", url: "https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif" },
  { name: "ok hand", url: "https://media.giphy.com/media/111ebonMs90YLu/giphy.gif" },
  { name: "sad blob", url: "https://media.tenor.com/K7V8MDFMvxQAAAAC/blob-sad.gif" }
];
const GIF_LIBRARY = [
  { name: "good morning", url: "https://media.tenor.com/6IicLfOaw1AAAAPo/tora-dora-good-morning.mp4", preview: "video" },
  { name: "k pop", url: "https://media1.giphy.com/media/v1.Y2lkPTczYjhmN2IxamQ2eHU5cmJkOXZudTVzaW92cXZleDdpbTFqZ2U1aDJ2dXA1ZTYzNiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/l1Ku4uzAQLocVQtUc/100w.gif" },
  { name: "jurassic park", url: "https://media0.giphy.com/media/v1.Y2lkPTczYjhmN2Ixaml2dmUzdjVoODVwOWVqZGM1enFocGMwb2ZnZzJudWw5bWlkenhzZyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/37Fsl1eFxbhtu/100w.gif" },
  { name: "super bowl", url: "https://media2.giphy.com/media/v1.Y2lkPTczYjhmN2IxMjRjbDEzMDdhbGdwYzhlYnlqYmZwa2dlZzVuMG5rYjhmbXVoNHphNSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/FB7yASVBqPiFy/100w.gif" },
  { name: "blob wave", url: "https://media.tenor.com/LrSL7XDKVbgAAAAC/pepe-wave.gif" },
  { name: "cat vibing", url: "https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif" },
  { name: "ok hand", url: "https://media.giphy.com/media/111ebonMs90YLu/giphy.gif" },
  { name: "sad blob", url: "https://media.tenor.com/K7V8MDFMvxQAAAAC/blob-sad.gif" },
  { name: "clapping", url: "https://media.giphy.com/media/3o6Zt481isNVuQI1l6/giphy.gif" },
  { name: "mind blown", url: "https://media.giphy.com/media/lXu72d4iKwqek/giphy.gif" },
  { name: "typing", url: "https://media.giphy.com/media/13HgwGsXF0aiGY/giphy.gif" },
  { name: "thumbs up", url: "https://media.giphy.com/media/XreQmk7ETCak0/giphy.gif" }
];
const SVG_LIBRARY = [
  { name: "pulse ring", url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 120'%3E%3Crect width='200' height='120' fill='%231a1d25'/%3E%3Ccircle cx='100' cy='60' r='12' fill='%235865f2'%3E%3Canimate attributeName='r' values='8;42;8' dur='2.2s' repeatCount='indefinite'/%3E%3Canimate attributeName='opacity' values='1;0;1' dur='2.2s' repeatCount='indefinite'/%3E%3C/circle%3E%3C/svg%3E" },
  { name: "scan lines", url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 120'%3E%3Crect width='200' height='120' fill='%230f1116'/%3E%3Crect x='0' y='0' width='200' height='2' fill='%2357f287'%3E%3Canimate attributeName='y' values='0;118;0' dur='1.8s' repeatCount='indefinite'/%3E%3C/rect%3E%3C/svg%3E" },
  { name: "spinning cube", url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 120'%3E%3Crect width='200' height='120' fill='%2311161f'/%3E%3Cg transform='translate(100 60)'%3E%3Crect x='-18' y='-18' width='36' height='36' fill='none' stroke='%23f0b232' stroke-width='4'%3E%3CanimateTransform attributeName='transform' type='rotate' from='0' to='360' dur='2s' repeatCount='indefinite'/%3E%3C/rect%3E%3C/g%3E%3C/svg%3E" }
];

function createVoiceState() {
  return {
    connectedIds: [],
    mutedIds: [],
    raisedHandIds: [],
    speakerIds: [],
    activity: []
  };
}

function createId() {
  const cryptoApi = globalThis.crypto;
  if (cryptoApi && typeof cryptoApi.randomUUID === "function") {
    return cryptoApi.randomUUID();
  }
  if (cryptoApi && typeof cryptoApi.getRandomValues === "function") {
    const bytes = new Uint8Array(16);
    cryptoApi.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

function normalizeUsername(value) {
  return normalizeUsernameViaModule(value);
}

function sanitizeChannelName(value, fallback) {
  return sanitizeChannelNameViaModule(value, fallback);
}

function sanitizeForumTagName(value) {
  return sanitizeForumTagNameViaModule(value);
}

function normalizeComposerDrafts(value) {
  return normalizeComposerDraftsViaModule(value);
}

function clampMessageTextForStorage(value) {
  return clampMessageTextForStorageViaModule(value);
}

function escapeRegExp(value) {
  return escapeRegExpViaModule(value);
}

function toTimestampMs(value) {
  return toTimestampMsViaModule(value);
}

function rolePresetPermissions(preset) {
  if (preset === "admin") {
    return {
      administrator: true,
      manageChannels: true,
      manageRoles: true,
      manageMessages: true,
      stageModeration: true
    };
  }
  if (preset === "mod") {
    return {
      administrator: false,
      manageChannels: true,
      manageRoles: false,
      manageMessages: true,
      stageModeration: true
    };
  }
  return {
    administrator: false,
    manageChannels: false,
    manageRoles: false,
    manageMessages: false,
    stageModeration: false
  };
}

function createRole(name, color, preset = "member") {
  return {
    id: createId(),
    name,
    color,
    permissions: rolePresetPermissions(preset)
  };
}

let state = loadState();
let selectedSwitchAccountId = null;
let messageEditTarget = null;
let replyTarget = null;
let slashSelectionIndex = 0;
let mentionSelectionIndex = 0;
let contextMenuOpen = false;
let contextMenuFocusIndex = 0;
let contextMenuSubmenuAnchor = null;
let channelFilterTerm = "";
let dmSearchTerm = "";
let dmHomeRequestsFilter = "all";
let selectedUserPopoutId = null;
let mediaPickerOpen = false;
let mediaPickerTab = "gif";
let mediaPickerQuery = "";
let mediaPickerEmojiOnlyMode = false;
let mediaPickerEmojiSelectHandler = null;
let mediaUrlDialogResolver = null;
let gifPickerVisibleCount = GIF_PICKER_INITIAL_PAGE_SIZE;
let gifPickerRemoteEntries = [];
let gifPickerRemoteNext = "";
let gifPickerRemoteLoading = false;
let gifPickerRemoteError = "";
let gifPickerRemoteQueryKey = "";
let gifPickerRemoteRequestToken = 0;
let stickerPickerVisibleCount = STICKER_PICKER_INITIAL_PAGE_SIZE;
let stickerPickerRemoteEntries = [];
let stickerPickerRemoteNext = "";
let stickerPickerRemoteLoading = false;
let stickerPickerRemoteError = "";
let stickerPickerRemoteQueryKey = "";
let stickerPickerRemoteRequestToken = 0;
let tenorApiKeyVisible = false;
let emojiPickerVisibleCount = EMOJI_PICKER_INITIAL_PAGE_SIZE;
let emojiLibraryEntries = [...EMOJI_LIBRARY];
let emojiLibraryLoading = false;
let emojiLibraryLoaded = false;
let emojiLibraryError = "";
let emojiLibraryLoadPromise = null;
let gifPickerQueryDebounceTimer = null;
let swfLibrary = [];
const debugLogs = [];
const xmppDebugEvents = [];
let xmppDebugPaused = false;
let xmppDebugFilter = "all";
let xmppDebugSearch = "";
let swfShelfOpen = false;
let currentViewerSwf = null;
let currentViewerRuntimeKey = null;
let fullscreenRuntimeKey = null;
let fullscreenRuntimeWasPlaying = false;
let swfAudioFocusRuntimeKey = null;

function clearReplyComposer() {
  replyTarget = null;
  if (typeof renderReplyComposer === "function") {
    renderReplyComposer();
  } else if (ui?.composerReplyBar instanceof HTMLElement) {
    ui.composerReplyBar.classList.add("composer-reply--hidden");
    if (ui.replyPreviewText) ui.replyPreviewText.textContent = "";
  }
  if (typeof renderComposerMeta === "function") {
    renderComposerMeta();
  }
}
let swfSoloRuntimeKey = null;
let swfAudioUnlockArmed = true;
const swfRuntimes = new Map();
const swfPendingAudio = new Map();
const swfPendingUi = new Map();
const swfRuntimeTelemetry = new Map();
const swfRuntimeHoverOffTimerByKey = new Map();
const swfPipTabs = [];
let swfPipActiveKey = null;
let swfPipManuallyHidden = false;
let swfPipCollapsed = false;
const videoPipRuntimes = new Map();
let videoPipActiveKey = null;
let videoPipCollapsed = false;
let swfAnchorLayoutRaf = 0;
let swfPreviewBootstrapInFlight = false;
applyRuntimePlatformHints();
if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", applyRuntimePlatformHints, { once: true });
}
let mediaPickerRenderToken = 0;
let mediaRuntimeWarmed = false;
let mediaRuntimeBootstrapped = false;
let pdfRuntimeLoadPromise = null;
let mediaPickerScrollLoadRaf = 0;
let pipDragState = null;
let pipResizeState = null;
let pipSuppressHeaderToggle = false;
let videoPipSuppressHeaderToggle = false;
let swfLayoutResizeObserver = null;
let swfLayoutMutationObserver = null;
let swfPipDockResizeObserver = null;
let videoPipDockResizeObserver = null;
const nativeWindowOpen = typeof window.open === "function" ? window.open.bind(window) : null;
let toastHideTimer = null;
let composerPendingAttachment = null;
let composerPendingAttachments = [];
let composerDraftConversationId = null;
let composerDraftSaveTimer = null;
let composerMetaRefreshTimer = null;
let popoutPresenceRefreshTimer = null;
let composerTempLimitConversationId = null;
let composerTempLimitExtra = 0;
let composerCharCountClickTimer = null;
let scheduledDispatchTimer = null;
let memberSearchTerm = "";
let memberPresenceFilter = "all";
let quickSwitchQuery = "";
let quickSwitchSelectionIndex = 0;
let commandPaletteQuery = "";
let commandPaletteSelectionIndex = 0;
let findQuery = "";
let findAuthorFilter = "";
let findAfterFilter = "";
let findBeforeFilter = "";
let findHasLinkOnly = false;
let findHasMediaOnly = false;
let findHasAttachmentOnly = false;
let findHasReactionOnly = false;
let findHasPollOnly = false;
let findHasReplyOnly = false;
let findHasPinOnly = false;
let findHasCodeOnly = false;
let findSelectionIndex = 0;
let findRenderTimer = null;
let findMatchesCacheKey = "";
let findMatchesCache = [];
let findDialogCloseReason = "manual";
let findDialogPendingJumpId = "";
let findDialogPendingJumpToast = false;
let pendingFindJumpMessageId = "";
let pendingFindJumpAttempts = 0;
let lastRenderedMessageSignature = "";
let mediaDeviceSnapshot = { audio: [], video: [], output: [], ready: false, loading: false };
let platformRuntimeInfo = {
  platform: detectRuntimePlatform().isAndroid ? "android" : (detectRuntimePlatform().isiOS ? "ios" : "web"),
  sessionType: "n/a",
  displayServer: "n/a",
  override: "",
  pipewire: "on",
  ozoneHint: "auto"
};

function detectElectronRuntime() {
  if (typeof window === "undefined") return null;
  const bridge = window.s67Electron;
  if (bridge && typeof bridge === "object") {
    return { bridge };
  }
  if (typeof window.require !== "function") return null;
  try {
    const electron = window.require("electron");
    if (!electron?.ipcRenderer) return null;
    return electron;
  } catch {
    return null;
  }
}

let electronRuntime = detectElectronRuntime();

function resolveElectronRuntime({ refresh = false } = {}) {
  if (!refresh && electronRuntime) return electronRuntime;
  const detected = detectElectronRuntime();
  if (detected) {
    electronRuntime = detected;
  } else if (refresh) {
    electronRuntime = null;
  }
  return electronRuntime;
}

const ui = {
  loginScreen: document.getElementById("loginScreen"),
  chatScreen: document.getElementById("chatScreen"),
  loginForm: document.getElementById("loginForm"),
  loginSavedAccountWrap: document.getElementById("loginSavedAccountWrap"),
  loginSavedAccountSelect: document.getElementById("loginSavedAccountSelect"),
  loginLocalProfileWrap: document.getElementById("loginLocalProfileWrap"),
  loginLocalProfileSelect: document.getElementById("loginLocalProfileSelect"),
  loginUsername: document.getElementById("loginUsername"),
  loginPassword: document.getElementById("loginPassword"),
  loginShowPasswordInput: document.getElementById("loginShowPasswordInput"),
  loginXmppServer: document.getElementById("loginXmppServer"),
  loginRememberInput: document.getElementById("loginRememberInput"),
  loginProvidersBtn: document.getElementById("loginProvidersBtn"),
  loginRegisterBtn: document.getElementById("loginRegisterBtn"),
  loginStoragePermissionBtn: document.getElementById("loginStoragePermissionBtn"),
  loginXmppConsoleBtn: document.getElementById("loginXmppConsoleBtn"),
  loginLanguageBtn: document.getElementById("loginLanguageBtn"),
  loginXmppProgress: document.getElementById("loginXmppProgress"),
  loginXmppProgressStatus: document.getElementById("loginXmppProgressStatus"),
  loginXmppProgressTimer: document.getElementById("loginXmppProgressTimer"),
  loginXmppProgressDetail: document.getElementById("loginXmppProgressDetail"),
  languageOnboardingDialog: document.getElementById("languageOnboardingDialog"),
  languageOnboardingSelect: document.getElementById("languageOnboardingSelect"),
  languageOnboardingKeepAutoBtn: document.getElementById("languageOnboardingKeepAutoBtn"),
  languageOnboardingSwitchBtn: document.getElementById("languageOnboardingSwitchBtn"),
  serverBrand: document.getElementById("serverBrand"),
  serverBrandIcon: document.querySelector("#serverBrand .server-brand__icon"),
  serverBrandBadge: document.getElementById("serverBrandBadge"),
  serverList: document.getElementById("serverList"),
  dmSection: document.getElementById("dmSection"),
  guildSection: document.getElementById("guildSection"),
  toggleDmSectionBtn: document.getElementById("toggleDmSectionBtn"),
  toggleGuildSectionBtn: document.getElementById("toggleGuildSectionBtn"),
  toggleDmSectionChevron: document.getElementById("toggleDmSectionChevron"),
  toggleGuildSectionChevron: document.getElementById("toggleGuildSectionChevron"),
  channelList: document.getElementById("channelList"),
  dmList: document.getElementById("dmList"),
  dmSearchInput: document.getElementById("dmSearchInput"),
  dmHomeNav: document.getElementById("dmHomeNav"),
  dmHomeTabButtons: [...document.querySelectorAll(".dm-home-nav__item[data-dm-home-tab]")],
  dmHomeDivider: document.getElementById("dmHomeDivider"),
  newDmBtn: document.getElementById("newDmBtn"),
  addFriendDialog: document.getElementById("addFriendDialog"),
  addFriendForm: document.getElementById("addFriendForm"),
  addFriendIdentityInput: document.getElementById("addFriendIdentityInput"),
  addFriendDisplayInput: document.getElementById("addFriendDisplayInput"),
  addFriendXmppRequestInput: document.getElementById("addFriendXmppRequestInput"),
  addFriendCancelBtn: document.getElementById("addFriendCancelBtn"),
  addFriendSubmitBtn: document.getElementById("addFriendSubmitBtn"),
  channelFilterInput: document.getElementById("channelFilterInput"),
  memberList: document.getElementById("memberList"),
  memberPanelTitle: document.getElementById("memberPanelTitle"),
  memberSearchInput: document.getElementById("memberSearchInput"),
  memberPresenceFilterButtons: [...document.querySelectorAll(".member-filter-btn")],
  activeServerName: document.getElementById("activeServerName"),
  openGuildSettingsBtn: document.getElementById("openGuildSettingsBtn"),
  closeChannelPanelBtn: document.getElementById("closeChannelPanelBtn"),
  activeChannelName: document.getElementById("activeChannelName"),
  activeChannelGlyph: document.getElementById("activeChannelGlyph"),
  activeChannelLabel: document.getElementById("activeChannelLabel"),
  activeChannelDescription: document.getElementById("activeChannelDescription"),
  activeChannelTopic: document.getElementById("activeChannelTopic"),
  chatHeader: document.querySelector(".chat-header"),
  chatHeaderRight: document.querySelector(".chat-header__right"),
  relayHeaderBadge: document.getElementById("relayHeaderBadge"),
  omemoHeaderBtn: document.getElementById("omemoHeaderBtn"),
  openCallBtn: document.getElementById("openCallBtn"),
  openScreenShareBtn: document.getElementById("openScreenShareBtn"),
  openXmppCallBtn: document.getElementById("openXmppCallBtn"),
  copyCallLinkBtn: document.getElementById("copyCallLinkBtn"),
  openWhiteboardBtn: document.getElementById("openWhiteboardBtn"),
  markChannelReadBtn: document.getElementById("markChannelReadBtn"),
  nextUnreadBtn: document.getElementById("nextUnreadBtn"),
  openChannelSettingsBtn: document.getElementById("openChannelSettingsBtn"),
  openPinsBtn: document.getElementById("openPinsBtn"),
  openRolesBtn: document.getElementById("openRolesBtn"),
  openFindBtn: document.getElementById("openFindBtn"),
  openShortcutsBtn: document.getElementById("openShortcutsBtn"),
  toggleChannelPanelBtn: document.getElementById("toggleChannelPanelBtn"),
  toggleMemberPanelBtn: document.getElementById("toggleMemberPanelBtn"),
  toggleSwfShelfBtn: document.getElementById("toggleSwfShelfBtn"),
  editTopicBtn: document.getElementById("editTopicBtn"),
  messageList: document.getElementById("messageList"),
  jumpToBottomBtn: document.getElementById("jumpToBottomBtn"),
  channelPanel: document.getElementById("channelPanel"),
  memberPanel: document.getElementById("memberPanel"),
  swfShelf: document.getElementById("swfShelf"),
  swfShelfList: document.getElementById("swfShelfList"),
  clearSwfShelfBtn: document.getElementById("clearSwfShelfBtn"),
  chatPanel: document.querySelector(".chat-panel"),
  composerStack: document.querySelector(".composer-stack"),
  messageForm: document.getElementById("messageForm"),
  messageInput: document.getElementById("messageInput"),
  composerSystemNotice: document.getElementById("composerSystemNotice"),
  composerTypingNote: document.getElementById("composerTypingNote"),
  composerCharCount: document.getElementById("composerCharCount"),
  slashCommandPopup: document.getElementById("slashCommandPopup"),
  suggestionHint: document.getElementById("suggestionHint"),
  slashCommandList: document.getElementById("slashCommandList"),
  mediaPicker: document.getElementById("mediaPicker"),
  mediaSearchInput: document.getElementById("mediaSearchInput"),
  mediaGrid: document.getElementById("mediaGrid"),
  addMediaUrlBtn: document.getElementById("addMediaUrlBtn"),
  addMediaFileBtn: document.getElementById("addMediaFileBtn"),
  mediaFileInput: document.getElementById("mediaFileInput"),
  mediaUrlDialog: document.getElementById("mediaUrlDialog"),
  mediaUrlForm: document.getElementById("mediaUrlForm"),
  mediaUrlDialogTitle: document.getElementById("mediaUrlDialogTitle"),
  mediaUrlNameLabel: document.getElementById("mediaUrlNameLabel"),
  mediaUrlNameInput: document.getElementById("mediaUrlNameInput"),
  mediaUrlInput: document.getElementById("mediaUrlInput"),
  mediaUrlCancelBtn: document.getElementById("mediaUrlCancelBtn"),
  mediaTabs: [...document.querySelectorAll(".media-picker__tab")],
  openMediaPickerBtn: document.getElementById("openMediaPickerBtn"),
  openGifPickerBtn: document.getElementById("openGifPickerBtn"),
  openStickerPickerBtn: document.getElementById("openStickerPickerBtn"),
  openEmojiPickerBtn: document.getElementById("openEmojiPickerBtn"),
  quickFileAttachBtn: document.getElementById("quickFileAttachBtn"),
  quickAttachInput: document.getElementById("quickAttachInput"),
  toggleSwfAudioBtn: document.getElementById("toggleSwfAudioBtn"),
  toggleMediaPrivacyBtn: document.getElementById("toggleMediaPrivacyBtn"),
  composerReplyBar: document.getElementById("composerReplyBar"),
  replyPreviewText: document.getElementById("replyPreviewText"),
  cancelReplyBtn: document.getElementById("cancelReplyBtn"),
  composerAttachmentBar: document.getElementById("composerAttachmentBar"),
  composerAttachmentText: document.getElementById("composerAttachmentText"),
  composerAttachmentList: document.getElementById("composerAttachmentList"),
  saveComposerAttachmentBtn: document.getElementById("saveComposerAttachmentBtn"),
  clearComposerAttachmentBtn: document.getElementById("clearComposerAttachmentBtn"),
  findDialog: document.getElementById("findDialog"),
  findForm: document.getElementById("findForm"),
  findInput: document.getElementById("findInput"),
  findAuthorInput: document.getElementById("findAuthorInput"),
  findAfterInput: document.getElementById("findAfterInput"),
  findBeforeInput: document.getElementById("findBeforeInput"),
  findHasLinkInput: document.getElementById("findHasLinkInput"),
  findMeta: document.getElementById("findMeta"),
  findList: document.getElementById("findList"),
  findPrevBtn: document.getElementById("findPrevBtn"),
  findNextBtn: document.getElementById("findNextBtn"),
  findCancel: document.getElementById("findCancel"),
  quickSwitchDialog: document.getElementById("quickSwitchDialog"),
  quickSwitchForm: document.getElementById("quickSwitchForm"),
  quickSwitchInput: document.getElementById("quickSwitchInput"),
  quickSwitchList: document.getElementById("quickSwitchList"),
  quickSwitchCancel: document.getElementById("quickSwitchCancel"),
  commandPaletteDialog: document.getElementById("commandPaletteDialog"),
  commandPaletteForm: document.getElementById("commandPaletteForm"),
  commandPaletteInput: document.getElementById("commandPaletteInput"),
  commandPaletteList: document.getElementById("commandPaletteList"),
  commandPaletteCancel: document.getElementById("commandPaletteCancel"),
  settingsScreen: document.getElementById("settingsScreen"),
  settingsMobileTabs: document.getElementById("settingsMobileTabs"),
  dockAvatar: document.getElementById("dockAvatar"),
  dockPresenceDot: document.getElementById("dockPresenceDot"),
  dockName: document.getElementById("dockName"),
  dockStatus: document.getElementById("dockStatus"),
  selfProfileBtn: document.getElementById("selfProfileBtn"),
  dockMuteBtn: document.getElementById("dockMuteBtn"),
  dockHeadphonesBtn: document.getElementById("dockHeadphonesBtn"),
  openSettingsBtn: document.getElementById("openSettingsBtn"),
  openSettingsBtnMobile: document.getElementById("openSettingsBtnMobile"),
  createServerBtn: document.getElementById("createServerBtn"),
  createChannelBtn: document.getElementById("createChannelBtn"),
  profileDialog: document.getElementById("profileDialog"),
  profileForm: document.getElementById("profileForm"),
  displayNameInput: document.getElementById("displayNameInput"),
  profileBioInput: document.getElementById("profileBioInput"),
  profileStatusInput: document.getElementById("profileStatusInput"),
  profileStatusEmojiInput: document.getElementById("profileStatusEmojiInput"),
  profileAvatarDecorationInput: document.getElementById("profileAvatarDecorationInput"),
  profileGuildTagInput: document.getElementById("profileGuildTagInput"),
  profileEffectInput: document.getElementById("profileEffectInput"),
  profileNameplateSvgInput: document.getElementById("profileNameplateSvgInput"),
  profileStatusExpiryInput: document.getElementById("profileStatusExpiryInput"),
  profileGuildNicknameInput: document.getElementById("profileGuildNicknameInput"),
  profileGuildAvatarInput: document.getElementById("profileGuildAvatarInput"),
  profileGuildAvatarColorPicker: document.getElementById("profileGuildAvatarColorPicker"),
  profileGuildAvatarUrlInput: document.getElementById("profileGuildAvatarUrlInput"),
  profileGuildBannerInput: document.getElementById("profileGuildBannerInput"),
  profileGuildStatusInput: document.getElementById("profileGuildStatusInput"),
  presenceInput: document.getElementById("presenceInput"),
  profileBannerInput: document.getElementById("profileBannerInput"),
  profileAvatarInput: document.getElementById("profileAvatarInput"),
  profileAvatarColorPicker: document.getElementById("profileAvatarColorPicker"),
  profileAvatarUrlInput: document.getElementById("profileAvatarUrlInput"),
  profileAvatarPreview: document.getElementById("profileAvatarPreview"),
  profileIdentityPreview: document.getElementById("profileIdentityPreview"),
  profileIdentityPreviewBanner: document.getElementById("profileIdentityPreviewBanner"),
  profileIdentityPreviewAvatar: document.getElementById("profileIdentityPreviewAvatar"),
  profileIdentityPreviewName: document.getElementById("profileIdentityPreviewName"),
  profileIdentityPreviewStatus: document.getElementById("profileIdentityPreviewStatus"),
  profileIdentityClearBtn: document.getElementById("profileIdentityClearBtn"),
  profileOpenCosmeticsBtn: document.getElementById("profileOpenCosmeticsBtn"),
  profileAvatarUploadBtn: document.getElementById("profileAvatarUploadBtn"),
  profileAvatarClearBtn: document.getElementById("profileAvatarClearBtn"),
  profileAvatarUploadHint: document.getElementById("profileAvatarUploadHint"),
  profileAvatarFileInput: document.getElementById("profileAvatarFileInput"),
  profileCancel: document.getElementById("profileCancel"),
  createServerDialog: document.getElementById("createServerDialog"),
  createServerForm: document.getElementById("createServerForm"),
  serverTemplateInput: document.getElementById("serverTemplateInput"),
  serverStarterChannelsInput: document.getElementById("serverStarterChannelsInput"),
  serverNameInput: document.getElementById("serverNameInput"),
  serverCancel: document.getElementById("serverCancel"),
  guildSettingsDialog: document.getElementById("guildSettingsDialog"),
  guildSettingsForm: document.getElementById("guildSettingsForm"),
  guildSettingsNameInput: document.getElementById("guildSettingsNameInput"),
  guildSettingsDescriptionInput: document.getElementById("guildSettingsDescriptionInput"),
  guildSettingsAccentInput: document.getElementById("guildSettingsAccentInput"),
  guildSettingsAccentPicker: document.getElementById("guildSettingsAccentPicker"),
  guildSettingsCancel: document.getElementById("guildSettingsCancel"),
  deleteGuildBtn: document.getElementById("deleteGuildBtn"),
  createChannelDialog: document.getElementById("createChannelDialog"),
  createChannelForm: document.getElementById("createChannelForm"),
  channelNameInput: document.getElementById("channelNameInput"),
  channelTypeInput: document.getElementById("channelTypeInput"),
  channelCategoryInput: document.getElementById("channelCategoryInput"),
  channelCancel: document.getElementById("channelCancel"),
  topicDialog: document.getElementById("topicDialog"),
  topicForm: document.getElementById("topicForm"),
  topicInput: document.getElementById("topicInput"),
  topicCancel: document.getElementById("topicCancel"),
  messageEditDialog: document.getElementById("messageEditDialog"),
  messageEditForm: document.getElementById("messageEditForm"),
  messageEditInput: document.getElementById("messageEditInput"),
  shortcutsDialog: document.getElementById("shortcutsDialog"),
  messageEditCancel: document.getElementById("messageEditCancel"),
  selfMenuDialog: document.getElementById("selfMenuDialog"),
  selfPopoutBanner: document.getElementById("selfPopoutBanner"),
  selfPopoutAvatar: document.getElementById("selfPopoutAvatar"),
  selfPopoutName: document.getElementById("selfPopoutName"),
  selfPopoutStatus: document.getElementById("selfPopoutStatus"),
  selfPopoutXmppMeta: document.getElementById("selfPopoutXmppMeta"),
  selfPresenceSelect: document.getElementById("selfPresenceSelect"),
  selfPopoutBio: document.getElementById("selfPopoutBio"),
  selfPopoutRoles: document.getElementById("selfPopoutRoles"),
  selfEditProfile: document.getElementById("selfEditProfile"),
  selfCosmeticsShop: document.getElementById("selfCosmeticsShop"),
  selfQuestStats: document.getElementById("selfQuestStats"),
  selfSwitchAccount: document.getElementById("selfSwitchAccount"),
  selfLogout: document.getElementById("selfLogout"),
  userPopoutDialog: document.getElementById("userPopoutDialog"),
  userPopoutBanner: document.getElementById("userPopoutBanner"),
  userPopoutAvatar: document.getElementById("userPopoutAvatar"),
  userPopoutName: document.getElementById("userPopoutName"),
  userPopoutStatus: document.getElementById("userPopoutStatus"),
  userPopoutXmppMeta: document.getElementById("userPopoutXmppMeta"),
  userPopoutBio: document.getElementById("userPopoutBio"),
  userPopoutRoles: document.getElementById("userPopoutRoles"),
  userNoteInput: document.getElementById("userNoteInput"),
  userDmInput: document.getElementById("userDmInput"),
  userStartDmBtn: document.getElementById("userStartDmBtn"),
  userSendDmBtn: document.getElementById("userSendDmBtn"),
  userSaveNoteBtn: document.getElementById("userSaveNoteBtn"),
  userProfileExtendedDialog: document.getElementById("userProfileExtendedDialog"),
  userProfileExtendedAvatarBtn: document.getElementById("userProfileExtendedAvatarBtn"),
  userProfileExtendedAvatar: document.getElementById("userProfileExtendedAvatar"),
  userProfileExtendedName: document.getElementById("userProfileExtendedName"),
  userProfileExtendedStatus: document.getElementById("userProfileExtendedStatus"),
  userProfileExtendedTabs: [...document.querySelectorAll("[data-profile-extended-tab]")],
  userProfileExtendedGuildsPanel: document.getElementById("userProfileExtendedGuildsPanel"),
  userProfileExtendedFriendsPanel: document.getElementById("userProfileExtendedFriendsPanel"),
  userProfileExtendedCloseBtn: document.getElementById("userProfileExtendedCloseBtn"),
  accountSwitchDialog: document.getElementById("accountSwitchDialog"),
  accountSwitchForm: document.getElementById("accountSwitchForm"),
  accountList: document.getElementById("accountList"),
  newAccountInput: document.getElementById("newAccountInput"),
  accountCancel: document.getElementById("accountCancel"),
  xmppProviderDialog: document.getElementById("xmppProviderDialog"),
  xmppProviderList: document.getElementById("xmppProviderList"),
  xmppProviderCloseBtn: document.getElementById("xmppProviderCloseBtn"),
  xmppRegisterDialog: document.getElementById("xmppRegisterDialog"),
  xmppRegisterForm: document.getElementById("xmppRegisterForm"),
  registerJidInput: document.getElementById("registerJidInput"),
  registerPasswordInput: document.getElementById("registerPasswordInput"),
  registerXmppServerInput: document.getElementById("registerXmppServerInput"),
  registerOpenProviderBtn: document.getElementById("registerOpenProviderBtn"),
  registerCancelBtn: document.getElementById("registerCancelBtn"),
  registerSubmitBtn: document.getElementById("registerSubmitBtn"),
  settingsTitle: document.getElementById("settingsTitle"),
  closeSettingsBtn: document.getElementById("closeSettingsBtn"),
  settingsDisplayName: document.getElementById("settingsDisplayName"),
  settingsUsername: document.getElementById("settingsUsername"),
  settingsCurrentStatus: document.getElementById("settingsCurrentStatus"),
  settingsPresenceSelect: document.getElementById("settingsPresenceSelect"),
  settingsEditProfile: document.getElementById("settingsEditProfile"),
  settingsSwitchAccount: document.getElementById("settingsSwitchAccount"),
  settingsLogout: document.getElementById("settingsLogout"),
  settingsOpenProfileEditor: document.getElementById("settingsOpenProfileEditor"),
  guildNotifForm: document.getElementById("guildNotifForm"),
  guildNotifGuildName: document.getElementById("guildNotifGuildName"),
  guildNotifModeInput: document.getElementById("guildNotifModeInput"),
  appearanceForm: document.getElementById("appearanceForm"),
  privacyForm: document.getElementById("privacyForm"),
  voiceVideoForm: document.getElementById("voiceVideoForm"),
  uiScaleInput: document.getElementById("uiScaleInput"),
  themeInput: document.getElementById("themeInput"),
  uiAccentColorInput: document.getElementById("uiAccentColorInput"),
  uiAccentColorPicker: document.getElementById("uiAccentColorPicker"),
  languageInput: document.getElementById("languageInput"),
  compactModeInput: document.getElementById("compactModeInput"),
  enterToSendInput: document.getElementById("enterToSendInput"),
  quickSwitcherHotkeyInput: document.getElementById("quickSwitcherHotkeyInput"),
  reducedMotionInput: document.getElementById("reducedMotionInput"),
  uiIntensityInput: document.getElementById("uiIntensityInput"),
  advancedForm: document.getElementById("advancedForm"),
  mediaPrivacyModeInput: document.getElementById("mediaPrivacyModeInput"),
  developerModeInput: document.getElementById("developerModeInput"),
  debugOverlayInput: document.getElementById("debugOverlayInput"),
  rememberLoginStorageInput: document.getElementById("rememberLoginStorageInput"),
  credentialStoragePermissionNote: document.getElementById("credentialStoragePermissionNote"),
  credentialStoragePermissionBtn: document.getElementById("credentialStoragePermissionBtn"),
  platformOverrideInput: document.getElementById("platformOverrideInput"),
  platformDetectedNote: document.getElementById("platformDetectedNote"),
  runtimeDiagnosticsNote: document.getElementById("runtimeDiagnosticsNote"),
  swfAudioPolicyInput: document.getElementById("swfAudioPolicyInput"),
  swfAudioScopeInput: document.getElementById("swfAudioScopeInput"),
  swfAutoplayInput: document.getElementById("swfAutoplayInput"),
  hapticModeInput: document.getElementById("hapticModeInput"),
  swfPauseOnMuteInput: document.getElementById("swfPauseOnMuteInput"),
  swfVuMeterInput: document.getElementById("swfVuMeterInput"),
  androidSafeManualTopInput: document.getElementById("androidSafeManualTopInput"),
  androidSafeManualBottomInput: document.getElementById("androidSafeManualBottomInput"),
  mediaRuleInput: document.getElementById("mediaRuleInput"),
  mediaRuleKindInput: document.getElementById("mediaRuleKindInput"),
  addMediaRuleBtn: document.getElementById("addMediaRuleBtn"),
  mediaAllowRulesList: document.getElementById("mediaAllowRulesList"),
  mediaDenyRulesList: document.getElementById("mediaDenyRulesList"),
  tenorApiKeyInput: document.getElementById("tenorApiKeyInput"),
  tenorClientKeyInput: document.getElementById("tenorClientKeyInput"),
  tenorCredentialsStatus: document.getElementById("tenorCredentialsStatus"),
  toggleTenorApiKeyBtn: document.getElementById("toggleTenorApiKeyBtn"),
  testTenorCredentialsBtn: document.getElementById("testTenorCredentialsBtn"),
  clearTenorCredentialsBtn: document.getElementById("clearTenorCredentialsBtn"),
  relayModeInput: document.getElementById("relayModeInput"),
  relayUrlInput: document.getElementById("relayUrlInput"),
  relayRoomInput: document.getElementById("relayRoomInput"),
  relayAutoConnectInput: document.getElementById("relayAutoConnectInput"),
  relayStatusOutput: document.getElementById("relayStatusOutput"),
  relayConnectBtn: document.getElementById("relayConnectBtn"),
  relayDisconnectBtn: document.getElementById("relayDisconnectBtn"),
  xmppJidInput: document.getElementById("xmppJidInput"),
  xmppPasswordInput: document.getElementById("xmppPasswordInput"),
  xmppWsUrlInput: document.getElementById("xmppWsUrlInput"),
  xmppMucServiceInput: document.getElementById("xmppMucServiceInput"),
  xmppHideNonXmppInput: document.getElementById("xmppHideNonXmppInput"),
  callProviderInput: document.getElementById("callProviderInput"),
  callRoomPrefixInput: document.getElementById("callRoomPrefixInput"),
  callAutoPostInput: document.getElementById("callAutoPostInput"),
  callAudioInputSelect: document.getElementById("callAudioInputSelect"),
  callVideoInputSelect: document.getElementById("callVideoInputSelect"),
  callAudioOutputSelect: document.getElementById("callAudioOutputSelect"),
  callScreenSystemAudioInput: document.getElementById("callScreenSystemAudioInput"),
  callScreenMicMixInput: document.getElementById("callScreenMicMixInput"),
  refreshCallDevicesBtn: document.getElementById("refreshCallDevicesBtn"),
  whiteboardProviderInput: document.getElementById("whiteboardProviderInput"),
  whiteboardRoomPrefixInput: document.getElementById("whiteboardRoomPrefixInput"),
  whiteboardAutoPostInput: document.getElementById("whiteboardAutoPostInput"),
  exportDataBtn: document.getElementById("exportDataBtn"),
  importDataBtn: document.getElementById("importDataBtn"),
  importDataInput: document.getElementById("importDataInput"),
  exportSwfSavesBtn: document.getElementById("exportSwfSavesBtn"),
  importSwfSavesBtn: document.getElementById("importSwfSavesBtn"),
  importSwfSavesInput: document.getElementById("importSwfSavesInput"),
  openXmppConsoleBtn: document.getElementById("openXmppConsoleBtn"),
  openDebugConsoleBtn: document.getElementById("openDebugConsoleBtn"),
  channelSettingsDialog: document.getElementById("channelSettingsDialog"),
  channelSettingsForm: document.getElementById("channelSettingsForm"),
  channelRenameInput: document.getElementById("channelRenameInput"),
  channelSlowmodeInput: document.getElementById("channelSlowmodeInput"),
  channelPermRoleInput: document.getElementById("channelPermRoleInput"),
  channelPermViewInput: document.getElementById("channelPermViewInput"),
  channelPermSendInput: document.getElementById("channelPermSendInput"),
  channelPermReactInput: document.getElementById("channelPermReactInput"),
  channelPermThreadInput: document.getElementById("channelPermThreadInput"),
  channelSettingsCancel: document.getElementById("channelSettingsCancel"),
  deleteChannelBtn: document.getElementById("deleteChannelBtn"),
  rolesDialog: document.getElementById("rolesDialog"),
  rolesForm: document.getElementById("rolesForm"),
  roleNameInput: document.getElementById("roleNameInput"),
  roleColorInput: document.getElementById("roleColorInput"),
  roleColorPicker: document.getElementById("roleColorPicker"),
  rolePermPresetInput: document.getElementById("rolePermPresetInput"),
  createRoleNowBtn: document.getElementById("createRoleNowBtn"),
  assignRoleMemberInput: document.getElementById("assignRoleMemberInput"),
  assignRoleRoleInput: document.getElementById("assignRoleRoleInput"),
  assignRoleBtn: document.getElementById("assignRoleBtn"),
  removeRoleBtn: document.getElementById("removeRoleBtn"),
  rolesCloseBtn: document.getElementById("rolesCloseBtn"),
  pinsDialog: document.getElementById("pinsDialog"),
  pinsForm: document.getElementById("pinsForm"),
  pinsSearchInput: document.getElementById("pinsSearchInput"),
  pinsSortInput: document.getElementById("pinsSortInput"),
  pinsList: document.getElementById("pinsList"),
  pinsCloseBtn: document.getElementById("pinsCloseBtn"),
  debugDialog: document.getElementById("debugDialog"),
  debugForm: document.getElementById("debugForm"),
  debugOutput: document.getElementById("debugOutput"),
  copyDebugBtn: document.getElementById("copyDebugBtn"),
  refreshDebugBtn: document.getElementById("refreshDebugBtn"),
  clearDebugBtn: document.getElementById("clearDebugBtn"),
  debugCloseBtn: document.getElementById("debugCloseBtn"),
  xmppConsoleDialog: document.getElementById("xmppConsoleDialog"),
  xmppConsoleForm: document.getElementById("xmppConsoleForm"),
  xmppConsoleFilterInput: document.getElementById("xmppConsoleFilterInput"),
  xmppConsoleSearchInput: document.getElementById("xmppConsoleSearchInput"),
  xmppConsoleOutput: document.getElementById("xmppConsoleOutput"),
  copyXmppConsoleBtn: document.getElementById("copyXmppConsoleBtn"),
  refreshXmppConsoleBtn: document.getElementById("refreshXmppConsoleBtn"),
  pauseXmppConsoleBtn: document.getElementById("pauseXmppConsoleBtn"),
  clearXmppConsoleBtn: document.getElementById("clearXmppConsoleBtn"),
  xmppConsoleCloseBtn: document.getElementById("xmppConsoleCloseBtn"),
  cosmeticsDialog: document.getElementById("cosmeticsDialog"),
  cosmeticsForm: document.getElementById("cosmeticsForm"),
  cosmeticsBalance: document.getElementById("cosmeticsBalance"),
  cosmeticsProgress: document.getElementById("cosmeticsProgress"),
  cosmeticsFeatured: document.getElementById("cosmeticsFeatured"),
  cosmeticsFeaturedLabel: document.getElementById("cosmeticsFeaturedLabel"),
  cosmeticsFeaturedCountdown: document.getElementById("cosmeticsFeaturedCountdown"),
  cosmeticsFeaturedGrid: document.getElementById("cosmeticsFeaturedGrid"),
  cosmeticsSearchInput: document.getElementById("cosmeticsSearchInput"),
  cosmeticsSortInput: document.getElementById("cosmeticsSortInput"),
  cosmeticsGrid: document.getElementById("cosmeticsGrid"),
  cosmeticsCloseBtn: document.getElementById("cosmeticsCloseBtn"),
  cosmeticsTabs: [...document.querySelectorAll("[data-cosmetics-tab]")],
  guildTagInfoDialog: document.getElementById("guildTagInfoDialog"),
  guildTagInfoTag: document.getElementById("guildTagInfoTag"),
  guildTagInfoAccount: document.getElementById("guildTagInfoAccount"),
  guildTagInfoGuildName: document.getElementById("guildTagInfoGuildName"),
  guildTagInfoMeta: document.getElementById("guildTagInfoMeta"),
  guildTagInfoDescription: document.getElementById("guildTagInfoDescription"),
  guildTagInfoOwner: document.getElementById("guildTagInfoOwner"),
  guildTagInfoAccent: document.getElementById("guildTagInfoAccent"),
  guildTagInfoCloseBtn: document.getElementById("guildTagInfoCloseBtn"),
  swfPipDock: document.getElementById("swfPipDock"),
  swfPipTabs: document.getElementById("swfPipTabs"),
  swfPipControls: document.getElementById("swfPipControls"),
  swfPipHost: document.getElementById("swfPipHost"),
  swfPipCloseBtn: document.getElementById("swfPipCloseBtn"),
  videoPipDock: document.getElementById("videoPipDock"),
  videoPipTitle: document.getElementById("videoPipTitle"),
  videoPipHost: document.getElementById("videoPipHost"),
  videoPipCloseBtn: document.getElementById("videoPipCloseBtn"),
  swfViewerDialog: document.getElementById("swfViewerDialog"),
  swfViewerHost: document.getElementById("swfViewerHost"),
  swfViewerTitle: document.getElementById("swfViewerTitle"),
  swfViewerZoomInput: document.getElementById("swfViewerZoomInput"),
  swfViewerPauseBtn: document.getElementById("swfViewerPauseBtn"),
  swfViewerResumeBtn: document.getElementById("swfViewerResumeBtn"),
  swfViewerSaveBtn: document.getElementById("swfViewerSaveBtn"),
  swfViewerCloseBtn: document.getElementById("swfViewerCloseBtn"),
  contextMenu: document.getElementById("contextMenu"),
  settingsNavItems: [...document.querySelectorAll(".settings-nav__item")],
  settingsNavTitle: document.querySelector(".settings-nav__title"),
  settingsPanels: [...document.querySelectorAll(".settings-panel")]
};

const NATIVE_CREDENTIALS_FILENAME = "shitcord67-credentials.json";
const NATIVE_CREDENTIALS_DIR = "shitcord67";
let lastHapticFeedbackAtMs = 0;

function resolveNativeFilesystem() {
  const cap = typeof window !== "undefined" ? window.Capacitor : null;
  if (!cap) return null;
  return cap.Plugins?.Filesystem || cap.Filesystem || cap.plugins?.Filesystem || null;
}

function resolveNativeDocumentsDirectory(fs) {
  if (!fs) return null;
  return fs.Directory?.Documents || fs.Directory?.DOCUMENTS || "DOCUMENTS";
}

function isNativeAndroidPlatform() {
  const cap = typeof window !== "undefined" ? window.Capacitor : null;
  if (!cap || typeof cap.getPlatform !== "function") return false;
  return cap.getPlatform() === "android";
}

function resolveNativeHaptics() {
  const cap = typeof window !== "undefined" ? window.Capacitor : null;
  if (!cap) return null;
  return cap.Plugins?.Haptics || cap.Haptics || cap.plugins?.Haptics || null;
}

async function triggerHapticFeedback(style = "light") {
  const tone = (style || "light").toString().toLowerCase();
  const prefs = typeof getPreferences === "function" ? getPreferences() : null;
  const mode = typeof normalizeHapticMode === "function"
    ? normalizeHapticMode(prefs?.hapticMode || "full")
    : ((prefs?.hapticMode === "off" || prefs?.hapticMode === "light") ? prefs.hapticMode : "full");
  if (mode === "off") return false;
  const effectiveTone = mode === "light" && (tone === "medium" || tone === "heavy")
    ? "light"
    : tone;
  const now = Date.now();
  const minGap = effectiveTone === "selection" ? 22 : 58;
  if (now - lastHapticFeedbackAtMs < minGap) return false;
  const body = document.body || null;
  const mobileRuntime = body?.dataset?.mobile === "on" || body?.dataset?.platform === "android" || body?.dataset?.platform === "ios";
  if (!mobileRuntime) return false;
  lastHapticFeedbackAtMs = now;
  const plugin = resolveNativeHaptics();
  if (plugin) {
    try {
      if (effectiveTone === "selection" && typeof plugin.selectionChanged === "function") {
        await plugin.selectionChanged();
        return true;
      }
      if (typeof plugin.impact === "function") {
        const impactStyle = effectiveTone === "heavy" ? "HEAVY" : (effectiveTone === "medium" ? "MEDIUM" : "LIGHT");
        await plugin.impact({ style: impactStyle });
        return true;
      }
      if (typeof plugin.vibrate === "function") {
        await plugin.vibrate({ duration: effectiveTone === "heavy" ? 18 : 12 });
        return true;
      }
    } catch {
      // Fall back to browser vibration below.
    }
  }
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    try {
      return Boolean(navigator.vibrate(effectiveTone === "heavy" ? 18 : 12));
    } catch {
      return false;
    }
  }
  return false;
}

function nativeCredentialPath(filename = NATIVE_CREDENTIALS_FILENAME) {
  const safe = (filename || "").toString().trim();
  if (!safe) return `${NATIVE_CREDENTIALS_DIR}/${NATIVE_CREDENTIALS_FILENAME}`;
  if (safe.includes("/")) return safe;
  return `${NATIVE_CREDENTIALS_DIR}/${safe}`;
}

function notifyNativeCredentialStorageIssue(message, {
  tone = "error",
  duration = 3200
} = {}) {
  if (typeof showToast === "function") {
    showToast(message, { tone, duration });
  }
}

async function canAccessNativeDocumentsStorage(fs) {
  const directory = resolveNativeDocumentsDirectory(fs);
  if (!fs || !directory) return false;
  const probePath = `${NATIVE_CREDENTIALS_DIR}/.access-probe`;
  try {
    if (typeof fs.mkdir === "function") {
      await fs.mkdir({
        path: NATIVE_CREDENTIALS_DIR,
        directory,
        recursive: true
      }).catch(() => {});
    }
    if (typeof fs.writeFile === "function") {
      await fs.writeFile({
        path: probePath,
        directory,
        data: "ok",
        encoding: "utf8"
      });
      if (typeof fs.deleteFile === "function") {
        await fs.deleteFile({
          path: probePath,
          directory
        }).catch(() => {});
      }
      return true;
    }
    if (typeof fs.readdir === "function") {
      await fs.readdir({
        path: NATIVE_CREDENTIALS_DIR,
        directory
      }).catch(() => {});
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

async function ensureNativeFilesystemPermissions({
  prompt = true
} = {}) {
  const fs = resolveNativeFilesystem();
  if (!fs) return false;
  if (!isNativeAndroidPlatform()) return true;
  if (typeof fs.checkPermissions !== "function") return true;
  try {
    const status = await fs.checkPermissions();
    const current = (status?.publicStorage || "").toString().toLowerCase();
    if (current === "granted") return true;
    if (!prompt) {
      // On newer Android versions, app-scoped Documents access can work without
      // a grantable runtime storage permission toggle/dialog.
      if (await canAccessNativeDocumentsStorage(fs)) return true;
      return false;
    }
    if (typeof fs.requestPermissions !== "function") return false;
    const requested = await fs.requestPermissions();
    const next = (requested?.publicStorage || "").toString().toLowerCase();
    if (next === "granted") return true;
    if (await canAccessNativeDocumentsStorage(fs)) return true;
    notifyNativeCredentialStorageIssue("Cannot access Documents storage for credential persistence.", {
      duration: 4200
    });
    return false;
  } catch {
    notifyNativeCredentialStorageIssue("Failed to verify Android Documents access for credential persistence.", {
      duration: 4200
    });
    return false;
  }
}

async function getNativeFilesystemPermissionStatus() {
  const fs = resolveNativeFilesystem();
  if (!fs) return "unavailable";
  if (!isNativeAndroidPlatform()) return "unavailable";
  if (typeof fs.checkPermissions !== "function") return "unknown";
  try {
    const status = await fs.checkPermissions();
    const current = (status?.publicStorage || "").toString().trim().toLowerCase();
    if (current === "granted") return "granted";
    if (await canAccessNativeDocumentsStorage(fs)) return "granted";
    return current || "unknown";
  } catch {
    return "unknown";
  }
}

async function requestNativeFilesystemPermission() {
  const granted = await ensureNativeFilesystemPermissions({ prompt: true });
  const status = await getNativeFilesystemPermissionStatus();
  return { granted, status };
}

async function readNativeCredentials() {
  const fs = resolveNativeFilesystem();
  const directory = resolveNativeDocumentsDirectory(fs);
  if (!fs || !directory) return null;
  const granted = await ensureNativeFilesystemPermissions({ prompt: false });
  if (!granted) return null;
  try {
    const result = await fs.readFile({
      path: nativeCredentialPath(),
      directory,
      encoding: "utf8"
    });
    const raw = (result?.data || "").toString();
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    try {
      const legacy = await fs.readFile({
        path: NATIVE_CREDENTIALS_FILENAME,
        directory,
        encoding: "utf8"
      });
      const raw = (legacy?.data || "").toString();
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return null;
      await writeNativeCredentials(parsed);
      return parsed;
    } catch {
      return null;
    }
  }
}

async function writeNativeCredentials(payload) {
  const fs = resolveNativeFilesystem();
  const directory = resolveNativeDocumentsDirectory(fs);
  if (!fs || !directory) return false;
  if (!payload || typeof payload !== "object") return false;
  const granted = await ensureNativeFilesystemPermissions({ prompt: true });
  if (!granted) return false;
  try {
    if (typeof fs.mkdir === "function") {
      await fs.mkdir({
        path: NATIVE_CREDENTIALS_DIR,
        directory,
        recursive: true
      }).catch(() => {});
    }
    await fs.writeFile({
      path: nativeCredentialPath(),
      directory,
      data: JSON.stringify(payload),
      encoding: "utf8",
      recursive: true
    });
    return true;
  } catch {
    notifyNativeCredentialStorageIssue("Failed writing credentials to Documents.");
    return false;
  }
}

async function clearNativeCredentials() {
  const fs = resolveNativeFilesystem();
  const directory = resolveNativeDocumentsDirectory(fs);
  if (!fs || !directory) return false;
  const granted = await ensureNativeFilesystemPermissions({ prompt: false });
  if (!granted) return false;
  try {
    await fs.deleteFile({
      path: nativeCredentialPath(),
      directory
    });
    return true;
  } catch {
    try {
      await fs.deleteFile({
        path: NATIVE_CREDENTIALS_FILENAME,
        directory
      });
      return true;
    } catch {
      return false;
    }
  }
}

async function hydrateNativeCredentialsIntoState({ force = false } = {}) {
  const saved = await readNativeCredentials();
  if (!saved) return false;
  const jid = normalizeXmppJid(saved.jid || "");
  const password = normalizeXmppPassword(saved.password || "");
  const wsUrl = normalizeXmppWsUrl(saved.wsUrl || "");
  if (!jid && !password && !wsUrl) return false;
  const prefs = getPreferences();
  if (!force && prefs.rememberLoginStorage !== "on" && saved.rememberLoginStorage !== true) {
    return false;
  }
  state.preferences = prefs;
  if (jid) state.preferences.xmppJid = jid;
  if (typeof saved.password === "string") state.preferences.xmppPassword = password;
  if (wsUrl) state.preferences.xmppWsUrl = wsUrl;
  state.preferences.rememberLoginStorage = "on";
  state.preferences.rememberLogin = "on";
  queueMicrotask(() => {
    if (typeof saveState === "function") saveState();
    if (typeof renderSettingsScreen === "function") renderSettingsScreen();
  });
  return true;
}

async function syncNativeCredentialsFromState({ force = false } = {}) {
  const prefs = getPreferences();
  if (!force && prefs.rememberLoginStorage !== "on") {
    await clearNativeCredentials();
    return false;
  }
  if (prefs.rememberLogin !== "on") {
    await clearNativeCredentials();
    return false;
  }
  if (isNativeAndroidPlatform()) {
    const granted = await ensureNativeFilesystemPermissions({ prompt: true });
    if (!granted) return false;
  }
  const payload = {
    version: 1,
    savedAt: new Date().toISOString(),
    rememberLoginStorage: true,
    jid: prefs.xmppJid || "",
    password: prefs.xmppPassword || "",
    wsUrl: prefs.xmppWsUrl || ""
  };
  if (!payload.jid && !payload.password && !payload.wsUrl) {
    await clearNativeCredentials();
    return false;
  }
  return writeNativeCredentials(payload);
}

if (typeof window !== "undefined") {
  window.SHITCORD67_NATIVE_CREDENTIALS = {
    isAndroid: isNativeAndroidPlatform,
    permissionStatus: getNativeFilesystemPermissionStatus,
    requestPermission: requestNativeFilesystemPermission,
    read: readNativeCredentials,
    write: writeNativeCredentials,
    clear: clearNativeCredentials,
    hydrateIntoState: hydrateNativeCredentialsIntoState,
    syncFromState: syncNativeCredentialsFromState
  };
  void hydrateNativeCredentialsIntoState();
}
