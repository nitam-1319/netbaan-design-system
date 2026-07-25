import * as React from "react"

import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * AEGIS — Skeleton Templates (Empty & Loading States, closed API)
 *
 * Ready-made loading placeholders assembled from the `Skeleton` primitive:
 * `SkeletonText`, `SkeletonCard`, `SkeletonList`, and `SkeletonTable`. Instead
 * of hand-placing individual skeleton bars for every loading state, drop in the
 * template that matches the content you're waiting on and it renders a
 * correctly-proportioned, animated placeholder.
 *
 * Each template's root is a polite `role="status"` region with `aria-busy` and
 * an sr-only label, so the loading state is announced once while the individual
 * shapes stay `aria-hidden` (they carry no meaning). Swap the template for the
 * real content when the data arrives.
 *
 * Public API is CLOSED — no `className` / `style`; shape the placeholder with
 * the semantic props (`lines`, `rows`, `columns`, `size`, …). All colour and
 * motion come from the `Skeleton` token. See `.agent/rules/API_RULES.md`.
 */

/* ------------------------------------------------------ internal helpers -- */

const lineHeight = {
  sm: "h-2.5",
  md: "h-3.5",
  lg: "h-4",
} as const

type LineSize = keyof typeof lineHeight

/** One skeleton bar, sized via the Skeleton `render` composition pattern. */
function Bar({ className }: { className: string }) {
  return <Skeleton render={<div className={cn(className)} />} />
}

/** Root status wrapper shared by every template. */
function TemplateRoot({
  slot,
  label,
  className,
  children,
}: {
  slot: string
  label: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      data-slot={slot}
      role="status"
      aria-busy="true"
      aria-live="polite"
      className={cn(className)}
    >
      <span className="sr-only">{label}</span>
      {children}
    </div>
  )
}

/* ------------------------------------------------------------ Text block -- */

interface SkeletonTextProps {
  /** Number of text lines. Default 3. */
  lines?: number
  /** Line thickness. Default `"md"`. */
  size?: LineSize
  /** Shorten the final line to look like a paragraph end. Default true. */
  lastLineShort?: boolean
  /** Accessible loading label (sr-only). Default "Loading content". */
  label?: string
}

/** A paragraph of placeholder text lines; the last line is shortened. */
function SkeletonText({
  lines = 3,
  size = "md",
  lastLineShort = true,
  label = "Loading content",
}: SkeletonTextProps) {
  const count = Math.max(1, lines)
  return (
    <TemplateRoot slot="skeleton-text" label={label} className="flex flex-col gap-2">
      {Array.from({ length: count }, (_, i) => {
        const isLast = i === count - 1
        const width = isLast && lastLineShort && count > 1 ? "w-3/5" : "w-full"
        return <Bar key={i} className={cn(lineHeight[size], width)} />
      })}
    </TemplateRoot>
  )
}

/* ------------------------------------------------------------------ Card -- */

interface SkeletonCardProps {
  /** Show a media/thumbnail block at the top. Default true. */
  media?: boolean
  /** Number of body text lines under the title. Default 2. */
  lines?: number
  /** Accessible loading label (sr-only). Default "Loading card". */
  label?: string
}

/** A card placeholder: optional media block, a title bar, and body lines. */
function SkeletonCard({
  media = true,
  lines = 2,
  label = "Loading card",
}: SkeletonCardProps) {
  const count = Math.max(0, lines)
  return (
    <TemplateRoot
      slot="skeleton-card"
      label={label}
      className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
    >
      {media && <Bar className="h-32 w-full rounded-lg" />}
      <Bar className="h-4 w-1/2" />
      {count > 0 && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: count }, (_, i) => (
            <Bar
              key={i}
              className={cn("h-3", i === count - 1 ? "w-4/5" : "w-full")}
            />
          ))}
        </div>
      )}
    </TemplateRoot>
  )
}

/* ------------------------------------------------------------------ List -- */

interface SkeletonListProps {
  /** Number of rows. Default 3. */
  rows?: number
  /** Show a leading avatar circle per row. Default true. */
  avatar?: boolean
  /** Accessible loading label (sr-only). Default "Loading list". */
  label?: string
}

/** A list placeholder: rows of an optional avatar plus two text lines. */
function SkeletonList({
  rows = 3,
  avatar = true,
  label = "Loading list",
}: SkeletonListProps) {
  const count = Math.max(1, rows)
  return (
    <TemplateRoot slot="skeleton-list" label={label} className="flex flex-col gap-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex items-center gap-3">
          {avatar && <Bar className="size-10 shrink-0 rounded-full" />}
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Bar className="h-3.5 w-1/3" />
            <Bar className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </TemplateRoot>
  )
}

/* ----------------------------------------------------------------- Table -- */

/** Columns are a fixed set so the grid maps to static Tailwind classes (no
 *  inline style, no JIT-purge risk) — mirrors the `Grid` primitive's `cols`. */
const tableCols = {
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
} as const

type TableColumns = keyof typeof tableCols

interface SkeletonTableProps {
  /** Number of body rows. Default 4. */
  rows?: number
  /** Number of columns (2–6). Default 4. */
  columns?: TableColumns
  /** Render a slightly stronger header row. Default true. */
  header?: boolean
  /** Accessible loading label (sr-only). Default "Loading table". */
  label?: string
}

/** A table/grid placeholder: an optional header row plus a grid of cells. */
function SkeletonTable({
  rows = 4,
  columns = 4,
  header = true,
  label = "Loading table",
}: SkeletonTableProps) {
  const rowCount = Math.max(1, rows)
  const colCount = columns
  const colsClass = tableCols[columns]
  return (
    <TemplateRoot
      slot="skeleton-table"
      label={label}
      className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3"
    >
      {header && (
        <div className={cn("grid gap-3 pb-1", colsClass)}>
          {Array.from({ length: colCount }, (_, c) => (
            <Bar key={c} className="h-4 w-2/3" />
          ))}
        </div>
      )}
      {Array.from({ length: rowCount }, (_, r) => (
        <div key={r} className={cn("grid gap-3", colsClass)}>
          {Array.from({ length: colCount }, (_, c) => (
            <Bar key={c} className={cn("h-3.5", c === 0 ? "w-3/4" : "w-1/2")} />
          ))}
        </div>
      ))}
    </TemplateRoot>
  )
}

export { SkeletonText, SkeletonCard, SkeletonList, SkeletonTable }
export type {
  SkeletonTextProps,
  SkeletonCardProps,
  SkeletonListProps,
  SkeletonTableProps,
}
