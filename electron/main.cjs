const { app, BrowserWindow, dialog, shell, session } = require("electron");
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

const CLIENT_URL = `http://${CLIENT_HOST}:${CLIENT_PORT}/`;

let mainWindow = null;
let stackProcess = null;
let stackStopTimer = null;
let isShuttingDown = false;
let securityHeadersInstalled = false;

function log(message, extra = "") {
  const suffix = extra ? ` ${extra}` : "";
  // eslint-disable-next-line no-console
  console.log(`[electron] ${message}${suffix}`);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
    // eslint-disable-next-line no-await-in-loop
    const ok = await checkUrlReady(url);
    if (ok) return;
    // eslint-disable-next-line no-await-in-loop
    await wait(250);
  }
  throw new Error(`Client server did not become reachable at ${url} within ${timeoutMs}ms.`);
}

function startStackScript() {
  if (!fs.existsSync(STACK_SCRIPT)) {
    throw new Error(`Missing stack launcher: ${STACK_SCRIPT}`);
  }
  if (!isGatewayModeValid(GATEWAY_MODE)) {
    throw new Error(`Invalid ELECTRON_GATEWAY_MODE: ${GATEWAY_MODE}. Expected auto|on|off.`);
  }

  const args = [
    STACK_SCRIPT,
    "--client-host",
    CLIENT_HOST,
    "--client-port",
    String(CLIENT_PORT),
    "--gateway-host",
    GATEWAY_HOST,
    "--gateway-port",
    String(GATEWAY_PORT),
    "--gateway-mode",
    GATEWAY_MODE
  ];

  log("starting local stack", `(client=${CLIENT_HOST}:${CLIENT_PORT}, gateway=${GATEWAY_HOST}:${GATEWAY_PORT}, mode=${GATEWAY_MODE})`);
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
  const origin = new URL(CLIENT_URL).origin;
  session.defaultSession.webRequest.onHeadersReceived(
    { urls: [`${origin}/*`] },
    (details, callback) => {
      const headers = details.responseHeaders ? { ...details.responseHeaders } : {};
      headers["Content-Security-Policy"] = [CLIENT_CSP];
      callback({ responseHeaders: headers });
    }
  );
}

function attachNavigationGuards(windowInstance, allowedOrigin) {
  windowInstance.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url).catch(() => {});
    return { action: "deny" };
  });

  windowInstance.webContents.on("will-navigate", (event, url) => {
    if (url.startsWith(allowedOrigin)) return;
    event.preventDefault();
    shell.openExternal(url).catch(() => {});
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

async function createMainWindow() {
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

  const origin = new URL(CLIENT_URL).origin;
  attachNavigationGuards(browser, origin);
  attachDeveloperShortcuts(browser);

  await browser.loadURL(CLIENT_URL);

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

app.whenReady().then(async () => {
  try {
    installClientSecurityHeaders();
    startStackScript();
    await waitForClientReady(CLIENT_URL, START_TIMEOUT_MS);
    await createMainWindow();
  } catch (error) {
    const message = String(error?.message || error || "unknown error");
    log("startup failed", message);
    dialog.showErrorBox("Failed to start desktop client", message);
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
