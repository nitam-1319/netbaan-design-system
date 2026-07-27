#!/usr/bin/env node
// audit-checks.mjs — runtime story checks for the AEGIS audit loop.
//
// For each story of the given component(s), loads it in a real Chromium (the
// story's `play` function auto-runs on load) and reports:
//   - render/interaction errors  (uncaught exceptions + console.error — catches
//     broken stories and failing play/assertions)
//   - accessibility violations   (axe-core injected + run on #storybook-root),
//     run in BOTH dark and light so contrast is checked per WCAG AA in each theme.
//
// Prereq: `npm run build-storybook` (uses ./storybook-static). Companion to
// audit-visual.mjs (screenshots). Uses the sandbox Chromium via executablePath.
//
// Usage:
//   node .agent/scripts/audit-checks.mjs button card
//   node .agent/scripts/audit-checks.mjs --themes dark,light --json button
//   node .agent/scripts/audit-checks.mjs --out .agent/audit/checks.json button card
// Exits 0 always (report), 2 on setup failure. Presence of findings is in the report.

import { createServer } from "node:http"
import { readFile } from "node:fs/promises"
import { existsSync } from "node:fs"
import { writeFileSync } from "node:fs"
import { extname, join, resolve } from "node:path"
import { chromium } from "playwright"

const ROOT = resolve(process.cwd())
const STATIC = join(ROOT, "storybook-static")
const INDEX = join(STATIC, "index.json")
const AXE = join(ROOT, "node_modules", "axe-core", "axe.min.js")
const MIME = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".woff": "font/woff", ".ttf": "font/ttf", ".map": "application/json", ".ico": "image/x-icon" }

const args = process.argv.slice(2)
const opts = { themes: ["dark", "light"], names: [], json: false, out: null }
for (let i = 0; i < args.length; i++) {
  const a = args[i]
  if (a === "--themes") opts.themes = args[++i].split(",")
  else if (a === "--json") opts.json = true
  else if (a === "--out") opts.out = args[++i]
  else opts.names.push(a)
}
if (!existsSync(INDEX)) { console.error("[audit-checks] run `npm run build-storybook` first (no storybook-static/index.json)."); process.exit(2) }
if (!existsSync(AXE)) { console.error("[audit-checks] axe-core not found at node_modules/axe-core/axe.min.js"); process.exit(2) }

const index = JSON.parse(await readFile(INDEX, "utf8"))
const entries = Object.values(index.entries || index.stories || {}).filter((e) => e.type === "story")

const server = createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(req.url.split("?")[0]); if (p === "/") p = "/index.html"
    const file = join(STATIC, p); if (!file.startsWith(STATIC)) { res.writeHead(403); return res.end() }
    const buf = await readFile(file)
    res.writeHead(200, { "content-type": MIME[extname(file)] || "application/octet-stream" }); res.end(buf)
  } catch { res.writeHead(404); res.end("not found") }
})
await new Promise((r) => server.listen(0, r))
const base = `http://127.0.0.1:${server.address().port}`

const chromePath = ["/opt/pw-browsers/chromium", "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"].find((p) => existsSync(p))
const browser = await chromium.launch(chromePath ? { executablePath: chromePath } : {})
const axeSrc = await readFile(AXE, "utf8")

const names = opts.names.length ? opts.names : ["*"]
const report = []
try {
  for (const name of names) {
    const stories = name === "*" ? entries : entries.filter((e) => e.id.startsWith(`components-${name}--`))
    if (!stories.length) { console.warn(`[audit-checks] no stories for "${name}"`); continue }
    for (const s of stories) {
      const rec = { id: s.id, name: s.name, errors: [], a11y: [] }
      for (const theme of opts.themes) {
        const page = await browser.newPage({ viewport: { width: 1100, height: 800 } })
        const errs = []
        // Environmental noise: the sandbox blocks external fetches (e.g. the
        // Vazirmatn webfont), which surfaces as resource-load errors on every
        // story. Those are not component bugs — keep only real JS/app errors.
        const isNoise = (t) => /Failed to load resource|net::ERR_|ERR_TUNNEL|favicon|Download the React DevTools/i.test(t)
        page.on("console", (m) => { if (m.type() === "error" && !isNoise(m.text())) errs.push(m.text().slice(0, 300)) })
        page.on("pageerror", (e) => { const t = (e.message || e).toString(); if (!isNoise(t)) errs.push(`pageerror: ${t.slice(0, 300)}`) })
        try {
          await page.goto(`${base}/iframe.html?id=${s.id}&viewMode=story&globals=theme:${theme};locale:en`, { waitUntil: "networkidle", timeout: 20000 })
          await page.waitForTimeout(900) // let the play function run
          await page.addScriptTag({ content: axeSrc })
          const result = await page.evaluate(async () => {
            const root = document.querySelector("#storybook-root") || document.body
            const r = await window.axe.run(root, { resultTypes: ["violations"] })
            return r.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length }))
          })
          for (const v of result) {
            // dedupe across themes but keep contrast per-theme (it is theme-specific)
            const key = v.id === "color-contrast" ? `${v.id}@${theme}` : v.id
            if (!rec.a11y.some((x) => x._key === key)) rec.a11y.push({ ...v, theme: v.id === "color-contrast" ? theme : "any", _key: key })
          }
        } catch (e) {
          errs.push(`load-failed: ${(e.message || e).toString().slice(0, 200)}`)
        }
        for (const e of errs) if (!rec.errors.includes(e)) rec.errors.push(e)
        await page.close()
      }
      rec.a11y.forEach((v) => delete v._key)
      report.push(rec)
    }
  }
} finally {
  await browser.close(); server.close()
}

const flat = { stories: report.length, storiesWithErrors: report.filter((r) => r.errors.length).length, storiesWithA11y: report.filter((r) => r.a11y.length).length, report }
if (opts.out) { writeFileSync(opts.out, JSON.stringify(flat, null, 2)); console.error(`[audit-checks] wrote ${opts.out}`) }
if (opts.json) { console.log(JSON.stringify(flat, null, 2)); process.exit(0) }

console.log(`\nRuntime checks — ${flat.stories} stor(y/ies): ${flat.storiesWithErrors} with errors, ${flat.storiesWithA11y} with a11y violations\n`)
for (const r of report.filter((r) => r.errors.length || r.a11y.length)) {
  console.log(`• ${r.id}`)
  for (const e of r.errors) console.log(`    ❌ error: ${e}`)
  for (const v of r.a11y) console.log(`    ♿ ${v.impact || "?"} ${v.id}${v.theme !== "any" ? ` [${v.theme}]` : ""} — ${v.help} (${v.nodes} node${v.nodes === 1 ? "" : "s"})`)
}
console.log("")
