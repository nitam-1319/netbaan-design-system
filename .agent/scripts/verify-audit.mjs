#!/usr/bin/env node
/**
 * verify-audit.mjs — STATIC audit triage for the AEGIS component library.
 *
 * This is NOT a pass/fail CI gate. It is a cheap, deterministic FIRST PASS that
 * flags likely issues per component so the (expensive) model + browser review is
 * spent only where there's a real lead. Every finding is a *candidate* the audit
 * loop must verify before fixing — machines catch the bulk, the model confirms.
 *
 * Checks (per component <name>.tsx + <name>.stories.tsx):
 *   - hardcoded-color   Tailwind palette utilities (bg-red-500…), arbitrary hex
 *                       (bg-[#fff]), or raw #rgb / rgb() / hsl() / oklch() in class
 *                       strings — the design system must use semantic tokens.
 *   - closed-api        props type doesn't strip className/style via Omit<…>, or the
 *                       component destructures/accepts className|style (leak).
 *   - missing-state-story  a stateful prop exists (disabled/loading/error/invalid/
 *                       readOnly) but no story exercises it.
 *   - no-play-test      the stories file has no `play:` interaction test.
 *   - no-autodocs       the stories meta is missing tags:["autodocs"].
 *   - no-data-slot      the .tsx never sets a data-slot (styling/anchor hook missing).
 *
 * Usage:
 *   node .agent/scripts/verify-audit.mjs                 # scan all, human summary
 *   node .agent/scripts/verify-audit.mjs button card     # scan specific components
 *   node .agent/scripts/verify-audit.mjs --json          # machine-readable to stdout
 *   node .agent/scripts/verify-audit.mjs --out FILE       # write JSON report to FILE
 * Always exits 0 (triage, not a gate) unless it cannot read the source tree.
 */
import { readFileSync, readdirSync, existsSync, writeFileSync } from "node:fs"
import { join } from "node:path"

const UI = "src/components/ui"
if (!existsSync(UI)) { console.error(`Missing ${UI}`); process.exit(2) }

const argv = process.argv.slice(2)
const asJson = argv.includes("--json")
const outIdx = argv.indexOf("--out")
const outFile = outIdx >= 0 ? argv[outIdx + 1] : null
const nameFilter = argv.filter((a) => !a.startsWith("--") && a !== outFile)

const PALETTE = "red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone"
const RE = {
  paletteUtil: new RegExp(`\\b(?:bg|text|border|ring|fill|stroke|from|to|via|divide|outline|decoration|shadow|caret|accent)-(?:${PALETTE})-\\d{2,3}\\b`, "g"),
  arbitraryHex: /\[#[0-9a-fA-F]{3,8}\]/g,
  rawColorFn: /\b(?:rgb|rgba|hsl|hsla|oklch|oklab)\(/g,
  bwUtil: /\b(?:bg|text|border|ring|fill|stroke)-(?:white|black)\b/g,
}

// strip line + block comments so we don't flag documentation / spec references
function decomment(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/[^\n]*/g, "$1")
}

const files = readdirSync(UI).filter((f) => f.endsWith(".tsx") && !f.endsWith(".stories.tsx"))
const components = files
  .map((f) => f.replace(/\.tsx$/, ""))
  .filter((n) => nameFilter.length === 0 || nameFilter.includes(n))
  .sort()

const report = []
for (const name of components) {
  const tsxPath = join(UI, `${name}.tsx`)
  const storyPath = join(UI, `${name}.stories.tsx`)
  const tsxRaw = readFileSync(tsxPath, "utf8")
  const tsx = decomment(tsxRaw)
  const story = existsSync(storyPath) ? readFileSync(storyPath, "utf8") : null
  const findings = []
  const add = (severity, check, detail) => findings.push({ severity, check, detail })

  // --- hardcoded colors ---
  for (const [check, re, sev] of [["paletteUtil", RE.paletteUtil, "high"], ["arbitraryHex", RE.arbitraryHex, "high"], ["rawColorFn", RE.rawColorFn, "high"], ["bwUtil", RE.bwUtil, "info"]]) {
    const hits = [...new Set((tsx.match(re) || []))]
    if (hits.length) add(sev, "hardcoded-color", `${check}: ${hits.slice(0, 8).join(", ")}`)
  }

  // --- closed API ---
  // Reliable static signal: a closed component strips className/style via
  // `Omit<…, "className" | "style">`. Its absence is a *verify* lead, not proof —
  // pure composites that take no primitive props legitimately have none. (A real
  // className leak is hard to distinguish statically from internal
  // `useRender({…className…})` calls, so the model confirms this one.)
  const stripsClassName = /Omit<[\s\S]{0,200}?["']className["']/.test(tsx)
  // Only a lead when the component actually EXTENDS a DOM/primitive props type
  // (so className/style could leak). A pure composite with a bespoke prop type
  // takes no primitive props and is closed by construction — not a finding.
  const extendsDomProps =
    /(?:React\.|useRender\.)?ComponentProps<|HTMLAttributes<|HTMLProps<|DetailedHTMLProps</.test(tsx)
  if (extendsDomProps && !stripsClassName)
    add("medium", "closed-api", "extends DOM/primitive props without `Omit<… \"className\" | \"style\">` — verify the public API is closed")

  // --- data-slot ---
  // Match BOTH the JSX attribute form (`data-slot="x"`) and the props-object form
  // used by Base UI `useRender` (`"data-slot": "x"`), so useRender components
  // aren't false-flagged.
  if (!/["']?data-slot["']?\s*[:=]/.test(tsx))
    add("medium", "no-data-slot", "no data-slot attribute set (styling/anchor hook + test selector missing)")

  // --- stories ---
  if (!story) {
    add("high", "no-stories", "no .stories.tsx file")
  } else {
    if (!/play\s*:/.test(story)) add("medium", "no-play-test", "stories file has no `play:` interaction test")
    if (!/tags\s*:\s*\[[^\]]*["']autodocs["']/.test(story)) add("low", "no-autodocs", 'meta missing tags: ["autodocs"]')
    // stateful props present but not exercised by a story
    const STATES = ["disabled", "loading", "error", "invalid", "readOnly", "required"]
    for (const st of STATES) {
      const propDeclared = new RegExp(`\\b${st}\\??\\s*:\\s*(boolean|string)`).test(tsx) || new RegExp(`\\b${st}\\b`).test(tsx.match(/type\s+\w*Props[\s\S]*?\n\}/)?.[0] || "")
      if (!propDeclared) continue
      const exercised = new RegExp(`${st}\\s*[:=]`, "i").test(story) || new RegExp(`name:\\s*["'][^"']*${st}`, "i").test(story)
      if (!exercised) add("medium", "missing-state-story", `\`${st}\` prop exists but no story exercises it`)
    }
  }

  const worst = findings.reduce((w, f) => Math.min(w, { high: 0, medium: 1, low: 2, info: 3 }[f.severity]), 4)
  report.push({ name, severity: ["high", "medium", "low", "info", "clean"][worst], count: findings.length, findings })
}

// --- output ---
const summary = {
  scanned: report.length,
  withFindings: report.filter((r) => r.findings.length).length,
  bySeverity: ["high", "medium", "low", "info"].reduce((o, s) => ((o[s] = report.filter((r) => r.findings.some((f) => f.severity === s)).length), o), {}),
  components: report,
}

if (outFile) { writeFileSync(outFile, JSON.stringify(summary, null, 2)); console.error(`[verify-audit] wrote ${outFile}`) }
if (asJson) { console.log(JSON.stringify(summary, null, 2)); process.exit(0) }

// human summary
const rank = { high: "🔴", medium: "🟠", low: "🟡", info: "⚪", clean: "✅" }
console.log(`\nAudit triage — ${summary.scanned} component(s) scanned, ${summary.withFindings} with findings`)
console.log(`  high:${summary.bySeverity.high}  medium:${summary.bySeverity.medium}  low:${summary.bySeverity.low}  info:${summary.bySeverity.info}\n`)
for (const r of report.filter((r) => r.findings.length).sort((a, b) => ({ high: 0, medium: 1, low: 2, info: 3, clean: 4 }[a.severity] - { high: 0, medium: 1, low: 2, info: 3, clean: 4 }[b.severity]))) {
  console.log(`${rank[r.severity]} ${r.name}`)
  for (const f of r.findings) console.log(`     [${f.severity}] ${f.check}: ${f.detail}`)
}
console.log("")
