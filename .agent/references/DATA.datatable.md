# Reference — DataTable (Data tier)

Target source: `src/components/ui/data-table.tsx`. Teaches the patterns primitives and dialogs
never exercise.

## Patterns this reference locks in
- **Composition**: `DataTable.Root / Header / Body / Row / Cell / Pagination / Toolbar`, plus a
  column-definition API (typed columns), not hardcoded markup.
- **State coverage — all four must be first-class, not afterthoughts**:
  - **Loading**: skeleton rows (tokenized), not a spinner over blank space.
  - **Empty**: dedicated empty state with guidance, distinct from loading.
  - **Error**: recoverable error surface with retry affordance.
  - **Filled**: normal render.
- **Large data / performance**: virtualization for long lists; stable keys; memoized rows;
  avoid re-rendering the whole body on single-cell change. Document the row-count threshold at
  which virtualization engages.
- **Selection / sorting**: controlled + uncontrolled, canonical prop names
  (`value`/`onValueChange` for selection; `orientation` where relevant).
- **Accessibility**: proper table semantics (`role`/`scope`), keyboard cell/row navigation,
  sort state announced via `aria-sort`.
- **RTL/LTR**: column order and alignment flip correctly; numeric columns keep sensible alignment.
- **Responsive**: define the small-screen strategy (horizontal scroll vs stacked) explicitly.
- **Tokens**: density (`compact`/`comfortable`) via token-driven `density` prop.

## Required stories
Loading, Empty, Error, Filled (small + large/virtualized), Sort, Select, RTL, Persian, Dark, and
each responsive breakpoint.
