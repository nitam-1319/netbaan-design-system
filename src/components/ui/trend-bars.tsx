"use client";

import * as React from "react"

import { cn } from "@/lib/utils"
import { VisuallyHidden } from "@/components/ui/visually-hidden"

/**
 * AEGIS — Trend Bars
 *
 * A findings-over-time strip: one bar per period, the newest emphasised. It sits
 * inside a detail card beside the severity donut, answering "is this getting
 * worse?" at a glance — not "by exactly how much", which is the axis-and-tooltip
 * job that belongs to `BarChart`.
 *
 *   <TrendBars
 *     label="Findings over time"
 *     data={[{ label: "Jun", value: 12 }, … , { label: "May", value: 29 }]}
 *   />
 *
 * The distinction matters, because the two are not interchangeable. `BarChart`
 * sizes itself to its parent, draws axes and gridlines, and takes a series
 * definition; it needs room. `TrendBars` is a fixed-height sparkline-with-labels
 * that fits a card header block, has no axes, and reads as texture. Reaching for
 * `BarChart` here produces a chart that dwarfs the card it lives in; reaching for
 * `TrendBars` where a reader must compare exact values under-serves them.
 *
 * Bars are scaled against the tallest value in the set, NOT against a fixed
 * ceiling: the strip shows shape over time, and a fixed ceiling would flatten a
 * quiet asset into an unreadable row of stubs. Every bar keeps a 6px floor so a
 * period with zero findings still renders as a period rather than vanishing —
 * a gap in the strip would read as missing data.
 *
 * The last bar carries `--primary` at full strength and the rest sit at 62%
 * transparency, so "now" is legible without a legend. Pass `emphasis="none"` for
 * a series where the final period is not privileged.
 *
 * Public API is CLOSED — no `className` / `style`. Labels are `ReactNode` so the
 * consuming app owns translation and date formatting. Colour is token-only.
 * See `.agent/rules/API_RULES.md`.
 */

/** Tallest a bar may draw, in px. The label row sits under this. */
const MAX_BAR = 82

/** Shortest a bar may draw, in px — a zero period is still a period. */
const MIN_BAR = 6

type TrendBarsDatum = {
  /** Period label under the bar (e.g. "May"). Kept short — it never wraps. */
  label: React.ReactNode
  /** Value for the period. Negatives are clamped to zero. */
  value: number
}

type TrendBarsProps = {
  /** Accessible name for the strip (e.g. "Findings over time"). Required. */
  label: string
  /** One entry per period, oldest first. Required. */
  data: TrendBarsDatum[]
  /**
   * `"last"` (default) paints the final bar at full strength — the reading is
   * "where we are now". `"none"` paints every bar alike.
   */
  emphasis?: "last" | "none"
  /**
   * Format a value for the screen-reader table behind the strip.
   * Default `toLocaleString()`.
   */
  formatValue?: (value: number) => string
}

function TrendBars({
  label,
  data,
  emphasis = "last",
  formatValue = (value) => value.toLocaleString(),
}: TrendBarsProps) {
  const values = data.map((d) => Math.max(0, d.value))
  // Scale against the set's own peak: a fixed ceiling would flatten a quiet
  // asset into stubs and hide the very shape the strip exists to show.
  const peak = values.reduce((max, v) => Math.max(max, v), 0) || 1
  const lastIndex = data.length - 1

  return (
    <div data-slot="trend-bars" className="flex min-w-0 flex-col gap-2">
      <div
        role="img"
        aria-label={label}
        className="flex h-[104px] items-end gap-2"
      >
        {data.map((datum, index) => {
          const value = values[index]
          const emphasised = emphasis === "last" && index === lastIndex
          return (
            <div
              key={index}
              data-slot="trend-bars-column"
              className="flex min-w-0 flex-1 flex-col items-center gap-[7px]"
            >
              <div
                data-slot="trend-bars-bar"
                data-emphasised={emphasised || undefined}
                aria-hidden
                // The one computed value that must reach `style`: a bar height is
                // a continuous function of the data, which no utility can spell.
                style={{ height: `${Math.max(MIN_BAR, Math.round((value / peak) * MAX_BAR))}px` }}
                className={cn(
                  "w-full rounded-t",
                  emphasised
                    ? "bg-primary"
                    : "bg-[color-mix(in_oklch,var(--primary),transparent_62%)]"
                )}
              />
              <span
                data-slot="trend-bars-label"
                aria-hidden
                className="whitespace-nowrap font-mono text-[9px] font-medium leading-none text-muted-foreground"
              >
                {datum.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* The bars are `role="img"`, so the numbers need a text equivalent. A
          list, not a table: there is one value per period and no header to read. */}
      <VisuallyHidden render={<div />}>
        <ul>
          {data.map((datum, index) => (
            <li key={index}>
              {datum.label}: {formatValue(values[index])}
            </li>
          ))}
        </ul>
      </VisuallyHidden>
    </div>
  )
}

export { TrendBars }
export type { TrendBarsProps, TrendBarsDatum }
