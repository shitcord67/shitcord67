#!/usr/bin/env node
import http from "node:http";

import { client } from "@xmpp/client";
import { WebSocket } from "ws";

globalThis.WebSocket = WebSocket;

const port = Number(process.env.PORT || 8790);
const host = process.env.HOST || "127.0.0.1";

function corsHeaders(extra = {}) {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type",
    ...extra
  };
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
      if (body.length > 1_500_000) {
        reject(new Error("payload too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function parseJid(jid) {
  const raw = (jid || "").toString().trim();
  const at = raw.indexOf("@");
  if (at < 1 || at >= raw.length - 1) return null;
  return {
    local: raw.slice(0, at),
    domain: raw.slice(at + 1)
  };
}

function normalizeWs(value) {
  const raw = (value || "").toString().trim().slice(0, 180);
  return /^wss?:\/\//i.test(raw) ? raw : "";
}

async function tryXmppAuth({ jid, password, service, timeoutMs = 12000 }) {
  const parsed = parseJid(jid);
  if (!parsed) return { ok: false, reason: "bad-jid" };
  if (!password) return { ok: false, reason: "missing-password" };
  const ws = normalizeWs(service);
  if (!ws) return { ok: false, reason: "bad-service" };

  const resource = `shitcord67-gateway-${Date.now().toString(36).slice(-5)}`;
  const xmpp = client({
    service: ws,
    domain: parsed.domain,
    username: parsed.local,
    password,
    resource
  });

  return new Promise((resolve) => {
    let finished = false;
    const done = (result) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      xmpp.stop().catch(() => {});
      resolve(result);
    };
    const timer = setTimeout(() => {
      done({ ok: false, reason: "timeout" });
    }, Math.max(3000, Math.min(20000, Number(timeoutMs) || 12000)));

    xmpp.on("online", () => {
      done({ ok: true });
    });

    xmpp.on("error", (error) => {
      const raw = String(error?.message || error || "");
      const msg = raw.toLowerCase();
      if (msg.includes("not-authorized") || msg.includes("authentication") || msg.includes("invalid-credentials")) {
        done({ ok: false, reason: "auth", error: raw });
        return;
      }
      done({ ok: false, reason: "connect", error: raw });
    });

    xmpp.start().catch((error) => {
      const raw = String(error?.message || error || "");
      const msg = raw.toLowerCase();
      if (msg.includes("not-authorized") || msg.includes("authentication") || msg.includes("invalid-credentials")) {
        done({ ok: false, reason: "auth", error: raw });
        return;
      }
      done({ ok: false, reason: "connect", error: raw });
    });
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, corsHeaders());
    res.end();
    return;
  }

  if (req.url === "/health") {
    res.writeHead(200, corsHeaders({ "content-type": "application/json" }));
    res.end(JSON.stringify({ ok: true, service: "xmpp-auth-gateway" }));
    return;
  }

  if (req.method === "POST" && req.url === "/auth-check") {
    try {
      const payload = await readJson(req);
      const jid = (payload.jid || "").toString().trim();
      const password = (payload.password || "").toString();
      const candidates = Array.isArray(payload.candidates)
        ? payload.candidates.map((entry) => normalizeWs(entry)).filter(Boolean)
        : [];
      if (!jid || !password || candidates.length === 0) {
        res.writeHead(400, corsHeaders({ "content-type": "application/json" }));
        res.end(JSON.stringify({ ok: false, error: "jid, password, and candidates are required." }));
        return;
      }
      const failures = [];
      for (const wsUrl of candidates) {
        // eslint-disable-next-line no-await-in-loop
        const attempt = await tryXmppAuth({
          jid,
          password,
          service: wsUrl,
          timeoutMs: Number(payload.timeoutMs) || 10000
        });
        if (attempt.ok) {
          res.writeHead(200, corsHeaders({ "content-type": "application/json" }));
          res.end(JSON.stringify({ ok: true, wsUrl }));
          return;
        }
        failures.push({
          wsUrl,
          reason: attempt.reason || "connect",
          error: (attempt.error || "").toString().slice(0, 200)
        });
        if (attempt.reason === "auth") {
          res.writeHead(200, corsHeaders({ "content-type": "application/json" }));
          res.end(JSON.stringify({ ok: false, error: `Authentication failed on ${wsUrl}.`, failures }));
          return;
        }
      }
      res.writeHead(200, corsHeaders({ "content-type": "application/json" }));
      res.end(JSON.stringify({ ok: false, error: "Connection failed for all candidate endpoints.", failures }));
    } catch (error) {
      res.writeHead(400, corsHeaders({ "content-type": "application/json" }));
      res.end(JSON.stringify({ ok: false, error: String(error?.message || error) }));
    }
    return;
  }

  res.writeHead(404, corsHeaders({ "content-type": "text/plain" }));
  res.end("Not found");
});

server.listen(port, host, () => {
  // eslint-disable-next-line no-console
  console.log(`xmpp auth gateway listening on http://${host}:${port}`);
});
