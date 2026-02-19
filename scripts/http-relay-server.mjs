#!/usr/bin/env node
import http from "node:http";

const port = Number(process.env.PORT || 8788);
const host = process.env.HOST || "0.0.0.0";
const rooms = new Map();

function roomClients(room) {
  if (!rooms.has(room)) rooms.set(room, new Set());
  return rooms.get(room);
}

function writeSse(res, payload) {
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

function broadcast(room, payload) {
  const clients = roomClients(room);
  clients.forEach((res) => {
    writeSse(res, payload);
  });
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
      if (body.length > 2_000_000) {
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

const server = http.createServer(async (req, res) => {
  if (req.url?.startsWith("/health")) {
    const clientCount = [...rooms.values()].reduce((sum, set) => sum + set.size, 0);
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: true, rooms: rooms.size, clients: clientCount }));
    return;
  }

  if (req.url?.startsWith("/events")) {
    const parsed = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    const room = (parsed.searchParams.get("room") || "lobby:general").toString().slice(0, 80);
    res.writeHead(200, {
      "content-type": "text/event-stream",
      "cache-control": "no-cache",
      connection: "keep-alive",
      "access-control-allow-origin": "*"
    });
    res.write("\n");
    const clients = roomClients(room);
    clients.add(res);
    writeSse(res, { type: "joined", room, ts: new Date().toISOString() });
    const keepAlive = setInterval(() => {
      res.write(": keepalive\n\n");
    }, 25000);
    req.on("close", () => {
      clearInterval(keepAlive);
      clients.delete(res);
      if (clients.size === 0) rooms.delete(room);
    });
    return;
  }

  if (req.method === "POST" && req.url === "/chat") {
    try {
      const packet = await readJson(req);
      const room = (packet.room || "lobby:general").toString().slice(0, 80);
      if ((packet.type || "chat").toString() === "typing") {
        const outTyping = {
          type: "typing",
          room,
          clientId: (packet.clientId || "").toString().slice(0, 64),
          username: (packet.username || "").toString().slice(0, 32),
          typing: {
            state: (packet.typing?.state || "composing").toString().slice(0, 24),
            active: packet.typing?.active !== false,
            ts: packet.typing?.ts || new Date().toISOString(),
            authorUsername: (packet.typing?.authorUsername || packet.username || "guest").toString().slice(0, 24),
            authorDisplay: (packet.typing?.authorDisplay || "").toString().slice(0, 32)
          }
        };
        broadcast(room, outTyping);
        res.writeHead(204, { "access-control-allow-origin": "*" });
        res.end();
        return;
      }
      const out = {
        type: "chat",
        room,
        clientId: (packet.clientId || "").toString().slice(0, 64),
        guildName: (packet.guildName || "").toString().slice(0, 40),
        channelName: (packet.channelName || "").toString().slice(0, 40),
        message: {
          id: (packet.message?.id || `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`).toString().slice(0, 80),
          text: (packet.message?.text || "").toString().slice(0, 400),
          ts: packet.message?.ts || new Date().toISOString(),
          authorUsername: (packet.message?.authorUsername || "guest").toString().slice(0, 24),
          authorDisplay: (packet.message?.authorDisplay || "").toString().slice(0, 32),
          attachments: Array.isArray(packet.message?.attachments) ? packet.message.attachments.slice(0, 4) : []
        }
      };
      broadcast(room, out);
      res.writeHead(204, { "access-control-allow-origin": "*" });
      res.end();
    } catch {
      res.writeHead(400, { "content-type": "application/json", "access-control-allow-origin": "*" });
      res.end(JSON.stringify({ ok: false, error: "invalid payload" }));
    }
    return;
  }

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "POST,GET,OPTIONS",
      "access-control-allow-headers": "content-type"
    });
    res.end();
    return;
  }

  res.writeHead(404, { "content-type": "text/plain" });
  res.end("Not found");
});

server.listen(port, host, () => {
  // eslint-disable-next-line no-console
  console.log(`http relay listening on http://${host}:${port}`);
});
