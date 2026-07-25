#!/usr/bin/env node
/**
 * verify-conformance.mjs — HARD GATE for reference fidelity + design-language hygiene.
 *
 * HYGIENE (every component in src/components/ui): no hard-coded shadow/color literals,
 *   no shadcn default focus ring (`ring-ring/50`). This enforces the AEGIS language across
 *   the WHOLE library, not just the reference set.
 * STRUCTURE (manifest components only): required variants/tones/sizes/shape/status keys +
 *   the signature animation.
 *
 * Usage:
 *   node .agent/scripts/verify-conformance.mjs            # audit the whole library
 *   node .agent/scripts/verify-conformance.mjs <name>     # gate a single component (build loop)
 *
 * Exit 0 = all checked components conform. Exit 1 = at least one violation.
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const UI = "src/components/ui";
const MANIFEST = ".agent/references/spec-manifest.json";

if (!existsSync(MANIFEST)) {
  console.error(`Missing ${MANIFEST} — cannot verify conformance.`);
  process.exit(1);
}
const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
const only = process.argv[2];

const esc = (s) => s.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
const keyPresent = (src, key) =>
  new RegExp(`["'\\s]${esc(key)}["']?\\s*:\\s*["'\\[{]`).test(src) ||
  new RegExp(`\\b${esc(key)}\\s*:\\s*["'\\[{]`).test(src);

// name -> manifest entry (by file basename), so a file can be looked up either way.
const byFile = {};
for (const [name, spec] of Object.entries(manifest.components)) {
  byFile[spec.file.replace(/\.tsx$/, "")] = { name, spec };
}

function hygiene(src, lines) {
  const v = [];
  for (const rule of manifest.universal.forbidden) {
    const re = new RegExp(rule.pattern);
    lines.forEach((ln, i) => {
      if (re.test(ln)) v.push(`L${i + 1} [hygiene] ${rule.message}  (${ln.trim().slice(0, 66)})`);
    });
  }
  return v;
}

function structure(src, spec) {
  const v = [];
  const groups = [
    ["variant", spec.requiredVariants],
    ["tone", spec.requiredTones],
    ["size", spec.requiredSizes],
    ["shape", spec.requiredShape],
    ["status", spec.requiredStatus],
  ];
  for (const [label, keys] of groups) {
    if (!keys) continue;
    const missing = keys.filter((k) => !keyPresent(src, String(k)));
    if (missing.length) v.push(`[structure] missing ${label}(s): ${missing.join(", ")}`);
  }
  if (spec.signatureAnimation && !src.includes(spec.signatureAnimation)) {
    v.push(`[motion] missing signature animation \`${spec.signatureAnimation}\` (see ${spec.reference})`);
  }
  return v;
}

// Build the list of component basenames to check.
const allFiles = readdirSync(UI)
  .filter((f) => f.endsWith(".tsx") && !f.endsWith(".stories.tsx"))
  .map((f) => f.replace(/\.tsx$/, ""))
  .sort();

const targets = only ? [only.replace(/\.tsx$/, "")] : allFiles;

let anyFail = false;
let checkedHyg = 0;
let failedCount = 0;
const failing = [];

console.log("Reference-conformance + hygiene check:\n");
for (const base of targets) {
  const file = join(UI, `${base}.tsx`);
  if (!existsSync(file)) {
    // Might be referenced by manifest name rather than file basename.
    const m = manifest.components[base];
    if (m && !existsSync(join(UI, m.file))) {
      console.log(`  ${base.padEnd(16)} —  not built yet`);
      continue;
    }
    console.error(`  ${base.padEnd(16)} ✗ no source file`);
    anyFail = true;
    continue;
  }
  const src = readFileSync(file, "utf8");
  const lines = src.split("\n");
  const violations = hygiene(src, lines);
  const mapped = byFile[base];
  if (mapped) violations.push(...structure(src, mapped.spec));
  checkedHyg++;
  if (violations.length === 0) {
    if (only) console.log(`  ${base.padEnd(16)} ✓ CONFORMS`);
  } else {
    anyFail = true;
    failedCount++;
    failing.push(base);
    console.log(`  ${base.padEnd(16)} ✗ ${violations.length}`);
    for (const x of violations) console.log(`       - ${x}`);
  }
}

console.log(`\nChecked ${checkedHyg} component(s); ${failedCount} with violations.`);
if (!only && failing.length) console.log(`Failing: ${failing.join(", ")}`);
if (anyFail) {
  console.error("\nCONFORMANCE FAILED — bring the component(s) into line with the reference.");
  process.exit(1);
}
console.log("All checked components conform.");
