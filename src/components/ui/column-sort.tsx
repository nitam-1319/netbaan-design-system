import * as React from "react"
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

/**
 * AEGIS — Column Sort (Tables & Data Grid)
 *
 * The standalone sorting affordance for a hand-rolled `Table` — the sibling of
 * Column Filter / Column Visibility. `SortableColumnHeader` renders a real
 * `<th>` (so the accessible `columnheader` + `aria-sort` semantics are native)
 * whose label is a click-to-sort AEGIS `Button`; the `useColumnSort` hook owns
 * the single-active-column tri-state cycle (asc → desc → unsorted) and hands you
 * a `sortRows` helper so the actual reordering matches Data Table exactly.
 *
 * You keep the data; the component emits sort state and reflects it (icon +
 * native `aria-sort`, never colour alone). Public API is CLOSED — no `className`
 * / `style` on any part. See `.agent/rules/API_RULES.md` and the Data Table
 * reference for the shared sort semantics.
 */

/* ------------------------------------------------------------------ Types -- */

export type ColumnSortDirection = "asc" | "desc"

export interface ColumnSortState {
  /** The id of the currently sorted column. */
  columnId: string
  direction: ColumnSortDirection
}

type ColumnSortAlign = "start" | "center" | "end"

export interface UseColumnSortOptions {
  /** Controlled sort state (`null` = unsorted). */
  sort?: ColumnSortState | null
  /** Uncontrolled initial sort. */
  defaultSort?: ColumnSortState | null
  /** Fires with the next sort state on every toggle. */
  onSortChange?: (sort: ColumnSortState | null) => void
}

/** Comparable extractors keyed by column id. */
export type ColumnComparators<TRow> = Record<string, (row: TRow) => string | number>

export interface UseColumnSortReturn<TRow> {
  /** The current sort state (`null` = unsorted). */
  sort: ColumnSortState | null
  /** Cycle a column's sort: unsorted → asc → desc → unsorted. */
  toggle: (columnId: string) => void
  /** The sort direction for a column, or `false` when it is not the sorted one. */
  getDirection: (columnId: string) => ColumnSortDirection | false
  /** Return a sorted copy of `data` using the comparator for the active column. */
  sortRows: (data: TRow[], comparators: ColumnComparators<TRow>) => TRow[]
}

/* ------------------------------------------------------------------- Hook -- */

function useColumnSort<TRow>({
  sort,
  defaultSort = null,
  onSortChange,
}: UseColumnSortOptions = {}): UseColumnSortReturn<TRow> {
  const [internal, setInternal] = React.useState<ColumnSortState | null>(defaultSort)
  const isControlled = sort !== undefined
  const state = isControlled ? sort! : internal

  const commit = React.useCallback(
    (next: ColumnSortState | null) => {
      if (!isControlled) setInternal(next)
      onSortChange?.(next)
    },
    [isControlled, onSortChange]
  )

  const toggle = React.useCallback(
    (columnId: string) => {
      commit(
        !state || state.columnId !== columnId
          ? { columnId, direction: "asc" }
          : state.direction === "asc"
            ? { columnId, direction: "desc" }
            : null
      )
    },
    [state, commit]
  )

  const getDirection = React.useCallback(
    (columnId: string): ColumnSortDirection | false =>
      state && state.columnId === columnId ? state.direction : false,
    [state]
  )

  const sortRows = React.useCallback(
    (data: TRow[], comparators: ColumnComparators<TRow>): TRow[] => {
      if (!state) return data
      const getValue = comparators[state.columnId]
      if (!getValue) return data
      const factor = state.direction === "asc" ? 1 : -1
      return [...data].sort((a, b) => {
        const av = getValue(a)
        const bv = getValue(b)
        if (av < bv) return -1 * factor
        if (av > bv) return 1 * factor
        return 0
      })
    },
    [state]
  )

  return { sort: state, toggle, getDirection, sortRows }
}

/* --------------------------------------------------------- Header <th> part -- */

const alignClass: Record<ColumnSortAlign, string> = {
  start: "text-start",
  center: "text-center justify-center",
  end: "text-end justify-end",
}

type ThProps = Omit<React.ComponentProps<"th">, "className" | "style" | "children" | "align">

export interface SortableColumnHeaderProps extends ThProps {
  /** Column name — the header text and the trigger's accessible name. */
  label: React.ReactNode
  /** Plain-text label used for ARIA when `label` is not a string. */
  labelText?: string
  /** Current sort direction for this column, or `false` when unsorted. */
  direction: ColumnSortDirection | false
  /** Fires when the header is activated (wire to the hook's `toggle`). */
  onSort: () => void
  /** Horizontal alignment; numeric columns should use `"end"`. Default `"start"`. */
  align?: ColumnSortAlign
  /** Trigger size. Default `"sm"`. */
  size?: "sm" | "md" | "lg"
}

function SortableColumnHeader({
  label,
  labelText,
  direction,
  onSort,
  align = "start",
  size = "sm",
  ...props
}: SortableColumnHeaderProps) {
  const ariaSort: React.AriaAttributes["aria-sort"] =
    direction === "asc" ? "ascending" : direction === "desc" ? "descending" : "none"
  const name = labelText ?? (typeof label === "string" ? label : undefined)

  return (
    <th
      {...props}
      data-slot="sortable-column-header"
      data-align={align}
      aria-sort={ariaSort}
      className={cn(
        "h-10 px-3 text-start align-middle font-medium text-muted-foreground whitespace-nowrap"
      )}
    >
      <div className={cn("flex items-center", alignClass[align])}>
        <Button
          type="button"
          variant="ghost"
          size={size}
          onClick={onSort}
          aria-label={name ? `Sort by ${name}` : undefined}
        >
          <span>{label}</span>
          {direction === "asc" ? (
            <ArrowUp aria-hidden />
          ) : direction === "desc" ? (
            <ArrowDown aria-hidden />
          ) : (
            <ChevronsUpDown aria-hidden className="opacity-50" />
          )}
        </Button>
      </div>
    </th>
  )
}

export { useColumnSort, SortableColumnHeader }
