# @netbaan/ui — Composition Recipes (seed)

A **small, deliberately non-exhaustive** set of patterns that teach how AEGIS
primitives fit together. This is a grammar primer, not a lookup table — an agent
should generalise from these to novel screens, guided by each component's
`composesWith` metadata (see `catalog.json`) and the type system (invalid
compositions fail typecheck). Add real patterns here as they recur.

> Rule of thumb: assemble from existing components. If you reach for something
> not in the catalog, re-check the catalog first — it probably exists.

## Form

`FormProvider` → `FormField` (wraps `FieldLabel` + an input + `ValidationMessage`)
→ `FormActions` (submit / cancel `Button`s).

```tsx
<FormProvider onSubmit={handle}>
  <FormField name="email" label="Email">
    <TextField type="email" />
  </FormField>
  <FormActions>
    <Button variant="ghost">Cancel</Button>
    <Button type="submit">Save</Button>
  </FormActions>
</FormProvider>
```

## Data table with controls

`Toolbar` (search + `ColumnVisibility` + `ColumnFilter`) above a `DataTable`
(`RowSelection`, `ColumnSort`, `ExpandableRows`), with `Pagination` below.

## Dialog-driven action

`Dialog` (or `ConfirmDialog` for a yes/no) wrapping a short `Form`. For a
mobile-first surface use `BottomSheet`; for a persistent side panel use `Drawer`.
(See each one's **Avoid when** line in `CATALOG.md` to choose.)

## App frame

`AppShell` (`AppShellHeader` + `AppShellSidebar` + `AppShellMain`) as the page
frame; put a `Navbar`/`Masthead` in the header and `NavigationMenu` in the
sidebar. Guard the whole tree with `ThemeProvider`.

## Empty / loading / error states

Swap the content region between `Skeleton` (loading), `EmptyState`/`NoResults`
(no data), and `ErrorState` (failure) — never leave a bare blank region.

## Status & severity

Use `Badge`/`StatusPill` for read-only status labels, `SeverityBadge` for the
critical→info scale, `StatusIndicator` for a live dot. Never make a `Badge`
interactive — that is a `Tag` or `Chip`.
