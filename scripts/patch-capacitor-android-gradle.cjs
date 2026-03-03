#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const TARGETS = [
  path.join(ROOT_DIR, 'android', 'capacitor-cordova-android-plugins', 'build.gradle'),
];

function removeFlatDirBlock(lines) {
  const output = [];
  let skipping = false;
  let indent = '';
  for (const line of lines) {
    if (!skipping) {
      const match = line.match(/^(\s*)flatDir\s*\{/);
      if (match) {
        skipping = true;
        indent = match[1] || '';
        continue;
      }
      output.push(line);
      continue;
    }

    const endMatch = line.match(new RegExp(`^${indent}\\s*\\}`));
    if (endMatch) {
      skipping = false;
    }
  }
  return output;
}

function ensureFileTreeDeps(lines) {
  const hasSrc = lines.some((line) =>
    /implementation\s+fileTree\(\s*dir:\s*'src\/main\/libs'/.test(line)
  );
  const hasRoot = lines.some((line) =>
    /implementation\s+fileTree\(\s*dir:\s*'libs'/.test(line)
  );

  if (hasSrc && hasRoot) {
    return lines;
  }

  const depIndex = lines.findIndex((line) => /^\s*dependencies\s*\{/.test(line));
  if (depIndex === -1) {
    return lines;
  }

  const indentMatch = lines[depIndex].match(/^(\s*)/);
  const indent = `${(indentMatch && indentMatch[1]) || ''}    `;
  const additions = [];
  if (!hasSrc) {
    additions.push(`implementation fileTree(dir: 'src/main/libs', include: ['*.jar', '*.aar'])`);
  }
  if (!hasRoot) {
    additions.push(`implementation fileTree(dir: 'libs', include: ['*.jar', '*.aar'])`);
  }
  if (additions.length === 0) {
    return lines;
  }
  const formatted = additions.map((line) => `${indent}${line}`);
  const next = [...lines];
  next.splice(depIndex + 1, 0, ...formatted);
  return next;
}

function ensureAarIncludes(lines) {
  return lines.map((line) =>
    line.replace(
      /include:\s*\[\s*'\*\.jar'\s*\]/g,
      "include: ['*.jar', '*.aar']"
    )
  );
}

function patchFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return false;
  }
  const original = fs.readFileSync(filePath, 'utf8');
  let lines = original.split(/\r?\n/);
  lines = removeFlatDirBlock(lines);
  lines = ensureAarIncludes(lines);
  lines = ensureFileTreeDeps(lines);
  const updated = lines.join('\n');
  if (updated === original) {
    return false;
  }
  fs.writeFileSync(filePath, updated, 'utf8');
  return true;
}

let touched = 0;
for (const target of TARGETS) {
  if (patchFile(target)) {
    touched += 1;
  }
}

if (touched > 0) {
  console.log(`[patch-capacitor-android-gradle] updated ${touched} file(s)`);
}
