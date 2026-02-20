#!/usr/bin/env node
import http from "node:http";
import { Readable } from "node:stream";

import { client } from "@xmpp/client";
import { WebSocket } from "ws";

globalThis.WebSocket = WebSocket;

const port = Number(process.env.PORT || 8790);
const host = process.env.HOST || "127.0.0.1";

function corsHeaders(extra = {}) {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type,range",
    "access-control-expose-headers": "content-type,content-length,accept-ranges",
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

function extractXmppAltConnectionUrls(links) {
  if (!Array.isArray(links)) return [];
  const urls = [];
  links.forEach((entry) => {
    if (!entry || typeof entry !== "object") return;
    const rel = (entry.rel || "").toString().toLowerCase();
    if (!rel.includes("xmpp:alt-connections") || !rel.includes("websocket")) return;
    const href = normalizeWs(entry.href || entry.url || "");
    if (!href) return;
    if (!urls.includes(href)) urls.push(href);
  });
  return urls;
}

function parseHostMetaXml(rawXml) {
  const xml = (rawXml || "").toString();
  if (!xml) return [];
  const links = [];
  const linkPattern = /<link\b([^>]*)\/?>/gi;
  let match = linkPattern.exec(xml);
  while (match) {
    const attrs = (match[1] || "").toString();
    const relMatch = attrs.match(/\brel=['"]([^'"]+)['"]/i);
    const hrefMatch = attrs.match(/\bhref=['"]([^'"]+)['"]/i);
    links.push({
      rel: relMatch?.[1] || "",
      href: hrefMatch?.[1] || ""
    });
    match = linkPattern.exec(xml);
  }
  return extractXmppAltConnectionUrls(links);
}

async function fetchWithTimeout(url, {
  timeoutMs = 4000,
  method = "GET",
  redirect = "follow"
} = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Math.max(1500, Math.min(12000, Number(timeoutMs) || 4000)));
  try {
    return await fetch(url, {
      method,
      cache: "no-store",
      redirect,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timer);
  }
}

function wsToHttpUrl(wsUrl) {
  try {
    const url = new URL(wsUrl);
    if (url.protocol === "wss:") {
      url.protocol = "https:";
    } else if (url.protocol === "ws:") {
      url.protocol = "http:";
    } else {
      return "";
    }
    return url.toString();
  } catch {
    return "";
  }
}

function httpToWsUrl(httpUrl) {
  try {
    const url = new URL(httpUrl);
    if (url.protocol === "https:") {
      url.protocol = "wss:";
    } else if (url.protocol === "http:") {
      url.protocol = "ws:";
    } else {
      return "";
    }
    return url.toString();
  } catch {
    return "";
  }
}

async function resolveWsService(service, timeoutMs = 3500) {
  const normalized = normalizeWs(service);
  if (!normalized) return "";
  const probeStart = wsToHttpUrl(normalized);
  if (!probeStart) return normalized;

  let current = probeStart;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    let response;
    try {
      // eslint-disable-next-line no-await-in-loop
      response = await fetchWithTimeout(current, {
        timeoutMs,
        method: "GET",
        redirect: "manual"
      });
    } catch {
      return normalized;
    }
    const status = Number(response?.status || 0);
    if (![301, 302, 303, 307, 308].includes(status)) break;
    const location = response.headers.get("location");
    if (!location) break;
    try {
      current = new URL(location, current).toString();
    } catch {
      break;
    }
  }

  const resolved = normalizeWs(httpToWsUrl(current));
  return resolved || normalized;
}

async function discoverXmppWs({ jid, timeoutMs = 4500 }) {
  const parsed = parseJid(jid);
  if (!parsed) return { ok: false, error: "bad-jid", urls: [] };
  const domain = parsed.domain;
  const sources = [
    `https://${domain}/.well-known/host-meta.json`,
    `https://${domain}/.well-known/host-meta`
  ];
  const urls = [];
  const failures = [];
  for (const sourceUrl of sources) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const response = await fetchWithTimeout(sourceUrl, { timeoutMs });
      if (!response.ok) {
        failures.push({ url: sourceUrl, reason: "http", error: `HTTP ${response.status}` });
        continue;
      }
      const contentType = (response.headers.get("content-type") || "").toLowerCase();
      if (contentType.includes("json")) {
        // eslint-disable-next-line no-await-in-loop
        const payload = await response.json().catch(() => ({}));
        extractXmppAltConnectionUrls(Array.isArray(payload?.links) ? payload.links : []).forEach((entry) => {
          if (!urls.includes(entry)) urls.push(entry);
        });
      } else {
        // eslint-disable-next-line no-await-in-loop
        const xml = await response.text();
        parseHostMetaXml(xml).forEach((entry) => {
          if (!urls.includes(entry)) urls.push(entry);
        });
      }
    } catch (error) {
      failures.push({
        url: sourceUrl,
        reason: "fetch",
        error: String(error?.message || error).slice(0, 220)
      });
    }
  }
  return {
    ok: true,
    domain,
    urls: urls.slice(0, 8),
    failures
  };
}

function xmlEscape(value) {
  return (value || "")
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function escapeRegExp(value) {
  return (value || "").toString().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractIqType(xml, id) {
  const pattern = new RegExp(`<iq\\b[^>]*\\bid=['"]${escapeRegExp(id)}['"][^>]*>`, "i");
  const match = (xml || "").match(pattern);
  if (!match) return "";
  const openTag = match[0];
  const typeMatch = openTag.match(/\btype=['"]([^'"]+)['"]/i);
  return typeMatch?.[1] || "";
}

function extractIqErrorText(xml, id) {
  const pattern = new RegExp(`<iq\\b[^>]*\\bid=['"]${escapeRegExp(id)}['"][\\s\\S]*?<\\/iq>`, "i");
  const match = (xml || "").match(pattern);
  if (!match) return "";
  const stanza = match[0];
  const textMatch = stanza.match(/<text\b[^>]*>([\s\S]*?)<\/text>/i);
  if (textMatch?.[1]) return textMatch[1].replace(/\s+/g, " ").trim();
  const simpleTagMatch = stanza.match(/<(conflict|not-acceptable|forbidden|not-allowed|service-unavailable|not-authorized)\b/i);
  if (simpleTagMatch?.[1]) return simpleTagMatch[1];
  return "";
}

async function tryXmppAuth({ jid, password, service, timeoutMs = 12000 }) {
  const parsed = parseJid(jid);
  if (!parsed) return { ok: false, reason: "bad-jid" };
  if (!password) return { ok: false, reason: "missing-password" };
  let ws = normalizeWs(service);
  if (!ws) return { ok: false, reason: "bad-service" };
  try {
    ws = await resolveWsService(ws, Math.min(4500, timeoutMs));
  } catch {
    // keep original ws service
  }

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
      resolve({ ...result, service: ws });
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

async function tryXmppRegister({ jid, password, service, timeoutMs = 14000 }) {
  const parsed = parseJid(jid);
  if (!parsed) return { ok: false, reason: "bad-jid" };
  if (!password) return { ok: false, reason: "missing-password" };
  let ws = normalizeWs(service);
  if (!ws) return { ok: false, reason: "bad-service" };
  try {
    ws = await resolveWsService(ws, Math.min(4500, timeoutMs));
  } catch {
    // keep original ws service
  }

  return new Promise((resolve) => {
    let finished = false;
    let stage = "await-features";
    let buffer = "";
    const iqGetId = "reg_get_1";
    const iqSetId = "reg_set_1";
    const wsClient = new WebSocket(ws, "xmpp");

    const done = (result) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      try {
        wsClient.close();
      } catch {
        // ignore close errors
      }
      resolve({ ...result, service: ws });
    };

    const timer = setTimeout(() => {
      done({ ok: false, reason: "timeout", error: "Registration timed out." });
    }, Math.max(5000, Math.min(22000, Number(timeoutMs) || 14000)));

    wsClient.on("error", (error) => {
      done({ ok: false, reason: "connect", error: String(error?.message || error) });
    });

    wsClient.on("close", (code, reason) => {
      if (finished) return;
      const detail = reason ? `${code} ${reason.toString()}` : `${code}`;
      done({ ok: false, reason: "connect", error: `Socket closed before registration completed (${detail}).` });
    });

    wsClient.on("open", () => {
      wsClient.send(`<open to="${xmlEscape(parsed.domain)}" version="1.0" xmlns="urn:ietf:params:xml:ns:xmpp-framing"/>`);
    });

    wsClient.on("message", (raw) => {
      if (finished) return;
      const chunk = raw.toString();
      buffer = `${buffer}${chunk}`.slice(-300000);

      if (stage === "await-features") {
        const featuresMatch = buffer.match(/<stream:features[\s\S]*?<\/stream:features>/i);
        if (!featuresMatch) return;
        const featuresXml = featuresMatch[0];
        const supportsRegister = /<register\b[^>]*xmlns=['"]http:\/\/jabber\.org\/features\/iq-register['"][^>]*\/?>/i.test(featuresXml);
        if (!supportsRegister) {
          done({ ok: false, reason: "no-register", error: "Server does not advertise in-band registration." });
          return;
        }
        wsClient.send(`<iq type="get" id="${iqGetId}" xmlns="jabber:client"><query xmlns="jabber:iq:register"/></iq>`);
        stage = "await-reg-get";
        return;
      }

      if (stage === "await-reg-get") {
        const iqType = extractIqType(buffer, iqGetId);
        if (!iqType) return;
        wsClient.send(`<iq type="set" id="${iqSetId}" xmlns="jabber:client"><query xmlns="jabber:iq:register"><username>${xmlEscape(parsed.local)}</username><password>${xmlEscape(password)}</password></query></iq>`);
        stage = "await-reg-set";
        return;
      }

      if (stage === "await-reg-set") {
        const iqType = extractIqType(buffer, iqSetId);
        if (!iqType) return;
        if (iqType.toLowerCase() === "result") {
          done({ ok: true });
          return;
        }
        const errorText = extractIqErrorText(buffer, iqSetId) || "Registration rejected by server.";
        done({ ok: false, reason: "register", error: errorText });
      }
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

  if ((req.method === "GET" || req.method === "HEAD") && req.url?.startsWith("/media-proxy")) {
    try {
      const parsed = new URL(req.url, `http://${host}:${port}`);
      const targetRaw = (parsed.searchParams.get("url") || "").toString().trim();
      if (!targetRaw) {
        res.writeHead(400, corsHeaders({ "content-type": "application/json" }));
        res.end(JSON.stringify({ ok: false, error: "Missing url query parameter." }));
        return;
      }
      let target;
      try {
        target = new URL(targetRaw);
      } catch {
        res.writeHead(400, corsHeaders({ "content-type": "application/json" }));
        res.end(JSON.stringify({ ok: false, error: "Invalid target url." }));
        return;
      }
      if (!["http:", "https:"].includes(target.protocol)) {
        res.writeHead(400, corsHeaders({ "content-type": "application/json" }));
        res.end(JSON.stringify({ ok: false, error: "Only http/https target urls are allowed." }));
        return;
      }
      const upstream = await fetch(target.toString(), {
        method: req.method,
        cache: "no-store",
        redirect: "follow",
        headers: {
          "user-agent": "shitcord67-media-proxy/1.0"
        }
      });
      const headers = corsHeaders({
        "content-type": upstream.headers.get("content-type") || "application/octet-stream",
        "cache-control": upstream.headers.get("cache-control") || "public, max-age=120",
        "accept-ranges": "none",
        "x-media-proxy-target": target.host
      });
      const length = upstream.headers.get("content-length");
      if (length && Number(length) > 0) headers["content-length"] = length;
      res.writeHead(upstream.ok ? 200 : upstream.status, headers);
      if (req.method === "HEAD" || !upstream.body) {
        res.end();
        return;
      }
      const bodyStream = Readable.fromWeb(upstream.body);
      bodyStream.on("error", () => {
        try {
          if (!res.writableEnded) res.end();
        } catch {
          // Ignore stream close races.
        }
      });
      bodyStream.pipe(res);
    } catch (error) {
      res.writeHead(502, corsHeaders({ "content-type": "application/json" }));
      res.end(JSON.stringify({ ok: false, error: String(error?.message || error) }));
    }
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
          res.end(JSON.stringify({ ok: true, wsUrl: attempt.service || wsUrl }));
          return;
        }
        failures.push({
          wsUrl: attempt.service || wsUrl,
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

  if (req.method === "POST" && req.url === "/discover") {
    try {
      const payload = await readJson(req);
      const jid = (payload.jid || "").toString().trim();
      if (!jid) {
        res.writeHead(400, corsHeaders({ "content-type": "application/json" }));
        res.end(JSON.stringify({ ok: false, error: "jid is required." }));
        return;
      }
      const discovered = await discoverXmppWs({
        jid,
        timeoutMs: Number(payload.timeoutMs) || 4500
      });
      if (!discovered.ok) {
        res.writeHead(400, corsHeaders({ "content-type": "application/json" }));
        res.end(JSON.stringify({ ok: false, error: discovered.error || "discover-failed", urls: [] }));
        return;
      }
      res.writeHead(200, corsHeaders({ "content-type": "application/json" }));
      res.end(JSON.stringify({
        ok: true,
        domain: discovered.domain,
        urls: discovered.urls,
        failures: discovered.failures.slice(0, 6)
      }));
    } catch (error) {
      res.writeHead(400, corsHeaders({ "content-type": "application/json" }));
      res.end(JSON.stringify({ ok: false, error: String(error?.message || error), urls: [] }));
    }
    return;
  }

  if (req.method === "POST" && req.url === "/register") {
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
        const attempt = await tryXmppRegister({
          jid,
          password,
          service: wsUrl,
          timeoutMs: Number(payload.timeoutMs) || 14000
        });
        if (attempt.ok) {
          res.writeHead(200, corsHeaders({ "content-type": "application/json" }));
          res.end(JSON.stringify({ ok: true, wsUrl: attempt.service || wsUrl }));
          return;
        }
        failures.push({
          wsUrl: attempt.service || wsUrl,
          reason: attempt.reason || "register",
          error: (attempt.error || "").toString().slice(0, 220)
        });
      }
      const summary = failures[0]?.error || "Registration failed for all candidate endpoints.";
      res.writeHead(200, corsHeaders({ "content-type": "application/json" }));
      res.end(JSON.stringify({ ok: false, error: summary, failures }));
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
