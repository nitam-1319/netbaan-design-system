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
