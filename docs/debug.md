# AEGIS — audit & remediation spec (revised)

Revised against the actual codebase. Every claim below was checked against
`src/`; items that turned out to be false, already done, or net-negative have
been **removed** rather than carried forward. See
[Removed items](#removed-items-and-why) for what went and why.

Severity: **P0** ships broken · **P1** real defect · **P2** consistency · **P3** polish.

Status: ✅ done · ⏳ open

---

# Tier 1 — actual bugs

## ✅ A1 · P0 — No `forced-colors` handling

**Problem.** `grep forced-colors src/` returned nothing. Focus is expressed with
Tailwind `ring-*` at ~142 call sites (`ring-accent-soft` ×71, `ring-3` ×42,
`ring-[3px]` ×29), and `ring-*` compiles to `box-shadow`, which is suppressed
under `forced-colors` — so focus disappeared system-wide in Windows High
Contrast. Separately, `Button variant="primary"` sets no `background`: its fill
is a `z-index:-1` span and its border is a rotating `conic-gradient`, both
dropped in this mode, leaving the primary action invisible.

**Fixed in** `src/theme.css` — additive `@media (forced-colors: active)` block.

> **Correction to the original spec.** It set `forced-color-adjust: none` on
> `[data-slot="button"]`. That property opts an element *out* of the forced
> palette, defeating the `ButtonFace`/`ButtonText`/`ButtonBorder` fill being
> assigned in the same rule. The line was dropped.

> **Correction.** The original targeted `[data-slot="progress-fill"]` and
> `[data-slot="slider-fill"]`. Neither exists; the real names are
> `progress-indicator` and `slider-indicator`.

---

## ✅ A2 · P0 — No guaranteed focus indicator

**Problem.** As above, focus is `box-shadow` via `ring-*`. Additionally **82
files set `outline-none`**, so any fallback declared inside `@layer base` loses
to those utilities on cascade-layer order.

**Fixed in** `src/theme.css` with a deliberately **unlayered** rule — unlayered
normal declarations outrank every `@layer`, including Tailwind's `utilities`, so
the outline lands even where a component opted out:

```css
:focus-visible:not([data-focus-outline="none"]) {
  outline: var(--focus-width) solid var(--ring);
  outline-offset: var(--focus-offset);
}
```

Composite fields (`SearchInput`, `Combobox`, `TagInput`, … — 11 components) draw
focus on the **wrapper** via `focus-within`, so they carry a `focus-delegate`
marker class in the same cva string as that treatment, and the inner control's
outline is suppressed — but only outside forced-colors, where the wrapper's ring
still works:

```css
@media not (forced-colors: active) {
  .focus-delegate:focus-within :focus-visible { outline: none; }
}
```

> **Correction to the original spec — load-bearing.** It claimed *"Outline is
> never clipped by ancestor overflow"*. **This is false.** `overflow: hidden`
> clips a descendant's `outline` exactly as it clips its `box-shadow`, so
> switching to an outline does **not** fix clipping. The outline is still worth
> having — it is what survives forced-colors — but the clipping half needs
> `overflow: clip` with a clip margin, added as the `focus-escape` utility.

> **Correction.** The original patched only `@utility focus-accent`, which is
> used in **6 files**. That reaches ~4% of focus sites.

**Applied `focus-escape` to:** `Accordion variant="bordered"`, the one confirmed
case where focusables sit flush against all four edges of a clipping container.
Other `overflow-hidden` containers were checked and have ≥8px padding, so their
rings (max 4px reach) are not clipped.

---

## ✅ A5 · P1 — Blanket `prefers-reduced-motion` kill froze loading affordances

**Problem.** The blanket rule set `animation-iteration-count: 1` and
`animation-duration: 0.001ms` on `*`, which also stopped `Spinner`
(`animate-spin`, `spinner.tsx:17`) and `Skeleton` (`animate-pulse`,
`skeleton.tsx:25`). They ran once, instantly, and parked on their final frame —
a reduced-motion user could not distinguish *loading* from *hung*.

**Fixed in** `src/theme.css` — the sweep is kept, plus an essential-motion
allowlist (`--duration-essential: 1.4s`) for `[data-motion="essential"]`,
`spinner`, indeterminate `progress-indicator`, and `badge-dot`. `pulseDot` is
swapped for the opacity-only `pulseDotReduced`, since scale is the part that
provokes vestibular symptoms and the fade is not.

`Skeleton` is deliberately **not** on the allowlist (see E8): a spinner that
stops is indistinguishable from a hung one, but a skeleton's *shape* already
says "content pending", so it flattens to a static fill instead.

`Progress` now emits `data-indeterminate` so the allowlist can select it.

> **Correction.** The original claimed `Skeleton` borrows `pulseDot`; it uses
> Tailwind's `animate-pulse`. It also targeted
> `[data-slot="progress-indeterminate"]` and `[data-slot="beam"]`, neither of
> which existed.

---

## ✅ A6 · P2 — `--track` fails 3:1 non-text contrast on the off state

**Problem.** `--track` composited over `--surface-2` sits at ~1.1:1, so the off
state of `Switch` is effectively invisible — only the thumb carries it. WCAG
1.4.11 requires 3:1 for the boundary of a UI component's state.

**Fixed.** The recessed low-key fill is kept — brightening it to 3:1 would make
every off-switch shout — and a defined edge carries the 3:1 instead:

```css
:root { --track-border: rgba(24, 20, 34, 0.47); }   /* 3.09:1 over #f8f6fc */
.dark { --track-border: rgba(255, 255, 255, 0.34); } /* 3.11:1 over #1b1922 */
```

Applied to `Switch` via `inset-ring-1 inset-ring-(--track-border)`, which
composes with rather than clobbers the existing focus/invalid `ring-*` because
Tailwind keeps `inset-ring` on its own shadow layer. Checked state drops the
edge (the accent fill already carries 3:1).

> **Scope note.** The original also listed `Slider`, `Progress` and
> `RadialGauge`. On those the *indicator* carries the state and the track is
> context, so 1.4.11 is met without a track edge. Revisit under E4 if the
> recessed treatment is adopted for aesthetic reasons.

---

## ✅ B1 · P1 — `--font-fa` was declared but never applied

**Problem.** `theme.css` defined `--font-fa: "Vazirmatn"` and `fonts.css`
downloaded four weights, but nothing referenced it. Persian text rendered in
IBM Plex Sans, which has no Arabic-script coverage, then fell through to an
arbitrary system font.

**Fixed in** `src/theme.css`. Bound by **language**, not direction — Urdu,
Hebrew, Arabic and Divehi are all RTL and none is served by Vazirmatn, so a
`[dir="rtl"]` hook would both mis-assign the face and miss Persian sitting
inside an LTR document:

```css
:lang(fa), [lang^="fa"] {
  font-family: var(--font-fa);
  font-variant-numeric: tabular-nums;
}
```

Vazirmatn is also appended to the Latin stacks as a last resort and put first in
`--font-fa`. Latin text is unaffected — it is fully covered by Plex / Space
Grotesk and never reaches Vazirmatn.

---

## ✅ C2 · P1 — Duplicate `FormActions`

**Problem.** `form-actions.tsx` and `form-provider.tsx` both exported
`FormActions`; the barrel generator aliased one to `FormProviderActions`.

**Fixed.** `form-actions.tsx` is the single public component. The provider's
copy is deleted, the `ALIASES` entry removed from `build-barrel.mjs` (now 0
collisions across 802 exported names), and its mobile-stacking behaviour is
preserved as a `stack` variant so no capability is lost. Breaking change
recorded in `CHANGELOG.md`.

> **Correction.** The original also proposed a `submitting` prop reading from
> `FormProvider` context. No such context exists — that would have been new API,
> not consolidation. Dropped.

---

## ✅ D2 · P1 — Root `README.md` was the Vite/shadcn template

**Problem.** It instructed the reader to run `npx shadcn@latest add button` and
said components land editable in `src/components` — the exact inverse of the
sealed contract in `AGENTS.md`. It is the first file anyone opens.

**Fixed.** Rewritten: what AEGIS is → install (GitHub Packages + `.npmrc`) →
use → theming → a table linking `AGENTS.md` / `CATALOG.md` / `RECIPES.md` /
`CHANGELOG.md` / `RELEASING.md` → developing this repo.

---

# Tier 2 — redesigns with real payoff

Ordered by value. None of these fix a defect; each should be judged on whether
it makes the system better, and each needs a Chromatic re-baseline.

## ✅ D4 · P1 — Fonts were a hard Google Fonts dependency

`fonts.css` was one `@import url(fonts.googleapis.com…)` for four families / 15
weights: render-blocking, third-party, unavailable under strict CSP or
air-gapped deployment, and a GDPR exposure. For an Iranian company it is also
plausibly slow or blocked outright — which matters more than the GDPR argument
the original led with.

**Fixed.** Self-hosted woff2 generated by `.agent/scripts/build-fonts.mjs`
(`npm run build:fonts`) from the `@fontsource` packages. 9 faces, 240 KB total,
shipped to `dist/fonts/` by `build:css` with a `./fonts/*` subpath export so
bundlers honouring `exports` can resolve the URLs.

The generator lifts each `unicode-range` **verbatim** from the upstream package
CSS rather than hand-transcribing it — those declarations are long and drift
silently when a font is updated.

> **Correction.** The original rewrote `fonts.css` only. **`src/index.css:3` had
> the identical Google Fonts `@import`**, so the dev app and Storybook would
> have kept the third-party request. Both were changed.

> **Correction.** The original specified four *variable* faces including
> `ibm-plex-mono-latin-var.woff2` at `font-weight: 400 600`. **IBM Plex Mono has
> no variable release** (`@fontsource-variable/ibm-plex-mono` is unpublished),
> so it ships static 400 + 600 — the two weights the components actually use.

**Subset choices.** latin **and latin-ext** for the three Latin faces: the
original specified latin only, which would silently break Turkish, Polish and
Czech text. Arabic only for Vazirmatn — its Latin block is its largest and is
never reached, since Plex wins for Latin in every AEGIS stack. No italics; no
stack requests one.

> **Footgun found.** `npx vite build` (the dev app) and `npm run build` (the
> library) both write to `dist/`, and Vite empties its `outDir` first — so
> running the app build silently destroys the library build. Worth giving the
> app build its own `outDir`.

## ✅ E8 · P2 — Shimmer skeletons instead of the opacity pulse

`Skeleton` used `animate-pulse`, which reads as blinking. A neutral
left-to-right sweep reads as "streaming in" and adds no colour — it moves
between two existing surface steps.

The gradient lives in `theme.css` keyed off `data-slot="skeleton"`, so the sweep
and its reduced-motion fallback stay in one place.

> **Note.** Skeleton is deliberately NOT in the A5 essential-motion allowlist,
> and flattens to a static fill under reduced motion. A spinner that stops is
> indistinguishable from a hung one; a skeleton's *shape* already communicates
> "content pending", so it stays legible frozen and is calmer flat.

## ✅ A3 / A4 · P1 — Chart severity encoding *(redesigned, not applied as written)*

Both problems were real: `--chart-1..5` **is** the severity ramp, so a chart of
assets-by-environment rendered in critical/high/medium and read as an alarm; and
severity decoded by hue alone fails under deuteranopia/protanopia and in
greyscale.

**The audit's fix did not work, so both parts were redesigned:**

- Its categorical palette claimed to exclude the alarm hues so a categorical
  chart "can never be mistaken for a severity chart", but `--cat-2 #3a97d4`
  **was** `--sev-low`, `--cat-4 #ecb22e` **was** `--sev-medium`,
  `--cat-6 #7d8798` **was** `--sev-info`, and `--cat-3 #2fb680` was
  `--success`. Four of six were severity colours; the confusion survived.
- Its hatch stroked `var(--on-tone)` (near-black) for every level, which is
  close to invisible on the darker fills.
- It patterned four levels, left `--sev-pattern-info` unused, then asked you to
  verify "the **five** segments remain distinguishable".

**A4 as shipped.** The real separator is **temperature**. Severity is warm-led,
`--success` owns green, `--destructive` owns red — so `--cat-1..6` is
**cool-only** (violet, cyan, indigo, orchid, teal, deep purple) and shares no
hue with any of them. Lightness alternates so the series stay separable in
greyscale and under CVD. `ChartContainer` gains `palette?: "severity" |
"categorical"`.

**A3 as shipped.** Hatch density encodes severity (thickest critical → thinnest
low; `info` stays flat). Stroke ink is per-slot (`--sev-hatch-1..4`), light on
the red/blue fills and dark on amber/orange.

Both land entirely in `chart-container.tsx` — colour resolution was already
centralised in `resolveSeries`/`CHART_PALETTE`, so **no chart component needed
its own `<defs>`**, contrary to the audit's instruction to edit six of them.
Resolved series now carry `fillVar` (pattern-aware, for area marks) alongside
`colorVar` (flat, for strokes and legend swatches) — a pattern on a 1px line is
noise. Funnel and Treemap render HTML `div`s, so an SVG `url(#…)` fill cannot
apply and they keep `colorVar`.

> **`patternBySeverity` defaults to FALSE**, against the audit's "default true".
> Hatching every severity chart is a large visual change, and on dense marks —
> thin stacked bands, small treemap cells — it can cost more legibility than the
> redundant encoding buys. It is opt-in per chart. **This is the one Tier 2
> decision most worth a second opinion once you have seen it rendered.**

## ✅ C1 · P2 — `Alert` used `variant` where the family uses `tone`

`Badge`, `StatusPill`, `Tag`, `Callout`, `SeverityBadge` express hue as `tone`
and fill treatment as `variant`. `alert.tsx` merged both into `variant`, so
`<Alert tone="warning">` silently did nothing.

**Fixed** on the same two axes as Badge, reusing its `--tone` / `--tone-ink`
custom-property pattern so the family stays consistent:
`tone` = `neutral | accent | info | success | warning | danger`,
`variant` = `soft | solid | outline`.

Backwards compatibility is real rather than nominal: legacy hue names are still
accepted in `variant`, mapped onto `tone`, and warned about in dev only. A
compound variant makes `tone="neutral" variant="soft"` render byte-identically
to the old `variant="default"`.

> **Correction.** The audit's "deprecation shim" was a silent visual break: it
> mapped `default -> info` and defaulted to `tone: "info"`, which would have
> turned every existing bare `<Alert>` from a neutral card into an info tint.

Internal call sites (`login-form`, `sign-up-form`, stories) migrated to `tone`.
Still to audit the same way: `Callout`, `Banner`, `ValidationMessage`, `Toast`.

## ✅ E1 / E2 / E4 · P2 — Elevation scale

Four shadow names (`--glass`, `--shadow-bloom`, `--shadow-soft`, `--shadow`)
with no ordering, so "which is higher" is a guess. A 0–5 scale with two-layer
(contact + ambient) shadows is a legitimate craft upgrade.

> **Correction.** The original claimed *"old names become aliases, so nothing
> breaks"*. False: today's `--shadow` is
> `0 18px 50px -22px rgba(90,68,150,.32)` and the proposed `--elevation-4` is a
> different value. **Every shadow in the system changes.** This is a redesign to
> be judged on looks, not a no-op alias.

> **Correction.** E1's table puts `Dialog` and `Toast` at elevation **4**; E11
> then hard-assigned both `--elevation-3`. Pick one. (E11 is removed — see
> below.)

E4 (recessed `--shadow-inset` wells for tracks and filled fields) is the
strongest part and is independent of the rest.

**As shipped.** `--elevation-0..5` per theme, each two layers (contact +
ambient); levels 1–2 keep the top inner highlight that makes AEGIS cards read as
glass. Exposed as `shadow-elevation-*` utilities. The four legacy names are
aliased to scale levels so existing call sites keep working.

Components were retargeted to their correct level rather than left flat:
attached overlays (`Menu`, `Popover`, `Tooltip`, `Select`, `ContextMenu`,
`HoverCard`, `NavigationMenu`, `ChartTooltip`) → **3**; floating
(`Lightbox`, `FloatingActionButton`) → **5**; detached overlays keep
`shadow-elevated`, which now resolves to **4** — their correct level. The
E1-vs-E11 conflict is moot: E11 was removed.

E4 `elevation-inset` applied to the `Slider` and `Progress` grooves. `Switch`
keeps `inset-ring` instead, because a raw `box-shadow` utility would clobber its
focus ring; `inset-ring` composes with it.

## ✅ E6 · P3 — Motion tokens as enter/exit pairs

Exits shared the entrance duration, which makes dismissal feel sluggish. Enter
decelerates; exit accelerates at ~2/3 the duration.

> **Correction.** E5 (whose useful half this replaces) referenced
> `var(--duration-card)` and `var(--ease-out)`. **Neither token exists** in the
> repo, so E5 was never implementable as written.

**As shipped.** `--ease-enter/exit/pop`, `--duration-enter/exit/pop`, the
`--motion-*` shorthands and `--stagger-step`, plus `motion-enter` /
`motion-exit` utilities. Applied as `data-[ending-style]:motion-exit` across
**14 overlay components** — the closing half only. Authored entrance durations
are deliberately left alone: a Drawer legitimately enters more slowly than a
Tooltip and should not be flattened to one number.

`Accordion` and `Collapse` were skipped — they exit by animating height
(`h-0`), a different motion class from overlay dismissal that should not be
retimed blind.

> **Correction.** `--stagger-step` is **80ms**, not the audit's 40ms, because
> that is what `StaggerContainer` actually does. A token that "formalises" a
> behaviour must not contradict it.

Keep the rule that overshoot easing (`--ease-pop`) is permitted only on elements
≤24px — checkbox marks, radio dots, chips, badge dots. Never a card or dialog.

## ✅ E7 · P3 — Beam intensity dial and static fallback

`--beam-opacity` / `--beam-still`, so dense dashboards can dim the motif and
print/reduced-motion get a static gradient instead of a frozen arc. `data-slot="beam"` was added to the five beam wrappers (`button`, `card`,
`beam-glow`, `floating-action-button`, `masthead`). The slot **did not exist**,
which is why the audit's E7 and A5 beam rules were no-ops as written.

## ✅ C5 · P3 — Public/internal split *(mechanism shipped; nothing qualified)*

Everything the barrel exports is API you cannot break, so implementation detail
must be able to opt out. A leading-block-comment `@internal` marker is now
honoured by **both** `build-barrel.mjs` and `build-catalog.mjs`, and each
reports what it skipped so a module cannot vanish from the public surface
silently. Verified by marking `portal.tsx` and watching both drop to 206, then
reverting.

> **Correction.** The audit's premise — that some exports are implementation
> detail, with `axis.tsx`, `click-outside.tsx` and `portal.tsx` named as
> "obvious ones" — does not hold. **All 207 components ship a story and a
> catalog entry**, i.e. each is deliberately public. `chart-container.tsx` is
> imported by 17 siblings but is also legitimately public API for consumers
> building custom charts. Nothing was marked; inventing internals to justify the
> item would have been a breaking change with no benefit. The mechanism exists
> for the first genuinely-internal helper.

## ✅ B5 · P3 — Keyframe naming

`progress-indeterminate` was the only kebab-case keyframe and the only one with
no `--animate-*` token, so it had to be spelled as an arbitrary
`animate-[…]` value at its single call site. Renamed to `progressIndeterminate` with an
`--animate-progress-indeterminate` token, and the call site now uses the
generated `animate-progress-indeterminate` utility.
Convention: keyframe identifiers are camelCase, the `--animate-*` token that
wraps them is kebab-case.

---

# Removed items and why

| Item | Why removed |
|---|---|
| **B7** `color-mix` fallbacks | Net negative. `color-mix()` shipped Chrome 111 / Safari 16.2 / Firefox 113 in 2022–23 and is Baseline Widely Available. The fix hard-codes 18 `rgba()` duplicates of the severity ramp that will silently drift the moment a tone is tuned, and only ever render on browsers nobody tests. Also overstated: it calls `--accent-soft-fill` at `0.14` "identical output" to `--accent-soft`, which is `0.10` on light. |
| **B2** `--nb-*` prefix | Premature. Private package, in-house consumers, collision risk currently zero and knowable. It renames every token and invalidates every other snippet in this document, which is written against unprefixed names. |
| **B3** control radii tokens | `--radius-marker-sm: calc(var(--radius) * 0.6)` is byte-identical to the existing `--radius-sm`. Only pays off if someone rethemes via `--radius`; nobody does, since the library is sealed and used in-house. Also puts the new scale in `:root` while the existing scale lives in `@theme inline`, forfeiting the generated `rounded-*` utilities. |
| **B4** `--shadow-elevated` alias | Naming only; folded into E1 if that lands. |
| **B6** duplicate stylesheet guard | Fires only if a consumer imports both entry points, which the docs already tell them not to do. The "fix" is a comment plus a dev assertion that is dead code — it computes `n`, never uses it, and tests `--nb-aegis-loaded === " twice"` against a token defined nowhere. |
| **C3** Button default variant | The item concedes the default is correct and then proposes a TSDoc line plus a speculative lint rule. Zero user impact. |
| **C4** the porous seal | Observation is correct, but option 1 is a wording change to `AGENTS.md` (now covered by the rewritten `README.md`) and option 2 (CSS Modules) is high-cost armour against an adversarial consumer that does not exist in-house. |
| **D1** component merges | Complexity goes **up**, not down: each merge ships a deprecated re-export, so you get 207 components *plus* 6 aliases *plus* new variant props. The real problem — picking the wrong component — is solved by the decision table the item mentions as an afterthought. Also references `GradeRingAF`, which does not exist. |
| **D3** committed build artefacts | **Already done.** `storybook-static/`, `*.log` and `dist` are in `.gitignore`, and `git ls-files storybook-static` returns 0. |
| **D5** catalog packaging | 378 KB on a private in-house package. Trivial. |
| **E3** severity-tinted shadow | Contradicts this document's own "What to avoid": *"glow on anything that is not the beam"*. |
| **E5** lift utility | Referenced `--duration-card` and `--ease-out`, neither of which exists. The useful half (systematic enter/exit) survives as E6. |
| **E9 / E10 / E11** | Decoration. E11 additionally conflicts with E1's elevation table. |
| **Section G** | Describes a *different artifact* — it claims Tailwind is "compiled by hand into `components/aegis.css`" (no such file exists here) and that "50 of 207 components built", when 207 have stories and pass conformance. Not about this repo. |

---

# ✅ Fixed — `verify:tokens` was a permanently-red gate

`npm run verify:tokens` reported **94 dangling references** (`var(--primary)`,
`var(--success)`, `var(--color-chart-1)` … "defined by nobody"), identical at
`HEAD` before any of this work.

**Root cause.** `verify-tokens.mjs` read token definitions from `src/index.css`
alone. That file declares **no** tokens — it is nothing but a list of
`@import`s — so the "defined" set was empty and every unfallbacked `var()` in
the library was reported as dangling. The real definitions live one hop away in
`src/theme.css`, which `index.css` imports.

**Fix.** The verifier now seeds from both entry points (`src/index.css` and
`src/styles.css`) and walks **relative** `@import` chains to collect
definitions. Bare specifiers (`tailwindcss`, `shadcn/tailwind.css`) and remote
URLs are still not followed — anything those legitimately provide belongs in the
`RUNTIME` allowlist. It now reports what it scanned, so a future regression to
"zero tokens defined" is visible rather than silent.

Result: 3 stylesheets, 146 tokens defined, **0 dangling references**.

Verified it still bites: injecting `var(--nb-this-token-does-not-exist)` into
`badge.tsx` fails the gate with exit 1, and removing it passes. The gate was
repaired, not defanged.

A permanently-red gate is worse than no gate — it trains everyone to ignore the
one check that would have caught the `--track` class of bug it was written for.
