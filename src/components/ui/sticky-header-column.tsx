import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Sticky Header / Column (Tables & Data Grid)
 *
 * A scroll-bounded table whose header row (and, per-cell, a leading column) stay
 * pinned while the body scrolls. It mirrors the AEGIS `Table` part set — swap
 * `Table*` for `StickyTable*` — but bounds the height and pins headers/columns
 * with `position: sticky`, so large grids stay navigable without losing context.
 *
 * `StickyTableHead` is always pinned to the top; pass `sticky` on a
 * `StickyTableHead` / `StickyTableCell` to also pin that column to the inline
 * start (the top-start cell layers above both). Sticky surfaces are opaque
 * (`bg-card` / `bg-background`) so scrolled content never bleeds through.
 *
 * Public API is CLOSED — no `className` / `style`. Tokens only. The scroll
 * region's `maxHeight` is a semantic number prop the component applies itself.
 * See `.agent/rules/API_RULES.md`.
 */

type StickyTableProps = Omit<React.ComponentProps<"table">, "className" | "style"> & {
  /** Max height (px) of the scroll region before the body scrolls under the header. Default 360. */
  maxHeight?: number
}

function StickyTable({ maxHeight = 360, ...props }: StickyTableProps) {
  return (
    <div
      data-slot="sticky-table-container"
      // The scroll region holds a non-focusable table, so make it focusable for
      // keyboard scroll access (scrollable-region-focusable).
      tabIndex={0}
      className={cn(
        "relative w-full overflow-auto rounded-lg border border-border",
        "outline-none focus-visible:ring-3 focus-visible:ring-accent-soft"
      )}
      style={{ maxHeight }}
    >
      <table
        data-slot="sticky-table"
        className={cn("w-full border-separate border-spacing-0 text-sm")}
        {...props}
      />
    </div>
  )
}

function StickyTableHeader({
  ...props
}: Omit<React.ComponentProps<"thead">, "className" | "style">) {
  return <thead data-slot="sticky-table-header" {...props} />
}

function StickyTableBody({
  ...props
}: Omit<React.ComponentProps<"tbody">, "className" | "style">) {
  return <tbody data-slot="sticky-table-body" {...props} />
}

function StickyTableFooter({
  ...props
}: Omit<React.ComponentProps<"tfoot">, "className" | "style">) {
  return (
    <tfoot
      data-slot="sticky-table-footer"
      className={cn(
        "[&_td]:sticky [&_td]:bottom-0 [&_td]:z-20 [&_td]:border-t [&_td]:border-border [&_td]:bg-muted [&_td]:font-medium [&_td]:text-foreground"
      )}
      {...props}
    />
  )
}

function StickyTableRow({
  ...props
}: Omit<React.ComponentProps<"tr">, "className" | "style">) {
  return (
    <tr
      data-slot="sticky-table-row"
      className={cn("group/sticky-row transition-colors hover:bg-muted/50")}
      {...props}
    />
  )
}

type StickyCellProps = { sticky?: boolean }

function StickyTableHead({
  sticky = false,
  ...props
}: Omit<React.ComponentProps<"th">, "className" | "style"> & StickyCellProps) {
  return (
    <th
      data-slot="sticky-table-head"
      data-sticky={sticky || undefined}
      className={cn(
        "sticky top-0 z-20 h-10 border-b border-border bg-card px-3 text-start align-middle font-medium whitespace-nowrap text-muted-foreground",
        sticky && "start-0 z-30"
      )}
      {...props}
    />
  )
}

function StickyTableCell({
  sticky = false,
  ...props
}: Omit<React.ComponentProps<"td">, "className" | "style"> & StickyCellProps) {
  return (
    <td
      data-slot="sticky-table-cell"
      data-sticky={sticky || undefined}
      className={cn(
        "border-b border-border p-3 align-middle text-foreground",
        sticky && "sticky start-0 z-10 bg-background"
      )}
      {...props}
    />
  )
}

function StickyTableCaption({
  ...props
}: Omit<React.ComponentProps<"caption">, "className" | "style">) {
  return (
    <caption
      data-slot="sticky-table-caption"
      className={cn("mt-4 text-sm text-muted-foreground")}
      {...props}
    />
  )
}

export {
  StickyTable,
  StickyTableHeader,
  StickyTableBody,
  StickyTableFooter,
  StickyTableRow,
  StickyTableHead,
  StickyTableCell,
  StickyTableCaption,
}
