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
  /**
   * Header height in px. Every list design here has a compact column strip over
   * taller rows (31px over 49px); pinning the header to `rowHeight` makes that
   * unreachable. Defaults to `rowHeight`.
   */
  headerHeight?: number
  /**
   * `card` (default) draws the grid's own rounded, bordered surface. `flush`
   * drops it, so the grid can be the body of a `Card` the caller owns without a
   * second border and a second radius around the rows.
   */
  variant?: "card" | "flush"
  /**
   * Render a whole row yourself, instead of the column `cell` renderers. The
   * built-in cell is `flex items-center truncate`, which cannot hold a host
   * over a muted meta line — a shape every list here uses. The grid still owns
   * the geometry: it hands you the row, its index and the height to fill.
   */
  renderRow?: (row: TRow, rowIndex: number) => React.ReactNode
  /**
   * Fires once when the scroller nears the end. Use it to reveal the next page.
   */
  onEndReached?: () => void
  /** How close to the end counts as reaching it, in px. Default `rowHeight * 8`. */
  endThreshold?: number
  /** Fires when a row is activated (click / Enter / Space). */
  onRowActivate?: (row: TRow, rowIndex: number) => void
  /** Message shown when `data` is empty. Default "No rows". */
  emptyMessage?: React.ReactNode
}


/* ------------------------------------------------------- useVirtualRows -- */

type UseVirtualRowsOptions = {
  /** Total number of rows in the FULL set. */
  count: number
  /** Height of one row in px. Every row is this tall. */
  rowHeight: number
  /** Height of the scrolling viewport in px. */
  viewportHeight: number
  /** Extra rows rendered above and below the viewport. Default `4`. */
  overscan?: number
  /**
   * Fires once when the scroller comes within `endThreshold` px of the end —
   * for revealing the next page. At 10,000 rows the canvas is 490,000px tall
   * and the scrollbar thumb is a few pixels of travel, so incremental loading
   * is not optional at this size.
   */
  onEndReached?: () => void
  /** How close to the end counts as reaching it, in px. Default `rowHeight * 8`. */
  endThreshold?: number
}

type UseVirtualRowsResult = {
  /** First row index to render (inclusive). */
  first: number
  /** Last row index to render (exclusive) — use as `slice(first, last)`. */
  last: number
  /** Top offset of the first rendered row, in px. */
  offsetTop: number
  /** Height of the spacer that establishes the scroll range, in px. */
  canvasHeight: number
  /** Current scroll offset, in px. */
  scrollTop: number
  /** Hand this to the scrolling element's `onScroll`. */
  onScroll: (event: React.UIEvent<HTMLElement>) => void
}

/**
 * The windowing arithmetic behind `VirtualizedGrid`, on its own.
 *
 * Windowing is arithmetic, not a look. A list that needs its own row markup —
 * a two-line first cell, a header shorter than a row, a hover treatment that is
 * not the grid's — should not have to give up windowing to get it, and at this
 * size windowing is not optional: 3,000 rows unwindowed is 42,000 DOM nodes, a
 * 152,764px-tall card and a ~2s freeze on every return to the list.
 *
 *   const { first, last, offsetTop, canvasHeight, onScroll } = useVirtualRows({
 *     count: rows.length, rowHeight: 49, viewportHeight: 49 * 8,
 *   })
 *
 * Render `rows.slice(first, last)` inside a `canvasHeight`-tall spacer,
 * translated down by `offsetTop`, and hand `onScroll` to the scroller.
 *
 * Fixed row height only: variable heights need measurement, which is a
 * different component rather than a flag on this one.
 */
function useVirtualRows({
  count,
  rowHeight,
  viewportHeight,
  overscan = 4,
  onEndReached,
  endThreshold,
}: UseVirtualRowsOptions): UseVirtualRowsResult {
  const [scrollTop, setScrollTop] = React.useState(0)
  // Fired-once latch: without it every scroll event inside the end zone asks
  // for another page.
  const endFired = React.useRef(false)

  const safeRowHeight = Math.max(1, rowHeight)
  const threshold = endThreshold ?? safeRowHeight * 8

  const first = Math.max(0, Math.floor(scrollTop / safeRowHeight) - overscan)
  const windowCount =
    Math.ceil(Math.max(1, viewportHeight) / safeRowHeight) + overscan * 2
  const last = Math.min(count, first + windowCount)

  // A new page arriving grows the set, which re-arms the callback.
  React.useEffect(() => {
    endFired.current = false
  }, [count])

  const onScroll = React.useCallback(
    (event: React.UIEvent<HTMLElement>) => {
      const el = event.currentTarget
      setScrollTop(el.scrollTop)
      if (!onEndReached) return
      const remaining = el.scrollHeight - el.scrollTop - el.clientHeight
      if (remaining <= threshold) {
        if (!endFired.current) {
          endFired.current = true
          onEndReached()
        }
      } else {
        endFired.current = false
      }
    },
    [onEndReached, threshold]
  )

  return {
    first,
    last,
    offsetTop: first * safeRowHeight,
    canvasHeight: count * safeRowHeight,
    scrollTop,
    onScroll,
  }
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
  headerHeight,
  visibleRows = 8,
  overscan = 4,
  variant = "card",
  renderRow,
  onRowActivate,
  onEndReached,
  endThreshold,
  emptyMessage = "No rows",
  ...props
}: VirtualizedGridProps<TRow>) {
  const total = data.length
  const viewportHeight = Math.max(1, visibleRows) * rowHeight
  const { first, last, canvasHeight, onScroll } = useVirtualRows({
    count: total,
    rowHeight,
    viewportHeight,
    overscan,
    onEndReached,
    endThreshold,
  })

  const template = React.useMemo(
    () => columns.map((c) => c.width ?? "minmax(0, 1fr)").join(" "),
    [columns]
  )

  const rows: React.ReactNode[] = []
  for (let i = first; i < last; i++) {
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
        {renderRow
          ? renderRow(row, i)
          : columns.map((column, ci) => (
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
      data-variant={variant}
      className={cn(
        "w-full text-foreground",
        variant === "card"
          ? "overflow-hidden rounded-lg border border-border bg-card"
          : "min-w-0"
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
        style={{ gridTemplateColumns: template, height: headerHeight ?? rowHeight }}
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
          onScroll={onScroll}
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
            style={{ height: canvasHeight }}
          >
            {rows}
          </div>
        </div>
      )}
    </div>
  )
}

export { VirtualizedGrid, useVirtualRows }
export type { UseVirtualRowsOptions, UseVirtualRowsResult }
