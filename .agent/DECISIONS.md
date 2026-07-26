# DECISIONS.md — Architecture Decision Log (ADR)

> **Append-only.** Never edit or delete a past decision. To change one, add a **new** entry and set
> the old one's status to `superseded-by: <id of new entry>`. This is the memory the agent does
> not otherwise have between runs — without it, settled choices get silently re-litigated.
>
> Consult this file **before** making any architectural choice. If your choice contradicts an
> `accepted` decision, stop and either follow it or add a superseding entry with justification.

Entry format:
```
## <id> — <short title>
Status: proposed | accepted | superseded-by: <id>
Decision: <what>
Reason: <why>
Impact: <what this binds going forward>
```

---

## 2026-07-19a — Base UI package path
Status: superseded-by: 2026-07-19g
Decision: The Base UI primitives package is `@base-ui-components/react`, not `@base-ui/react`.
Reason: That is what MUI publishes; the wrong path yields an empty dir and invites API guessing.
Impact: All primitive inspection uses that path.
> ⚠️ This decision was FACTUALLY WRONG for this repository and is retained only for the audit trail.
> The repo actually depends on `@base-ui/react`. See the correction, 2026-07-19g.

## 2026-07-19b — Docs are router + lazy-loaded, not read-all-up-front
Status: accepted
Decision: `AGENT.md` is the only mandatory read; each mode loads only its document set.
Reason: Front-loading every rule dilutes attention (lost-in-the-middle) and re-creates the
mega-prompt cost the modular split was meant to remove.
Impact: New rule files must be wired into a mode in `AGENT.md`, not into a global read list.

## 2026-07-19c — CREATE never rewrites neighbors; upgrades are an explicit mode
Status: accepted
Decision: Bringing older components up to standard happens only in REFACTOR/UPGRADE mode, invoked
explicitly (usually from a REVIEW finding). CREATE records gaps as findings and moves on.
Reason: PART 1 forbade rewrites while PART 2/3 demanded "upgrade first" — a contradiction that would
turn every build into a library-wide refactor.
Impact: A CREATE run that starts modifying other components is a bug.

## 2026-07-19d — Escape-hatch policy (slotProps formulation)
Status: superseded-by: 2026-07-19h
Decision: No raw `className`/`style`; `slotProps` is semantic-only; layout valve lives in `Box`/`Stack`.
Reason: A total ban with no sanctioned layout path pushes teams to fork components.
Impact: Public APIs expose no styling hatch.
> ⚠️ Formulated against the older MUI-Base `slotProps` API. This repo uses `@base-ui/react`, which
> has no `slotProps` (it uses `render` + `className`). Superseded by 2026-07-19h, which keeps the
> closed-API intent but expresses it in `@base-ui/react` terms.

## 2026-07-19e — Health/status is computed, never hand-typed
Status: accepted
Decision: Per-component status is derived by `scripts/verify-inventory.mjs` from the filesystem plus
gate output. No hand-assigned percentages (e.g. "Accessibility: 100%").
Reason: Percentages are false precision (a11y is criteria met/violated, not a %), they invite
gaming, and hand-typed status drifts from reality within days.
Impact: Any status surface must be generated, not authored.

## 2026-07-19f — Component-count denominator is provisional
Status: proposed
Decision: Track Components, Variants, Stories, and A11y-checks as **separate** counts; do not report
a single `X / 219`. Treat 219 as unverified until the unit ("component" vs "variant") is confirmed.
Reason: 219 exceeds the distinct-component count of MUI/Carbon/Polaris; it likely folds in variants.
Impact: Awaiting human confirmation of the denominator before this moves to `accepted`. The full
catalog currently lives as the queue in `checklists/COMPONENTS_STATUS.md`.

## 2026-07-19g — Base UI package path (correction)
Status: accepted
Decision: The Base UI package for THIS repo is **`@base-ui/react`** (v1.x), imported per-part
(e.g. `@base-ui/react/button`, `@base-ui/react/tooltip`). Its primitive API is `render` +
`className`; there is **no `slotProps`**. Inspect `node_modules/@base-ui/react/<part>/` before coding.
Reason: Verified against `package.json`, `package-lock.json`, the installed `node_modules/@base-ui/react`
directory, and the imports in `src/components/ui/button.tsx` / `tooltip.tsx`. The earlier 2026-07-19a
decision named the wrong (older) package and would make every CREATE run halt on an empty directory.
Impact: All primitive inspection uses `@base-ui/react`. Supersedes 2026-07-19a.

## 2026-07-19h — Closed API on @base-ui/react (escape-hatch, corrected)
Status: accepted
Decision: Public AEGIS component props are **closed**: the public type **omits `className` and
`style`** (`Omit<Primitive.Props, "className" | "style">`). Customization is only via semantic props
— `variant`, `size`, `appearance`, `density`, and state props. Element polymorphism stays available
through Base UI's **`render`** prop (swap the rendered element, e.g. Button-as-anchor or a Tooltip
trigger) — `render` is for composition, **not** a styling hatch. One-off layout (margin, width, grid
placement) is served by a first-class token-only `Box`/`Stack` primitive (to be built). There is no
`slotProps` in `@base-ui/react`; where an inner element needs a semantic setting, add a first-class
prop for it — never a raw hatch.
Reason: Keeps the closed-API intent from 2026-07-19d but expressed in the actual library's API.
Impact: Every public component type omits `className`/`style`. If a genuine need can't be met via
variants / first-class props / `Box`/`Stack` tokens, add a first-class prop. Supersedes 2026-07-19d.

## 2026-07-19i — Adopt Closed API; migrate existing components once (carve-out)
Status: accepted
Decision: AEGIS is a **closed-API** design system (per 2026-07-19h), chosen deliberately by the
maintainer over the open shadcn/`className` model. The two pre-existing components that forwarded
`className` (`Button`, `Tooltip`) were migrated to the closed API in a **one-time REFACTOR**, and
their stories + the `App` demo updated to stop passing `className` to AEGIS components.
Reason: The repo was scaffolded as open shadcn/ui; a closed API is a different contract, so the
seed components had to be reconciled or the docs would contradict the code.
Impact: This is an explicit, one-time carve-out to safety rule #1 ("don't change existing behavior")
and rule #2 ("CREATE never rewrites"), applied only to this migration. Going forward: every NEW
component ships closed from the start; anything `npx shadcn add` generates is treated as
non-conformant scaffolding that must be closed before it counts as done. Future closed-API violations
found in existing components are handled in REFACTOR mode, not silently in CREATE.

## 2026-07-22 — Reference fidelity is mandatory and machine-gated
Status: accepted
Decision: Every component must match its AEGIS reference (`references/spec/<Name>.dc.html`) exactly —
structure, visual design, interactions, animations, shadows, borders, and behavior — not only colors.
Components without a reference page must follow the same design language and signature motifs.
Enforced by `scripts/verify-conformance.mjs` (a HARD gate) against `references/spec-manifest.json`.
Reason: The build had drifted to shadcn defaults (dropped size scales, missing variants/states, no
signature beam/pulse/pop animations, `ring-ring/50` focus, generic/hard-coded shadows). The reference
specs were never a build input, so drift was inevitable. This makes the specs both an input and a gate.
Impact: New components fail the gate unless they conform. The signature keyframes + `--shadow` token now
live in `src/index.css` (utilities `animate-*`, `shadow-elevated`; focus `ring-accent-soft`; control
borders `border-strong`). The five existing drifted components (button, checkbox, switch, badge, avatar)
are a REFACTOR backlog to bring into conformance — done only after this foundation lands.

## 2026-07-22b — DataTable is config-driven (typed columns), not a compound generic
Status: accepted
Decision: `DataTable` exposes a **config-driven** API — a typed `columns: DataTableColumn<TRow>[]`
array plus `data` / `getRowId` — rather than compound `DataTable.Root/Header/Body/Row/Cell`
sub-components. The reference (`references/DATA.datatable.md`) names a compound shape as one option;
this build satisfies its actual mandate — "a column-definition API (typed columns), not hardcoded
markup" — through the config form. Composition slots (`toolbar`, `footer`) remain for AEGIS nodes
(e.g. `Pagination`).
Reason: A generic compound component built over React context loses row-type inference at the leaf
(`Cell`) — context is invariant, so `TRow` degrades to `unknown` and every cell needs a manual cast.
The config form keeps end-to-end inference from the row shape to each `cell(row)` callback, which is
the stronger type-safety guarantee and the one the closed-API contract depends on.
Impact: The four required state surfaces (loading/empty/error/filled), selection, sorting (`aria-sort`),
and density all live on the single `DataTable` root. If a future consumer genuinely needs compound
composition, add it as an additive layer over the same column model — do not fork the state logic.

## 2026-07-22c — DataTable defers virtualization + arrow-key cell navigation (REVIEW finding)
Status: proposed
Decision: The first `DataTable` ships WITHOUT row virtualization and without arrow-key cell/row
grid navigation. All rows render to the DOM; keyboard access follows the natural tab order of the
interactive controls (sort headers, checkboxes, retry). Both gaps are documented in `data-table.mdx`
("Known limitations") and recorded here as a REVIEW/REFACTOR backlog item.
Reason: The reference lists virtualization ("document the threshold at which it engages") and
cell/row keyboard navigation as target patterns. Both are large, browser-verification-heavy additions;
landing them blind in a no-browser sandbox risks unverifiable complexity. Shipping a correct,
type-safe, fully-stated table now — with the gaps stated honestly rather than silently — is the better
increment (safety rule #3: never claim a capability not delivered).
Impact: A follow-up REFACTOR run adds windowing (recommended engage threshold ~100 rows) and roving
`tabindex` cell navigation, verified against the reference in CI with a browser runner. Until then the
guidance is: paginate via the `footer` slot for large datasets.

## 2026-07-23 — Combobox ships single-select; multi-select chips deferred (REVIEW finding)
Status: proposed
Decision: The first `Combobox` is **single-select** — input + filtered listbox + selected-check
indicator, built on the Base UI Combobox primitive. Multi-select with removable chips (the
primitive's `Chips` / `Chip` / `ChipRemove` parts, plus `multiple`) is NOT wrapped in this build and
is recorded here as a REVIEW/REFACTOR backlog item.
Reason: Chip entry/removal, backspace-to-remove, wrapping/overflow and multi-value keyboard semantics
are interaction-heavy and browser-verification-heavy; landing them blind in a no-browser sandbox risks
unverifiable complexity (same rationale as DataTable, 2026-07-22c). Shipping a correct, type-safe,
fully-stated single-select autocomplete now — with the gap stated honestly in `combobox.mdx` — is the
better increment (safety rule #3).
Impact: A follow-up REFACTOR run adds the chips layer over the same root (additive, not a fork),
verified against a browser runner in CI. Until then: use `Select` with `multiple` for multi-value
picking, or the future Multi-select component (queue #43). This mirrors the config-driven, honestly-
scoped precedent set by DataTable.

## 2026-07-23b — Choice Card ships single-select; multi-select deferred
Status: proposed
Decision: The first `ChoiceCard` is **single-select** — a `ChoiceCardGroup` on the Base UI Radio
Group + Radio primitives, one `ChoiceCard` (role=radio) per option. A multi-select variant (several
cards selectable at once, built on the Checkbox Group primitive) is NOT wrapped in this build and is
recorded here as a REVIEW/REFACTOR backlog item.
Reason: Single-select is the dominant choice-card pattern (pick one plan / workspace / speed) and maps
cleanly onto the existing Radio group semantics (roving focus, aria-checked, native form submission).
Adding a parallel checkbox-backed group in the same run doubles the state/keyboard surface with no
browser runner to verify it; shipping the correct single-select increment now — with the gap stated in
`choice-card.mdx` — is the better step (safety rule #3). Mirrors Combobox (2026-07-23) and DataTable
(2026-07-22c).
Impact: A follow-up run adds a checkbox-backed multi-select group as an additive layer (not a fork of
`ChoiceCard`). Until then, for multi-select compose `Checkbox` inside `Card`.

## 2026-07-24 — Currency / Masked Input ships as Currency Input; generic mask deferred
Status: accepted
Decision: Roadmap slot #52 ("Currency / Masked Input") ships as **`currency-input.tsx`**, a numeric
money field (deterministic group/decimal separators, blur-format / focus-raw so the caret never jumps,
committed value is a real `number | null` via `onValueChange`). A general-purpose **mask engine**
(phone, card, arbitrary pattern tokens) is NOT bundled in this component and is recorded as a separate
future primitive.
Reason: The two have different contracts — a currency field is a numeric value with formatting on
display, whereas a mask is a per-character pattern with insert/delete caret bookkeeping and its own
validation surface. Fusing them into one closed API would muddy both. Shipping the correct, verifiable
currency increment now (with the scope stated in `currency-input.mdx`) beats a half-built universal
mask with no browser runner to verify caret behaviour (safety rule #3). Mirrors Combobox (2026-07-23),
Choice Card (2026-07-23b), DataTable (2026-07-22c).
Impact: A later run may add a dedicated masked-input primitive (e.g. on a pattern spec) as an additive
component; `currency-input` stays the money-specific field. The queue row for #52 is satisfied by
`currency-input` with this carve-out noted.

## 2026-07-25 — Area Chart is one component with three stack modes (covers Stacked Area #92)
Status: accepted
Decision: Roadmap slots #91 (Area Chart) and #92 (Stacked Area Chart) ship as a single
`area-chart.tsx` with a `stackMode` prop: `overlap` (translucent bands from the zero baseline,
default), `stacked` (opaque cumulative bands — the Stacked Area Chart), and `expand` (stack
normalised so each x column sums to 1). Both queue rows are satisfied by this one file; #92 is not a
separate on-disk component.
Reason: Directly mirrors the accepted precedent that `bar-chart.tsx` handles both grouped and stacked
columns in one file (#93 covers #94). The three modes differ only in how each series' lower/upper
boundary is computed; forking them into separate components would duplicate the marks, extent, and
axis wiring with no added capability. One config-driven surface keeps the API consistent with
Line/Bar chart and keeps the stacking math in one place.
Impact: `StackedAreaChart` is `AreaChart stackMode="stacked"`; a normalised/percentage stack is
`stackMode="expand"`. If a future need can't be met by a mode, add another `stackMode` value, not a
fork. Scope (static renderer; hover tooltip deferred) follows Line/Bar chart (2026-07-23 precedent).

## 2026-07-25b — Donut & Pie are sibling static charts; on-slice value labels omitted
Status: accepted
Decision: `donut-chart.tsx` (#95) and `pie-chart.tsx` (#96) ship as sibling components on the chart
foundation (ChartContainer palette + ChartLegend + own SVG arc/wedge marks). Donut carries a centre
readout (default = formatted total) and an `innerRatio` (0 = pie); Pie is the solid form and can draw
percentage labels OUTSIDE each slice. Neither draws value labels *inside* the wedge.
Reason: A design system can't guarantee AA text contrast for a label painted on an arbitrary
categorical slice colour, and the token rules forbid per-instance colour hacks. Outside labels sit on
the surface (`--color-muted-foreground`), so contrast is deterministic; per-slice values otherwise
come from the legend or a companion table. A single full-circle slice is drawn as two arcs so the SVG
`A` command never degenerates on a 360° sweep.
Impact: Both are static renderers — hover tooltip + slice selection/emphasis are deferred to a
follow-up (browser-verified), following the honestly-scoped precedent (DataTable 2026-07-22c, Combobox
2026-07-23, Line/Bar chart). Neither is in the conformance manifest.

## 2026-07-25c — Forms atoms (Field Label / Helper Text / Validation Message) are context-free siblings of the Field-bound parts
Status: accepted
Decision: Roadmap slots #122 (Field Label), #123 (Helper Text), #124 (Validation Message) ship as
standalone, context-free primitives in their own files — `field-label.tsx` (exports **`Label`**),
`helper-text.tsx` (exports **`HelperText`**), `validation-message.tsx` (exports **`ValidationMessage`**).
They are distinct from the Base UI `Field`-bound parts already living in `form-field.tsx`
(`FieldLabel` / `FieldDescription` / `FieldError`), which auto-wire `htmlFor` / `aria-describedby` /
`aria-invalid` / validity from the `Field.Root` context.
Reason: Base UI's `Field.Label` / `Field.Description` / `Field.Error` require a `Field.Root` ancestor
(they read field context and validity), so they cannot be used when composing a field by hand — a
checkbox row, a control inside `Box`/`Stack`, or any layout `FormField` doesn't cover. The queue lists
these as separate components; shipping context-free atoms fills that gap without touching `form-field`
(safety rule #2: CREATE never rewrites). The standalone label is named `Label`, NOT `FieldLabel`, to
avoid a same-name-two-meanings collision with the Field-bound part.
Impact: `Label` associates via native `htmlFor`; `HelperText` is a plain `<p>` (associate via the
control's `aria-describedby`); `ValidationMessage` is a `<p>` with `role="alert"` + `aria-live` and a
`tone` (error default / warning / success). None wrap a Base UI part or sit in the conformance manifest.
For a fully-wired field prefer `FormField`; reach for these atoms only when composing outside a `Field`.
This is not duplication — the behaviour (context wiring) differs; the single-source rule is preserved
because each rule (label typography, helper/error text style) still lives in one place per surface.

## 2026-07-25d — Reference fidelity: brand purple lives in `--primary` (not `--accent`); soften shadows via baked accent-tinted tokens
Status: accepted
Decision: Three reference-fidelity fixes against `spec/Button.dc.html` (beam) and the masthead beam.
(1) The AEGIS reference names its brand purple `--accent` (#9373d9 dark / #7c53d4 light). In our
shadcn-derived token set that name is already taken by the muted hover-surface (dark #22202b); the
purple lives in **`--primary`** — whose values match the reference's `--accent` *exactly*. So every
signature beam/gradient/glow that the reference paints with `var(--accent)` must use **`var(--primary)`**
here (keep `--accent-strong`/`--accent-soft`, which are already the purple family). Fixed the Primary
button beam + inner gradient and the beam card arc, which were silently rendering the near-invisible
muted surface instead of purple — the root cause of the "beam looks incomplete" report.
(2) Primary button beam completed to reference: accent **underglow** (`shadow-soft`), beam spins at
**3.4s** (`--animate-beam-spin-fast`; the 6.5s `--animate-beam-spin` stays for the slower masthead/card),
1.5px inner inset (was 1px).
(3) Softer, more diffuse shadows: added `shadow-soft` (hairline `border-strong` ring + accent bloom,
for borderless elevated surfaces — Primary button, beam card) and `shadow-bloom` (ring-less, wider,
extra-diffuse accent bloom for resting bordered surfaces). Default `Card` moved off the hard black
`shadow-elevated` onto `shadow-bloom`; added `variant="elevated"` (opt-in deep `--shadow`) and
`variant="beam"` (the animated conic-gradient border, masthead pattern: 1.5px frame over an inset panel).
Reason: `color-mix(in srgb, var(--accent) 60%, transparent)` in a `box-shadow` is collapsed by
Lightning CSS to the opaque `var(--accent)` (the translucency is dropped) — and the `--shadow-*` theme
namespace rewrites shadow colors for `shadow-{color}` modifiers, mangling it too. So the soft shadows are
**baked per-theme** as plain `--shadow-soft`/`--shadow-bloom` vars (translucent purple rgba, allowed in
`index.css` — conformance only scans `src/components/ui`) and exposed via `@utility` reading a single
`var()`, which Lightning emits verbatim. The color-mix in the button's *linear-gradient* is fine — Lightning
keeps it there behind an `@supports` fallback; only the box-shadow+`transparent` case breaks.
Impact: No public API change except `Card` gaining an optional `variant` ("default" | "elevated" | "beam",
default "default"). Overlays (dialog/menu/popover/tooltip/toast) keep `shadow-elevated` = `--shadow`,
which already matches the reference. Also added `storybook-static` to the ESLint global ignores: the
`build-storybook` gate emits bundles with inline eslint-disable comments for rules our config doesn't
load, which ESLint then flagged as "rule definition not found" — pre-existing gap, exposed by gate order.
All gates green (tsc, build, lint, conformance 110/110, build-storybook) + browser-verified screenshot.

## 2026-07-25e — ContextMenu/Menu story fixes: `render` components must forward ref+props; group labels must live inside a Group/RadioGroup
Status: accepted
Decision: Fixed two runtime breakages in the Menu-family stories (surfaced as "Context Menu isn't
working" in Storybook).
(1) ContextMenu's `TriggerArea` story helper was a plain function component passed to Base UI's
`render` prop but it neither forwarded its ref nor spread incoming props onto a DOM node. Base UI
injects the `contextmenu` handler, ref and data-attributes through `render`, so the trigger was inert
and the menu never opened. Rewrote it as `React.forwardRef` that spreads `{...props}` and merges
`className` (cn) onto the div.
(2) `ContextMenuGroupLabel` / `MenuGroupLabel` (Base UI `Menu.GroupLabel`) require a `MenuGroupContext`
— they must be nested inside a `Group` or `RadioGroup`. Three stories placed the label directly in the
content (ContextMenu RadioItems, Menu RadioItems, Menu CheckboxItems), throwing Base UI error #31 and
crashing the story render. Moved each label inside its `RadioGroup` (which provides the group context),
and wrapped the checkbox story's label+items in a `MenuGroup`.
Reason: Both are Base UI composition contracts, not component defects — `context-menu.tsx` / `menu.tsx`
are unchanged. Documented here because both are easy-to-repeat gotchas: any custom element handed to a
Base UI `render` prop must forward ref+props, and any `*GroupLabel` must sit within a group. Verified in
a headless Chromium against the built Storybook (right-click opens every ContextMenu story; Menu
checkbox/radio stories render and open without error #31). All gates green (tsc, lint, conformance
110/110, build, build-storybook).

## 2026-07-25f — Carousel: single-per-view horizontal only; multi-per-view + vertical axis deferred
Status: accepted
Decision: `carousel.tsx` (roadmap #75, Recommended/Data Display) ships as a token-only compound built
on native CSS scroll-snap (there is no Base UI carousel primitive) — `Carousel` (region + state/keyboard/
autoplay owner) / `CarouselContent` (the snap viewport, single Tab stop) / `CarouselItem` (one slide per
view, `basis-full snap-start`) / `CarouselPrevious` / `CarouselNext` (compose the AEGIS `Button`) /
`CarouselDots`. Active slide is the one nearest the viewport centre (measured by `getBoundingClientRect`,
so it is RTL-safe and survives a manual flick). `loop` and `autoPlay` (pause on hover/focus, gated by
reduced-motion and single-slide, interval floored at 1000ms) are opt-in. Navigation uses
`scrollIntoView({ inline: "start", block: "nearest" })`, which is direction-correct in LTR and RTL
without the browser `scrollLeft`-sign inconsistencies.
Reason: **Multi-per-view** (peeking neighbour slides) needs a fractional slide width and **a vertical
axis** needs a bounded viewport height — both are per-instance styling the closed API deliberately does
not expose (API_RULES: no `className`/`style`). Rather than open a hatch or invent an arbitrary height
token, both are deferred to a follow-up that can add first-class semantic props (e.g. `perView`,
`orientation` + a `size` height scale) once the pattern is validated. This follows the honestly-scoped
precedent (DataTable virtualization 2026-07-22c, Combobox multi-select 2026-07-23, static chart
renderers). A hover tooltip / thumbnail-strip variant is likewise out of scope.
Impact: Carousel is horizontal, one-slide-per-view. Not in the conformance manifest (no reference page;
follows the general design language). Autoplay sets the viewport's `aria-live` to `off` so a moving
carousel does not spam assistive tech; manual mode keeps it `polite`. All machine gates green (tsc, lint,
build, conformance 111/111, build-storybook); browser story/axe/visual-regression are
HUMAN_VERIFY_REQUIRED (no sandbox runner) and run in CI.

## 2026-07-25g — Lightbox: config-driven over Dialog; single image, zoom/filmstrip/non-image media deferred
Status: accepted
Decision: `lightbox.tsx` (roadmap #119, Recommended/Overlays, dep Portal) ships as a config-driven
convenience over the Base UI Dialog primitive (same pattern as `confirm-dialog.tsx` over AlertDialog):
`Lightbox` takes an `images: {src,alt,caption?}[]` array plus an optional `trigger` and renders a
full-screen modal viewer (Portal + Backdrop + Popup) with a counter, previous/next, captions, and
keyboard nav. Open state (`open`/`defaultOpen`/`onOpenChange`) and the active index
(`index`/`defaultIndex`/`onIndexChange`) are both controllable; navigation uses ← → (RTL-mirrored) +
Home/End; prev/next compose the AEGIS `Button` and disable at the ends unless `loop`. It is intentionally
**not** a compound of exported parts — the viewer chrome (toolbar/stage/caption) is fixed, so a config
API keeps every lightbox identical (closed-API spirit) and avoids a parts explosion.
Reason: A lightbox's layout is not something consumers should restyle; the value is a consistent viewer.
The Dialog primitive already provides the hard parts (focus trap, scroll lock, aria-modal, Esc), so the
component only adds index state + navigation + a11y announcement (sr-only `role=status` "Image n of N:
{alt}" so SR users track position; the visible counter is `aria-hidden`).
Impact: **Zoom / pan**, a **thumbnail filmstrip**, and **non-image media** (video, PDF) are deferred —
each needs surface the config API doesn't model yet (gesture state, a strip sub-region, a media-type
union) and would be additive props/parts in a follow-up (honestly-scoped precedent: DataTable
virtualization, Combobox multi-select, static chart renderers, Carousel multi-per-view 2026-07-25f). One
image is shown at a time. Not in the conformance manifest (no reference page; follows the general design
language). All machine gates green (tsc, lint, build, conformance 112/112, build-storybook); browser
story/axe/visual-regression are HUMAN_VERIFY_REQUIRED (no sandbox runner) and run in CI.
## 2026-07-25h — Reference-fidelity audit: restore the accent GRADIENT language, fix the --accent collision everywhere, fix text-on-primary contrast, add depth
Status: accepted
Decision: A three-agent audit against the reference `.dc.html` pages found the library had drifted
"flat/solid/shadcn-like" for several converging reasons; fixed all of them.
(1) **The `--accent` token collision was systemic, not just the button.** The reference names its brand
purple `--accent`; here that name is the muted hover surface (#22202b) and the purple is `--primary`.
Every `linear-gradient(145deg,var(--accent),var(--accent-strong))` (checkbox/indeterminate fill, radio
dot, switch on-track) was rendering a muddy dark→purple gradient, and every focus/checked `border-accent`
(checkbox, radio, text-field, textarea, select, form-field) plus radio's selected ring was painting the
near-invisible #22202b instead of lighting up purple. Centralised the fill as a new `@utility accent-fill`
(= `linear-gradient(145deg, var(--primary), var(--accent-strong))`) and switched all four fills to it;
switched the borders to `border-primary`. Added a conformance gate forbidding bare `var(--accent)` in
components so this collision cannot recur (it has now bitten twice).
(2) **Flat fills → the reference's gradient/raised language.** slider fill and progress(default) → `accent-fill`;
Tabs active indicator was `bg-background` (the DARKEST token → read as a recessed hole *below* its
`surface-2` track) → `bg-surface-3` + `shadow-soft` so it sits raised; stat-tile had no elevation while
peer Card does → added `shadow-bloom`.
(3) **The `border-strong` typo swept the library.** ~13 input-shell components wrote `border-strong`
(no such token → border-COLOR silently dropped, so resting outlines never rendered — a real flatness
source) instead of `border-border-strong`. Fixed all.
(4) **Text-on-primary contrast (WCAG AA).** dark-theme `--primary` #9373d9 gives white only ~3.7:1.
Added `--primary-solid` (deep purple, baked per theme: #7a52d0 dark / #6a44c0 light; white ≥ 5.3:1) for
text-bearing solid fills → message-bubble user turn and stepper "complete" disc. Badge `solid` was
`text-white bg-(--tone)` failing AA on nearly every tone (warning 1.9:1, success 2.6:1, accent 2.75:1,
danger 3.9:1) → now a subtle same-hue gradient + fixed near-black ink `--on-tone` #0c0b12 (AA on all
tones, 5.0–10.2:1); the accent tone (the one tone whose colour flips per theme) is special-cased to white
on `--primary-solid` to stay AA in both themes AND keep the reference's "white on purple" identity. Marks
(checkbox/radio white check, switch on-glyph) only need 3:1 and were verified (≥3.69:1); the switch
on-glyph was raised from `accent-strong` (2:1 on the white thumb) to `--primary` (3.69:1).
Reason: The "flat/solid/shadcn" feel was the sum of these: the signature accent fill is a GRADIENT in the
reference, and ours was either muddy (collision) or flat; resting borders were silently missing (typo);
and one key surface (active tab) was inverted. Contrast was fixed with deepened purples / dark ink so it
meets AA while keeping the purple-gradient identity — the reference's own white-on-light-purple is itself
sub-AA, so faithful-AND-accessible required this adaptation (the user explicitly asked for both).
Impact: 30 component files + tokens. New public surface: `Card`/badge behaviour unchanged; three new
utilities (`accent-fill`, `highlight-top`, plus `bg-primary-solid`/`text-on-tone` colour utilities) and
tokens `--primary-solid` / `--on-tone`. NOT changed: the muted `bg-accent` menu/nav/sidebar highlight
surfaces — those intentionally use #22202b + `accent-foreground` for readable, AA-safe rows; converting
them to purple would INTRODUCE contrast failures. Trade-off noted: non-accent solid badges (danger/critical
reds) now use dark ink rather than the conventional white-on-red, because white fails AA on every one of
our tone colours; dark ink is the consistent AA-guaranteed choice. Verified objectively with a WCAG
contrast script (all fixed pairs pass) + browser screenshots (vivid purple gradients on checkbox/radio/
switch/slider, readable gradient badges, raised active tab). All gates green (tsc, lint, conformance
110/110 incl. the new gate, build, build-storybook).

## 2026-07-25i — Prompt Composer: bare textarea in an Input shell (not nested Textarea); text-only, attach via slot
Status: accepted
Decision: `prompt-composer.tsx` (roadmap #144, Recommended/AI Components, dep Textarea) ships as a
token-only composer — the AEGIS Input shell (border-strong, `focus-within` accent border + accent-soft
ring, sm/md/lg) wrapping a **bare auto-growing `<textarea>`** (`field-sizing-content`, capped at
`max-h-48` then scrolls) plus a toolbar with a `leading` slot and a send `Button`. It reuses the
Textarea's auto-sizing *technique* but does NOT nest the AEGIS `Textarea` component — that would
double-shell (two borders/rings) and drag in field/label semantics the composer doesn't want. This
mirrors the shell-with-bare-input precedent (Tag Input, Input Group), and is why the "dep: Textarea" is
satisfied by reusing the behaviour, not the component.
Reason: Enter-to-send + Shift+Enter-newline (IME `isComposing`-guarded), a trailing send button gated on
trimmed-non-empty/loading/disabled, and a leading action slot are the composer's identity; a labelled
form field is the wrong base. Controlled/uncontrolled value; `onSubmit` gets trimmed text and clears the
field when uncontrolled.
Impact: **Text composition only.** Attachments are a consumer-filled `leading` slot (pair with File
Uploader — the composer manages no files); **slash-command menus, @mentions, and voice input** are
deferred follow-ups (each is an additive layer — a popup listbox, a mention engine, a recorder). The
send button is the AEGIS `Button` (primary, icon); accessibility puts the name on the textarea via
`label` (no visible label) and links the counter via `aria-describedby` + `aria-live`. Not in the
conformance manifest (no reference page). All machine gates green (tsc, lint, build, conformance 113/113,
build-storybook); browser story/axe/visual-regression HUMAN_VERIFY_REQUIRED (no sandbox runner), run in CI.

## 2026-07-25j — Model / Agent Selector: config-driven over Select; single-select curated list
Status: accepted
Decision: `model-selector.tsx` (roadmap #147, Recommended/AI Components, dep Select) ships as a
config-driven convenience over the AEGIS `Select`: a `models` array
(`{value,label,description?,icon?,badge?,disabled?,group?}`) drives the trigger and menu. The trigger
shows the selected model's icon + name via a `SelectValue` function child (O(1) `byValue` Map lookup,
placeholder fallback); each menu row is icon + label + optional uppercase badge chip + a muted
description line, with the inherited selected check. Grouping activates automatically when any option
sets `group` (first-seen order of groups and members preserved; dividers via `SelectSeparator` +
`SelectGroup`/`SelectGroupLabel`). It composes the existing Select parts — it does NOT reimplement the
listbox — so portalling, floating positioning, type-ahead, roving focus, keyboard, and native form
(`name`) all come from the primitive; `variant`/`size`/`side`/`align` pass through.
Reason: Picking a model/agent is a curated, single-select decision that benefits from per-row detail
(capability/speed trade-off, tier badge) the bare Select rows don't express. A config API keeps every
model picker identical and closed. Building on Select (not Combobox) is deliberate: this is a short,
known list, not a searchable one.
Impact: **Single selection of a curated list.** Type-ahead filtering (compose Combobox), multi-model
comparison, and inline usage/cost meters are out of scope — compose rather than fold in. The badge is a
short word rendered in a token chip (`surface-3` / `muted-foreground`); selection is conveyed by the
check + ARIA, never colour alone. Not in the conformance manifest (no reference page). All machine gates
green (tsc, lint, build, conformance 114/114, build-storybook); browser story/axe/visual-regression
HUMAN_VERIFY_REQUIRED (no sandbox runner), run in CI.
## 2026-07-25k — Ground-up DNA re-audit: revert last round's over-corrections that drifted FROM the reference; fix broken --track; subtle neutral glass on cards
Status: accepted
Decision: A complete design-DNA extraction from every reference `.dc.html` (not just the component
pages) plus two deep component-by-component audits found that parts of 2026-07-25f/h had over-corrected
PAST the reference into a different look. Reverted those and fixed several real bugs.
(1) **The reference has NO glassmorphism / NO backdrop-blur** — it even force-resets `backdrop-filter:
none`. Every surface is a SOLID token fill; "depth" is layered solid surfaces (bg<card<surface<surface-2
<surface-3) + hairline translucent borders + occasional NEUTRAL `--shadow`. So the accent-tinted
`shadow-bloom`/`shadow-soft` I had put on resting cards/tiles/tabs was itself a drift. Replaced with a new
`glass-panel` utility (`--glass`, baked per theme = a faint top inner highlight + a soft **neutral** drop)
on Card default, StatTile, Tabs indicator, and the SegmentedControl active segment. This gives the subtle
"glass panel" read the user asked for in a way that actually shows on a near-black canvas (edge highlight,
not blur — true backdrop-blur is invisible on uniform dark), WITHOUT the non-reference purple bloom. The
beam Card frame moved from `shadow-soft` → neutral `shadow-elevated` (the reference masthead uses `--shadow`).
`shadow-soft` now remains only on the Primary button, whose reference explicitly has a softened colored
shadow.
(2) **Badge solid reverted to the reference rule.** The reference `.badge--solid` is FLAT `background:
var(--tone)` + WHITE text, ink only on neutral (`--badge-solid-fg: #fff`). 2026-07-25f had changed it to a
subtle gradient + near-black `--on-tone` ink — a drift. Reverted to `text-white bg-(--tone)`; neutral stays
ink; accent solid keeps `bg-primary-solid` + white (the one AA-safe concession, ≈ the reference's #9373d9
accent base but deep enough for white to clear AA in both themes). Trade-off: per the reference's own rule,
white-on-light-tone solid badges (warning/success) fall below 4.5:1 — this now matches the reference; an
accessible override remains available if the user re-prioritises AA over fidelity.
(3) **`--track` token was undefined** — referenced by `tag.tsx` (resting chip remove-button) and needed by
the toggle off-track. Defined per theme (`rgba(255,255,255,.10)` dark / `rgba(24,20,34,.14)` light, the
reference values) + `--color-track`/`bg-track`. Switch off-track moved `bg-surface-3` (solid) → `bg-track`
(the reference's translucent groove). Also fixed the SegmentedControl active segment, which filled with
`bg-background` (the DARKEST token → read recessed under its `surface-2` track) → `bg-surface-3` (lighter =
raised), and the small-size Toggle geometry (inset 2px / travel 16px; md/lg already correct at 3px).
Reason: The user reported the system still "conflicts with the reference" and drifts toward generic/shadcn.
The root causes were (a) my own prior accent-bloom + gradient-badge additions (not in the reference), and
(b) genuine bugs (undefined token, inverted layering, geometry). Kept from prior rounds everything that IS
faithful: the 145° `accent-fill` gradient on checkbox/radio/toggle/slider, the `var(--accent)`→`--primary`
collision fixes + gate, the `border-strong`→`border-border-strong` sweep, `border-primary` focus borders.
Impact: Cards/tiles/tabs/segments now use a neutral subtle glass, not a purple bloom; solid badges match
the reference (flat + white). `--track`/`--glass` tokens + `glass-panel`/`bg-track` utilities added.
Deliberately KEPT (documented deviation, in the user's favour): existing `backdrop-blur` on modal scrims /
navbar / app-shell — the user explicitly likes the glass feel; the reference's no-blur is noted and these can
be stripped on request. All gates green (tsc, lint, conformance 112/112, build, build-storybook); browser
screenshots verified (neutral-glass cards, flat white solid badges, translucent toggle groove).

## 2026-07-25l — Restore missing INTERACTIONS: card hover-lift + pointer spotlight, the masthead beam header, Button focus glow
Status: accepted
Decision: A dedicated interaction/motion audit (the prior audits only compared RESTING styles) found
that several reference INTERACTIONS had never been implemented. Added them and documented the root cause.
(1) **Card hover.** The reference `card()`/`hover()` (Home.dc.html) give clickable cards
`transition:all .18s ease` + `style-hover="border-color:var(--accent);transform:translateY(-3px);
box-shadow:var(--shadow)"` — a lift + accent border + shadow. This was entirely absent (no `translateY`
hover existed anywhere in the library). Added a `Card interactive` prop: `hover:-translate-y-[3px]
hover:border-primary hover:shadow-elevated` + a pointer-tracked accent spotlight (an `onMouseMove` writes
`--mx/--my`; a `radial-gradient(...var(--accent-soft)...)` overlay follows the cursor and fades in on
hover). NOTE: the literal cursor-follow is NOT in the `.dc.html` (the reference hover is the static lift);
it was added per the user's explicit request, built from the reference's own accent-soft radial-glow
vocabulary, layered on the exact reference lift.
(2) **Masthead (beam page-header).** The reference masthead — a `beamSpin 6.5s` conic beam sweeping a page
header behind an inset `--card` panel — appears on EVERY reference page but had no component (only a plain
`AppShellHeader`). Built `masthead.tsx` (compound: Masthead / Content / Eyebrow / Brand / Breadcrumb /
Title / Description / Actions) reproducing it. This is the "header with a moving light beam" the user
flagged.
(3) **Button focus + press.** Reference focus = `0 0 0 3px var(--accent-soft),0 6px 18px -8px var(--accent)`
— the accent DROP-GLOW was dropped (only the ring rendered) and box-shadow wasn't transitioned. Added a
`focus-accent` utility (ring + glow) + put box-shadow in the transition list + added the reference's
`active:brightness-[0.94]` press-darken. Also: Menu/ContextMenu now use the `animate-menu-in` signature
entrance (matching Select/the reference `menuIn`), and Badge gained an optional `pinging` dot (the
reference live-status `statusPing`).
Reason (ROOT CAUSE — why these were missed): my design-DNA extraction was RESTING-STATE + component-level.
I grepped `style="…"`, colors, borders, shadows, gradients, tokens — but systematically ignored (a) the
reference's `style-hover="…"` attributes and the JS `card()/hover()/badge()` style-builders, which is where
HOVER/ACTIVE/FOCUS states live, and (b) page-COMPOSITION patterns (the masthead), which no single component
"owned" so they fell through the component-by-component audits. The conformance gate checks static structure
(variants/sizes/tokens/signature-animation presence), not interaction states or composition — so nothing
flagged them. Fixed the process: REFERENCE_FIDELITY.md now has an "Interaction states & composition
patterns" section mandating extraction+implementation of every `style-hover`, `<script>` state-builder,
focus glow, transition, pointer effect, and page-level pattern.
Impact: `Card` gains `interactive`; new `Masthead` component (+8 parts) & story; `focus-accent` utility;
Button focus/active fidelity; Menu/ContextMenu entrance; Badge `pinging`. All gates green (tsc, lint,
conformance 115/115, build, build-storybook); browser-verified (beam masthead, hovered card lift + pointer
spotlight). Non-reference note: the pointer-follow spotlight is an enhancement in the reference's visual
language, on top of the exact reference lift hover.

## 2026-07-25m — Library-wide verified bug sweep + a new token-integrity gate to stop regressions
Status: accepted
Decision: Ran a comprehensive 4-way parallel audit of ALL 115 components (each finding verified by
reading the code, to avoid noise) plus built an automated token-integrity check. The library was mostly
clean; fixed every verified defect:
- **currency-input** parse used `escapeRegExp` on `String.split`/`replace` (which match LITERALLY, not as
  regex), so a `.` group / `,` decimal (European format) never matched — `"1.234,50"` parsed to 1.234.
  Fixed to literal split/join; verified US/EU/negative all parse correctly.
- **password-input** reveal toggle had `tabIndex={-1}` → keyboard users could never unmask (WCAG 2.1.1).
  Removed it.
- **app-shell** all six parts leaked `className`/`style` and merged `className` — the only closed-API
  violation in the library. Closed all six (`Omit<…,"className"|"style">`) + updated its stories.
- **combobox** `ComboboxList` leaked `className`/`style` (renders a real listbox div). Closed it.
- **number-input** description/error had no `id` and the input no `aria-describedby` → SR users never
  heard the error. Wired both.
- **checkbox / radio** disabled label never dimmed — `peer-data-[disabled]:text-text-faint` sat on a
  span that isn't a peer sibling (dead selector). Moved the dim to the text wrapper (a true peer) as
  `peer-data-[disabled]:opacity-45`, matching the reference's 45%-row-opacity disabled state.
- **bar-chart** stacked y-extent used the NET per-category sum while the render stacks pos/neg
  separately → mixed-sign categories overflowed the plot. Now bounds pos-stack-top and neg-stack-bottom
  independently.
- **sparkline** `bar` variant positioned bars on the line points (plot edges) → first/last bars clipped
  the viewBox. Now laid out in per-index slots (browser-verified).
- **prompt-composer** post-submit clear bypassed `onValueChange`; **card** `beam` branch dropped a caller
  `onMouseMove`; **list** focus ring was 2px (→3px); **currency/search/otp** inputs lit the hover border
  (accent-strong) on focus instead of the brand `border-primary`. All fixed.
Anti-regression: added **`.agent/scripts/verify-tokens.mjs`** — an airtight gate that flags any
`var(--x)` used with NO fallback that is defined by nobody (index.css, the component itself, or a known
Base UI/Tailwind runtime var). This is the exact class of bug that kept recurring (the `--track` groove
rendered nothing). Wired `npm run verify` = typecheck + lint + conformance + tokens, and documented it in
REFERENCE_FIDELITY.md. A static invalid-CLASS check (e.g. `border-strong`) was evaluated and rejected as
too false-positive-prone (it matches doc-comment prose); those are caught by the existing conformance
hygiene + the parallel audits instead.
Reason: The maintainer was overwhelmed by the volume of bugs/deviations. A verified full-library sweep
plus an automated token gate converts "keep finding bugs by hand" into "the gate catches the recurring
class automatically."
Impact: 15 component fixes + the new gate. No public API changes except app-shell/combobox CLOSING their
API (removing an unintended `className` hatch) — consumers passing `className` there now get a type error
(correct per the closed-API decision 2026-07-19h). All gates green: typecheck, lint, conformance 115/115,
token integrity, build, build-storybook; currency parse + sparkline browser/logic-verified.

## 2026-07-25n — Recurring build: don't stop at unattended checkpoints; batch heavy gates to end-of-run; token-budget-aware loop
Status: accepted
Decision: Two changes to raise components-built-per-run, without touching the (secret-bearing) trigger
prompt — the trigger delegates all build behavior to `.agent/`, so these docs are the real lever.
(1) `prompts/recurring-build.md` previously told the loop to "STOP and request human review at every
10th component / category boundary." These runs are UNATTENDED, so that halted them early (well before
the token budget) — a bigger cap than gate overhead. Rewrote the loop to keep building continuously
across those checkpoints (record a one-line note instead), and to stop only when: the queue is empty,
the session's token budget is nearly spent (finish current component → end-of-run), or a genuine
blocker (same fix ×3 / unfixable hard gate). Made budget-aware stopping explicitly "correct, not a
failure — the next run continues."
(2) `guides/BUILD_GUIDE.md` ran the FULL gate suite (incl. `npm run build` + `npm run build-storybook`,
the slow ones) after EVERY component. Split into a fast per-component inner loop (tsc +
verify-conformance <name> + verify-tokens, committed/pushed per component for crash-resilience) and the
expensive whole-project gates (lint + build + build-storybook) run ONCE at end-of-run. Trade-off: an
intermediate push is only fast-gated, so a rare MDX/story error surfaces at end-of-run (or the next
run's end gate) rather than per component — acceptable on a build branch, and the run never ends red.
Reason: yesterday's low count (15) was partly the 2×/day Saturday schedule, but per-run output was also
capped by the unattended-checkpoint stop and the repeated slow gates. Removing both lets each session
convert its full token budget into components.
Impact: applies to every future scheduled run (they read `.agent/` fresh each run). Pairs with the
schedule change (more, shorter-interval runs). Machine gates unchanged in substance — same checks, just
re-timed (fast ones per component, heavy ones once per run).

## 2026-07-26a — Build runs must STAY IN LANE: no play-test-suite greening, no neighbor edits mid-run
Status: accepted
Decision: A manual run built only 6 new components (file-management category) and then spent the rest
of its session context greening the whole Storybook **interaction (play-test) suite** — commit
"green the Storybook interaction suite (561/561)" rewrote 27 files across ~19 PRE-EXISTING components
(dialog, menu, popover, select, toast, segmented-control, carousel, …) and even added test-runner deps
to package.json. That diversion (not the token budget) is why throughput cratered: the account had
tokens left, but the session's CONTEXT was consumed by a library-wide maintenance pass, so few new
components got built. It also violated CREATE rule #2 (don't rewrite neighbors).
Tightened the loop docs so a build run stays in its lane:
- `prompts/recurring-build.md`: added a "STAY IN YOUR LANE" section — build only NEW components; do NOT
  run/green the Storybook interaction (play-test) suite; do NOT edit existing/neighbor components; do
  NOT touch package.json/deps unless a new component needs one; log pre-existing red as a ONE-LINE
  REVIEW finding and keep building. End-of-run gates are COMPILE-only (tsc/build/build-storybook), and
  a run only fixes compile failures IT introduced (pre-existing failures → REVIEW note, not a fix).
- `guides/BUILD_GUIDE.md`: same clarification on the end-of-run gate.
Reason: the earlier throughput fixes (no checkpoint stop, batch heavy gates) worked — the run built 6
in one category without stopping — but a new sink appeared: voluntary library-wide test-suite greening
inside a build run. Suite greening is valuable but is a dedicated REVIEW task, not part of CREATE; it
must not steal a build run's context.
Impact: future recurring runs convert their full context into new components; play-test-suite
maintenance is deferred to explicit REVIEW work. No component/API change — docs only.

## 2026-07-26b — CORRECTION: the low-throughput cause was a DUPLICATE checkpoint stop, not suite-greening
Status: accepted (corrects 2026-07-26a)
Decision: 2026-07-26a misattributed the cause. Commit 8303540 ("green the Storybook interaction suite
561/561", which rewrote ~19 existing components) was authored by the MAINTAINER (matin gh
<nitamcode@gmail.com>) in their own interactive session — NOT by a scheduled/manual task run. The task
runs are authored "AEGIS build (Cowork)" <netbaanmanage@gmail.com>. So the task did NOT divert into
suite maintenance.
What the task actually did: it built the 6 File Management components (attachment-chip, file-card,
file-list, upload-progress, file-uploader, file-preview), committed "record 6 built components", and
STOPPED at the **category boundary** — with budget to spare. Root cause: the "STOP and request review"
checkpoint gate was DUPLICATED. 2026-07-25n removed it from `prompts/recurring-build.md`, but it also
lived in `checklists/COMPONENTS_STATUS.md` ("Every 10 → review; category boundary → sign-off"), and
`AGENT.md` told the RECURRING BUILD loop to honor that file's checkpoint gates. So the run still hit the
category-boundary stop.
Fix: relaxed the checkpoint gates in `COMPONENTS_STATUS.md` — unattended runs record a one-line note and
CONTINUE past the every-10 and category-boundary checkpoints (only "3 consecutive same-fix" still stops,
as BLOCKED); updated `AGENT.md` so the loop explicitly does not stop at those checkpoints. Kept the
2026-07-26a "stay in your lane" guidance (build runs shouldn't green the play-test suite or edit
neighbors — still sound), but corrected its now-false causal claim in the docs (that a run built only 6
because it greened the suite).
Reason: the earlier "no checkpoint stop" change (2026-07-25n) was correct but INCOMPLETE — the stop was
enforced in a second file I hadn't edited. This closes that gap.
Impact: the recurring loop now builds continuously across category boundaries; expect per-run counts to
rise past a single category. Attended review sessions may still use the checkpoints manually.

## 2026-07-26c — Per-run ceiling is the session's agentic-TURN budget; cut per-component tool calls
Status: accepted
Decision: After the checkpoint-stop fix (2026-07-26b), runs improved 6→8 components and now cross
category boundaries (verified: a run built sso-provider-buttons…bottom-navigation across the auth +
mobile categories, then stopped at 8 on its own "approaching budget" condition). No artificial
doc-level stop remains (swept every `.agent/*.md`). Evidence points to the binding limit being the
**per-session agentic-turn budget** (tool-call count), not context/tokens: at 8 small components the
context is well under half a 200k window, yet the run wraps up cleanly. Each component was spending
~15 tool calls — notably THREE separate gate commands and a full fetch/rebase/**push per component**
(~3 calls each) — so ~8 components exhausts the turn budget.
Fix (the only remaining lever short of a platform change): cut tool calls per component.
- `prompts/recurring-build.md`: added "SPEND TURNS LIKE THEY'RE THE SCARCE RESOURCE" — run the three
  per-component gates as ONE chained `&&` command; write each file in a single Write; **commit per
  component but PUSH in batches (every ~5 + end of run)**, not per component; don't re-run passed
  gates or re-read docs. Reworded the "budget" stop so the loop does NOT stop early "to be safe".
- `guides/BUILD_GUIDE.md`: per-component gates collapsed to one chained command; push rules changed
  from per-component to batched.
Reason: removing the artificial stop was necessary but not sufficient — the run now hits the real
per-session turn ceiling. Halving the tool-calls per component (≈15→≈8) should let materially more
components fit before that ceiling. The remaining hard ceiling is a platform per-session cap that only
higher run FREQUENCY can scale past.
Impact: expect per-run counts to rise beyond ~8; if they don't, the residual limit is the platform
per-session budget (not removable via docs). Trade-off: batched push means a crashed run may lose up
to ~5 unpushed local commits (the next run rebuilds them from the queue).

## 2026-07-26 — Column Filter ships text + select; range filtering deferred
Status: accepted
Decision: `column-filter.tsx` (roadmap #134, Recommended/Tables & Data Grid, dep Data Table) ships as
a config-driven per-column filter with two modes — `text` ("contains" query → string) and `select`
(Checkbox list → string[]) — as a trigger + Popover that emits the value and marks itself active. It
does NOT own filtering; the consumer applies the emitted value to their Data Table.
Reason: These two modes cover the overwhelming majority of column filters and are fully verifiable
without a browser. Numeric/date RANGE filtering needs range inputs (two-thumb slider or two date
fields) whose interaction is browser-verification-heavy; folding it in now would bloat the API before
the range primitives are settled.
Impact: A follow-up run adds an additive `type="range"` mode (not a fork) once a shared range control
lands. Mirrors the honestly-scoped precedents: Combobox single-select (2026-07-23), static chart
renderers (2026-07-23/07-25), Currency Input over generic mask (2026-07-24), Lightbox single-image
(2026-07-25g).

## 2026-07-26b — Multi-select lands, fulfilling the Combobox deferral
Status: accepted
Decision: `multi-select.tsx` (roadmap #43, dep Combobox + Tag) ships as the multi-select field the
Combobox decision (2026-07-23) deferred to. It is built on the SAME Base UI Combobox primitive in
`multiple` mode using the primitive's native `Chips` / `Chip` / `ChipRemove` parts, and reuses the
AEGIS `Combobox` content/list/item for the popup so single- and multi-select are visually identical.
Reason: The primitive gained first-class chip parts, so multi-select no longer needs a hand-rolled
chip engine — the risk that motivated the 2026-07-23 deferral is gone. Values are `string[]`, matching
the string-item shape the single-select Combobox already uses.
Impact: 2026-07-23's "compose Checkbox in Card / wait for #43" guidance is now satisfied — use
`MultiSelect` for multi-value autocomplete. Object-valued items (value≠label) remain a future additive
enhancement, consistent with the single-select's current string-item scope.

## 2026-07-26c — Command Palette ships flat; heading groups deferred
Status: accepted
Decision: `command-palette.tsx` (roadmap #33, dep Dialog + Combobox) ships as a modal ⌘K launcher
pairing the AEGIS Dialog with the Base UI Combobox primitive in `inline` mode (always-open listbox
inside the dialog). v1 renders a FLAT filtered command list (icon · label · shortcut, keyword search,
built-in ⌘K/Ctrl-K hotkey).
Reason: The primitive's inline mode gives the search/list/keyboard behaviour for free and is fully
verifiable headless. Section HEADINGS need either static groups (whose labels linger when all their
items filter out) or custom filtering that bypasses the primitive — both are additive polish, not core.
Impact: A follow-up adds grouped headings as an additive layer over the same primitive. Consistent with
the honestly-scoped precedents (static chart renderers, Combobox single-select, Lightbox single-image,
Column Filter text+select).
