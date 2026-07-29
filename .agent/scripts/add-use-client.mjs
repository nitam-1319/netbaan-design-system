#!/usr/bin/env node
// Phase 1 codemod: prepend `"use client";` to every component source file.
//
// Rationale (see docs/packaging-plan.md §4/§6): the package targets Next.js
// App Router. A missing client boundary crashes consumers at runtime, while an
// over-marked pure component only costs a little client bundle. Stability-first:
// mark every component uniformly. Idempotent — skips files already directed.
//
// Scope: src/components/ui/*.tsx and src/components/*.tsx, excluding stories,
// tests, and type-only files. Run: node .agent/scripts/add-use-client.mjs

import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOTS = ["src/components/ui", "src/components"];
const DIRECTIVE = '"use client";';

const isComponent = (name) =>
  name.endsWith(".tsx") &&
  !name.endsWith(".stories.tsx") &&
  !name.endsWith(".test.tsx") &&
  !name.endsWith(".d.tsx");

const hasDirective = (src) => {
  // Directive must be the module's first statement. Allow a leading comment
  // block, then the first non-comment, non-blank line must be the directive.
  const withoutLeadingComments = src
    .replace(/^﻿/, "")
    .replace(/^(\s*(\/\/[^\n]*\n|\/\*[\s\S]*?\*\/\s*))*/, "");
  return /^["']use client["'];?/.test(withoutLeadingComments.trimStart());
};

let changed = 0;
let skipped = 0;
const touched = [];

for (const root of ROOTS) {
  let entries;
  try {
    entries = readdirSync(root);
  } catch {
    continue;
  }
  for (const name of entries) {
    const full = join(root, name);
    if (!statSync(full).isFile() || !isComponent(name)) continue;
    const src = readFileSync(full, "utf8");
    if (hasDirective(src)) {
      skipped++;
      continue;
    }
    writeFileSync(full, `${DIRECTIVE}\n\n${src}`, "utf8");
    changed++;
    touched.push(full);
  }
}

console.log(`use-client codemod: ${changed} modified, ${skipped} already had it.`);
if (touched.length) console.log(touched.join("\n"));
