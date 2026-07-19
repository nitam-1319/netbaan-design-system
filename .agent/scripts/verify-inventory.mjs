#!/usr/bin/env node
/**
 * verify-inventory.mjs
 * (1) Reconciles the component trackers against the filesystem so they can't quietly lie.
 * (2) COMPUTES per-component status from the filesystem + optional gate output — so nobody
 *     hand-types health percentages (see .agent/DECISIONS.md: "status is computed, never hand-typed").
 *
 * Structural axes (computed here, from disk):
 *   - impl : src/components/ui/<name>.tsx exists
 *   - story: src/components/ui/<name>.stories.tsx exists
 *   - docs : src/components/ui/<name>.mdx exists
 *
 * Runner axes (NOT invented — only filled if a gate report is present):
 *   - reads .agent/.gate-report.json if it exists, keyed by component name, e.g.
 *       { "button": { "playtests": "PASS", "a11y": "PASS", "vr": "HUMAN_VERIFY_REQUIRED" } }
 *   - any runner axis with no entry is reported as HUMAN_VERIFY_REQUIRED, never as PASS.
 *
 * Overall per component:
 *   - FAIL    if any structural axis is missing
 *   - PARTIAL if structural complete but a runner axis is FAILED/BLOCKED/unknown
 *   - PASS    only if every structural axis present AND every known runner axis is PASS
 *
 * Exit 0 = reconciled & no FAIL; exit 1 = drift or any FAIL. Wire into CI and the RELEASE gate.
 */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const UI_DIR = "src/components/ui";
const STATUS = ".agent/checklists/COMPONENTS_STATUS.md";
const GATE_REPORT = ".agent/.gate-report.json";
const RUNNER_AXES = ["playtests", "a11y", "vr"];

if (!existsSync(UI_DIR)) {
  console.error(`Cannot find ${UI_DIR} — run from repo root.`);
  process.exit(1);
}

const files = readdirSync(UI_DIR);
const components = [...new Set(
  files.filter(f => f.endsWith(".tsx") && !f.endsWith(".stories.tsx"))
       .map(f => f.replace(/\.tsx$/, ""))
)].sort();

const status = existsSync(STATUS) ? readFileSync(STATUS, "utf8") : "";
let gateReport = {};
if (existsSync(GATE_REPORT)) {
  try { gateReport = JSON.parse(readFileSync(GATE_REPORT, "utf8")); }
  catch { console.error(`Warning: ${GATE_REPORT} is not valid JSON; treating runner axes as unknown.`); }
}

let drift = false;
const rows = [];

for (const name of components) {
  // structural axes from disk
  const impl  = existsSync(join(UI_DIR, `${name}.tsx`));
  const story = existsSync(join(UI_DIR, `${name}.stories.tsx`));
  const docs  = existsSync(join(UI_DIR, `${name}.mdx`));

  // runner axes from gate report only (never invented)
  const gr = gateReport[name] || {};
  const runner = {};
  for (const axis of RUNNER_AXES) runner[axis] = gr[axis] || "HUMAN_VERIFY_REQUIRED";

  // overall
  let overall;
  if (!impl || !story || !docs) overall = "FAIL";
  else if (RUNNER_AXES.every(a => runner[a] === "PASS")) overall = "PASS";
  else overall = "PARTIAL";

  rows.push({ name, impl, story, docs, runner, overall });

  // reconciliation: on disk but not tracked
  if (!new RegExp(`\\b${name}\\b`, "i").test(status)) {
    console.error(`DRIFT: "${name}" exists on disk but is absent from COMPONENTS_STATUS.md`);
    drift = true;
  }
}

// reverse reconciliation: marked PASS in tracker but no source file
const passNames = [...status.matchAll(/\|\s*\d+\s*\|\s*([A-Za-z0-9]+)\s*\|.*?PASS/gi)].map(m => m[1]);
for (const name of passNames) {
  const onDisk = existsSync(join(UI_DIR, `${name}.tsx`)) ||
                 existsSync(join(UI_DIR, `${name.toLowerCase()}.tsx`));
  if (!onDisk) { console.error(`DRIFT: tracker marks "${name}" PASS but no source file exists`); drift = true; }
}

// report
const mark = b => (b ? "OK" : "--");
console.log("\nComponent status (computed):");
console.log("name".padEnd(20), "impl story docs  overall");
for (const r of rows) {
  console.log(
    r.name.padEnd(20),
    mark(r.impl).padEnd(5), mark(r.story).padEnd(6), mark(r.docs).padEnd(5),
    r.overall
  );
}

const counts = rows.reduce((a, r) => (a[r.overall] = (a[r.overall] || 0) + 1, a), {});
console.log(`\nTotals: ${rows.length} components — ` +
  `PASS ${counts.PASS||0}, PARTIAL ${counts.PARTIAL||0}, FAIL ${counts.FAIL||0}`);
if (!existsSync(GATE_REPORT)) {
  console.log(`Note: no ${GATE_REPORT} found — runner axes reported as HUMAN_VERIFY_REQUIRED (not PASS).`);
}

const anyFail = rows.some(r => r.overall === "FAIL");
if (drift || anyFail) {
  console.error(`\nInventory ${drift ? "drift" : "FAIL"} detected.`);
  process.exit(1);
}
console.log("\nOK — trackers reconcile and no component is in FAIL.");
