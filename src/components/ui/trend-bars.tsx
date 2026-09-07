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

/** Shortest a NON-ZERO bar may draw, in px — a quiet period is still a period. */
const MIN_BAR = 6

/**
 * Height of the zero stub, in px. Deliberately shorter and paler than
 * `MIN_BAR`: an EMPTY period must not look like a small one, and it must not
 * look like an ABSENT one either. Arrivals are bursty — one week held 20,583
 * first-sightings and the next held 371 — and the payload ships every week
 * including the zeros, so a zero that renders as nothing turns a real quiet
 * week into a hole in the strip.
 */
const ZERO_STUB = 2

type TrendBarsDatum = {
  /** Period label under the bar (e.g. "May"). Kept short — it never wraps. */
  label: React.ReactNode
  /** Value for the period. Negatives are clamped to zero. */
  value: number
  /**
   * A second value for the same period, drawn as a paired bar — "found vs
   * closed". Omit for a single-series strip.
   */
  compare?: number
  /**
   * This period is still in progress. It is drawn hatched rather than filled,
   * so an incomplete current week does not read as a collapse in discovery
   * every Monday morning. Note this is the opposite of `emphasis="last"`,
   * which paints the final bar at FULL strength.
   */
  provisional?: boolean
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
   * How a zero period is drawn. `stub` (default) is a short baseline sliver
   * that reads as "nothing happened"; `none` draws nothing, which is only
   * right when the series cannot contain zeros.
   */
  zeroMark?: "stub" | "none"
  /** Legend name for the primary series. Only shown when a `compare` is present. */
  valueLabel?: React.ReactNode
  /** Legend name for the `compare` series. */
  compareLabel?: React.ReactNode
  /** Word appended to a provisional period in the text equivalent. */
  provisionalLabel?: string
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
  zeroMark = "stub",
  valueLabel,
  compareLabel,
  provisionalLabel = "in progress",
  formatValue = (value) => value.toLocaleString(),
}: TrendBarsProps) {
  const values = data.map((d) => Math.max(0, d.value))
  const compares = data.map((d) =>
    d.compare == null ? null : Math.max(0, d.compare)
  )
  const hasCompare = compares.some((v) => v != null)
  // Scale against the set's own peak: a fixed ceiling would flatten a quiet
  // asset into stubs and hide the very shape the strip exists to show.
  // Both series share one peak: a paired strip is only readable if the two
  // bars in a column are measured against the same thing.
  const peak =
    [...values, ...compares.filter((v): v is number => v != null)].reduce(
      (max, v) => Math.max(max, v),
      0
    ) || 1

  function barHeight(value: number): number | null {
    if (value <= 0) return zeroMark === "none" ? null : ZERO_STUB
    return Math.max(MIN_BAR, Math.round((value / peak) * MAX_BAR))
  }
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
          const compare = compares[index]
          const emphasised = emphasis === "last" && index === lastIndex
          const provisional = datum.provisional === true

          const bar = (
            role: "value" | "compare",
            raw: number,
            fill: string
          ) => {
            const h = barHeight(raw)
            if (h == null) return null
            const zero = raw <= 0
            return (
              <div
                data-slot={
                  role === "value" ? "trend-bars-bar" : "trend-bars-bar-compare"
                }
                data-emphasised={emphasised || undefined}
                data-zero={zero || undefined}
                data-provisional={provisional || undefined}
                aria-hidden
                // The one computed value that must reach `style`: a bar height is
                // a continuous function of the data, which no utility can spell.
                style={{ height: `${h}px` }}
                className={cn(
                  "w-full rounded-t",
                  zero ? "rounded-none bg-border-strong" : fill,
                  // A hatch, not a paler fill: paler would read as "fewer",
                  // which is exactly the wrong reading for an incomplete period.
                  !zero &&
                    provisional &&
                    "bg-[repeating-linear-gradient(135deg,currentColor_0_2px,transparent_2px_5px)] text-primary"
                )}
              />
            )
          }

          return (
            <div
              key={index}
              data-slot="trend-bars-column"
              className="flex min-w-0 flex-1 flex-col items-center gap-[7px]"
            >
              <div className="flex w-full items-end gap-[3px]">
                {bar(
                  "value",
                  value,
                  emphasised
                    ? "bg-primary"
                    : "bg-[color-mix(in_oklch,var(--primary),transparent_62%)]"
                )}
                {hasCompare && compare != null
                  ? bar(
                      "compare",
                      compare,
                      "bg-[color-mix(in_oklch,var(--success),transparent_45%)]"
                    )
                  : null}
              </div>
              <span
                data-slot="trend-bars-label"
                aria-hidden
                className="font-mono text-[9px] leading-none font-medium whitespace-nowrap text-muted-foreground"
              >
                {datum.label}
              </span>
            </div>
          )
        })}
      </div>

      {hasCompare && (valueLabel != null || compareLabel != null) ? (
        <div
          data-slot="trend-bars-key"
          aria-hidden
          className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground"
        >
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-[2px] bg-primary" />
            {valueLabel}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-[2px] bg-[color-mix(in_oklch,var(--success),transparent_45%)]" />
            {compareLabel}
          </span>
          {data.some((d) => d.provisional) ? (
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-[2px] bg-[repeating-linear-gradient(135deg,currentColor_0_2px,transparent_2px_5px)] text-primary" />
              {provisionalLabel}
            </span>
          ) : null}
        </div>
      ) : null}

      {/* The bars are `role="img"`, so the numbers need a text equivalent. A
          list, not a table: there is one value per period and no header to read. */}
      <VisuallyHidden render={<div />}>
        <ul>
          {data.map((datum, index) => (
            <li key={index}>
              {datum.label}: {formatValue(values[index])}
              {compares[index] != null
                ? ` / ${formatValue(compares[index] as number)}`
                : ""}
              {datum.provisional ? ` (${provisionalLabel})` : ""}
            </li>
          ))}
        </ul>
      </VisuallyHidden>
    </div>
  )
}

export { TrendBars }
export type { TrendBarsProps, TrendBarsDatum }
