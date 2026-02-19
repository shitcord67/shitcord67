#!/usr/bin/env node
import http from "node:http";
import { WebSocketServer } from "ws";

const port = Number(process.env.PORT || 8787);
const host = process.env.HOST || "0.0.0.0";
const clients = new Map();

function sendPacket(ws, packet) {
  try {
    ws.send(JSON.stringify(packet));
  } catch {
    // Ignore send errors from stale sockets.
  }
}

function broadcastToRoom(room, packet, except = null) {
  clients.forEach((meta, ws) => {
    if (ws.readyState !== ws.OPEN) return;
    if (except && ws === except) return;
    if (meta.room !== room) return;
    sendPacket(ws, packet);
  });
}

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: true, clients: clients.size }));
    return;
  }
  res.writeHead(404, { "content-type": "text/plain" });
  res.end("Not found");
});

const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  clients.set(ws, { room: "", username: "guest", clientId: "" });

  sendPacket(ws, { type: "hello", ts: new Date().toISOString() });

  ws.on("message", (raw) => {
    let packet = null;
    try {
      packet = JSON.parse(raw.toString());
    } catch {
      return;
    }
    if (!packet || typeof packet !== "object") return;

    const meta = clients.get(ws);
    if (!meta) return;

    if (packet.type === "join") {
      const room = (packet.room || "").toString().trim().slice(0, 80) || "lobby:general";
      meta.room = room;
      meta.username = (packet.username || "guest").toString().trim().slice(0, 32) || "guest";
      meta.clientId = (packet.clientId || "").toString().trim().slice(0, 64);
      clients.set(ws, meta);
      sendPacket(ws, { type: "joined", room, ts: new Date().toISOString() });
      return;
    }

    if (packet.type === "chat") {
      const room = (packet.room || meta.room || "").toString().trim().slice(0, 80);
      if (!room) return;
      const out = {
        type: "chat",
        room,
        clientId: (packet.clientId || meta.clientId || "").toString().trim().slice(0, 64),
        guildName: (packet.guildName || "").toString().slice(0, 40),
        channelName: (packet.channelName || "").toString().slice(0, 40),
        message: {
          id: (packet.message?.id || `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`).toString().slice(0, 80),
          text: (packet.message?.text || "").toString().slice(0, 400),
          ts: packet.message?.ts || new Date().toISOString(),
          authorUsername: (packet.message?.authorUsername || meta.username || "guest").toString().slice(0, 24),
          authorDisplay: (packet.message?.authorDisplay || "").toString().slice(0, 32),
          attachments: Array.isArray(packet.message?.attachments)
            ? packet.message.attachments
              .slice(0, 4)
              .map((entry) => ({
                type: (entry?.type || "image").toString().slice(0, 16),
                url: (entry?.url || "").toString().slice(0, 640),
                name: (entry?.name || "file").toString().slice(0, 80),
                format: (entry?.format || "image").toString().slice(0, 24)
              }))
            : []
        }
      };
      broadcastToRoom(room, out);
    }
  });

  ws.on("close", () => {
    clients.delete(ws);
  });
});

server.listen(port, host, () => {
  // eslint-disable-next-line no-console
  console.log(`ws relay listening on ws://${host}:${port}`);
});
