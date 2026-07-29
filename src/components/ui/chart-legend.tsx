"use client";

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { useChart } from "@/components/ui/chart-container"

/**
 * AEGIS — Chart Legend
 *
 * The key that maps each series colour to its name. It reads the resolved
 * `series` from the shared `ChartContainer` context, so a series shows the same
 * colour and label here as it does in the marks and the tooltip — there is
 * nothing to keep in sync by hand.
 *
 * The legend is HTML (not SVG): render it as a sibling of `ChartPlot`, above or
 * below the plot. It is a plain, non-interactive list; series toggling is a
 * future additive layer (it needs to coordinate visibility with the marks).
 *
 *   <ChartContainer label="Revenue" series={[{ key: "rev", label: "Revenue" }]}>
 *     <ChartPlot>{/* marks *\/}</ChartPlot>
 *     <ChartLegend />
 *   </ChartContainer>
 *
 * Public API is CLOSED — no `className` / `style`. Each swatch is coloured from
 * the series' chart token, and the label text carries the same meaning so the
 * key never relies on colour alone (WCAG 1.4.1). See `.agent/rules/API_RULES.md`.
 */

const legendVariants = cva("flex list-none flex-wrap items-center", {
  variants: {
    orientation: {
      horizontal: "flex-row",
      vertical: "flex-col items-start",
    },
    size: {
      sm: "gap-x-3 gap-y-1 text-xs",
      md: "gap-x-4 gap-y-1.5 text-sm",
    },
  },
  defaultVariants: { orientation: "horizontal", size: "md" },
})

const swatchVariants = cva("shrink-0", {
  variants: {
    shape: {
      square: "rounded-sm",
      dot: "rounded-full",
      line: "rounded-full",
    },
    size: {
      sm: "",
      md: "",
    },
  },
  compoundVariants: [
    { shape: "square", size: "sm", className: "size-2.5" },
    { shape: "square", size: "md", className: "size-3" },
    { shape: "dot", size: "sm", className: "size-2" },
    { shape: "dot", size: "md", className: "size-2.5" },
    { shape: "line", size: "sm", className: "h-0.5 w-3.5" },
    { shape: "line", size: "md", className: "h-0.5 w-4" },
  ],
  defaultVariants: { shape: "square", size: "md" },
})

type ChartLegendProps = Omit<
  React.ComponentProps<"ul">,
  "className" | "style" | "children"
> &
  VariantProps<typeof legendVariants> & {
    /** Swatch glyph. `square` (default), `dot`, or `line`. */
    shape?: "square" | "dot" | "line"
  }

function ChartLegend({
  orientation = "horizontal",
  size = "md",
  shape = "square",
  ...props
}: ChartLegendProps) {
  const { series } = useChart()
  if (series.length === 0) return null

  return (
    <ul
      data-slot="chart-legend"
      role="list"
      className={cn(legendVariants({ orientation, size }))}
      {...props}
    >
      {series.map((s) => (
        <li
          key={s.key}
          data-slot="chart-legend-item"
          data-series={s.key}
          className={cn("flex items-center gap-1.5")}
        >
          <span
            data-slot="chart-legend-swatch"
            aria-hidden
            // Per-series colour is dynamic → set the chart token via the CSS
            // custom property here (internal, not a consumer styling hatch).
            style={{ backgroundColor: s.colorVar }}
            className={cn(swatchVariants({ shape, size }))}
          />
          <span className={cn("text-muted-foreground")}>{s.label}</span>
        </li>
      ))}
    </ul>
  )
}

export { ChartLegend, legendVariants }
export type { ChartLegendProps }
