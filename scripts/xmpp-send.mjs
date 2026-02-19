#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { WebSocket } from "ws";
import { client, xml } from "@xmpp/client";

globalThis.WebSocket = WebSocket;

function readConfig(configPath) {
  try {
    const raw = fs.readFileSync(configPath, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`Failed to read config at ${configPath}: ${String(error.message || error)}`);
  }
}

function parseJid(jid) {
  const token = (jid || "").toString().trim();
  const at = token.indexOf("@");
  if (at < 1) return null;
  return { local: token.slice(0, at), domain: token.slice(at + 1) };
}

async function main() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const defaultConfig = path.join(root, ".xmpp.local.json");
  const args = process.argv.slice(2);

  let configPath = defaultConfig;
  let target = "";
  let body = "";
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--config") {
      configPath = path.resolve(args[i + 1] || "");
      i += 1;
      continue;
    }
    if (arg === "--to") {
      target = (args[i + 1] || "").trim();
      i += 1;
      continue;
    }
    if (arg === "--message") {
      body = (args[i + 1] || "").trim();
      i += 1;
    }
  }

  const config = readConfig(configPath);
  const account = config?.account || {};
  const parsed = parseJid(account.jid);
  if (!parsed) throw new Error("Invalid account.jid in config.");
  const service = (account.service || "").toString().trim();
  if (!service) throw new Error("Missing account.service in config.");
  const password = (account.password || "").toString();
  if (!password) throw new Error("Missing account.password in config.");
  const to = target || (config?.contacts?.primary || "").toString().trim();
  if (!to) throw new Error("No recipient provided. Use --to or contacts.primary in config.");
  const message = body || `Hello from shitcord67 (${new Date().toISOString()})`;

  const xmpp = client({
    service,
    domain: parsed.domain,
    username: parsed.local,
    password,
    resource: (account.resource || "shitcord67-send").toString().slice(0, 40)
  });

  await new Promise((resolve, reject) => {
    let finished = false;
    const timeout = setTimeout(() => {
      if (finished) return;
      finished = true;
      reject(new Error("Timed out waiting for XMPP send."));
    }, 15000);

    xmpp.on("error", (error) => {
      if (finished) return;
      finished = true;
      clearTimeout(timeout);
      reject(new Error(`XMPP error: ${String(error?.message || error)}`));
    });

    xmpp.on("online", async (jid) => {
      try {
        await xmpp.send(xml("presence"));
        await xmpp.send(xml("message", { to, type: "chat" }, xml("body", {}, message)));
        if (finished) return;
        finished = true;
        clearTimeout(timeout);
        console.log(`Sent from ${jid.toString()} to ${to}`);
        resolve();
      } catch (error) {
        if (finished) return;
        finished = true;
        clearTimeout(timeout);
        reject(error);
      }
    });

    xmpp.start().catch((error) => {
      if (finished) return;
      finished = true;
      clearTimeout(timeout);
      reject(error);
    });
  });
  await xmpp.stop();
}

main().catch((error) => {
  console.error(String(error?.message || error));
  process.exit(1);
});
