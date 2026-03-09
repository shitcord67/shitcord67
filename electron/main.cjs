const fs = require("node:fs");
const path = require("node:path");

const PACKAGED_LINUX_SANDBOX_MODE = String(process.env.S67_PACKAGED_LINUX_SANDBOX || "off").toLowerCase();
const PACKAGED_LINUX_SHM_MODE = String(process.env.S67_PACKAGED_LINUX_SHM_MODE || "auto").toLowerCase();
const LINUX_SANDBOX_MODE = String(process.env.S67_LINUX_SANDBOX || "off").toLowerCase();
const PACKAGED_LINUX_RUNTIME_DIR = String(process.env.S67_PACKAGED_LINUX_RUNTIME_DIR || "").trim();

function canAccessDir(candidate) {
  if (!candidate) return false;
  try {
    const stat = fs.statSync(candidate);
    if (!stat.isDirectory()) return false;
    fs.accessSync(candidate, fs.constants.W_OK | fs.constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

function resolveWritableRuntimeDir() {
  const home = process.env.HOME || process.env.USERPROFILE || "";
  const candidates = [
    PACKAGED_LINUX_RUNTIME_DIR,
    home ? path.join(home, ".cache", "shitcord67", "runtime") : "",
    home ? path.join(home, ".local", "state", "shitcord67", "runtime") : "",
    path.join(process.cwd(), ".shitcord67-runtime")
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      fs.mkdirSync(candidate, { recursive: true });
      fs.accessSync(candidate, fs.constants.W_OK | fs.constants.X_OK);
      return candidate;
    } catch {
      // try next path
    }
  }
  return "";
}

function applyEarlyRuntimeEnv(runtimeDir) {
  if (!runtimeDir) return;
  if (!process.env.TMPDIR || !canAccessDir(process.env.TMPDIR)) {
    process.env.TMPDIR = runtimeDir;
  }
  if (!process.env.TMP || !canAccessDir(process.env.TMP)) {
    process.env.TMP = runtimeDir;
  }
  if (!process.env.TEMP || !canAccessDir(process.env.TEMP)) {
    process.env.TEMP = runtimeDir;
  }
  const xdgRuntime = process.env.XDG_RUNTIME_DIR || "";
  if (!xdgRuntime || !canAccessDir(xdgRuntime)) {
    process.env.XDG_RUNTIME_DIR = runtimeDir;
  }
}

const EARLY_RUNTIME_DIR = process.platform === "linux" ? resolveWritableRuntimeDir() : "";
if (process.platform === "linux") {
  applyEarlyRuntimeEnv(EARLY_RUNTIME_DIR);
}

const { app, BrowserWindow, dialog, session, ipcMain, desktopCapturer, Menu } = require("electron");
const { spawn } = require("node:child_process");
const http = require("node:http");
const https = require("node:https");
const net = require("node:net");
const os = require("node:os");
const PRELOAD_PATH = path.join(__dirname, "preload.cjs");

const ELECTRON_PIPEWIRE = String(process.env.S67_ELECTRON_PIPEWIRE || "on").toLowerCase();
const ELECTRON_OZONE_HINT = String(process.env.S67_ELECTRON_OZONE_HINT || "auto").toLowerCase();
const ELECTRON_PLATFORM_OVERRIDE = String(process.env.S67_ELECTRON_PLATFORM_OVERRIDE || "").toLowerCase();
const ELECTRON_REMOTE_DEBUG_PORT = String(process.env.S67_REMOTE_DEBUGGING_PORT || "").trim();

function appendChromiumFeatureFlag(flag) {
  if (!flag) return;
  const current = app.commandLine.getSwitchValue("enable-features") || "";
  const list = current ? current.split(",").map((item) => item.trim()).filter(Boolean) : [];
  if (!list.includes(flag)) list.push(flag);
  app.commandLine.appendSwitch("enable-features", list.join(","));
}

function detectLinuxSessionType() {
  const envHint = (process.env.XDG_SESSION_TYPE || "").toLowerCase();
  if (envHint === "wayland" || envHint === "x11") return envHint;
  const display = process.env.DISPLAY || "";
  const wayland = process.env.WAYLAND_DISPLAY || "";
  if (wayland && !display) return "wayland";
  if (display) return "x11";
  return "unknown";
}

function detectPlatformSummary() {
  if (process.platform !== "linux") {
    return {
      platform: process.platform,
      sessionType: "n/a",
      displayServer: "n/a"
    };
  }
  const sessionType = detectLinuxSessionType();
  const displayServer = sessionType === "wayland" ? (process.env.WAYLAND_DISPLAY || "") : (process.env.DISPLAY || "");
  return {
    platform: "linux",
    sessionType,
    displayServer: displayServer || "unknown"
  };
}

function resolvePlatformOverride(summary) {
  if (!ELECTRON_PLATFORM_OVERRIDE) return summary;
  const [platform, sessionType = summary.sessionType] = ELECTRON_PLATFORM_OVERRIDE.split(":");
  return {
    platform: platform || summary.platform,
    sessionType: sessionType || summary.sessionType,
    displayServer: summary.displayServer
  };
}

const IS_PACKAGED_LINUX = process.platform === "linux" && app.isPackaged;
const PACKAGED_LINUX_SANDBOX_ENABLED = !IS_PACKAGED_LINUX
  ? true
  : PACKAGED_LINUX_SANDBOX_MODE === "on";
const LINUX_SANDBOX_ENABLED = process.platform !== "linux"
  ? true
  : LINUX_SANDBOX_MODE === "on";

const ROOT_DIR = path.resolve(__dirname, "..");
const STACK_SCRIPT = path.join(ROOT_DIR, "scripts", "run-client-stack.sh");
const DND_MAX_FILE_BYTES = 24 * 1024 * 1024;
const RUNTIME_LOG_DIR_OVERRIDE = String(process.env.S67_RUNTIME_LOG_DIR || "").trim();
const RUNTIME_LOG_MAX_TEXT_CHARS = Math.max(1024, Number(process.env.S67_RUNTIME_LOG_MAX_TEXT_CHARS || 24000));

function safeDecodeFileUri(fileUri = "") {
  const raw = (fileUri || "").toString().trim();
  if (!raw) return "";
  try {
    const normalized = raw.startsWith("file://") ? raw : `file://${raw}`;
    return decodeURI(new URL(normalized).pathname || "");
  } catch {
    return "";
  }
}

function mimeForPath(filePath = "") {
  const ext = (path.extname(filePath || "").toLowerCase() || "").replace(/^\./, "");
  const map = {
    wav: "audio/wav",
    mp3: "audio/mpeg",
    ogg: "audio/ogg",
    flac: "audio/flac",
    m4a: "audio/mp4",
    mp4: "video/mp4",
    webm: "video/webm",
    mov: "video/quicktime",
    m4v: "video/x-m4v",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    pdf: "application/pdf",
    txt: "text/plain",
    json: "application/json",
    rtf: "application/rtf",
    swf: "application/x-shockwave-flash",
    html: "text/html",
    htm: "text/html"
  };
  return map[ext] || "application/octet-stream";
}

const CLIENT_HOST = process.env.CLIENT_HOST || "127.0.0.1";
const CLIENT_PORT = Number(process.env.CLIENT_PORT || 6769);
const GATEWAY_HOST = process.env.GATEWAY_HOST || "127.0.0.1";
const GATEWAY_PORT = Number(process.env.GATEWAY_PORT || 6770);
const GATEWAY_MODE = String(process.env.ELECTRON_GATEWAY_MODE || "auto").toLowerCase();
const START_TIMEOUT_MS = Math.max(3000, Number(process.env.ELECTRON_START_TIMEOUT_MS || 20000));
const DYNAMIC_PORT_ATTEMPTS = Math.max(0, Number(process.env.ELECTRON_DYNAMIC_PORT_ATTEMPTS || 12));
const CLIENT_CSP = "default-src 'self'; script-src 'self' https://unpkg.com https://cdn.jsdelivr.net 'wasm-unsafe-eval'; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https: http:; media-src 'self' data: blob: https: http:; frame-src 'self' data: blob: https: http:; connect-src 'self' data: blob: ws: wss: https: http:; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self';";
const CLIENT_PORT_FALLBACKS = [6771, 6772, 6773, 6970];

function resolveShmMode(rawMode) {
  const normalized = String(rawMode || "").toLowerCase();
  const shmOk = canAccessDir("/dev/shm");
  const tmpOk = canAccessDir("/tmp");

  if (normalized === "shm") {
    if (shmOk) return { mode: "shm", reason: "forced", shmOk, tmpOk };
    if (tmpOk) return { mode: "tmp", reason: "fallback", fallbackFrom: "shm", shmOk, tmpOk };
    return { mode: "shm", reason: "forced-unavailable", shmOk, tmpOk };
  }

  if (normalized === "tmp") {
    if (tmpOk) return { mode: "tmp", reason: "forced", shmOk, tmpOk };
    if (shmOk) return { mode: "shm", reason: "fallback", fallbackFrom: "tmp", shmOk, tmpOk };
    return { mode: "tmp", reason: "forced-unavailable", shmOk, tmpOk };
  }

  if (shmOk) return { mode: "shm", reason: "auto", shmOk, tmpOk };
  if (tmpOk) return { mode: "tmp", reason: "auto", shmOk, tmpOk };
  return { mode: "tmp", reason: "auto-unavailable", shmOk, tmpOk };
}

if (IS_PACKAGED_LINUX) {
  const shmDecision = resolveShmMode(PACKAGED_LINUX_SHM_MODE);
  const effectiveShmMode = shmDecision.mode;
  const disableSandbox = !PACKAGED_LINUX_SANDBOX_ENABLED;
  const runtimeDir = EARLY_RUNTIME_DIR || resolveWritableRuntimeDir();
  const tempDir = canAccessDir(process.env.TMPDIR || "") ? process.env.TMPDIR : runtimeDir;

  if (disableSandbox) {
    // Packaged Linux binaries often fail to launch in restricted environments unless sandboxing is disabled.
    app.commandLine.appendSwitch("no-sandbox");
    app.commandLine.appendSwitch("disable-setuid-sandbox");
    app.commandLine.appendSwitch("disable-gpu-sandbox");
  }
  if (tempDir) {
    applyEarlyRuntimeEnv(tempDir);
    app.setPath("temp", tempDir);
  }
  if (effectiveShmMode === "tmp") {
    // Force Chromium to use /tmp for shared memory in packaged Linux builds.
    app.commandLine.appendSwitch("disable-dev-shm-usage");
  }
  if (shmDecision.fallbackFrom) {
    // eslint-disable-next-line no-console
    console.warn(
      `[electron] packaged linux shm mode '${shmDecision.fallbackFrom}' unavailable; falling back to '${effectiveShmMode}'.`
    );
  }
  if (!shmDecision.shmOk && !shmDecision.tmpOk) {
    // eslint-disable-next-line no-console
    console.warn(
      "[electron] packaged linux shm fallback: neither /dev/shm nor /tmp is writable; shared memory errors are likely."
    );
  }
  // eslint-disable-next-line no-console
  console.log(
    `[electron] packaged linux flags: sandbox=${disableSandbox ? "off" : "on"} shm=${effectiveShmMode} runtimeTmp=${runtimeDir || "unresolved"} temp=${tempDir || "unresolved"}`
  );
}

if (process.platform === "linux") {
  const runtimeDir = EARLY_RUNTIME_DIR || resolveWritableRuntimeDir();
  if (runtimeDir) {
    applyEarlyRuntimeEnv(runtimeDir);
    try {
      app.setPath("temp", runtimeDir);
    } catch {
      // ignore setPath errors and continue with env-based fallback
    }
  }
  if (!IS_PACKAGED_LINUX) {
    const disableSandbox = !LINUX_SANDBOX_ENABLED;
    if (disableSandbox) {
      app.commandLine.appendSwitch("no-sandbox");
      app.commandLine.appendSwitch("disable-setuid-sandbox");
      app.commandLine.appendSwitch("disable-gpu-sandbox");
    }
    const devShmMode = String(process.env.S67_LINUX_SHM_MODE || "auto").toLowerCase();
    const shmDecision = resolveShmMode(devShmMode);
    if (shmDecision.mode === "tmp") {
      // Some restricted Linux/dev environments do not expose writable /dev/shm (e.g. sandboxes/containers).
      app.commandLine.appendSwitch("disable-dev-shm-usage");
    }
    if (shmDecision.fallbackFrom) {
      // eslint-disable-next-line no-console
      console.warn(
        `[electron] linux shm mode '${shmDecision.fallbackFrom}' unavailable; falling back to '${shmDecision.mode}'.`
      );
    }
    if (!shmDecision.shmOk && !shmDecision.tmpOk) {
      // eslint-disable-next-line no-console
      console.warn(
        "[electron] linux shm fallback: neither /dev/shm nor /tmp is writable; shared memory errors are likely."
      );
    }
    // eslint-disable-next-line no-console
    console.log(
      `[electron] linux flags: sandbox=${disableSandbox ? "off" : "on"} shm=${shmDecision.mode} temp=${app.getPath("temp") || process.env.TMPDIR || "unresolved"}`
    );
  }
  if (ELECTRON_PIPEWIRE !== "off") {
    appendChromiumFeatureFlag("WebRTCPipeWireCapturer");
  }
  if (ELECTRON_OZONE_HINT && ELECTRON_OZONE_HINT !== "off") {
    app.commandLine.appendSwitch("ozone-platform-hint", ELECTRON_OZONE_HINT);
  }
}
if (/^\d+$/.test(ELECTRON_REMOTE_DEBUG_PORT)) {
  app.commandLine.appendSwitch("remote-debugging-port", ELECTRON_REMOTE_DEBUG_PORT);
  app.commandLine.appendSwitch("remote-debugging-address", "127.0.0.1");
}

let mainWindow = null;
let stackProcess = null;
let stackStopTimer = null;
let isShuttingDown = false;
let securityHeadersInstalled = false;
let displayMediaRequestHandlerInstalled = false;
let permissionHandlersInstalled = false;
let preferredDisplayCaptureSourceId = "";
let preferredDisplayCaptureSourceSetAt = 0;
const PREFERRED_DISPLAY_CAPTURE_TTL_MS = 45_000;
let activeClientPort = CLIENT_PORT;
let activeGatewayPort = GATEWAY_PORT;
let lastStackExitCode = null;
let lastStackExitSignal = null;
let runtimeLogDirCache = "";
let runtimeLogDirAnnounced = false;

function pad2(value) {
  return String(Number(value) || 0).padStart(2, "0");
}

function truncateLogText(value = "", maxChars = RUNTIME_LOG_MAX_TEXT_CHARS) {
  const text = String(value || "");
  const limit = Math.max(256, Number(maxChars) || RUNTIME_LOG_MAX_TEXT_CHARS);
  if (text.length <= limit) return text;
  return `${text.slice(0, limit)} ... [truncated ${text.length - limit} chars]`;
}

function safeLogDataText(data) {
  if (data == null) return "";
  if (typeof data === "string") return truncateLogText(data);
  try {
    return truncateLogText(JSON.stringify(data));
  } catch {
    return truncateLogText(String(data));
  }
}

function safeWriteLogLine(filePath = "", line = "") {
  if (!filePath) return;
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.appendFile(filePath, `${line}\n`, () => {});
  } catch {
    // Ignore log write failures so runtime behavior is never blocked by filesystem issues.
  }
}

function normalizeLogSegment(value = "", fallback = "unknown") {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_.-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
  return normalized || fallback;
}

function extractLikelySessionIdFromData(data, depth = 0) {
  if (!data || depth > 3) return "";
  if (typeof data === "string") {
    const match = data.match(/\b(?:jmi-[a-z0-9-]{4,}|byk-[A-Za-z0-9_-]{4,}|[a-z0-9_-]{6,})\b/);
    return (match?.[0] || "").trim();
  }
  if (Array.isArray(data)) {
    for (const entry of data) {
      const nested = extractLikelySessionIdFromData(entry, depth + 1);
      if (nested) return nested;
    }
    return "";
  }
  if (typeof data !== "object") return "";
  const directKeys = ["sid", "sessionId", "session_id", "jingleSid", "callSessionId"];
  for (const key of directKeys) {
    const candidate = String(data?.[key] || "").trim();
    if (candidate) return candidate;
  }
  const idCandidate = String(data?.id || "").trim();
  if (/^(jmi-|byk-)/i.test(idCandidate)) return idCandidate;
  for (const value of Object.values(data)) {
    const nested = extractLikelySessionIdFromData(value, depth + 1);
    if (nested) return nested;
  }
  return "";
}

function resolveRuntimeLogDir() {
  if (runtimeLogDirCache) return runtimeLogDirCache;
  const candidates = [
    RUNTIME_LOG_DIR_OVERRIDE,
    (!app.isPackaged ? path.join(ROOT_DIR, "logs", "runtime") : ""),
    (() => {
      try {
        return path.join(app.getPath("userData"), "logs", "runtime");
      } catch {
        return "";
      }
    })(),
    (() => {
      const fallback = resolveWritableRuntimeDir();
      return fallback ? path.join(fallback, "logs") : "";
    })()
  ].filter(Boolean);
  for (const candidate of candidates) {
    try {
      fs.mkdirSync(candidate, { recursive: true });
      fs.accessSync(candidate, fs.constants.W_OK | fs.constants.X_OK);
      runtimeLogDirCache = candidate;
      return candidate;
    } catch {
      // Try next candidate.
    }
  }
  return "";
}

function buildDateParts(tsIso = "") {
  const date = tsIso ? new Date(tsIso) : new Date();
  const year = String(date.getFullYear());
  const month = pad2(date.getMonth() + 1);
  const day = pad2(date.getDate());
  const hour = pad2(date.getHours());
  const minute = pad2(date.getMinutes());
  return {
    date,
    tsIso: date.toISOString(),
    ymd: `${year}-${month}-${day}`,
    hour,
    minute,
    minuteKey: `${year}-${month}-${day}_${hour}-${minute}`
  };
}

function safeWriteJson(filePath = "", value = null) {
  if (!filePath) return;
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(value, null, 2), "utf8");
  } catch {
    // Ignore metadata write failures; logs should never block runtime behavior.
  }
}

function safeReadJson(filePath = "") {
  if (!filePath) return null;
  try {
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, "utf8");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function updateCallSessionSummary(root, sessionId, {
  parts,
  source,
  category,
  message
} = {}) {
  if (!root || !sessionId || !parts) return;
  const summaryPath = path.join(root, "calls", sessionId, "session-summary.json");
  const current = safeReadJson(summaryPath) || {};
  const previousSources = current.sources && typeof current.sources === "object" ? current.sources : {};
  const previousCategories = current.categories && typeof current.categories === "object" ? current.categories : {};
  const sourceKey = normalizeLogSegment(source, "unknown");
  const categoryKey = normalizeLogSegment(category, "unknown");
  const summary = {
    sessionId,
    firstSeenTs: current.firstSeenTs || parts.tsIso,
    lastSeenTs: parts.tsIso,
    lastMinuteKey: parts.minuteKey,
    events: Math.max(0, Number(current.events) || 0) + 1,
    lastSource: sourceKey,
    lastCategory: categoryKey,
    lastMessage: truncateLogText(message || "", 900),
    sources: {
      ...previousSources,
      [sourceKey]: Math.max(0, Number(previousSources[sourceKey]) || 0) + 1
    },
    categories: {
      ...previousCategories,
      [categoryKey]: Math.max(0, Number(previousCategories[categoryKey]) || 0) + 1
    }
  };
  safeWriteJson(summaryPath, summary);
}

function listRuntimeCallSessionSummaries({
  limit = 10,
  prefix = ""
} = {}) {
  const root = resolveRuntimeLogDir();
  if (!root) {
    return {
      ok: false,
      dir: "",
      sessions: [],
      error: "Runtime log directory is unavailable."
    };
  }
  const callsDir = path.join(root, "calls");
  const normalizedPrefix = normalizeLogSegment(prefix, "");
  const maxRows = Math.min(60, Math.max(1, Number(limit) || 10));
  try {
    if (!fs.existsSync(callsDir)) {
      return {
        ok: true,
        dir: root,
        sessions: []
      };
    }
    const dirs = fs.readdirSync(callsDir, { withFileTypes: true })
      .filter((entry) => entry?.isDirectory?.())
      .map((entry) => (entry.name || "").toString().trim())
      .filter(Boolean)
      .filter((sessionId) => !normalizedPrefix || sessionId.startsWith(normalizedPrefix));
    const rows = dirs.map((sessionId) => {
      const summaryPath = path.join(callsDir, sessionId, "session-summary.json");
      const summary = safeReadJson(summaryPath) || {};
      return {
        sessionId,
        events: Math.max(0, Number(summary.events) || 0),
        firstSeenTs: String(summary.firstSeenTs || ""),
        lastSeenTs: String(summary.lastSeenTs || ""),
        lastSource: String(summary.lastSource || ""),
        lastCategory: String(summary.lastCategory || ""),
        lastMessage: truncateLogText(String(summary.lastMessage || ""), 180)
      };
    });
    rows.sort((a, b) => {
      const left = Date.parse(a.lastSeenTs || 0);
      const right = Date.parse(b.lastSeenTs || 0);
      if (Number.isFinite(left) && Number.isFinite(right) && right !== left) return right - left;
      return b.events - a.events;
    });
    return {
      ok: true,
      dir: root,
      sessions: rows.slice(0, maxRows)
    };
  } catch (error) {
    return {
      ok: false,
      dir: root,
      sessions: [],
      error: String(error?.message || error || "Failed to read runtime call summaries.")
    };
  }
}

function persistRuntimeLogRecord({
  ts = "",
  source = "main",
  category = "runtime",
  message = "",
  data = null,
  sessionId = ""
} = {}) {
  const root = resolveRuntimeLogDir();
  if (!root) return;
  if (!runtimeLogDirAnnounced) {
    runtimeLogDirAnnounced = true;
    // eslint-disable-next-line no-console
    console.log(`[electron] runtime logs dir: ${root}`);
  }
  const parts = buildDateParts(ts);
  const normalizedSource = normalizeLogSegment(source, "main");
  const normalizedCategory = normalizeLogSegment(category, "runtime");
  const normalizedSessionId = normalizeLogSegment(
    sessionId || extractLikelySessionIdFromData(data) || extractLikelySessionIdFromData(message),
    ""
  );
  const safeMessage = truncateLogText(message || "");
  const dataText = safeLogDataText(data);
  const textLine = `${parts.tsIso} [${normalizedSource}] [${normalizedCategory}] ${safeMessage}${dataText ? ` ${dataText}` : ""}`;
  const ndjsonLine = JSON.stringify({
    ts: parts.tsIso,
    source: normalizedSource,
    category: normalizedCategory,
    message: safeMessage,
    data: dataText,
    sessionId: normalizedSessionId || ""
  });

  safeWriteLogLine(
    path.join(root, "minute", parts.ymd, parts.hour, `${parts.minute}.log`),
    textLine
  );
  safeWriteLogLine(
    path.join(root, "sources", normalizedSource, `${parts.ymd}.ndjson`),
    ndjsonLine
  );
  safeWriteLogLine(
    path.join(root, "categories", normalizedCategory, `${parts.ymd}.ndjson`),
    ndjsonLine
  );
  if (normalizedSessionId) {
    safeWriteLogLine(
      path.join(root, "calls", normalizedSessionId, `${parts.minuteKey}.ndjson`),
      ndjsonLine
    );
    safeWriteLogLine(
      path.join(root, "calls", normalizedSessionId, "latest.log"),
      textLine
    );
    updateCallSessionSummary(root, normalizedSessionId, {
      parts,
      source: normalizedSource,
      category: normalizedCategory,
      message: safeMessage
    });
  }
}

function clientUrl(port = activeClientPort) {
  return `http://${CLIENT_HOST}:${port}/`;
}

function log(message, extra = "", {
  source = "main",
  category = "runtime",
  data = null,
  sessionId = ""
} = {}) {
  const suffix = extra ? ` ${extra}` : "";
  const text = `[electron] ${message}${suffix}`;
  // eslint-disable-next-line no-console
  console.log(text);
  persistRuntimeLogRecord({
    source,
    category,
    message: `${message}${suffix}`,
    data,
    sessionId
  });
}

function ingestRendererLogEvent(payload = {}) {
  const event = payload && typeof payload === "object" ? payload : {};
  const source = normalizeLogSegment(event.source || "renderer-event", "renderer-event");
  const category = normalizeLogSegment(event.category || "renderer", "renderer");
  const message = truncateLogText(event.message || "");
  const sessionFromPayload = String(event.sessionId || "").trim();
  const sessionFromData = extractLikelySessionIdFromData(event.data);
  persistRuntimeLogRecord({
    ts: (event.ts || "").toString(),
    source,
    category,
    message,
    data: event.data,
    sessionId: sessionFromPayload || sessionFromData
  });
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isGatewayModeValid(mode) {
  return mode === "auto" || mode === "on" || mode === "off";
}

function checkUrlReady(url, timeoutMs = 1200) {
  return new Promise((resolve) => {
    let target;
    try {
      target = new URL(url);
    } catch {
      resolve(false);
      return;
    }
    const transport = target.protocol === "https:" ? https : http;
    const request = transport.request(
      {
        method: "GET",
        protocol: target.protocol,
        hostname: target.hostname,
        port: target.port,
        path: `${target.pathname || "/"}${target.search || ""}`,
        timeout: Math.max(500, timeoutMs)
      },
      (response) => {
        response.resume();
        resolve((response.statusCode || 0) >= 200 && (response.statusCode || 0) < 500);
      }
    );
    request.on("error", () => resolve(false));
    request.on("timeout", () => {
      request.destroy();
      resolve(false);
    });
    request.end();
  });
}

async function waitForClientReady(url, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (stackProcess === null && Number.isInteger(lastStackExitCode) && lastStackExitCode !== 0) {
      throw new Error(`Local stack exited early (code=${lastStackExitCode}, signal=${lastStackExitSignal || "none"}).`);
    }
    // eslint-disable-next-line no-await-in-loop
    const ok = await checkUrlReady(url);
    if (ok) return;
    // eslint-disable-next-line no-await-in-loop
    await wait(250);
  }
  throw new Error(`Client server did not become reachable at ${url} within ${timeoutMs}ms.`);
}

function startStackScript({
  clientPort = activeClientPort,
  gatewayPort = activeGatewayPort
} = {}) {
  if (!fs.existsSync(STACK_SCRIPT)) {
    throw new Error(`Missing stack launcher: ${STACK_SCRIPT}`);
  }
  if (!isGatewayModeValid(GATEWAY_MODE)) {
    throw new Error(`Invalid ELECTRON_GATEWAY_MODE: ${GATEWAY_MODE}. Expected auto|on|off.`);
  }
  activeClientPort = Math.max(1, Number(clientPort) || CLIENT_PORT);
  activeGatewayPort = Math.max(1, Number(gatewayPort) || GATEWAY_PORT);
  lastStackExitCode = null;
  lastStackExitSignal = null;

  const args = [
    STACK_SCRIPT,
    "--client-host",
    CLIENT_HOST,
    "--client-port",
    String(activeClientPort),
    "--gateway-host",
    GATEWAY_HOST,
    "--gateway-port",
    String(activeGatewayPort),
    "--gateway-mode",
    GATEWAY_MODE
  ];

  log("starting local stack", `(client=${CLIENT_HOST}:${activeClientPort}, gateway=${GATEWAY_HOST}:${activeGatewayPort}, mode=${GATEWAY_MODE})`);
  stackProcess = spawn("bash", args, {
    cwd: ROOT_DIR,
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"]
  });

  stackProcess.stdout.on("data", (chunk) => {
    const text = chunk.toString().trim();
    if (text) log(text, "", { source: "stack-stdout", category: "stack" });
  });

  stackProcess.stderr.on("data", (chunk) => {
    const text = chunk.toString().trim();
    if (text) log("stack stderr:", text, { source: "stack-stderr", category: "stack" });
  });

  stackProcess.on("exit", (code, signal) => {
    const info = `code=${code ?? "null"} signal=${signal ?? "none"}`;
    log("stack exited", info);
    lastStackExitCode = typeof code === "number" ? code : null;
    lastStackExitSignal = signal || null;
    stackProcess = null;
    if (!isShuttingDown && code !== 0 && mainWindow) {
      dialog.showErrorBox(
        "Stack exited",
        `Local client stack exited unexpectedly (${info}). Check terminal logs.`
      );
    }
  });
}

function stopStackScript() {
  if (!stackProcess) return;
  if (stackStopTimer) {
    clearTimeout(stackStopTimer);
    stackStopTimer = null;
  }
  if (stackProcess.exitCode !== null) {
    stackProcess = null;
    return;
  }

  log("stopping local stack");
  stackProcess.kill("SIGTERM");
  stackStopTimer = setTimeout(() => {
    if (!stackProcess || stackProcess.exitCode !== null) return;
    log("stack did not stop in time, forcing kill");
    stackProcess.kill("SIGKILL");
  }, 4000);
}

function installClientSecurityHeaders() {
  if (securityHeadersInstalled) return;
  securityHeadersInstalled = true;
  session.defaultSession.webRequest.onHeadersReceived(
    { urls: [`http://${CLIENT_HOST}/*`] },
    (details, callback) => {
      const headers = details.responseHeaders ? { ...details.responseHeaders } : {};
      headers["Content-Security-Policy"] = [CLIENT_CSP];
      callback({ responseHeaders: headers });
    }
  );
}

const TRUSTED_RENDERER_PERMISSIONS = new Set([
  "media",
  "display-capture",
  "speaker-selection",
  "fullscreen"
]);

function isLoopbackHost(value = "") {
  const host = (value || "").toString().trim().toLowerCase();
  return host === "127.0.0.1" || host === "localhost" || host === "::1";
}

function isTrustedClientOrigin(rawUrl = "") {
  if (!rawUrl) return false;
  let parsed = null;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return false;
  }
  if (!/^https?:$/i.test(parsed.protocol)) return false;
  const host = (parsed.hostname || "").toString().trim().toLowerCase();
  const configuredHost = (CLIENT_HOST || "").toString().trim().toLowerCase();
  const hostMatches = host === configuredHost || (isLoopbackHost(host) && isLoopbackHost(configuredHost));
  if (!hostMatches) return false;
  const resolvedPort = Number(parsed.port || (parsed.protocol === "https:" ? 443 : 80));
  return resolvedPort === Number(activeClientPort);
}

function shouldAllowRendererPermission(permission = "", originCandidates = []) {
  const normalized = (permission || "").toString().trim().toLowerCase();
  if (!TRUSTED_RENDERER_PERMISSIONS.has(normalized)) return false;
  const candidates = (Array.isArray(originCandidates) ? originCandidates : [])
    .map((entry) => (entry || "").toString().trim())
    .filter(Boolean);
  return candidates.some((entry) => isTrustedClientOrigin(entry));
}

function installPermissionHandlers() {
  if (permissionHandlersInstalled) return;
  const defaultSession = session.defaultSession;
  if (!defaultSession) return;
  if (typeof defaultSession.setPermissionRequestHandler === "function") {
    defaultSession.setPermissionRequestHandler((webContents, permission, callback, details = {}) => {
      const originCandidates = [
        details.requestingOrigin,
        details.securityOrigin,
        details.embeddingOrigin,
        details.origin
      ];
      if (webContents && typeof webContents.getURL === "function") {
        originCandidates.push(webContents.getURL());
      }
      const allow = shouldAllowRendererPermission(permission, originCandidates);
      try {
        callback(Boolean(allow));
      } catch {
        // Ignore callback races during shutdown/navigation.
      }
    });
  }
  if (typeof defaultSession.setPermissionCheckHandler === "function") {
    defaultSession.setPermissionCheckHandler((webContents, permission, requestingOrigin, details = {}) => {
      const originCandidates = [
        requestingOrigin,
        details.requestingOrigin,
        details.securityOrigin,
        details.embeddingOrigin
      ];
      if (webContents && typeof webContents.getURL === "function") {
        originCandidates.push(webContents.getURL());
      }
      return shouldAllowRendererPermission(permission, originCandidates);
    });
  }
  permissionHandlersInstalled = true;
  log("permission handlers installed for trusted local renderer origin");
}

function scoreDisplayCaptureSource(source) {
  if (!source || typeof source !== "object") return -1;
  const id = (source.id || "").toString().toLowerCase();
  const name = (source.name || "").toString().toLowerCase();
  let score = 0;
  if (id.startsWith("screen:")) score += 60;
  if (id.startsWith("window:")) score += 10;
  if (name.includes("entire screen")) score += 40;
  if (name.includes("screen") || name.includes("display") || name.includes("monitor")) score += 25;
  if (source.display_id && source.display_id !== "0") score += 5;
  return score;
}

function pickPreferredDisplayCaptureSource(sources = []) {
  const list = Array.isArray(sources) ? sources.filter(Boolean) : [];
  if (list.length <= 0) return null;
  return [...list]
    .sort((a, b) => scoreDisplayCaptureSource(b) - scoreDisplayCaptureSource(a))[0] || null;
}

function consumePreferredDisplayCaptureSourceId() {
  const now = Date.now();
  const sourceId = (preferredDisplayCaptureSourceId || "").toString().trim();
  const age = now - (Number(preferredDisplayCaptureSourceSetAt) || 0);
  preferredDisplayCaptureSourceId = "";
  preferredDisplayCaptureSourceSetAt = 0;
  if (!sourceId) return "";
  if (age <= 0 || age > PREFERRED_DISPLAY_CAPTURE_TTL_MS) return "";
  return sourceId;
}

function installDisplayMediaRequestHandler() {
  if (displayMediaRequestHandlerInstalled) return;
  const defaultSession = session.defaultSession;
  if (!defaultSession || typeof defaultSession.setDisplayMediaRequestHandler !== "function") {
    log("display media request handler unavailable in this Electron runtime");
    return;
  }
  try {
    defaultSession.setDisplayMediaRequestHandler(
      async (_request, callback) => {
        try {
          const sources = await desktopCapturer.getSources({
            types: ["screen", "window"],
            thumbnailSize: { width: 0, height: 0 },
            fetchWindowIcons: false
          });
          const preferredSourceId = consumePreferredDisplayCaptureSourceId();
          const selectedSource = (
            preferredSourceId
              ? sources.find((source) => (source?.id || "").toString().trim() === preferredSourceId) || null
              : null
          ) || pickPreferredDisplayCaptureSource(sources);
          if (!selectedSource) {
            callback({});
            return;
          }
          callback({ video: selectedSource });
        } catch (error) {
          log("display media source selection failed", String(error?.message || error));
          try {
            callback({});
          } catch {
            // Ignore callback races on failed capture requests.
          }
        }
      },
      { useSystemPicker: false }
    );
    displayMediaRequestHandlerInstalled = true;
    log("display media request handler installed");
  } catch (error) {
    log("failed to install display media request handler", String(error?.message || error));
  }
}

let devtoolsShortcutsRegistered = false;
let lastDevtoolsToggleAt = 0;

function notifyDevtoolsUnavailable(windowInstance, reason = "") {
  try {
    windowInstance?.webContents?.send("s67-devtools-unavailable", {
      reason: (reason || "").toString()
    });
  } catch {
    // no-op
  }
}

function toggleDevtoolsForWindow(windowInstance = BrowserWindow.getFocusedWindow() || mainWindow, { dedupeMs = 900 } = {}) {
  const now = Date.now();
  if (dedupeMs > 0 && now - lastDevtoolsToggleAt < dedupeMs) return true;
  if (!windowInstance || windowInstance.isDestroyed?.()) return false;
  if (!windowInstance.webContents || windowInstance.webContents.isDestroyed?.()) return false;
  let runtimeTempDir = app.getPath("temp") || process.env.TMPDIR || process.env.TMP || process.env.TEMP || "/tmp";
  if (process.platform === "linux" && !canAccessDir(runtimeTempDir)) {
    const fallbackDir = resolveWritableRuntimeDir();
    if (fallbackDir && canAccessDir(fallbackDir)) {
      runtimeTempDir = fallbackDir;
      try {
        applyEarlyRuntimeEnv(fallbackDir);
        app.setPath("temp", fallbackDir);
      } catch {
        // ignore setPath errors and continue with env-based fallback
      }
    } else {
      log("devtools temp dir not writable; attempting toggle anyway", runtimeTempDir);
    }
  }
  try {
    lastDevtoolsToggleAt = now;
    if (windowInstance.webContents.isDevToolsOpened()) {
      windowInstance.webContents.closeDevTools();
    } else {
      // Prefer detached DevTools first on Linux/runtime-constrained builds, then docked fallbacks.
      try {
        windowInstance.webContents.openDevTools({ mode: "detach", activate: true });
      } catch {
        windowInstance.webContents.openDevTools({ mode: "right", activate: true });
      }
      if (!windowInstance.webContents.isDevToolsOpened()) {
        try {
          windowInstance.webContents.openDevTools({ mode: "undocked", activate: true });
        } catch {
          // ignore; handled below if still unavailable
        }
      }
      if (!windowInstance.webContents.isDevToolsOpened()) {
        try {
          windowInstance.webContents.openDevTools({ mode: "bottom", activate: true });
        } catch {
          // ignore; handled below if still unavailable
        }
      }
      if (!windowInstance.webContents.isDevToolsOpened()) {
        notifyDevtoolsUnavailable(windowInstance, "DevTools did not open (runtime blocked or unavailable).");
        return false;
      }
    }
    return true;
  } catch (error) {
    log("failed to toggle DevTools", String(error?.message || error));
    notifyDevtoolsUnavailable(windowInstance, String(error?.message || error));
    return false;
  }
}

function handleInternalS67Url(target, windowInstance) {
  if (!target || target.protocol !== "s67:") return false;
  const host = (target.hostname || "").toLowerCase();
  const path = (target.pathname || "").toLowerCase();
  if (host === "devtools" && (path === "/toggle" || path === "" || path === "/")) {
    toggleDevtoolsForWindow(windowInstance);
    return true;
  }
  return false;
}

function registerDevtoolsGlobalShortcuts() {
  // Intentionally disabled: global shortcuts hijack key combos outside the app
  // (e.g. Ctrl+Shift+I in browsers on X11). We keep app-local shortcuts only.
  devtoolsShortcutsRegistered = false;
}

function unregisterDevtoolsGlobalShortcuts() {
  devtoolsShortcutsRegistered = false;
}

function installApplicationMenu() {
  const template = [
    {
      label: "App",
      submenu: [
        { role: "quit" }
      ]
    },
    {
      label: "View",
      submenu: [
        {
          label: "Toggle DevTools",
          accelerator: "F12",
          click: () => toggleDevtoolsForWindow(BrowserWindow.getFocusedWindow() || mainWindow, { dedupeMs: 250 })
        },
        {
          label: "Force Open DevTools",
          accelerator: process.platform === "darwin" ? "Cmd+Shift+Alt+I" : "Ctrl+Shift+Alt+I",
          click: () => toggleDevtoolsForWindow(BrowserWindow.getFocusedWindow() || mainWindow, { dedupeMs: 0 })
        },
        {
          label: "Toggle DevTools (Ctrl+Shift+J)",
          accelerator: process.platform === "darwin" ? "Cmd+Shift+J" : "Ctrl+Shift+J",
          click: () => toggleDevtoolsForWindow(BrowserWindow.getFocusedWindow() || mainWindow, { dedupeMs: 0 })
        },
        { type: "separator" },
        { role: "reload" },
        { role: "forceReload" },
        { role: "togglefullscreen" }
      ]
    }
  ];
  try {
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  } catch (error) {
    log("failed to install application menu", String(error?.message || error));
  }
}

function attachNavigationGuards(windowInstance, allowedOrigin) {
  const routeExternalToRenderer = (url) => {
    let target;
    try {
      target = new URL(url);
    } catch {
      return;
    }
    if (handleInternalS67Url(target, windowInstance)) return;
    if (target.protocol !== "http:" && target.protocol !== "https:") return;
    const serialized = JSON.stringify(target.toString());
    if (windowInstance?.isDestroyed?.()) return;
    windowInstance.webContents.executeJavaScript(
      `window.dispatchEvent(new CustomEvent("s67-open-external-url", { detail: ${serialized} }));`,
      true
    ).catch((error) => {
      log("failed to dispatch external URL request to renderer", String(error?.message || error));
    });
  };

  windowInstance.webContents.setWindowOpenHandler(({ url }) => {
    routeExternalToRenderer(url);
    return { action: "deny" };
  });

  windowInstance.webContents.on("will-navigate", (event, url) => {
    if (url.startsWith(allowedOrigin) || url.startsWith("data:") || url.startsWith("about:blank")) return;
    event.preventDefault();
    routeExternalToRenderer(url);
  });
}

function attachDeveloperShortcuts(windowInstance) {
  if (!windowInstance?.webContents) return;
  windowInstance.webContents.on("context-menu", (_event, params) => {
    const hasTarget = Number.isFinite(params?.x) && Number.isFinite(params?.y);
    const menu = Menu.buildFromTemplate([
      {
        label: "Toggle DevTools",
        click: () => {
          toggleDevtoolsForWindow(windowInstance, { dedupeMs: 0 });
        }
      },
      {
        label: "Inspect Element",
        enabled: hasTarget,
        click: () => {
          if (!hasTarget) return;
          if (!windowInstance.webContents.isDevToolsOpened()) {
            toggleDevtoolsForWindow(windowInstance, { dedupeMs: 0 });
          }
          try {
            windowInstance.webContents.inspectElement(params.x, params.y);
          } catch {
            // no-op
          }
        }
      }
    ]);
    menu.popup({ window: windowInstance });
  });
  windowInstance.webContents.on("before-input-event", (event, input) => {
    const key = (input?.key || "").toUpperCase();
    const code = (input?.code || "").toUpperCase();
    const wantsF12 = key === "F12";
    const wantsCtrlShiftI = key === "I" && input.control && input.shift;
    const wantsCtrlShiftJ = key === "J" && input.control && input.shift;
    const wantsCmdAltI = key === "I" && input.meta && input.alt;
    const wantsCodeF12 = code === "F12";
    if (!wantsF12 && !wantsCodeF12 && !wantsCtrlShiftI && !wantsCtrlShiftJ && !wantsCmdAltI) return;
    event.preventDefault();
    toggleDevtoolsForWindow(windowInstance, { dedupeMs: 900 });
  });
}

async function createMainWindow({ startupWarning = "" } = {}) {
  const windowSandbox = process.platform === "linux"
    ? (IS_PACKAGED_LINUX ? PACKAGED_LINUX_SANDBOX_ENABLED : LINUX_SANDBOX_ENABLED)
    : true;
  const browser = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 640,
    minHeight: 480,
    title: "shitcord67",
    autoHideMenuBar: true,
    backgroundColor: "#101217",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: windowSandbox,
      devTools: true,
      preload: PRELOAD_PATH
    }
  });

  mainWindow = browser;

  const activeClientUrl = clientUrl();
  const origin = new URL(activeClientUrl).origin;
  attachNavigationGuards(browser, origin);
  attachDeveloperShortcuts(browser);
  browser.webContents.on("console-message", (_event, level, message, line, sourceId) => {
    const text = String(message || "");
    const source = String(sourceId || "");
    const isImportant = Number(level) >= 2 || /uncaught|error|exception/i.test(text);
    if (!isImportant) return;
    log("renderer", `[level=${level}] ${source}:${line} ${text}`.trim(), {
      source: "renderer-console",
      category: "renderer"
    });
  });
  browser.webContents.on("render-process-gone", (_event, details) => {
    log("renderer process gone", JSON.stringify(details || {}));
  });
  browser.webContents.on("unresponsive", () => {
    log("renderer unresponsive");
  });

  const platformSummary = resolvePlatformOverride(detectPlatformSummary());
  browser.webContents.on("did-finish-load", () => {
    browser.webContents.send("s67-platform-info", {
      platform: platformSummary.platform,
      sessionType: platformSummary.sessionType,
      displayServer: platformSummary.displayServer,
      override: ELECTRON_PLATFORM_OVERRIDE || "",
      pipewire: ELECTRON_PIPEWIRE || "on",
      ozoneHint: ELECTRON_OZONE_HINT || "auto"
    });
  });
  ipcMain.on("s67-request-platform-info", (event) => {
    event.sender.send("s67-platform-info", {
      platform: platformSummary.platform,
      sessionType: platformSummary.sessionType,
      displayServer: platformSummary.displayServer,
      override: ELECTRON_PLATFORM_OVERRIDE || "",
      pipewire: ELECTRON_PIPEWIRE || "on",
      ozoneHint: ELECTRON_OZONE_HINT || "auto"
    });
  });
  ipcMain.on("s67-toggle-devtools", (event) => {
    const senderWindow = BrowserWindow.fromWebContents(event.sender);
    toggleDevtoolsForWindow(senderWindow || mainWindow, { dedupeMs: 900 });
  });
  ipcMain.removeAllListeners("s67-log-event");
  ipcMain.on("s67-log-event", (_event, payload) => {
    ingestRendererLogEvent(payload);
  });
  ipcMain.removeHandler("s67-get-runtime-log-dir");
  ipcMain.handle("s67-get-runtime-log-dir", async () => {
    const dir = resolveRuntimeLogDir();
    return {
      ok: Boolean(dir),
      dir: dir || ""
    };
  });
  ipcMain.removeHandler("s67-get-runtime-log-index");
  ipcMain.handle("s67-get-runtime-log-index", async (_event, payload = {}) => {
    return listRuntimeCallSessionSummaries({
      limit: Number(payload?.limit) || 10,
      prefix: (payload?.prefix || "").toString()
    });
  });
  ipcMain.removeHandler("s67-list-display-capture-sources");
  ipcMain.handle("s67-list-display-capture-sources", async () => {
    try {
      const sources = await desktopCapturer.getSources({
        types: ["screen", "window"],
        thumbnailSize: { width: 480, height: 270 },
        fetchWindowIcons: true
      });
      const mapped = sources.map((source) => ({
        id: (source?.id || "").toString(),
        name: (source?.name || "").toString() || "Display source",
        type: String(source?.id || "").toLowerCase().startsWith("screen:") ? "screen" : "window",
        displayId: (source?.display_id || "").toString(),
        thumbnailDataUrl: source?.thumbnail?.isEmpty?.() ? "" : (source?.thumbnail?.toDataURL?.() || ""),
        iconDataUrl: source?.appIcon?.isEmpty?.() ? "" : (source?.appIcon?.toDataURL?.() || "")
      }));
      return { ok: true, sources: mapped };
    } catch (error) {
      return {
        ok: false,
        error: String(error?.message || error || "Failed to enumerate display capture sources."),
        sources: []
      };
    }
  });
  ipcMain.removeHandler("s67-set-display-capture-source");
  ipcMain.handle("s67-set-display-capture-source", async (_event, payload) => {
    const sourceId = (payload?.sourceId || payload || "").toString().trim();
    if (!sourceId) {
      preferredDisplayCaptureSourceId = "";
      preferredDisplayCaptureSourceSetAt = 0;
      return { ok: false, error: "Missing display source id." };
    }
    preferredDisplayCaptureSourceId = sourceId;
    preferredDisplayCaptureSourceSetAt = Date.now();
    return { ok: true };
  });
  ipcMain.removeHandler("s67-read-local-xmpp-profiles");
  ipcMain.handle("s67-read-local-xmpp-profiles", async () => {
    const candidates = [
      path.join(ROOT_DIR, ".xmpp.local.json"),
      path.join(process.cwd(), ".xmpp.local.json")
    ];
    for (const candidate of candidates) {
      try {
        const raw = await fs.promises.readFile(candidate, "utf8");
        const parsed = JSON.parse(raw);
        return {
          ok: true,
          path: candidate,
          data: parsed
        };
      } catch {
        // try next candidate
      }
    }
    return {
      ok: false,
      error: "No readable .xmpp.local.json file found."
    };
  });
  ipcMain.removeHandler("s67-read-dropped-file-path");
  ipcMain.handle("s67-read-dropped-file-path", async (_event, payload) => {
    const fileUri = (payload?.fileUri || "").toString().trim();
    const filePath = safeDecodeFileUri(fileUri);
    if (!filePath) return { ok: false, error: "Invalid dropped file URI." };
    try {
      const stat = await fs.promises.stat(filePath);
      if (!stat.isFile()) return { ok: false, error: "Dropped item is not a file." };
      if (stat.size > DND_MAX_FILE_BYTES) {
        return {
          ok: false,
          error: `Dropped file exceeds ${Math.round(DND_MAX_FILE_BYTES / (1024 * 1024))}MB limit.`
        };
      }
      const buffer = await fs.promises.readFile(filePath);
      const mime = mimeForPath(filePath);
      const base64 = buffer.toString("base64");
      const dataUrl = `data:${mime};base64,${base64}`;
      return {
        ok: true,
        filePath,
        name: path.basename(filePath),
        size: stat.size,
        mime,
        dataUrl
      };
    } catch (error) {
      return {
        ok: false,
        error: String(error?.message || error || "Could not read dropped file path.")
      };
    }
  });

  let loadedClient = false;
  try {
    await browser.loadURL(activeClientUrl);
    loadedClient = true;
  } catch (error) {
    log("client load failed", String(error?.message || error));
  }
  if (!loadedClient) {
    const warningText = startupWarning
      ? `${startupWarning}\n\nThe app opened, but the local client URL is unavailable.`
      : `Could not load ${activeClientUrl}.`;
    const fallbackHtml = [
      "<!doctype html><html><head><meta charset=\"utf-8\" />",
      "<title>shitcord67 Startup Notice</title>",
      "<style>body{margin:0;font-family:ui-sans-serif,system-ui,sans-serif;background:#111319;color:#dde3ef;display:grid;place-items:center;min-height:100vh}main{max-width:760px;padding:24px}h1{margin:0 0 12px;font-size:1.25rem}p,pre{line-height:1.45}pre{background:#181c25;border:1px solid #2a3140;border-radius:8px;padding:12px;white-space:pre-wrap}a{color:#9cb5ff}button{margin-top:10px;padding:8px 12px;border-radius:8px;border:1px solid #3a4357;background:#202634;color:#eef2ff;cursor:pointer}</style>",
      "</head><body><main>",
      "<h1>Desktop window opened, but backend is unavailable</h1>",
      `<p>Expected URL: <a href="${escapeHtml(activeClientUrl)}">${escapeHtml(activeClientUrl)}</a></p>`,
      `<pre>${escapeHtml(warningText)}</pre>`,
      "<button onclick=\"location.href='" + escapeHtml(activeClientUrl) + "'\">Retry loading app</button>",
      "</main></body></html>"
    ].join("");
    const fallbackUrl = `data:text/html;charset=utf-8,${encodeURIComponent(fallbackHtml)}`;
    await browser.loadURL(fallbackUrl);
  }

  browser.on("closed", () => {
    if (mainWindow === browser) mainWindow = null;
  });
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  isShuttingDown = true;
  unregisterDevtoolsGlobalShortcuts();
  stopStackScript();
});

app.on("will-quit", () => {
  isShuttingDown = true;
  unregisterDevtoolsGlobalShortcuts();
  stopStackScript();
});

function buildClientPortCandidates(primaryPort) {
  const normalizedPrimary = Math.max(1, Number(primaryPort) || 6769);
  return [normalizedPrimary, ...CLIENT_PORT_FALLBACKS]
    .map((value) => Math.max(1, Number(value) || 0))
    .filter((value, index, array) => value > 0 && array.indexOf(value) === index);
}

function reserveEphemeralPort(host) {
  return new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.unref();

    probe.on("error", (error) => {
      reject(error);
    });

    probe.listen({ host, port: 0, exclusive: true }, () => {
      const address = probe.address();
      const port = typeof address === "object" && address ? Number(address.port) : 0;
      probe.close((closeError) => {
        if (closeError) {
          reject(closeError);
          return;
        }
        if (port > 0) {
          resolve(port);
          return;
        }
        reject(new Error("Failed to reserve ephemeral client port."));
      });
    });
  });
}

async function buildExpandedClientPortCandidates(primaryPort) {
  const candidates = buildClientPortCandidates(primaryPort);
  if (DYNAMIC_PORT_ATTEMPTS <= 0) return candidates;

  const seen = new Set(candidates);
  for (let i = 0; i < DYNAMIC_PORT_ATTEMPTS; i += 1) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const port = await reserveEphemeralPort(CLIENT_HOST);
      if (seen.has(port)) continue;
      seen.add(port);
      candidates.push(port);
    } catch {
      break;
    }
  }

  return candidates;
}

async function startClientStackWithFallback() {
  const candidates = await buildExpandedClientPortCandidates(CLIENT_PORT);
  let lastError = "";
  for (const candidatePort of candidates) {
    try {
      if (candidatePort !== CLIENT_PORT) {
        log("retrying local stack on fallback port", `${CLIENT_HOST}:${candidatePort}`);
      }
      startStackScript({ clientPort: candidatePort, gatewayPort: GATEWAY_PORT });
      await waitForClientReady(clientUrl(candidatePort), START_TIMEOUT_MS);
      if (candidatePort !== CLIENT_PORT) {
        return {
          recovered: true,
          warning: `Primary client port ${CLIENT_PORT} was unavailable; switched to ${candidatePort}.`
        };
      }
      return { recovered: false, warning: "" };
    } catch (error) {
      lastError = String(error?.message || error || "unknown error");
      log("startup attempt failed", `port=${candidatePort} error=${lastError}`);
      stopStackScript();
      // Small pause to avoid tight retry loops and let process cleanup settle.
      // eslint-disable-next-line no-await-in-loop
      await wait(200);
    }
  }
  throw new Error(
    `Could not start local client stack on any candidate port (${candidates.join(", ")}). Last error: ${lastError || "unknown error"}.`
  );
}

app.whenReady().then(async () => {
  let startupWarning = "";
  let startupRecovered = false;
  try {
    installClientSecurityHeaders();
    installDisplayMediaRequestHandler();
    installApplicationMenu();
    registerDevtoolsGlobalShortcuts();
    const result = await startClientStackWithFallback();
    startupRecovered = Boolean(result.recovered);
    startupWarning = (result.warning || "").toString();
  } catch (error) {
    startupWarning = String(error?.message || error || "unknown error");
    log("startup warning", startupWarning);
  }
  installPermissionHandlers();

  try {
    await createMainWindow({ startupWarning });
    if (startupWarning && !startupRecovered) {
      dialog.showErrorBox(
        "Desktop stack warning",
        `${startupWarning}\n\nThe desktop window was opened anyway. Verify that ${clientUrl()} is reachable.`
      );
    }
  } catch (error) {
    const message = String(error?.message || error || "unknown error");
    log("startup failed", message);
    dialog.showErrorBox("Failed to open desktop window", message);
    isShuttingDown = true;
    stopStackScript();
    app.quit();
    return;
  }

  app.on("activate", async () => {
    if (BrowserWindow.getAllWindows().length > 0) return;
    try {
      await createMainWindow();
    } catch (error) {
      const message = String(error?.message || error || "unknown error");
      dialog.showErrorBox("Failed to open window", message);
    }
  });
});
