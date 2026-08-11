# Changelog

Consumer-facing. Lives at repo root (not under `.agent/`) because application developers read it.

## How this file is produced
- The **release notes** section per version is **generated** from Conventional Commits during the
  release flow (`.agent/guides/RELEASE_GUIDE.md`). Do not hand-write those.
- The **Migration** subsections below are a **curated** layer on top — the human/agent adds these
  for breaking changes, because a generated log lists *what* changed but not *how to migrate*.
- Keep the two reconciled: every breaking change in the generated notes must have a Migration entry.

---

## [0.5.1]

Patch: one `FilterBar` behaviour fix. **No breaking changes — no migration
required.** Component count unchanged at 223.

### Fixed

- **`FilterBar`** — the hairline between the hoisted selection and the rest of
  the options now withdraws once it would misdescribe the order, instead of
  claiming that a checked row below it is unselected. Option order is frozen for
  the duration of a panel visit, so checking an option further down deliberately
  does not move it up; the line, placed unconditionally at the first unselected
  row, then described the order as it was when the visit began rather than as it
  is. Nothing becomes ambiguous when the line goes — the row tint and the
  checkbox state carry the selection on their own.

---

## [0.5.0]

Minor: one additive component and two additive props, all aimed at the list
page — the toolbar above the table, and the two affordances that reach it from
the keyboard. **No breaking changes — no migration required.** Component count
222 → 223.

### Added

- **`FilterBar`** — the single filter toolbar for every list page. The page
  declares a `facets` array saying *what* it filters on and the bar decides its
  own controls, so list pages stop each re-improvising a chip row plus a rank of
  dropdowns. Three facet types (`multi`, `date`, `text`) cover the product's
  list surfaces. Four things about it are deliberate:
  - **The panel is portalled.** List pages render inside `Card > CardContent`,
    which clips, and the panel is taller than a short list card. Portalling plus
    collision flipping is what keeps the footer's `Clear all` and `Done`
    reachable at all — it is load-bearing, not incidental.
  - **A summary sentence replaces the chip row.** Chips cost a whole row of
    vertical space to say what one sentence says, and they push the table
    further down the page as they accumulate, so the filtered list gets harder
    to see the more you filter it.
  - **Selected-first ordering is frozen per visit.** Selected options hoist to
    the top, but the order is captured only where a visit begins — opening the
    panel, switching facets — and never on click, because re-sorting live slides
    the next row out from under the pointer as it is being checked.
  - **The active facet is resolved, never assumed.** The facet set changes under
    an open panel when the org switches or a wizard step re-filters its options;
    resolving against the live set is what keeps the pane from rendering blank
    against a stale id.

  Option rows carry their own checkbox semantics (`role="checkbox"` on the row,
  `Checkbox` rendered as a presentational span) because nesting a button inside
  a button is invalid HTML. A facet-options failure is contained to the pane, so
  a dead options endpoint never takes the list down with it. Filtering applies
  live; `Done` only closes. Every string the bar renders on its own account is
  overridable through `labels`, the same contract as `Pagination` and
  `DataTable`.
- **`SearchInput` `shortcut`** — a single-key page shortcut (conventionally
  `"/"`) that renders as a trailing `Kbd` hint and focuses the field from
  anywhere on the page, ignoring presses made while another text control already
  has focus. The hint is shown rather than revealed on hover, so the affordance
  is discoverable, and it yields the trailing edge to the clear button the moment
  the field has something to clear.
- **`Card` `spotlight`** — the pointer-tracked accent bloom on its own, without
  the affordances that say "control". `interactive` bundles four treatments: the
  bloom, a 3px hover lift, an accent border and a pointer cursor. The first says
  the surface is alive; the other three say it is clickable. A board of resting
  cards wants the first and must not have the second, because a reader who
  clicks a card that rises and lights its border and gets nothing has been lied
  to. `spotlight` composes with every variant, `beam` included — there the bloom
  belongs to the inner panel, since that is the element carrying `--card`. The
  layer parks off-surface and returns there on `mouseleave`, so a card the
  pointer has left is never left glowing where it last saw one.

---

## [0.4.0]

Minor: two additive components for the two-panel record browser — a column of
entities you pick from, beside a column of what you picked. **No breaking
changes — no migration required.** Component count 220 → 222.

### Added

- **`SelectionRail`** — the entity column. A sticky card over a bounded scroll
  box with overscroll containment, so a long rail never steals the page's
  scroll, and a "load more" control pinned under the list rather than inside
  it. The open row is marked three ways at once (`aria-current`, an accent
  edge, a marker line under the label) so the selection survives a glance, a
  screenshot and a monochrome print. Counts are each entity's own figure; the
  rail never totals them, because a sum across loaded pages describes the
  fetching, not the data. Handles its own loading, loading-more and empty
  states.
- **`RecordCard`** — the detail column's record, collapsed by default, with
  `RecordCardHeader` / `RecordCardFields` / `RecordCardField` /
  `RecordCardFooter` parts. Two things make it a component rather than a
  `Collapse` and some spans:
  - The header is a `role="button"` div, because it carries the record's own
    controls and a button inside a button is invalid HTML. That costs it a real
    button's keyboard behaviour, so it wires Enter and Space itself — with
    `preventDefault` on Space, without which a page where everything starts
    collapsed is unreachable by keyboard.
  - A `masked` field's value never reaches the DOM. `masked` renders dots
    *instead of* the children, so a screen reader, a text copy and a page
    snapshot all see what the eye sees. Masking by colour or by an overlay is
    not masking.

  Fields stack one per row against a fixed label column rather than in an
  auto-fit grid: harvested values have wildly unequal heights — an email is one
  line, a concatenated hash bundle is twenty — and in a grid every cell on a row
  stretches to the tallest of them, stranding a long value's neighbours at the
  top of an otherwise empty column.

Both are token-only with closed APIs; the count and hint chips compose `Badge`,
so their hues come from the shared tone ramp. Neither knows anything about the
domain they were built for.

---

## [0.3.0]

Minor: five additive components, one additive prop, and a build fix that
restores styling the 0.2.x releases shipped broken. **No breaking changes — no
migration required.** Component count 215 → 220.

### Fixed

#### Utility classes declared in `src/lib/` were dropped from the build
`src/styles.css` only scanned `./components/**`, so Tailwind never saw the class
names in `src/lib/media.ts`. The names still landed in the markup, so nothing
errored — the elements just rendered unstyled. In practice the asset cards' 132px
media strip collapsed to a bare caption. `styles.css` now also scans `./lib/**`.
**This affects anyone on 0.2.0 or 0.2.1 using `ScreenshotThumb`,
`MiniLocationMap` or `AssetTriageCard`** — upgrade to pick up the fix.

### Added

- **`SeverityDonut`** — the findings ring, one wedge per severity sized by its
  share with the total in the hole. One component with a `size` prop, rather
  than a separate drawing per surface. It owns the severity order, omits zero
  rungs, drops the gap when only one rung is populated, and fits the centre
  label so a four-digit total stays inside the hole instead of pushing its card
  taller.
- **`SeverityLegend`** — the five-rung tally that sits under a page title: one
  pill per severity carrying its colour, its name, and its count.
- **`PageHeaderBand`** — the console's page header: kicker, title and counts
  line on an accent-tinted hero surface, with the page's actions at the inline
  end.
- **`TrendBars`** — a findings-over-time strip, one bar per period with the
  newest emphasised. Every period's value is spelled out for assistive tech, so
  the trend is never bar-height-only.
- **`ScanSwitcher`** — makes "which scan am I looking at?" answerable on an
  asset detail page: newer/older steppers either side of the current scan, with
  a Latest/Historical pill.

#### `AssetTriageCard` — new `findingsTone` prop
Additive, defaults to `"muted"` (the previous appearance). Accepts `"muted" |
"default" | "high" | "critical"` to escalate the footer findings readout as the
count climbs. How many findings count as alarming stays the consuming app's
policy; the prop only says how each rung is drawn.

#### Theme — aurora drift for `PageHeaderBand`
`--animate-aurora` and `--animate-aurora-slow`: two blurred ellipses drifting
behind the page title on deliberately mismatched periods, one reversed, so they
never resynchronise into a visible loop. Decorative, and swept by the existing
reduced-motion rule onto the resting frame.

### Changed (no API break)

#### `AssetTriageCard` — `href` now makes the whole card the hit target
Previously only the title text was the link. With `href` set the card is now a
single stretched anchor, matching `CitationSourceCard` and
`FindingVulnerabilityCard`: the title is still the accessible name, but a click
anywhere on the card — media included — follows it. The prop and its type are
unchanged. If you relied on clicks landing only on the title, that behaviour is
gone.

Internally the card now composes `SeverityDonut` instead of `DonutChart`, and
its footer is bottom-aligned so footers in a stretched grid row share a baseline.

---

## [0.2.1]

**No package changes.** The published tarball is identical to `0.2.0` — same
components, same API, same `dist/`. Nothing to migrate, and no reason to upgrade
from `0.2.0` except to sit on the version the release pipeline last built
cleanly.

Cut as a fresh number after `v0.2.0`'s publish could not be confirmed. The only
repo change between the two tags is `.github/workflows/release.yml` (the release
actions moved to `@v5`, targeting the Node 24 runner), which is not shipped in
`files`.

---

## [0.2.0]

Minor rather than patch: eight additive components and one additive `Callout`
tone. **No breaking changes — no migration required.** Component count 207 → 215.

### Added

#### Asset triage surface (5 components)
A visual-triage grid for discovered assets, built bottom-up so the pieces are
usable on their own:

- **`ScreenshotThumb`** — website capture at a fixed media height, cropped to
  fill. With no capture it degrades to a hatched slot with a mono caption,
  never a broken image or an empty gap.
- **`MiniLocationMap`** — the IP-card counterpart: a dark regional map cropped
  around one point, with a pulsing marker and a chip naming the place.
- **`AssetTriageCard`** — one discovered asset, opened by a picture of it.
  Domain cards lead with a `ScreenshotThumb`, IP cards with a
  `MiniLocationMap`; both fill the same `media` slot, so a mixed grid reads
  uniformly.
- **`ScoreRing`** — one bounded score as a ring with the figure printed inside;
  arc length is the score's share of the scale, arc colour its severity band.
  Sized for a table cell, exposed as `role="meter"`.
- **`SummaryStatBar`** — the band that opens a list page: one card divided into
  equal cells, each summarising the same population a different way.

#### Summary primitives (2 components)
- **`AttentionTile`** — a count and the thing it counts on a tone-tinted plate
  ("218 · Critical findings open"); the smallest unit of a needs-attention strip.
- **`BreakdownDonut`** — a compact ring plus a counted key, sized for a summary
  cell rather than a chart panel. Every legend row spells out its name and its
  count, so the breakdown is never wedge-colour-only (WCAG 1.4.1).

#### Navigation (1 component)
- **`DetailSidebar`** — a detail panel docked to the inline end that overlays
  the page without taking it over: inspect one row while the list stays live.

#### `Callout` — new `accent` tone
Additive. `<Callout tone="accent">` renders a primary-tinted plate with a
`Sparkles` default icon. Existing tones are unchanged.

#### Theme — two decorative entrance animations
`--animate-donut-in` (ring settling into place) and `--animate-panel-in` (panel
arriving from the inline end, so it follows writing direction in RTL). Both are
swept entirely by the existing reduced-motion rule — the content is fully
legible without them.

### Note on version numbering
`0.1.1` and `0.1.2` were bumped locally but never tagged or published. `v0.1.0`
is the previous release; nothing is missing between it and `v0.2.0`.

---

## [0.1.0]

Minor rather than patch: this removes `FormProviderActions`, and every shadow in
the system changes value.

### Migration notes (curated)

#### Shadows all change value (no action required, but expect visual diffs)
`--glass`, `--shadow`, `--shadow-soft` and `--shadow-bloom` are now aliases onto
a new ordered elevation scale (`--elevation-0..5`), where each level is a
two-layer contact + ambient shadow. The **names** still work, so nothing breaks
at build time — but shadows across the UI shift, and attached overlays (Menu,
Popover, Tooltip, Select) deliberately sit one level lower than detached ones
(Dialog, Drawer, Toast). Prefer `shadow-elevation-*` in new code.

#### `Alert` — hue moved from `variant` to `tone`
`variant` now selects the fill treatment (`soft` | `solid` | `outline`), matching
Badge/Tag/Callout. Legacy hue names still work and are mapped automatically, with
a dev-only warning; a bare `<Alert>` is unchanged.

    <Alert variant="destructive">   ->   <Alert tone="danger">
    <Alert variant="info">          ->   <Alert tone="info">

Legacy support is removed in v0.3.0.

#### Charts — pass `palette="categorical"` for non-severity series
`--chart-1..5` is the severity ramp, so a chart of environments or owners
previously rendered in the alarm hues. `ChartContainer` now takes
`palette="severity" | "categorical"`; the latter uses the new cool-only
`--cat-1..6`. Existing charts are unchanged by default.

    <ChartContainer label="Assets by environment" palette="categorical" …>

`patternBySeverity` (opt-in) adds a hatch-density channel so severity survives
greyscale and colour-vision deficiency.

#### Fonts are now self-hosted
`@netbaan-project/ui/fonts.css` no longer reaches out to Google Fonts; woff2 ship
in `dist/fonts/`. No consumer change is needed, but if your CSP restricted
`fonts.googleapis.com` / `fonts.gstatic.com` you can drop those entries.

#### `FormProviderActions` removed
Breaking: `form-provider.tsx` exported a second `FormActions` that the barrel had to
alias to `FormProviderActions` to avoid a name collision — two exports doing the same
job under near-identical names. The standalone `form-actions.tsx` is now the single
public component.

Migration:

    import { FormProviderActions } from "@netbaan-project/ui";
    <FormProviderActions>…</FormProviderActions>

    ->

    import { FormActions } from "@netbaan-project/ui";
    <FormActions stack>…</FormActions>

`stack` reproduces the removed component's behaviour (reversed column below `sm`, so
the primary action sits on top on narrow viewports). Omit it if you want the default
single-row layout. The removed component had no other props.

<!-- Template for a breaking change:

## Button v2
Breaking: removed `color` prop in favor of `variant`.
Migration:
    <Button color="red" />   ->   <Button variant="danger" />
Deprecated: `color` (removed in v2; warned in v1.x).
-->
