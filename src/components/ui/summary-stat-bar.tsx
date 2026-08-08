"use client";

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Summary Stat Bar (Domain / ASM)
 *
 * The band that opens a list page: one card divided into equal cells, each
 * summarising the same population a different way — a total, a breakdown ring,
 * a needs-attention strip. It exists so those cells read as ONE statement about
 * one scope, rather than as a row of unrelated widgets.
 *
 *   <SummaryStatBar label="Findings summary">
 *     <SummaryStatCell label="Total findings">…</SummaryStatCell>
 *     <SummaryStatCell label="By severity">…</SummaryStatCell>
 *   </SummaryStatBar>
 *
 * Cells are separated by a hairline on the **inline start**, so the rule falls
 * between cells in either writing direction, and the bar wraps to a grid when
 * the column narrows — no cell is ever crushed. Each cell tracks the pointer
 * with a soft accent spotlight, the same treatment interactive `Card`s use.
 *
 * The bar summarises; it does not own the data. Whatever populates the cells
 * must describe the same filtered scope as the list below it, or the summary
 * quietly lies about what the user is looking at.
 *
 * Public API is CLOSED — no `className` / `style`. See `.agent/rules/API_RULES.md`.
 */

type SummaryStatBarProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style"
> & {
  /** Accessible name for the region (e.g. "Findings summary"). Required. */
  label: string
  /**
   * Narrowest a cell may get before the bar wraps to another row, in px.
   * Default `300`.
   */
  minCellWidth?: number
}

function SummaryStatBar({
  label,
  minCellWidth = 300,
  children,
  ...props
}: SummaryStatBarProps) {
  return (
    <div
      data-slot="summary-stat-bar"
      role="region"
      aria-label={label}
      className={cn(
        "grid rounded-[14px] border border-border bg-card shadow-elevation-1",
        // `clip` not `hidden`: `hidden` would crop the focus ring of anything
        // interactive sitting against a cell edge.
        "overflow-clip",
        "[grid-template-columns:repeat(auto-fit,minmax(var(--cell-min),1fr))]"
      )}
      style={{ "--cell-min": `${minCellWidth}px` } as React.CSSProperties}
      {...props}
    >
      {children}
    </div>
  )
}

type SummaryStatCellProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style"
> & {
  /** Small uppercase heading for the cell (e.g. "By severity"). */
  label?: React.ReactNode
}

function SummaryStatCell({
  label,
  children,
  onMouseMove,
  ...props
}: SummaryStatCellProps) {
  // Pointer-tracked spotlight: write the local cursor position into --mx/--my,
  // read by the radial-gradient background. Behaviour only, not a style hatch.
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`)
    onMouseMove?.(e)
  }

  return (
    <div
      data-slot="summary-stat-cell"
      onMouseMove={handleMouseMove}
      className={cn(
        "flex min-w-0 flex-col justify-center gap-2.5 px-[22px] py-5",
        // The rule sits on the inline start, so it lands BETWEEN cells whether
        // the page runs left-to-right or right-to-left. `:first-child` on each
        // wrapped row would need a container query; the outer `overflow-clip`
        // hides the leading rule instead.
        "border-s border-border first:border-s-0",
        "bg-[radial-gradient(220px_circle_at_var(--mx,-400px)_var(--my,-400px),color-mix(in_oklch,var(--primary),transparent_87%),transparent_55%)]"
      )}
      {...props}
    >
      {label != null && (
        <span
          data-slot="summary-stat-cell-label"
          className="text-[11px] leading-snug font-semibold tracking-[0.04em] text-muted-foreground uppercase"
        >
          {label}
        </span>
      )}
      {children}
    </div>
  )
}

/**
 * The headline figure of a cell, with an optional trend line under it.
 *
 * `delta` must spell out its own direction in words — an arrow glyph and a
 * colour are both invisible to a screen reader and to a colour-blind user.
 */
type SummaryStatValueProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style"
> & {
  /** Secondary line under the value (e.g. a weekly delta). */
  delta?: React.ReactNode
}

function SummaryStatValue({ delta, children, ...props }: SummaryStatValueProps) {
  return (
    <div
      data-slot="summary-stat-value"
      className="flex flex-col gap-1"
      {...props}
    >
      <span className="font-heading text-[30px] leading-none font-bold tracking-[-0.02em] text-foreground tabular-nums">
        {children}
      </span>
      {delta != null && (
        <span data-slot="summary-stat-delta" className="font-mono text-[11px] tabular-nums">
          {delta}
        </span>
      )}
    </div>
  )
}

export { SummaryStatBar, SummaryStatCell, SummaryStatValue }
export type { SummaryStatBarProps, SummaryStatCellProps, SummaryStatValueProps }
