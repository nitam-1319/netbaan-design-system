"use client";

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

/**
 * The severity-mapped palette: `--chart-1..5` IS the severity ramp
 * (critical, high, medium, low, info). Correct when the series ARE severities.
 */
const CHART_PALETTE = [
  "--color-chart-1",
  "--color-chart-2",
  "--color-chart-3",
  "--color-chart-4",
  "--color-chart-5",
] as const

/**
 * A4 — the categorical palette, for series with no severity meaning.
 *
 * Because `--chart-1..5` is the severity ramp, a chart of, say,
 * assets-by-environment rendered in critical/high/medium red-orange-amber and
 * read as "12 critical, 38 high". This palette is cool-only and shares no hue
 * with the severity ramp, `--success` or `--destructive`, so a categorical
 * chart cannot be mistaken for an alarm. See the `--cat-*` block in theme.css.
 */
const CAT_PALETTE = [
  "--color-cat-1",
  "--color-cat-2",
  "--color-cat-3",
  "--color-cat-4",
  "--color-cat-5",
  "--color-cat-6",
] as const

/**
 * Which palette a chart paints from.
 *  - `severity`    (default) — `--chart-1..5`; the series ARE severities.
 *  - `categorical` — `--cat-1..6`; the series carry no severity meaning.
 *
 * RULE: if the series is not a severity, this must be `"categorical"`.
 */
type ChartPalette = "severity" | "categorical"

/** 1-based index into the chart palette (6 is categorical-only). */
type ChartColorIndex = 1 | 2 | 3 | 4 | 5 | 6

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
  /** Palette slot this series paints with. */
  colorIndex: ChartColorIndex
  /** Ready-to-use CSS value, e.g. `var(--color-chart-2)`. Use for STROKES,
   *  legend swatch borders, and anywhere a flat colour is required. */
  colorVar: string
  /**
   * A3 — what AREA marks should fill with. Equals `colorVar` normally; when
   * the non-colour severity channel is on, it is a `url(#…)` reference to a
   * hatch pattern whose density encodes the severity. Kept separate from
   * `colorVar` because a pattern is wrong for a 1px line stroke.
   */
  fillVar: string
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
  /** Which palette the series painted from. */
  palette: ChartPalette
  /** A3 — whether severity marks carry the hatch channel. `ChartPlot` reads
   *  this to decide whether to emit the pattern `<defs>`. */
  patternBySeverity: boolean
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

/** Stable id for a severity hatch pattern. Namespaced to avoid colliding with
 *  ids in the consuming document. */
const patternId = (slot: ChartColorIndex) => `aegis-sev-hatch-${slot}`

function resolveSeries(
  series: ChartSeries[],
  palette: ChartPalette = "severity",
  patternBySeverity = false
): ResolvedChartSeries[] {
  const ramp = palette === "categorical" ? CAT_PALETTE : CHART_PALETTE
  const hatched = patternBySeverity && palette === "severity"
  return series.map((s, i) => {
    // Clamp an explicit slot into range: the severity ramp has 5 entries and
    // the categorical one 6, so `color: 6` is only meaningful on the latter.
    const requested = s.color ?? (i % ramp.length) + 1
    const colorIndex = Math.min(Math.max(requested, 1), ramp.length) as ChartColorIndex
    const colorVar = `var(${ramp[colorIndex - 1]})`
    return {
      key: s.key,
      label: s.label ?? s.key,
      index: i,
      colorIndex,
      colorVar,
      // Slot 5 is `info`, which stays a flat fill: it is the lightest weight
      // and hatching it would imply a severity it does not carry.
      fillVar:
        hatched && colorIndex <= 4 ? `url(#${patternId(colorIndex)})` : colorVar,
    }
  })
}

/**
 * A3 — the non-colour severity channel.
 *
 * Critical, high and medium are three warm hues that converge under
 * deuteranopia and protanopia and collapse in greyscale. Components are fine —
 * they always spell the level out — but charts decode severity by hue alone.
 *
 * This adds a second channel: hatch DENSITY, thickest for critical through
 * thinnest for low, so the ordering survives with no colour at all.
 *
 * The stroke ink is per-slot (`--sev-hatch-*`) rather than one fixed value.
 * The audit stroked every level in `--on-tone` (near-black), which is close to
 * invisible on the darker fills.
 */
const HATCH: Record<number, { stroke: string; width: number }> = {
  1: { stroke: "var(--sev-hatch-1)", width: 2.2 }, // critical — densest
  2: { stroke: "var(--sev-hatch-2)", width: 1.8 }, // high
  3: { stroke: "var(--sev-hatch-3)", width: 1.4 }, // medium
  4: { stroke: "var(--sev-hatch-4)", width: 1.0 }, // low      — lightest
}

function ChartPatternDefs() {
  return (
    <defs data-slot="chart-pattern-defs">
      {([1, 2, 3, 4] as const).map((slot) => {
        const { stroke, width } = HATCH[slot]
        return (
          <pattern
            key={slot}
            id={patternId(slot)}
            patternUnits="userSpaceOnUse"
            width="6"
            height="6"
            patternTransform="rotate(45)"
          >
            <rect width="6" height="6" fill={`var(${CHART_PALETTE[slot - 1]})`} />
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="6"
              stroke={stroke}
              strokeOpacity="0.28"
              strokeWidth={width}
            />
          </pattern>
        )
      })}
    </defs>
  )
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
    /**
     * Which palette the series paint from. Default `"severity"`, which is the
     * `--chart-1..5` severity ramp.
     *
     * **If the series are not severities, pass `"categorical"`.** Otherwise a
     * chart of environments or owners renders in the alarm hues and reads as
     * "12 critical, 38 high".
     */
    palette?: ChartPalette
    /**
     * A3 — adds the non-colour severity channel (hatch density) to
     * severity-mapped AREA marks, so severity survives greyscale and colour
     * vision deficiency. Ignored when `palette` is `"categorical"`.
     *
     * Opt-in (default `false`) rather than on-by-default: hatching every
     * severity chart is a large visual change, and on dense marks — thin
     * stacked bands, small treemap cells — it can cost more legibility than
     * the redundant encoding buys. Turn it on for charts where severity is
     * read from the marks themselves.
     */
    patternBySeverity?: boolean
  }

function ChartContainer({
  label,
  width = 640,
  height = 320,
  margin: marginOverride,
  series = [],
  palette = "severity",
  patternBySeverity = false,
  children,
  ...props
}: ChartContainerProps) {
  const margin = React.useMemo<ChartMargin>(
    () => ({ ...DEFAULT_MARGIN, ...marginOverride }),
    [marginOverride]
  )

  const resolved = React.useMemo(
    () => resolveSeries(series, palette, patternBySeverity),
    [series, palette, patternBySeverity]
  )

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
      palette,
      patternBySeverity: patternBySeverity && palette === "severity",
    }
  }, [label, width, height, margin, resolved, palette, patternBySeverity])

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
  const {
    width,
    height,
    margin,
    label: chartLabel,
    patternBySeverity,
  } = useChart()
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
      {/* A3: emitted once per plot, so marks can reference url(#aegis-sev-…)
          without every chart hand-rolling its own <defs>. */}
      {patternBySeverity ? <ChartPatternDefs /> : null}
      <g
        data-slot="chart-plot-area"
        transform={`translate(${margin.left}, ${margin.top})`}
      >
        {children}
      </g>
    </svg>
  )
}

export { ChartContainer, ChartPlot, useChart, CHART_PALETTE, CAT_PALETTE }
export type {
  ChartContainerProps,
  ChartPlotProps,
  ChartSeries,
  ResolvedChartSeries,
  ChartMargin,
  ChartColorIndex,
  ChartContextValue,
  ChartPalette,
}
