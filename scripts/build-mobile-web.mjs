#!/usr/bin/env node

import { mkdir, rm, cp, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const outDir = path.join(rootDir, ".mobile-web");

const requiredFiles = [
  "index.html",
  "app.js",
  "styles.css",
  "swf-index.json"
];

const requiredDirs = [
  "vendor"
];

async function exists(inputPath) {
  try {
    await stat(inputPath);
    return true;
  } catch {
    return false;
  }
}

async function copyRootEntry(name) {
  const source = path.join(rootDir, name);
  const target = path.join(outDir, name);
  await cp(source, target, { recursive: true });
}

async function buildMobileWebBundle() {
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  for (const file of requiredFiles) {
    const source = path.join(rootDir, file);
    if (!await exists(source)) {
      throw new Error(`Missing required web asset: ${file}`);
    }
    await copyRootEntry(file);
  }

  for (const dir of requiredDirs) {
    const source = path.join(rootDir, dir);
    if (!await exists(source)) {
      throw new Error(`Missing required web asset directory: ${dir}`);
    }
    await copyRootEntry(dir);
  }

  const rootEntries = await readdir(rootDir, { withFileTypes: true });
  for (const entry of rootEntries) {
    if (!entry.isFile()) continue;
    if (!entry.name.toLowerCase().endsWith(".swf")) continue;
    await copyRootEntry(entry.name);
  }
}

buildMobileWebBundle()
  .then(() => {
    console.log(`[mobile-build] wrote ${path.relative(rootDir, outDir)}`);
  })
  .catch((error) => {
    console.error(`[mobile-build] failed: ${error?.message || error}`);
    process.exitCode = 1;
  });
