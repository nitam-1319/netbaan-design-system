#!/usr/bin/env node
/**
 * verify-tokens.mjs — HARD GATE for token integrity.
 *
 * Catches the class of bug that kept recurring (a `var(--foo)` referenced in a
 * component but DEFINED BY NOBODY — e.g. the `--track` groove, which silently
 * rendered nothing). This is objective and airtight: it flags a `var(--x)` only
 * when x is
 *   - used WITHOUT a fallback (`var(--x)`, not `var(--x, …)`), AND
 *   - not defined in src/index.css, AND
 *   - not set in the same component file (arbitrary property `[--x:…]`,
 *     `style={{"--x":…}}`, or `setProperty("--x", …)`), AND
 *   - not a known Base UI / Tailwind runtime variable (set by the library at
 *     render time — see RUNTIME below).
 *
 * Usage:
 *   node .agent/scripts/verify-tokens.mjs         # audit the whole library
 * Exit 0 = clean. Exit 1 = at least one dangling token reference.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";

// Both stylesheet entry points. Neither declares tokens itself — each is a list
// of @imports — so the definitions must be collected by FOLLOWING those imports
// (see collectDefined). Reading only the entry file finds zero declarations and
// reports every var() in the library as dangling.
const ENTRIES = ["src/index.css", "src/styles.css"];
const UI = "src/components/ui";

for (const entry of ENTRIES) {
  if (!existsSync(entry)) {
    console.error(`Missing ${entry}`);
    process.exit(1);
  }
}

/**
 * Collect every `--x:` declaration reachable from an entry stylesheet, following
 * RELATIVE @import chains (`@import "./theme.css"`, `@import url("./theme.css")`).
 * Bare specifiers (`tailwindcss`, `shadcn/tailwind.css`) and remote URLs are not
 * followed — anything those legitimately provide belongs in RUNTIME below.
 */
function collectDefined(entries) {
  const defined = new Set();
  const seen = new Set();
  const queue = entries.map((e) => resolve(e));

  while (queue.length) {
    const file = queue.shift();
    if (seen.has(file) || !existsSync(file)) continue;
    seen.add(file);

    const css = readFileSync(file, "utf8");
    for (const m of css.matchAll(/--([a-z0-9-]+)\s*:/gi)) {
      defined.add(m[1].toLowerCase());
    }

    // @import "./x.css" | @import url("./x.css") | @import './x.css' layer(...)
    for (const m of css.matchAll(/@import\s+(?:url\(\s*)?["']([^"']+)["']/gi)) {
      const spec = m[1];
      if (!spec.startsWith(".")) continue; // bare package or remote
      queue.push(resolve(dirname(file), spec));
    }
  }
  return { defined, files: seen };
}

const { defined, files: cssFiles } = collectDefined(ENTRIES);

// 2) Variables the runtime (Base UI positioner/collapsible/tabs, Tailwind, and
//    our own pointer handler) sets on the fly — legitimately not in the CSS.
const RUNTIME = new Set([
  // Base UI positioner
  "transform-origin", "anchor-width", "anchor-height",
  "available-width", "available-height",
  // Base UI collapsible / accordion / tabs
  "accordion-panel-height", "collapsible-panel-height",
  "active-tab-width", "active-tab-left", "active-tab-height", "active-tab-top",
  // Tailwind internals + our theme radius alias
  "spacing", "radius",
  // Card pointer spotlight (also always used WITH a fallback)
  "mx", "my",
  // per-instance control radius knob used via [--r:…]
  "r",
]);

const files = readdirSync(UI)
  .filter((f) => f.endsWith(".tsx") && !f.endsWith(".stories.tsx"))
  .sort();

let violations = 0;
const report = [];

for (const file of files) {
  const src = readFileSync(join(UI, file), "utf8");

  // Vars SET within this file (so a component may define + consume its own var).
  const setHere = new Set();
  for (const m of src.matchAll(/\[--([a-z0-9-]+)\s*:/gi)) setHere.add(m[1].toLowerCase()); // [--x:…]
  for (const m of src.matchAll(/["'`]--([a-z0-9-]+)["'`]\s*:/gi)) setHere.add(m[1].toLowerCase()); // style={{"--x":…}}
  for (const m of src.matchAll(/setProperty\(\s*["'`]--([a-z0-9-]+)/gi)) setHere.add(m[1].toLowerCase()); // setProperty("--x")

  // Every var() reference; capture whether it has a fallback.
  for (const m of src.matchAll(/var\(\s*--([a-z0-9-]+)\s*([,)])/gi)) {
    const name = m[1].toLowerCase();
    const hasFallback = m[2] === ",";
    if (hasFallback) continue;
    if (defined.has(name) || setHere.has(name) || RUNTIME.has(name)) continue;
    violations++;
    report.push(`  ${file}  →  var(--${name})  is defined by nobody (no fallback)`);
  }
}

console.log("Token integrity check (dangling var(--*) references):\n");
console.log(
  `  Scanned ${cssFiles.size} stylesheet(s), ${defined.size} token(s) defined; ` +
    `${files.length} component(s).\n`
);
if (violations === 0) {
  console.log("  All var(--*) references resolve ✓");
  process.exit(0);
}
report.forEach((r) => console.log(r));
console.error(
  `\nTOKEN INTEGRITY FAILED — ${violations} dangling reference(s). Define the token in ` +
    `src/theme.css, add a fallback \`var(--x, …)\`, or (if the library sets it) add it to RUNTIME.`
);
process.exit(1);
