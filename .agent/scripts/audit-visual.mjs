#!/usr/bin/env node
// audit-visual.mjs — Playwright visual-capture harness for the AEGIS audit loop.
//
// Renders every story of the given component(s) into a single montage image
// per (theme × locale × viewport), so a reviewer reads ~4 images per component
// instead of dozens. Screenshots are written under .agent/audit/screens/<name>/.
//
// Prereq: `npm run build-storybook` has produced ./storybook-static (with index.json).
// Usage:
//   node .agent/scripts/audit-visual.mjs <component-kebab> [<component-kebab> ...]
//   node .agent/scripts/audit-visual.mjs --themes dark,light --locales en,fa \
//        --viewports desktop,mobile button card
//   node .agent/scripts/audit-visual.mjs --story components-button--primary   # single story, full page
//
// Exit 0 on success; non-zero on setup failure (missing build, no matching stories).

import { createServer } from "node:http"
import { readFile, mkdir, writeFile, rm } from "node:fs/promises"
import { existsSync } from "node:fs"
import { extname, join, resolve } from "node:path"
import { chromium } from "playwright"

const ROOT = resolve(process.cwd())
const STATIC = join(ROOT, "storybook-static")
const OUT = join(ROOT, ".agent", "audit", "screens")
const INDEX = join(STATIC, "index.json")

const VIEWPORTS = { desktop: { width: 1280, height: 900 }, mobile: { width: 390, height: 780 } }
const MIME = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".woff": "font/woff", ".ttf": "font/ttf", ".map": "application/json", ".ico": "image/x-icon" }

// ---- args ----
const args = process.argv.slice(2)
const opts = { themes: ["dark", "light"], locales: ["en", "fa"], viewports: ["desktop"], story: null, names: [] }
for (let i = 0; i < args.length; i++) {
  const a = args[i]
  if (a === "--themes") opts.themes = args[++i].split(",")
  else if (a === "--locales") opts.locales = args[++i].split(",")
  else if (a === "--viewports") opts.viewports = args[++i].split(",")
  else if (a === "--story") opts.story = args[++i]
  else opts.names.push(a)
}

if (!existsSync(INDEX)) {
  console.error("[audit-visual] storybook-static/index.json not found. Run `npm run build-storybook` first.")
  process.exit(2)
}

const index = JSON.parse(await readFile(INDEX, "utf8"))
const entries = Object.values(index.entries || index.stories || {}).filter((e) => e.type === "story")

// ---- static server ----
const server = createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(req.url.split("?")[0])
    if (p === "/") p = "/index.html"
    const file = join(STATIC, p)
    if (!file.startsWith(STATIC)) { res.writeHead(403); return res.end() }
    const buf = await readFile(file)
    res.writeHead(200, { "content-type": MIME[extname(file)] || "application/octet-stream" })
    res.end(buf)
  } catch {
    res.writeHead(404); res.end("not found")
  }
})
await new Promise((r) => server.listen(0, r))
const PORT = server.address().port
const base = `http://127.0.0.1:${PORT}`

// montage page: one labelled cell per story, each an iframe with the chosen globals
function montageHtml(stories, theme, locale, vw) {
  const cells = stories
    .map((s) => {
      const url = `/iframe.html?id=${encodeURIComponent(s.id)}&viewMode=story&globals=theme:${theme};locale:${locale}`
      const label = `${s.name}`.replace(/</g, "&lt;")
      return `<div class="cell"><div class="lbl">${label}</div><iframe loading="eager" src="${url}" width="${vw.width}"></iframe></div>`
    })
    .join("\n")
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    *{box-sizing:border-box} body{margin:0;background:#0b0a0f;font:12px/1.4 system-ui}
    .cell{border-bottom:1px solid #333}
    .lbl{color:#9aa;padding:4px 8px;font-weight:600;background:#141218}
    iframe{border:0;display:block;width:${vw.width}px;height:340px}
  </style></head><body>${cells}</body></html>`
}

// The repo's playwright version may not match the pre-installed browser build,
// so point at the sandbox's Chromium explicitly (override with AUDIT_CHROMIUM).
const CHROME_CANDIDATES = [
  process.env.AUDIT_CHROMIUM,
  "/opt/pw-browsers/chromium",
  "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
].filter(Boolean)
const executablePath = CHROME_CANDIDATES.find((p) => existsSync(p))
const browser = await chromium.launch(executablePath ? { executablePath } : {})
let captured = 0
try {
  // single-story full-page mode
  if (opts.story) {
    const s = entries.find((e) => e.id === opts.story)
    if (!s) { console.error(`[audit-visual] story not found: ${opts.story}`); process.exitCode = 3 }
    else {
      for (const theme of opts.themes) for (const locale of opts.locales) for (const vpName of opts.viewports) {
        const vw = VIEWPORTS[vpName]
        const page = await browser.newPage({ viewport: vw })
        await page.goto(`${base}/iframe.html?id=${s.id}&viewMode=story&globals=theme:${theme};locale:${locale}`, { waitUntil: "networkidle" })
        await page.waitForTimeout(700)
        const dir = join(OUT, s.id)
        await mkdir(dir, { recursive: true })
        const f = join(dir, `${theme}-${locale}-${vpName}.png`)
        await page.screenshot({ path: f, fullPage: true })
        await page.close(); captured++
        console.log(`  ✓ ${f.replace(ROOT + "/", "")}`)
      }
    }
  } else {
    const names = opts.names.length ? opts.names : ["*"]
    for (const name of names) {
      const stories = name === "*"
        ? entries
        : entries.filter((e) => e.id.startsWith(`components-${name}--`) || (e.title || "").toLowerCase() === `components/${name.replace(/-/g, " ")}`)
      if (!stories.length) { console.warn(`[audit-visual] no stories for "${name}"`); continue }
      const outdir = join(OUT, name)
      await mkdir(outdir, { recursive: true })
      const montagePath = join(STATIC, `__audit_montage_${name}.html`)
      for (const theme of opts.themes) for (const locale of opts.locales) for (const vpName of opts.viewports) {
        const vw = VIEWPORTS[vpName]
        await writeFile(montagePath, montageHtml(stories, theme, locale, vw))
        const page = await browser.newPage({ viewport: vw })
        await page.goto(`${base}/__audit_montage_${name}.html`, { waitUntil: "networkidle" })
        await page.waitForTimeout(900)
        const f = join(outdir, `${theme}-${locale}-${vpName}.png`)
        await page.screenshot({ path: f, fullPage: true })
        await page.close(); captured++
        console.log(`  ✓ ${name}: ${theme}/${locale}/${vpName} (${stories.length} stories) -> ${f.replace(ROOT + "/", "")}`)
      }
      await rm(montagePath, { force: true })
    }
  }
} finally {
  await browser.close()
  server.close()
}
console.log(`[audit-visual] captured ${captured} image(s) under .agent/audit/screens/`)
if (captured === 0) process.exitCode = 4
