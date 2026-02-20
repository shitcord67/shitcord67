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

const optionalCopies = [
  {
    source: resolve(root, "node_modules/@ruffle-rs/ruffle/ruffle.js"),
    target: resolve(root, "vendor/ruffle/ruffle.js"),
    label: "ruffle runtime"
  },
  {
    source: resolve(root, "node_modules/@dotlottie/player-component/dist/dotlottie-player.mjs"),
    target: resolve(root, "vendor/dotlottie/dotlottie-player.mjs"),
    label: "dotlottie runtime"
  }
];

optionalCopies.forEach((entry) => {
  if (!existsSync(entry.source)) {
    // eslint-disable-next-line no-console
    console.log(`optional ${entry.label} source missing: ${entry.source}`);
    return;
  }
  mkdirSync(dirname(entry.target), { recursive: true });
  copyFileSync(entry.source, entry.target);
  // eslint-disable-next-line no-console
  console.log(`synced ${entry.label} -> ${entry.target}`);
});
