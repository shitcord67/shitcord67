const { app, BrowserWindow, dialog, session } = require("electron");
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const http = require("node:http");
const https = require("node:https");
const path = require("node:path");

const ROOT_DIR = path.resolve(__dirname, "..");
const STACK_SCRIPT = path.join(ROOT_DIR, "scripts", "run-client-stack.sh");

const CLIENT_HOST = process.env.CLIENT_HOST || "127.0.0.1";
const CLIENT_PORT = Number(process.env.CLIENT_PORT || 8080);
const GATEWAY_HOST = process.env.GATEWAY_HOST || "127.0.0.1";
const GATEWAY_PORT = Number(process.env.GATEWAY_PORT || 8790);
const GATEWAY_MODE = String(process.env.ELECTRON_GATEWAY_MODE || "auto").toLowerCase();
const START_TIMEOUT_MS = Math.max(3000, Number(process.env.ELECTRON_START_TIMEOUT_MS || 20000));
const CLIENT_CSP = "default-src 'self'; script-src 'self' https://unpkg.com https://cdn.jsdelivr.net 'wasm-unsafe-eval'; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https: http:; media-src 'self' data: blob: https: http:; frame-src 'self' data: blob: https: http:; connect-src 'self' data: blob: ws: wss: https: http:; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self';";
const CLIENT_PORT_FALLBACKS = [18080, 8081, 38080, 18081];

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
      sandbox: true
    }
  });

  mainWindow = browser;

  const activeClientUrl = clientUrl();
  const origin = new URL(activeClientUrl).origin;
  attachNavigationGuards(browser, origin);
  attachDeveloperShortcuts(browser);

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
  const deduped = [normalizedPrimary, ...CLIENT_PORT_FALLBACKS]
    .map((value) => Math.max(1, Number(value) || 0))
    .filter((value, index, array) => value > 0 && array.indexOf(value) === index);
  return deduped;
}

async function startClientStackWithFallback() {
  const candidates = buildClientPortCandidates(CLIENT_PORT);
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
