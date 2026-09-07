"use client";

import * as React from "react"

import {
  ChartContainer,
  ChartPlot,
  useChart,
  type ChartMargin,
  type ChartColorIndex,
  type ChartSeriesTone,
} from "@/components/ui/chart-container"
import { Axis, type AxisTick } from "@/components/ui/axis"
import { ChartLegend } from "@/components/ui/chart-legend"

/**
 * AEGIS — Area Chart
 *
 * A config-driven area chart built entirely on the AEGIS chart foundation: it
 * composes `ChartContainer` (geometry + palette), `Axis` (x categories + linear
 * y), `ChartLegend`, and its own SVG area/line/dot marks. Give it a row array
 * (`data`), the field that names each point (`xKey`), and one `series` entry per
 * numeric field to plot; colours and labels come from the shared palette so the
 * legend and marks always agree.
 *
 *   <AreaChart
 *     label="Traffic by source"
 *     data={rows}
 *     xKey="month"
 *     series={[{ key: "organic", label: "Organic" }, { key: "paid", label: "Paid" }]}
 *     stackMode="stacked"
 *   />
 *
 * Three stacking modes cover the whole area-chart family in one component
 * (mirroring how `BarChart` handles grouped + stacked — see `.agent/DECISIONS.md`,
 * 2026-07-25):
 *   - `overlap`  — every series is filled from the zero baseline, translucent so
 *                  overlapping bands read through one another (the default).
 *   - `stacked`  — series are cumulatively stacked into opaque bands; this is the
 *                  **Stacked Area Chart** (queue #92).
 *   - `expand`   — the stack is normalised so each x column sums to 100 %, for
 *                  part-to-whole trends over time.
 *
 * Points sit at even fractions across the plot (first at the left edge, last at
 * the right), and the x-axis ticks line up with them. The y-axis is a linear
 * scale from `yDomain` (or the data extent — for `stacked`/`expand` the extent
 * uses per-column sums; `expand` is always `[0, 1]`).
 *
 * Scope: this Area Chart is a static, deterministic renderer — scales, paths,
 * axes, dots, and the legend are all verifiable without a browser. A
 * pointer/focus **hover tooltip** (tracking the nearest point and showing a
 * `ChartTooltip`) is browser-verification-heavy and is deferred to a follow-up,
 * per the honestly-scoped precedent in `.agent/DECISIONS.md`.
 *
 * Public API is CLOSED — no `className` / `style`. Colour is token-only (the
 * chart palette). See `.agent/rules/API_RULES.md`.
 */

/** How series are combined vertically. */
type AreaStackMode = "overlap" | "stacked" | "expand"

/** A datum row: the `xKey` field names the point; series `key` fields are numbers. */
type AreaChartDatum = Record<string, React.ReactNode>

/** One plotted area. */
type AreaChartSeries = {
  /** Field in each datum holding this series' numeric value. */
  key: string
  /** Legend/label text. Falls back to `key`. */
  label?: string
  /** Palette slot (1–5). Omit to auto-assign by order. */
  color?: ChartColorIndex
  /**
   * A semantic colour, overriding `color` — for a series whose meaning is a
   * direction ("closed", "recovered") rather than a slot in a ramp. Neither
   * palette contains a green, so this is the only way to say "good".
   */
  tone?: ChartSeriesTone
}

type AreaChartProps = {
  /** Accessible chart name. Required. */
  label: string
  /** Row data. Each row is one x position. */
  data: AreaChartDatum[]
  /** Field naming each point (the x category label). */
  xKey: string
  /** One entry per area to plot. */
  series: AreaChartSeries[]
  /** How series combine vertically. Default `overlap`. */
  stackMode?: AreaStackMode
  /** Fixed y range. Omit to derive from the data. Ignored when `stackMode="expand"`. */
  yDomain?: [number, number]
  /**
   * How the y axis maps value → position.
   *
   * `linear` (default) is right whenever the series are comparable. `log` is
   * for `stackMode="overlap"` when they are NOT: overlaying severity bands from
   * zero is the correct encoding — stacking hides a critical count going 12 →
   * 34 under 1,600 stacked lows — but on one linear domain, series spanning
   * three orders of magnitude (info in the tens of thousands, critical in the
   * tens) flatten four of five bands onto the axis. It is `log1p`, so a zero is
   * still a real position rather than negative infinity.
   */
  yScale?: "linear" | "log"
  /** Fill opacity for each band (0–1). Defaults by mode (translucent when overlapping). */
  fillOpacity?: number
  /** Stroke the top edge of each band. Default `true`. */
  showLine?: boolean
  /** Draw a dot at each point. Default `false`. */
  showDots?: boolean
  /** Draw y-axis gridlines. Default `true`. */
  showGrid?: boolean
  /** Render the x-axis. Default `true`. */
  showXAxis?: boolean
  /** Render the y-axis. Default `true`. */
  showYAxis?: boolean
  /** Render the legend above the plot. Default `true` when >1 series. */
  showLegend?: boolean
  /** Number of y-axis ticks. Default `5`. */
  yTickCount?: number
  /** Format a y-axis tick value. */
  yFormat?: (value: number) => React.ReactNode
  /** Outer coordinate width. Default `640`. */
  width?: number
  /** Outer coordinate height. Default `320`. */
  height?: number
  /** Plot gutter override. */
  margin?: Partial<ChartMargin>
}

function toNumber(v: React.ReactNode): number {
  const n = typeof v === "number" ? v : Number(v)
  return Number.isFinite(n) ? n : 0
}

/** Non-negative reading of a datum — stacked/expand bands can't go below zero. */
function toNonNeg(v: React.ReactNode): number {
  return Math.max(0, toNumber(v))
}

function computeYExtent(
  data: AreaChartDatum[],
  seriesKeys: string[],
  mode: AreaStackMode,
  yDomain: [number, number] | undefined
): { yMin: number; yMax: number } {
  if (mode === "expand") return { yMin: 0, yMax: 1 }
  if (yDomain) return { yMin: yDomain[0], yMax: yDomain[1] }

  if (mode === "stacked") {
    let hi = 0
    for (const d of data) {
      let sum = 0
      for (const k of seriesKeys) sum += toNonNeg(d[k])
      if (sum > hi) hi = sum
    }
    if (hi <= 0) hi = 1
    return { yMin: 0, yMax: hi }
  }

  // overlap: each area is drawn from the zero baseline, so the extent must
  // include zero to keep that baseline meaningful.
  let lo = Infinity
  let hi = -Infinity
  for (const d of data) {
    for (const k of seriesKeys) {
      const v = toNumber(d[k])
      if (v < lo) lo = v
      if (v > hi) hi = v
    }
  }
  if (!Number.isFinite(lo) || !Number.isFinite(hi)) return { yMin: 0, yMax: 1 }
  lo = Math.min(0, lo)
  if (lo === hi) hi = lo + 1
  return { yMin: lo, yMax: hi }
}

/* --------------------------------------------------------------- the marks -- */

/** One boundary point of a band: the lower/upper stacked values at an index. */
/**
 * Value → 0..1 within the y domain. `log` uses `log1p` so a zero maps to the
 * axis rather than to negative infinity, which is what a count series needs.
 */
function projectY(
  v: number,
  yMin: number,
  yMax: number,
  scale: "linear" | "log"
): number {
  if (scale === "log") {
    const lo = Math.log1p(Math.max(0, yMin))
    const hi = Math.log1p(Math.max(0, yMax))
    const span = hi - lo || 1
    return (Math.log1p(Math.max(0, v)) - lo) / span
  }
  const span = yMax - yMin || 1
  return (v - yMin) / span
}

type BandPoint = { lower: number; upper: number }

type MarksProps = {
  data: AreaChartDatum[]
  seriesKeys: string[]
  yMin: number
  yMax: number
  yScale: "linear" | "log"
  mode: AreaStackMode
  fillOpacity: number
  showLine: boolean
  showDots: boolean
}

function AreaMarks({
  data,
  seriesKeys,
  yMin,
  yMax,
  yScale,
  mode,
  fillOpacity,
  showLine,
  showDots,
}: MarksProps) {
  const { innerWidth, innerHeight, seriesByKey } = useChart()
  const n = data.length
  const xAt = (i: number) =>
    n > 1 ? (i / (n - 1)) * innerWidth : innerWidth / 2
  const yAt = (v: number) =>
    innerHeight - projectY(v, yMin, yMax, yScale) * innerHeight

  // Resolve each series to its lower/upper boundary at every point. For the
  // stacked/expand modes we accumulate a running lower edge per index so the
  // first-declared series sits at the bottom of the stack.
  const running = new Array<number>(n).fill(0)
  const bands = seriesKeys.map((key) => {
    const points: BandPoint[] = data.map((d, i) => {
      if (mode === "overlap") {
        return { lower: 0, upper: toNumber(d[key]) }
      }
      const value =
        mode === "expand"
          ? (() => {
              let total = 0
              for (const k of seriesKeys) total += toNonNeg(d[k])
              return total > 0 ? toNonNeg(d[key]) / total : 0
            })()
          : toNonNeg(d[key])
      const lower = running[i]
      const upper = lower + value
      running[i] = upper
      return { lower, upper }
    })
    return { key, points }
  })

  return (
    <g data-slot="area-chart-marks">
      {bands.map(({ key, points }) => {
        const resolved = seriesByKey[key]
        const color = resolved?.colorVar ?? "var(--color-chart-1)"
        // A3: the band is an area, so it can carry the hatch channel; the
        // boundary line stays a flat colour (a pattern on a 1px stroke is noise).
        const areaFill = resolved?.fillVar ?? color
        const upper = points.map((p, i) => [xAt(i), yAt(p.upper)] as const)
        const lowerRev = points
          .map((p, i) => [xAt(i), yAt(p.lower)] as const)
          .reverse()
        const areaPath =
          points.length > 0
            ? [
                ...upper.map(
                  ([x, y], i) =>
                    `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`
                ),
                ...lowerRev.map(([x, y]) => `L${x.toFixed(2)},${y.toFixed(2)}`),
                "Z",
              ].join(" ")
            : ""
        const linePath = upper
          .map(
            ([x, y], i) =>
              `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`
          )
          .join(" ")
        return (
          <g key={key} data-slot="area-chart-series" data-series={key}>
            {points.length > 1 && (
              <path
                data-slot="area-chart-area"
                d={areaPath}
                fill={areaFill}
                fillOpacity={fillOpacity}
                stroke="none"
              />
            )}
            {showLine && points.length > 1 && (
              <path
                data-slot="area-chart-line"
                d={linePath}
                fill="none"
                stroke={color}
                strokeWidth={2.5}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            )}
            {showDots &&
              upper.map(([x, y], i) => (
                <circle
                  key={i}
                  data-slot="area-chart-dot"
                  cx={x}
                  cy={y}
                  r={3}
                  fill="var(--color-background)"
                  stroke={color}
                  strokeWidth={2}
                />
              ))}
          </g>
        )
      })}
    </g>
  )
}

/* -------------------------------------------------------------------- root -- */

/**
 * Tick values evenly spaced in log1p space, so the gridlines land where the eye
 * expects them on a log axis.
 */
function logTicks(yMin: number, yMax: number, count: number): number[] {
  const lo = Math.log1p(Math.max(0, yMin))
  const hi = Math.log1p(Math.max(0, yMax))
  const n = Math.max(2, count)
  return Array.from({ length: n }, (_, i) =>
    Math.round(Math.expm1(lo + ((hi - lo) * i) / (n - 1)))
  )
}

function AreaChart({
  label,
  data,
  xKey,
  series,
  stackMode = "overlap",
  yDomain,
  yScale = "linear",
  fillOpacity,
  showLine = true,
  showDots = false,
  showGrid = true,
  showXAxis = true,
  showYAxis = true,
  showLegend,
  yTickCount = 5,
  yFormat,
  width = 640,
  height = 320,
  margin,
}: AreaChartProps) {
  const seriesKeys = series.map((s) => s.key)

  const { yMin, yMax } = computeYExtent(data, seriesKeys, stackMode, yDomain)

  const xTicks: AxisTick[] = data.map((d, i) => ({
    value: d[xKey],
    position: data.length > 1 ? i / (data.length - 1) : 0.5,
  }))

  const legendVisible = showLegend ?? series.length > 1
  // Overlapping bands must stay translucent so they read through one another;
  // stacked/expand bands don't overlap, so they can be near-opaque.
  const resolvedFill = fillOpacity ?? (stackMode === "overlap" ? 0.2 : 0.85)

  return (
    <ChartContainer
      label={label}
      series={series}
      width={width}
      height={height}
      margin={margin}
    >
      {legendVisible && <ChartLegend />}
      <ChartPlot>
        {showYAxis && (
          <Axis
            orientation="left"
            // A log axis cannot be sampled linearly, so the ticks are computed
            // here against the same projection the marks use.
            {...(yScale === "log"
              ? {
                  ticks: logTicks(yMin, yMax, yTickCount).map((v) => ({
                    value: (yFormat ?? String)(v),
                    position: projectY(v, yMin, yMax, "log"),
                  })),
                }
              : {
                  domain: [yMin, yMax] as [number, number],
                  tickCount: yTickCount,
                  format: yFormat ? (v: number) => yFormat(v) : undefined,
                })}
            showGrid={showGrid}
          />
        )}
        <AreaMarks
          data={data}
          seriesKeys={seriesKeys}
          yMin={yMin}
          yMax={yMax}
          yScale={yScale}
          mode={stackMode}
          fillOpacity={resolvedFill}
          showLine={showLine}
          showDots={showDots}
        />
        {showXAxis && <Axis orientation="bottom" ticks={xTicks} />}
      </ChartPlot>
    </ChartContainer>
  )
}

export { AreaChart }
export type { AreaChartProps, AreaChartSeries, AreaChartDatum, AreaStackMode }
