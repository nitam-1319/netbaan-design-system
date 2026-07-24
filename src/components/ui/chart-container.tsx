import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Chart Container
 *
 * The foundation every chart is built on. It owns two things so the marks,
 * axes, legend, and tooltip that compose inside it always agree:
 *
 *  1. **Geometry** — a fixed SVG coordinate space (`width` × `height` user
 *     units) plus a `margin` gutter, from which it derives the inner plot area
 *     (`innerWidth` / `innerHeight`). The whole thing scales fluidly to its
 *     parent's width via the SVG `viewBox`, so charts are responsive without
 *     measuring the DOM.
 *  2. **Series palette** — an optional `series` config (`{ key, label, color }`)
 *     resolved to the five AEGIS `--color-chart-*` tokens. `Axis`,
 *     `ChartLegend`, `ChartTooltip`, and the chart marks all read this one
 *     context so a series keeps the same colour and name everywhere.
 *
 * Compose the SVG marks (and `Axis`) inside `<ChartPlot>`, which draws the
 * `<svg>` and translates the origin to the plot area; render HTML siblings
 * (`ChartLegend`, `ChartTooltip`) directly under `<ChartContainer>`.
 *
 *   <ChartContainer label="Revenue by month" series={[{ key: "rev", label: "Revenue" }]}>
 *     <ChartPlot>
 *       <Axis orientation="bottom" ticks={…} />
 *       <Axis orientation="left" domain={[0, 100]} />
 *       {/* marks read useChart() for geometry + colour *\/}
 *     </ChartPlot>
 *     <ChartLegend />
 *   </ChartContainer>
 *
 * Public API is CLOSED — no `className` / `style`. Colour is token-only (the
 * chart palette); size comes from the numeric `width` / `height` props.
 * See `.agent/rules/API_RULES.md` and `.agent/rules/TOKEN_RULES.md`.
 */

/* ----------------------------------------------------------------- palette -- */

/** The AEGIS categorical chart palette, in order. */
const CHART_PALETTE = [
  "--color-chart-1",
  "--color-chart-2",
  "--color-chart-3",
  "--color-chart-4",
  "--color-chart-5",
] as const

/** 1-based index into the chart palette. */
type ChartColorIndex = 1 | 2 | 3 | 4 | 5

/** Public per-series configuration. */
type ChartSeries = {
  /** Stable identifier — matches the datum key the marks/tooltip look up. */
  key: string
  /** Human label shown in the legend and tooltip. Falls back to `key`. */
  label?: string
  /**
   * Palette slot (1–5). Omit to auto-assign by declaration order, wrapping
   * after five series.
   */
  color?: ChartColorIndex
}

/** A series after the container has resolved its colour + position. */
type ResolvedChartSeries = {
  key: string
  label: string
  /** Zero-based declaration order. */
  index: number
  /** Palette slot (1–5) this series paints with. */
  colorIndex: ChartColorIndex
  /** Ready-to-use CSS value, e.g. `var(--color-chart-2)`. */
  colorVar: string
}

/* ----------------------------------------------------------------- context -- */

type ChartMargin = { top: number; right: number; bottom: number; left: number }

type ChartContextValue = {
  /** Accessible name for the chart, from the container `label`. */
  label: string
  /** Outer viewBox width in SVG user units. */
  width: number
  /** Outer viewBox height in SVG user units. */
  height: number
  /** Gutter reserved around the plot area (for axes/labels). */
  margin: ChartMargin
  /** Plot-area width = `width − margin.left − margin.right`. */
  innerWidth: number
  /** Plot-area height = `height − margin.top − margin.bottom`. */
  innerHeight: number
  /** Resolved series, in declaration order. */
  series: ResolvedChartSeries[]
  /** Resolved series keyed by `key` for O(1) lookup. */
  seriesByKey: Record<string, ResolvedChartSeries>
}

const ChartContext = React.createContext<ChartContextValue | null>(null)

/**
 * Read the chart geometry + resolved series. For use by chart marks, `Axis`,
 * `ChartLegend`, and `ChartTooltip`. Throws if used outside `ChartContainer`.
 */
function useChart(): ChartContextValue {
  const ctx = React.useContext(ChartContext)
  if (!ctx) {
    throw new Error("useChart must be used within a <ChartContainer>.")
  }
  return ctx
}

const DEFAULT_MARGIN: ChartMargin = { top: 12, right: 16, bottom: 32, left: 44 }

function resolveSeries(series: ChartSeries[]): ResolvedChartSeries[] {
  return series.map((s, i) => {
    const colorIndex = (s.color ?? ((i % CHART_PALETTE.length) + 1)) as ChartColorIndex
    return {
      key: s.key,
      label: s.label ?? s.key,
      index: i,
      colorIndex,
      colorVar: `var(${CHART_PALETTE[colorIndex - 1]})`,
    }
  })
}

/* -------------------------------------------------------------------- root -- */

const chartContainerVariants = cva(
  "flex w-full flex-col gap-3 text-foreground [&_svg]:overflow-visible"
)

type ChartContainerProps = Omit<
  React.ComponentProps<"figure">,
  "className" | "style"
> &
  VariantProps<typeof chartContainerVariants> & {
    /** Accessible name for the chart figure and its plot SVG. Always provide one. */
    label: string
    /** Outer coordinate width in SVG user units. Default `640`. */
    width?: number
    /** Outer coordinate height in SVG user units. Default `320`. */
    height?: number
    /** Override any side of the plot gutter (defaults leave room for axes). */
    margin?: Partial<ChartMargin>
    /** Series metadata → stable colour + label across marks/legend/tooltip. */
    series?: ChartSeries[]
  }

function ChartContainer({
  label,
  width = 640,
  height = 320,
  margin: marginOverride,
  series = [],
  children,
  ...props
}: ChartContainerProps) {
  const margin = React.useMemo<ChartMargin>(
    () => ({ ...DEFAULT_MARGIN, ...marginOverride }),
    [marginOverride]
  )

  const resolved = React.useMemo(() => resolveSeries(series), [series])

  const value = React.useMemo<ChartContextValue>(() => {
    const innerWidth = Math.max(0, width - margin.left - margin.right)
    const innerHeight = Math.max(0, height - margin.top - margin.bottom)
    const seriesByKey: Record<string, ResolvedChartSeries> = {}
    for (const s of resolved) seriesByKey[s.key] = s
    return {
      label,
      width,
      height,
      margin,
      innerWidth,
      innerHeight,
      series: resolved,
      seriesByKey,
    }
  }, [label, width, height, margin, resolved])

  return (
    <ChartContext.Provider value={value}>
      <figure
        data-slot="chart-container"
        role="group"
        aria-label={label}
        className={cn(chartContainerVariants())}
        {...props}
      >
        {children}
      </figure>
    </ChartContext.Provider>
  )
}

/* -------------------------------------------------------------------- plot -- */

type ChartPlotProps = Omit<
  React.ComponentProps<"svg">,
  "className" | "style" | "viewBox" | "width" | "height"
> & {
  /**
   * Accessible name for the plot SVG. Defaults to the container `label`
   * (supplied automatically); pass to override.
   */
  label?: string
}

/**
 * The drawable SVG canvas. Sizes itself from the container geometry, scales to
 * 100 % width via `viewBox`, and translates its child group to the plot origin
 * (inside the margin) so marks and `Axis` share one coordinate system where
 * `(0, 0)` is the top-left of the plot area.
 */
function ChartPlot({ label, children, ...props }: ChartPlotProps) {
  const { width, height, margin, label: chartLabel } = useChart()
  return (
    <svg
      data-slot="chart-plot"
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={label ?? chartLabel}
      className={cn("block h-auto w-full")}
      {...props}
    >
      <g
        data-slot="chart-plot-area"
        transform={`translate(${margin.left}, ${margin.top})`}
      >
        {children}
      </g>
    </svg>
  )
}

export { ChartContainer, ChartPlot, useChart, CHART_PALETTE }
export type {
  ChartContainerProps,
  ChartPlotProps,
  ChartSeries,
  ResolvedChartSeries,
  ChartMargin,
  ChartColorIndex,
  ChartContextValue,
}
