#!/usr/bin/env node
import { existsSync, statSync, writeFileSync } from "node:fs";
import { resolve, basename } from "node:path";
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);

function usage(code = 0) {
  const msg = `Usage: scripts/build-webxdc.mjs <source-dir> <output.xdc> [--init] [--name <name>] [--version <version>]

Build a WebXDC .xdc archive (zip) from a folder containing manifest.toml + index.html.

Options:
  --init           Create a minimal manifest.toml if missing.
  --name <name>    App name for --init (default: folder name).
  --version <ver>  App version for --init (default: 0.1.0).
  -h, --help       Show this help.
`;
  // eslint-disable-next-line no-console
  console[code === 0 ? "log" : "error"](msg);
  process.exit(code);
}

function parseArgs(values) {
  const flags = {
    init: false,
    name: "",
    version: ""
  };
  const positional = [];
  for (let i = 0; i < values.length; i += 1) {
    const token = values[i];
    if (token === "--init") {
      flags.init = true;
      continue;
    }
    if (token === "--name") {
      flags.name = values[i + 1] || "";
      i += 1;
      continue;
    }
    if (token === "--version") {
      flags.version = values[i + 1] || "";
      i += 1;
      continue;
    }
    if (token === "-h" || token === "--help") {
      usage(0);
    }
    positional.push(token);
  }
  return { flags, positional };
}

function ensureDirectory(path) {
  if (!existsSync(path)) {
    throw new Error(`Source directory not found: ${path}`);
  }
  const stats = statSync(path);
  if (!stats.isDirectory()) {
    throw new Error(`Source path must be a directory: ${path}`);
  }
}

function ensureManifest({ sourceDir, init, name, version }) {
  const manifestPath = resolve(sourceDir, "manifest.toml");
  if (existsSync(manifestPath)) return manifestPath;
  if (!init) {
    throw new Error(`manifest.toml missing in ${sourceDir} (use --init to create one)`);
  }
  const appName = name || basename(sourceDir);
  const appVersion = version || "0.1.0";
  const template = [
    `name = "${appName.replace(/\"/g, "")}"`,
    `version = "${appVersion.replace(/\"/g, "")}"`,
    "description = \"WebXDC app\"",
    "min_api_version = 1",
    "index = \"index.html\""
  ].join("\n");
  writeFileSync(manifestPath, `${template}\n`, "utf8");
  return manifestPath;
}

function ensureIndexHtml(sourceDir) {
  const indexPath = resolve(sourceDir, "index.html");
  if (!existsSync(indexPath)) {
    throw new Error(`index.html missing in ${sourceDir}`);
  }
  return indexPath;
}

function buildArchive(sourceDir, outputFile) {
  const outputPath = resolve(outputFile);
  const args = [
    "-r",
    "-q",
    outputPath,
    ".",
    "-x",
    "*/.git/*",
    "-x",
    "*/node_modules/*",
    "-x",
    "*/.DS_Store"
  ];
  const result = spawnSync("zip", args, { cwd: sourceDir, stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`zip failed with exit code ${result.status}`);
  }
  return outputPath;
}

try {
  const { flags, positional } = parseArgs(args);
  if (positional.length < 2) usage(1);
  const sourceDir = resolve(positional[0]);
  const outputFile = positional[1];
  ensureDirectory(sourceDir);
  ensureManifest({
    sourceDir,
    init: flags.init,
    name: flags.name,
    version: flags.version
  });
  ensureIndexHtml(sourceDir);
  const outputPath = buildArchive(sourceDir, outputFile);
  // eslint-disable-next-line no-console
  console.log(`WebXDC archive created: ${outputPath}`);
} catch (error) {
  // eslint-disable-next-line no-console
  console.error(error?.message || String(error));
  process.exit(1);
}
