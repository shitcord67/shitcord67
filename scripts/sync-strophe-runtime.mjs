#!/usr/bin/env node
import { mkdirSync, copyFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const source = resolve(root, "node_modules/strophe.js/dist/strophe.umd.min.js");
const target = resolve(root, "vendor/strophe.umd.min.js");

if (!existsSync(source)) {
  // eslint-disable-next-line no-console
  console.error(`strophe runtime source missing: ${source}`);
  process.exit(1);
}

mkdirSync(dirname(target), { recursive: true });
copyFileSync(source, target);
// eslint-disable-next-line no-console
console.log(`synced strophe runtime -> ${target}`);
