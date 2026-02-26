const fs = require("node:fs");
const path = require("node:path");

const PACKAGED_LINUX_SANDBOX_MODE = String(process.env.S67_PACKAGED_LINUX_SANDBOX || "off").toLowerCase();
const PACKAGED_LINUX_SHM_MODE = String(process.env.S67_PACKAGED_LINUX_SHM_MODE || "auto").toLowerCase();
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

const { app, BrowserWindow, dialog, session, ipcMain } = require("electron");
const { spawn } = require("node:child_process");
const http = require("node:http");
const https = require("node:https");
const net = require("node:net");
const os = require("node:os");

const ELECTRON_PIPEWIRE = String(process.env.S67_ELECTRON_PIPEWIRE || "on").toLowerCase();
const ELECTRON_OZONE_HINT = String(process.env.S67_ELECTRON_OZONE_HINT || "auto").toLowerCase();
const ELECTRON_PLATFORM_OVERRIDE = String(process.env.S67_ELECTRON_PLATFORM_OVERRIDE || "").toLowerCase();

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

const ROOT_DIR = path.resolve(__dirname, "..");
const STACK_SCRIPT = path.join(ROOT_DIR, "scripts", "run-client-stack.sh");

const CLIENT_HOST = process.env.CLIENT_HOST || "127.0.0.1";
const CLIENT_PORT = Number(process.env.CLIENT_PORT || 8080);
const GATEWAY_HOST = process.env.GATEWAY_HOST || "127.0.0.1";
const GATEWAY_PORT = Number(process.env.GATEWAY_PORT || 8790);
const GATEWAY_MODE = String(process.env.ELECTRON_GATEWAY_MODE || "auto").toLowerCase();
const START_TIMEOUT_MS = Math.max(3000, Number(process.env.ELECTRON_START_TIMEOUT_MS || 20000));
const DYNAMIC_PORT_ATTEMPTS = Math.max(0, Number(process.env.ELECTRON_DYNAMIC_PORT_ATTEMPTS || 12));
const CLIENT_CSP = "default-src 'self'; script-src 'self' https://unpkg.com https://cdn.jsdelivr.net 'wasm-unsafe-eval'; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https: http:; media-src 'self' data: blob: https: http:; frame-src 'self' data: blob: https: http:; connect-src 'self' data: blob: ws: wss: https: http:; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self';";
const CLIENT_PORT_FALLBACKS = [18080, 8081, 38080, 18081];

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
  if (ELECTRON_PIPEWIRE !== "off") {
    appendChromiumFeatureFlag("WebRTCPipeWireCapturer");
  }
  if (ELECTRON_OZONE_HINT && ELECTRON_OZONE_HINT !== "off") {
    app.commandLine.appendSwitch("ozone-platform-hint", ELECTRON_OZONE_HINT);
  }
}

let mainWindow = null;
let stackProcess = null;
let stackStopTimer = null;
let isShuttingDown = false;
let securityHeadersInstalled = false;
let activeClientPort = CLIENT_PORT;
let activeGatewayPort = GATEWAY_PORT;
let lastStackExitCode = null;
let lastStackExitSignal = null;

function clientUrl(port = activeClientPort) {
  return `http://${CLIENT_HOST}:${port}/`;
}

function log(message, extra = "") {
  const suffix = extra ? ` ${extra}` : "";
  // eslint-disable-next-line no-console
  console.log(`[electron] ${message}${suffix}`);
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
    if (text) log(text);
  });

  stackProcess.stderr.on("data", (chunk) => {
    const text = chunk.toString().trim();
    if (text) log("stack stderr:", text);
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

function attachNavigationGuards(windowInstance, allowedOrigin) {
  const routeExternalToRenderer = (url) => {
    let target;
    try {
      target = new URL(url);
    } catch {
      return;
    }
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
  windowInstance.webContents.on("before-input-event", (event, input) => {
    const key = (input?.key || "").toUpperCase();
    const wantsF12 = key === "F12";
    const wantsCtrlShiftI = key === "I" && input.control && input.shift;
    const wantsCmdAltI = key === "I" && input.meta && input.alt;
    if (!wantsF12 && !wantsCtrlShiftI && !wantsCmdAltI) return;
    event.preventDefault();
    windowInstance.webContents.toggleDevTools();
  });
}

async function createMainWindow({ startupWarning = "" } = {}) {
  const windowSandbox = IS_PACKAGED_LINUX ? PACKAGED_LINUX_SANDBOX_ENABLED : true;
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
      sandbox: windowSandbox
    }
  });

  mainWindow = browser;

  const activeClientUrl = clientUrl();
  const origin = new URL(activeClientUrl).origin;
  attachNavigationGuards(browser, origin);
  attachDeveloperShortcuts(browser);

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
  stopStackScript();
});

app.on("will-quit", () => {
  isShuttingDown = true;
  stopStackScript();
});

function buildClientPortCandidates(primaryPort) {
  const normalizedPrimary = Math.max(1, Number(primaryPort) || 8080);
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
    const result = await startClientStackWithFallback();
    startupRecovered = Boolean(result.recovered);
    startupWarning = (result.warning || "").toString();
  } catch (error) {
    startupWarning = String(error?.message || error || "unknown error");
    log("startup warning", startupWarning);
  }

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
