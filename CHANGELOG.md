# Changelog

Consumer-facing. Lives at repo root (not under `.agent/`) because application developers read it.

## How this file is produced
- The **release notes** section per version is **generated** from Conventional Commits during the
  release flow (`.agent/guides/RELEASE_GUIDE.md`). Do not hand-write those.
- The **Migration** subsections below are a **curated** layer on top — the human/agent adds these
  for breaking changes, because a generated log lists *what* changed but not *how to migrate*.
- Keep the two reconciled: every breaking change in the generated notes must have a Migration entry.

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
