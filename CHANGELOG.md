# Changelog

Consumer-facing. Lives at repo root (not under `.agent/`) because application developers read it.

## How this file is produced
- The **release notes** section per version is **generated** from Conventional Commits during the
  release flow (`.agent/guides/RELEASE_GUIDE.md`). Do not hand-write those.
- The **Migration** subsections below are a **curated** layer on top — the human/agent adds these
  for breaking changes, because a generated log lists *what* changed but not *how to migrate*.
- Keep the two reconciled: every breaking change in the generated notes must have a Migration entry.

---

## [Unreleased]

### Migration notes (curated)

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
