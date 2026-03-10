#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const TARGETS = [
  path.join(ROOT_DIR, 'android', 'capacitor-cordova-android-plugins', 'build.gradle'),
  path.join(ROOT_DIR, 'android', 'app', 'capacitor.build.gradle'),
  path.join(ROOT_DIR, 'node_modules', '@capacitor', 'android', 'capacitor', 'build.gradle'),
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

function stripBuildscriptImplementationFileTree(lines) {
  const output = [];
  let inBuildscript = false;
  let buildscriptDepth = 0;
  let inBuildscriptDependencies = false;
  let dependenciesDepth = 0;

  for (const line of lines) {
    const opens = (line.match(/\{/g) || []).length;
    const closes = (line.match(/\}/g) || []).length;

    if (!inBuildscript && /^\s*buildscript\s*\{/.test(line)) {
      inBuildscript = true;
      buildscriptDepth = opens - closes;
      output.push(line);
      continue;
    }

    if (inBuildscript) {
      if (!inBuildscriptDependencies && /^\s*dependencies\s*\{/.test(line)) {
        inBuildscriptDependencies = true;
        dependenciesDepth = opens - closes;
        output.push(line);
        continue;
      }

      if (
        inBuildscriptDependencies &&
        /^\s*implementation\s+fileTree\(\s*dir:\s*'libs'\s*,\s*include:\s*\[\s*'\*\.jar'\s*,\s*'\*\.aar'\s*\]\s*\)\s*$/.test(line)
      ) {
        dependenciesDepth += opens - closes;
        if (dependenciesDepth <= 0) {
          inBuildscriptDependencies = false;
          dependenciesDepth = 0;
        }
        continue;
      }

      output.push(line);

      if (inBuildscriptDependencies) {
        dependenciesDepth += opens - closes;
        if (dependenciesDepth <= 0) {
          inBuildscriptDependencies = false;
          dependenciesDepth = 0;
        }
      }

      buildscriptDepth += opens - closes;
      if (buildscriptDepth <= 0) {
        inBuildscript = false;
        inBuildscriptDependencies = false;
        buildscriptDepth = 0;
        dependenciesDepth = 0;
      }
      continue;
    }

    output.push(line);
  }

  return output;
}

function findLastDependenciesBlock(lines) {
  const indices = [];
  for (let i = 0; i < lines.length; i += 1) {
    if (/^\s*dependencies\s*\{/.test(lines[i])) {
      indices.push(i);
    }
  }
  if (indices.length === 0) {
    return null;
  }

  const start = indices[indices.length - 1];
  let depth = 0;
  for (let i = start; i < lines.length; i += 1) {
    const line = lines[i];
    depth += (line.match(/\{/g) || []).length;
    depth -= (line.match(/\}/g) || []).length;
    if (i > start && depth <= 0) {
      return { start, end: i };
    }
  }

  return null;
}

function ensureFileTreeDeps(lines) {
  const depBlock = findLastDependenciesBlock(lines);
  if (!depBlock) {
    return lines;
  }

  const depLines = lines.slice(depBlock.start, depBlock.end + 1);
  const hasSrc = depLines.some((line) =>
    /implementation\s+fileTree\(\s*dir:\s*'src\/main\/libs'/.test(line)
  );
  const hasRoot = depLines.some((line) =>
    /implementation\s+fileTree\(\s*dir:\s*'libs'/.test(line)
  );
  if (hasSrc && hasRoot) {
    return lines;
  }

  const indentMatch = lines[depBlock.start].match(/^(\s*)/);
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
  next.splice(depBlock.start + 1, 0, ...formatted);
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

function forceJavaCompatibility(lines, version = '17') {
  const target = `JavaVersion.VERSION_${version}`;
  return lines.map((line) => {
    if (/sourceCompatibility\s+JavaVersion\.VERSION_\d+/.test(line)) {
      return line.replace(/JavaVersion\.VERSION_\d+/, target);
    }
    if (/targetCompatibility\s+JavaVersion\.VERSION_\d+/.test(line)) {
      return line.replace(/JavaVersion\.VERSION_\d+/, target);
    }
    return line;
  });
}

function patchFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return false;
  }
  const original = fs.readFileSync(filePath, 'utf8');
  let lines = original.split(/\r?\n/);
  lines = removeFlatDirBlock(lines);
  lines = stripBuildscriptImplementationFileTree(lines);
  lines = ensureAarIncludes(lines);
  lines = ensureFileTreeDeps(lines);
  lines = forceJavaCompatibility(lines, '17');
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
