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
let mobileSwipeNavState = null;

function normalizeNativeAndroidInsets(rawInsets) {
  return normalizeNativeAndroidInsetsViaModule(rawInsets);
}

function updateRuntimeSafeArea() {
  runtimeSafeAreaRaf = 0;
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (!root) return;
  const isAndroid = document.body?.dataset?.platform === "android";
  const nativeInsets = normalizeNativeAndroidInsets(window.__shitcord67AndroidInsets);
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
  if (isAndroid) {
    const viewportHeight = viewport && Number.isFinite(viewport.height) ? viewport.height : window.innerHeight;
    const viewportOffsetTop = viewport && Number.isFinite(viewport.offsetTop) ? viewport.offsetTop : 0;
    const keyboardGap = Math.max(0, (Number.isFinite(window.innerHeight) ? window.innerHeight : viewportHeight) - (viewportHeight + viewportOffsetTop));
    const keyboardLikelyOpen = keyboardGap >= 110;
    const hasNativeInsets = nativeInsets && (nativeInsets.top || nativeInsets.right || nativeInsets.bottom || nativeInsets.left);
    const screenHeight = Number.isFinite(window.screen?.height) ? window.screen.height : 0;
    const innerHeight = Number.isFinite(window.innerHeight) ? window.innerHeight : 0;
    const statusGuess = screenHeight && innerHeight ? Math.max(0, screenHeight - innerHeight) : 0;
    const fallbackTop = hasNativeInsets ? 0 : Math.max(28, Math.round(statusGuess));
    const fallbackBottom = hasNativeInsets ? 0 : 26;
    root.style.setProperty("--android-safe-extra-top", `${fallbackTop}px`);
    root.style.setProperty("--android-safe-extra-bottom", `${keyboardLikelyOpen ? 0 : fallbackBottom}px`);
  }
  root.style.setProperty("--runtime-safe-top", `${Math.round(safeTop)}px`);
  root.style.setProperty("--runtime-safe-right", `${Math.round(safeRight)}px`);
  root.style.setProperty("--runtime-safe-bottom", `${Math.round(safeBottom)}px`);
  root.style.setProperty("--runtime-safe-left", `${Math.round(safeLeft)}px`);
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
  { id: "nameplate_aurora", type: "nameplate", name: "Aurora Ribbon", value: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 96'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' x2='1' y1='0' y2='1'%3E%3Cstop offset='0' stop-color='%2335c7a4'/%3E%3Cstop offset='0.5' stop-color='%233f71ff'/%3E%3Cstop offset='1' stop-color='%238f56f2'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='320' height='96' rx='24' fill='url(%23g)'/%3E%3C/svg%3E", cost: 28, note: "Animated-like gradient plate." },
  { id: "nameplate_flare", type: "nameplate", name: "Solar Flare", value: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 96'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' x2='1' y1='0.2' y2='0.8'%3E%3Cstop offset='0' stop-color='%23ff8a00'/%3E%3Cstop offset='0.55' stop-color='%23ff3f5f'/%3E%3Cstop offset='1' stop-color='%23a62eff'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='320' height='96' rx='24' fill='url(%23g)'/%3E%3C/svg%3E", cost: 30, note: "High contrast warm palette." },
  { id: "nameplate_wave", type: "nameplate", name: "Ocean Wave", value: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 96'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' x2='1' y1='0' y2='1'%3E%3Cstop offset='0' stop-color='%231da8ff'/%3E%3Cstop offset='0.55' stop-color='%232ed6c4'/%3E%3Cstop offset='1' stop-color='%232d5bff'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='320' height='96' rx='24' fill='url(%23g)'/%3E%3C/svg%3E", cost: 30, note: "Cool-toned sea shimmer." },
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
let findQuery = "";
let findAuthorFilter = "";
let findAfterFilter = "";
let findBeforeFilter = "";
let findHasLinkOnly = false;
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
  loginLocalProfileWrap: document.getElementById("loginLocalProfileWrap"),
  loginLocalProfileSelect: document.getElementById("loginLocalProfileSelect"),
  loginUsername: document.getElementById("loginUsername"),
  loginPassword: document.getElementById("loginPassword"),
  loginXmppServer: document.getElementById("loginXmppServer"),
  loginRememberInput: document.getElementById("loginRememberInput"),
  loginProvidersBtn: document.getElementById("loginProvidersBtn"),
  loginRegisterBtn: document.getElementById("loginRegisterBtn"),
  loginXmppConsoleBtn: document.getElementById("loginXmppConsoleBtn"),
  loginXmppProgress: document.getElementById("loginXmppProgress"),
  loginXmppProgressStatus: document.getElementById("loginXmppProgressStatus"),
  loginXmppProgressTimer: document.getElementById("loginXmppProgressTimer"),
  loginXmppProgressDetail: document.getElementById("loginXmppProgressDetail"),
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
  settingsEditProfile: document.getElementById("settingsEditProfile"),
  settingsSwitchAccount: document.getElementById("settingsSwitchAccount"),
  settingsLogout: document.getElementById("settingsLogout"),
  settingsOpenProfileEditor: document.getElementById("settingsOpenProfileEditor"),
  guildNotifForm: document.getElementById("guildNotifForm"),
  guildNotifGuildName: document.getElementById("guildNotifGuildName"),
  guildNotifModeInput: document.getElementById("guildNotifModeInput"),
  appearanceForm: document.getElementById("appearanceForm"),
  uiScaleInput: document.getElementById("uiScaleInput"),
  themeInput: document.getElementById("themeInput"),
  languageInput: document.getElementById("languageInput"),
  compactModeInput: document.getElementById("compactModeInput"),
  advancedForm: document.getElementById("advancedForm"),
  developerModeInput: document.getElementById("developerModeInput"),
  debugOverlayInput: document.getElementById("debugOverlayInput"),
  platformOverrideInput: document.getElementById("platformOverrideInput"),
  platformDetectedNote: document.getElementById("platformDetectedNote"),
  runtimeDiagnosticsNote: document.getElementById("runtimeDiagnosticsNote"),
  swfAudioPolicyInput: document.getElementById("swfAudioPolicyInput"),
  swfAudioScopeInput: document.getElementById("swfAudioScopeInput"),
  swfAutoplayInput: document.getElementById("swfAutoplayInput"),
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

function applyServerBrandEmojiSupport() {
  if (!ui.serverBrand) return;
  const supported = supportsEmojiGlyph(SHITCORD_BRAND_EMOJI);
  ui.serverBrand.classList.toggle("server-brand--emoji", supported);
}

if (ui.saveComposerAttachmentBtn) ui.saveComposerAttachmentBtn.hidden = true;

const HEADER_ACTION_BUTTONS = [
  { key: "openCallBtn", icon: "📹", fallback: "Call", preferIcon: true },
  { key: "openScreenShareBtn", icon: "🖥", fallback: "Screen", preferIcon: true },
  { key: "openXmppCallBtn", icon: "📡", fallback: "Legacy XMPP", preferIcon: true },
  { key: "copyCallLinkBtn", icon: "🔗", fallback: "Copy Call", preferIcon: true },
  { key: "openWhiteboardBtn", icon: "📝", fallback: "Whiteboard", preferIcon: true },
  { key: "openFindBtn", icon: "🔍", fallback: "Find", preferIcon: true },
  { key: "markChannelReadBtn", icon: "✓", fallback: "Mark Read" },
  { key: "nextUnreadBtn", icon: "⤓", fallback: "Next Unread" },
  { key: "openChannelSettingsBtn", icon: "⚙", fallback: "Channel" },
  { key: "openPinsBtn", icon: "📌", fallback: "Pins", preferIcon: true },
  { key: "openRolesBtn", icon: "🛡", fallback: "Roles" },
  { key: "openShortcutsBtn", icon: "⌨", fallback: "Shortcuts", preferIcon: true },
  { key: "toggleChannelPanelBtn", icon: "🧭", fallback: "Channels", preferIcon: true },
  { key: "toggleMemberPanelBtn", icon: "👥", fallback: "Members", preferIcon: true },
  { key: "toggleSwfShelfBtn", icon: "📼", fallback: "SWF Shelf", preferIcon: true },
  { key: "editTopicBtn", icon: "✎", fallback: "Edit Topic" }
];

function headerActionsShouldUseIconMode() {
  const compactWidth = window.innerWidth <= 1280;
  const compactHeight = window.innerHeight <= 680 && window.innerWidth <= 1500;
  const denseDesktop = window.innerWidth <= 1480 && window.innerHeight <= 780;
  return compactWidth || compactHeight || denseDesktop;
}

function applyHeaderActionButtonLabels(iconMode = false) {
  HEADER_ACTION_BUTTONS.forEach((entry) => {
    const button = ui[entry.key];
    if (!(button instanceof HTMLButtonElement)) return;
    if (!button.dataset.baseTitle) button.dataset.baseTitle = button.title || "";
    if (!button.dataset.fullLabel) {
      const seed = (button.textContent || "").toString().trim();
      button.dataset.fullLabel = seed || entry.fallback;
    }
    const fullLabel = (button.dataset.fullLabel || entry.fallback).toString();
    const useIcon = iconMode || entry.preferIcon === true;
    if (useIcon) {
      button.textContent = entry.icon;
      button.classList.add("chat-topic-edit--icon");
      button.title = fullLabel;
      button.setAttribute("aria-label", fullLabel);
      return;
    }
    button.textContent = fullLabel;
    button.classList.remove("chat-topic-edit--icon");
    const baseTitle = (button.dataset.baseTitle || "").toString();
    const title = baseTitle || fullLabel;
    button.title = title;
    button.setAttribute("aria-label", title);
  });
}

function setHeaderActionButtonLabel(buttonOrKey, label) {
  const button = typeof buttonOrKey === "string"
    ? ui[buttonOrKey]
    : buttonOrKey;
  if (!(button instanceof HTMLButtonElement)) return;
  const next = (label || "").toString().trim();
  if (next) button.dataset.fullLabel = next;
  if (button.isConnected) refreshHeaderActionButtonLabels();
}

function refreshHeaderActionButtonLabels() {
  let iconMode = headerActionsShouldUseIconMode();
  applyHeaderActionButtonLabels(iconMode);
  if (iconMode || !(ui.chatHeaderRight instanceof HTMLElement)) return;
  const wrapped = ui.chatHeaderRight.scrollHeight > (ui.chatHeaderRight.clientHeight + 4);
  const overflowed = ui.chatHeaderRight.scrollWidth > (ui.chatHeaderRight.clientWidth + 8);
  if (!wrapped && !overflowed) return;
  iconMode = true;
  applyHeaderActionButtonLabels(iconMode);
}

function saveState() {
  const snapshot = typeof xmppSnapshotStateForStorage === "function"
    ? xmppSnapshotStateForStorage(state)
    : state;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}

function isSessionPersistenceEnabled() {
  return localStorage.getItem(SESSION_PERSIST_KEY) !== "off";
}

function rememberAccountSession(accountId, remember = true) {
  if (!accountId) return;
  if (!remember) {
    localStorage.setItem(SESSION_PERSIST_KEY, "off");
    localStorage.removeItem(SESSION_ACCOUNT_KEY);
    return;
  }
  localStorage.setItem(SESSION_PERSIST_KEY, "on");
  localStorage.setItem(SESSION_ACCOUNT_KEY, accountId);
}

function clearRememberedAccountSession() {
  localStorage.removeItem(SESSION_ACCOUNT_KEY);
}

function getCurrentAccount() {
  return state.accounts.find((account) => account.id === state.currentAccountId) || null;
}

function getAccountById(accountId) {
  return state.accounts.find((account) => account.id === accountId) || null;
}

function getAccountByUsername(username) {
  return state.accounts.find((account) => account.username === username) || null;
}

function getActiveGuild() {
  return state.guilds.find((guild) => guild.id === state.activeGuildId) || null;
}

function canAccountAccessGuild(guild, account = getCurrentAccount()) {
  if (!guild || !account) return false;
  const guildId = (guild.id || "").toString().toLowerCase();
  if (guildId.startsWith("xmpp-spaces:")) {
    const guildDomain = guildId.slice("xmpp-spaces:".length);
    const accountDomain = xmppDomainFromJid(account.xmppJid || "");
    if (guildDomain && accountDomain && guildDomain !== accountDomain) return false;
  }
  const members = Array.isArray(guild.memberIds) ? guild.memberIds.filter(Boolean) : [];
  if (members.includes(account.id)) return true;
  // Keep legacy local guilds reachable when memberIds was never populated.
  if (members.length === 0 && !isXmppBackedGuild(guild)) return true;
  return false;
}

function listAccessibleGuildsForAccount(account = getCurrentAccount()) {
  if (!account) return [];
  return state.guilds.filter((guild) => canAccountAccessGuild(guild, account));
}

function getActiveServer() {
  return getActiveGuild();
}

function getActiveChannel() {
  const guild = getActiveGuild();
  if (!guild) return null;
  return guild.channels.find((channel) => channel.id === state.activeChannelId) || null;
}

function getPreferredGuildChannelId(guildId) {
  if (!guildId) return "";
  const prefs = getPreferences();
  return (prefs.lastChannelByGuild?.[guildId] || "").toString();
}

function rememberGuildChannelSelection(guildId, channelId) {
  if (!guildId || !channelId) return;
  state.preferences = getPreferences();
  state.preferences.lastChannelByGuild = {
    ...(state.preferences.lastChannelByGuild || {}),
    [guildId]: channelId
  };
}

function getActiveDmThread() {
  if (!state.activeDmId) return null;
  return state.dmThreads.find((thread) => thread.id === state.activeDmId) || null;
}

function getViewMode() {
  return state.viewMode === "dm" ? "dm" : "guild";
}

function getActiveConversation() {
  if (getViewMode() === "dm") {
    const dm = getActiveDmThread();
    if (dm) return { type: "dm", thread: dm, id: dm.id };
    return null;
  }
  const channel = getActiveChannel();
  if (!channel) return null;
  return { type: "channel", channel, id: channel.id };
}

function hardLimitForConversation(conversation = getActiveConversation()) {
  const prefs = getPreferences();
  let limit = normalizeMessageCharLimit(prefs.messageCharLimit);
  if (conversation?.type === "channel") {
    const serverLimit = Number(conversation.channel?.messageCharLimit || conversation.channel?.messageMaxLength || 0);
    if (Number.isFinite(serverLimit) && serverLimit > 0) {
      limit = Math.max(MESSAGE_CHAR_LIMIT_MIN, Math.min(MESSAGE_CHAR_LIMIT_MAX, Math.floor(serverLimit)));
    }
  }
  return limit;
}

function composerLimitForConversation(conversation = getActiveConversation()) {
  const base = hardLimitForConversation(conversation);
  if (!conversation?.id) return base;
  if (composerTempLimitConversationId !== conversation.id || composerTempLimitExtra <= 0) return base;
  return Math.max(MESSAGE_CHAR_LIMIT_MIN, Math.min(MESSAGE_CHAR_LIMIT_MAX, base + composerTempLimitExtra));
}

function trimTextForConversation(value, conversation = getActiveConversation()) {
  return (value || "").toString().slice(0, composerLimitForConversation(conversation));
}

function trimTextForTransport(value) {
  return clampMessageTextForStorage(value).slice(0, MESSAGE_TEXT_TRANSPORT_MAX);
}

function applyComposerInputLimit() {
  if (!(ui.messageInput instanceof HTMLTextAreaElement)) return;
  const conversation = getActiveConversation();
  const limit = composerLimitForConversation(conversation);
  ui.messageInput.maxLength = limit;
}

function ensureComposerDraftsStore() {
  if (!state.composerDrafts || typeof state.composerDrafts !== "object") {
    state.composerDrafts = {};
  }
  return state.composerDrafts;
}

function setComposerDraft(conversationId, text) {
  if (!conversationId) return;
  const drafts = ensureComposerDraftsStore();
  const next = clampMessageTextForStorage(text);
  if (next.trim()) {
    drafts[conversationId] = next;
    return;
  }
  delete drafts[conversationId];
}

function getComposerDraft(conversationId) {
  if (!conversationId) return "";
  const drafts = ensureComposerDraftsStore();
  return clampMessageTextForStorage(drafts[conversationId] || "");
}

function hasDraftForConversation(conversationId) {
  return Boolean(getComposerDraft(conversationId).trim());
}

function countDraftsForGuildChannels(guild) {
  if (!guild || !Array.isArray(guild.channels)) return 0;
  return guild.channels.reduce((acc, channel) => acc + (hasDraftForConversation(channel.id) ? 1 : 0), 0);
}

function countDraftsForCurrentAccountDms(account) {
  if (!account) return 0;
  return state.dmThreads.reduce((acc, thread) => {
    if (!Array.isArray(thread.participantIds) || !thread.participantIds.includes(account.id)) return acc;
    return acc + (hasDraftForConversation(thread.id) ? 1 : 0);
  }, 0);
}

function queueComposerDraftSave() {
  if (composerDraftSaveTimer) clearTimeout(composerDraftSaveTimer);
  composerDraftSaveTimer = setTimeout(() => {
    composerDraftSaveTimer = null;
    saveState();
  }, 250);
}

function syncComposerDraftConversation(nextConversationId) {
  const previousId = composerDraftConversationId;
  if (previousId && previousId !== nextConversationId) {
    setComposerDraft(previousId, ui.messageInput.value);
  }
  composerDraftConversationId = nextConversationId || null;
  if (composerTempLimitConversationId && composerTempLimitConversationId !== composerDraftConversationId) {
    composerTempLimitConversationId = null;
    composerTempLimitExtra = 0;
  }
  const nextDraft = nextConversationId ? getComposerDraft(nextConversationId) : "";
  if ((ui.messageInput.value || "") !== nextDraft) {
    ui.messageInput.value = trimTextForConversation(nextDraft, getActiveConversation());
  }
  applyComposerInputLimit();
  resizeComposerInput();
}

function getUserNoteKey(ownerId, targetId) {
  return `${ownerId || ""}:${targetId || ""}`;
}

function getUserNote(ownerId, targetId) {
  if (!ownerId || !targetId) return "";
  return (state.userNotes?.[getUserNoteKey(ownerId, targetId)] || "").toString();
}

function setUserNote(ownerId, targetId, text) {
  if (!ownerId || !targetId) return;
  if (!state.userNotes || typeof state.userNotes !== "object") state.userNotes = {};
  state.userNotes[getUserNoteKey(ownerId, targetId)] = (text || "").toString().trim().slice(0, 240);
}

function getDmUnreadStats(thread, account) {
  if (!thread || !account) return { unread: 0, mentions: 0 };
  const lastReadMs = toTimestampMs(thread.readState?.[account.id]);
  let unread = 0;
  let mentions = 0;
  thread.messages.forEach((message) => {
    if (toTimestampMs(message.ts) <= lastReadMs) return;
    if (message.userId && message.userId === account.id) return;
    unread += 1;
    if (messageMentionsAccount(message.text, account)) mentions += 1;
  });
  return { unread, mentions };
}

function getTotalDmUnreadStats(account) {
  if (!account) return { unread: 0, mentions: 0 };
  return state.dmThreads.reduce((acc, thread) => {
    if (!Array.isArray(thread.participantIds) || !thread.participantIds.includes(account.id)) return acc;
    const stats = getDmUnreadStats(thread, account);
    return {
      unread: acc.unread + stats.unread,
      mentions: acc.mentions + stats.mentions
    };
  }, { unread: 0, mentions: 0 });
}

function getSortedDmThreadsForAccount(account) {
  if (!account) return [];
  return state.dmThreads
    .filter((thread) => Array.isArray(thread.participantIds) && thread.participantIds.includes(account.id))
    .slice()
    .sort((a, b) => {
      const aTs = toTimestampMs(a.messages?.[a.messages.length - 1]?.ts || 0);
      const bTs = toTimestampMs(b.messages?.[b.messages.length - 1]?.ts || 0);
      if (bTs !== aTs) return bTs - aTs;
      return (a.id || "").localeCompare(b.id || "");
    });
}

function getServerRoles(server) {
  if (!server) return [];
  return Array.isArray(server.roles) ? server.roles : [];
}

function getMemberRoleIds(server, accountId) {
  if (!server || !accountId) return [];
  if (!server.memberRoles || typeof server.memberRoles !== "object") return [];
  return Array.isArray(server.memberRoles[accountId]) ? server.memberRoles[accountId] : [];
}

function getMemberRoles(server, accountId) {
  const roleIds = getMemberRoleIds(server, accountId);
  const roles = getServerRoles(server);
  return roleIds
    .map((roleId) => roles.find((role) => role.id === roleId))
    .filter(Boolean);
}

function hasServerPermission(server, accountId, permissionKey) {
  const roles = getMemberRoles(server, accountId);
  if (roles.some((role) => role.permissions?.administrator)) return true;
  return roles.some((role) => Boolean(role.permissions?.[permissionKey]));
}

function ensureChannelPermissionOverrides(channel, server = null) {
  if (!channel || typeof channel !== "object") return;
  const roleIds = Array.isArray(server?.roles) ? server.roles.map((role) => role.id) : [];
  channel.permissionOverrides = normalizeChannelPermissionOverrides(channel.permissionOverrides, roleIds);
}

function getChannelPermissionOverride(channel, roleId, permissionKey) {
  if (!channel || !roleId || !permissionKey) return "inherit";
  const value = channel.permissionOverrides?.[roleId]?.[permissionKey];
  return normalizeChannelPermissionValue(value);
}

function setChannelPermissionOverride(channel, roleId, permissionKey, value) {
  if (!channel || !roleId || !permissionKey) return;
  ensureChannelPermissionOverrides(channel, getActiveServer());
  if (!channel.permissionOverrides || typeof channel.permissionOverrides !== "object") {
    channel.permissionOverrides = {};
  }
  const nextValue = normalizeChannelPermissionValue(value);
  if (!channel.permissionOverrides[roleId]) channel.permissionOverrides[roleId] = {};
  if (nextValue === "inherit") {
    delete channel.permissionOverrides[roleId][permissionKey];
  } else {
    channel.permissionOverrides[roleId][permissionKey] = nextValue;
  }
  if (Object.keys(channel.permissionOverrides[roleId]).length === 0) {
    delete channel.permissionOverrides[roleId];
  }
}

function hasChannelPermission(server, channel, accountId, permissionKey) {
  if (!channel || !permissionKey) return false;
  if (!server || !accountId) return true;
  if (hasServerPermission(server, accountId, "administrator")) return true;
  ensureChannelPermissionOverrides(channel, server);
  const roleIds = getMemberRoleIds(server, accountId);
  if (roleIds.length === 0) return false;
  let allow = false;
  for (const roleId of roleIds) {
    const value = getChannelPermissionOverride(channel, roleId, permissionKey);
    if (value === "deny") return false;
    if (value === "allow") allow = true;
  }
  if (allow) return true;
  return true;
}

function canAccountViewChannel(server, channel, accountId) {
  return hasChannelPermission(server, channel, accountId, "viewChannel");
}

function canCurrentUserViewChannel(channel, server = getActiveServer()) {
  const account = getCurrentAccount();
  if (!account) return false;
  return canAccountViewChannel(server, channel, account.id);
}

function canCurrentUserReactInChannel(channel, server = getActiveServer()) {
  const account = getCurrentAccount();
  if (!account) return false;
  if (!canAccountViewChannel(server, channel, account.id)) return false;
  return hasChannelPermission(server, channel, account.id, "addReactions");
}

function canCurrentUserCreateThreadsInChannel(channel, server = getActiveServer()) {
  const account = getCurrentAccount();
  if (!account) return false;
  if (!canAccountViewChannel(server, channel, account.id)) return false;
  return hasChannelPermission(server, channel, account.id, "createThreads");
}

function canCurrentUser(permissionKey) {
  const account = getCurrentAccount();
  const server = getActiveServer();
  if (!account || !server) return false;
  return hasServerPermission(server, account.id, permissionKey);
}

function notifyPermissionDenied(permissionLabel) {
  const channel = getActiveChannel();
  if (!channel) return;
  addSystemMessage(channel, `Missing permission: ${permissionLabel}`);
  saveState();
  renderMessages();
}

function findChannelById(channelId) {
  for (const server of state.guilds) {
    const found = server.channels.find((channel) => channel.id === channelId);
    if (found) return found;
  }
  return null;
}

function findGuildByChannelId(channelId) {
  for (const guild of state.guilds) {
    if (guild.channels.some((channel) => channel.id === channelId)) return guild;
  }
  return null;
}

function applyHashConversationNavigation() {
  const ref = parseHashMessageReference();
  if (!ref) return false;
  const dm = state.dmThreads.find((thread) => thread.id === ref.conversationId);
  if (dm) {
    let changed = false;
    if (state.viewMode !== "dm") {
      state.viewMode = "dm";
      changed = true;
    }
    if (state.activeDmId !== dm.id) {
      state.activeDmId = dm.id;
      changed = true;
    }
    return changed;
  }
  const channel = findChannelById(ref.conversationId);
  if (!channel) return false;
  const guild = findGuildByChannelId(channel.id);
  if (!guild) return false;
  let changed = false;
  if (state.viewMode !== "guild") {
    state.viewMode = "guild";
    changed = true;
  }
  if (state.activeGuildId !== guild.id) {
    state.activeGuildId = guild.id;
    changed = true;
  }
  if (state.activeChannelId !== channel.id) {
    state.activeChannelId = channel.id;
    changed = true;
  }
  if (state.activeDmId) {
    state.activeDmId = null;
    changed = true;
  }
  return changed;
}

function findMessageInChannel(channel, messageId) {
  if (!channel) return null;
  return channel.messages.find((message) => message.id === messageId) || null;
}

function ensureChannelReadState(channel) {
  if (!channel || (channel.readState && typeof channel.readState === "object")) return false;
  channel.readState = {};
  return true;
}

function markChannelRead(channel, accountId) {
  if (!channel || !accountId) return false;
  ensureChannelReadState(channel);
  const newestTs = newestMessageTimestampIso(channel.messages);
  const currentMs = toTimestampMs(channel.readState[accountId]);
  const nextMs = toTimestampMs(newestTs);
  if (nextMs <= currentMs) return false;
  channel.readState[accountId] = newestTs;
  return true;
}

function markGuildRead(guild, accountId) {
  if (!guild || !accountId) return false;
  let changed = false;
  guild.channels.forEach((channel) => {
    if (markChannelRead(channel, accountId)) changed = true;
  });
  return changed;
}

function markAllReadForAccount(accountId) {
  if (!accountId) return false;
  let changed = false;
  state.guilds.forEach((guild) => {
    if (markGuildRead(guild, accountId)) changed = true;
  });
  state.dmThreads.forEach((thread) => {
    if (markDmRead(thread, accountId)) changed = true;
  });
  return changed;
}

function messageMentionsAccount(messageText, account) {
  if (!account || !messageText) return false;
  const raw = (messageText || "").toString();
  const directMentionPattern = new RegExp(`(^|\\s)@${escapeRegExp(account.username)}(?=\\b|\\s|$)`, "i");
  if (directMentionPattern.test(raw)) return true;
  const needles = new Set([
    (account.username || "").toString().trim(),
    (account.displayName || "").toString().trim(),
    normalizeXmppJid(account.xmppJid || "").split("@")[0] || ""
  ]);
  for (const needleRaw of needles) {
    const needle = (needleRaw || "").toString().trim();
    if (!needle || needle.length < 2) continue;
    const pattern = new RegExp(
      `(^|[\\s([{\"'<])${escapeRegExp(needle)}(?=[:;,.!?\\s\\])}\"'>]|$)`,
      "i"
    );
    if (pattern.test(raw)) return true;
  }
  return false;
}

function messageRepliesToAccount(message, account) {
  if (!message || !account || !message.replyTo) return false;
  const replyText = (message.replyTo.authorName || "").toString().trim().toLowerCase();
  if (replyText && replyText === account.username.toLowerCase()) return true;
  if (!message.replyTo.messageId) return false;
  const conversation = getActiveConversation();
  const bucket = conversation?.type === "dm"
    ? (conversation.thread?.messages || [])
    : (conversation?.channel?.messages || []);
  const target = bucket.find((entry) => entry.id === message.replyTo.messageId);
  return Boolean(target?.userId && target.userId === account.id);
}

function isMessageHighlightedForAccount(message, account) {
  if (!message || !account) return false;
  if (message.userId && message.userId === account.id) return false;
  return messageMentionsAccount(message.text, account) || messageRepliesToAccount(message, account);
}

function searchableMessageText(message, channelType = "text") {
  if (!message) return "";
  const raw = (message.text || "").toString();
  if (channelType === "forum" && !message.forumThreadId) {
    const parts = forumMessageParts(message);
    return `${parts.title}\n${parts.body || ""}`.trim();
  }
  return raw;
}

function parseFindDateInput(value, endOfDay = false) {
  const raw = (value || "").toString().trim();
  if (!raw) return 0;
  const parsed = new Date(`${raw}T00:00:00`);
  if (!Number.isFinite(parsed.getTime())) return 0;
  if (endOfDay) parsed.setHours(23, 59, 59, 999);
  return parsed.getTime();
}

function buildFindSpec(query = findQuery) {
  return {
    term: (query || "").trim().toLowerCase(),
    author: (findAuthorFilter || "").trim().replace(/^@/, "").toLowerCase(),
    afterMs: parseFindDateInput(findAfterFilter, false),
    beforeMs: parseFindDateInput(findBeforeFilter, true),
    hasLink: Boolean(findHasLinkOnly)
  };
}

function extractFindInlineFilters(rawQuery) {
  const source = (rawQuery || "").toString().trim();
  if (!source) return { query: "", author: "", after: "", before: "", hasLink: false };
  const authorParts = [];
  const keepParts = [];
  let after = "";
  let before = "";
  let hasLink = false;
  source.split(/\s+/).forEach((part) => {
    const token = part.trim();
    if (!token) return;
    const fromMatch = token.match(/^from:(.+)$/i);
    if (fromMatch) {
      authorParts.push(fromMatch[1].replace(/^@/, ""));
      return;
    }
    const afterMatch = token.match(/^after:(\d{4}-\d{2}-\d{2})$/i);
    if (afterMatch) {
      after = afterMatch[1];
      return;
    }
    const beforeMatch = token.match(/^before:(\d{4}-\d{2}-\d{2})$/i);
    if (beforeMatch) {
      before = beforeMatch[1];
      return;
    }
    if (/^has:link$/i.test(token)) {
      hasLink = true;
      return;
    }
    keepParts.push(token);
  });
  return {
    query: keepParts.join(" "),
    author: authorParts.join(" ").slice(0, 32),
    after,
    before,
    hasLink
  };
}

function hasActiveFindSpec(spec) {
  if (!spec) return false;
  return Boolean(spec.term || spec.author || spec.afterMs || spec.beforeMs || spec.hasLink);
}

function activeConversationFindBucket(conversation) {
  if (!conversation) return [];
  if (conversation.type === "dm") return conversation.thread?.messages || [];
  return conversation.channel?.messages || [];
}

function findMatchCacheKey(conversation, spec, bucket, channelType) {
  const list = Array.isArray(bucket) ? bucket : [];
  const first = list[0] || null;
  const last = list[list.length - 1] || null;
  return [
    conversation?.id || "",
    conversation?.type || "",
    channelType || "",
    spec?.term || "",
    spec?.author || "",
    Number(spec?.afterMs || 0),
    Number(spec?.beforeMs || 0),
    spec?.hasLink ? "1" : "0",
    list.length,
    first?.id || "",
    first?.editedAt || first?.ts || "",
    last?.id || "",
    last?.editedAt || last?.ts || ""
  ].join("|");
}

function resetFindMatchCache() {
  findMatchesCacheKey = "";
  findMatchesCache = [];
}

function activeConversationHistoryState(conversation = getActiveConversation()) {
  if (!conversation || getPreferences().relayMode !== "xmpp") return null;
  if (conversation.type === "dm" && conversation.thread) {
    const peerJid = xmppPeerJidForDmThread(conversation.thread, getCurrentAccount());
    const barePeer = xmppBareJid(peerJid);
    if (!barePeer) return null;
    return ensureXmppDmMamState(barePeer);
  }
  if (conversation.type === "channel" && conversation.channel?.xmppRoomJid) {
    const roomJid = xmppBareJid(conversation.channel.xmppRoomJid);
    if (!roomJid) return null;
    return ensureXmppMamState(roomJid);
  }
  return null;
}

function messageHasLink(message, channelType = "text") {
  if (!message) return false;
  const text = searchableMessageText(message, channelType);
  if (/(https?:\/\/|www\.)/i.test(text)) return true;
  const attachments = normalizeAttachments(message.attachments);
  return attachments.some((attachment) => /^https?:\/\//i.test((attachment?.url || "").toString()));
}

function messageMatchesFindSpec(message, spec, channelType = "text") {
  if (!message || !spec) return false;
  const haystack = searchableMessageText(message, channelType).toLowerCase();
  if (spec.term && !haystack.includes(spec.term)) return false;
  if (spec.author) {
    const authorName = displayNameForMessage(message).toLowerCase();
    const authorAccount = message.userId ? getAccountById(message.userId) : null;
    const authorUsername = (authorAccount?.username || "").toLowerCase();
    if (!authorName.includes(spec.author) && !authorUsername.includes(spec.author)) return false;
  }
  if (spec.hasLink && !messageHasLink(message, channelType)) return false;
  const tsMs = toTimestampMs(message.ts);
  if (spec.afterMs && tsMs < spec.afterMs) return false;
  if (spec.beforeMs && tsMs > spec.beforeMs) return false;
  return true;
}

function messageMatchesFindQuery(message, query, channelType = "text", specOverride = null) {
  const spec = specOverride || buildFindSpec(query);
  if (!hasActiveFindSpec(spec)) return false;
  return messageMatchesFindSpec(message, spec, channelType);
}

function formatFindSpecSummary(spec) {
  const parts = [];
  if (spec.term) parts.push(`text "${spec.term}"`);
  if (spec.author) parts.push(`from @${spec.author}`);
  if (spec.afterMs) parts.push(`after ${new Date(spec.afterMs).toLocaleDateString()}`);
  if (spec.beforeMs) parts.push(`before ${new Date(spec.beforeMs).toLocaleDateString()}`);
  if (spec.hasLink) parts.push("has link");
  return parts.join(" · ");
}

function getFindMatchesForConversation(conversation, query) {
  const spec = buildFindSpec(query);
  if (!conversation || !hasActiveFindSpec(spec)) return [];
  const isDm = conversation.type === "dm";
  const channelType = isDm ? "text" : (conversation.channel?.type || "text");
  const bucket = activeConversationFindBucket(conversation);
  const cacheKey = findMatchCacheKey(conversation, spec, bucket, channelType);
  if (cacheKey === findMatchesCacheKey) return findMatchesCache.slice();
  const out = [];
  for (const message of bucket) {
    if (!messageMatchesFindSpec(message, spec, channelType)) continue;
    out.push({
      id: message.id,
      ts: message.ts,
      author: displayNameForMessage(message),
      preview: searchableMessageText(message, channelType).replace(/\s+/g, " ").trim().slice(0, 120)
    });
    if (out.length >= 900) break;
  }
  findMatchesCacheKey = cacheKey;
  findMatchesCache = out;
  return out.slice();
}

function getFindActiveMessageId() {
  const conversation = getActiveConversation();
  const matches = getFindMatchesForConversation(conversation, findQuery);
  const selected = matches[findSelectionIndex] || matches[0];
  return selected?.id || null;
}

function renderFindList() {
  if (!ui.findList || !ui.findMeta) return;
  const conversation = getActiveConversation();
  const spec = buildFindSpec(findQuery);
  const matches = getFindMatchesForConversation(conversation, findQuery);
  findSelectionIndex = Math.max(0, Math.min(findSelectionIndex, Math.max(0, matches.length - 1)));
  ui.findList.innerHTML = "";
  if (!hasActiveFindSpec(spec)) {
    ui.findMeta.textContent = "Type text or set filters to search this conversation.";
    return;
  }
  if (matches.length === 0) {
    ui.findMeta.textContent = `No results${formatFindSpecSummary(spec) ? ` for ${formatFindSpecSummary(spec)}` : ""}.`;
    const empty = document.createElement("div");
    empty.className = "channel-empty";
    empty.textContent = "No matching messages found.";
    ui.findList.appendChild(empty);
    return;
  }
  ui.findMeta.textContent = `${findSelectionIndex + 1} of ${matches.length} results${formatFindSpecSummary(spec) ? ` · ${formatFindSpecSummary(spec)}` : ""}`;
  matches.forEach((entry, index) => {
    const row = document.createElement("button");
    row.type = "button";
    row.className = `quick-switch-item ${index === findSelectionIndex ? "active" : ""}`;
    const title = document.createElement("strong");
    title.textContent = entry.preview || "(empty message)";
    const meta = document.createElement("small");
    meta.textContent = `${entry.author} · ${formatFullTimestamp(entry.ts || "")}`;
    row.appendChild(title);
    row.appendChild(meta);
    row.addEventListener("click", (event) => {
      if (event.button !== 0) return;
      findSelectionIndex = index;
      renderFindList();
      findDialogCloseReason = "jump";
      findDialogPendingJumpId = entry.id || "";
      findDialogPendingJumpToast = true;
      ui.findDialog?.close();
    });
    ui.findList.appendChild(row);
  });
}

function scheduleFindUiRefresh({ rerenderMessages = true, delayMs = 80 } = {}) {
  if (findRenderTimer) clearTimeout(findRenderTimer);
  findRenderTimer = setTimeout(() => {
    findRenderTimer = null;
    resetFindMatchCache();
    renderFindList();
    if (rerenderMessages) renderMessages();
  }, Math.max(0, Number(delayMs) || 0));
}

function openFindDialog() {
  findDialogCloseReason = "manual";
  findDialogPendingJumpId = "";
  findDialogPendingJumpToast = false;
  findQuery = "";
  findAuthorFilter = "";
  findAfterFilter = "";
  findBeforeFilter = "";
  findHasLinkOnly = false;
  findSelectionIndex = 0;
  if (ui.findInput) ui.findInput.value = "";
  if (ui.findAuthorInput) ui.findAuthorInput.value = "";
  if (ui.findAfterInput) ui.findAfterInput.value = "";
  if (ui.findBeforeInput) ui.findBeforeInput.value = "";
  if (ui.findHasLinkInput) ui.findHasLinkInput.checked = false;
  resetFindMatchCache();
  renderFindList();
  ui.findDialog?.showModal();
  requestAnimationFrame(() => ui.findInput?.focus());
}

function openFindDialogWithQuery(query) {
  const inline = extractFindInlineFilters(query);
  findDialogCloseReason = "manual";
  findDialogPendingJumpId = "";
  findDialogPendingJumpToast = false;
  const safeQuery = inline.query.slice(0, 120);
  findQuery = safeQuery;
  findAuthorFilter = inline.author || "";
  findAfterFilter = inline.after || "";
  findBeforeFilter = inline.before || "";
  findHasLinkOnly = Boolean(inline.hasLink);
  findSelectionIndex = 0;
  if (ui.findInput) ui.findInput.value = safeQuery;
  if (ui.findAuthorInput) ui.findAuthorInput.value = findAuthorFilter;
  if (ui.findAfterInput) ui.findAfterInput.value = findAfterFilter;
  if (ui.findBeforeInput) ui.findBeforeInput.value = findBeforeFilter;
  if (ui.findHasLinkInput) ui.findHasLinkInput.checked = findHasLinkOnly;
  resetFindMatchCache();
  renderFindList();
  ui.findDialog?.showModal();
  renderMessages();
  if (safeQuery) moveFindSelection(0);
  requestAnimationFrame(() => ui.findInput?.focus());
}

function moveFindSelection(delta) {
  const conversation = getActiveConversation();
  const matches = getFindMatchesForConversation(conversation, findQuery);
  if (matches.length === 0) return;
  findSelectionIndex = (findSelectionIndex + delta + matches.length) % matches.length;
  renderFindList();
  renderMessages();
  focusMessageByIdWithHistory(matches[findSelectionIndex].id, { toastOnLoad: false });
}

function markConversationUnreadFromMessage(conversation, messageId, accountId) {
  if (!conversation || !messageId || !accountId) return false;
  const bucket = conversation.type === "dm"
    ? (conversation.thread?.messages || [])
    : (conversation.channel?.messages || []);
  const index = bucket.findIndex((entry) => entry.id === messageId);
  if (index < 0) return false;
  const previousTs = bucket[index - 1]?.ts || "";
  if (conversation.type === "dm") {
    ensureDmReadState(conversation.thread);
    conversation.thread.readState[accountId] = previousTs;
    return true;
  }
  ensureChannelReadState(conversation.channel);
  conversation.channel.readState[accountId] = previousTs;
  return true;
}

function getChannelUnreadStats(channel, account) {
  if (!channel || !account) return { unread: 0, mentions: 0 };
  ensureChannelReadState(channel);
  const lastReadMs = toTimestampMs(channel.readState[account.id]);
  let unread = 0;
  let mentions = 0;
  channel.messages.forEach((message) => {
    if (toTimestampMs(message.ts) <= lastReadMs) return;
    if (message.userId && message.userId === account.id) return;
    unread += 1;
    if (messageMentionsAccount(message.text, account)) mentions += 1;
  });
  return { unread, mentions };
}

function findFirstUnreadMessageId(channel, account) {
  if (!channel || !account) return null;
  ensureChannelReadState(channel);
  const lastReadMs = toTimestampMs(channel.readState[account.id]);
  const unreadMessage = (Array.isArray(channel.messages) ? channel.messages : []).find((message) => (
    toTimestampMs(message.ts) > lastReadMs && message.userId !== account.id
  ));
  return unreadMessage?.id || null;
}

function ensureChannelSlowmodeState(channel) {
  if (!channel || (channel.slowmodeState && typeof channel.slowmodeState === "object")) return false;
  channel.slowmodeState = {};
  return true;
}

function normalizeSlowmodeSeconds(value) {
  return normalizeSlowmodeSecondsViaModule(value);
}

function getChannelSlowmodeSeconds(channel) {
  return normalizeSlowmodeSeconds(channel?.slowmodeSec || 0);
}

function canCurrentUserPostInChannel(channel, account) {
  if (!channel || !account) return false;
  const server = getActiveServer();
  if (!canAccountViewChannel(server, channel, account.id)) return false;
  if (!hasChannelPermission(server, channel, account.id, "sendMessages")) return false;
  if (channel.type === "voice" || channel.type === "stage") return false;
  if (channel.type === "announcement") {
    return canCurrentUser("manageMessages") || canCurrentUser("administrator");
  }
  return true;
}

function canModerateStageChannel(channel = null) {
  if (channel && channel.type !== "stage") return false;
  return canCurrentUser("stageModeration") || canCurrentUser("manageMessages") || canCurrentUser("administrator");
}

function canModerateVoiceLikeChannel(channel = null) {
  if (channel && channel.type !== "voice" && channel.type !== "stage") return false;
  return canCurrentUser("stageModeration") || canCurrentUser("manageMessages") || canCurrentUser("administrator");
}

function ensureVoiceStateForChannel(channel) {
  if (!channel) return;
  channel.voiceState = normalizeVoiceState(channel.voiceState);
}

function addVoiceActivity(channel, accountId, action, detail = "") {
  if (!channel || !accountId || !action) return;
  ensureVoiceStateForChannel(channel);
  if (!Array.isArray(channel.voiceState.activity)) channel.voiceState.activity = [];
  channel.voiceState.activity.push({
    id: createId(),
    accountId,
    action: action.toString().slice(0, 32),
    detail: detail.toString().slice(0, 120),
    ts: new Date().toISOString()
  });
  if (channel.voiceState.activity.length > 30) {
    channel.voiceState.activity = channel.voiceState.activity.slice(-30);
  }
}

function setVoiceMuteState(channel, accountId, muted) {
  if (!channel || !accountId) return false;
  ensureVoiceStateForChannel(channel);
  if (!channel.voiceState.connectedIds.includes(accountId)) return false;
  const hasMuted = channel.voiceState.mutedIds.includes(accountId);
  if (muted && !hasMuted) channel.voiceState.mutedIds.push(accountId);
  if (!muted && hasMuted) channel.voiceState.mutedIds = channel.voiceState.mutedIds.filter((id) => id !== accountId);
  return hasMuted !== muted;
}

function setStageRaisedHandState(channel, accountId, raised) {
  if (!channel || !accountId || channel.type !== "stage") return false;
  ensureVoiceStateForChannel(channel);
  if (!channel.voiceState.connectedIds.includes(accountId)) return false;
  const hasRaised = channel.voiceState.raisedHandIds.includes(accountId);
  if (raised && !hasRaised) channel.voiceState.raisedHandIds.push(accountId);
  if (!raised && hasRaised) channel.voiceState.raisedHandIds = channel.voiceState.raisedHandIds.filter((id) => id !== accountId);
  return hasRaised !== raised;
}

function setStageSpeakerState(channel, accountId, speaker) {
  if (!channel || !accountId || channel.type !== "stage") return false;
  ensureVoiceStateForChannel(channel);
  if (!channel.voiceState.connectedIds.includes(accountId)) return false;
  const isSpeaker = channel.voiceState.speakerIds.includes(accountId);
  if (speaker && !isSpeaker) channel.voiceState.speakerIds.push(accountId);
  if (!speaker && isSpeaker) channel.voiceState.speakerIds = channel.voiceState.speakerIds.filter((id) => id !== accountId);
  if (speaker) {
    channel.voiceState.raisedHandIds = channel.voiceState.raisedHandIds.filter((id) => id !== accountId);
  }
  return isSpeaker !== speaker;
}

function resolveVoiceParticipantByToken(channel, token, guild) {
  if (!channel || !guild) return null;
  ensureVoiceStateForChannel(channel);
  const needle = (token || "").trim().toLowerCase();
  if (!needle) return null;
  const connected = channel.voiceState.connectedIds
    .map((id) => getAccountById(id))
    .filter(Boolean);
  const byId = connected.find((entry) => entry.id.toLowerCase().startsWith(needle));
  if (byId) return byId;
  const exact = connected.filter((entry) => {
    const username = (entry.username || "").toLowerCase();
    const display = displayNameForAccount(entry, guild.id).toLowerCase();
    return username === needle || display === needle;
  });
  if (exact.length === 1) return exact[0];
  const partial = connected.filter((entry) => {
    const username = (entry.username || "").toLowerCase();
    const display = displayNameForAccount(entry, guild.id).toLowerCase();
    return username.includes(needle) || display.includes(needle);
  });
  return partial.length === 1 ? partial[0] : null;
}

function resolveVoiceChannelByToken(guild, token) {
  if (!guild) return null;
  const needle = (token || "").trim().replace(/^#/, "").toLowerCase();
  if (!needle) return null;
  const pool = (guild.channels || []).filter((entry) => entry.type === "voice" || entry.type === "stage");
  const byId = pool.find((entry) => (entry.id || "").toLowerCase().startsWith(needle));
  if (byId) return byId;
  const exact = pool.filter((entry) => (entry.name || "").toLowerCase() === needle);
  if (exact.length === 1) return exact[0];
  const partial = pool.filter((entry) => (entry.name || "").toLowerCase().includes(needle));
  return partial.length === 1 ? partial[0] : null;
}

function leaveAllVoiceChannelsForAccount(guild, accountId) {
  if (!guild || !accountId) return false;
  let changed = false;
  guild.channels.forEach((channel) => {
    if (channel.type !== "voice" && channel.type !== "stage") return;
    ensureVoiceStateForChannel(channel);
    const before = JSON.stringify(channel.voiceState);
    channel.voiceState.connectedIds = channel.voiceState.connectedIds.filter((id) => id !== accountId);
    channel.voiceState.mutedIds = channel.voiceState.mutedIds.filter((id) => id !== accountId);
    channel.voiceState.raisedHandIds = channel.voiceState.raisedHandIds.filter((id) => id !== accountId);
    channel.voiceState.speakerIds = channel.voiceState.speakerIds.filter((id) => id !== accountId);
    if (JSON.stringify(channel.voiceState) !== before) changed = true;
  });
  return changed;
}

function joinVoiceLikeChannel(channel, accountId) {
  const guild = getActiveGuild();
  if (!guild || !channel || !accountId) return false;
  leaveAllVoiceChannelsForAccount(guild, accountId);
  ensureVoiceStateForChannel(channel);
  if (!channel.voiceState.connectedIds.includes(accountId)) channel.voiceState.connectedIds.push(accountId);
  addVoiceActivity(channel, accountId, "join");
  return true;
}

function leaveVoiceLikeChannel(channel, accountId) {
  if (!channel || !accountId) return false;
  ensureVoiceStateForChannel(channel);
  const before = JSON.stringify(channel.voiceState);
  channel.voiceState.connectedIds = channel.voiceState.connectedIds.filter((id) => id !== accountId);
  channel.voiceState.mutedIds = channel.voiceState.mutedIds.filter((id) => id !== accountId);
  channel.voiceState.raisedHandIds = channel.voiceState.raisedHandIds.filter((id) => id !== accountId);
  channel.voiceState.speakerIds = channel.voiceState.speakerIds.filter((id) => id !== accountId);
  const changed = JSON.stringify(channel.voiceState) !== before;
  if (changed) addVoiceActivity(channel, accountId, "leave");
  return changed;
}

function toggleVoiceMuteForSelf(channel, accountId) {
  if (!channel || !accountId) return false;
  ensureVoiceStateForChannel(channel);
  const nextMuted = !channel.voiceState.mutedIds.includes(accountId);
  const changed = setVoiceMuteState(channel, accountId, nextMuted);
  if (changed) addVoiceActivity(channel, accountId, nextMuted ? "mute" : "unmute");
  return changed;
}

function describeVoiceActivity(entry, guild) {
  const account = getAccountById(entry?.accountId || "");
  const who = account ? displayNameForAccount(account, guild?.id || null) : "Unknown";
  const detail = (entry?.detail || "").trim();
  const map = {
    join: "joined",
    leave: "left",
    mute: "muted",
    unmute: "unmuted",
    hand_raise: "raised hand",
    hand_lower: "lowered hand",
    speaker_on: "became speaker",
    speaker_off: "stopped speaking",
    approved: "approved speaker request",
    dismissed: "dismissed hand raise",
    promoted: "promoted to speaker",
    demoted: "demoted from speaker",
    disconnected: "disconnected member"
  };
  const verb = map[entry?.action] || (entry?.action || "updated");
  return detail ? `${who} ${verb} (${detail})` : `${who} ${verb}`;
}

function toggleRaisedHandForSelf(channel, accountId) {
  if (!channel || !accountId || channel.type !== "stage") return false;
  ensureVoiceStateForChannel(channel);
  const nextRaised = !channel.voiceState.raisedHandIds.includes(accountId);
  const changed = setStageRaisedHandState(channel, accountId, nextRaised);
  if (changed) addVoiceActivity(channel, accountId, nextRaised ? "hand_raise" : "hand_lower");
  return changed;
}

function toggleStageSpeaker(channel, accountId) {
  if (!channel || !accountId || channel.type !== "stage") return false;
  ensureVoiceStateForChannel(channel);
  const nextSpeaker = !channel.voiceState.speakerIds.includes(accountId);
  const changed = setStageSpeakerState(channel, accountId, nextSpeaker);
  if (changed) addVoiceActivity(channel, accountId, nextSpeaker ? "speaker_on" : "speaker_off");
  return changed;
}

function getChannelSlowmodeRemainingMs(channel, accountId) {
  const seconds = getChannelSlowmodeSeconds(channel);
  if (!channel || !accountId || seconds <= 0) return 0;
  ensureChannelSlowmodeState(channel);
  const lastIso = channel.slowmodeState?.[accountId];
  const lastMs = toTimestampMs(lastIso);
  if (!lastMs) return 0;
  const elapsed = Date.now() - lastMs;
  const remaining = seconds * 1000 - elapsed;
  return remaining > 0 ? remaining : 0;
}

function recordChannelSlowmodeSend(channel, accountId) {
  if (!channel || !accountId) return;
  if (getChannelSlowmodeSeconds(channel) <= 0) return;
  ensureChannelSlowmodeState(channel);
  channel.slowmodeState[accountId] = new Date().toISOString();
}

function formatSlowmodeLabel(seconds) {
  const sec = normalizeSlowmodeSeconds(seconds);
  if (sec <= 0) return "Slowmode off";
  if (sec < 60) return `Slowmode ${sec}s`;
  const mins = Math.floor(sec / 60);
  const rest = sec % 60;
  return rest === 0 ? `Slowmode ${mins}m` : `Slowmode ${mins}m ${rest}s`;
}

function getGuildUnreadStats(guild, account) {
  if (!guild || !account) return { unread: 0, mentions: 0 };
  if (!canAccountAccessGuild(guild, account)) {
    return { unread: 0, mentions: 0 };
  }
  const totals = guild.channels.reduce((acc, channel) => {
    if (!canAccountViewChannel(guild, channel, account.id)) return acc;
    const stats = getChannelUnreadStats(channel, account);
    return {
      unread: acc.unread + stats.unread,
      mentions: acc.mentions + stats.mentions
    };
  }, { unread: 0, mentions: 0 });
  return applyGuildNotificationModeToStats(totals, getGuildNotificationMode(guild.id));
}

function getGuildChannelsForNavigation() {
  const guild = getActiveGuild();
  const account = getCurrentAccount();
  if (!guild || !Array.isArray(guild.channels) || !account) return [];
  return guild.channels.filter((channel) => canAccountViewChannel(guild, channel, account.id));
}

function getFirstOpenableChannelIdForGuild(guild) {
  if (!guild || !Array.isArray(guild.channels) || guild.channels.length === 0) return null;
  const account = getCurrentAccount();
  const visible = account
    ? guild.channels.filter((channel) => canAccountViewChannel(guild, channel, account.id))
    : guild.channels;
  if (visible.length === 0) return null;
  const preferred = getPreferredGuildChannelId(guild.id);
  if (preferred && visible.some((channel) => channel.id === preferred)) return preferred;
  return visible[0]?.id || null;
}

function ensureActiveGuildForCurrentAccount() {
  const account = getCurrentAccount();
  if (!account) return false;
  const accessibleGuilds = listAccessibleGuildsForAccount(account);
  let changed = false;
  if (accessibleGuilds.length === 0) {
    if (state.viewMode === "guild") {
      state.viewMode = "dm";
      changed = true;
    }
    if (state.activeGuildId) {
      state.activeGuildId = null;
      changed = true;
    }
    if (state.activeChannelId) {
      state.activeChannelId = null;
      changed = true;
    }
    return changed;
  }
  let activeGuild = state.guilds.find((entry) => entry.id === state.activeGuildId) || null;
  if (!activeGuild || !canAccountAccessGuild(activeGuild, account)) {
    [activeGuild] = accessibleGuilds;
    const nextGuildId = activeGuild?.id || null;
    if (state.activeGuildId !== nextGuildId) {
      state.activeGuildId = nextGuildId;
      changed = true;
    }
  }
  if (!activeGuild) return changed;
  const activeChannelStillOpen = activeGuild.channels.some((channel) => (
    channel.id === state.activeChannelId && canAccountViewChannel(activeGuild, channel, account.id)
  ));
  if (!activeChannelStillOpen) {
    const nextChannelId = getFirstOpenableChannelIdForGuild(activeGuild);
    if (state.activeChannelId !== nextChannelId) {
      state.activeChannelId = nextChannelId;
      changed = true;
    }
  }
  return changed;
}

function openGuildById(guildId) {
  const current = getCurrentAccount();
  const guild = state.guilds.find((entry) => entry.id === guildId);
  if (!guild) return false;
  if (current && !canAccountAccessGuild(guild, current)) return false;
  state.viewMode = "guild";
  state.activeGuildId = guild.id;
  state.activeChannelId = getFirstOpenableChannelIdForGuild(guild);
  state.activeDmId = null;
  state.preferences = getPreferences();
  state.preferences.mobilePane = "nav";
  saveState();
  render();
  return true;
}

function navigateGuildChannelByOffset(delta) {
  const channels = getGuildChannelsForNavigation();
  if (channels.length === 0) return false;
  const currentIndex = channels.findIndex((channel) => channel.id === state.activeChannelId);
  const safeIndex = currentIndex >= 0 ? currentIndex : 0;
  const nextIndex = Math.max(0, Math.min(channels.length - 1, safeIndex + delta));
  const next = channels[nextIndex];
  if (!next || next.id === state.activeChannelId) return false;
  state.viewMode = "guild";
  state.activeDmId = null;
  state.activeChannelId = next.id;
  saveState();
  render();
  return true;
}

function moveActiveChannelByOffset(delta) {
  const guild = getActiveGuild();
  const channelId = state.activeChannelId;
  if (!guild || !channelId || !canCurrentUser("manageChannels")) return false;
  const moved = moveChannelByOffset(guild, channelId, delta);
  if (!moved) return false;
  saveState();
  renderChannels();
  return true;
}

function listUnreadGuildChannels(guild, account) {
  if (!guild || !account) return [];
  return guild.channels
    .filter((channel) => canAccountViewChannel(guild, channel, account.id))
    .map((channel) => ({ channel, stats: getChannelUnreadStats(channel, account) }))
    .filter((entry) => entry.stats.unread > 0);
}

function jumpToUnreadGuildChannel(direction = 1) {
  const guild = getActiveGuild();
  const account = getCurrentAccount();
  if (!guild || !account) return false;
  const unread = listUnreadGuildChannels(guild, account);
  if (unread.length === 0) return false;
  const unreadIds = unread.map((entry) => entry.channel.id);
  const currentIndex = unreadIds.indexOf(state.activeChannelId);
  const fallback = direction >= 0 ? 0 : unreadIds.length - 1;
  const base = currentIndex >= 0 ? currentIndex : fallback;
  const nextIndex = (base + (direction >= 0 ? 1 : -1) + unreadIds.length) % unreadIds.length;
  const nextId = unreadIds[nextIndex];
  if (!nextId) return false;
  state.viewMode = "guild";
  state.activeDmId = null;
  state.activeChannelId = nextId;
  saveState();
  render();
  return true;
}

function listMentionGuildChannels(guild, account) {
  if (!guild || !account) return [];
  return guild.channels
    .filter((channel) => canAccountViewChannel(guild, channel, account.id))
    .map((channel) => ({ channel, stats: getChannelUnreadStats(channel, account) }))
    .filter((entry) => entry.stats.mentions > 0);
}

function jumpToMentionGuildChannel(direction = 1) {
  const guild = getActiveGuild();
  const account = getCurrentAccount();
  if (!guild || !account) return false;
  const mentionChannels = listMentionGuildChannels(guild, account);
  if (mentionChannels.length === 0) return false;
  const mentionIds = mentionChannels.map((entry) => entry.channel.id);
  const currentIndex = mentionIds.indexOf(state.activeChannelId);
  const fallback = direction >= 0 ? 0 : mentionIds.length - 1;
  const base = currentIndex >= 0 ? currentIndex : fallback;
  const nextIndex = (base + (direction >= 0 ? 1 : -1) + mentionIds.length) % mentionIds.length;
  const nextId = mentionIds[nextIndex];
  if (!nextId) return false;
  state.viewMode = "guild";
  state.activeDmId = null;
  state.activeChannelId = nextId;
  saveState();
  render();
  return true;
}

function cycleActiveDmThread(direction = 1) {
  const account = getCurrentAccount();
  if (!account) return false;
  const threads = getSortedDmThreadsForAccount(account);
  if (threads.length === 0) return false;
  const ids = threads.map((entry) => entry.id);
  const currentIndex = ids.indexOf(state.activeDmId);
  const fallback = direction >= 0 ? 0 : ids.length - 1;
  const base = currentIndex >= 0 ? currentIndex : fallback;
  const nextIndex = currentIndex >= 0
    ? (base + (direction >= 0 ? 1 : -1) + ids.length) % ids.length
    : fallback;
  const nextId = ids[nextIndex];
  if (!nextId) return false;
  if (threads.length === 1 && state.viewMode === "dm" && state.activeDmId === nextId) return false;
  state.viewMode = "dm";
  state.activeDmId = nextId;
  saveState();
  render();
  return true;
}

function moveChannelByOffset(guild, channelId, delta) {
  if (!guild || !Array.isArray(guild.channels) || !channelId || !Number.isFinite(delta) || delta === 0) return false;
  const from = guild.channels.findIndex((entry) => entry.id === channelId);
  if (from < 0) return false;
  const to = Math.max(0, Math.min(guild.channels.length - 1, from + (delta > 0 ? 1 : -1)));
  if (to === from) return false;
  const [entry] = guild.channels.splice(from, 1);
  guild.channels.splice(to, 0, entry);
  return true;
}

function duplicateChannelInGuild(guild, channel) {
  if (!guild || !channel) return null;
  const forumTags = channel.type === "forum" ? forumTagsForChannel(channel).map((tag) => ({ ...tag })) : [];
  const clone = {
    id: createId(),
    name: sanitizeChannelName(`${channel.name || "channel"}-copy`, "channel-copy"),
    type: channel.type || "text",
    topic: (channel.topic || "").toString(),
    forumTags,
    permissionOverrides: normalizeChannelPermissionOverrides(channel.permissionOverrides, getServerRoles(guild).map((role) => role.id)),
    voiceState: createVoiceState(),
    readState: state.currentAccountId ? { [state.currentAccountId]: new Date().toISOString() } : {},
    slowmodeSec: normalizeSlowmodeSeconds(channel.slowmodeSec || 0),
    slowmodeState: {},
    messages: []
  };
  guild.channels.push(clone);
  return clone;
}

async function copyText(value) {
  const text = (value || "").toString();
  if (!text) return false;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback below.
  }
  const area = document.createElement("textarea");
  const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  area.value = text;
  area.setAttribute("readonly", "true");
  area.style.position = "fixed";
  area.style.top = "-9999px";
  area.style.left = "-9999px";
  area.style.opacity = "0";
  area.style.pointerEvents = "none";
  document.body.appendChild(area);
  try {
    area.focus();
    area.select();
    area.setSelectionRange(0, area.value.length);
    const copied = document.execCommand("copy");
    if (copied) return true;
    // Manual fallback for browsers that block clipboard writes on non-secure origins.
    await showInAppCopyDialog(text);
    return false;
  } catch {
    await showInAppCopyDialog(text);
    return false;
  } finally {
    area.remove();
    if (active) {
      try {
        active.focus();
      } catch {
        // Ignore focus restore failures.
      }
    }
  }
}

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

function formatDebugLogs() {
  const runtime = {
    location: window.location.href,
    ruffleReady: Boolean(window.RufflePlayer?.newest),
    dotLottieReady: typeof customElements !== "undefined" && Boolean(customElements.get("dotlottie-player")),
    activeGuildId: state.activeGuildId || null,
    activeChannelId: state.activeChannelId || null
  };
  return JSON.stringify({ runtime, logs: debugLogs }, null, 2);
}

function renderDebugDialog() {
  ui.debugOutput.textContent = formatDebugLogs();
}

function openDebugDialog() {
  renderDebugDialog();
  ui.debugDialog.showModal();
}

function serializeMessageAsJson(message) {
  return JSON.stringify({
    id: message.id,
    userId: message.userId || null,
    authorName: message.authorName || "",
    text: message.text || "",
    ts: message.ts,
    editedAt: message.editedAt || null,
    editedByUserId: message.editedByUserId || null,
    editedByName: message.editedByName || "",
    editedByStaff: Boolean(message.editedByStaff),
    collaborative: Boolean(message.collaborative),
    editHistory: messageEditHistory(message),
    replyTo: message.replyTo || null,
    pinned: Boolean(message.pinned),
    reactions: normalizeReactions(message.reactions),
    attachments: normalizeAttachments(message.attachments),
    poll: normalizePoll(message.poll)
  }, null, 2);
}

function xmlEscape(value) {
  return (value || "")
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

function serializeMessageAsXml(message) {
  const reactionsXml = normalizeReactions(message.reactions)
    .map((reaction) => `    <reaction emoji="${xmlEscape(reaction.emoji)}" count="${reaction.userIds.length}" />`)
    .join("\n");
  const attachmentsXml = normalizeAttachments(message.attachments)
    .map((attachment) => `    <attachment type="${xmlEscape(attachment.type)}" format="${xmlEscape(attachment.format || "image")}" name="${xmlEscape(attachment.name || "")}" url="${xmlEscape(attachment.url)}" />`)
    .join("\n");
  const poll = normalizePoll(message.poll);
  const pollXml = poll
    ? `  <poll question="${xmlEscape(poll.question)}" closed="${poll.closed ? "true" : "false"}" allowsMulti="${poll.allowsMulti ? "true" : "false"}">\n${poll.options.map((option) => `    <option id="${xmlEscape(option.id)}" votes="${option.voterIds.length}">${xmlEscape(option.label)}</option>`).join("\n")}\n  </poll>`
    : "  <poll />";
  return [
    `<message id="${xmlEscape(message.id)}" ts="${xmlEscape(message.ts)}"${message.editedAt ? ` editedAt="${xmlEscape(message.editedAt)}"` : ""}${message.editedByStaff ? " editedByStaff=\"true\"" : ""}>`,
    `  <author userId="${xmlEscape(message.userId || "")}">${xmlEscape(displayNameForMessage(message))}</author>`,
    `  <text>${xmlEscape(message.text || "")}</text>`,
    `  <pinned>${message.pinned ? "true" : "false"}</pinned>`,
    reactionsXml ? `  <reactions>\n${reactionsXml}\n  </reactions>` : "  <reactions />",
    attachmentsXml ? `  <attachments>\n${attachmentsXml}\n  </attachments>` : "  <attachments />",
    pollXml,
    `</message>`
  ].join("\n");
}


function setComposerTypingNoteText(text = "") {
  if (!ui.composerTypingNote) return;
  const value = (text || "").toString();
  ui.composerTypingNote.textContent = value;
  ui.composerTypingNote.hidden = !value;
}

function renderComposerMeta() {
  if (composerMetaRefreshTimer) {
    clearTimeout(composerMetaRefreshTimer);
    composerMetaRefreshTimer = null;
  }
  const conversation = getActiveConversation();
  applyComposerInputLimit();
  const limit = composerLimitForConversation(conversation);
  const baseLimit = hardLimitForConversation(conversation);
  const rawValue = clampMessageTextForStorage(ui.messageInput.value || "");
  if (rawValue !== (ui.messageInput.value || "")) {
    ui.messageInput.value = rawValue;
  }
  const used = rawValue.length;
  if (ui.composerCharCount) {
    ui.composerCharCount.textContent = `${used}/${limit}`;
    ui.composerCharCount.classList.toggle("is-near-limit", used >= Math.floor(limit * 0.8));
    ui.composerCharCount.classList.toggle("is-at-limit", used >= limit - 1);
    const activeTemp = conversation?.id && composerTempLimitConversationId === conversation.id && composerTempLimitExtra > 0;
    if (activeTemp) {
      ui.composerCharCount.title = `Temporary +${composerTempLimitExtra} chars. Click to add more, double-click to set default limit.`;
    } else {
      ui.composerCharCount.title = `Click to temporarily add ${MESSAGE_CHAR_LIMIT_TEMP_BUMP} chars. Double-click to set default limit (current ${baseLimit}).`;
    }
  }

  const submitBtn = ui.messageForm?.querySelector?.("button[type=\"submit\"]");
  if (!(submitBtn instanceof HTMLButtonElement)) return;
  const account = getCurrentAccount();
  const room = relayRoomForActiveConversation();
  const typingSummary = formatTypingSummary(typingNamesForRoom(room));
  if (!conversation || !account) {
    submitBtn.disabled = true;
    setComposerTypingNoteText("");
    if (ui.composerSystemNotice) ui.composerSystemNotice.hidden = true;
    return;
  }

  if (conversation.type === "dm") {
    const deliverySummary = formatDmDeliverySummaryForComposer(conversation.thread, account.id);
    const dmMetaLine = [typingSummary, deliverySummary].filter(Boolean).join(" · ");
    setComposerTypingNoteText(dmMetaLine);
    const headerMeta = dmHeaderStatusMeta(conversation.thread, account.id, { typingSummary });
    setActiveChannelTopic(headerMeta.text || "Direct Message");
    if (headerMeta.needsRefresh) {
      composerMetaRefreshTimer = setTimeout(() => {
        composerMetaRefreshTimer = null;
        renderComposerMeta();
      }, 30_000);
    }
    submitBtn.disabled = false;
    if (ui.composerSystemNotice) ui.composerSystemNotice.hidden = true;
    return;
  }
  setComposerTypingNoteText(typingSummary);

  const channel = conversation.channel;
  const canPost = canCurrentUserPostInChannel(channel, account);
  const remainingMs = getChannelSlowmodeRemainingMs(channel, account.id);
  const remainingSeconds = Math.ceil(remainingMs / 1000);

  if (ui.composerSystemNotice) {
    let notice = "";
    if (channel.type === "voice") {
      notice = "Voice channels use live call controls. Join voice to participate.";
    } else if (channel.type === "stage") {
      notice = "Stage channels are listen-first. Join stage and request speaking access.";
    } else if (!canPost) {
      notice = "You do not have permission to send messages in this channel.";
    } else if (remainingSeconds > 0) {
      notice = `Slowmode active. Wait ${remainingSeconds}s before sending again.`;
    } else {
      const slow = getChannelSlowmodeSeconds(channel);
      if (slow > 0) notice = `${formatSlowmodeLabel(slow)} is enabled.`;
    }
    ui.composerSystemNotice.textContent = notice;
    ui.composerSystemNotice.hidden = !notice;
  }

  const hasPayload = rawValue.trim().length > 0 || composerPendingAttachments.length > 0;
  submitBtn.disabled = channel.type === "voice" || channel.type === "stage" || !canPost || remainingSeconds > 0 || !hasPayload;
  if (remainingSeconds > 0) {
    composerMetaRefreshTimer = setTimeout(() => {
      composerMetaRefreshTimer = null;
      renderComposerMeta();
    }, 400);
  }
}

function setComposerCollapsedState(collapsed = false) {
  const isCollapsed = Boolean(collapsed);
  if (ui.composerStack instanceof HTMLElement) {
    ui.composerStack.classList.toggle("composer-stack--collapsed", isCollapsed);
  }
  if (!(ui.messageInput instanceof HTMLTextAreaElement)) return;
  if (isCollapsed) {
    closeMediaPicker();
    clearReplyComposer();
    ui.messageInput.readOnly = true;
    ui.messageInput.placeholder = "Select a chat. Press / for commands.";
    if (ui.composerSystemNotice) {
      ui.composerSystemNotice.textContent = "Composer collapsed until a chat is selected.";
      ui.composerSystemNotice.hidden = false;
    }
    setComposerTypingNoteText("");
    return;
  }
  ui.messageInput.readOnly = false;
  if (ui.composerSystemNotice && ui.composerSystemNotice.textContent === "Composer collapsed until a chat is selected.") {
    ui.composerSystemNotice.hidden = true;
  }
}

function bumpComposerTemporaryLimit() {
  const conversation = getActiveConversation();
  if (!conversation?.id) return;
  if (composerTempLimitConversationId !== conversation.id) {
    composerTempLimitConversationId = conversation.id;
    composerTempLimitExtra = 0;
  }
  composerTempLimitExtra = Math.max(
    MESSAGE_CHAR_LIMIT_TEMP_BUMP,
    Math.min(MESSAGE_CHAR_LIMIT_MAX, composerTempLimitExtra + MESSAGE_CHAR_LIMIT_TEMP_BUMP)
  );
  applyComposerInputLimit();
  renderComposerMeta();
  showToast(`Temporary message limit raised to ${composerLimitForConversation(conversation)} chars.`);
}

async function configureDefaultComposerLimit() {
  const prefs = getPreferences();
  const typed = await showInAppPromptDialog({
    title: "Default message limit",
    message: `Set default message limit (${MESSAGE_CHAR_LIMIT_MIN}-${MESSAGE_CHAR_LIMIT_MAX})`,
    defaultValue: String(prefs.messageCharLimit || MESSAGE_CHAR_LIMIT_DEFAULT)
  });
  if (typed === null) return;
  const parsed = Number(typed.trim());
  if (!Number.isFinite(parsed)) {
    showToast("Enter a valid number.", { tone: "error" });
    return;
  }
  const nextLimit = normalizeMessageCharLimit(parsed);
  state.preferences = getPreferences();
  state.preferences.messageCharLimit = nextLimit;
  composerTempLimitConversationId = null;
  composerTempLimitExtra = 0;
  applyComposerInputLimit();
  saveState();
  renderComposerMeta();
  showToast(`Default message limit set to ${nextLimit}.`);
}

function renderReplyComposer() {
  if (!replyTarget) {
    ui.composerReplyBar.classList.add("composer-reply--hidden");
    ui.replyPreviewText.textContent = "";
    return;
  }
  const previewText = replyTarget.text.trim().slice(0, 100);
  const threadHint = replyTarget.threadId ? " in thread" : "";
  ui.replyPreviewText.textContent = `Replying to ${replyTarget.authorName}${threadHint}: ${previewText || "(empty message)"}`;
  ui.composerReplyBar.classList.remove("composer-reply--hidden");
}

function renderRoleChips(container, accountId) {
  const server = getActiveServer();
  container.innerHTML = "";
  if (!server || !accountId) return;
  const roles = getMemberRoles(server, accountId).filter((role) => role.name !== "@everyone");
  roles.forEach((role) => {
    const chip = document.createElement("span");
    chip.className = "role-chip";
    chip.textContent = role.name;
    chip.style.borderColor = role.color || "#4b4f59";
    chip.style.color = role.color || "#e3e6eb";
    container.appendChild(chip);
  });
}

function collectAccountActivityStats(accountId) {
  const stats = {
    sentMessages: 0,
    reactionsGiven: 0,
    pollsCreated: 0
  };
  if (!accountId) return stats;
  state.guilds.forEach((guild) => {
    (guild.channels || []).forEach((channel) => {
      (channel.messages || []).forEach((message) => {
        if (message.userId === accountId) {
          stats.sentMessages += 1;
          if (message.poll) stats.pollsCreated += 1;
        }
        normalizeReactions(message.reactions).forEach((reaction) => {
          if (reaction.userIds.includes(accountId)) stats.reactionsGiven += 1;
        });
      });
    });
  });
  state.dmThreads.forEach((thread) => {
    (thread.messages || []).forEach((message) => {
      if (message.userId === accountId) {
        stats.sentMessages += 1;
        if (message.poll) stats.pollsCreated += 1;
      }
      normalizeReactions(message.reactions).forEach((reaction) => {
        if (reaction.userIds.includes(accountId)) stats.reactionsGiven += 1;
      });
    });
  });
  return stats;
}

function resolveQuestBadgesForAccount(accountId) {
  const stats = collectAccountActivityStats(accountId);
  const badges = [];
  if (stats.sentMessages >= 1) badges.push("First Message");
  if (stats.sentMessages >= 25) badges.push("Regular");
  if (stats.sentMessages >= 100) badges.push("Power Chatter");
  if (stats.reactionsGiven >= 10) badges.push("Reactor");
  if (stats.pollsCreated >= 1) badges.push("Poll Starter");
  return badges.slice(0, 4);
}

function questMilestoneProgress(accountId) {
  const stats = collectAccountActivityStats(accountId);
  const nextMessageGoal = [1, 25, 100, 250].find((value) => stats.sentMessages < value) || null;
  const nextReactionGoal = [10, 50, 200].find((value) => stats.reactionsGiven < value) || null;
  const nextPollGoal = [1, 5, 20].find((value) => stats.pollsCreated < value) || null;
  return {
    stats,
    badges: resolveQuestBadgesForAccount(accountId),
    nextGoals: {
      messages: nextMessageGoal,
      reactions: nextReactionGoal,
      polls: nextPollGoal
    }
  };
}

function formatQuestSummaryText(accountId) {
  const progress = questMilestoneProgress(accountId);
  const { stats, badges, nextGoals } = progress;
  const nextParts = [];
  if (nextGoals.messages) nextParts.push(`next messages: ${stats.sentMessages}/${nextGoals.messages}`);
  if (nextGoals.reactions) nextParts.push(`next reactions: ${stats.reactionsGiven}/${nextGoals.reactions}`);
  if (nextGoals.polls) nextParts.push(`next polls: ${stats.pollsCreated}/${nextGoals.polls}`);
  return [
    `Badges: ${badges.length > 0 ? badges.join(", ") : "none yet"}`,
    `Messages: ${stats.sentMessages}`,
    `Reactions: ${stats.reactionsGiven}`,
    `Polls: ${stats.pollsCreated}`,
    nextParts.length > 0 ? `Progress: ${nextParts.join(" · ")}` : "Progress: all tracked milestones reached"
  ].join(" · ");
}

function formatIdentitySummaryText(account, guildId = null) {
  if (!account) return "Unknown identity.";
  const name = displayNameForAccount(account, guildId);
  const status = displayStatus(account, guildId);
  const tag = accountGuildTag(account) || "(none)";
  const decor = accountDecorationEmoji(account) || "(none)";
  const effect = accountProfileEffect(account);
  const hasNameplate = accountNameplateSvg(account) ? "yes" : "no";
  return `Name: ${name} · Status: ${status} · Tag: ${tag} · Decor: ${decor} · Effect: ${effect} · Nameplate: ${hasNameplate}`;
}

function resolveShardWallet(accountId) {
  const stats = collectAccountActivityStats(accountId);
  const badges = resolveQuestBadgesForAccount(accountId).length;
  const earned = SHARD_ECONOMY.starter
    + Math.floor(stats.sentMessages / SHARD_ECONOMY.messageEvery)
    + Math.floor(stats.reactionsGiven / SHARD_ECONOMY.reactionEvery)
    + (stats.pollsCreated * SHARD_ECONOMY.pollWorth)
    + (badges * SHARD_ECONOMY.badgeWorth);
  const account = getAccountById(accountId);
  ensureAccountCosmetics(account);
  const spent = (account?.cosmeticPurchases || []).reduce((acc, entry) => acc + Math.max(0, Number(entry.cost || 0)), 0);
  return {
    earned,
    spent,
    balance: Math.max(0, earned - spent),
    stats
  };
}

function accountOwnsCosmetic(account, cosmetic) {
  if (!account || !cosmetic) return false;
  ensureAccountCosmetics(account);
  return account.ownedCosmetics[cosmetic.type]?.includes(cosmetic.id) || false;
}

function isCosmeticEquipped(account, cosmetic) {
  if (!account || !cosmetic) return false;
  if (cosmetic.type === "decor") return accountDecorationEmoji(account) === cosmetic.value;
  if (cosmetic.type === "nameplate") return accountNameplateSvg(account) === cosmetic.value;
  if (cosmetic.type === "effect") return accountProfileEffect(account) === cosmetic.value;
  return false;
}

function equipCosmetic(account, cosmetic) {
  if (!account || !cosmetic || !accountOwnsCosmetic(account, cosmetic)) return false;
  if (cosmetic.type === "decor") account.avatarDecoration = cosmetic.value;
  if (cosmetic.type === "nameplate") account.profileNameplateSvg = cosmetic.value;
  if (cosmetic.type === "effect") account.profileEffect = normalizeProfileEffect(cosmetic.value);
  return true;
}

function buyCosmetic(account, cosmetic) {
  if (!account || !cosmetic || cosmetic.cost <= 0) return { ok: false, reason: "Invalid cosmetic." };
  ensureAccountCosmetics(account);
  if (accountOwnsCosmetic(account, cosmetic)) return { ok: false, reason: "You already own this cosmetic." };
  const wallet = resolveShardWallet(account.id);
  if (wallet.balance < cosmetic.cost) return { ok: false, reason: "Not enough shards yet." };
  account.ownedCosmetics[cosmetic.type].push(cosmetic.id);
  account.cosmeticPurchases.push({
    id: cosmetic.id,
    cost: cosmetic.cost,
    ts: new Date().toISOString()
  });
  account.cosmeticPurchases = normalizeCosmeticPurchases(account.cosmeticPurchases);
  equipCosmetic(account, cosmetic);
  return { ok: true };
}

function resolveBundlePricingForAccount(bundle, account) {
  const items = Array.isArray(bundle?.itemIds)
    ? bundle.itemIds.map((id) => cosmeticById(id)).filter(Boolean)
    : [];
  const totalCost = items.reduce((sum, item) => sum + item.cost, 0);
  const missingItems = items.filter((item) => !accountOwnsCosmetic(account, item));
  const missingCost = missingItems.reduce((sum, item) => sum + item.cost, 0);
  let discount = 0;
  if (missingCost > 0 && totalCost > 0) {
    const baseDiscount = Math.max(0, Number(bundle?.discount || 0));
    discount = Math.round(baseDiscount * (missingCost / totalCost));
    if (baseDiscount > 0) discount = Math.max(1, discount);
    discount = Math.min(discount, Math.max(0, missingCost - 1));
  }
  return {
    items,
    missingItems,
    totalCost,
    missingCost,
    discount,
    finalCost: missingCost > 0 ? Math.max(1, missingCost - discount) : 0
  };
}

function buyCosmeticBundle(account, bundle) {
  if (!account || !bundle) return { ok: false, reason: "Invalid bundle." };
  ensureAccountCosmetics(account);
  const pricing = resolveBundlePricingForAccount(bundle, account);
  if (pricing.items.length === 0) return { ok: false, reason: "Bundle has no valid cosmetics." };
  if (pricing.missingItems.length === 0) return { ok: false, reason: "You already own this bundle." };
  const wallet = resolveShardWallet(account.id);
  if (wallet.balance < pricing.finalCost) return { ok: false, reason: "Not enough shards yet." };
  pricing.missingItems.forEach((item) => {
    if (!account.ownedCosmetics[item.type].includes(item.id)) {
      account.ownedCosmetics[item.type].push(item.id);
    }
    equipCosmetic(account, item);
  });
  account.cosmeticPurchases.push({
    id: bundle.id,
    cost: pricing.finalCost,
    ts: new Date().toISOString()
  });
  account.cosmeticPurchases = normalizeCosmeticPurchases(account.cosmeticPurchases);
  return {
    ok: true,
    purchasedCount: pricing.missingItems.length,
    purchasedNames: pricing.missingItems.map((item) => item.name),
    finalCost: pricing.finalCost,
    discount: pricing.discount
  };
}

function formatCosmeticsCountdown(remainingMs) {
  const safeMs = Math.max(0, Math.floor(remainingMs));
  const totalMinutes = Math.floor(safeMs / 60_000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function clearCosmeticsFeaturedRefreshTimer() {
  if (!cosmeticsFeaturedRefreshTimer) return;
  clearTimeout(cosmeticsFeaturedRefreshTimer);
  cosmeticsFeaturedRefreshTimer = null;
}

function scheduleCosmeticsFeaturedRefresh(endsAtMs) {
  clearCosmeticsFeaturedRefreshTimer();
  if (!ui.cosmeticsDialog?.open) return;
  const now = Date.now();
  const remaining = Math.max(0, Math.floor(endsAtMs - now));
  const nextTick = Math.min(60_000, Math.max(1_000, remaining + 250));
  cosmeticsFeaturedRefreshTimer = setTimeout(() => {
    cosmeticsFeaturedRefreshTimer = null;
    renderCosmeticsDialog();
  }, nextTick);
}

function renderFeaturedCosmetics(account, wallet) {
  if (!ui.cosmeticsFeatured || !ui.cosmeticsFeaturedGrid || !ui.cosmeticsFeaturedLabel || !ui.cosmeticsFeaturedCountdown) return;
  const featured = resolveFeaturedCosmeticBundles();
  if (featured.bundles.length === 0) {
    ui.cosmeticsFeatured.hidden = true;
    clearCosmeticsFeaturedRefreshTimer();
    return;
  }
  ui.cosmeticsFeatured.hidden = false;
  ui.cosmeticsFeaturedLabel.textContent = `${featured.season.label} Featured`;
  ui.cosmeticsFeaturedCountdown.textContent = `Rotates in ${formatCosmeticsCountdown(featured.endsAtMs - Date.now())}`;
  ui.cosmeticsFeaturedGrid.innerHTML = "";
  featured.bundles.forEach((bundle) => {
    const card = document.createElement("article");
    card.className = "cosmetic-featured-card";
    const pricing = resolveBundlePricingForAccount(bundle, account);
    const canAfford = wallet.balance >= pricing.finalCost;

    const top = document.createElement("div");
    top.className = "cosmetic-featured-card__head";
    const title = document.createElement("strong");
    title.textContent = bundle.name;
    const price = document.createElement("small");
    if (pricing.missingItems.length === 0) {
      price.textContent = "Owned";
    } else if (pricing.discount > 0) {
      price.textContent = `${pricing.finalCost} shards (${pricing.missingCost} base, -${pricing.discount})`;
    } else {
      price.textContent = `${pricing.finalCost} shards`;
    }
    top.appendChild(title);
    top.appendChild(price);
    card.appendChild(top);

    const note = document.createElement("p");
    note.className = "cosmetic-featured-card__note";
    note.textContent = bundle.note;
    card.appendChild(note);

    const included = document.createElement("small");
    included.className = "cosmetic-featured-card__includes";
    included.textContent = pricing.items.map((item) => item.name).join(" · ");
    card.appendChild(included);

    const action = document.createElement("button");
    action.type = "button";
    action.className = "cosmetic-card__action";
    if (pricing.missingItems.length === 0) {
      action.textContent = "Owned";
      action.disabled = true;
      action.classList.add("is-owned");
    } else {
      action.textContent = canAfford ? "Buy Bundle" : "Locked";
      action.disabled = !canAfford;
      action.addEventListener("click", () => {
        const result = buyCosmeticBundle(account, bundle);
        if (!result.ok) {
          showToast(result.reason, { tone: "error" });
          return;
        }
        saveState();
        render();
        renderCosmeticsDialog();
        showToast(`Purchased ${bundle.name} (${result.purchasedCount} items).`);
      });
    }
    card.appendChild(action);
    ui.cosmeticsFeaturedGrid.appendChild(card);
  });
  scheduleCosmeticsFeaturedRefresh(featured.endsAtMs);
}

function formatCosmeticInventorySummary(accountId) {
  const account = getAccountById(accountId);
  if (!account) return "No active account.";
  ensureAccountCosmetics(account);
  const wallet = resolveShardWallet(accountId);
  const listFor = (type) => {
    const owned = account.ownedCosmetics[type]
      .map((id) => cosmeticById(id))
      .filter(Boolean)
      .map((item) => item.name);
    return owned.length > 0 ? owned.join(", ") : "none";
  };
  return `Shards: ${wallet.balance} (earned ${wallet.earned}, spent ${wallet.spent}) · Decorations: ${listFor("decor")} · Nameplates: ${listFor("nameplate")} · Effects: ${listFor("effect")}`;
}

function normalizeCosmeticsTab(rawTab) {
  return normalizeCosmeticsTabViaModule(rawTab);
}

function renderCosmeticsDialog() {
  const account = getCurrentAccount();
  if (!account || !ui.cosmeticsDialog?.open) {
    clearCosmeticsFeaturedRefreshTimer();
    return;
  }
  clearCosmeticsFeaturedRefreshTimer();
  ensureAccountCosmetics(account);
  const wallet = resolveShardWallet(account.id);
  if (ui.cosmeticsBalance) ui.cosmeticsBalance.textContent = `${wallet.balance} shards`;
  if (ui.cosmeticsProgress) {
    ui.cosmeticsProgress.textContent = `Earned ${wallet.earned} · Spent ${wallet.spent} · Messages ${wallet.stats.sentMessages} · Reactions ${wallet.stats.reactionsGiven} · Polls ${wallet.stats.pollsCreated}`;
  }
  renderFeaturedCosmetics(account, wallet);
  ui.cosmeticsTabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.cosmeticsTab === cosmeticsTab);
  });
  if (!ui.cosmeticsGrid) return;
  ui.cosmeticsGrid.innerHTML = "";
  const items = COSMETIC_CATALOG.filter((item) => item.type === cosmeticsTab);
  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "cosmetic-card";
    const owned = accountOwnsCosmetic(account, item);
    const equipped = isCosmeticEquipped(account, item);
    const canAfford = wallet.balance >= item.cost;

    const preview = document.createElement("div");
    preview.className = "cosmetic-card__preview";
    if (item.type === "decor") {
      preview.classList.add("cosmetic-card__preview--decor");
      preview.textContent = item.value;
    } else if (item.type === "nameplate") {
      preview.classList.add("cosmetic-card__preview--nameplate");
      preview.style.backgroundImage = `url(${item.value})`;
    } else {
      preview.classList.add("cosmetic-card__preview--effect");
      if (item.value === "flame") preview.classList.add("cosmetic-card__preview--effect-flame");
      if (item.value === "ocean") preview.classList.add("cosmetic-card__preview--effect-ocean");
    }
    card.appendChild(preview);

    const meta = document.createElement("div");
    meta.className = "cosmetic-card__meta";
    const name = document.createElement("strong");
    name.textContent = item.name;
    const info = document.createElement("small");
    info.textContent = `${item.cost} shards · ${item.note}`;
    meta.appendChild(name);
    meta.appendChild(info);
    card.appendChild(meta);

    const action = document.createElement("button");
    action.type = "button";
    action.className = "cosmetic-card__action";
    if (equipped) {
      action.textContent = "Equipped";
      action.disabled = true;
      action.classList.add("is-owned");
    } else if (owned) {
      action.textContent = "Equip";
      action.classList.add("is-owned");
      action.addEventListener("click", () => {
        if (!equipCosmetic(account, item)) return;
        saveState();
        render();
        renderCosmeticsDialog();
      });
    } else {
      action.textContent = canAfford ? "Buy" : "Locked";
      action.disabled = !canAfford;
      action.addEventListener("click", () => {
        const result = buyCosmetic(account, item);
        if (!result.ok) {
          showToast(result.reason, { tone: "error" });
          return;
        }
        saveState();
        render();
        renderCosmeticsDialog();
        showToast(`Purchased ${item.name}.`);
      });
    }
    card.appendChild(action);
    ui.cosmeticsGrid.appendChild(card);
  });
}

function openCosmeticsDialog(tab = "decor") {
  if (!ui.cosmeticsDialog) return;
  cosmeticsTab = normalizeCosmeticsTab(tab);
  if (!ui.cosmeticsDialog.open) ui.cosmeticsDialog.showModal();
  renderCosmeticsDialog();
}

function renderQuestBadges(container, accountId) {
  if (!(container instanceof HTMLElement) || !accountId) return;
  const badges = resolveQuestBadgesForAccount(accountId);
  if (badges.length === 0) return;
  const wrap = document.createElement("div");
  wrap.className = "quest-badges";
  badges.forEach((label) => {
    const chip = document.createElement("span");
    chip.className = "quest-badge";
    chip.textContent = label;
    wrap.appendChild(chip);
  });
  container.appendChild(wrap);
}

function mediaAudioSuppressedByPreferences(prefs = getPreferences()) {
  if (!prefs || typeof prefs !== "object") return false;
  return prefs.mute === "on" || prefs.deafen === "on";
}

function applyMediaElementAudioPreferences(media, prefs = getPreferences()) {
  if (!(media instanceof HTMLMediaElement)) return;
  const suppressed = mediaAudioSuppressedByPreferences(prefs);
  const forceMuted = media instanceof HTMLVideoElement && media.dataset.forceMuted === "1";
  if (suppressed) {
    if (media.dataset.prefSuppressed !== "1") {
      media.dataset.prefPrevMuted = media.muted ? "1" : "0";
    }
    media.dataset.prefSuppressed = "1";
    media.muted = true;
    return;
  }
  if (media.dataset.prefSuppressed === "1") {
    const prevMuted = media.dataset.prefPrevMuted === "1";
    delete media.dataset.prefSuppressed;
    delete media.dataset.prefPrevMuted;
    media.muted = forceMuted ? true : prevMuted;
    return;
  }
  if (forceMuted) media.muted = true;
}

function applyMediaAudioPreferences(prefs = getPreferences()) {
  document.querySelectorAll("video, audio").forEach((node) => {
    if (node instanceof HTMLMediaElement) applyMediaElementAudioPreferences(node, prefs);
  });
  videoPipRuntimes.forEach((runtime) => {
    if (runtime?.video instanceof HTMLVideoElement) applyMediaElementAudioPreferences(runtime.video, prefs);
    if (runtime?.syncControls instanceof Function) runtime.syncControls();
  });
}

function isMobileNarrowLayout() {
  if (typeof document === "undefined" || !document.body) return false;
  if (document.body.dataset.mobile !== "on") return false;
  return mobileLayoutMediaQuery ? mobileLayoutMediaQuery.matches : window.innerWidth <= MOBILE_SIDEBAR_BREAKPOINT_PX;
}

function setMobilePane(pane, { persist = true, rerender = true } = {}) {
  const normalized = normalizeMobilePane(pane);
  state.preferences = getPreferences();
  if (state.preferences.mobilePane === normalized) return false;
  state.preferences.mobilePane = normalized;
  if (persist) saveState();
  if (rerender) {
    applyPreferencesToUI();
    renderChannels();
    renderMemberList();
  }
  return true;
}

function applyPreferencesToUI() {
  const prefs = getPreferences();
  const locale = resolveUiLocale(prefs);
  const narrowMobile = isMobileNarrowLayout();
  document.documentElement.lang = locale;
  document.body.style.setProperty("--ui-scale", `${prefs.uiScale}%`);
  document.body.dataset.locale = locale;
  document.body.dataset.theme = prefs.theme;
  document.body.dataset.compactMembers = prefs.compactMembers;
  document.body.dataset.developerMode = prefs.developerMode;
  document.body.dataset.debugOverlay = prefs.debugOverlay;
  document.body.dataset.hideChannelPanel = prefs.hideChannelPanel;
  document.body.dataset.hideMemberPanel = prefs.hideMemberPanel;
  document.body.dataset.mobilePane = narrowMobile ? prefs.mobilePane : "chat";
  document.body.dataset.collapseDmSection = prefs.collapseDmSection;
  document.body.dataset.collapseGuildSection = prefs.collapseGuildSection;
  ui.dockMuteBtn.style.opacity = prefs.mute === "on" ? "1" : "0.7";
  ui.dockHeadphonesBtn.style.opacity = prefs.deafen === "on" ? "1" : "0.7";
  if (ui.toggleChannelPanelBtn) {
    if (narrowMobile) {
      const navVisible = prefs.mobilePane === "nav";
      ui.toggleChannelPanelBtn.classList.toggle("chat-topic-edit--active", navVisible);
      setHeaderActionButtonLabel(ui.toggleChannelPanelBtn, navVisible ? "Chat" : "Channels");
    } else {
      const hidden = prefs.hideChannelPanel === "on";
      ui.toggleChannelPanelBtn.classList.toggle("chat-topic-edit--active", !hidden);
      setHeaderActionButtonLabel(ui.toggleChannelPanelBtn, hidden ? "Channels Off" : "Channels");
    }
  }
  if (ui.toggleMemberPanelBtn) {
    if (narrowMobile) {
      const membersVisible = prefs.mobilePane === "members";
      ui.toggleMemberPanelBtn.classList.toggle("chat-topic-edit--active", membersVisible);
      setHeaderActionButtonLabel(ui.toggleMemberPanelBtn, membersVisible ? "Chat" : "Members");
    } else {
      const hidden = prefs.hideMemberPanel === "on";
      ui.toggleMemberPanelBtn.classList.toggle("chat-topic-edit--active", !hidden);
      setHeaderActionButtonLabel(ui.toggleMemberPanelBtn, hidden ? "Members Off" : "Members");
    }
  }
  if (ui.toggleDmSectionBtn) {
    const collapsed = prefs.collapseDmSection === "on";
    ui.toggleDmSectionBtn.title = collapsed ? "Expand Direct Messages" : "Collapse Direct Messages";
    ui.toggleDmSectionBtn.setAttribute("aria-expanded", collapsed ? "false" : "true");
  }
  if (ui.toggleGuildSectionBtn) {
    const collapsed = prefs.collapseGuildSection === "on";
    ui.toggleGuildSectionBtn.title = collapsed ? "Expand Channels" : "Collapse Channels";
    ui.toggleGuildSectionBtn.setAttribute("aria-expanded", collapsed ? "false" : "true");
  }
  if (ui.toggleDmSectionChevron) ui.toggleDmSectionChevron.textContent = prefs.collapseDmSection === "on" ? "▸" : "▾";
  if (ui.toggleGuildSectionChevron) ui.toggleGuildSectionChevron.textContent = prefs.collapseGuildSection === "on" ? "▸" : "▾";
  if (ui.toggleSwfAudioBtn) {
    const mode = prefs.swfQuickAudioMode;
    const icon = mode === "on" ? "🔊" : mode === "click" ? "🔉" : "🔇";
    const title = mode === "on"
      ? "SWF audio auto on. Click: switch to click-to-hear. Right-click: force mute."
      : mode === "click"
        ? "SWF click-to-hear mode. Click a SWF to hear it. Click: switch to auto on. Right-click: force mute."
        : "SWF forced mute. Click: switch to click-to-hear.";
    ui.toggleSwfAudioBtn.textContent = icon;
    ui.toggleSwfAudioBtn.title = title;
    ui.toggleSwfAudioBtn.setAttribute("aria-label", title);
    ui.toggleSwfAudioBtn.classList.toggle("message-form__media-btn--active", mode === "on");
    ui.toggleSwfAudioBtn.classList.toggle("message-form__media-btn--force-muted", mode === "off");
  }
  if (ui.toggleMediaPrivacyBtn) {
    const enabled = prefs.mediaPrivacyMode !== "off";
    const title = enabled
      ? "Media privacy gate ON. Click to disable."
      : "Media privacy gate OFF. Click to enable.";
    ui.toggleMediaPrivacyBtn.textContent = enabled ? "🛡" : "🌐";
    ui.toggleMediaPrivacyBtn.title = title;
    ui.toggleMediaPrivacyBtn.setAttribute("aria-label", title);
    ui.toggleMediaPrivacyBtn.classList.toggle("message-form__media-btn--active", enabled);
    ui.toggleMediaPrivacyBtn.classList.toggle("message-form__media-btn--force-muted", !enabled);
  }
  swfRuntimes.forEach((runtime) => {
    runtime.audioEnabled = prefs.swfQuickAudioMode !== "off";
    if (prefs.swfQuickAudioMode === "on") runtime.audioClickAllowed = true;
  });
  applySwfAudioToAllRuntimes();
  applyMediaAudioPreferences(prefs);
  refreshHeaderActionButtonLabels();
  resizeComposerInput();
}

function toggleChannelPanelVisibility() {
  if (isMobileNarrowLayout()) {
    const prefs = getPreferences();
    setMobilePane(prefs.mobilePane === "nav" ? "chat" : "nav");
    return;
  }
  state.preferences = getPreferences();
  state.preferences.hideChannelPanel = state.preferences.hideChannelPanel === "on" ? "off" : "on";
  saveState();
  applyPreferencesToUI();
}

function toggleMemberPanelVisibility() {
  if (isMobileNarrowLayout()) {
    const prefs = getPreferences();
    setMobilePane(prefs.mobilePane === "members" ? "chat" : "members");
    return;
  }
  state.preferences = getPreferences();
  state.preferences.hideMemberPanel = state.preferences.hideMemberPanel === "on" ? "off" : "on";
  saveState();
  applyPreferencesToUI();
}

function toggleDmSectionCollapsed() {
  state.preferences = getPreferences();
  state.preferences.collapseDmSection = state.preferences.collapseDmSection === "on" ? "off" : "on";
  saveState();
  applyPreferencesToUI();
  renderChannels();
}

function toggleGuildSectionCollapsed() {
  state.preferences = getPreferences();
  state.preferences.collapseGuildSection = state.preferences.collapseGuildSection === "on" ? "off" : "on";
  saveState();
  applyPreferencesToUI();
  renderChannels();
}

function isSwipeNavigationBlockedTarget(target) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.closest("input, textarea, select, button, a, [contenteditable='true']")) return true;
  if (target.closest(".swf-pip, .video-pip, .media-picker, dialog[open], .settings-screen--active")) return true;
  return false;
}

function onMobileNavTouchStart(event) {
  if (!isMobileNarrowLayout() || !state.currentAccountId) return;
  if (event.touches.length !== 1) return;
  if (isSwipeNavigationBlockedTarget(event.target)) return;
  const touch = event.touches[0];
  mobileSwipeNavState = {
    id: touch.identifier,
    startX: touch.clientX,
    startY: touch.clientY,
    lastX: touch.clientX,
    lastY: touch.clientY,
    startTs: Date.now(),
    axis: ""
  };
}

function onMobileNavTouchMove(event) {
  if (!mobileSwipeNavState) return;
  const touch = Array.from(event.touches).find((entry) => entry.identifier === mobileSwipeNavState.id);
  if (!touch) return;
  const dx = touch.clientX - mobileSwipeNavState.startX;
  const dy = touch.clientY - mobileSwipeNavState.startY;
  mobileSwipeNavState.lastX = touch.clientX;
  mobileSwipeNavState.lastY = touch.clientY;
  if (!mobileSwipeNavState.axis) {
    if (Math.abs(dx) < 14 && Math.abs(dy) < 14) return;
    mobileSwipeNavState.axis = Math.abs(dx) > Math.abs(dy) * 1.1 ? "x" : "y";
  }
  if (mobileSwipeNavState.axis === "x") event.preventDefault();
}

function onMobileNavTouchEnd(event) {
  if (!mobileSwipeNavState) return;
  const ended = Array.from(event.changedTouches).find((entry) => entry.identifier === mobileSwipeNavState.id);
  if (!ended) return;
  const swipe = mobileSwipeNavState;
  mobileSwipeNavState = null;
  if (!isMobileNarrowLayout() || !state.currentAccountId) return;
  if (swipe.axis && swipe.axis !== "x") return;
  const dx = ended.clientX - swipe.startX;
  const dy = ended.clientY - swipe.startY;
  const dt = Date.now() - swipe.startTs;
  if (dt > 900) return;
  if (Math.abs(dx) < 72) return;
  if (Math.abs(dx) < Math.abs(dy) * 1.2) return;
  const currentPane = normalizeMobilePane(getPreferences().mobilePane);
  if (dx > 0) {
    if (currentPane === "members") {
      setMobilePane("chat");
      return;
    }
    setMobilePane("nav");
    return;
  }
  if (currentPane === "nav") {
    setMobilePane("chat");
    return;
  }
  setMobilePane("members");
}

function setSwfQuickAudioMode(mode) {
  state.preferences = getPreferences();
  state.preferences.swfQuickAudioMode = normalizeSwfQuickAudioMode(mode);
  state.preferences.swfAudio = state.preferences.swfQuickAudioMode === "off" ? "off" : "on";
  if (state.preferences.swfQuickAudioMode === "on") {
    swfRuntimes.forEach((runtime) => {
      runtime.audioClickAllowed = true;
      runtime.audioEnabled = true;
    });
  } else if (state.preferences.swfQuickAudioMode === "click") {
    swfRuntimes.forEach((runtime) => {
      runtime.audioEnabled = true;
    });
  } else {
    swfRuntimes.forEach((runtime) => {
      runtime.audioEnabled = false;
    });
  }
  saveState();
  applyPreferencesToUI();
}

function grantSwfAudioClickFocus(runtimeKey) {
  if (!runtimeKey) return;
  const runtime = swfRuntimes.get(runtimeKey);
  if (!runtime) return;
  const prefs = getPreferences();
  if (prefs.swfQuickAudioMode !== "click") {
    refreshSwfAudioFocus(runtimeKey);
    return;
  }
  swfRuntimes.forEach((entry) => {
    entry.audioClickAllowed = false;
  });
  runtime.audioClickAllowed = true;
  refreshSwfAudioFocus(runtimeKey);
}

function refreshSwfAudioFocus(preferredKey = null) {
  const prefs = getPreferences();
  const mode = prefs.swfQuickAudioMode;
  const runtimeConnected = (runtime) => runtime?.host instanceof HTMLElement && runtime.host.isConnected;
  if (mode === "off") {
    swfAudioFocusRuntimeKey = null;
    swfRuntimes.forEach((runtime, key) => {
      if (!runtimeConnected(runtime)) {
        runtime.audioSuppressed = true;
        updateSwfAudioUi(key);
        return;
      }
      runtime.audioSuppressed = true;
      applySwfAudioToRuntime(key);
      updateSwfAudioUi(key);
    });
    return;
  }
  const canUse = (key, runtime) => {
    if (!key || !runtime?.playing || !runtime.audioEnabled || runtime.audioPinned) return false;
    if (!runtimeConnected(runtime)) return false;
    if (mode === "click" && !runtime.audioClickAllowed) return false;
    return true;
  };
  if (mode === "click") {
    let hasClickFocus = false;
    swfRuntimes.forEach((runtime) => {
      if (hasClickFocus) return;
      if (!runtimeConnected(runtime)) return;
      if (!runtime?.playing || !runtime.audioEnabled) return;
      if (!runtime.audioClickAllowed) return;
      hasClickFocus = true;
    });
    if (!hasClickFocus) {
      const fallback = pickCenteredRuntimeKey((key, runtime) => (
        Boolean(key)
        && runtimeConnected(runtime)
        && runtime?.playing
        && runtime.audioEnabled
      ), { preferredKey });
      if (fallback) {
        swfRuntimes.forEach((entry) => {
          entry.audioClickAllowed = false;
        });
        const focused = swfRuntimes.get(fallback);
        if (focused) focused.audioClickAllowed = true;
      }
    }
  }
  if (swfSoloRuntimeKey) {
    const soloRuntime = swfRuntimes.get(swfSoloRuntimeKey);
    const allowSolo = canUse(swfSoloRuntimeKey, soloRuntime);
    swfAudioFocusRuntimeKey = allowSolo ? swfSoloRuntimeKey : null;
    swfRuntimes.forEach((runtime, key) => {
      if (!runtimeConnected(runtime)) {
        runtime.audioSuppressed = true;
        updateSwfAudioUi(key);
        return;
      }
      runtime.audioSuppressed = Boolean(
        !runtime.audioPinned
        && allowSolo
        && key !== swfSoloRuntimeKey
        && runtime.playing
        && runtime.audioEnabled
      );
      applySwfAudioToRuntime(key);
      updateSwfAudioUi(key);
    });
    return;
  }
  if (prefs.swfAudioPolicy === "multi") {
    swfAudioFocusRuntimeKey = null;
    swfRuntimes.forEach((runtime, key) => {
      if (!runtimeConnected(runtime)) {
        runtime.audioSuppressed = true;
        updateSwfAudioUi(key);
        return;
      }
      runtime.audioSuppressed = mode === "click" ? !runtime.audioClickAllowed : false;
      applySwfAudioToRuntime(key);
      updateSwfAudioUi(key);
    });
    return;
  }
  if (prefs.swfAudioScope === "guild") {
    const focusByGuild = new Map();
    swfRuntimes.forEach((runtime) => {
      const guildKey = runtime?.guildId || "__ungrouped__";
      if (focusByGuild.has(guildKey)) return;
      const centered = pickCenteredRuntimeKey(canUse, {
        guildId: guildKey,
        preferredKey: preferredKey
      });
      if (centered) focusByGuild.set(guildKey, centered);
    });
    swfAudioFocusRuntimeKey = null;
    swfRuntimes.forEach((runtime, key) => {
      if (!runtimeConnected(runtime)) {
        runtime.audioSuppressed = true;
        updateSwfAudioUi(key);
        return;
      }
      const guildKey = runtime.guildId || "__ungrouped__";
      runtime.audioSuppressed = Boolean(
        !runtime.audioPinned
        && runtime.playing
        && runtime.audioEnabled
        && (mode !== "click" || runtime.audioClickAllowed)
        && focusByGuild.get(guildKey)
        && focusByGuild.get(guildKey) !== key
      );
      if (mode === "click" && !runtime.audioClickAllowed) runtime.audioSuppressed = true;
      applySwfAudioToRuntime(key);
      updateSwfAudioUi(key);
    });
    return;
  }
  const centeredGlobal = pickCenteredRuntimeKey(canUse, { preferredKey });
  swfAudioFocusRuntimeKey = centeredGlobal;
  swfRuntimes.forEach((runtime, key) => {
    if (!runtimeConnected(runtime)) {
      runtime.audioSuppressed = true;
      updateSwfAudioUi(key);
      return;
    }
    runtime.audioSuppressed = Boolean(
      !runtime.audioPinned
      && swfAudioFocusRuntimeKey
      && key !== swfAudioFocusRuntimeKey
      && runtime.playing
      && runtime.audioEnabled
    );
    if (mode === "click" && !runtime.audioClickAllowed) runtime.audioSuppressed = true;
    applySwfAudioToRuntime(key);
    updateSwfAudioUi(key);
  });
}

function displayNameForMessage(message) {
  if (message.userId) {
    const account = getAccountById(message.userId);
    if (account) {
      const conversation = getActiveConversation();
      const guildId = conversation?.type === "channel" ? getActiveGuild()?.id || null : null;
      return displayNameForAccount(account, guildId);
    }
  }
  return decodeHtmlEntities((message.authorName || "Unknown").toString());
}

function initialsForName(name) {
  const cleaned = (name || "").replace(/[^a-z0-9 ]/gi, " ").trim();
  if (!cleaned) return "?";
  const chunks = cleaned.split(/\s+/).filter(Boolean).slice(0, 2);
  return chunks.map((part) => part[0]?.toUpperCase() || "").join("") || cleaned.slice(0, 1).toUpperCase();
}

function firstAvatarInitial(name) {
  const cleaned = (name || "").toString().trim();
  if (!cleaned) return "?";
  const char = [...cleaned][0] || "?";
  return char.toUpperCase();
}

function escapeSvgText(value) {
  return (value || "")
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function avatarInitialSvgDataUrl(initial) {
  const safeInitial = escapeSvgText(firstAvatarInitial(initial) || "?");
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text x='50' y='56' text-anchor='middle' dominant-baseline='middle' font-family='Inter,Arial,sans-serif' font-size='56' font-weight='700' fill='white'>${safeInitial}</text></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

function applyAvatarInitialGlyph(element, label) {
  if (!(element instanceof HTMLElement)) return;
  const initial = firstAvatarInitial(label || "?");
  element.textContent = "";
  element.dataset.initial = initial;
  element.setAttribute("aria-label", initial);
  element.style.backgroundImage = avatarInitialSvgDataUrl(initial);
  element.style.backgroundSize = "cover";
  element.style.backgroundPosition = "center";
}

const DEFAULT_AVATAR_COLOR_PALETTE = [
  "#5865f2",
  "#3ba55d",
  "#eb459e",
  "#faa81a",
  "#1abc9c",
  "#ed4245",
  "#57f287",
  "#5d6bf9",
  "#8e5cf6",
  "#2d8cff",
  "#4ecca3",
  "#f47b67"
];

function hashString32(value) {
  const source = (value || "").toString();
  let hash = 2166136261;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return hash >>> 0;
}

function isDefaultAvatarColor(color) {
  const token = (color || "").toString().trim().toLowerCase();
  return !token || token === "#57f287";
}

function fallbackAvatarColorForSeed(seed, currentColor = "") {
  const normalizedSeed = (seed || "").toString().trim().toLowerCase() || "avatar";
  if (!normalizedSeed) return currentColor || "#57f287";
  const hash = hashString32(normalizedSeed);
  return DEFAULT_AVATAR_COLOR_PALETTE[hash % DEFAULT_AVATAR_COLOR_PALETTE.length];
}

function fallbackAvatarColorForAccount(account, guildId = null, currentColor = "") {
  if (!account || typeof account !== "object") return currentColor || "#57f287";
  const fallbackSeed = [
    accountBareXmppJid(account),
    (account.username || "").toString(),
    (displayNameForAccount(account, guildId) || "").toString()
  ].find((entry) => (entry || "").toString().trim()) || "avatar";
  return fallbackAvatarColorForSeed(fallbackSeed, currentColor);
}

function shouldUseStrictInitialAvatar(account, guildId = null) {
  if (!account || typeof account !== "object") return false;
  const avatar = resolveAccountAvatar(account, guildId);
  if (isRenderableAvatarUrl(avatar.url || "")) return false;
  const bareJid = accountBareXmppJid(account);
  // For XMPP contacts, only use initials after we explicitly confirmed avatar absence.
  if (bareJid) return xmppAvatarMissingByJid.has(bareJid);
  // Local-only accounts without an avatar URL are considered explicitly avatar-less.
  return true;
}

function shouldGroupMessageWithPrevious(currentMessage, previousMessage) {
  if (!currentMessage || !previousMessage) return false;
  if (!currentMessage.userId || !previousMessage.userId) return false;
  if (currentMessage.userId !== previousMessage.userId) return false;
  if (currentMessage.replyTo || previousMessage.replyTo) return false;
  if (currentMessage.poll || previousMessage.poll) return false;
  const currentTs = toTimestampMs(currentMessage.ts);
  const previousTs = toTimestampMs(previousMessage.ts);
  if (!currentTs || !previousTs) return false;
  return (currentTs - previousTs) <= (10 * 60 * 1000);
}

function appendMentionOrEmoji(target, token, context) {
  const mentionMatch = token.match(/^@([a-z0-9._-]+)$/i);
  if (mentionMatch) {
    const username = mentionMatch[1].toLowerCase();
    const account = getAccountByUsername(username);
    if (!account) {
      target.appendChild(document.createTextNode(token));
      return;
    }
    const mention = document.createElement("span");
    mention.className = `mention ${context.current && context.current.id === account.id ? "mention--self" : ""}`;
    mention.textContent = `@${account.username}`;
    mention.addEventListener("click", () => openUserPopout(account));
    target.appendChild(mention);
    return;
  }
  const emojiMatch = token.match(/^:([a-z0-9_-]{1,32}):$/i);
  if (emojiMatch) {
    const emojiUrl = context.customEmojiMap.get(emojiMatch[1].toLowerCase());
    if (!emojiUrl) {
      target.appendChild(document.createTextNode(token));
      return;
    }
    const emojiImage = document.createElement("img");
    emojiImage.className = "inline-custom-emoji";
    emojiImage.src = emojiUrl;
    emojiImage.alt = token;
    emojiImage.loading = "lazy";
    target.appendChild(emojiImage);
    return;
  }
  target.appendChild(document.createTextNode(token));
}

function appendInlineCommandChip(target, label, invocation, { submit = false, title = "" } = {}) {
  const normalized = normalizeSlashCommandInvocation(invocation);
  if (!normalized) return false;
  const chip = document.createElement("button");
  chip.type = "button";
  chip.className = "inline-command-chip";
  chip.textContent = label;
  chip.title = title || (submit
    ? "Run command. Shift+click inserts only."
    : "Insert command. Shift+click runs immediately.");
  chip.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const shouldSubmit = submit ? !event.shiftKey : event.shiftKey;
    invokeInlineCommand(normalized, { submit: shouldSubmit });
  });
  target.appendChild(chip);
  return true;
}

function appendInlineRichText(target, text, context) {
  const tokenPattern = /(\|\|[^|\n]+\|\||\*\*[^*\n]+\*\*|__[^_\n]+__|\*[^*\n]+\*|_[^_\n]+_|~~[^~\n]+~~|`[^`\n]+`|!\[[^\]]{0,80}\]\((?:https?:\/\/|mailto:|xmpp:)[^\s)]+\)|\[[^\]]{1,80}\]\((?:https?:\/\/|mailto:|xmpp:|s67cmd:)[^\s)]+\)|https?:\/\/[^\s]+|mailto:[^\s]+|xmpp:[^\s]+|s67cmd:[^\s]+|\/[a-z][a-z0-9-]{1,31}\b|@[a-z0-9._-]+|:[a-z0-9_-]{1,32}:)/gi;
  let lastIndex = 0;
  let match = tokenPattern.exec(text);
  while (match) {
    if (match.index > lastIndex) {
      target.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
    }
    const token = match[0];
    if (token.startsWith("||") && token.endsWith("||")) {
      const spoiler = document.createElement("span");
      spoiler.className = "message-spoiler";
      spoiler.textContent = token.slice(2, -2);
      spoiler.title = "Click to reveal spoiler";
      spoiler.addEventListener("click", () => {
        spoiler.classList.toggle("is-revealed");
      });
      target.appendChild(spoiler);
    } else if (token.startsWith("**") && token.endsWith("**")) {
      const strong = document.createElement("strong");
      strong.textContent = token.slice(2, -2);
      target.appendChild(strong);
    } else if (token.startsWith("__") && token.endsWith("__")) {
      const prev = text[match.index - 1] || "";
      const next = text[match.index + token.length] || "";
      if (/[a-z0-9]/i.test(prev) || /[a-z0-9]/i.test(next)) {
        target.appendChild(document.createTextNode(token));
        lastIndex = tokenPattern.lastIndex;
        match = tokenPattern.exec(text);
        continue;
      }
      const strong = document.createElement("strong");
      strong.textContent = token.slice(2, -2);
      target.appendChild(strong);
    } else if (token.startsWith("*") && token.endsWith("*")) {
      const prev = text[match.index - 1] || "";
      const next = text[match.index + token.length] || "";
      if (/[a-z0-9]/i.test(prev) || /[a-z0-9]/i.test(next)) {
        target.appendChild(document.createTextNode(token));
        lastIndex = tokenPattern.lastIndex;
        match = tokenPattern.exec(text);
        continue;
      }
      const em = document.createElement("em");
      em.textContent = token.slice(1, -1);
      target.appendChild(em);
    } else if (token.startsWith("_") && token.endsWith("_")) {
      const prev = text[match.index - 1] || "";
      const next = text[match.index + token.length] || "";
      if (/[a-z0-9]/i.test(prev) || /[a-z0-9]/i.test(next)) {
        target.appendChild(document.createTextNode(token));
        lastIndex = tokenPattern.lastIndex;
        match = tokenPattern.exec(text);
        continue;
      }
      const em = document.createElement("em");
      em.textContent = token.slice(1, -1);
      target.appendChild(em);
    } else if (token.startsWith("~~") && token.endsWith("~~")) {
      const strike = document.createElement("s");
      strike.textContent = token.slice(2, -2);
      target.appendChild(strike);
    } else if (token.startsWith("`") && token.endsWith("`")) {
      const code = document.createElement("code");
      code.textContent = token.slice(1, -1);
      target.appendChild(code);
    } else if (token.startsWith("![") && token.includes("](") && token.endsWith(")")) {
      const parts = token.match(/^!\[([^\]]{0,80})\]\(((?:https?:\/\/|mailto:|xmpp:)[^\s)]+)\)$/i);
      const href = sanitizeRichTextHref(parts?.[2] || "");
      if (parts && href) {
        const link = document.createElement("a");
        link.href = href;
        link.textContent = parts[1] || href;
        link.target = "_blank";
        link.rel = "noreferrer noopener";
        target.appendChild(link);
      } else {
        target.appendChild(document.createTextNode(token));
      }
    } else if (token.startsWith("[") && token.includes("](") && token.endsWith(")")) {
      const parts = token.match(/^\[([^\]]{1,80})\]\(((?:https?:\/\/|mailto:|xmpp:|s67cmd:)[^\s)]+)\)$/i);
      const href = sanitizeRichTextHref(parts?.[2] || "");
      if (parts && href) {
        if (isInlineCommandHref(href)) {
          const label = parts[1] || normalizeSlashCommandInvocation(href) || "Run command";
          if (!appendInlineCommandChip(target, label, href, { submit: true })) {
            target.appendChild(document.createTextNode(token));
          }
        } else {
          const link = document.createElement("a");
          link.href = href;
          link.textContent = parts[1];
          link.target = "_blank";
          link.rel = "noreferrer noopener";
          target.appendChild(link);
        }
      } else {
        target.appendChild(document.createTextNode(token));
      }
    } else if (isInlineCommandHref(token)) {
      const label = normalizeSlashCommandInvocation(token) || token;
      if (!appendInlineCommandChip(target, label, token, { submit: true })) {
        target.appendChild(document.createTextNode(token));
      }
    } else if (/^\/[a-z][a-z0-9-]{1,31}$/i.test(token)) {
      if (!appendInlineCommandChip(target, token, token, { submit: false })) {
        target.appendChild(document.createTextNode(token));
      }
    } else if (isLikelyRichTextLink(token)) {
      const cleaned = token.replace(/[),.!?]+$/, "");
      const trailing = token.slice(cleaned.length);
      const href = sanitizeRichTextHref(cleaned);
      if (!href) {
        target.appendChild(document.createTextNode(token));
        lastIndex = tokenPattern.lastIndex;
        match = tokenPattern.exec(text);
        continue;
      }
      const link = document.createElement("a");
      link.href = href;
      link.textContent = cleaned;
      link.target = "_blank";
      link.rel = "noreferrer noopener";
      target.appendChild(link);
      if (trailing) target.appendChild(document.createTextNode(trailing));
    } else {
      appendMentionOrEmoji(target, token, context);
    }
    lastIndex = tokenPattern.lastIndex;
    match = tokenPattern.exec(text);
  }
  if (lastIndex < text.length) {
    target.appendChild(document.createTextNode(text.slice(lastIndex)));
  }
}

function renderMessageText(container, rawText) {
  const current = getCurrentAccount();
  const guild = getActiveGuild();
  ensureGuildMediaCollections(guild);
  const context = {
    current,
    customEmojiMap: new Map((guild?.customEmojis || []).map((emoji) => [emoji.name, emoji.url]))
  };
  const lines = decodeHtmlEntities(rawText || "").split("\n");
  let inFence = false;
  let fenceBuffer = [];
  let listEl = null;
  const flushList = () => {
    if (!listEl) return;
    container.appendChild(listEl);
    listEl = null;
  };
  const flushFence = () => {
    if (!inFence) return;
    const pre = document.createElement("pre");
    pre.className = "message-text-file";
    pre.textContent = fenceBuffer.join("\n");
    container.appendChild(pre);
    inFence = false;
    fenceBuffer = [];
  };
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("```")) {
      flushList();
      if (inFence) {
        flushFence();
      } else {
        inFence = true;
        fenceBuffer = [];
      }
      if (index < lines.length - 1) container.appendChild(document.createElement("br"));
      return;
    }
    if (inFence) {
      fenceBuffer.push(line);
      if (index === lines.length - 1) flushFence();
      return;
    }
    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      flushList();
      const heading = document.createElement("strong");
      heading.className = "message-heading";
      heading.textContent = headingMatch[2];
      container.appendChild(heading);
      if (index < lines.length - 1) container.appendChild(document.createElement("br"));
      return;
    }
    const bulletMatch = line.match(/^\s*[-*]\s+(.+)$/);
    const numberMatch = line.match(/^\s*\d+[.)]\s+(.+)$/);
    if (bulletMatch || numberMatch) {
      if (!listEl || listEl.tagName.toLowerCase() !== (numberMatch ? "ol" : "ul")) {
        flushList();
        listEl = document.createElement(numberMatch ? "ol" : "ul");
        listEl.className = "message-inline-list";
      }
      const item = document.createElement("li");
      appendInlineRichText(item, (bulletMatch?.[1] || numberMatch?.[1] || "").toString(), context);
      listEl.appendChild(item);
      if (index === lines.length - 1) flushList();
      return;
    }
    flushList();
    const quoteMatch = line.match(/^\s*(>{1,3})\s?(.*)$/);
    if (quoteMatch) {
      const quote = document.createElement("span");
      quote.className = "message-quote";
      appendInlineRichText(quote, quoteMatch[2] || "", context);
      container.appendChild(quote);
    } else {
      appendInlineRichText(container, line, context);
    }
    if (index < lines.length - 1) container.appendChild(document.createElement("br"));
  });
  flushList();
  flushFence();
}

function collectRenderableAttachments(message) {
  return normalizeAttachments([
    ...normalizeAttachments(message?.attachments),
    ...extractInlineAttachmentsFromText(message?.text || "")
  ]);
}

function stripInlineAttachmentUrlsFromText(text, attachments = []) {
  const raw = (text || "").toString();
  if (!raw) return "";
  if (!Array.isArray(attachments) || attachments.length === 0) return raw;
  const attachmentUrls = new Set(
    attachments
      .map((entry) => (entry?.url || "").toString().trim())
      .filter(Boolean)
  );
  if (attachmentUrls.size === 0) return raw;
  const stripped = raw.replace(/https?:\/\/\S+/gi, (token) => {
    const cleaned = token.replace(/[),.!?]+$/, "");
    if (!cleaned || !attachmentUrls.has(cleaned)) return token;
    const suffix = token.slice(cleaned.length);
    return /^[),.!?]+$/.test(suffix) ? suffix : "";
  });
  return stripped
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trimEnd();
}

function extractImageUrl(text) {
  if (!text) return null;
  const matches = text.match(/https?:\/\/\S+/gi);
  if (!matches) return null;
  const imageUrl = matches.find((url) => /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(url));
  return imageUrl || null;
}

function inferAttachmentTypeFromUrl(url) {
  const raw = (url || "").toString().trim();
  if (!raw) return null;
  const clean = raw.toLowerCase();
  let pathAndQuery = clean;
  try {
    const parsed = new URL(raw, globalThis.location?.href || "http://localhost/");
    pathAndQuery = `${(parsed.pathname || "").toLowerCase()}${(parsed.search || "").toLowerCase()}`;
  } catch {
    // Ignore malformed URLs and fallback to the raw value.
  }
  const haystacks = [clean, pathAndQuery];
  const has = (pattern) => haystacks.some((value) => pattern.test(value));
  if (has(/\.swf(\?|$|&|#)/i)) return "swf";
  if (has(/\.svg(\?|$|&|#)/i)) return "svg";
  if (has(/\.html?(\?|$|&|#)/i)) return "html";
  if (has(/\.pdf(\?|$|&|#)/i)) return "pdf";
  if (has(/\.rtf(\?|$|&|#)/i)) return "rtf";
  if (has(/\.(odt|ods|odp|doc|docx|xls|xlsx|ppt|pptx)(\?|$|&|#)/i)) return "odf";
  if (has(/\.(mp3|ogg|wav|m4a|flac)(\?|$|&|#)/i)) return "audio";
  if (has(/\.(txt|md|log|json|js|ts|css|html|xml|yml|yaml|ini|toml)(\?|$|&|#)/i)) return "text";
  if (has(/\.bin(\?|$|&|#)/i)) return "bin";
  if (has(/\.apng(\?|$|&|#)/i)) return "sticker";
  if (has(/\.lottie(\?|$|&|#)/i)) return "sticker";
  if (has(/\/stickers?\//i) && has(/\.(png|gif|webp|apng|lottie)(\?|$|&|#)/i)) return "sticker";
  if (has(/\.(mp4|webm|mov|m4v|ogv|m3u8|mkv|avi|wmv|mpe?g|m2ts|ts)(\?|$|&|#)/i) || has(/[?&](?:format|fm|ext)=?(mp4|webm|mov|m4v|ogv|m3u8|mkv|avi|wmv|mpe?g|m2ts|ts)(?:[&#]|$)/i)) return "video";
  if (has(/\.(png|jpe?g|gif|webp|bmp|avif|heic|heif|jfif)(\?|$|&|#)/i) || has(/[?&](?:format|fm|ext)=?(png|jpe?g|gif|webp|bmp|avif|heic|heif)(?:[&#]|$)/i)) return "gif";
  if (has(/\/[^/?#]+\.[a-z0-9]{1,12}(\?|$|&|#)/i)) return "file";
  return null;
}

function inferAttachmentTypeFromMime(mime = "") {
  const raw = (mime || "").toString().trim().toLowerCase();
  if (!raw) return null;
  const clean = raw.split(";")[0].trim();
  if (!clean) return null;
  if (clean.startsWith("image/")) {
    if (clean.includes("svg")) return "svg";
    if (clean.includes("apng") || clean.includes("lottie")) return "sticker";
    return "gif";
  }
  if (clean === "application/x-shockwave-flash") return "swf";
  if (clean === "application/pdf") return "pdf";
  if (clean === "application/rtf" || clean === "text/rtf") return "rtf";
  if (clean.startsWith("audio/")) return "audio";
  if (clean.startsWith("video/")) return "video";
  if (clean.startsWith("text/")) return "text";
  if (
    clean.includes("officedocument")
    || clean.includes("msword")
    || clean.includes("vnd.ms-")
    || clean.includes("vnd.oasis.opendocument")
  ) {
    return "odf";
  }
  return null;
}

function inferVideoMimeType(value) {
  const raw = (value || "").toString().toLowerCase();
  if (/\.mp4(\?|$|&|#)/i.test(raw) || /[?&](?:format|fm|ext)=?mp4(?:[&#]|$)/i.test(raw)) return "video/mp4";
  if (/\.webm(\?|$|&|#)/i.test(raw) || /[?&](?:format|fm|ext)=?webm(?:[&#]|$)/i.test(raw)) return "video/webm";
  if (/\.ogv(\?|$|&|#)/i.test(raw) || /[?&](?:format|fm|ext)=?ogv(?:[&#]|$)/i.test(raw)) return "video/ogg";
  if (/\.m3u8(\?|$|&|#)/i.test(raw) || /[?&](?:format|fm|ext)=?m3u8(?:[&#]|$)/i.test(raw)) return "application/x-mpegURL";
  if (/\.mov(\?|$|&|#)/i.test(raw) || /[?&](?:format|fm|ext)=?mov(?:[&#]|$)/i.test(raw)) return "video/quicktime";
  if (/\.m4v(\?|$|&|#)/i.test(raw) || /[?&](?:format|fm|ext)=?m4v(?:[&#]|$)/i.test(raw)) return "video/x-m4v";
  if (/\.mkv(\?|$|&|#)/i.test(raw) || /[?&](?:format|fm|ext)=?mkv(?:[&#]|$)/i.test(raw)) return "video/x-matroska";
  if (/\.avi(\?|$|&|#)/i.test(raw) || /[?&](?:format|fm|ext)=?avi(?:[&#]|$)/i.test(raw)) return "video/x-msvideo";
  if (/\.wmv(\?|$|&|#)/i.test(raw) || /[?&](?:format|fm|ext)=?wmv(?:[&#]|$)/i.test(raw)) return "video/x-ms-wmv";
  if (/\.(mpeg|mpg)(\?|$|&|#)/i.test(raw) || /[?&](?:format|fm|ext)=?mpe?g(?:[&#]|$)/i.test(raw)) return "video/mpeg";
  if (/\.(m2ts|ts)(\?|$|&|#)/i.test(raw) || /[?&](?:format|fm|ext)=?(m2ts|ts)(?:[&#]|$)/i.test(raw)) return "video/mp2t";
  return "";
}

function inferAttachmentFormat(type, url) {
  if (type !== "sticker") return "image";
  return stickerFormatFromName("", url);
}

function extractInlineAttachmentsFromText(text) {
  if (!text) return [];
  const results = [];
  const matches = text.match(/(?:https?:\/\/\S+|(?:\.?\/)?[a-z0-9._%+-]+\.(?:swf|svg|html?|pdf|rtf|odt|ods|odp|docx?|xlsx?|pptx?|apng|lottie|png|jpe?g|gif|webp|bmp|avif|heic|heif|mp4|webm|mov|m4v|ogv|m3u8|mp3|ogg|wav|m4a|flac|txt|md|log|json|js|ts|css|xml|yml|yaml|ini|toml|bin))/gi) || [];
  const seen = new Set();
  matches.forEach((raw) => {
    const cleaned = raw.replace(/[),.!?]+$/, "");
    if (seen.has(cleaned)) return;
    const type = inferAttachmentTypeFromUrl(cleaned);
    if (!type) return;
    seen.add(cleaned);
    results.push({
      type,
      url: cleaned,
      name: cleaned.split("/").pop() || cleaned,
      format: inferAttachmentFormat(type, cleaned)
    });
  });
  return results.slice(0, 4);
}

function decodeDataUrlPreviewBytes(url, limit = 65536) {
  const safeLimit = Math.max(64, Math.min(524288, Number(limit) || 65536));
  const raw = (url || "").toString();
  const match = raw.match(/^data:([^,]*?),(.*)$/is);
  if (!match) return null;
  const meta = (match[1] || "").toLowerCase();
  const payload = (match[2] || "").trim();
  if (!payload) return new Uint8Array();
  if (meta.includes(";base64")) {
    const clean = payload.replace(/\s+/g, "");
    const charsNeeded = Math.max(4, Math.ceil(safeLimit / 3) * 4);
    const sliced = clean.slice(0, charsNeeded);
    let padded = sliced;
    while (padded.length % 4 !== 0) padded += "=";
    try {
      const binary = atob(padded);
      const length = Math.min(binary.length, safeLimit);
      const bytes = new Uint8Array(length);
      for (let index = 0; index < length; index += 1) bytes[index] = binary.charCodeAt(index);
      return bytes;
    } catch {
      return null;
    }
  }
  try {
    const decoded = decodeURIComponent(payload.replace(/\+/g, "%20"));
    return new TextEncoder().encode(decoded).slice(0, safeLimit);
  } catch {
    return null;
  }
}

function getCachedAttachmentPreview(cacheMap, key) {
  const cached = cacheMap.get(key);
  if (!cached) return "";
  if (cached.expiresAt <= Date.now()) {
    cacheMap.delete(key);
    return "";
  }
  return (cached.value || "").toString();
}

function setCachedAttachmentPreview(cacheMap, key, value, ttlMs = 5 * 60 * 1000) {
  cacheMap.set(key, {
    value: (value || "").toString(),
    expiresAt: Date.now() + Math.max(10_000, Number(ttlMs) || (5 * 60 * 1000))
  });
}

async function loadTextAttachmentPreview(url) {
  const key = (url || "").toString();
  const cached = getCachedAttachmentPreview(attachmentTextPreviewCache, key);
  if (cached) return cached;
  if (attachmentTextPreviewInFlight.has(key)) {
    return attachmentTextPreviewInFlight.get(key);
  }
  const inlineBytes = decodeDataUrlPreviewBytes(url, 70_000);
  if (inlineBytes instanceof Uint8Array) {
    const text = new TextDecoder().decode(inlineBytes);
    const lines = text.replace(/\r\n/g, "\n").split("\n");
    const clipped = lines.slice(0, 40).join("\n").slice(0, 3500);
    const truncated = lines.length > 40 || text.length > clipped.length;
    const preview = `${clipped}${truncated ? "\n… (truncated)" : ""}`;
    setCachedAttachmentPreview(attachmentTextPreviewCache, key, preview, 30 * 60 * 1000);
    return preview;
  }
  const task = (async () => {
    const response = await fetch(url, {
      cache: "force-cache",
      headers: { Range: "bytes=0-65535" }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();
    const lines = text.replace(/\r\n/g, "\n").split("\n");
    const clipped = lines.slice(0, 40).join("\n").slice(0, 3500);
    const partial = response.status === 206;
    const truncated = partial || lines.length > 40 || text.length > clipped.length;
    const preview = `${clipped}${truncated ? "\n… (truncated)" : ""}`;
    setCachedAttachmentPreview(attachmentTextPreviewCache, key, preview, 30 * 60 * 1000);
    return preview;
  })().finally(() => {
    attachmentTextPreviewInFlight.delete(key);
  });
  attachmentTextPreviewInFlight.set(key, task);
  return task;
}

async function loadBinaryPreview(url, limit = 512) {
  const safeLimit = Math.max(64, Math.min(4096, Number(limit) || 512));
  const key = `${(url || "").toString()}::${safeLimit}`;
  const cached = getCachedAttachmentPreview(attachmentBinaryPreviewCache, key);
  if (cached) return cached;
  if (attachmentBinaryPreviewInFlight.has(key)) {
    return attachmentBinaryPreviewInFlight.get(key);
  }
  const inlineBytes = decodeDataUrlPreviewBytes(url, safeLimit);
  if (inlineBytes instanceof Uint8Array) {
    const lines = [];
    for (let i = 0; i < inlineBytes.length; i += 16) {
      const chunk = inlineBytes.slice(i, i + 16);
      const hex = [...chunk].map((b) => b.toString(16).padStart(2, "0")).join(" ");
      const ascii = [...chunk].map((b) => (b >= 32 && b <= 126 ? String.fromCharCode(b) : ".")).join("");
      lines.push(`${i.toString(16).padStart(4, "0")}  ${hex.padEnd(47, " ")}  ${ascii}`);
    }
    const preview = lines.join("\n");
    setCachedAttachmentPreview(attachmentBinaryPreviewCache, key, preview);
    return preview;
  }
  const task = (async () => {
    const response = await fetch(url, { cache: "force-cache" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const buffer = await response.arrayBuffer();
    const bytes = new Uint8Array(buffer.slice(0, Math.min(safeLimit, buffer.byteLength)));
    const lines = [];
    for (let i = 0; i < bytes.length; i += 16) {
      const chunk = bytes.slice(i, i + 16);
      const hex = [...chunk].map((b) => b.toString(16).padStart(2, "0")).join(" ");
      const ascii = [...chunk].map((b) => (b >= 32 && b <= 126 ? String.fromCharCode(b) : ".")).join("");
      lines.push(`${i.toString(16).padStart(4, "0")}  ${hex.padEnd(47, " ")}  ${ascii}`);
    }
    const suffix = buffer.byteLength > bytes.length ? `\n… (${buffer.byteLength - bytes.length} bytes more)` : "";
    const preview = lines.join("\n") + suffix;
    setCachedAttachmentPreview(attachmentBinaryPreviewCache, key, preview);
    return preview;
  })().finally(() => {
    attachmentBinaryPreviewInFlight.delete(key);
  });
  attachmentBinaryPreviewInFlight.set(key, task);
  return task;
}

function rtfToPlainText(rtf) {
  if (!rtf) return "";
  return rtf
    .replace(/\\par[d]?/g, "\n")
    .replace(/\\tab/g, "\t")
    .replace(/\\'[0-9a-f]{2}/gi, " ")
    .replace(/\\[a-z]+-?\d* ?/gi, "")
    .replace(/[{}]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function loadSwfLibrary() {
  const manifestCandidates = [
    "/swf/index.json",
    "/swf/swf-index.json",
    "/swf-index.json",
    "./swf/index.json",
    "./swf/swf-index.json",
    "./swf-index.json",
    "swf/index.json",
    "swf/swf-index.json",
    "swf-index.json"
  ];
  try {
    let parsed = null;
    for (const manifestUrl of manifestCandidates) {
      // eslint-disable-next-line no-await-in-loop
      const response = await fetch(manifestUrl, { cache: "no-cache" }).catch(() => null);
      if (!response?.ok) continue;
      // eslint-disable-next-line no-await-in-loop
      const json = await response.json().catch(() => null);
      if (!Array.isArray(json)) continue;
      parsed = json;
      break;
    }
    if (!Array.isArray(parsed)) return;
    swfLibrary = parsed
      .filter((entry) => entry && typeof entry.url === "string" && typeof entry.name === "string")
      .map((entry) => ({ name: entry.name, url: entry.url }))
      .slice(0, 600);
    if (mediaPickerOpen && mediaPickerTab === "swf") {
      renderMediaPicker();
    }
  } catch {
    // SWF picker still works with fallback list only.
  }
}

function normalizeEmojiLibraryEntry(entry, source = "builtin") {
  if (!entry || typeof entry !== "object") return null;
  const value = (entry.value || entry.emoji || entry.unicode || "").toString().trim();
  if (!value) return null;
  const rawName = (entry.name || entry.annotation || entry.label || "").toString().trim();
  const fallbackName = [...value].map((ch) => ch.codePointAt(0)?.toString(16).padStart(4, "0")).join("_");
  const normalizedName = sanitizeMediaName(rawName.toLowerCase().replace(/\s+/g, "_"), `emoji_${fallbackName}`);
  const aliases = Array.isArray(entry.aliases)
    ? entry.aliases
    : Array.isArray(entry.shortcodes)
      ? entry.shortcodes
      : typeof entry.shortcode === "string"
        ? [entry.shortcode]
        : [];
  const keywords = Array.isArray(entry.keywords)
    ? entry.keywords
    : Array.isArray(entry.tags)
      ? entry.tags
      : [];
  return {
    name: normalizedName || `emoji_${fallbackName}`,
    value,
    aliases: [...new Set(aliases.map((item) => (item || "").toString().trim().toLowerCase()).filter(Boolean))].slice(0, 24),
    keywords: [...new Set(keywords.map((item) => (item || "").toString().trim().toLowerCase()).filter(Boolean))].slice(0, 32),
    source: (entry.source || source || "builtin").toString()
  };
}

function normalizeEmojiDatasetEntries(rawEntries) {
  if (!Array.isArray(rawEntries)) return [];
  const deduped = new Map();
  const appendEntry = (entry) => {
    const normalized = normalizeEmojiLibraryEntry(entry, "builtin");
    if (!normalized) return;
    if (deduped.has(normalized.value)) return;
    deduped.set(normalized.value, normalized);
  };
  rawEntries.forEach((entry) => {
    appendEntry(entry);
    if (Array.isArray(entry?.skins)) {
      entry.skins.forEach((skin) => {
        appendEntry({
          ...skin,
          name: (entry?.annotation || entry?.name || entry?.label || "").toString() || skin?.annotation || skin?.name || "",
          aliases: Array.isArray(entry?.shortcodes) ? entry.shortcodes : skin?.shortcodes || [],
          keywords: Array.isArray(entry?.tags) ? entry.tags : skin?.tags || []
        });
      });
    }
  });
  return [...deduped.values()];
}

function normalizeEmojiCachedEntries(rawEntries) {
  if (!Array.isArray(rawEntries)) return [];
  const deduped = new Map();
  rawEntries.forEach((entry) => {
    const normalized = normalizeEmojiLibraryEntry(entry, "builtin");
    if (!normalized) return;
    if (deduped.has(normalized.value)) return;
    deduped.set(normalized.value, normalized);
  });
  return [...deduped.values()];
}

function parseEmojiTestDataset(text) {
  if (typeof text !== "string" || !text.trim()) return [];
  const deduped = new Map();
  text.split(/\r?\n/).forEach((line) => {
    const clean = line.trim();
    if (!clean || clean.startsWith("#")) return;
    if (!/;\s*fully-qualified/.test(clean)) return;
    const hashIndex = clean.indexOf("#");
    if (hashIndex <= 0) return;
    const left = clean.slice(0, hashIndex).trim();
    const right = clean.slice(hashIndex + 1).trim();
    const codepointHex = left.split(";")[0].trim();
    if (!codepointHex) return;
    const codepoints = codepointHex.split(/\s+/).map((token) => Number.parseInt(token, 16)).filter(Number.isFinite);
    if (codepoints.length === 0) return;
    let value = "";
    try {
      value = String.fromCodePoint(...codepoints);
    } catch {
      value = "";
    }
    if (!value || deduped.has(value)) return;
    const nameMatch = right.match(/^\S+\s+E[\d.]+\s+(.+)$/);
    const label = (nameMatch?.[1] || "").toString().trim();
    const words = label.toLowerCase().split(/[\s,_-]+/).filter(Boolean);
    const alias = words.slice(0, 4).join("_");
    const normalized = normalizeEmojiLibraryEntry({
      value,
      name: label || value,
      aliases: alias ? [alias] : [],
      keywords: words.slice(0, 12)
    }, "builtin");
    if (!normalized) return;
    deduped.set(value, normalized);
  });
  return [...deduped.values()];
}

function loadCachedEmojiDataset() {
  try {
    const raw = localStorage.getItem(EMOJI_DATASET_CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.some((entry) => entry && typeof entry.value === "string")) {
      return normalizeEmojiCachedEntries(parsed);
    }
    return normalizeEmojiDatasetEntries(parsed);
  } catch {
    return [];
  }
}

function cacheEmojiDataset(normalizedEntries) {
  try {
    if (!Array.isArray(normalizedEntries) || normalizedEntries.length === 0) return;
    localStorage.setItem(EMOJI_DATASET_CACHE_KEY, JSON.stringify(normalizedEntries));
  } catch {
    // Ignore quota/storage failures.
  }
}

async function ensureEmojiLibraryLoaded({ force = false } = {}) {
  if (emojiLibraryLoading && emojiLibraryLoadPromise) return emojiLibraryLoadPromise;
  if (!force && emojiLibraryLoaded) return emojiLibraryEntries;
  if (!force) {
    const cached = loadCachedEmojiDataset();
    if (cached.length > 0) {
      emojiLibraryEntries = cached;
      emojiLibraryLoaded = true;
      emojiLibraryError = "";
      return emojiLibraryEntries;
    }
  }
  emojiLibraryLoading = true;
  emojiLibraryError = "";
  emojiLibraryLoadPromise = (async () => {
    let lastError = "";
    for (const source of EMOJI_DATASET_SOURCES) {
      try {
        const response = await fetch(source, { cache: "no-store" });
        if (!response.ok) {
          lastError = `HTTP ${response.status}`;
          continue;
        }
        const isTextDataset = /\.txt(\?|$)/i.test(source);
        const normalized = isTextDataset
          ? parseEmojiTestDataset(await response.text())
          : normalizeEmojiDatasetEntries(await response.json());
        if (normalized.length === 0) {
          lastError = "Dataset was empty";
          continue;
        }
        emojiLibraryEntries = normalized;
        emojiLibraryLoaded = true;
        emojiLibraryError = "";
        cacheEmojiDataset(normalized);
        return emojiLibraryEntries;
      } catch (error) {
        lastError = String(error || "Request failed");
      }
    }
    emojiLibraryLoaded = false;
    emojiLibraryError = lastError ? `Could not load full emoji set (${lastError}).` : "Could not load full emoji set.";
    return emojiLibraryEntries;
  })().finally(() => {
    emojiLibraryLoading = false;
    emojiLibraryLoadPromise = null;
    if (mediaPickerOpen && mediaPickerTab === "emoji") renderMediaPicker();
  });
  return emojiLibraryLoadPromise;
}

function mediaEntriesForActiveTab() {
  const guild = getActiveGuild();
  ensureGuildMediaCollections(guild);
  if (mediaPickerTab === "emoji") {
    const prefs = getPreferences();
    const recents = normalizeRecentEmojis(prefs.recentEmojis);
    const builtIn = emojiLibraryEntries
      .map((entry) => {
        const recentIndex = recents.indexOf(entry.value);
        return { ...entry, source: "builtin", recentIndex };
      })
      .sort((a, b) => {
        const aRecent = a.recentIndex >= 0;
        const bRecent = b.recentIndex >= 0;
        if (aRecent && bRecent) return a.recentIndex - b.recentIndex;
        if (aRecent) return -1;
        if (bRecent) return 1;
        return a.name.localeCompare(b.name);
      });
    const custom = (guild?.customEmojis || []).map((entry) => ({ ...entry, source: "guild-custom" }));
    return [...custom, ...builtIn];
  }
  if (mediaPickerTab === "gif") {
    const custom = (guild?.customGifs || []).map((entry) => ({ ...entry, source: "guild-custom" }));
    return dedupeGifEntries([...custom, ...GIF_LIBRARY, ...gifPickerRemoteEntries]);
  }
  if (mediaPickerTab === "sticker") {
    const custom = (guild?.customStickers || []).map((entry) => ({ ...entry, source: "guild-custom" }));
    return dedupeStickerEntries([...custom, ...STICKER_LIBRARY, ...stickerPickerRemoteEntries]);
  }
  if (mediaPickerTab === "svg") {
    const custom = (guild?.customSvgs || []).map((entry) => ({ ...entry, source: "guild-custom" }));
    return [...custom, ...SVG_LIBRARY];
  }
  if (mediaPickerTab === "pdf") {
    const custom = (guild?.customPdfs || []).map((entry) => ({ ...entry, source: "guild-custom" }));
    return custom;
  }
  if (mediaPickerTab === "text") {
    const custom = (guild?.customTexts || []).map((entry) => ({ ...entry, source: "guild-custom" }));
    return custom;
  }
  if (mediaPickerTab === "docs") {
    const custom = (guild?.customDocs || []).map((entry) => ({ ...entry, source: "guild-custom" }));
    return custom;
  }
  if (mediaPickerTab === "swf") {
    const custom = (guild?.customSwfs || []).map((entry) => ({ ...entry, source: "guild-custom" }));
    return [...custom, ...swfLibrary];
  }
  if (mediaPickerTab === "html") {
    const custom = (guild?.customHtmls || []).map((entry) => ({ ...entry, source: "guild-custom" }));
    return custom;
  }
  return [];
}

function gifPickerQueryKey() {
  return (mediaPickerQuery || "").toString().trim().toLowerCase();
}

function stickerPickerQueryKey() {
  return (mediaPickerQuery || "").toString().trim().toLowerCase();
}

function normalizeGifPickerEntry(entry) {
  const value = entry && typeof entry === "object" ? entry : {};
  const name = (value.name || "gif").toString().trim().slice(0, 120) || "gif";
  const url = (value.url || "").toString().trim();
  if (!url) return null;
  const preview = value.preview === "video" ? "video" : "";
  return { name, url, preview, source: "remote" };
}

function appendGifPickerEntries(entries) {
  if (!Array.isArray(entries) || entries.length === 0) return;
  const seen = new Set(gifPickerRemoteEntries.map((entry) => `${entry.url}::${entry.name}`));
  const next = [...gifPickerRemoteEntries];
  entries.forEach((entry) => {
    const normalized = normalizeGifPickerEntry(entry);
    if (!normalized) return;
    const key = `${normalized.url}::${normalized.name}`;
    if (seen.has(key)) return;
    seen.add(key);
    next.push(normalized);
  });
  gifPickerRemoteEntries = next.slice(0, GIF_PICKER_REMOTE_MAX);
}

function normalizeStickerPickerEntry(entry) {
  const value = entry && typeof entry === "object" ? entry : {};
  const name = (value.name || "sticker").toString().trim().slice(0, 120) || "sticker";
  const url = (value.url || "").toString().trim();
  if (!url) return null;
  const format = stickerFormatFromName(name, url);
  return { name, url, format, source: "remote" };
}

function appendStickerPickerEntries(entries) {
  if (!Array.isArray(entries) || entries.length === 0) return;
  const seen = new Set(stickerPickerRemoteEntries.map((entry) => `${entry.url}::${entry.name}`));
  const next = [...stickerPickerRemoteEntries];
  entries.forEach((entry) => {
    const normalized = normalizeStickerPickerEntry(entry);
    if (!normalized) return;
    const key = `${normalized.url}::${normalized.name}`;
    if (seen.has(key)) return;
    seen.add(key);
    next.push(normalized);
  });
  stickerPickerRemoteEntries = next.slice(0, STICKER_PICKER_REMOTE_MAX);
}

function readStoredTenorCredentials() {
  try {
    return {
      key: normalizeTenorApiKey(localStorage.getItem(TENOR_KEY_STORAGE_KEY) || ""),
      clientKey: normalizeTenorClientKey(localStorage.getItem(TENOR_CLIENT_STORAGE_KEY) || ""),
      readable: true
    };
  } catch {
    return { key: "", clientKey: "", readable: false };
  }
}

function writeStoredTenorCredentials(key, clientKey) {
  const nextKey = normalizeTenorApiKey(key);
  const nextClientKey = normalizeTenorClientKey(clientKey);
  try {
    if (nextKey) localStorage.setItem(TENOR_KEY_STORAGE_KEY, nextKey);
    else localStorage.removeItem(TENOR_KEY_STORAGE_KEY);
    if (nextClientKey) localStorage.setItem(TENOR_CLIENT_STORAGE_KEY, nextClientKey);
    else localStorage.removeItem(TENOR_CLIENT_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

function invalidateGifPickerRemoteEntries() {
  gifPickerRemoteRequestToken += 1;
  gifPickerRemoteLoading = false;
  gifPickerRemoteEntries = [];
  gifPickerRemoteNext = "";
  gifPickerRemoteError = "";
  gifPickerVisibleCount = GIF_PICKER_INITIAL_PAGE_SIZE;
}

function invalidateStickerPickerRemoteEntries() {
  stickerPickerRemoteRequestToken += 1;
  stickerPickerRemoteLoading = false;
  stickerPickerRemoteEntries = [];
  stickerPickerRemoteNext = "";
  stickerPickerRemoteError = "";
  stickerPickerVisibleCount = STICKER_PICKER_INITIAL_PAGE_SIZE;
}

function setTenorCredentialsStatus(message, tone = "") {
  if (!ui.tenorCredentialsStatus) return;
  ui.tenorCredentialsStatus.textContent = (message || "").toString().slice(0, 240);
  if (tone === "ok" || tone === "error") ui.tenorCredentialsStatus.dataset.tone = tone;
  else delete ui.tenorCredentialsStatus.dataset.tone;
}

function setTenorApiKeyVisibility(visible) {
  tenorApiKeyVisible = Boolean(visible);
  if (ui.tenorApiKeyInput) ui.tenorApiKeyInput.type = tenorApiKeyVisible ? "text" : "password";
  if (ui.toggleTenorApiKeyBtn) {
    ui.toggleTenorApiKeyBtn.textContent = tenorApiKeyVisible ? "Hide API Key" : "Show API Key";
    ui.toggleTenorApiKeyBtn.setAttribute("aria-pressed", tenorApiKeyVisible ? "true" : "false");
  }
}

function renderTenorCredentialSettings() {
  const stored = readStoredTenorCredentials();
  setTenorApiKeyVisibility(false);
  if (ui.tenorApiKeyInput) ui.tenorApiKeyInput.value = stored.key;
  if (ui.tenorClientKeyInput) ui.tenorClientKeyInput.value = stored.clientKey;
  if (!stored.readable) {
    setTenorCredentialsStatus("Tenor credentials unavailable: browser storage is blocked.", "error");
    return;
  }
  if (stored.key) {
    const activeClientKey = stored.clientKey || TENOR_CLIENT_KEY;
    setTenorCredentialsStatus(`Using custom Tenor credentials (client: ${activeClientKey}).`, "ok");
    return;
  }
  setTenorCredentialsStatus("Using built-in demo Tenor credentials.");
}

function saveTenorCredentialSettings({ refreshGifPicker = false } = {}) {
  if (!ui.tenorApiKeyInput || !ui.tenorClientKeyInput) return true;
  const key = normalizeTenorApiKey(ui.tenorApiKeyInput.value);
  const clientKey = normalizeTenorClientKey(ui.tenorClientKeyInput.value);
  ui.tenorApiKeyInput.value = key;
  ui.tenorClientKeyInput.value = clientKey;
  const saved = writeStoredTenorCredentials(key, clientKey);
  if (!saved) {
    setTenorCredentialsStatus("Could not persist Tenor credentials in browser storage.", "error");
    return false;
  }
  if (key) {
    setTenorCredentialsStatus(`Saved custom Tenor credentials (client: ${clientKey || TENOR_CLIENT_KEY}).`, "ok");
  } else {
    setTenorCredentialsStatus("Tenor credentials cleared. Using built-in demo key.");
  }
  if (refreshGifPicker) {
    invalidateGifPickerRemoteEntries();
    invalidateStickerPickerRemoteEntries();
    if (mediaPickerOpen && mediaPickerTab === "gif") {
      maybeLoadMoreGifPickerEntries({ reset: true, force: true });
    } else if (mediaPickerOpen && mediaPickerTab === "sticker") {
      maybeLoadMoreStickerPickerEntries({ reset: true, force: true });
    }
  }
  return true;
}

function resolveTenorCredentials() {
  let key = TENOR_PUBLIC_API_KEY;
  let clientKey = TENOR_CLIENT_KEY;
  let customKey = false;
  const stored = readStoredTenorCredentials();
  if (stored.key) {
    key = stored.key;
    customKey = true;
  }
  if (stored.clientKey) clientKey = stored.clientKey;
  return { key, clientKey, customKey };
}

function ensureGifUsageState() {
  if (!state.gifUsage || typeof state.gifUsage !== "object") {
    state.gifUsage = { byConversation: {}, byTime: {}, byNetwork: {} };
  }
  if (!state.gifUsage.byConversation || typeof state.gifUsage.byConversation !== "object") state.gifUsage.byConversation = {};
  if (!state.gifUsage.byTime || typeof state.gifUsage.byTime !== "object") state.gifUsage.byTime = {};
  if (!state.gifUsage.byNetwork || typeof state.gifUsage.byNetwork !== "object") state.gifUsage.byNetwork = {};
  return state.gifUsage;
}

function gifTimeScopeKey(date = new Date()) {
  const hour = Number(date?.getHours?.() ?? 0);
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 22) return "evening";
  return "night";
}

function gifNetworkScopeKey() {
  const connection = navigator?.connection || navigator?.mozConnection || navigator?.webkitConnection || null;
  const type = (connection?.type || "").toString().toLowerCase();
  const effective = (connection?.effectiveType || "").toString().toLowerCase();
  if (!type && !effective) return "network:default";
  return `network:${type || "unknown"}:${effective || "unknown"}`;
}

function updateGifUsageCounter(store, bucketKey, url) {
  if (!store || typeof store !== "object") return;
  const key = (bucketKey || "").toString().trim();
  const gifUrl = (url || "").toString().trim();
  if (!key || !gifUrl) return;
  const bucket = store[key] && typeof store[key] === "object" ? store[key] : {};
  const current = Number(bucket[gifUrl]) || 0;
  bucket[gifUrl] = Math.min(500000, current + 1);
  store[key] = bucket;
}

function trackGifUsage(url, conversationId = "") {
  const gifUrl = (url || "").toString().trim();
  if (!gifUrl) return;
  const usage = ensureGifUsageState();
  const convoKey = (conversationId || "").toString().trim();
  if (convoKey) updateGifUsageCounter(usage.byConversation, convoKey, gifUrl);
  updateGifUsageCounter(usage.byTime, gifTimeScopeKey(new Date()), gifUrl);
  updateGifUsageCounter(usage.byNetwork, gifNetworkScopeKey(), gifUrl);
}

function gifScopeUsageUrls(scope, conversationId = "") {
  const usage = ensureGifUsageState();
  let bucket = {};
  if (scope === "chat") {
    const convoKey = (conversationId || "").toString().trim();
    bucket = convoKey ? (usage.byConversation[convoKey] || {}) : {};
  } else if (scope === "time") {
    bucket = usage.byTime[gifTimeScopeKey(new Date())] || {};
  } else if (scope === "network") {
    bucket = usage.byNetwork[gifNetworkScopeKey()] || {};
  } else {
    return [];
  }
  return Object.entries(bucket)
    .sort((a, b) => Number(b[1] || 0) - Number(a[1] || 0))
    .map(([url]) => url)
    .filter(Boolean);
}

function dedupeGifEntries(entries) {
  if (!Array.isArray(entries)) return [];
  const seen = new Set();
  return entries.filter((entry) => {
    const key = (entry?.url || "").toString().trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function dedupeStickerEntries(entries) {
  if (!Array.isArray(entries)) return [];
  const seen = new Set();
  return entries.filter((entry) => {
    const key = (entry?.url || "").toString().trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function activeGifScope() {
  const prefs = getPreferences();
  return normalizeGifScope(prefs.gifScope, prefs.gifGroups);
}

function updateGifScope(scope) {
  state.preferences = getPreferences();
  state.preferences.gifScope = normalizeGifScope(scope, state.preferences.gifGroups);
  saveState();
}

function toggleGifFavorite(url) {
  const gifUrl = (url || "").toString().trim();
  if (!gifUrl) return false;
  state.preferences = getPreferences();
  const favorites = normalizeGifFavorites(state.preferences.gifFavorites);
  const exists = favorites.includes(gifUrl);
  state.preferences.gifFavorites = exists
    ? favorites.filter((entry) => entry !== gifUrl)
    : [gifUrl, ...favorites.filter((entry) => entry !== gifUrl)].slice(0, 1200);
  saveState();
  return !exists;
}

function upsertGifGroup(name) {
  const nextName = (name || "").toString().trim().slice(0, 40);
  if (!nextName) return null;
  state.preferences = getPreferences();
  const groups = normalizeGifGroups(state.preferences.gifGroups);
  const existing = groups.find((entry) => entry.name.toLowerCase() === nextName.toLowerCase());
  if (existing) return existing.id;
  const id = createId();
  groups.push({ id, name: nextName, urls: [] });
  state.preferences.gifGroups = groups;
  state.preferences.gifScope = `group:${id}`;
  saveState();
  return id;
}

function toggleGifGroupMembership(url, groupId) {
  const gifUrl = (url || "").toString().trim();
  const targetGroupId = (groupId || "").toString().trim();
  if (!gifUrl || !targetGroupId) return null;
  state.preferences = getPreferences();
  const groups = normalizeGifGroups(state.preferences.gifGroups);
  const nextGroups = groups.map((group) => {
    if (group.id !== targetGroupId) return group;
    const hasUrl = group.urls.includes(gifUrl);
    return {
      ...group,
      urls: hasUrl
        ? group.urls.filter((entry) => entry !== gifUrl)
        : [gifUrl, ...group.urls.filter((entry) => entry !== gifUrl)].slice(0, 600)
    };
  });
  state.preferences.gifGroups = nextGroups;
  saveState();
  const updated = nextGroups.find((entry) => entry.id === targetGroupId);
  return updated?.urls.includes(gifUrl) || false;
}

async function promptGifGroupForUrl(url) {
  const gifUrl = (url || "").toString().trim();
  if (!gifUrl) return false;
  state.preferences = getPreferences();
  const groups = normalizeGifGroups(state.preferences.gifGroups);
  if (groups.length === 0) {
    const createdName = await showInAppPromptDialog({
      title: "Create GIF group",
      message: "Create GIF group name",
      defaultValue: "Favorites"
    });
    if (typeof createdName !== "string") return false;
    const groupId = upsertGifGroup(createdName);
    if (!groupId) return false;
    const added = toggleGifGroupMembership(gifUrl, groupId);
    state.preferences = getPreferences();
    state.preferences.gifScope = `group:${groupId}`;
    saveState();
    return Boolean(added);
  }
  const defaultName = groups[0].name;
  const selectedName = await showInAppPromptDialog({
    title: "Add GIF to group",
    message: "Add GIF to group (existing or new name)",
    defaultValue: defaultName
  });
  if (typeof selectedName !== "string") return false;
  const groupId = upsertGifGroup(selectedName) || groups.find((entry) => entry.name.toLowerCase() === selectedName.trim().toLowerCase())?.id || "";
  if (!groupId) return false;
  const added = toggleGifGroupMembership(gifUrl, groupId);
  state.preferences = getPreferences();
  state.preferences.gifScope = `group:${groupId}`;
  saveState();
  return Boolean(added);
}

function applyGifScopeToEntries(entries) {
  const list = Array.isArray(entries) ? entries : [];
  const prefs = getPreferences();
  const scope = normalizeGifScope(prefs.gifScope, prefs.gifGroups);
  const currentConversationId = getActiveConversation()?.id || "";
  const byUrl = (entry) => (entry?.url || "").toString().trim();
  if (scope === "all") return list;
  if (scope === "favorites") {
    const favorites = prefs.gifFavorites || [];
    const rank = new Map(favorites.map((url, index) => [url, index]));
    return list
      .filter((entry) => rank.has(byUrl(entry)))
      .sort((a, b) => (rank.get(byUrl(a)) || 0) - (rank.get(byUrl(b)) || 0));
  }
  if (scope.startsWith("group:")) {
    const groupId = scope.slice(6);
    const group = prefs.gifGroups.find((entry) => entry.id === groupId);
    if (!group) return [];
    const rank = new Map(group.urls.map((url, index) => [url, index]));
    return list
      .filter((entry) => rank.has(byUrl(entry)))
      .sort((a, b) => (rank.get(byUrl(a)) || 0) - (rank.get(byUrl(b)) || 0));
  }
  const usageUrls = gifScopeUsageUrls(scope, currentConversationId);
  if (usageUrls.length === 0) return [];
  const rank = new Map(usageUrls.map((url, index) => [url, index]));
  return list
    .filter((entry) => rank.has(byUrl(entry)))
    .sort((a, b) => (rank.get(byUrl(a)) || 0) - (rank.get(byUrl(b)) || 0));
}

function tenorFirstFormatUrl(formats, candidates = []) {
  if (!formats || typeof formats !== "object") return "";
  let fallbackUrl = "";
  let balancedUrl = "";
  for (const [index, key] of candidates.entries()) {
    const formatEntry = formats?.[key];
    const url = (formatEntry?.url || "").toString().trim();
    if (!url) continue;
    if (!fallbackUrl) fallbackUrl = url;
    const dims = Array.isArray(formatEntry?.dims) ? formatEntry.dims : [];
    const width = Number(dims[0]) || 0;
    const height = Number(dims[1]) || 0;
    if (width > 0 && height > 0) {
      const ratio = width / Math.max(1, height);
      const largeEnough = width >= 96 && height >= 96;
      if (largeEnough && ratio >= 0.55 && ratio <= 1.9) return url;
      if (!balancedUrl && largeEnough && ratio >= 0.35 && ratio <= 2.8) balancedUrl = url;
    } else if (index === 0) {
      // No geometry hint from provider: keep first-candidate behavior.
      return url;
    }
  }
  return balancedUrl || fallbackUrl || "";
}

function parseTenorV2Results(results, { kind = "gif" } = {}) {
  if (!Array.isArray(results)) return [];
  const stickerMode = kind === "sticker";
  const imageCandidates = stickerMode
    ? [
        "webp", "gif", "mediumgif",
        "transparentwebp", "webp_transparent", "transparentgif", "gif_transparent",
        "tinywebp", "tinygif", "tinytransparentwebp", "tinywebp_transparent", "tinytransparentgif", "tinygif_transparent",
        "nanowebp", "nanogif", "nanotransparentwebp", "nanowebp_transparent", "nanotransparentgif", "nanogif_transparent"
      ]
    : ["gif", "tinygif", "mediumgif", "nanogif"];
  const videoCandidates = stickerMode
    ? []
    : ["mp4", "tinymp4", "nanomp4", "webm", "tinywebm", "nanowebm"];
  return results
    .map((item) => {
      const formats = item?.media_formats || {};
      const imageUrl = tenorFirstFormatUrl(formats, imageCandidates);
      const videoUrl = tenorFirstFormatUrl(formats, videoCandidates);
      const preferred = imageUrl || videoUrl;
      if (!preferred) return null;
      const isVideo = !stickerMode && !imageUrl && /\.(mp4|webm|mov|m4v)(\?|$|#|&)/i.test(preferred);
      return {
        name: (item?.content_description || item?.title || (stickerMode ? "sticker" : "gif")).toString().trim().slice(0, 120) || (stickerMode ? "sticker" : "gif"),
        url: preferred,
        preview: isVideo ? "video" : "",
        source: "remote"
      };
    })
    .filter(Boolean);
}

function parseTenorV1Results(results, { kind = "gif" } = {}) {
  if (!Array.isArray(results)) return [];
  const stickerMode = kind === "sticker";
  const imageCandidates = stickerMode
    ? [
        "webp", "gif", "mediumgif",
        "transparentwebp", "webp_transparent", "transparentgif", "gif_transparent",
        "tinywebp", "tinygif", "tinytransparentwebp", "tinywebp_transparent", "tinytransparentgif", "tinygif_transparent",
        "nanowebp", "nanogif", "nanotransparentwebp", "nanowebp_transparent", "nanotransparentgif", "nanogif_transparent"
      ]
    : ["gif", "tinygif", "mediumgif", "nanogif"];
  const videoCandidates = stickerMode
    ? []
    : ["mp4", "tinymp4", "nanomp4", "webm", "tinywebm", "nanowebm"];
  return results
    .map((item) => {
      const media = Array.isArray(item?.media) ? item.media[0] : null;
      const formats = media && typeof media === "object" ? media : {};
      const imageUrl = tenorFirstFormatUrl(formats, imageCandidates);
      const videoUrl = tenorFirstFormatUrl(formats, videoCandidates);
      const preferred = imageUrl || videoUrl;
      if (!preferred) return null;
      const isVideo = !stickerMode && !imageUrl && /\.(mp4|webm|mov|m4v)(\?|$|#|&)/i.test(preferred);
      return {
        name: (item?.title || item?.content_description || (stickerMode ? "sticker" : "gif")).toString().trim().slice(0, 120) || (stickerMode ? "sticker" : "gif"),
        url: preferred,
        preview: isVideo ? "video" : "",
        source: "remote"
      };
    })
    .filter(Boolean);
}

async function fetchTenorEntries({
  query = "",
  nextCursor = "",
  kind = "gif"
} = {}) {
  if (typeof fetch !== "function") return { entries: [], next: "", error: "Fetch unavailable" };
  const { key, clientKey, customKey } = resolveTenorCredentials();
  const stickerMode = kind === "sticker";
  const buildV2Endpoint = (mediaFilter = "", searchFilter = "") => {
    const endpoint = new URL(query ? "https://tenor.googleapis.com/v2/search" : "https://tenor.googleapis.com/v2/featured");
    endpoint.searchParams.set("key", key);
    endpoint.searchParams.set("client_key", clientKey);
    endpoint.searchParams.set("limit", String(TENOR_RESULTS_PAGE_SIZE));
    if (mediaFilter) endpoint.searchParams.set("media_filter", mediaFilter);
    if (searchFilter) endpoint.searchParams.set("searchfilter", searchFilter);
    if (query) endpoint.searchParams.set("q", query);
    if (nextCursor) endpoint.searchParams.set("pos", nextCursor);
    return endpoint;
  };
  const mediaFilterCandidates = stickerMode
    ? [
        "webp,gif,mediumgif,tinywebp,tinygif,nanowebp,nanogif,transparentwebp,transparentgif",
        "webp,gif,mediumgif,tinywebp,tinygif,nanowebp,nanogif",
        "gif,tinygif,mediumgif,nanogif",
        "minimal",
        ""
      ]
    : [
        "gif,tinygif,mediumgif,nanogif,mp4,tinymp4,nanomp4",
        "gif,tinygif,mediumgif,nanogif",
        "minimal",
        ""
      ];
  const searchFilterCandidates = stickerMode ? ["sticker", "sticker,-static", ""] : [""];
  let lastError = "";
  const handleHttpError = (status) => {
    lastError = `HTTP ${status}`;
    return status === 400 || status === 401 || status === 403;
  };
  for (const searchFilter of searchFilterCandidates) {
    for (const mediaFilter of mediaFilterCandidates) {
      try {
        const response = await fetch(buildV2Endpoint(mediaFilter, searchFilter).toString(), { cache: "no-store" });
        if (!response.ok) {
          if (handleHttpError(response.status)) continue;
          return { entries: [], next: "", error: lastError };
        }
        const payload = await response.json();
        const entries = parseTenorV2Results(payload?.results, { kind });
        if (entries.length === 0 && !payload?.next && (mediaFilter || searchFilter)) {
          // Continue fallback probes until we get at least one format variant.
          continue;
        }
        return {
          entries,
          next: (payload?.next || "").toString(),
          error: ""
        };
      } catch (error) {
        lastError = String(error || "Request failed");
      }
    }
  }
  try {
    const endpoint = new URL(query ? "https://g.tenor.com/v1/search" : "https://g.tenor.com/v1/trending");
    endpoint.searchParams.set("key", key);
    endpoint.searchParams.set("client_key", clientKey);
    endpoint.searchParams.set("limit", String(TENOR_RESULTS_PAGE_SIZE));
    if (stickerMode) endpoint.searchParams.set("searchfilter", "sticker");
    if (query) endpoint.searchParams.set("q", query);
    if (nextCursor) endpoint.searchParams.set("pos", nextCursor);
    const response = await fetch(endpoint.toString(), { cache: "no-store" });
    if (response.ok) {
      const payload = await response.json();
      const entries = parseTenorV1Results(payload?.results, { kind });
      return {
        entries,
        next: (payload?.next || payload?.next_cursor || "").toString(),
        error: ""
      };
    }
    lastError = `HTTP ${response.status}`;
  } catch (error) {
    lastError = String(error || "Request failed");
  }
  if (/HTTP 400|HTTP 401|HTTP 403/i.test(lastError)) {
    const providerLabel = stickerMode ? "Sticker provider" : "GIF provider";
    return {
      entries: [],
      next: "",
      error: customKey
        ? `${providerLabel} rejected your Tenor API credentials.`
        : `${providerLabel} rejected demo Tenor credentials. Open Settings > Advanced and set your Tenor API key.`
    };
  }
  return { entries: [], next: "", error: lastError || "Request failed" };
}

async function fetchTenorGifEntries(query = "", nextCursor = "") {
  return fetchTenorEntries({ query, nextCursor, kind: "gif" });
}

async function fetchTenorStickerEntries(query = "", nextCursor = "") {
  return fetchTenorEntries({ query, nextCursor, kind: "sticker" });
}

function maybeLoadMoreGifPickerEntries({ reset = false, force = false } = {}) {
  if (mediaPickerTab !== "gif") return;
  const queryKey = gifPickerQueryKey();
  if (reset || gifPickerRemoteQueryKey !== queryKey) {
    gifPickerRemoteEntries = [];
    gifPickerRemoteNext = "";
    gifPickerRemoteError = "";
    gifPickerRemoteQueryKey = queryKey;
    gifPickerVisibleCount = GIF_PICKER_INITIAL_PAGE_SIZE;
    if (gifPickerRemoteLoading) {
      gifPickerRemoteRequestToken += 1;
      gifPickerRemoteLoading = false;
    }
  }
  if (gifPickerRemoteLoading) return;
  if (!force && !reset && gifPickerRemoteError && !gifPickerRemoteNext) return;
  if (!force && !reset && !gifPickerRemoteNext && gifPickerRemoteEntries.length > 0) return;
  const requestToken = ++gifPickerRemoteRequestToken;
  gifPickerRemoteLoading = true;
  if (force) gifPickerRemoteError = "";
  const cursor = reset ? "" : gifPickerRemoteNext;
  fetchTenorGifEntries(queryKey, cursor)
    .then(({ entries, next, error }) => {
      if (requestToken !== gifPickerRemoteRequestToken || queryKey !== gifPickerRemoteQueryKey) return;
      const previousCount = gifPickerRemoteEntries.length;
      appendGifPickerEntries(entries);
      const appendedCount = Math.max(0, gifPickerRemoteEntries.length - previousCount);
      gifPickerRemoteNext = (next || "").toString();
      if (error) {
        gifPickerRemoteError = (error || "").toString().slice(0, 220) || "Could not load remote GIFs right now.";
        return;
      }
      if (appendedCount === 0 && !gifPickerRemoteNext) {
        gifPickerRemoteError = "No more GIFs from provider.";
        return;
      }
      gifPickerRemoteError = "";
    })
    .catch(() => {
      if (requestToken !== gifPickerRemoteRequestToken || queryKey !== gifPickerRemoteQueryKey) return;
      gifPickerRemoteError = "Could not load remote GIFs right now.";
    })
    .finally(() => {
      if (requestToken !== gifPickerRemoteRequestToken || queryKey !== gifPickerRemoteQueryKey) return;
      gifPickerRemoteLoading = false;
      if (mediaPickerOpen && mediaPickerTab === "gif") renderMediaPicker();
    });
}

function maybeLoadMoreStickerPickerEntries({ reset = false, force = false } = {}) {
  if (mediaPickerTab !== "sticker") return;
  const queryKey = stickerPickerQueryKey();
  if (reset || stickerPickerRemoteQueryKey !== queryKey) {
    stickerPickerRemoteEntries = [];
    stickerPickerRemoteNext = "";
    stickerPickerRemoteError = "";
    stickerPickerRemoteQueryKey = queryKey;
    stickerPickerVisibleCount = STICKER_PICKER_INITIAL_PAGE_SIZE;
    if (stickerPickerRemoteLoading) {
      stickerPickerRemoteRequestToken += 1;
      stickerPickerRemoteLoading = false;
    }
  }
  if (stickerPickerRemoteLoading) return;
  if (!force && !reset && stickerPickerRemoteError && !stickerPickerRemoteNext) return;
  if (!force && !reset && !stickerPickerRemoteNext && stickerPickerRemoteEntries.length > 0) return;
  const requestToken = ++stickerPickerRemoteRequestToken;
  stickerPickerRemoteLoading = true;
  if (force) stickerPickerRemoteError = "";
  const cursor = reset ? "" : stickerPickerRemoteNext;
  fetchTenorStickerEntries(queryKey, cursor)
    .then(({ entries, next, error }) => {
      if (requestToken !== stickerPickerRemoteRequestToken || queryKey !== stickerPickerRemoteQueryKey) return;
      const previousCount = stickerPickerRemoteEntries.length;
      appendStickerPickerEntries(entries);
      const appendedCount = Math.max(0, stickerPickerRemoteEntries.length - previousCount);
      stickerPickerRemoteNext = (next || "").toString();
      if (error) {
        stickerPickerRemoteError = (error || "").toString().slice(0, 220) || "Could not load remote stickers right now.";
        return;
      }
      if (appendedCount === 0 && !stickerPickerRemoteNext) {
        stickerPickerRemoteError = "No more stickers from provider.";
        return;
      }
      stickerPickerRemoteError = "";
    })
    .catch(() => {
      if (requestToken !== stickerPickerRemoteRequestToken || queryKey !== stickerPickerRemoteQueryKey) return;
      stickerPickerRemoteError = "Could not load remote stickers right now.";
    })
    .finally(() => {
      if (requestToken !== stickerPickerRemoteRequestToken || queryKey !== stickerPickerRemoteQueryKey) return;
      stickerPickerRemoteLoading = false;
      if (mediaPickerOpen && mediaPickerTab === "sticker") renderMediaPicker();
    });
}

function maybeAutoloadMediaPickerOnScroll() {
  if (!mediaPickerOpen) return;
  if (mediaPickerTab !== "gif" && mediaPickerTab !== "sticker" && mediaPickerTab !== "emoji") return;
  if (mediaPickerScrollLoadRaf) return;
  mediaPickerScrollLoadRaf = requestAnimationFrame(() => {
    mediaPickerScrollLoadRaf = 0;
    const grid = ui.mediaGrid;
    if (!(grid instanceof HTMLElement)) return;
    const nearBottom = grid.scrollTop + grid.clientHeight >= grid.scrollHeight - 220;
    if (!nearBottom) return;
    if (mediaPickerTab === "gif") {
      const entries = filteredMediaEntries();
      const visibleLimit = Math.max(GIF_PICKER_INITIAL_PAGE_SIZE, gifPickerVisibleCount);
      if (entries.length > visibleLimit) {
        gifPickerVisibleCount = Math.min(GIF_PICKER_VISIBLE_MAX, gifPickerVisibleCount + GIF_PICKER_PAGE_STEP);
        renderMediaPicker();
        return;
      }
      if (activeGifScope() !== "all") return;
      if (gifPickerRemoteLoading || gifPickerRemoteError) return;
      maybeLoadMoreGifPickerEntries({ reset: false });
      renderMediaPicker();
      return;
    }
    if (mediaPickerTab === "sticker") {
      const entries = filteredMediaEntries();
      const visibleLimit = Math.max(STICKER_PICKER_INITIAL_PAGE_SIZE, stickerPickerVisibleCount);
      if (entries.length > visibleLimit) {
        stickerPickerVisibleCount = Math.min(STICKER_PICKER_VISIBLE_MAX, stickerPickerVisibleCount + STICKER_PICKER_PAGE_STEP);
        renderMediaPicker();
        return;
      }
      if (stickerPickerRemoteLoading || stickerPickerRemoteError) return;
      maybeLoadMoreStickerPickerEntries({ reset: false });
      renderMediaPicker();
      return;
    }
    const entries = filteredMediaEntries();
    const visibleLimit = Math.max(EMOJI_PICKER_INITIAL_PAGE_SIZE, emojiPickerVisibleCount);
    if (entries.length > visibleLimit) {
      emojiPickerVisibleCount = Math.min(6000, emojiPickerVisibleCount + EMOJI_PICKER_PAGE_STEP);
      renderMediaPicker();
      return;
    }
    if (!emojiLibraryLoaded && !emojiLibraryLoading && !emojiLibraryError) {
      void ensureEmojiLibraryLoaded();
    }
  });
}

function filteredMediaEntries() {
  const term = mediaPickerQuery.trim().toLowerCase();
  const normalizedTerm = term.replace(/^:+|:+$/g, "");
  let entries = mediaEntriesForActiveTab();
  if (mediaPickerTab === "gif") entries = applyGifScopeToEntries(entries);
  if (!term) return entries;
  return entries.filter((entry) => {
    const name = (entry.name || "").toLowerCase();
    if (name.includes(term) || name.includes(normalizedTerm)) return true;
    if (mediaPickerTab === "emoji") {
      const aliases = Array.isArray(entry.aliases) ? entry.aliases.join(" ").toLowerCase() : "";
      const keywords = Array.isArray(entry.keywords) ? entry.keywords.join(" ").toLowerCase() : "";
      const value = (entry.value || "").toString();
      if (aliases.includes(term) || aliases.includes(normalizedTerm)) return true;
      if (keywords.includes(term) || keywords.includes(normalizedTerm)) return true;
      if (value.includes(term) || value.includes(normalizedTerm)) return true;
    }
    return false;
  });
}

function rememberMediaPickerTab(tab) {
  if (!MEDIA_TABS.includes(tab)) return;
  state.preferences = getPreferences();
  state.preferences.mediaLastTab = tab;
}

function renderComposerMediaButtons() {
  ui.openMediaPickerBtn?.classList.toggle("message-form__media-btn--active", mediaPickerOpen);
  ui.openGifPickerBtn?.classList.toggle("message-form__media-btn--active", mediaPickerOpen && mediaPickerTab === "gif");
  ui.openStickerPickerBtn?.classList.toggle("message-form__media-btn--active", mediaPickerOpen && mediaPickerTab === "sticker");
  ui.openEmojiPickerBtn?.classList.toggle("message-form__media-btn--active", mediaPickerOpen && mediaPickerTab === "emoji");
}

function configureMediaPickerEmojiMode(enabled, { onSelect = null } = {}) {
  mediaPickerEmojiOnlyMode = Boolean(enabled);
  mediaPickerEmojiSelectHandler = mediaPickerEmojiOnlyMode && typeof onSelect === "function"
    ? onSelect
    : null;
  if (!(ui.mediaPicker instanceof HTMLElement)) return;
  ui.mediaPicker.classList.toggle("media-picker--emoji-only", mediaPickerEmojiOnlyMode);
  ui.mediaTabs.forEach((tabBtn) => {
    const tab = (tabBtn.dataset.mediaTab || "").toString();
    tabBtn.hidden = mediaPickerEmojiOnlyMode && tab !== "emoji";
  });
  if (ui.addMediaUrlBtn) ui.addMediaUrlBtn.hidden = mediaPickerEmojiOnlyMode;
  if (ui.addMediaFileBtn) ui.addMediaFileBtn.hidden = mediaPickerEmojiOnlyMode;
}

function closeMediaPicker() {
  mediaPickerOpen = false;
  configureMediaPickerEmojiMode(false);
  if (gifPickerQueryDebounceTimer) {
    clearTimeout(gifPickerQueryDebounceTimer);
    gifPickerQueryDebounceTimer = null;
  }
  if (mediaPickerScrollLoadRaf) {
    cancelAnimationFrame(mediaPickerScrollLoadRaf);
    mediaPickerScrollLoadRaf = 0;
  }
  ui.mediaPicker.classList.add("media-picker--hidden");
  renderComposerMediaButtons();
}

function openMediaPicker({ emojiOnly = false, onEmojiSelect = null } = {}) {
  configureMediaPickerEmojiMode(emojiOnly, { onSelect: onEmojiSelect });
  if (mediaPickerEmojiOnlyMode && mediaPickerTab !== "emoji") {
    mediaPickerTab = "emoji";
  }
  mediaPickerOpen = true;
  ui.mediaPicker.classList.remove("media-picker--hidden");
  rememberMediaPickerTab(mediaPickerTab);
  renderMediaPicker();
  if (mediaPickerTab === "gif") {
    if (activeGifScope() === "all") {
      maybeLoadMoreGifPickerEntries({ reset: gifPickerRemoteQueryKey !== gifPickerQueryKey() });
    }
  } else if (mediaPickerTab === "sticker") {
    maybeLoadMoreStickerPickerEntries({ reset: stickerPickerRemoteQueryKey !== stickerPickerQueryKey() });
  } else if (mediaPickerTab === "emoji") {
    void ensureEmojiLibraryLoaded();
  }
  renderComposerMediaButtons();
  ui.mediaSearchInput.focus();
}

function openMediaPickerWithTab(tab, {
  resetQuery = false,
  emojiOnly = false,
  onEmojiSelect = null
} = {}) {
  const targetTab = emojiOnly ? "emoji" : tab;
  if (MEDIA_TABS.includes(targetTab)) {
    if (mediaPickerTab !== targetTab) {
      gifPickerVisibleCount = GIF_PICKER_INITIAL_PAGE_SIZE;
      stickerPickerVisibleCount = STICKER_PICKER_INITIAL_PAGE_SIZE;
      emojiPickerVisibleCount = EMOJI_PICKER_INITIAL_PAGE_SIZE;
    }
    mediaPickerTab = targetTab;
    rememberMediaPickerTab(targetTab);
  }
  if (resetQuery) mediaPickerQuery = "";
  openMediaPicker({ emojiOnly, onEmojiSelect });
}

function toggleMediaPicker() {
  if (mediaPickerOpen) {
    closeMediaPicker();
  } else {
    openMediaPicker();
  }
}

function ensureMediaRuntimeBootstrapped() {
  if (mediaRuntimeBootstrapped) return;
  mediaRuntimeBootstrapped = true;
  void deployMediaRuntimes();
}

function warmMediaPickerRuntimes() {
  if (!mediaRuntimeWarmed) {
    mediaRuntimeWarmed = true;
    ensureMediaRuntimeBootstrapped();
  } else if (!window.RufflePlayer?.newest || !(typeof customElements !== "undefined" && customElements.get("dotlottie-player"))) {
    void deployMediaRuntimes();
  }
  void ensureEmojiLibraryLoaded();
}

function mediaPlaceholderForTab(tab) {
  if (tab === "gif") return "Search GIFs";
  if (tab === "sticker") return "Search stickers";
  if (tab === "emoji") return "Search emojis";
  if (tab === "swf") return "Search SWFs";
  if (tab === "svg") return "Search SVGs";
  if (tab === "pdf") return "Search PDFs";
  if (tab === "text") return "Search text files";
  if (tab === "docs") return "Search documents";
  if (tab === "html") return "Search HTML embeds";
  return "Search media";
}

function insertTextAtCursor(text) {
  const input = ui.messageInput;
  const start = input.selectionStart ?? input.value.length;
  const end = input.selectionEnd ?? input.value.length;
  const merged = `${input.value.slice(0, start)}${text}${input.value.slice(end)}`;
  input.value = trimTextForConversation(merged, getActiveConversation());
  const cursor = Math.min(start + text.length, input.value.length);
  input.setSelectionRange(cursor, cursor);
  input.focus();
  setComposerDraft(composerDraftConversationId, input.value);
  queueComposerDraftSave();
  renderComposerMeta();
}

function findEmojiEntryByValue(value) {
  return emojiLibraryEntries.find((entry) => entry.value === value) || null;
}

function rememberRecentEmoji(value) {
  const emoji = (value || "").toString().trim();
  if (!emoji) return;
  state.preferences = getPreferences();
  const current = normalizeRecentEmojis(state.preferences.recentEmojis);
  state.preferences.recentEmojis = [emoji, ...current.filter((item) => item !== emoji)].slice(0, 24);
}

function quickReactionEmojiChoices(limit = 3) {
  const max = Math.max(1, Math.min(8, Number(limit) || 3));
  const prefs = getPreferences();
  const recents = normalizeRecentEmojis(prefs.recentEmojis);
  const choices = [];
  const add = (emoji) => {
    const token = (emoji || "").toString().trim();
    if (!token || choices.includes(token)) return;
    choices.push(token);
  };
  recents.forEach(add);
  DEFAULT_REACTIONS.forEach(add);
  return choices.slice(0, max);
}

function stickerFormatFromName(name, url) {
  const value = `${name || ""} ${url || ""}`.toLowerCase();
  if (value.includes(".lottie")) return "dotlottie";
  if (value.includes(".apng")) return "apng";
  return "image";
}

function attachmentTypeForMediaPickerTab(tab, entry = null) {
  if (tab === "gif") return "gif";
  if (tab === "sticker") return "sticker";
  if (tab === "swf") return "swf";
  if (tab === "html") return "html";
  if (tab === "pdf") return "pdf";
  if (tab === "text") return "text";
  if (tab === "docs") return entry?.type === "rtf" ? "rtf" : "odf";
  return "svg";
}

function sendMediaAttachment(entry, type) {
  const conversation = getActiveConversation();
  const account = getCurrentAccount();
  if (!conversation || !account || !entry || !entry.url) return;
  const text = trimTextForConversation((ui.messageInput.value || "").trim(), conversation);
  const nextReply = replyTarget && replyTarget.channelId === conversation.id
    ? { messageId: replyTarget.messageId, authorName: replyTarget.authorName, text: replyTarget.text }
    : null;
  const nextMessage = {
    id: createId(),
    userId: account.id,
    authorName: "",
    text,
    ts: new Date().toISOString(),
    reactions: [],
    attachments: [{
      type,
      url: entry.url,
      name: entry.name || type,
      format: entry.format || (type === "sticker" ? stickerFormatFromName(entry.name, entry.url) : "image")
    }],
    replyTo: nextReply
  };
  const messageBucket = conversation.type === "dm" ? conversation.thread.messages : conversation.channel.messages;
  messageBucket.push(nextMessage);
  if (type === "gif") {
    trackGifUsage(entry.url, conversation.id);
  }
  if (type === "swf") {
    addDebugLog("info", "Sent SWF attachment message", { url: entry.url, name: entry.name || "" });
  }
  replyTarget = null;
  ui.messageInput.value = "";
  setComposerDraft(conversation.id, "");
  composerTempLimitConversationId = null;
  composerTempLimitExtra = 0;
  applyComposerInputLimit();
  resizeComposerInput();
  saveState();
  closeMediaPicker();
  if (swfPipTabs.length > 0) {
    appendMessageRowLite(conversation.type === "dm" ? conversation.thread : conversation.channel, nextMessage);
    renderChannels();
    renderMemberList();
  } else {
    render();
  }
}

function settleMediaUrlDialog(result = null) {
  if (!(mediaUrlDialogResolver instanceof Function)) return;
  const resolve = mediaUrlDialogResolver;
  mediaUrlDialogResolver = null;
  resolve(result);
}

async function openMediaUrlEntryDialog(tab) {
  const nameLabel = tab === "emoji" ? "emoji short name" : `${tab} name`;
  if (!ui.mediaUrlDialog || !ui.mediaUrlNameInput || !ui.mediaUrlInput) {
    const typedName = await showInAppPromptDialog({
      title: `Add ${tab.toUpperCase()} name`,
      message: `Add ${nameLabel}`,
      defaultValue: ""
    });
    if (typedName === null) return null;
    const typedUrl = await showInAppPromptDialog({
      title: `Add ${tab.toUpperCase()} URL`,
      message: `Add ${tab.toUpperCase()} URL`,
      defaultValue: "https://"
    });
    if (!typedUrl) return null;
    return { typedName, typedUrl };
  }
  if (mediaUrlDialogResolver instanceof Function) settleMediaUrlDialog(null);
  if (ui.mediaUrlDialogTitle) ui.mediaUrlDialogTitle.textContent = `Add ${tab.toUpperCase()} URL`;
  if (ui.mediaUrlNameLabel) ui.mediaUrlNameLabel.textContent = `Name (${nameLabel})`;
  ui.mediaUrlNameInput.value = "";
  ui.mediaUrlInput.value = "https://";
  return new Promise((resolve) => {
    mediaUrlDialogResolver = resolve;
    if (!ui.mediaUrlDialog.open) ui.mediaUrlDialog.showModal();
    requestAnimationFrame(() => {
      ui.mediaUrlNameInput?.focus();
      ui.mediaUrlNameInput?.select();
    });
  });
}

function enforceStickerPreviewSizing(element) {
  if (!(element instanceof HTMLElement)) return;
  element.style.width = "100%";
  element.style.minWidth = "100%";
  element.style.aspectRatio = "16 / 10";
  element.style.minHeight = "156px";
  element.style.height = "156px";
  element.style.maxHeight = "156px";
  element.style.flex = "0 0 156px";
  element.style.display = "block";
  element.style.objectFit = "cover";
  element.style.objectPosition = "center";
}

function mediaPickerEntryIsUserAdded(entry) {
  const source = (entry?.source || "").toString().trim().toLowerCase();
  return source === "guild-custom" || source === "user-custom" || source === "user";
}

async function addMediaFromUrlFlow() {
  const tab = mediaPickerTab;
  const details = await openMediaUrlEntryDialog(tab);
  if (!details) return;
  const { typedName = "", typedUrl = "" } = details;
  const name = sanitizeMediaName(typedName, `${tab}-${Date.now().toString().slice(-4)}`);
  const url = typedUrl.trim();
  if (!/^https?:\/\//i.test(url) && !/^data:/i.test(url)) {
    showToast("Only http(s) or data URLs are supported.", { tone: "error" });
    return;
  }
  const inferredType = inferAttachmentTypeFromUrl(url);
  const resolvedType = tab === "docs"
    ? (inferredType === "rtf" ? "rtf" : "odf")
    : tab === "text"
      ? "text"
      : tab === "pdf"
        ? "pdf"
        : inferredType;
  if (upsertGuildResource(tab, {
    name,
    url,
    format: tab === "sticker" ? stickerFormatFromName(name, url) : "image",
    type: resolvedType || tab
  })) {
    saveState();
    renderMediaPicker();
    showToast("Added media URL.");
  } else {
    showToast("Could not add media URL.", { tone: "error" });
  }
}

function fileAcceptForTab(tab) {
  if (tab === "gif") return "image/gif,image/webp,video/mp4,video/webm";
  if (tab === "sticker") return "image/png,image/apng,image/gif,image/webp,image/svg+xml,.apng,.lottie";
  if (tab === "emoji") return "image/png,image/gif,image/webp,image/svg+xml";
  if (tab === "swf") return ".swf,application/x-shockwave-flash";
  if (tab === "svg") return "image/svg+xml,.svg";
  if (tab === "pdf") return ".pdf,application/pdf";
  if (tab === "text") return ".txt,.md,.log,.json,.js,.ts,.css,.xml,.yml,.yaml,.ini,.toml,text/plain,application/json,text/markdown";
  if (tab === "docs") return ".odt,.ods,.odp,.rtf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,application/vnd.oasis.opendocument.text,application/vnd.oasis.opendocument.spreadsheet,application/vnd.oasis.opendocument.presentation,application/rtf,text/rtf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (tab === "html") return "text/html,.html,.htm";
  return "*/*";
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("Read failed"));
    reader.readAsDataURL(file);
  });
}

async function addMediaFromFileFlow(file) {
  if (!file) return;
  const tab = mediaPickerTab;
  const name = sanitizeMediaName(file.name.replace(/\.[^/.]+$/, ""), `${tab}-${Date.now().toString().slice(-4)}`);
  try {
    const url = await readFileAsDataUrl(file);
    const inferredType = inferAttachmentTypeFromFile(file);
    const inferredTab = inferredType === "odf" || inferredType === "rtf"
      ? "docs"
      : inferredType === "text"
        ? "text"
        : inferredType === "pdf"
          ? "pdf"
          : inferredType;
    const targetTab = tab === "docs" || tab === "text" || tab === "pdf" || inferredTab === tab ? tab : inferredTab;
    const format = targetTab === "sticker" ? stickerFormatFromName(file.name, url) : "image";
    if (upsertGuildResource(targetTab, { name, url, format, type: inferredType })) {
      saveState();
      if (targetTab !== mediaPickerTab) {
        mediaPickerTab = targetTab;
      }
      renderMediaPicker();
    }
  } catch {
    // Ignore failed local resource import.
  } finally {
    ui.mediaFileInput.value = "";
  }
}

function renderSwfPickerPreview(host, entry, index = 0, renderToken = mediaPickerRenderToken) {
  host.innerHTML = "";
  host.style.display = "grid";
  host.style.placeItems = "center";
  host.style.color = "#c4ccd8";
  host.style.fontSize = "0.76rem";
  host.textContent = "SWF";
  if (!window.RufflePlayer?.newest) {
    host.textContent = "Ruffle…";
    if (!swfPreviewBootstrapInFlight) {
      swfPreviewBootstrapInFlight = true;
      void deployMediaRuntimes().finally(() => {
        swfPreviewBootstrapInFlight = false;
        if (mediaPickerOpen && mediaPickerTab === "swf") renderMediaPicker();
      });
    }
    return;
  }
  try {
    const player = window.RufflePlayer.newest().createPlayer();
    player.style.pointerEvents = "none";
    if ("volume" in player) player.volume = 0;
    if ("muted" in player) player.muted = true;
    if (typeof player.set_volume === "function") player.set_volume(0);
    player.style.width = "100%";
    player.style.height = "100%";
    host.innerHTML = "";
    host.appendChild(player);
    if (!host.isConnected || renderToken !== mediaPickerRenderToken) return;
    const mediaUrl = resolveMediaUrl(entry.url);
    Promise.resolve(player.load({
      url: mediaUrl,
      autoplay: "off",
      unmuteOverlay: "hidden",
      scale: "showAll",
      forceScale: true,
      letterbox: "on",
      openUrlMode: "deny"
    })).then(() => {
      if (!host.isConnected || renderToken !== mediaPickerRenderToken) return;
      try {
        if ("volume" in player) player.volume = 0;
        if ("muted" in player) player.muted = true;
        if (typeof player.set_volume === "function") player.set_volume(0);
        if (typeof player.play === "function") player.play();
      } catch {
        // Ignore preview sampling failures.
      }
    }).catch((error) => {
      addDebugLog("warn", "SWF picker preview failed", { name: entry?.name || "", url: mediaUrl, error: String(error) });
      host.innerHTML = "";
      host.textContent = "SWF";
    });
  } catch {
    host.innerHTML = "";
    host.textContent = "SWF";
  }
}

function appendMediaPickerPrivacyBanner({
  hiddenCount = 0,
  hiddenGatedUrls = new Set(),
  hiddenGatedHosts = new Set(),
  hiddenBlockedHosts = new Set()
} = {}) {
  if (!(ui.mediaGrid instanceof HTMLElement)) return false;
  const totalHidden = Math.max(0, Number(hiddenCount) || 0);
  if (totalHidden <= 0) return false;
  const gatedUrls = hiddenGatedUrls instanceof Set ? [...hiddenGatedUrls].filter(Boolean) : [];
  const gatedHosts = hiddenGatedHosts instanceof Set
    ? [...hiddenGatedHosts].filter(Boolean).sort((a, b) => a.localeCompare(b))
    : [];
  const blockedHosts = hiddenBlockedHosts instanceof Set
    ? [...hiddenBlockedHosts].filter(Boolean).sort((a, b) => a.localeCompare(b))
    : [];
  const gate = document.createElement("div");
  gate.className = "media-picker__privacy-banner";
  const heading = document.createElement("strong");
  heading.textContent = `${totalHidden} external item${totalHidden === 1 ? "" : "s"} hidden by privacy rules.`;
  const meta = document.createElement("small");
  const metaBits = [];
  if (gatedHosts.length > 0) {
    const preview = gatedHosts.slice(0, 6).join(", ");
    metaBits.push(`Untrusted hosts: ${preview}${gatedHosts.length > 6 ? " …" : ""}`);
  } else {
    metaBits.push("No untrusted hosts available for one-time allow");
  }
  if (blockedHosts.length > 0) {
    const preview = blockedHosts.slice(0, 6).join(", ");
    metaBits.push(`Deny-listed hosts: ${preview}${blockedHosts.length > 6 ? " …" : ""}`);
  }
  meta.textContent = metaBits.join(" · ");
  const actions = document.createElement("div");
  actions.className = "media-picker__privacy-actions";
  const allowOnceBtn = document.createElement("button");
  allowOnceBtn.type = "button";
  allowOnceBtn.textContent = "Allow Hidden Once";
  allowOnceBtn.disabled = gatedUrls.length <= 0;
  allowOnceBtn.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (gatedUrls.length <= 0) {
      showToast("Hidden media is deny-listed. Remove deny rules to show it.", { tone: "error" });
      return;
    }
    gatedUrls.forEach((url) => allowMediaUrlOnce(url));
    renderMediaPicker();
    showToast("Temporarily allowed hidden media for this session.");
  });
  const trustBtn = document.createElement("button");
  trustBtn.type = "button";
  trustBtn.textContent = "Trust Hidden Hosts";
  trustBtn.disabled = gatedHosts.length <= 0;
  trustBtn.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (gatedHosts.length <= 0) {
      showToast("No untrusted hosts available to trust.");
      return;
    }
    let added = 0;
    gatedHosts.forEach((host) => {
      const rule = suggestSubdomainTrustRule(host) || host;
      if (addMediaTrustRule(rule)) added += 1;
    });
    if (added > 0) {
      saveState();
      renderMediaPrivacyRuleEditor();
      renderMediaPicker();
      showToast(`Added ${added} trust rule${added === 1 ? "" : "s"}.`);
    } else {
      showToast("Hidden hosts are already trusted.");
    }
  });
  const settingsBtn = document.createElement("button");
  settingsBtn.type = "button";
  settingsBtn.textContent = "Advanced Rules";
  settingsBtn.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    openSettingsScreen();
    setSettingsTab("advanced");
  });
  actions.appendChild(allowOnceBtn);
  actions.appendChild(trustBtn);
  actions.appendChild(settingsBtn);
  let hostActions = null;
  if (gatedHosts.length > 0) {
    hostActions = document.createElement("div");
    hostActions.className = "media-picker__privacy-hosts";
    const hostLimit = 14;
    gatedHosts.slice(0, hostLimit).forEach((host) => {
      const trustHostBtn = document.createElement("button");
      trustHostBtn.type = "button";
      trustHostBtn.className = "media-picker__privacy-host-btn";
      trustHostBtn.textContent = `Trust ${host}`;
      trustHostBtn.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!addMediaTrustRule(host)) {
          showToast(`${host} is already trusted or invalid.`);
          return;
        }
        saveState();
        renderMediaPrivacyRuleEditor();
        renderMediaPicker();
        showToast(`Trusted ${host}.`);
      });
      hostActions.appendChild(trustHostBtn);
    });
    if (gatedHosts.length > hostLimit) {
      const more = document.createElement("small");
      more.textContent = `${gatedHosts.length - hostLimit} more host${gatedHosts.length - hostLimit === 1 ? "" : "s"} hidden`;
      hostActions.appendChild(more);
    }
  }
  gate.appendChild(heading);
  gate.appendChild(meta);
  gate.appendChild(actions);
  if (hostActions) gate.appendChild(hostActions);
  ui.mediaGrid.appendChild(gate);
  return true;
}

function renderMediaPicker() {
  const renderToken = ++mediaPickerRenderToken;
  renderComposerMediaButtons();
  if (ui.mediaGrid) {
    ui.mediaGrid.classList.toggle("media-picker__grid--sticker", mediaPickerTab === "sticker");
  }
  ui.mediaTabs.forEach((tabBtn) => {
    tabBtn.classList.toggle("active", tabBtn.dataset.mediaTab === mediaPickerTab);
  });
  ui.mediaSearchInput.placeholder = mediaPlaceholderForTab(mediaPickerTab);
  if (ui.mediaSearchInput.value !== mediaPickerQuery) {
    ui.mediaSearchInput.value = mediaPickerQuery;
  }
  const header = ui.mediaPicker?.querySelector(".media-picker__header");
  if (header instanceof HTMLElement) {
    header.querySelector(".media-picker__gif-tools")?.remove();
    if (mediaPickerTab === "gif") {
      const prefs = getPreferences();
      const scope = normalizeGifScope(prefs.gifScope, prefs.gifGroups);
      const scopeRow = document.createElement("div");
      scopeRow.className = "media-picker__gif-tools";
      const scopeSelect = document.createElement("select");
      scopeSelect.className = "media-picker__gif-scope";
      const scopeOptions = [
        { value: "all", label: "All GIFs" },
        { value: "favorites", label: "Favorites" },
        { value: "chat", label: "This Chat" },
        { value: "time", label: `This ${gifTimeScopeKey(new Date())}` },
        { value: "network", label: "This Network" }
      ];
      scopeOptions.forEach((entry) => {
        const option = document.createElement("option");
        option.value = entry.value;
        option.textContent = entry.label;
        scopeSelect.appendChild(option);
      });
      prefs.gifGroups.forEach((group) => {
        const option = document.createElement("option");
        option.value = `group:${group.id}`;
        option.textContent = `Group: ${group.name}`;
        scopeSelect.appendChild(option);
      });
      scopeSelect.value = scope;
      scopeSelect.addEventListener("change", () => {
        updateGifScope(scopeSelect.value);
        gifPickerVisibleCount = GIF_PICKER_INITIAL_PAGE_SIZE;
        renderMediaPicker();
      });
      const newGroupBtn = document.createElement("button");
      newGroupBtn.type = "button";
      newGroupBtn.textContent = "New Group";
      newGroupBtn.addEventListener("click", async () => {
        const nextName = await showInAppPromptDialog({
          title: "New GIF group",
          message: "New GIF group name",
          defaultValue: "Favorites"
        });
        if (typeof nextName !== "string") return;
        const groupId = upsertGifGroup(nextName);
        if (!groupId) return;
        updateGifScope(`group:${groupId}`);
        renderMediaPicker();
      });
      const renameGroupBtn = document.createElement("button");
      renameGroupBtn.type = "button";
      renameGroupBtn.textContent = "Rename";
      const deleteGroupBtn = document.createElement("button");
      deleteGroupBtn.type = "button";
      deleteGroupBtn.textContent = "Delete";
      const currentGroupId = scope.startsWith("group:") ? scope.slice(6) : "";
      const currentGroup = currentGroupId
        ? prefs.gifGroups.find((entry) => entry.id === currentGroupId)
        : null;
      renameGroupBtn.disabled = !currentGroup;
      deleteGroupBtn.disabled = !currentGroup;
      renameGroupBtn.addEventListener("click", async () => {
        if (!currentGroup) return;
        const nextName = await showInAppPromptDialog({
          title: "Rename GIF group",
          message: "Rename GIF group",
          defaultValue: currentGroup.name
        });
        if (typeof nextName !== "string") return;
        state.preferences = getPreferences();
        state.preferences.gifGroups = normalizeGifGroups(state.preferences.gifGroups).map((group) => (
          group.id === currentGroup.id
            ? { ...group, name: nextName.toString().trim().slice(0, 40) || group.name }
            : group
        ));
        saveState();
        renderMediaPicker();
      });
      deleteGroupBtn.addEventListener("click", async () => {
        if (!currentGroup) return;
        const confirmed = await showInAppConfirmDialog({
          title: "Delete GIF group?",
          message: `Delete GIF group "${currentGroup.name}"?`,
          confirmLabel: "Delete",
          cancelLabel: "Cancel",
          danger: true
        });
        if (!confirmed) return;
        state.preferences = getPreferences();
        state.preferences.gifGroups = normalizeGifGroups(state.preferences.gifGroups).filter((group) => group.id !== currentGroup.id);
        state.preferences.gifScope = "all";
        saveState();
        renderMediaPicker();
      });
      scopeRow.appendChild(scopeSelect);
      scopeRow.appendChild(newGroupBtn);
      scopeRow.appendChild(renameGroupBtn);
      scopeRow.appendChild(deleteGroupBtn);
      header.appendChild(scopeRow);
    }
  }
  ui.mediaGrid.innerHTML = "";
  const allEntries = filteredMediaEntries();
  const hiddenPrivacyUrls = new Set();
  const hiddenPrivacyGatedUrls = new Set();
  const hiddenPrivacyGatedHosts = new Set();
  const hiddenPrivacyBlockedHosts = new Set();
  const entries = allEntries.filter((entry) => {
    const resolvedEntryUrl = entry?.url ? resolveMediaUrl(entry.url) : "";
    if (!resolvedEntryUrl || mediaPickerEntryIsUserAdded(entry)) return true;
    if (!shouldGateMediaUrl(resolvedEntryUrl)) return true;
    hiddenPrivacyUrls.add(resolvedEntryUrl);
    const blocked = isBlockedMediaUrl(resolvedEntryUrl);
    const host = mediaUrlHost(resolvedEntryUrl);
    if (blocked) {
      if (host) hiddenPrivacyBlockedHosts.add(host);
    } else {
      hiddenPrivacyGatedUrls.add(resolvedEntryUrl);
      if (host) hiddenPrivacyGatedHosts.add(host);
    }
    return false;
  });
  const hiddenPrivacyCount = hiddenPrivacyUrls.size;
  if (entries.length === 0) {
    if (hiddenPrivacyCount > 0) {
      appendMediaPickerPrivacyBanner({
        hiddenCount: hiddenPrivacyCount,
        hiddenGatedUrls: hiddenPrivacyGatedUrls,
        hiddenGatedHosts: hiddenPrivacyGatedHosts,
        hiddenBlockedHosts: hiddenPrivacyBlockedHosts
      });
    }
    const empty = document.createElement("div");
    empty.className = "media-card--empty";
    if (mediaPickerTab === "swf") {
      empty.textContent = "No SWFs found. Run a local server and keep swf-index.json available.";
    } else if (mediaPickerTab === "sticker" && stickerPickerRemoteLoading) {
      empty.textContent = "Loading stickers...";
    } else if (mediaPickerTab === "sticker" && stickerPickerRemoteError) {
      empty.textContent = stickerPickerRemoteError;
    } else if (mediaPickerTab === "emoji" && emojiLibraryLoading) {
      empty.textContent = "Loading full emoji list…";
    } else if (mediaPickerTab === "emoji" && emojiLibraryError) {
      empty.textContent = emojiLibraryError;
    } else if (hiddenPrivacyCount > 0) {
      empty.textContent = "Everything in this view is hidden by privacy rules.";
    } else {
      empty.textContent = "No media found for this query.";
    }
    ui.mediaGrid.appendChild(empty);
    return;
  }

  const maxVisible = mediaPickerTab === "swf"
    ? entries.length
    : mediaPickerTab === "gif"
      ? Math.max(GIF_PICKER_INITIAL_PAGE_SIZE, gifPickerVisibleCount)
      : mediaPickerTab === "sticker"
        ? Math.max(STICKER_PICKER_INITIAL_PAGE_SIZE, stickerPickerVisibleCount)
      : mediaPickerTab === "emoji"
        ? Math.max(EMOJI_PICKER_INITIAL_PAGE_SIZE, emojiPickerVisibleCount)
      : 140;
  const visibleEntries = entries.slice(0, maxVisible);
  if (hiddenPrivacyCount > 0) {
    appendMediaPickerPrivacyBanner({
      hiddenCount: hiddenPrivacyCount,
      hiddenGatedUrls: hiddenPrivacyGatedUrls,
      hiddenGatedHosts: hiddenPrivacyGatedHosts,
      hiddenBlockedHosts: hiddenPrivacyBlockedHosts
    });
  }
  visibleEntries.forEach((entry, index) => {
    const sendType = attachmentTypeForMediaPickerTab(mediaPickerTab, entry);
    const resolvedEntryUrl = entry?.url ? resolveMediaUrl(entry.url) : "";
    const useSwfCard = mediaPickerTab === "swf";
    const useDivCard = useSwfCard || mediaPickerTab === "gif";
    const card = document.createElement(useDivCard ? "div" : "button");
    if (card instanceof HTMLButtonElement) card.type = "button";
    card.className = `media-card${useSwfCard ? " media-card--swf" : ""}`;
    if (mediaPickerTab === "gif") card.classList.add("media-card--gif");
    if (mediaPickerTab === "sticker") card.classList.add("media-card--sticker");
    if (useSwfCard || mediaPickerTab === "gif") {
      card.tabIndex = 0;
      card.setAttribute("role", "button");
    }
    if (mediaPickerTab === "emoji") {
      card.classList.add("media-card--emoji");
      if (entry.recentIndex >= 0) card.classList.add("media-card--emoji-recent");
      if (entry.value) {
        card.textContent = entry.value;
      } else if (entry.url) {
        const emojiImage = document.createElement("img");
        emojiImage.className = "media-card__preview";
        emojiImage.style.height = "80px";
        emojiImage.src = entry.url;
        emojiImage.alt = entry.name || "emoji";
        card.appendChild(emojiImage);
      }
      card.title = `:${entry.name || "emoji"}:`;
      card.addEventListener("click", () => {
        if (entry.value && mediaPickerEmojiOnlyMode && mediaPickerEmojiSelectHandler) {
          mediaPickerEmojiSelectHandler(entry.value, entry);
          rememberRecentEmoji(entry.value);
          saveState();
          closeMediaPicker();
          return;
        }
        if (entry.value) {
          insertTextAtCursor(entry.value);
          rememberRecentEmoji(entry.value);
          saveState();
        } else {
          insertTextAtCursor(`:${sanitizeMediaName(entry.name || "emoji")}:`);
        }
      });
      ui.mediaGrid.appendChild(card);
      return;
    }

    const label = document.createElement("span");
    label.className = "media-card__label";
    label.textContent = entry.name || "media";
    if (entry.source === "guild-custom") {
      const kind = document.createElement("span");
      kind.className = "media-card__kind";
      kind.textContent = "guild";
      label.appendChild(kind);
    }

    if (mediaPickerTab === "swf") {
      const preview = document.createElement("div");
      preview.className = "media-card__preview";
      const previewMedia = document.createElement("div");
      previewMedia.className = "media-card__preview-media";
      const overlay = document.createElement("span");
      overlay.className = "media-card__overlay";
      overlay.textContent = "";
      preview.appendChild(previewMedia);
      preview.appendChild(overlay);
      card.appendChild(preview);
      card.appendChild(label);
      card.addEventListener("click", () => sendMediaAttachment(entry, sendType));
      card.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        sendMediaAttachment(entry, sendType);
      });
      ui.mediaGrid.appendChild(card);
      requestAnimationFrame(() => {
        if (!previewMedia.isConnected) return;
        renderSwfPickerPreview(previewMedia, entry, index, renderToken);
      });
      return;
    }

    if (mediaPickerTab === "html") {
      const preview = document.createElement("div");
      preview.className = "media-card__preview";
      preview.style.display = "grid";
      preview.style.placeItems = "center";
      preview.style.fontWeight = "800";
      preview.style.fontSize = "0.76rem";
      preview.textContent = "HTML";
      card.appendChild(preview);
      card.appendChild(label);
      card.addEventListener("click", () => sendMediaAttachment(entry, sendType));
      ui.mediaGrid.appendChild(card);
      return;
    }

    if (mediaPickerTab === "pdf") {
      const preview = document.createElement("div");
      preview.className = "media-card__preview";
      preview.style.display = "grid";
      preview.style.placeItems = "center";
      preview.style.fontWeight = "800";
      preview.style.fontSize = "0.76rem";
      preview.textContent = "PDF";
      card.appendChild(preview);
      card.appendChild(label);
      card.addEventListener("click", () => sendMediaAttachment(entry, sendType));
      ui.mediaGrid.appendChild(card);
      return;
    }

    if (mediaPickerTab === "text") {
      const preview = document.createElement("div");
      preview.className = "media-card__preview";
      preview.style.display = "grid";
      preview.style.placeItems = "center";
      preview.style.fontWeight = "800";
      preview.style.fontSize = "0.76rem";
      preview.textContent = "TXT";
      card.appendChild(preview);
      card.appendChild(label);
      card.addEventListener("click", () => sendMediaAttachment(entry, sendType));
      ui.mediaGrid.appendChild(card);
      return;
    }

    if (mediaPickerTab === "docs") {
      const preview = document.createElement("div");
      preview.className = "media-card__preview";
      preview.style.display = "grid";
      preview.style.placeItems = "center";
      preview.style.fontWeight = "800";
      preview.style.fontSize = "0.76rem";
      preview.textContent = entry.type === "rtf" ? "RTF" : "DOC";
      card.appendChild(preview);
      card.appendChild(label);
      card.addEventListener("click", () => sendMediaAttachment(entry, sendType));
      ui.mediaGrid.appendChild(card);
      return;
    }

    const entryUrlForPreview = resolvedEntryUrl || entry.url || "";
    const stickerLooksVideo = mediaPickerTab === "sticker" && /\.(mp4|webm|mov|m4v)(\?|$|#|&)/i.test(entryUrlForPreview);
    if ((mediaPickerTab === "gif" && entry.preview === "video") || stickerLooksVideo) {
      const video = document.createElement("video");
      video.className = "media-card__preview";
      video.src = entryUrlForPreview;
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      if (mediaPickerTab === "sticker") enforceStickerPreviewSizing(video);
      card.appendChild(video);
    } else if (mediaPickerTab === "sticker" && stickerFormatFromName(entry.name, entry.url) === "dotlottie") {
      const preview = document.createElement("div");
      preview.className = "media-card__preview";
      preview.style.display = "grid";
      preview.style.placeItems = "center";
      preview.style.color = "#c4ccd8";
      preview.style.fontSize = "0.72rem";
      preview.textContent = ".lottie";
      enforceStickerPreviewSizing(preview);
      card.appendChild(preview);
    } else {
      const img = document.createElement("img");
      img.className = "media-card__preview";
      img.loading = "lazy";
      img.src = entryUrlForPreview;
      img.alt = entry.name || "media";
      if (mediaPickerTab === "sticker") enforceStickerPreviewSizing(img);
      card.appendChild(img);
    }
    if (mediaPickerTab === "gif") {
      const prefs = getPreferences();
      const gifUrl = (entry?.url || "").toString().trim();
      const quickActions = document.createElement("div");
      quickActions.className = "media-card__quick-actions";
      const favoriteBtn = document.createElement("button");
      favoriteBtn.type = "button";
      favoriteBtn.className = "media-card__quick-btn";
      const favorited = prefs.gifFavorites.includes(gifUrl);
      favoriteBtn.textContent = favorited ? "★" : "☆";
      favoriteBtn.title = favorited ? "Remove from favorites" : "Add to favorites";
      favoriteBtn.classList.toggle("is-active", favorited);
      favoriteBtn.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const added = toggleGifFavorite(gifUrl);
        renderMediaPicker();
        showToast(added ? "Added GIF to favorites." : "Removed GIF from favorites.");
      });
      const groupBtn = document.createElement("button");
      groupBtn.type = "button";
      groupBtn.className = "media-card__quick-btn";
      const scope = activeGifScope();
      const activeGroupId = scope.startsWith("group:") ? scope.slice(6) : "";
      const activeGroup = activeGroupId
        ? prefs.gifGroups.find((group) => group.id === activeGroupId)
        : null;
      const inActiveGroup = Boolean(activeGroup && activeGroup.urls.includes(gifUrl));
      groupBtn.textContent = inActiveGroup ? "−" : "+";
      groupBtn.title = activeGroup
        ? (inActiveGroup ? `Remove from ${activeGroup.name}` : `Add to ${activeGroup.name}`)
        : "Add to GIF group";
      groupBtn.classList.toggle("is-active", inActiveGroup);
      groupBtn.addEventListener("click", async (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (activeGroup) {
          const added = toggleGifGroupMembership(gifUrl, activeGroup.id);
          renderMediaPicker();
          showToast(added ? `Added to ${activeGroup.name}.` : `Removed from ${activeGroup.name}.`);
          return;
        }
        const added = await promptGifGroupForUrl(gifUrl);
        renderMediaPicker();
        if (added) showToast("GIF added to group.");
      });
      quickActions.appendChild(favoriteBtn);
      quickActions.appendChild(groupBtn);
      card.appendChild(quickActions);
    }
    card.appendChild(label);
    card.addEventListener("click", () => {
      sendMediaAttachment(entry, sendType);
    });
    if (mediaPickerTab === "gif") {
      card.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        sendMediaAttachment(entry, sendType);
      });
    }
    ui.mediaGrid.appendChild(card);
  });

  if (mediaPickerTab === "gif") {
    const privacyModeOff = getPreferences().mediaPrivacyMode === "off";
    const scope = activeGifScope();
    const scopedMode = scope !== "all";
    const hasMoreVisible = entries.length > visibleEntries.length;
    const canLoadRemote = Boolean(gifPickerRemoteNext || (gifPickerRemoteEntries.length === 0 && !gifPickerRemoteError));
    const canRetryRemote = Boolean(gifPickerRemoteError && !gifPickerRemoteLoading);
    const footer = document.createElement("div");
    footer.className = "media-card--empty";
    footer.style.display = "grid";
    footer.style.gap = "0.35rem";
    const info = document.createElement("div");
    if (scopedMode) {
      const label = scope.startsWith("group:")
        ? `Group view: ${entries.length} GIF${entries.length === 1 ? "" : "s"}`
        : `${scope.charAt(0).toUpperCase()}${scope.slice(1)} view: ${entries.length} GIF${entries.length === 1 ? "" : "s"}`;
      info.textContent = label;
    } else if (gifPickerRemoteLoading) {
      info.textContent = "Loading more GIFs...";
    } else if (gifPickerRemoteError) {
      info.textContent = gifPickerRemoteError;
    } else {
      info.textContent = `${entries.length} GIFs ready.`;
    }
    const loadBtn = document.createElement("button");
    loadBtn.type = "button";
    loadBtn.className = "message-action-btn";
    loadBtn.disabled = scopedMode || gifPickerRemoteLoading || (!hasMoreVisible && !canLoadRemote && !canRetryRemote);
    if (scopedMode) {
      loadBtn.textContent = "Switch to All to load more";
    } else if (hasMoreVisible) {
      loadBtn.textContent = "Show more GIFs";
    } else if (gifPickerRemoteLoading) {
      loadBtn.textContent = "Loading...";
    } else if (canRetryRemote) {
      loadBtn.textContent = "Retry GIF provider";
    } else {
      loadBtn.textContent = "Load more GIFs";
    }
    loadBtn.addEventListener("click", () => {
      if (scopedMode) return;
      if (hasMoreVisible) {
        gifPickerVisibleCount = Math.min(GIF_PICKER_VISIBLE_MAX, gifPickerVisibleCount + GIF_PICKER_PAGE_STEP);
        renderMediaPicker();
        return;
      }
      maybeLoadMoreGifPickerEntries({ reset: false, force: canRetryRemote });
      renderMediaPicker();
    });
    footer.appendChild(info);
    if (privacyModeOff) {
      const gateHint = document.createElement("small");
      gateHint.textContent = "Privacy gate is disabled for GIFs.";
      footer.appendChild(gateHint);
    }
    footer.appendChild(loadBtn);
    ui.mediaGrid.appendChild(footer);
    if (!scopedMode && !gifPickerRemoteLoading && !gifPickerRemoteError && visibleEntries.length < gifPickerVisibleCount && canLoadRemote) {
      maybeLoadMoreGifPickerEntries({ reset: false });
    }
  }
  if (mediaPickerTab === "sticker") {
    const privacyModeOff = getPreferences().mediaPrivacyMode === "off";
    const hasMoreVisible = entries.length > visibleEntries.length;
    const canLoadRemote = Boolean(
      stickerPickerRemoteNext || (stickerPickerRemoteEntries.length === 0 && !stickerPickerRemoteError)
    );
    const canRetryRemote = Boolean(stickerPickerRemoteError && !stickerPickerRemoteLoading);
    const footer = document.createElement("div");
    footer.className = "media-card--empty";
    footer.style.display = "grid";
    footer.style.gap = "0.35rem";
    const info = document.createElement("div");
    if (stickerPickerRemoteLoading) {
      info.textContent = "Loading stickers...";
    } else if (stickerPickerRemoteError) {
      info.textContent = stickerPickerRemoteError;
    } else {
      const hiddenSuffix = hiddenPrivacyCount > 0 ? ` · ${hiddenPrivacyCount} hidden` : "";
      info.textContent = `${entries.length} stickers ready${hiddenSuffix}.`;
    }
    const loadBtn = document.createElement("button");
    loadBtn.type = "button";
    loadBtn.className = "message-action-btn";
    loadBtn.disabled = stickerPickerRemoteLoading || (!hasMoreVisible && !canLoadRemote && !canRetryRemote);
    if (hasMoreVisible) {
      loadBtn.textContent = "Show more stickers";
    } else if (stickerPickerRemoteLoading) {
      loadBtn.textContent = "Loading...";
    } else if (canRetryRemote) {
      loadBtn.textContent = "Retry sticker provider";
    } else {
      loadBtn.textContent = "Load more stickers";
    }
    loadBtn.addEventListener("click", () => {
      if (hasMoreVisible) {
        stickerPickerVisibleCount = Math.min(
          STICKER_PICKER_VISIBLE_MAX,
          stickerPickerVisibleCount + STICKER_PICKER_PAGE_STEP
        );
        renderMediaPicker();
        return;
      }
      maybeLoadMoreStickerPickerEntries({ reset: false, force: canRetryRemote });
      renderMediaPicker();
    });
    footer.appendChild(info);
    if (privacyModeOff) {
      const gateHint = document.createElement("small");
      gateHint.textContent = "Privacy gate is currently off for stickers.";
      const gateEnableBtn = document.createElement("button");
      gateEnableBtn.type = "button";
      gateEnableBtn.className = "message-action-btn";
      gateEnableBtn.textContent = "Enable Privacy Gate";
      gateEnableBtn.addEventListener("click", () => {
        state.preferences = getPreferences();
        state.preferences.mediaPrivacyMode = "safe";
        saveState();
        applyPreferencesToUI();
        renderMediaPicker();
        showToast("Media privacy gate enabled.");
      });
      footer.appendChild(gateHint);
      footer.appendChild(gateEnableBtn);
    }
    footer.appendChild(loadBtn);
    ui.mediaGrid.appendChild(footer);
    if (!stickerPickerRemoteLoading && !stickerPickerRemoteError && visibleEntries.length < stickerPickerVisibleCount && canLoadRemote) {
      maybeLoadMoreStickerPickerEntries({ reset: false });
    }
  }
  if (mediaPickerTab === "emoji") {
    const hasMoreVisible = entries.length > visibleEntries.length;
    const canRetryEmojiDataset = Boolean(emojiLibraryError && !emojiLibraryLoading);
    const canLoadEmojiDataset = Boolean(!emojiLibraryLoaded && !emojiLibraryLoading && !emojiLibraryError);
    const footer = document.createElement("div");
    footer.className = "media-card--empty";
    footer.style.display = "grid";
    footer.style.gap = "0.35rem";
    const info = document.createElement("div");
    if (emojiLibraryLoading) {
      info.textContent = "Loading full emoji list...";
    } else if (emojiLibraryError) {
      info.textContent = emojiLibraryError;
    } else {
      info.textContent = `${entries.length} emojis ready.`;
    }
    const loadBtn = document.createElement("button");
    loadBtn.type = "button";
    loadBtn.className = "message-action-btn";
    loadBtn.disabled = emojiLibraryLoading || (!hasMoreVisible && !canRetryEmojiDataset && !canLoadEmojiDataset);
    if (hasMoreVisible) {
      loadBtn.textContent = "Show more emojis";
    } else if (emojiLibraryLoading) {
      loadBtn.textContent = "Loading...";
    } else if (canRetryEmojiDataset) {
      loadBtn.textContent = "Retry full emoji list";
    } else if (canLoadEmojiDataset) {
      loadBtn.textContent = "Load full emoji list";
    } else {
      loadBtn.textContent = "All emojis shown";
    }
    loadBtn.addEventListener("click", () => {
      if (hasMoreVisible) {
        emojiPickerVisibleCount = Math.min(6000, emojiPickerVisibleCount + EMOJI_PICKER_PAGE_STEP);
        renderMediaPicker();
        return;
      }
      void ensureEmojiLibraryLoaded({ force: true });
      renderMediaPicker();
    });
    footer.appendChild(info);
    footer.appendChild(loadBtn);
    ui.mediaGrid.appendChild(footer);
  }
}

function saveSwfToShelf(entry) {
  if (!entry?.url) return false;
  const exists = state.savedSwfs.find((item) => item.url === entry.url);
  if (exists) return false;
  state.savedSwfs.unshift({
    name: (entry.name || "swf").toString().slice(0, 120),
    url: entry.url
  });
  state.savedSwfs = normalizeSavedSwfs(state.savedSwfs);
  saveState();
  renderSwfShelf();
  return true;
}

async function downloadAttachmentFile(attachment, fallbackExt = "bin") {
  if (!attachment?.url) return false;
  const rawName = (attachment.name || `download.${fallbackExt}`).trim();
  const fileName = rawName.includes(".") ? rawName : `${rawName}.${fallbackExt}`;
  if (isAesgcmUrl(attachment.url)) {
    try {
      const blob = await downloadAndDecryptAesgcmUrl(attachment.url);
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(objectUrl);
      return true;
    } catch (error) {
      addDebugLog("warn", "Encrypted attachment download failed", {
        url: attachment.url,
        error: String(error?.message || error)
      });
      return false;
    }
  }
  const sourceUrl = resolveMediaUrl(attachment.url);
  try {
    const response = await fetch(sourceUrl, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(objectUrl);
    return true;
  } catch {
    try {
      const link = document.createElement("a");
      link.href = sourceUrl;
      link.download = fileName;
      link.click();
      return true;
    } catch {
      addDebugLog("warn", "Attachment download failed", { url: sourceUrl, name: fileName });
      return false;
    }
  }
}

function renderSwfShelf() {
  ui.swfShelf.classList.toggle("swf-shelf--hidden", !swfShelfOpen);
  ui.swfShelfList.innerHTML = "";
  if (!swfShelfOpen) return;
  if (!Array.isArray(state.savedSwfs) || state.savedSwfs.length === 0) {
    const empty = document.createElement("div");
    empty.className = "channel-empty";
    empty.textContent = "No saved SWFs yet.";
    ui.swfShelfList.appendChild(empty);
    return;
  }
  state.savedSwfs.forEach((entry) => {
    const item = document.createElement("div");
    item.className = "swf-shelf-item";
    const openBtn = document.createElement("button");
    openBtn.type = "button";
    openBtn.textContent = "FullScreen";
    openBtn.title = entry.name;
    openBtn.addEventListener("click", () => {
      void openSavedSwfFromShelf(entry);
    });
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.textContent = "✕";
    removeBtn.title = "Remove from shelf";
    removeBtn.addEventListener("click", () => {
      state.savedSwfs = state.savedSwfs.filter((itemEntry) => itemEntry.url !== entry.url);
      saveState();
      renderSwfShelf();
    });
    item.appendChild(openBtn);
    item.appendChild(removeBtn);
    ui.swfShelfList.appendChild(item);
  });
}

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
          openUrlMode: "allow"
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
          openUrlMode: "allow"
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
            openUrlMode: "allow"
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

function attachmentTypeDisplayLabel(type, mediaUrl = "") {
  const normalized = (inferAttachmentTypeFromUrl(mediaUrl) || type || "file").toLowerCase();
  if (normalized === "gif") {
    if (/\.(gif|apng|webp)(\?|$|#|&)/i.test(mediaUrl)) return "GIF";
    if (/\.(mp4|webm|mov|m4v|ogv|m3u8)(\?|$|#|&)/i.test(mediaUrl)) return "animated media";
    return "image";
  }
  if (normalized === "video") return "video";
  if (normalized === "audio") return "audio";
  if (normalized === "pdf") return "PDF";
  if (normalized === "html") return "HTML";
  if (normalized === "svg") return "SVG";
  if (normalized === "text") return "text file";
  if (normalized === "odf") return "document";
  if (normalized === "rtf") return "RTF";
  if (normalized === "bin") return "binary file";
  if (normalized === "sticker") return "sticker";
  if (normalized === "swf") return "SWF";
  return "file";
}

async function ensurePdfRuntimeLoaded() {
  if (window.pdfjsLib?.getDocument) return window.pdfjsLib;
  if (pdfRuntimeLoadPromise) return pdfRuntimeLoadPromise;
  pdfRuntimeLoadPromise = (async () => {
    const localCandidates = [
      "vendor/pdfjs/pdf.min.js",
      "vendor/pdfjs/build/pdf.min.js"
    ];
    for (const candidate of localCandidates) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const exists = await localRuntimeExists(candidate);
        if (!exists) continue;
        // eslint-disable-next-line no-await-in-loop
        await loadScriptTag(candidate);
        if (window.pdfjsLib?.getDocument) {
          addDebugLog("info", "Loaded local PDF runtime", { src: candidate });
          return window.pdfjsLib;
        }
      } catch (error) {
        addDebugLog("warn", "Local PDF runtime candidate failed", { src: candidate, error: String(error) });
      }
    }
    const remoteCandidates = [
      "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js",
      "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.min.js"
    ];
    for (const candidate of remoteCandidates) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await loadScriptTag(candidate);
        if (window.pdfjsLib?.getDocument) {
          addDebugLog("info", "Loaded CDN PDF runtime", { src: candidate });
          return window.pdfjsLib;
        }
      } catch (error) {
        addDebugLog("warn", "CDN PDF runtime candidate failed", { src: candidate, error: String(error) });
      }
    }
    throw new Error("PDF runtime unavailable");
  })().catch((error) => {
    addDebugLog("warn", "Failed to load custom PDF runtime", { error: String(error) });
    return null;
  }).finally(() => {
    pdfRuntimeLoadPromise = null;
  });
  return pdfRuntimeLoadPromise;
}

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
    video.addEventListener("click", () => {
      if (video.paused || video.ended) {
        void video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
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

function renderScreens() {
  const loggedIn = Boolean(state.currentAccountId);
  ui.loginScreen.classList.toggle("screen--active", !loggedIn);
  ui.chatScreen.classList.toggle("screen--active", loggedIn);
  if (!loggedIn) {
    syncLoginFieldsFromSessionPrefs();
    if (!loginLocalXmppProfilesLoadedOnce) {
      loginLocalXmppProfilesLoadedOnce = true;
      void loadLocalXmppProfiles();
    }
  }
  if (!loggedIn && ui.settingsScreen.classList.contains("settings-screen--active")) {
    closeSettingsScreen();
  }
}

function safeRender(reason = "runtime") {
  try {
    render();
  } catch (error) {
    console.error(`Render failed (${reason})`, error);
    renderScreens();
    showToast("UI refresh failed. Check console for details.", { tone: "error", duration: 2800 });
  }
}


function createOrSwitchAccount(usernameInput, options = {}) {
  const normalized = normalizeUsername(usernameInput);
  if (!normalized) return false;

  let account = getAccountByUsername(normalized);
  if (!account) {
    const displayName = (options.displayName || usernameInput || "").toString().trim().slice(0, 32);
    account = createAccount(normalized, displayName);
    ensureAccountCosmetics(account);
    state.accounts.push(account);
  } else {
    if (!account.guildProfiles || typeof account.guildProfiles !== "object") account.guildProfiles = {};
    if (typeof account.xmppIdleSince !== "string") account.xmppIdleSince = "";
    if (typeof account.xmppLastActiveAt !== "string") account.xmppLastActiveAt = "";
    if (typeof account.customStatusEmoji !== "string") account.customStatusEmoji = "";
    if (!("customStatusExpiresAt" in account)) account.customStatusExpiresAt = null;
    if (typeof account.activityText !== "string") account.activityText = "";
    if (!Array.isArray(account.activities)) account.activities = [];
    ensureAccountCosmetics(account);
  }

  state.preferences = getPreferences();
  const requestedRelayMode = typeof options.relayMode === "string"
    ? normalizeRelayMode(options.relayMode)
    : "";
  const rememberRequested = typeof options.rememberLogin === "boolean"
    ? options.rememberLogin
    : state.preferences.rememberLogin !== "off";
  const rememberLogin = rememberRequested ? "on" : "off";
  state.preferences.rememberLogin = rememberLogin;
  if (requestedRelayMode) {
    state.preferences.relayMode = requestedRelayMode;
    if (["ws", "http", "xmpp"].includes(requestedRelayMode)) {
      state.preferences.relayAutoConnect = "on";
    }
  }
  state.currentAccountId = account.id;
  rememberAccountSession(account.id, rememberLogin === "on");
  const xmpp = options.xmpp && typeof options.xmpp === "object" ? options.xmpp : null;
  if (xmpp) {
    const jid = normalizeXmppJid(xmpp.jid || "");
    const password = normalizeXmppPassword(xmpp.password || "");
    const wsInput = normalizeXmppWsUrl(xmpp.wsUrl || "") || inferXmppWsUrlFromJid(jid);
    if (jid) state.preferences.xmppJid = jid;
    if (typeof xmpp.password === "string") state.preferences.xmppPassword = password;
    if (wsInput) state.preferences.xmppWsUrl = wsInput;
    if (jid && !state.preferences.xmppMucService) {
      const domain = xmppDomainFromJid(jid);
      if (domain) state.preferences.xmppMucService = `conference.${domain}`;
    }
    if (jid && password && (!requestedRelayMode || requestedRelayMode === "xmpp")) {
      state.preferences.relayMode = "xmpp";
      state.preferences.relayAutoConnect = "on";
    }
  }
  if (state.viewMode !== "dm" && state.viewMode !== "guild") state.viewMode = "guild";
  if (!state.activeGuildId && state.guilds[0]) {
    state.activeGuildId = state.guilds[0].id;
  }
  if (!state.activeChannelId && state.guilds[0]) {
    state.activeChannelId = getFirstOpenableChannelIdForGuild(state.guilds[0]) || state.guilds[0]?.channels?.[0]?.id || null;
  }
  ensureActiveGuildForCurrentAccount();
  ensureCurrentUserInActiveServer();
  const prefs = getPreferences();
  if (["ws", "http", "xmpp"].includes(prefs.relayMode) && prefs.relayAutoConnect === "on") connectRelaySocket({ force: true });
  return true;
}


const swfPipHeader = ui.swfPipDock.querySelector(".swf-pip__header");
const videoPipHeader = ui.videoPipDock?.querySelector(".video-pip__header");

function beginPipDrag(event, target, dockElement) {
  if (!(dockElement instanceof HTMLElement)) return;
  if (pipResizeState?.resizing) return;
  if (typeof event.button === "number" && event.button !== 0 && event.pointerType !== "touch") return;
  if (event.target instanceof HTMLElement && event.target.closest("button")) return;
  const dockRect = dockElement.getBoundingClientRect();
  const captureTarget = event.currentTarget instanceof HTMLElement ? event.currentTarget : dockElement;
  if (typeof event.pointerId === "number" && typeof captureTarget.setPointerCapture === "function") {
    try {
      captureTarget.setPointerCapture(event.pointerId);
    } catch {
      // Ignore unsupported pointer capture.
    }
  }
  pipDragState = {
    dragging: true,
    target,
    startX: event.clientX,
    startY: event.clientY,
    offsetX: event.clientX - dockRect.left,
    offsetY: event.clientY - dockRect.top,
    moved: false,
    pointerId: typeof event.pointerId === "number" ? event.pointerId : null,
    pointerTarget: captureTarget
  };
  event.preventDefault();
}

function beginPipResize(event, target, dockElement, edge = "") {
  if (!(dockElement instanceof HTMLElement) || !edge) return;
  if (event.button !== 0) return;
  const rect = dockElement.getBoundingClientRect();
  pipResizeState = {
    resizing: true,
    target,
    edge,
    startX: event.clientX,
    startY: event.clientY,
    startLeft: rect.left,
    startTop: rect.top,
    startWidth: rect.width,
    startHeight: rect.height
  };
  pipDragState = null;
  event.preventDefault();
  event.stopPropagation();
}

function ensurePipResizeHandles(target, dockElement) {
  if (!(dockElement instanceof HTMLElement) || dockElement.dataset.resizeHandlesBound === "on") return;
  PIP_RESIZE_EDGES.forEach((edge) => {
    const handle = document.createElement("div");
    handle.className = `pip-resize-handle pip-resize-handle--${edge}`;
    handle.dataset.edge = edge;
    handle.addEventListener("pointerdown", (event) => {
      beginPipResize(event, target, dockElement, edge);
    });
    handle.addEventListener("mousedown", (event) => {
      beginPipResize(event, target, dockElement, edge);
    });
    dockElement.appendChild(handle);
  });
  dockElement.dataset.resizeHandlesBound = "on";
}

function clampPipBoundsForRect(target, left, top, width, height) {
  const minSize = PIP_MIN_SIZE[target] || PIP_MIN_SIZE.swf;
  const nextWidth = Math.max(minSize.width, width);
  const nextHeight = Math.max(minSize.height, height);
  const margins = pipViewportMargins();
  const maxLeft = Math.max(margins.left, window.innerWidth - nextWidth - margins.right);
  const composerRect = ui.messageForm?.getBoundingClientRect?.();
  const maxTop = composerRect
    ? Math.max(margins.top, composerRect.top - nextHeight - margins.bottom)
    : Math.max(margins.top, window.innerHeight - nextHeight - margins.bottom);
  return {
    left: Math.max(margins.left, Math.min(maxLeft, left)),
    top: Math.max(margins.top, Math.min(maxTop, top)),
    width: Math.min(nextWidth, Math.max(180, window.innerWidth - (margins.left + margins.right))),
    height: Math.min(nextHeight, Math.max(120, window.innerHeight - (margins.top + margins.bottom)))
  };
}

if (swfPipHeader) {
  swfPipHeader.addEventListener("mousedown", (event) => {
    beginPipDrag(event, "swf", ui.swfPipDock);
  });
  swfPipHeader.addEventListener("pointerdown", (event) => {
    beginPipDrag(event, "swf", ui.swfPipDock);
  });
  swfPipHeader.addEventListener("click", (event) => {
    if (event.target instanceof HTMLElement && event.target.closest("button")) return;
    if (pipSuppressHeaderToggle) {
      pipSuppressHeaderToggle = false;
      return;
    }
    swfPipCollapsed = !swfPipCollapsed;
    renderSwfPipDock();
  });
}

if (videoPipHeader) {
  videoPipHeader.addEventListener("mousedown", (event) => {
    beginPipDrag(event, "video", ui.videoPipDock);
  });
  videoPipHeader.addEventListener("pointerdown", (event) => {
    beginPipDrag(event, "video", ui.videoPipDock);
  });
  videoPipHeader.addEventListener("click", (event) => {
    if (event.target instanceof HTMLElement && event.target.closest("button")) return;
    if (videoPipSuppressHeaderToggle) {
      videoPipSuppressHeaderToggle = false;
      return;
    }
    videoPipCollapsed = !videoPipCollapsed;
    renderVideoPipDock();
    requestSwfRuntimeLayoutSync();
  });
}

ensurePipResizeHandles("swf", ui.swfPipDock);
ensurePipResizeHandles("video", ui.videoPipDock);

const handlePipDragMove = (event) => {
  if (pipResizeState?.resizing) return;
  if (!pipDragState?.dragging) return;
  if (event.cancelable) event.preventDefault();
  const targetDock = pipDragState.target === "video" ? ui.videoPipDock : ui.swfPipDock;
  if (!(targetDock instanceof HTMLElement)) return;
  const moveDistance = Math.hypot(event.clientX - pipDragState.startX, event.clientY - pipDragState.startY);
  if (moveDistance > 10) pipDragState.moved = true;
  const dockRect = targetDock.getBoundingClientRect();
  const margins = pipViewportMargins();
  const composerRect = ui.messageForm?.getBoundingClientRect?.();
  const maxTop = composerRect
    ? Math.max(margins.top, composerRect.top - dockRect.height - margins.bottom)
    : Math.max(margins.top, window.innerHeight - dockRect.height - margins.bottom);
  const nextLeft = Math.max(
    margins.left,
    Math.min(window.innerWidth - dockRect.width - margins.right, event.clientX - pipDragState.offsetX)
  );
  const nextTop = Math.max(margins.top, Math.min(maxTop, event.clientY - pipDragState.offsetY));
  targetDock.style.left = `${Math.round(nextLeft)}px`;
  targetDock.style.top = `${Math.round(nextTop)}px`;
  targetDock.style.right = "auto";
  targetDock.style.bottom = "auto";
  if (pipDragState.target === "swf") {
    positionSwfPipRuntimeHosts();
    updateVideoPipDockLayout();
  }
};

const handlePipResizeMove = (event) => {
  if (!pipResizeState?.resizing) return;
  event.preventDefault();
  const targetDock = pipResizeState.target === "video" ? ui.videoPipDock : ui.swfPipDock;
  if (!(targetDock instanceof HTMLElement)) return;
  const edge = (pipResizeState.edge || "").toLowerCase();
  const deltaX = event.clientX - pipResizeState.startX;
  const deltaY = event.clientY - pipResizeState.startY;
  const minSize = PIP_MIN_SIZE[pipResizeState.target] || PIP_MIN_SIZE.swf;
  let nextLeft = pipResizeState.startLeft;
  let nextTop = pipResizeState.startTop;
  let nextWidth = pipResizeState.startWidth;
  let nextHeight = pipResizeState.startHeight;

  if (edge.includes("e")) {
    nextWidth = pipResizeState.startWidth + deltaX;
  }
  if (edge.includes("s")) {
    nextHeight = pipResizeState.startHeight + deltaY;
  }
  if (edge.includes("w")) {
    nextWidth = pipResizeState.startWidth - deltaX;
    nextLeft = pipResizeState.startLeft + deltaX;
    if (nextWidth < minSize.width) {
      nextLeft -= (minSize.width - nextWidth);
      nextWidth = minSize.width;
    }
  }
  if (edge.includes("n")) {
    nextHeight = pipResizeState.startHeight - deltaY;
    nextTop = pipResizeState.startTop + deltaY;
    if (nextHeight < minSize.height) {
      nextTop -= (minSize.height - nextHeight);
      nextHeight = minSize.height;
    }
  }

  const clamped = clampPipBoundsForRect(pipResizeState.target, nextLeft, nextTop, nextWidth, nextHeight);
  targetDock.style.left = `${Math.round(clamped.left)}px`;
  targetDock.style.top = `${Math.round(clamped.top)}px`;
  targetDock.style.width = `${Math.round(clamped.width)}px`;
  targetDock.style.height = `${Math.round(clamped.height)}px`;
  targetDock.style.right = "auto";
  targetDock.style.bottom = "auto";
  if (pipResizeState.target === "swf") {
    positionSwfPipRuntimeHosts();
    updateVideoPipDockLayout();
  } else {
    requestSwfRuntimeLayoutSync();
  }
};

const finishPipDrag = () => {
  if (pipResizeState?.resizing) return;
  if (!pipDragState?.dragging) return;
  const dragTarget = pipDragState.target || "swf";
  if (pipDragState.pointerTarget && typeof pipDragState.pointerTarget.releasePointerCapture === "function") {
    try {
      pipDragState.pointerTarget.releasePointerCapture(pipDragState.pointerId);
    } catch {
      // Ignore unsupported pointer capture release.
    }
  }
  if (dragTarget === "swf" && pipDragState.moved) pipSuppressHeaderToggle = true;
  if (dragTarget === "video" && pipDragState.moved) videoPipSuppressHeaderToggle = true;
  pipDragState.dragging = false;
  state.preferences = getPreferences();
  const dock = dragTarget === "video" ? ui.videoPipDock : ui.swfPipDock;
  if (dock instanceof HTMLElement) {
    clampPipDockAboveComposer(dock);
    const rect = dock.getBoundingClientRect();
    if (dragTarget === "video") {
      state.preferences.videoPipPosition = { left: Math.round(rect.left), top: Math.round(rect.top), manual: true };
    } else {
      state.preferences.swfPipPosition = { left: Math.round(rect.left), top: Math.round(rect.top), manual: true };
    }
  }
  saveState();
  pipDragState = null;
};

const finishPipResize = () => {
  if (!pipResizeState?.resizing) return;
  const target = pipResizeState.target || "swf";
  const dock = target === "video" ? ui.videoPipDock : ui.swfPipDock;
  pipResizeState.resizing = false;
  if (dock instanceof HTMLElement) {
    clampPipDockAboveComposer(dock);
    const rect = dock.getBoundingClientRect();
    state.preferences = getPreferences();
    if (target === "video") {
      state.preferences.videoPipPosition = { left: Math.round(rect.left), top: Math.round(rect.top), manual: true };
      state.preferences.videoPipSize = { width: Math.round(rect.width), height: Math.round(rect.height) };
    } else {
      state.preferences.swfPipPosition = { left: Math.round(rect.left), top: Math.round(rect.top), manual: true };
      state.preferences.swfPipSize = { width: Math.round(rect.width), height: Math.round(rect.height) };
    }
    saveState();
  }
  pipResizeState = null;
};

document.addEventListener("mousemove", handlePipDragMove);
document.addEventListener("pointermove", handlePipDragMove);
document.addEventListener("mousemove", handlePipResizeMove);
document.addEventListener("pointermove", handlePipResizeMove);
document.addEventListener("mouseup", finishPipDrag);
document.addEventListener("pointerup", finishPipDrag);
document.addEventListener("pointercancel", finishPipDrag);
document.addEventListener("mouseup", finishPipResize);
document.addEventListener("pointerup", finishPipResize);
document.addEventListener("pointercancel", finishPipResize);
ui.clearSwfShelfBtn.addEventListener("click", () => {
  state.savedSwfs = [];
  saveState();
  renderSwfShelf();
});
ui.swfViewerZoomInput.addEventListener("input", applySwfViewerZoom);

