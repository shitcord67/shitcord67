#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const XEPS_CSV = path.join(ROOT, "data", "xep", "xeps.csv");
const IMPL_CSV = path.join(ROOT, "data", "xep", "implementation_counts.csv");
const SUPPORTED_XEPS_MD = path.join(ROOT, "SUPPORTED_XEPS.md");
const OUTPUT_MD = path.join(ROOT, "XEP_WISHLIST_ALL.md");
const OUTPUT_CSV = path.join(ROOT, "data", "xep", "xep_wishlist_all.csv");
const OUTPUT_STATUS_MD = path.join(ROOT, "XEP_STATUS_INDEX.md");
const OUTPUT_STATUS_CSV = path.join(ROOT, "data", "xep", "xep_status_index.csv");

const STATUS_ORDER = [
  "Final",
  "Stable",
  "Active",
  "Experimental",
  "Proposed",
  "Deferred",
  "Deprecated",
  "Obsolete",
  "Rejected",
  "Retracted",
  "ProtoXEP",
  "Unknown"
];

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
  const s = normalizeStatus(status).toLowerCase();
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

function normalizeStatus(status) {
  const raw = (status || "").toString().trim();
  if (!raw) return "Unknown";
  if (/^protoxep$/i.test(raw) || /^protoxep$/i.test(raw.replace(/\s+/g, ""))) return "ProtoXEP";
  return raw;
}

function statusSortKey(status) {
  const normalized = normalizeStatus(status);
  const index = STATUS_ORDER.findIndex((entry) => entry.toLowerCase() === normalized.toLowerCase());
  return index >= 0 ? index : STATUS_ORDER.length + 1;
}

function compareByXepTag(a, b) {
  const aNum = Number(a.number || 0);
  const bNum = Number(b.number || 0);
  const aHas = Number.isFinite(aNum) && aNum > 0;
  const bHas = Number.isFinite(bNum) && bNum > 0;
  if (aHas && bHas && aNum !== bNum) return aNum - bNum;
  if (aHas && !bHas) return -1;
  if (!aHas && bHas) return 1;
  return a.xepTag.localeCompare(b.xepTag);
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
  const lowValueStatus = /(obsolete|retracted|rejected|historical)/i.test(normalizeStatus(status));
  const legacyTitle = /(bytestream|stream initiation|si file transfer|message events)/i.test(title || "");
  if (lowValueStatus || legacyTitle) return "Avoid";
  if (/protoxep/i.test(normalizeStatus(status)) && implementationCount <= 4) return "Avoid";
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
  if (/(obsolete|retracted|rejected|historical)/i.test(normalizeStatus(status))) return "Low ecosystem value and/or superseded by newer approaches.";
  if (/(bytestream|stream initiation|si file transfer|message events)/.test(t)) return "Legacy mechanism with low payoff for modern web/electron transport architecture.";
  if (/protoxep/i.test(normalizeStatus(status)) && implementationCount <= 1) return "Very early and low-adoption proposal; monitor maturity before major investment.";
  return "Useful, but currently lower priority than security, call interop, and transport reliability work.";
}

function replacementAvailabilityNote(status) {
  const s = normalizeStatus(status).toLowerCase();
  if (["deprecated", "obsolete", "retracted", "rejected", "deferred"].some((token) => s.includes(token))) {
    return "Not provided by source CSV; inspect XEP page for superseding guidance.";
  }
  return "-";
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
    const status = normalizeStatus(row.status || "");
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
      reason,
      replacement: replacementAvailabilityNote(status)
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
  const statusCounts = new Map();
  all.forEach((row) => {
    statusCounts.set(row.status, (statusCounts.get(row.status) || 0) + 1);
  });
  const statusSummaryLines = [...statusCounts.entries()]
    .sort((a, b) => {
      const keyDiff = statusSortKey(a[0]) - statusSortKey(b[0]);
      if (keyDiff !== 0) return keyDiff;
      return a[0].localeCompare(b[0]);
    })
    .map(([status, count]) => `- ${status}: ${count}`);

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
    "Lifecycle statuses present in this dataset:",
    ...statusSummaryLines,
    "",
    "Dormant handling:",
    "- `Dormant` is not currently emitted as a literal status in this xmpp.org export.",
    "- The closest practical bucket is `Deferred`; see `XEP_STATUS_INDEX.md` for grouped status views.",
    "",
    "Deprecated/Obsolete handling:",
    "- Deprecated/obsolete/retracted/rejected entries are explicitly listed and filterable in `XEP_STATUS_INDEX.md` and `data/xep/xep_status_index.csv`.",
    "- Source CSV does not include superseding-XEP metadata, so replacement guidance requires checking each XEP page.",
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

  const byStatus = new Map();
  all.forEach((row) => {
    const key = row.status || "Unknown";
    const current = byStatus.get(key) || [];
    current.push(row);
    byStatus.set(key, current);
  });
  const sortedStatuses = [...byStatus.keys()].sort((a, b) => {
    const keyDiff = statusSortKey(a) - statusSortKey(b);
    if (keyDiff !== 0) return keyDiff;
    return a.localeCompare(b);
  });
  const statusDocLines = [
    "# XEP Status Index (All xmpp.org Rows)",
    "",
    `Generated from: \`data/xep/xeps.csv\` at ${generatedAt}.`,
    "",
    "This file is sorted by lifecycle status buckets so deferred/deprecated/obsolete sets are easy to audit.",
    "",
    "Status buckets present:",
    ...sortedStatuses.map((status) => `- ${status}: ${byStatus.get(status)?.length || 0}`),
    "",
    "Dormant note:",
    "- xmpp.org export currently does not include a literal `Dormant` status bucket.",
    "- Treat `Deferred` as the closest maintenance-planning bucket.",
    ""
  ];
  for (const status of sortedStatuses) {
    const entries = (byStatus.get(status) || []).slice().sort(compareByXepTag);
    statusDocLines.push(`## ${status} (${entries.length})`);
    statusDocLines.push("");
    statusDocLines.push("| XEP | Title | Action | Score | Project State | Replacement / Superseding Note |");
    statusDocLines.push("|---|---|---|---|---|---|");
    entries.forEach((entry) => {
      const titleCell = entry.url ? `[${entry.title}](${entry.url})` : entry.title;
      statusDocLines.push(
        `| ${entry.xepTag} | ${titleCell} | ${entry.action} | ${entry.score.toFixed(2)} | ${entry.state} | ${entry.replacement} |`
      );
    });
    statusDocLines.push("");
  }
  fs.writeFileSync(OUTPUT_STATUS_MD, `${statusDocLines.join("\n")}\n`, "utf8");

  const statusCsvHeader = [
    "status",
    "xep_tag",
    "number",
    "title",
    "url",
    "action",
    "score",
    "project_state",
    "replacement_note"
  ];
  const statusCsvLines = [statusCsvHeader.join(",")];
  sortedStatuses.forEach((status) => {
    const entries = (byStatus.get(status) || []).slice().sort(compareByXepTag);
    entries.forEach((entry) => {
      statusCsvLines.push([
        status,
        entry.xepTag,
        entry.number,
        entry.title,
        entry.url,
        entry.action,
        entry.score.toFixed(2),
        entry.state,
        entry.replacement
      ].map(toCsvCell).join(","));
    });
  });
  fs.writeFileSync(OUTPUT_STATUS_CSV, `${statusCsvLines.join("\n")}\n`, "utf8");

  // eslint-disable-next-line no-console
  console.log(`Generated ${OUTPUT_MD}, ${OUTPUT_CSV}, ${OUTPUT_STATUS_MD}, and ${OUTPUT_STATUS_CSV} with ${all.length} rows.`);
}

main();
