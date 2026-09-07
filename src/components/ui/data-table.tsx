"use client";

import * as React from "react"
import { ArrowDown, ArrowUp, ChevronsUpDown, TriangleAlert } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import {
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
} from "@/components/ui/empty-state"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

/**
 * AEGIS — Data Table (Data tier, closed API)
 *
 * An interactive, stateful table built on the semantic `Table` primitive plus
 * `Checkbox`, `Skeleton`, `Spinner` and `EmptyState`. It adds the four things a
 * bare table does not: typed columns, row selection, column sorting, and the
 * full set of async states (loading / empty / error / filled) as first-class
 * surfaces rather than afterthoughts.
 *
 * The public API is CLOSED — no `className` / `style` on any part. It is
 * config-driven: describe the data with a typed `columns` array (see
 * `DataTableColumn`) instead of hand-writing `<td>`s, so type inference flows
 * from the row shape to every cell. Density, alignment, selection and sort are
 * all semantic props. Composition slots (`toolbar`, `footer`) accept AEGIS
 * nodes — e.g. a `Pagination` — which is composition, not a styling hatch.
 *
 * See `.agent/references/DATA.datatable.md`, `.agent/rules/API_RULES.md`, and
 * `.agent/DECISIONS.md` (config-driven column API decision + escape-hatch policy).
 */

/* ------------------------------------------------------------------ Types -- */

export type DataTableAlign = "start" | "center" | "end"
export type DataTableSortDirection = "asc" | "desc"
export type DataTableDensity = "comfortable" | "compact"

export interface DataTableSort {
  /** The `id` of the sorted column. */
  columnId: string
  direction: DataTableSortDirection
}

export interface DataTableColumn<TRow> {
  /** Stable identifier for the column (used for sort state and keys). */
  id: string
  /** Header content. When it is not a plain string, also set `headerLabel`. */
  header: React.ReactNode
  /** Accessible plain-text header, used for ARIA when `header` is not a string. */
  headerLabel?: string
  /** Renders the cell for a given row. */
  cell: (row: TRow, rowIndex: number) => React.ReactNode
  /** Horizontal alignment; numeric columns should use `"end"`. Default `"start"`. */
  align?: DataTableAlign
  /** Enables click-to-sort on this column's header. Requires `sortValue`. */
  sortable?: boolean
  /** The comparable value used to sort this column. */
  sortValue?: (row: TRow) => string | number
  /**
   * Column width — a CSS length or a px number, emitted into a `<colgroup>`.
   * Requires `layout="fixed"` (which `variant="flush"` turns on by default).
   * Content-sized columns let one long hostname starve every column beside it;
   * a design that fixes ratios (`54px minmax(0,2.2fr) …`) needs this.
   */
  width?: string | number
  /** Minimum width in px for this column. */
  minWidth?: number
}

type DivProps = Omit<React.ComponentProps<"div">, "className" | "style">

export interface DataTableProps<TRow> extends Omit<DivProps, "children"> {
  /** Typed column definitions. */
  columns: DataTableColumn<TRow>[]
  /** The rows to render. */
  data: TRow[]
  /** Stable row id — required for selection and React keys. */
  getRowId: (row: TRow, index: number) => string
  /** Accessible caption describing the table's purpose (visually hidden). */
  caption: string

  /** Row density. Default `"comfortable"`. */
  density?: DataTableDensity

  /**
   * `card` (default) wraps the table in its own rounded, bordered surface and
   * puts `toolbar` / `footer` outside it. `flush` drops that surface and moves
   * both inside, so the table can BE the body of a `Card` the caller owns —
   * nesting the card variant inside a `Card` draws a second border around the
   * rows.
   */
  variant?: "card" | "flush"
  /**
   * Header treatment. `eyebrow` is the uppercase, tracked band on `--surface-2`
   * a dense list wants, with the sort affordance as a glyph beside the label
   * rather than a ghost `Button` around it.
   */
  headerVariant?: "default" | "eyebrow"
  /** Honour the columns' `width`s instead of sizing to content. */
  layout?: "auto" | "fixed"
  /** Width below which the table scrolls instead of crushing its columns. */
  minWidth?: number

  /**
   * Makes each row ONE control: the row itself takes the click, Enter and
   * Space, `aria-expanded` when `isRowActive` is supplied, and the hover tint.
   * Without it a page has to make one CELL a button, which puts the affordance
   * on a fifth of the row.
   */
  onRowActivate?: (row: TRow, rowIndex: number) => void
  /** Marks a row as the currently open one; drives `aria-expanded` and the tint. */
  isRowActive?: (row: TRow, rowIndex: number) => boolean
  /** Accessible name for an activatable row. Default: the row's ordinal. */
  getRowLabel?: (row: TRow, rowIndex: number) => string

  /** Show the loading (skeleton) surface. Takes priority over data/empty. */
  loading?: boolean
  /** Number of skeleton rows to render while loading. Default `5`. */
  loadingRowCount?: number

  /** Show the error surface with a retry affordance instead of the body. */
  error?: boolean
  /** Error heading. Default `"Something went wrong"`. */
  errorTitle?: React.ReactNode
  /** Error supporting text. */
  errorDescription?: React.ReactNode
  /** Retry handler; when provided, a retry button is shown on the error surface. */
  onRetry?: () => void

  /** Empty-state heading, shown when there are no rows. Default `"No data"`. */
  emptyTitle?: React.ReactNode
  /** Empty-state supporting text. */
  emptyDescription?: React.ReactNode
  /** Optional icon node for the empty state. */
  emptyIcon?: React.ReactNode

  /** Enables the selection checkbox column. */
  selectable?: boolean
  /** Controlled selected row ids. */
  selectedIds?: string[]
  /** Uncontrolled initial selection. */
  defaultSelectedIds?: string[]
  /** Fires when the selection changes (controlled or uncontrolled). */
  onSelectedIdsChange?: (ids: string[]) => void

  /** Controlled sort state (`null` = unsorted). */
  sort?: DataTableSort | null
  /** Uncontrolled initial sort. */
  defaultSort?: DataTableSort | null
  /** Fires when the sort state changes. */
  onSortChange?: (sort: DataTableSort | null) => void

  /** Optional content above the table (filters, search, bulk actions). */
  toolbar?: React.ReactNode
  /** Optional content below the table (e.g. a `Pagination`). */
  footer?: React.ReactNode
}

/* ------------------------------------------------------------- Utilities -- */

const alignClass: Record<DataTableAlign, string> = {
  start: "text-start",
  center: "text-center",
  end: "text-end",
}

const cellDensityClass: Record<DataTableDensity, string> = {
  comfortable: "py-3",
  compact: "py-1.5",
}

const headDensityClass: Record<DataTableDensity, string> = {
  comfortable: "h-10",
  compact: "h-8",
}

function useControllableState<T>(
  controlled: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void
): [T, (next: T) => void] {
  const [uncontrolled, setUncontrolled] = React.useState<T>(defaultValue)
  const isControlled = controlled !== undefined
  const value = isControlled ? (controlled as T) : uncontrolled
  const setValue = React.useCallback(
    (next: T) => {
      if (!isControlled) setUncontrolled(next)
      onChange?.(next)
    },
    [isControlled, onChange]
  )
  return [value, setValue]
}

/* ------------------------------------------------------------------ Root -- */

function DataTable<TRow>({
  columns,
  data,
  getRowId,
  caption,
  density = "comfortable",
  loading = false,
  loadingRowCount = 5,
  error = false,
  errorTitle = "Something went wrong",
  errorDescription = "The data couldn't be loaded. Please try again.",
  onRetry,
  emptyTitle = "No data",
  emptyDescription = "There's nothing to show here yet.",
  emptyIcon,
  selectable = false,
  selectedIds,
  defaultSelectedIds = [],
  onSelectedIdsChange,
  sort,
  defaultSort = null,
  onSortChange,
  toolbar,
  footer,
  variant = "card",
  headerVariant = "default",
  layout,
  minWidth,
  onRowActivate,
  isRowActive,
  getRowLabel,
  ...props
}: DataTableProps<TRow>) {
  const [selection, setSelection] = useControllableState<string[]>(
    selectedIds,
    defaultSelectedIds,
    onSelectedIdsChange
  )
  const [sortState, setSortState] = useControllableState<DataTableSort | null>(
    sort,
    defaultSort,
    onSortChange
  )

  const selectedSet = React.useMemo(() => new Set(selection), [selection])
  const columnCount = columns.length + (selectable ? 1 : 0)

  const sortedData = React.useMemo(() => {
    if (!sortState) return data
    const col = columns.find((c) => c.id === sortState.columnId)
    if (!col?.sortValue) return data
    const factor = sortState.direction === "asc" ? 1 : -1
    return [...data].sort((a, b) => {
      const av = col.sortValue!(a)
      const bv = col.sortValue!(b)
      if (av < bv) return -1 * factor
      if (av > bv) return 1 * factor
      return 0
    })
  }, [data, sortState, columns])

  const rowIds = React.useMemo(
    () => sortedData.map((row, i) => getRowId(row, i)),
    [sortedData, getRowId]
  )

  const allSelected = rowIds.length > 0 && rowIds.every((id) => selectedSet.has(id))
  const someSelected = rowIds.some((id) => selectedSet.has(id))

  const toggleAll = React.useCallback(
    (checked: boolean) => {
      if (checked) {
        const next = new Set(selectedSet)
        rowIds.forEach((id) => next.add(id))
        setSelection([...next])
      } else {
        const remove = new Set(rowIds)
        setSelection(selection.filter((id) => !remove.has(id)))
      }
    },
    [rowIds, selectedSet, selection, setSelection]
  )

  const toggleRow = React.useCallback(
    (id: string, checked: boolean) => {
      if (checked) setSelection([...new Set([...selection, id])])
      else setSelection(selection.filter((rowId) => rowId !== id))
    },
    [selection, setSelection]
  )

  const handleSort = React.useCallback(
    (column: DataTableColumn<TRow>) => {
      if (!column.sortable || !column.sortValue) return
      setSortState(
        !sortState || sortState.columnId !== column.id
          ? { columnId: column.id, direction: "asc" }
          : sortState.direction === "asc"
            ? { columnId: column.id, direction: "desc" }
            : null
      )
    },
    [sortState, setSortState]
  )

  const showBody = !loading && !error && sortedData.length > 0
  const showEmpty = !loading && !error && sortedData.length === 0

  const flush = variant === "flush"
  const resolvedLayout =
    layout ?? (columns.some((c) => c.width != null) ? "fixed" : "auto")
  const hasWidths = columns.some((c) => c.width != null || c.minWidth != null)

  const toolbarNode = toolbar ? (
    <div
      data-slot="data-table-toolbar"
      className={cn(
        "flex flex-wrap items-center gap-2",
        flush && "border-b border-border px-4 py-3"
      )}
    >
      {toolbar}
    </div>
  ) : null

  const footerNode = footer ? (
    <div
      data-slot="data-table-footer"
      className={cn(
        "flex flex-wrap items-center justify-between gap-2",
        flush && "border-t border-border px-4 py-3"
      )}
    >
      {footer}
    </div>
  ) : null

  return (
    <div
      data-slot="data-table"
      data-density={density}
      data-variant={variant}
      className={cn(flush ? "flex w-full flex-col" : "flex w-full flex-col gap-3")}
      {...props}
    >
      {toolbarNode}

      <div
        data-slot="data-table-surface"
        className={cn(
          flush
            ? "min-w-0"
            : "overflow-hidden rounded-lg border border-border bg-card"
        )}
      >
        <Table
          density={density === "compact" ? "compact" : "default"}
          headerVariant={headerVariant}
          layout={resolvedLayout}
          minWidth={minWidth}
        >
          <caption className="sr-only">{caption}</caption>
          {hasWidths ? (
            <colgroup>
              {selectable ? <col style={{ width: 44 }} /> : null}
              {columns.map((column) => (
                <col
                  key={column.id}
                  style={{
                    width: column.width,
                    minWidth: column.minWidth,
                  }}
                />
              ))}
            </colgroup>
          ) : null}

          <TableHeader>
            <TableRow>
              {selectable ? (
                <TableHead>
                  <div className={cn(headDensityClass[density], "flex items-center")}>
                    <Checkbox
                      checked={allSelected}
                      indeterminate={someSelected && !allSelected}
                      onCheckedChange={(checked) => toggleAll(checked)}
                      disabled={loading || error || rowIds.length === 0}
                      aria-label="Select all rows"
                    />
                  </div>
                </TableHead>
              ) : null}

              {columns.map((column) => {
                const isSorted = sortState?.columnId === column.id
                const ariaSort: React.AriaAttributes["aria-sort"] = column.sortable
                  ? isSorted
                    ? sortState!.direction === "asc"
                      ? "ascending"
                      : "descending"
                    : "none"
                  : undefined
                const label =
                  column.headerLabel ??
                  (typeof column.header === "string" ? column.header : column.id)

                return (
                  <TableHead
                    key={column.id}
                    aria-sort={ariaSort}
                    data-align={column.align ?? "start"}
                  >
                    <div className={cn(headDensityClass[density], "flex items-center", alignClass[column.align ?? "start"], (column.align ?? "start") === "end" && "justify-end", (column.align ?? "start") === "center" && "justify-center")}>
                      {column.sortable && headerVariant === "eyebrow" ? (
                        // The eyebrow band is a rule with labels on it; a ghost
                        // Button around each label turns it back into a row of
                        // controls, which is the treatment it exists to avoid.
                        <button
                          type="button"
                          onClick={() => handleSort(column)}
                          aria-label={`Sort by ${label}`}
                          className={cn(
                            "inline-flex cursor-pointer items-center gap-1 rounded-sm outline-none",
                            "hover:text-foreground focus-visible:ring-3 focus-visible:ring-accent-soft"
                          )}
                        >
                          <span>{column.header}</span>
                          <span aria-hidden className="text-[9px] leading-none">
                            {isSorted
                              ? sortState!.direction === "asc"
                                ? "\u2191"
                                : "\u2193"
                              : "\u2195"}
                          </span>
                        </button>
                      ) : column.sortable ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort(column)}
                          aria-label={`Sort by ${label}`}
                        >
                          <span>{column.header}</span>
                          {isSorted ? (
                            sortState!.direction === "asc" ? (
                              <ArrowUp aria-hidden />
                            ) : (
                              <ArrowDown aria-hidden />
                            )
                          ) : (
                            <ChevronsUpDown aria-hidden className="opacity-50" />
                          )}
                        </Button>
                      ) : (
                        <span>{column.header}</span>
                      )}
                    </div>
                  </TableHead>
                )
              })}
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading
              ? Array.from({ length: loadingRowCount }).map((_, rowIndex) => (
                  <TableRow key={`skeleton-${rowIndex}`} aria-hidden>
                    {selectable ? (
                      <TableCell>
                        <div className={cellDensityClass[density]}>
                          <Skeleton render={<div className="size-5 rounded-[6px]" />} />
                        </div>
                      </TableCell>
                    ) : null}
                    {columns.map((column) => (
                      <TableCell key={column.id}>
                        <div className={cellDensityClass[density]}>
                          <Skeleton render={<div className="h-4 w-[60%] rounded" />} />
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : null}

            {showBody
              ? sortedData.map((row, rowIndex) => {
                  const id = rowIds[rowIndex]
                  const isSelected = selectedSet.has(id)
                  return (
                    <TableRow
                      key={id}
                      data-state={isSelected ? "selected" : undefined}
                      {...(onRowActivate
                        ? {
                            // The ROW is the control. `tabIndex`/`role` rather
                            // than a nested <button>, because a button wrapping
                            // table cells is not valid markup — and a button in
                            // one cell puts the affordance on a fifth of the row.
                            role: "button" as const,
                            tabIndex: 0,
                            "aria-label":
                              getRowLabel?.(row, rowIndex) ?? `Row ${rowIndex + 1}`,
                            "aria-expanded": isRowActive
                              ? isRowActive(row, rowIndex)
                              : undefined,
                            "data-active":
                              isRowActive?.(row, rowIndex) ? "" : undefined,
                            onClick: () => onRowActivate(row, rowIndex),
                            onKeyDown: (e: React.KeyboardEvent<HTMLTableRowElement>) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault()
                                onRowActivate(row, rowIndex)
                              }
                            },
                          }
                        : {})}
                    >
                      {selectable ? (
                        <TableCell>
                          <div className={cn(cellDensityClass[density], "flex items-center")}>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) => toggleRow(id, checked)}
                              aria-label={`Select row ${rowIndex + 1}`}
                            />
                          </div>
                        </TableCell>
                      ) : null}
                      {columns.map((column) => (
                        <TableCell
                          key={column.id}
                          data-align={column.align ?? "start"}
                        >
                          <div className={cn(cellDensityClass[density], alignClass[column.align ?? "start"])}>
                            {column.cell(row, rowIndex)}
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  )
                })
              : null}

            {error ? (
              <TableRow>
                <TableCell colSpan={columnCount}>
                  <EmptyState role="alert">
                    <EmptyStateIcon>
                      <TriangleAlert aria-hidden />
                    </EmptyStateIcon>
                    <EmptyStateTitle>{errorTitle}</EmptyStateTitle>
                    <EmptyStateDescription>{errorDescription}</EmptyStateDescription>
                    {onRetry ? (
                      <EmptyStateActions>
                        <Button variant="outline" size="sm" onClick={onRetry}>
                          Try again
                        </Button>
                      </EmptyStateActions>
                    ) : null}
                  </EmptyState>
                </TableCell>
              </TableRow>
            ) : null}

            {showEmpty ? (
              <TableRow>
                <TableCell colSpan={columnCount}>
                  <EmptyState>
                    {emptyIcon ? <EmptyStateIcon>{emptyIcon}</EmptyStateIcon> : null}
                    <EmptyStateTitle>{emptyTitle}</EmptyStateTitle>
                    <EmptyStateDescription>{emptyDescription}</EmptyStateDescription>
                  </EmptyState>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>

      {loading ? (
        <div data-slot="data-table-loading" className={cn("flex items-center gap-2 text-sm text-muted-foreground")}>
          <Spinner size="sm" />
          <span>Loading data…</span>
        </div>
      ) : null}

      {footerNode}
    </div>
  )
}

export { DataTable }
