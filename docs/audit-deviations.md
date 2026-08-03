# What changed relative to the original audit

Companion to `docs/debug.md`. That file is the **revised** spec — it has already
been rewritten to describe what shipped. This file is the **record of judgement**:
where the implementation deliberately departed from the audit as originally
written, and which items were left alone and why.

It deliberately does **not** restate work the original document already specified
correctly. If the audit said to do something and it was done that way, it is not
here. Everything below is either a departure, an addition, or a refusal.

Released as **v0.1.0**.

---

## 1 — Departures forced by the codebase

The audit was written against assumptions that did not hold. These are places
where following it literally would have produced a no-op, a regression, or a
rule that silently never fired.

### 1.1 Selectors that matched nothing

| Audit selector | Reality |
|---|---|
| `[data-slot="beam"]` | **Did not exist.** The beam is an unnamed `<span>` in five components. All of E7, and A5's beam rule, were no-ops. Added the slot to `button`, `card`, `beam-glow`, `floating-action-button`, `masthead`. |
| `[data-slot="progress-fill"]` | Real name is `progress-indicator`. |
| `[data-slot="slider-fill"]` | Real name is `slider-indicator`. |
| `[data-slot="progress-indeterminate"]` | Does not exist. Added a `data-indeterminate` attribute to the existing indicator instead of inventing a slot. |

### 1.2 Tokens referenced but never defined

E5 was built on `var(--duration-card)` and `var(--ease-out)`. **Neither exists**
anywhere in the repo, so E5 could never have worked as written. Its useful half
survives as E6, which defines its own tokens.

### 1.3 Wrong diagnosis of the mechanism

- **A5** claimed `Skeleton` borrows the `pulseDot` keyframe. It uses Tailwind's
  `animate-pulse`. The fix had to target the right thing to work at all.
- **A2** claimed *"outline is never clipped by ancestor overflow"*. This is
  **false** — `overflow: hidden` clips a descendant's `outline` exactly as it
  clips its `box-shadow`. Switching to an outline therefore does not fix
  clipping. The two problems were separated: the outline solves forced-colors,
  and `overflow: clip` + `overflow-clip-margin` (the `focus-escape` utility)
  solves clipping.
- **A1** set `forced-color-adjust: none` on the button. That property opts an
  element *out* of the forced palette, cancelling the `ButtonFace`/`ButtonText`
  fill assigned in the same rule. Dropped.

### 1.4 Scale that did not match

The audit's own sections disagreed: §A1 and §D1 assume 207 components, while
§G.1 says "50 of 207 built". Reality is **207 components, each with a story,
all passing conformance**. §D1's merge plan and §C5's "obvious internals" were
both sized against the wrong number.

`GradeRingAF` (named in §D1) does not exist.

### 1.5 Section G is about a different codebase

It references a `components/aegis.css` that does not exist here, and describes
hand-compiled Tailwind and a partial build. It is not about this repository and
was removed rather than carried forward.

### 1.6 A correction to my own earlier reporting

I initially reported that `badge`, `tag` and `skeleton` were missing `data-slot`
attributes. **That was wrong** — my first search missed the object-literal form
(`"data-slot": "skeleton"`) used by `useRender` components. All three have them.
Four selectors were wrong, not seven.

---

## 2 — Design decisions taken beyond the audit

These are choices the audit did not make, made because the audit's version would
not have achieved its own stated goal.

### 2.1 A2 — focus reaches ~4% of the system as specified

The audit patched `@utility focus-accent`, used in **6 files**. Focus is actually
expressed with Tailwind `ring-*` at **~142 call sites** (`ring-accent-soft` ×71,
`ring-3` ×42, `ring-[3px]` ×29), and **82 files set `outline-none`** — which
defeats any fallback declared inside `@layer base`, on cascade-layer order.

Three additions:

1. The base rule is **unlayered**. Unlayered normal declarations outrank every
   `@layer`, including Tailwind's `utilities`, so the outline lands even where a
   component opted out.
2. A `focus-delegate` marker on the **11 composite fields** (`SearchInput`,
   `Combobox`, `TagInput`, …) that draw focus on their wrapper via
   `focus-within`, so the inner control is not double-ringed. Scoped to
   `@media not (forced-colors: active)` — under forced-colors the wrapper's
   box-shadow ring is gone and the inner control must get its outline back. Left
   unscoped, this rule would have out-specified the forced-colors block and
   silently reintroduced the original bug.
3. A `focus-escape` utility for the clipping half, applied to
   `Accordion variant="bordered"` — the one container where focusables sit flush
   against all four edges. Others were measured: ≥8px padding against a ≤4px
   ring reach.

### 2.2 A4 — the proposed palette did not solve the problem it described

The audit's categorical palette claimed to exclude the alarm hues so a
categorical chart "can never be mistaken for a severity chart". But
`--cat-2 #3a97d4` **is** `--sev-low`, `--cat-4 #ecb22e` **is** `--sev-medium`,
`--cat-6 #7d8798` **is** `--sev-info`, and `--cat-3 #2fb680` is `--success`.
Four of six were severity colours; the confusion survived intact.

Redesigned around the real separator, **temperature**. Severity is warm-led,
`--success` owns green, `--destructive` owns red — so the categorical palette is
**cool-only** and shares no hue with any of them. Lightness alternates so series
stay separable in greyscale and under colour-vision deficiency, because hue alone
is what failed in the first place.

### 2.3 A3 — hatch ink, placement, and default

- **Ink.** The audit stroked every level in `var(--on-tone)` (near-black), which
  is close to invisible on the darker fills. Made per-slot (`--sev-hatch-1..4`):
  light ink on red and blue, dark on amber and orange.
- **Placement.** The audit instructed emitting a `<defs>` block in each of six
  chart components. Colour resolution was already centralised in
  `resolveSeries`/`CHART_PALETTE`, so the whole feature landed in
  `chart-container.tsx` and **no chart component needed changing** for the
  mechanism.
- **Fill vs stroke.** Introduced `fillVar` alongside `colorVar`. A pattern is
  correct for an area mark and wrong for a 1px line stroke or a legend swatch.
  The audit did not distinguish these.
- **Default.** `patternBySeverity` defaults to **`false`**, against the audit's
  "Default true". Hatching every severity chart is a large visual change, and on
  thin stacked bands or small treemap cells it can cost more legibility than the
  redundant encoding buys. **This is the decision most worth revisiting once
  someone has seen it rendered.**

### 2.4 C1 — the "deprecation shim" was a silent visual break

Alert's real variants were `default | info | success | warning | destructive`,
where `default` is a neutral `bg-card`. The audit mapped `default → info` and
defaulted to `tone: "info"`, which would have turned **every existing bare
`<Alert>`** from a neutral card into an info tint — a visual regression wearing a
compatibility label.

Shipped with a compound variant making `tone="neutral" variant="soft"` render
byte-identically to the old default, plus a dev-only deprecation warning.

The audit also proposed a `submitting` prop for `FormActions` reading from
`FormProvider` context. **No such context exists** — that would have been new API
invention, not consolidation. Dropped.

### 2.5 E1/E2 — presented as a refactor, actually a redesign

The audit claimed old names become "aliases, so nothing breaks". `--shadow` was
`0 18px 50px -22px rgba(90,68,150,.32)`; `--elevation-4` is a different value.
**Every shadow in the system changes.** The names survive; the pixels do not.
This is recorded as a redesign in `CHANGELOG.md` so it is not discovered by
surprise.

The audit gave an elevation table but did not say to apply it. Applied:
attached overlays → 3, floating → 5, detached overlays stay at 4. This also
moots the audit's internal conflict, where §E1 put `Dialog`/`Toast` at level 4
and §E11 hard-assigned them level 3.

### 2.6 E6 — exit-only, and a token that tells the truth

Applied `motion-exit` to the **closing** half of 14 overlays only. Overriding
entrance durations too would flatten a `Drawer` and a `Tooltip` to one number,
which is wrong: a large surface legitimately enters more slowly.

`--stagger-step` is **80ms**, not the audit's 40ms, because that is what
`StaggerContainer` actually does. A token that claims to "formalise" a behaviour
must not contradict it.

### 2.7 E8 — skeleton is not essential motion

The A5 allowlist keeps spinners running under reduced motion because a stopped
spinner is indistinguishable from a hung one. A skeleton is different: its
*shape* already communicates "content pending", so it stays legible frozen and is
calmer flat. Deliberately excluded from the allowlist and flattened instead.

### 2.8 D4 — three corrections

- The audit rewrote `fonts.css` only. **`src/index.css` carried an identical
  Google Fonts `@import`**, so the dev app and Storybook would have kept the
  third-party request. Both were changed.
- The audit specified four *variable* faces. **IBM Plex Mono has no variable
  release** — `@fontsource-variable/ibm-plex-mono` is unpublished — so it ships
  static 400 + 600.
- The audit specified latin only. Added **latin-ext** (~63 KB): dropping it
  silently breaks Turkish, Polish and Czech text.

Rather than hand-transcribing `unicode-range` declarations, a generator
(`build-fonts.mjs`) lifts them verbatim from the upstream packages. They are long
and drift silently when a font updates.

### 2.9 C5 — the premise did not hold

The audit named `axis.tsx`, `click-outside.tsx` and `portal.tsx` as "obvious"
internals. **All 207 components ship a story and a catalog entry**, i.e. each is
deliberately public. `chart-container.tsx` is imported by 17 siblings but is also
legitimately public API for anyone building a custom chart.

The `@internal` **mechanism** shipped in both generators, with skip reporting so
a module cannot silently vanish from the public surface. **Nothing is marked.**
Inventing internals to justify the item would have been a breaking change with no
benefit.

### 2.10 Found and fixed outside the audit: `verify:tokens` was permanently red

Not mentioned anywhere in the original document. The gate had been failing with
**94 dangling references** for as long as it existed.

Root cause: it read token definitions from `src/index.css` alone — a file that
declares no tokens, being nothing but `@import` lines. The "defined" set was
empty, so every unfallbacked `var()` in the library was reported as dangling. The
real definitions live one hop away in `src/theme.css`.

A permanently-red gate is worse than no gate: it trains everyone to ignore the
one check written to catch exactly the `--track` class of bug. Now follows
relative `@import` chains. **`npm run verify` passes end to end for the first
time.**

### 2.11 Gates were tested adversarially, not just observed passing

Two gates were verified to still *fail* correctly, since a "fix" that merely
silences a check is worse than the check:

- `verify:tokens` — injected `var(--nb-this-token-does-not-exist)` into
  `badge.tsx`; the gate failed with exit 1, then passed once reverted.
- `@internal` — marked `portal.tsx`; both generators dropped to 206 and reported
  the skip, then returned to 207 on revert.

The conformance gate also caught a genuine mistake mid-work: the first pass at A3
hard-coded hex hatch strokes, which `verify:conformance` rejected as five
violations. They became `--sev-hatch-*` tokens.

---

## 3 — Items deliberately not implemented

### 3.1 Net-negative — implementing these would make the codebase worse

**B7 — `color-mix()` fallbacks.** `color-mix()` shipped in Chrome 111, Safari
16.2 and Firefox 113 across 2022–23; it is Baseline Widely Available. The fix
hard-codes 18 `rgba()` values duplicating the severity ramp. The moment anyone
tunes `--sev-high`, the duplicate drifts silently — and only ever renders on
browsers nobody tests, so nobody would notice. It adds a permanent maintenance
hazard to protect users who do not exist. The audit also overstated its own
accuracy, describing `--accent-soft-fill` at `0.14` as "identical output" to
`--accent-soft`, which is `0.10` on light.

**B2 — `--nb-*` token prefix.** Private package, in-house consumers, collision
risk currently zero and knowable. It renames every token and invalidates every
other snippet in the audit, all of which are written against unprefixed names.
Worth doing the day there is an external consumer; not before.

**D1 — merging six component families.** Complexity goes **up**, not down: each
merge ships a deprecated re-export, giving 207 components *plus* 6 aliases *plus*
new variant props. The real problem — someone picking the wrong component — is
solved by the decision table the audit mentions as an afterthought. The
expensive half is the ineffective half.

**E3 — severity-tinted shadow.** Contradicts the audit's own "What to avoid"
list, which forbids "glow on anything that is not the beam".

### 3.2 No measurable benefit

**B3 — control radii tokens.** `--radius-marker-sm: calc(var(--radius) * 0.6)` is
byte-identical to the existing `--radius-sm`. It only pays off if someone
rethemes via `--radius`; nobody does, since the library is sealed and used
in-house. It also places the new scale in `:root` while the existing scale lives
in `@theme inline`, forfeiting the generated `rounded-*` utilities.

**B6 — duplicate stylesheet guard.** Fires only if a consumer imports both entry
points, which the docs already tell them not to do. The proposed dev assertion is
dead code: it computes `n`, never uses it, and tests `--nb-aegis-loaded === " twice"`
against a token defined nowhere. It cannot fire.

**C3 — Button's default variant.** The item concedes the default is correct, then
proposes a TSDoc line and a speculative lint rule. No user impact.

**D5 — catalog packaging.** 378 KB on a private, in-house package.

**E9 / E10 — CountUpTicker wiring, view transitions.** Decoration. Worth doing if
wanted for their own sake; they fix nothing.

### 3.3 Already done, or superseded

**D3 — committed build artefacts.** Already done before this work.
`storybook-static/`, `*.log` and `dist` are in `.gitignore`, and
`git ls-files storybook-static` returns 0.

**B4 — `--shadow-elevated` alias.** Naming only; absorbed into the E1 elevation
scale.

**E5 — lift utility.** Referenced two non-existent tokens. Its useful half
survives as E6.

**E11 — border as light source.** Pure aesthetic, and it conflicts with E1's
elevation table on `Dialog`/`Toast`.

**C4 — the porous seal.** Option 1 is a wording change, now covered by the
rewritten `README.md`. Option 2 (CSS Modules) is expensive armour against an
adversarial consumer who does not exist in an in-house context — and the audit
itself does not recommend it.

### 3.4 Scoped down within an item that was implemented

**A6 — `Slider`, `Progress`, `RadialGauge` track contrast.** The WCAG 1.4.11 fix
was applied to `Switch` only. On the others the *indicator* carries the state and
the track is context, so the criterion is already met. `Slider` and `Progress`
did later gain the recessed treatment under E4, for aesthetic reasons rather than
contrast ones. `RadialGauge` is an SVG stroke, where a `box-shadow` cannot apply.

**E6 — `Accordion` and `Collapse` exit timing.** They exit by animating height
(`h-0`), a different motion class from overlay dismissal. Retiming a height
collapse blind risks looking worse, not better.

**A3 — `Funnel` and `Treemap` hatching.** Both render HTML `div`s. An SVG
`url(#pattern)` fill cannot apply to a CSS background, so they keep flat colour.
This is a real limitation, not a decision.

---

## 4 — Known open risks

1. **Nothing has been visually reviewed.** The gates prove the system compiles
   and behaves; they say nothing about whether the new two-layer shadows and
   retargeted elevation levels *look* right. This is the main risk in v0.1.0.

2. **The interaction-test harness is unreliable on this machine.** Roughly half
   of full-suite runs hang or abort at transport level (dynamic-import fetch
   failures, iframe CORS), always with **zero assertion failures** and on a
   different file each time. Coverage for this release was obtained by running
   the suite in four chunks — 53 + 51 + 51 + 52 = **207 files, 997 tests, all
   passing**, matching the pre-change baseline exactly. Chunking is a workaround,
   not a fix; a flaky gate trains people to re-run instead of investigate.

3. **`npx vite build` destroys the library build.** The app build and the library
   build both target `dist/`, and Vite empties its `outDir` first. Worth giving
   the app build its own `outDir`.

4. **21 pre-existing lint warnings** (physical direction utilities that should be
   logical, for RTL). Untouched — unrelated to this work, and RTL correctness
   deserves its own pass.

5. **`patternBySeverity` ships dormant.** A3's accessibility benefit is opt-in, so
   by default nothing changed for existing charts.

---

## 5 — Summary

| | Count |
|---|---|
| Audit items implemented | 16 |
| Implemented with a corrected design | 9 |
| Deliberately not implemented | 14 |
| Factual errors found in the audit | 15 |
| Problems found outside the audit | 2 (`verify:tokens`, `vite build` clobbering `dist`) |

The audit was directionally right about the accessibility defects — forced-colors,
focus, reduced motion, track contrast and the dead Persian font were all real and
all shipped broken. It was least reliable where it was most specific: selectors,
token names, and the claim that particular changes were visually inert.
