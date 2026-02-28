#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const XEPS_CSV = path.join(ROOT, "data", "xep", "xeps.csv");
const IMPL_CSV = path.join(ROOT, "data", "xep", "implementation_counts.csv");
const SUPPORTED_XEPS_MD = path.join(ROOT, "SUPPORTED_XEPS.md");
const OUTPUT_MD = path.join(ROOT, "XEP_WISHLIST_ALL.md");
const OUTPUT_CSV = path.join(ROOT, "data", "xep", "xep_wishlist_all.csv");

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];
    if (inQuotes) {
      if (ch === "\"" && next === "\"") {
        cell += "\"";
        i += 1;
      } else if (ch === "\"") {
        inQuotes = false;
      } else {
        cell += ch;
      }
      continue;
    }
    if (ch === "\"") {
      inQuotes = true;
      continue;
    }
    if (ch === ",") {
      row.push(cell);
      cell = "";
      continue;
    }
    if (ch === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }
    if (ch === "\r") continue;
    cell += ch;
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

function readCsvObjects(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const rows = parseCsv(raw);
  if (rows.length === 0) return [];
  const header = rows[0];
  return rows.slice(1).map((row) => {
    const obj = {};
    header.forEach((key, index) => {
      obj[key] = (row[index] || "").toString();
    });
    return obj;
  });
}

function parseSupportedXepState(mdText) {
  const out = new Map();
  const lines = mdText.split(/\r?\n/);
  const rowPattern = /^\|\s*XEP-(\d{4})\s*\|[^|]*\|\s*(Implemented|Partial|Planned)\s*\|/;
  for (const line of lines) {
    const match = line.match(rowPattern);
    if (!match) continue;
    const number = String(Number(match[1]));
    out.set(number, match[2]);
  }
  return out;
}

function scoreStatus(status) {
  const s = (status || "").toLowerCase();
  if (s.includes("final")) return 1.1;
  if (s.includes("active")) return 0.9;
  if (s.includes("stable")) return 0.8;
  if (s.includes("draft")) return 0.4;
  if (s.includes("experimental")) return 0.25;
  if (s.includes("proposed")) return 0.15;
  if (s.includes("deferred")) return -0.45;
  if (s.includes("obsolete") || s.includes("retracted") || s.includes("rejected")) return -2.4;
  if (s.includes("protoxep")) return -0.9;
  return 0;
}

function scoreType(type) {
  const t = (type || "").toLowerCase();
  if (t.includes("standards track")) return 1.15;
  if (t.includes("informational")) return 0.45;
  if (t.includes("best practice")) return 0.7;
  if (t.includes("historical")) return -1.25;
  if (t.includes("humorous")) return -0.6;
  return 0;
}

function scoreKeywords(title) {
  const t = (title || "").toLowerCase();
  let score = 0;
  if (/(omemo|encryption|encrypted|crypto|authentication|auth|sasl|tls|security)/.test(t)) score += 2.4;
  if (/(jingle|webrtc|audio|video|rtp|call|voice|screen|media)/.test(t)) score += 1.9;
  if (/(message|chat|presence|roster|muc|bookmark|archive|reply|reaction|retract)/.test(t)) score += 1.1;
  if (/(avatar|profile|vcard|nick)/.test(t)) score += 1.0;
  if (/(push|notification|mobile)/.test(t)) score += 1.4;
  if (/(file|upload|reference|sharing|oob|thumbnail)/.test(t)) score += 1.1;
  if (/(space|spaces|channel|server)/.test(t)) score += 0.9;
  if (/(bytestream|stream initiation|si file transfer|message events)/.test(t)) score -= 2.8;
  if (/(legacy|obsolete|deprecated)/.test(t)) score -= 1.2;
  return score;
}

function deriveAction({
  state,
  score,
  status,
  type,
  title,
  implementationCount
}) {
  if (state === "Implemented") return "Maintain";
  if (state === "Partial" || state === "Planned") return "Implement";
  if (/(historical|humorous)/i.test(type || "")) return "Avoid";
  const lowValueStatus = /(obsolete|retracted|rejected|historical)/i.test(status || "");
  const legacyTitle = /(bytestream|stream initiation|si file transfer|message events)/i.test(title || "");
  if (lowValueStatus || legacyTitle) return "Avoid";
  if (/protoxep/i.test(status || "") && implementationCount <= 4) return "Avoid";
  if (score >= 7) return "Implement";
  if (score >= 4.2) return "Defer";
  return "Avoid";
}

function deriveReason({
  state,
  title,
  status,
  type,
  implementationCount
}) {
  const t = (title || "").toLowerCase();
  if (state === "Implemented") return "Already implemented in shitcord67; keep maintained for interop and regressions.";
  if (state === "Partial") return "Partially implemented already; finishing this closes known interop and UX gaps.";
  if (state === "Planned") return "Already tracked in project roadmap; implementation is aligned with current direction.";
  if (/(historical|humorous)/i.test(type || "")) return "Marked historical/humorous, so implementation value is generally low for core product goals.";
  if (/(omemo|encryption|auth|sasl|tls|security)/.test(t)) return "High trust and security impact for everyday messaging use.";
  if (/(jingle|webrtc|audio|video|rtp|call|voice|screen)/.test(t)) return "High realtime interoperability impact, especially with Movim and other modern clients.";
  if (/(push|notification|mobile)/.test(t)) return "Important for reliable background/mobile delivery and user retention.";
  if (/(file|upload|sharing|reference|thumbnail|oob)/.test(t)) return "Strong media/file UX payoff and broad cross-client compatibility value.";
  if (implementationCount >= 30) return "Widely implemented in ecosystem; high compatibility return for moderate effort.";
  if (/(obsolete|retracted|rejected|historical)/i.test(status || "")) return "Low ecosystem value and/or superseded by newer approaches.";
  if (/(bytestream|stream initiation|si file transfer|message events)/.test(t)) return "Legacy mechanism with low payoff for modern web/electron transport architecture.";
  if (/protoxep/i.test(status || "") && implementationCount <= 1) return "Very early and low-adoption proposal; monitor maturity before major investment.";
  return "Useful, but currently lower priority than security, call interop, and transport reliability work.";
}

function padXepNumber(number) {
  const numeric = Number(number);
  if (!Number.isFinite(numeric) || numeric <= 0) return "";
  return String(Math.trunc(numeric)).padStart(4, "0");
}

function toCsvCell(value) {
  const raw = (value ?? "").toString();
  if (!/[",\n]/.test(raw)) return raw;
  return `"${raw.replaceAll("\"", "\"\"")}"`;
}

function main() {
  if (!fs.existsSync(XEPS_CSV) || !fs.existsSync(IMPL_CSV)) {
    throw new Error("Missing data/xep CSV sources. Run fetch step first.");
  }
  const xeps = readCsvObjects(XEPS_CSV);
  const implementationCounts = readCsvObjects(IMPL_CSV);
  const supportedStates = parseSupportedXepState(fs.readFileSync(SUPPORTED_XEPS_MD, "utf8"));

  const countByNumber = new Map();
  implementationCounts.forEach((row) => {
    const number = String(Number(row.number || 0));
    if (!number || number === "0") return;
    const count = Number(row.implementation_count || 0);
    countByNumber.set(number, Number.isFinite(count) ? count : 0);
  });

  const all = xeps.map((row) => {
    const numberRaw = (row.number || "").trim();
    const number = numberRaw ? String(Number(numberRaw)) : "";
    const xepTag = number
      ? `XEP-${padXepNumber(number)}`
      : `ProtoXEP-${String(Number(row.id || 0) || 0)}`;
    const title = (row.title || "").trim();
    const status = (row.status || "").trim();
    const type = (row.type || "").trim();
    const url = (row.url || "").trim();
    const implementationCount = number ? (countByNumber.get(number) || 0) : 0;
    const state = number ? (supportedStates.get(number) || "Unsupported") : "Unsupported";

    const scoreRaw = 1.2
      + Math.min(3, Math.log2(implementationCount + 1))
      + scoreStatus(status)
      + scoreType(type)
      + scoreKeywords(title)
      + (number ? 0 : -0.7);
    const score = Math.max(0, Math.min(10, Number(scoreRaw.toFixed(2))));
    const action = deriveAction({
      state,
      score,
      status,
      type,
      title,
      implementationCount
    });
    const reason = deriveReason({
      state,
      title,
      status,
      type,
      implementationCount
    });
    return {
      xepTag,
      number,
      title,
      status,
      type,
      url,
      implementationCount,
      state,
      score,
      action,
      reason
    };
  });

  const actionOrder = new Map([
    ["Implement", 0],
    ["Maintain", 1],
    ["Defer", 2],
    ["Avoid", 3]
  ]);

  all.sort((a, b) => {
    const actionDiff = (actionOrder.get(a.action) ?? 9) - (actionOrder.get(b.action) ?? 9);
    if (actionDiff !== 0) return actionDiff;
    if (b.score !== a.score) return b.score - a.score;
    return a.xepTag.localeCompare(b.xepTag);
  });

  const generatedAt = new Date().toISOString();
  const header = [
    "# XEP Wishlist (All xmpp.org Rows)",
    "",
    `Generated from: \`data/xep/xeps.csv\` + \`data/xep/implementation_counts.csv\` at ${generatedAt}.`,
    "",
    "Coverage:",
    `- Total rows from xmpp.org dataset: ${xeps.length}`,
    `- Rows with official XEP numbers: ${all.filter((row) => row.number).length}`,
    `- Rows without XEP number (ProtoXEP/inbox/etc.): ${all.filter((row) => !row.number).length}`,
    "",
    "Columns:",
    "- `Action`: `Implement`, `Maintain`, `Defer`, or `Avoid`.",
    "- `Project State`: current `shitcord67` state from `SUPPORTED_XEPS.md` where available.",
    "- `Score`: computed `0-10` implementation value score.",
    "",
    "| Rank | Action | Score | XEP | Title | xmpp.org Status | Type | Impl Count | Project State | Reason |",
    "|---|---|---|---|---|---|---|---|---|---|"
  ];

  const lines = [...header];
  all.forEach((row, index) => {
    const titleCell = row.url ? `[${row.title}](${row.url})` : row.title;
    lines.push(
      `| ${index + 1} | ${row.action} | ${row.score.toFixed(2)} | ${row.xepTag} | ${titleCell} | ${row.status || "-"} | ${row.type || "-"} | ${row.implementationCount} | ${row.state} | ${row.reason} |`
    );
  });
  fs.writeFileSync(OUTPUT_MD, `${lines.join("\n")}\n`, "utf8");

  const csvHeader = [
    "rank",
    "action",
    "score",
    "xep_tag",
    "number",
    "title",
    "url",
    "status",
    "type",
    "implementation_count",
    "project_state",
    "reason"
  ];
  const csvLines = [csvHeader.join(",")];
  all.forEach((row, index) => {
    csvLines.push([
      index + 1,
      row.action,
      row.score.toFixed(2),
      row.xepTag,
      row.number,
      row.title,
      row.url,
      row.status,
      row.type,
      row.implementationCount,
      row.state,
      row.reason
    ].map(toCsvCell).join(","));
  });
  fs.writeFileSync(OUTPUT_CSV, `${csvLines.join("\n")}\n`, "utf8");

  // eslint-disable-next-line no-console
  console.log(`Generated ${OUTPUT_MD} and ${OUTPUT_CSV} with ${all.length} rows.`);
}

main();
