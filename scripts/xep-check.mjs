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

function normalizeBareJid(jid) {
  const value = (jid || "").toString().trim();
  const slash = value.indexOf("/");
  if (slash < 0) return value;
  return value.slice(0, slash);
}

function uniqueList(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function resolveAccountList(config) {
  if (Array.isArray(config?.accounts)) return config.accounts.filter(Boolean);
  if (Array.isArray(config?.profiles)) return config.profiles.filter(Boolean);
  if (config?.account && typeof config.account === "object") return [config.account];
  return [];
}

function normalizeAccountEntry(entry = {}) {
  return {
    label: (entry.label || entry.name || entry.jid || "").toString(),
    jid: (entry.jid || entry.username || "").toString(),
    password: (entry.password || "").toString(),
    service: (entry.service || entry.ws || entry.websocket || "").toString(),
    resource: (entry.resource || "").toString()
  };
}

function isTtyInteractive() {
  return Boolean(process.stdin.isTTY && process.stdout.isTTY);
}

async function promptSelectAccount(accounts) {
  const list = accounts.map((entry, index) => {
    const label = entry.label || entry.jid || `account-${index + 1}`;
    return { index, label, jid: entry.jid || "" };
  });
  if (!isTtyInteractive()) {
    console.log("Available accounts:");
    list.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.label}${item.jid ? ` (${item.jid})` : ""}`);
    });
    throw new Error("Select an account using --account <index|jid|label>.");
  }
  const readline = await import("node:readline");
  readline.emitKeypressEvents(process.stdin);
  if (process.stdin.setRawMode) process.stdin.setRawMode(true);
  let selected = 0;
  const render = () => {
    process.stdout.write("\u001b[2J\u001b[H");
    process.stdout.write("Select XMPP account (use ↑/↓, Enter to confirm):\n");
    list.forEach((item, index) => {
      const prefix = index === selected ? "›" : " ";
      process.stdout.write(` ${prefix} ${item.label}${item.jid ? ` (${item.jid})` : ""}\n`);
    });
  };
  render();
  return new Promise((resolve, reject) => {
    const onKey = (_str, key) => {
      if (!key) return;
      if (key.name === "down") {
        selected = (selected + 1) % list.length;
        render();
        return;
      }
      if (key.name === "up") {
        selected = (selected - 1 + list.length) % list.length;
        render();
        return;
      }
      if (key.name === "return") {
        cleanup();
        resolve(list[selected].index);
        return;
      }
      if (key.ctrl && key.name === "c") {
        cleanup();
        reject(new Error("Cancelled."));
      }
    };
    const cleanup = () => {
      process.stdin.off("keypress", onKey);
      if (process.stdin.setRawMode) process.stdin.setRawMode(false);
      process.stdout.write("\u001b[2J\u001b[H");
    };
    process.stdin.on("keypress", onKey);
  });
}

function resolveAccountBySelector(accounts, selector = "") {
  if (!selector) return null;
  const token = selector.toString().trim().toLowerCase();
  if (!token) return null;
  const index = Number(token);
  if (Number.isFinite(index) && index > 0 && index <= accounts.length) return accounts[index - 1];
  return accounts.find((entry) => {
    const label = (entry.label || "").toString().toLowerCase();
    const jid = (entry.jid || "").toString().toLowerCase();
    return label === token || jid === token;
  }) || null;
}

const DISCO_NS = "http://jabber.org/protocol/disco#info";
const XEP_CHECKS = [
  { key: "xep-0030", label: "Service discovery", ns: "http://jabber.org/protocol/disco#info", target: "server" },
  { key: "xep-0045", label: "MUC", ns: "http://jabber.org/protocol/muc", target: "server" },
  { key: "xep-0085", label: "Chat states", ns: "http://jabber.org/protocol/chatstates", target: "server" },
  { key: "xep-0184", label: "Message delivery receipts", ns: "urn:xmpp:receipts", target: "server" },
  { key: "xep-0333", label: "Chat markers", ns: "urn:xmpp:chat-markers:0", target: "server" },
  { key: "xep-0280", label: "Message carbons", ns: "urn:xmpp:carbons:2", target: "server" },
  { key: "xep-0313", label: "MAM v2", ns: "urn:xmpp:mam:2", target: "server" },
  { key: "xep-0402", label: "Bookmarks v2", ns: "urn:xmpp:bookmarks:1", target: "account" },
  { key: "xep-0048", label: "Bookmarks legacy", ns: "storage:bookmarks", target: "account" },
  { key: "xep-0384", label: "OMEMO v2", ns: "urn:xmpp:omemo:2", target: "server" },
  { key: "xep-0363", label: "HTTP upload", ns: "urn:xmpp:http:upload:0", target: "server" }
];

function extractDiscoFeatures(stanza) {
  const query = stanza.getChild("query", DISCO_NS);
  if (!query) return [];
  return query.getChildren("feature").map((node) => node.attrs?.var).filter(Boolean);
}

function formatCheckLine(entry, has) {
  const status = has ? "ok" : "missing";
  return `${status.padEnd(8)} ${entry.label} (${entry.ns})`;
}

async function main() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const defaultConfig = path.join(root, ".xmpp.local.json");
  const args = process.argv.slice(2);

  let configPath = defaultConfig;
  let roomJid = "";
  let verbose = false;
  let accountSelector = "";
  let serviceOverride = "";
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--config") {
      configPath = path.resolve(args[i + 1] || "");
      i += 1;
      continue;
    }
    if (arg === "--room") {
      roomJid = (args[i + 1] || "").trim();
      i += 1;
      continue;
    }
    if (arg === "--account") {
      accountSelector = (args[i + 1] || "").trim();
      i += 1;
      continue;
    }
    if (arg === "--service") {
      serviceOverride = (args[i + 1] || "").trim();
      i += 1;
      continue;
    }
    if (arg === "--verbose") {
      verbose = true;
    }
  }

  const config = readConfig(configPath);
  const accountList = resolveAccountList(config).map(normalizeAccountEntry);
  if (accountList.length === 0) throw new Error("No accounts found in config.");
  let account = resolveAccountBySelector(accountList, accountSelector);
  if (!account) {
    if (accountList.length === 1) {
      account = accountList[0];
    } else {
      const index = await promptSelectAccount(accountList);
      account = accountList[index];
    }
  }
  const parsed = parseJid(account.jid);
  if (!parsed) throw new Error("Invalid account.jid in config.");
  const service = (serviceOverride || account.service || "").toString().trim();
  if (!service) throw new Error("Missing account.service in config.");
  const password = (account.password || "").toString();
  if (!password) throw new Error("Missing account.password in config.");

  const xmpp = client({
    service,
    domain: parsed.domain,
    username: parsed.local,
    password,
    resource: (account.resource || "shitcord67-xep-check").toString().slice(0, 40)
  });

  const pendingIq = new Map();

  function waitForIq(id, timeoutMs = 12000) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        pendingIq.delete(id);
        reject(new Error(`Timed out waiting for IQ ${id}`));
      }, timeoutMs);
      pendingIq.set(id, (stanza) => {
        clearTimeout(timeout);
        resolve(stanza);
      });
    });
  }

  xmpp.on("stanza", (stanza) => {
    if (stanza.is("iq")) {
      const id = stanza.attrs?.id;
      if (id && pendingIq.has(id)) {
        const resolve = pendingIq.get(id);
        pendingIq.delete(id);
        resolve(stanza);
      }
    }
  });

  await new Promise((resolve, reject) => {
    let finished = false;
    const timeout = setTimeout(() => {
      if (finished) return;
      finished = true;
      reject(new Error("Timed out waiting for XMPP login."));
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
        if (finished) return;
        finished = true;
        clearTimeout(timeout);
        console.log(`Connected as ${jid.toString()}`);
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

  const serverJid = parsed.domain;
  const accountBare = normalizeBareJid(account.jid);
  const targets = [
    { label: "server", jid: serverJid },
    { label: "account", jid: accountBare }
  ];
  if (roomJid) targets.push({ label: "room", jid: roomJid });

  const featureMap = new Map();

  for (const target of targets) {
    const iqId = `disco-${Math.random().toString(36).slice(2, 10)}`;
    const iq = xml("iq", { to: target.jid, type: "get", id: iqId }, xml("query", { xmlns: DISCO_NS }));
    await xmpp.send(iq);
    const result = await waitForIq(iqId);
    if (result.attrs?.type === "error") {
      console.error(`Disco failed for ${target.jid}`);
      featureMap.set(target.label, new Set());
      continue;
    }
    const features = extractDiscoFeatures(result);
    featureMap.set(target.label, new Set(features));
    if (verbose) {
      console.log(`\nFeatures for ${target.label} (${target.jid}):`);
      uniqueList(features).sort().forEach((feature) => console.log(`  ${feature}`));
    }
  }

  console.log("\nXEP capability summary:");
  const rows = XEP_CHECKS.map((entry) => {
    const targetFeatures = featureMap.get(entry.target) || new Set();
    const has = targetFeatures.has(entry.ns);
    return { entry, has };
  });
  rows.forEach(({ entry, has }) => {
    console.log(formatCheckLine(entry, has));
  });

  const missing = rows.filter((row) => !row.has).map((row) => row.entry);
  if (missing.length > 0) {
    console.log("\nMissing features:");
    missing.forEach((entry) => {
      console.log(`  - ${entry.label} (${entry.ns}) on ${entry.target}`);
    });
  } else {
    console.log("\nAll checked features present.");
  }

  await xmpp.stop();
}

main().catch((error) => {
  console.error(String(error?.message || error));
  process.exit(1);
});
