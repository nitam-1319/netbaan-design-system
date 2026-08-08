# Changelog

Consumer-facing. Lives at repo root (not under `.agent/`) because application developers read it.

## How this file is produced
- The **release notes** section per version is **generated** from Conventional Commits during the
  release flow (`.agent/guides/RELEASE_GUIDE.md`). Do not hand-write those.
- The **Migration** subsections below are a **curated** layer on top — the human/agent adds these
  for breaking changes, because a generated log lists *what* changed but not *how to migrate*.
- Keep the two reconciled: every breaking change in the generated notes must have a Migration entry.

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
