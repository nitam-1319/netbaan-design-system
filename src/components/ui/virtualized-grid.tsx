"use client";

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Virtualized Grid (Advanced / Tables & Data Grid)
 *
 * A row-virtualized data grid: only the rows in (and just around) the viewport
 * are in the DOM, so tens of thousands of rows scroll smoothly. It is
 * config-driven with typed `columns` (like `DataTable`) and renders the AEGIS
 * table surface language — a sticky header on `surface-2`, `border` dividers,
 * `muted` row hover — using a CSS grid so column tracks stay aligned without a
 * native `<table>`.
 *
 * Accessibility is the hard part of virtualization and is handled explicitly:
 * the container is an ARIA `grid` with `aria-rowcount` / `aria-colcount`
 * reflecting the FULL dataset, and every rendered row/cell carries its true
 * 1-based `aria-rowindex` / `aria-colindex`. So assistive tech is told the real
 * size and position even though most rows are not materialised.
 *
 * SCOPE: fixed `rowHeight` windowing (variable/measured row heights, horizontal
 * virtualization, and sort/selection are out of scope — compose `DataTable` for
 * the last two), consistent with the honestly-scoped precedents. Public API is
 * CLOSED — no `className` / `style`; treatment is semantic props. Tokens only.
 * See `.agent/rules/API_RULES.md`.
 */

export type VirtualizedGridAlign = "start" | "center" | "end"

export interface VirtualizedGridColumn<TRow> {
  /** Stable identifier (used for keys). */
  id: string
  /** Header content. When not a plain string, also set `headerLabel`. */
  header: React.ReactNode
  /** Accessible plain-text header, used when `header` is not a string. */
  headerLabel?: string
  /** Renders the cell for a given row. */
  cell: (row: TRow, rowIndex: number) => React.ReactNode
  /** CSS grid track for this column. Default `minmax(0, 1fr)`. */
  width?: string
  /** Horizontal alignment; numeric columns should use `"end"`. Default `"start"`. */
  align?: VirtualizedGridAlign
}

type DivProps = Omit<React.ComponentProps<"div">, "className" | "style" | "children">

export interface VirtualizedGridProps<TRow> extends DivProps {
  /** Typed column definitions. */
  columns: VirtualizedGridColumn<TRow>[]
  /** The full row set — only the visible window is rendered. */
  data: TRow[]
  /** Stable row id — required for React keys. */
  getRowId: (row: TRow, index: number) => string
  /** Accessible name for the grid. Always provide one. */
  label: string
  /** Fixed row height in pixels. Default `44`. */
  rowHeight?: number
  /** Number of rows visible at once (sets the scroll viewport height). Default `8`. */
  visibleRows?: number
  /** Extra rows rendered above/below the viewport to smooth scrolling. Default `4`. */
  overscan?: number
  /** Fires when a row is activated (click / Enter / Space). */
  onRowActivate?: (row: TRow, rowIndex: number) => void
  /** Message shown when `data` is empty. Default "No rows". */
  emptyMessage?: React.ReactNode
}

const alignClass: Record<VirtualizedGridAlign, string> = {
  start: "justify-start text-start",
  center: "justify-center text-center",
  end: "justify-end text-end",
}

function VirtualizedGrid<TRow>({
  columns,
  data,
  getRowId,
  label,
  rowHeight = 44,
  visibleRows = 8,
  overscan = 4,
  onRowActivate,
  emptyMessage = "No rows",
  ...props
}: VirtualizedGridProps<TRow>) {
  const [scrollTop, setScrollTop] = React.useState(0)
  const total = data.length
  const viewportHeight = Math.max(1, visibleRows) * rowHeight

  const template = React.useMemo(
    () => columns.map((c) => c.width ?? "minmax(0, 1fr)").join(" "),
    [columns]
  )

  const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan)
  const windowCount = Math.ceil(viewportHeight / rowHeight) + overscan * 2
  const end = Math.min(total, start + windowCount)

  const rows: React.ReactNode[] = []
  for (let i = start; i < end; i++) {
    const row = data[i]
    const id = getRowId(row, i)
    rows.push(
      <div
        key={id}
        role="row"
        aria-rowindex={i + 2 /* +1 for 1-based, +1 for the header row */}
        data-slot="virtualized-grid-row"
        tabIndex={onRowActivate ? 0 : undefined}
        onClick={onRowActivate ? () => onRowActivate(row, i) : undefined}
        onKeyDown={
          onRowActivate
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  onRowActivate(row, i)
                }
              }
            : undefined
        }
        className={cn(
          "absolute inset-x-0 grid items-center border-b border-border text-sm text-foreground transition-colors",
          "hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none",
          onRowActivate && "cursor-pointer"
        )}
        style={{
          top: i * rowHeight,
          height: rowHeight,
          gridTemplateColumns: template,
        }}
      >
        {columns.map((column, ci) => (
          <div
            key={column.id}
            role="gridcell"
            aria-colindex={ci + 1}
            data-slot="virtualized-grid-cell"
            data-align={column.align ?? "start"}
            className={cn(
              "flex min-w-0 items-center truncate px-3",
              alignClass[column.align ?? "start"]
            )}
          >
            {column.cell(row, i)}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div
      data-slot="virtualized-grid"
      role="grid"
      aria-label={label}
      aria-rowcount={total + 1 /* header counts as a row */}
      aria-colcount={columns.length}
      className={cn(
        "w-full overflow-hidden rounded-lg border border-border bg-card text-foreground"
      )}
      {...props}
    >
      {/* Header row (row index 1). */}
      <div
        role="row"
        aria-rowindex={1}
        data-slot="virtualized-grid-header"
        className={cn(
          "grid items-center border-b border-border bg-surface-2 text-xs font-medium text-muted-foreground"
        )}
        style={{ gridTemplateColumns: template, height: rowHeight }}
      >
        {columns.map((column, ci) => (
          <div
            key={column.id}
            role="columnheader"
            aria-colindex={ci + 1}
            data-slot="virtualized-grid-columnheader"
            data-align={column.align ?? "start"}
            className={cn(
              "flex min-w-0 items-center truncate px-3",
              alignClass[column.align ?? "start"]
            )}
          >
            {column.header}
          </div>
        ))}
      </div>

      {total === 0 ? (
        <div
          data-slot="virtualized-grid-empty"
          className={cn("px-3 py-10 text-center text-sm text-muted-foreground")}
        >
          {emptyMessage}
        </div>
      ) : (
        <div
          data-slot="virtualized-grid-viewport"
          // The body rows live in a rowgroup so `role="grid"` owns proper `row`
          // children (aria-required-children). `tabIndex={0}` gives the scroll
          // region keyboard access (scrollable-region-focusable).
          role="rowgroup"
          tabIndex={0}
          onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
          className={cn(
            "relative overflow-y-auto outline-none focus-visible:ring-3 focus-visible:ring-accent-soft"
          )}
          style={{ height: viewportHeight }}
        >
          {/* Full-height spacer establishes the scrollable range; rows are
              absolutely positioned within it at their true offset. It is purely
              presentational so the rows are exposed directly to the rowgroup. */}
          <div
            data-slot="virtualized-grid-canvas"
            role="presentation"
            className={cn("relative w-full")}
            style={{ height: total * rowHeight }}
          >
            {rows}
          </div>
        </div>
      )}
    </div>
  )
}

export { VirtualizedGrid }
