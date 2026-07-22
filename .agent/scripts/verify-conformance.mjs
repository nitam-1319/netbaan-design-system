#!/usr/bin/env node
/**
 * verify-conformance.mjs — HARD GATE for reference fidelity.
 *
 * Checks each built component in src/components/ui against the authoritative
 * contract in .agent/references/spec-manifest.json (derived from the AEGIS
 * reference pages under .agent/references/spec/). This is what stops the system
 * from silently drifting back to shadcn defaults.
 *
 * Two axes per component:
 *   HYGIENE   — no hard-coded shadow/color literals; no shadcn default focus ring.
 *   STRUCTURE — required variants / tones / sizes / shape / status keys exist,
 *               and the component references its signature animation utility.
 *
 * Usage:
 *   node .agent/scripts/verify-conformance.mjs            # audit every built component
 *   node .agent/scripts/verify-conformance.mjs <name>     # gate a single component (build loop)
 *
 * Exit 0 = all checked components conform. Exit 1 = at least one violation.
 * Wire into the hard gates (see .agent/guides/BUILD_GUIDE.md).
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const UI = "src/components/ui";
const MANIFEST = ".agent/references/spec-manifest.json";

if (!existsSync(MANIFEST)) {
  console.error(`Missing ${MANIFEST} — cannot verify conformance.`);
  process.exit(1);
}
const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
const only = process.argv[2];

// A CVA/props key like `primary:` or `sm:` present as an object key (followed by a
// string, array, or object) — distinguishes a variant KEY from an incidental class.
const keyPresent = (src, key) =>
  new RegExp(`["'\\s]${key.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}["']?\\s*:\\s*["'\\[{]`).test(src) ||
  new RegExp(`\\b${key.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\\s*:\\s*["'\\[{]`).test(src);

function checkComponent(name, spec) {
  const file = join(UI, spec.file);
  if (!existsSync(file)) return { name, built: false, violations: [] };
  const src = readFileSync(file, "utf8");
  const lines = src.split("\n");
  const violations = [];

  // HYGIENE — forbidden literals / wrong focus ring
  for (const rule of manifest.universal.forbidden) {
    const re = new RegExp(rule.pattern);
    lines.forEach((ln, i) => {
      if (re.test(ln)) violations.push(`L${i + 1} [hygiene] ${rule.message}  (${ln.trim().slice(0, 70)})`);
    });
  }

  // STRUCTURE — required keys must exist as variant/prop keys
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
    if (missing.length) violations.push(`[structure] missing ${label}(s): ${missing.join(", ")}`);
  }

  // SIGNATURE ANIMATION — must be referenced somewhere in the component
  if (spec.signatureAnimation && !src.includes(spec.signatureAnimation)) {
    violations.push(`[motion] does not use its signature animation \`${spec.signatureAnimation}\` (see ${spec.reference})`);
  }

  return { name, built: true, violations };
}

const names = only ? [only] : Object.keys(manifest.components);
let anyFail = false;
let checked = 0;

console.log("Reference-conformance check:\n");
for (const name of names) {
  const spec = manifest.components[name];
  if (!spec) { console.error(`Unknown component "${name}" (not in manifest).`); process.exit(1); }
  const res = checkComponent(name, spec);
  if (!res.built) {
    console.log(`  ${name.padEnd(10)} —  not built yet (spec on file: ${spec.reference})`);
    continue;
  }
  checked++;
  if (res.violations.length === 0) {
    console.log(`  ${name.padEnd(10)} ✓ CONFORMS`);
  } else {
    anyFail = true;
    console.log(`  ${name.padEnd(10)} ✗ ${res.violations.length} violation(s):`);
    for (const v of res.violations) console.log(`       - ${v}`);
  }
}

console.log(`\nChecked ${checked} built component(s).`);
if (anyFail) {
  console.error("CONFORMANCE FAILED — bring the component(s) into line with the reference before committing.");
  process.exit(1);
}
console.log("All checked components conform to the reference.");
