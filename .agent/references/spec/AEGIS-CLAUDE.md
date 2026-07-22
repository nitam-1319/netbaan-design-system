# CLAUDE.md — AEGIS Design System (persistent project rules)

> This file is auto-injected into **every** conversation in this project. It is the
> durable memory of the project. Read `PROJECT_KNOWLEDGE.md` for full context and
> `PROMPT_LIBRARY.md` for the reusable build prompts. Keep this file updated as
> decisions change.

## What this project is
AEGIS is a dark-first, enterprise-grade component design system. Each component ships
a full **20-point specification** and a live interactive page. `Component Inventory.dc.html`
is the approved blueprint (~230 components across 23 categories). `Home.dc.html` is the
browsable hub — live components light up green, planned ones are dimmed. Every component
lives in `Components/<Name>.dc.html`.

## Non-negotiable design tokens (copy these literally into every file)
Dark theme (default):
```
--bg:#09090b; --card:#0e0e12; --surface:#151319; --surface-2:#1b1922; --surface-3:#22202b;
--border:rgba(255,255,255,.07); --border-strong:rgba(255,255,255,.13);
--text:#eceaf2; --text-dim:#a29caf; --text-faint:#6e6880;
--accent:#9373d9; --accent-soft:rgba(147,115,217,.14); --accent-strong:#ab8ce8;
--track:rgba(255,255,255,.08); --shadow:0 18px 50px -18px rgba(0,0,0,.7);
```
Light theme:
```
--bg:#f6f6f9; --card:#ffffff; --surface:#ffffff; --surface-2:#f8f6fc; --surface-3:#efeaf7;
--border:rgba(24,20,34,.09); --border-strong:rgba(24,20,34,.15);
--text:#191622; --text-dim:#5f596e; --text-faint:#8d8799;
--accent:#7c53d4; --accent-soft:rgba(124,83,212,.10); --accent-strong:#6a44c0;
--track:rgba(24,20,34,.08); --shadow:0 18px 50px -22px rgba(90,68,150,.32);
```
Severity scale (data/ASM): Critical `#f0506e` · High `#f5872b` · Medium `#ecb22e` · Low `#3a97d4` · Info `#7d8798`.
Status/priority: success/live `#2fb680` · warning `#ecb22e` · Recommended uses `--accent-strong`.

## Typography
- Display / headings / component names: **Space Grotesk** (400–700).
- Body / UI / labels: **IBM Plex Sans** (400–700).
- Code / mono / eyebrow labels / badges: **IBM Plex Mono** (400–600).
- Font link (put in every `<helmet>`):
  `https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap`

## Radius scale
chips/badges 6px → controls 9–11px → cards 14–18px → masthead 20px.

## Signature motifs (always present, use consistently)
- **Beam masthead**: rotating `conic-gradient` behind a `--card` panel with 1.5px inset margin (`@keyframes beamSpin 6.5s linear infinite`). Purple accent sweep.
- **Pulse dot**: 7–8px accent dot with `@keyframes pulseDot 1.8s infinite` on status/legend rows.
- **AEGIS eyebrow**: mono `AEGIS` chip on `--accent`, white text, + `DESIGN SYSTEM / …` label in `--text-faint`.

## Hard rules — ALWAYS
- Every component page is a Design Component (`.dc.html`) authored via `dc_write`.
- Dark-first: `data-theme="{{ theme }}"` wrapper, theme toggle button, both palettes defined.
- Fixed canvas width (component pages use 1240px, matching Home/Inventory).
- Inline styles only, driven by the CSS variables above. The only `<helmet><style>` content
  is resets, `@font-face`/font links, `@keyframes`, and the `[data-theme]` token blocks.
- Every component page ends with a **back link to `../Home.dc.html`**.
- Every new live component must be wired into `Home.dc.html` (add its `href` in the `data`
  array so it flips from Planned → Live).
- Follow the full 20-point spec (see PROJECT_KNOWLEDGE.md) — no skipping sections.
- `text-wrap:pretty` on prose; flex/grid + `gap` for all layout (never whitespace/margins).

## Hard rules — NEVER
- Never use class-based CSS for component styling, Tailwind, or a tokens.js file — inline only.
- Never invent new brand colors; derive from the tokens above (oklch if a new shade is needed).
- Never use emoji as UI (the mono/geometric glyphs like ◇ ◉ ⬤ ◍ are the icon language).
- Never use gradient-soup backgrounds, Inter/Roboto/Arial, or left-border-accent card tropes.
- Never break the established page structure/order when adding a component — match siblings.

## Build order / status
See the "Build queue" section of `PROJECT_KNOWLEDGE.md`. Build one component at a time,
full spec, then wire into Home, then move to the next.
