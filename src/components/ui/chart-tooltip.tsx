"use client";

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { useChart } from "@/components/ui/chart-container"

/**
 * AEGIS — Chart Tooltip
 *
 * The floating readout that shows the values under the pointer/focus on a
 * chart: an optional header (the x category or label) and one row per series —
 * a colour swatch, the series name, and its value. It reads the resolved
 * `series` from the shared `ChartContainer` context, so passing just a series
 * `key` fills in the matching colour and label automatically.
 *
 * This component is the tooltip **surface** — a controlled, presentational
 * card. Positioning and hover/focus tracking against the SVG marks are the
 * chart's responsibility (and are browser-verified in CI): render this inside a
 * portalled floating layer wherever the chart decides. Keeping the surface
 * separate lets it be verified deterministically without a browser.
 *
 *   <ChartTooltip
 *     label="March"
 *     items={[
 *       { key: "desktop", value: "1,204" },
 *       { key: "mobile", value: "842" },
 *     ]}
 *   />
 *
 * Public API is CLOSED — no `className` / `style`. The surface mirrors the
 * AEGIS Popover (popover token, `border-strong` ring, elevated shadow); swatch
 * colour comes from the series chart token and the label carries the same
 * meaning so nothing rests on colour alone (WCAG 1.4.1).
 * See `.agent/rules/API_RULES.md`.
 */

/** One row in the tooltip. Supply a `key` to inherit the series colour/label. */
type ChartTooltipItem = {
  /** Series key → pulls colour + label from the container context. */
  key?: string
  /** Row label. Overrides the series label; falls back to it, then `key`. */
  label?: React.ReactNode
  /** The value to display. */
  value: React.ReactNode
  /** Override the swatch colour (a CSS colour, usually a chart token var). */
  colorVar?: string
}

const tooltipVariants = cva(
  "pointer-events-none inline-block min-w-[8rem] rounded-lg bg-popover text-popover-foreground shadow-elevated ring-1 ring-border-strong",
  {
    variants: {
      size: {
        sm: "px-2.5 py-1.5 text-xs",
        md: "px-3 py-2 text-sm",
      },
    },
    defaultVariants: { size: "md" },
  }
)

const indicatorVariants = cva("shrink-0", {
  variants: {
    indicator: {
      dot: "size-2.5 rounded-full",
      square: "size-2.5 rounded-sm",
      line: "h-0.5 w-3.5 rounded-full",
    },
  },
  defaultVariants: { indicator: "dot" },
})

type ChartTooltipProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style" | "children"
> &
  VariantProps<typeof tooltipVariants> & {
    /** Header shown above the rows — usually the x category or point label. */
    label?: React.ReactNode
    /** One row per series. */
    items: ChartTooltipItem[]
    /** Swatch glyph. `dot` (default), `square`, or `line`. */
    indicator?: "dot" | "square" | "line"
  }

function ChartTooltip({
  label,
  items,
  size = "md",
  indicator = "dot",
  ...props
}: ChartTooltipProps) {
  const { seriesByKey } = useChart()

  return (
    <div
      data-slot="chart-tooltip"
      role="tooltip"
      className={cn(tooltipVariants({ size }))}
      {...props}
    >
      {label != null && (
        <div
          data-slot="chart-tooltip-label"
          className={cn("mb-1 font-medium text-foreground")}
        >
          {label}
        </div>
      )}
      <ul data-slot="chart-tooltip-list" role="list" className={cn("grid gap-1")}>
        {items.map((item, i) => {
          const series = item.key ? seriesByKey[item.key] : undefined
          const colorVar = item.colorVar ?? series?.colorVar
          const rowLabel = item.label ?? series?.label ?? item.key
          return (
            <li
              key={item.key ?? i}
              data-slot="chart-tooltip-item"
              data-series={item.key}
              className={cn("flex items-center gap-2")}
            >
              {colorVar && (
                <span
                  data-slot="chart-tooltip-swatch"
                  aria-hidden
                  style={{ backgroundColor: colorVar }}
                  className={cn(indicatorVariants({ indicator }))}
                />
              )}
              <span className={cn("text-muted-foreground")}>{rowLabel}</span>
              <span
                data-slot="chart-tooltip-value"
                className={cn("ms-auto font-medium tabular-nums text-foreground")}
              >
                {item.value}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export { ChartTooltip, tooltipVariants }
export type { ChartTooltipProps, ChartTooltipItem }
