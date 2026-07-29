#!/usr/bin/env node
// Phase 6: generate the AI-facing component catalog from component sources + .mdx docs.
//
// Emits:
//   catalog.json  — machine-readable array (one entry per component)
//   CATALOG.md    — human/AI index, grouped by category
//
// The catalog is the discovery + concept surface that lets an agent understand a
// component, know when to use it, see what it composes with, and — above all —
// find an existing component instead of rebuilding one. Generated (never hand-
// maintained) so it stays in sync. See docs/packaging-plan.md §5.
//
// Run: node .agent/scripts/build-catalog.mjs  (wired into `npm run build`)

import { readdirSync, readFileSync, writeFileSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const UI_DIR = "src/components/ui";

const isComponent = (n) =>
  n.endsWith(".tsx") && !n.endsWith(".stories.tsx") && !n.endsWith(".test.tsx");

const pascal = (mod) =>
  mod.replace(/(^|[-_])([a-z0-9])/g, (_, __, c) => c.toUpperCase());

// --- category inference (first matching rule wins; refine over time) -------
const CATEGORY_RULES = [
  ["charts", /chart|graph|plot|gauge|sparkline|heatmap|treemap|sankey|funnel|radar|donut|\baxis\b|choropleth|-map$|velocity|posture-score|grade-ring|scan-coverage/],
  ["forms", /input|field|select|checkbox|radio|switch|slider|textarea|combobox|picker|rating|toggle|segmented|dropzone|uploader|rich-text|otp|fieldset|choice-card|form/],
  ["overlays", /dialog|drawer|popover|tooltip|hover-card|\bmenu\b|context-menu|action-sheet|bottom-sheet|lightbox|command-palette|modal|notification-center/],
  ["navigation", /navbar|navigation|breadcrumb|pagination|tabs|sidebar|bottom-navigation|stepper|scrollspy|toolbar|masthead|app-bar|app-shell|skip-to-content/],
  ["feedback", /alert|callout|toast|badge|\btag\b|status-pill|status-indicator|spinner|skeleton|progress|empty-state|error-state|no-results|loading-overlay|validation-message|severity/],
  ["data-display", /table|\blist\b|description-list|timeline|tree|card|avatar|code-block|diff-viewer|\bkbd\b|stat-tile|expandable|row-selection|column-|sticky-header|virtualized|editable-cell|inline-edit|asset-row/],
  ["layout", /\bbox\b|\bgrid\b|\bstack\b|container|spacer|divider|aspect-ratio|masonry|scroll-area|resizable/],
  ["motion", /animate|fade-slide|scroll-reveal|stagger|beam-glow|marquee|count-up|typing-indicator/],
  ["auth", /login|sign-up|sso|two-factor|role-permission|onboarding|consent-banner|multi-step-form/],
  ["ai", /conversation|reasoning|tool-call|prompt|model-selector|response-feedback|suggestion-chips|token-meter|citation|message-bubble/],
  ["security", /attack-surface|cve|finding-vulnerability|ssl-cert|api-key|device-session/],
  ["utility", /portal|focus-trap|click-outside|visually-hidden|live-region|landmark|reduced-motion|lazy-loader|error-boundary|keyboard-shortcut|print-view|copy-to-clipboard|theme|locale-rtl|pull-to-refresh|swipe|carousel|floating-action|file-card|file-preview|file-list|attachment-chip/],
];
const categorize = (mod) => {
  for (const [cat, re] of CATEGORY_RULES) if (re.test(mod)) return cat;
  return "other";
};

// --- exports parsing -------------------------------------------------------
// Handles single declarations AND `export { ... }` / `export type { ... }`
// blocks, including multiline blocks ([^}] spans newlines).
function parseExports(src) {
  const values = new Set();
  const types = new Set();
  for (const m of src.matchAll(/^export\s+(?:const|function|class|abstract class)\s+([A-Za-z0-9_]+)/gm))
    values.add(m[1]);
  for (const m of src.matchAll(/^export\s+type\s+([A-Za-z0-9_]+)\s*[=<]/gm)) types.add(m[1]);
  for (const m of src.matchAll(/export\s+(type\s+)?\{([^}]*)\}/g)) {
    const blockIsType = !!m[1];
    for (const part of m[2].split(",")) {
      const raw = part.trim();
      if (!raw) continue;
      const isType = blockIsType || /^type\s/.test(raw);
      const name = raw.replace(/^type\s+/, "").split(/\s+as\s+/).pop().trim();
      if (name) (isType ? types : values).add(name);
    }
  }
  return { values: [...values], types: [...types] };
}

// components this component composes with (imports from @/components/ui/*)
function composesWith(src, self) {
  const set = new Set();
  const re = /@\/components\/ui\/([a-z0-9-]+)/g;
  let m;
  while ((m = re.exec(src))) if (m[1] !== self) set.add(pascal(m[1]));
  return [...set].sort();
}

// --- .mdx parsing: concept + do/don't -------------------------------------
const clean = (s) =>
  s.replace(/\s+/g, " ").replace(/\*\*/g, "").trim();

// A Do/Don't bullet, tightened for the catalog: drop the "use it to/for/as"
// filler lead (the Do/Don't label already carries that sense), drop a trailing
// period, and capitalise — so it reads cleanly under a "Do:" / "Don't:" label.
const cleanBullet = (s) => {
  const t = clean(s)
    .replace(/^use\s+(it\s+)?(to|for|as|when)\s+/i, "")
    .replace(/^use\s+/i, "")
    .replace(/\s*\.\s*$/, "");
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : t;
};

// Truncate at a word boundary (never mid-word) with an ellipsis.
const truncate = (s, n) => {
  if (s.length <= n) return s;
  const cut = s.slice(0, n);
  const at = cut.lastIndexOf(" ");
  return (at > 0 ? cut.slice(0, at) : cut).replace(/[,;:—-]\s*$/, "") + "…";
};

function parseMdx(md) {
  const lines = md.split("\n");
  let title = "";
  const conceptLines = [];
  let inConcept = false;
  const doList = [];
  const dontList = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const h1 = line.match(/^#\s+(.*)/);
    if (h1 && !title) {
      title = h1[1].trim();
      inConcept = true;
      continue;
    }
    if (inConcept) {
      if (/^##\s/.test(line)) inConcept = false;
      else if (line.trim()) conceptLines.push(line.trim());
    }
  }

  // Do / Don't bullets (may wrap across continuation lines).
  for (let i = 0; i < lines.length; i++) {
    const marker = lines[i].match(/^\s*[-*]\s+\*\*(Do|Don['’]?t)\*\*\s*(.*)/i);
    if (!marker) continue;
    const isDont = /^Don/i.test(marker[1]);
    let text = marker[2];
    for (let j = i + 1; j < lines.length; j++) {
      const cont = lines[j];
      if (!cont.trim() || /^\s*[-*]\s/.test(cont) || /^#/.test(cont)) break;
      text += " " + cont.trim();
    }
    (isDont ? dontList : doList).push(cleanBullet(text));
  }

  const concept = truncate(clean(conceptLines.join(" ")), 300);
  return { title, concept, do: doList.slice(0, 6), dont: dontList.slice(0, 6) };
}

// --- build -----------------------------------------------------------------
const files = readdirSync(UI_DIR)
  .filter((n) => statSync(join(UI_DIR, n)).isFile() && isComponent(n))
  .sort();

const entries = [];
for (const file of files) {
  const mod = file.replace(/\.tsx$/, "");
  const src = readFileSync(join(UI_DIR, file), "utf8");
  const mdxPath = join(UI_DIR, `${mod}.mdx`);
  const mdx = existsSync(mdxPath) ? parseMdx(readFileSync(mdxPath, "utf8")) : { title: "", concept: "", do: [], dont: [] };
  const { values, types } = parseExports(src);
  entries.push({
    name: pascal(mod),
    module: mod,
    category: categorize(mod),
    concept: mdx.concept,
    whenToUse: mdx.do,
    whenNotToUse: mdx.dont,
    composesWith: composesWith(src, mod),
    exports: values,
    typeExports: types,
    import: `import { ${pascal(mod)} } from "@netbaan/ui";`,
  });
}

writeFileSync("catalog.json", JSON.stringify(entries, null, 2) + "\n", "utf8");

// --- CATALOG.md: grouped, compact, AI-legible ------------------------------
const byCat = {};
for (const e of entries) (byCat[e.category] ||= []).push(e);
const catOrder = ["layout", "navigation", "forms", "overlays", "feedback", "data-display", "charts", "motion", "auth", "ai", "security", "utility", "other"];
const cats = [...new Set([...catOrder, ...Object.keys(byCat)])].filter((c) => byCat[c]);

let md = `# @netbaan/ui — Component Catalog\n\n`;
md += `AUTO-GENERATED by \`.agent/scripts/build-catalog.mjs\`. ${entries.length} components.\n\n`;
md += `> For AI agents: **consult this catalog before building any UI.** If a component here fits, use it — do not recreate it. Compose from existing components. Import via \`import { X } from "@netbaan/ui"\`. Components are sealed: no \`className\`, configure through typed props only.\n\n`;
md += `## Index\n\n`;
for (const cat of cats) {
  md += `**${cat}** — ${byCat[cat].map((e) => e.name).join(", ")}\n\n`;
}
md += `## Components\n\n`;
for (const cat of cats) {
  md += `### ${cat}\n\n`;
  for (const e of byCat[cat]) {
    md += `#### ${e.name}\n\n`;
    if (e.concept) md += `${e.concept}\n\n`;
    if (e.whenToUse.length) md += `- **Do:** ${e.whenToUse.join("; ")}\n`;
    if (e.whenNotToUse.length) md += `- **Don't:** ${e.whenNotToUse.join("; ")}\n`;
    if (e.composesWith.length) md += `- **Composes with:** ${e.composesWith.join(", ")}\n`;
    md += `- **Exports:** ${e.exports.join(", ") || e.name}\n\n`;
  }
}
writeFileSync("CATALOG.md", md, "utf8");

console.log(`Wrote catalog.json + CATALOG.md — ${entries.length} components across ${cats.length} categories.`);
const missing = entries.filter((e) => !e.concept).length;
if (missing) console.log(`  (${missing} components had no extractable concept)`);
