import * as React from "react"

import {
  ChartContainer,
  ChartPlot,
  useChart,
  type ChartMargin,
  type ChartColorIndex,
} from "@/components/ui/chart-container"
import { Axis } from "@/components/ui/axis"
import { ChartLegend } from "@/components/ui/chart-legend"

/**
 * AEGIS — Scatter Plot
 *
 * A config-driven scatter chart built on the AEGIS chart foundation. Give it one
 * or more `series`, each a set of `{ x, y }` points; it draws a linear x/y plot
 * with `Axis` gridlines, a `ChartLegend`, and one token-coloured dot per point.
 *
 *   <ScatterPlot
 *     label="Exposure vs. severity"
 *     series={[{ key: "web", label: "Web", points: [{ x: 2, y: 8 }, …] }]}
 *   />
 *
 * Domains derive from the data extent (padded) unless `xDomain` / `yDomain` are
 * given. Scope: a static, deterministic renderer — a hover tooltip is deferred to
 * a follow-up (browser-verified), per the honestly-scoped chart precedent in
 * `.agent/DECISIONS.md`.
 *
 * Public API is CLOSED — no `className` / `style`. Colour is token-only (the
 * chart palette). See `.agent/rules/API_RULES.md`.
 */

type ScatterPoint = { x: number; y: number }

type ScatterSeries = {
  /** Series identifier (colour + legend key). */
  key: string
  /** Legend label. Falls back to `key`. */
  label?: string
  /** Palette slot (1–5). Omit to auto-assign by order. */
  color?: ChartColorIndex
  /** The points in this series. */
  points: ScatterPoint[]
}

type ScatterPlotProps = {
  /** Accessible chart name. Required. */
  label: string
  /** One entry per series. */
  series: ScatterSeries[]
  /** Fixed x range. Omit to derive from the data (padded). */
  xDomain?: [number, number]
  /** Fixed y range. Omit to derive from the data (padded). */
  yDomain?: [number, number]
  /** Dot radius in SVG user units. Default 4. */
  pointRadius?: number
  /** Draw gridlines. Default `true`. */
  showGrid?: boolean
  /** Render the x-axis. Default `true`. */
  showXAxis?: boolean
  /** Render the y-axis. Default `true`. */
  showYAxis?: boolean
  /** Render the legend. Default `true` when >1 series. */
  showLegend?: boolean
  /** Number of axis ticks. Default 5. */
  tickCount?: number
  /** Format an x-axis tick. */
  xFormat?: (value: number) => React.ReactNode
  /** Format a y-axis tick. */
  yFormat?: (value: number) => React.ReactNode
  /** Outer coordinate width. Default 640. */
  width?: number
  /** Outer coordinate height. Default 360. */
  height?: number
  /** Plot gutter override. */
  margin?: Partial<ChartMargin>
}

/** Round a raw step up to the nearest 1/2/5 × 10ⁿ "nice" value. */
function niceStep(raw: number): number {
  if (!(raw > 0)) return 1
  const exp = Math.floor(Math.log10(raw))
  const base = Math.pow(10, exp)
  const f = raw / base
  const nf = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10
  return nf * base
}

/**
 * A "nice" domain for a linear axis: bounds snap to round multiples of a
 * 1/2/5 step so the `tickCount` evenly-spaced ticks land on clean numbers
 * (e.g. 0,2,4,6,8) instead of the padded-extent floats (1.65,3.575,…) that
 * render as long, overflowing labels like "8.99999999".
 */
function niceDomain(
  values: number[],
  fallback: [number, number],
  tickCount: number
): [number, number] {
  if (values.length === 0) return fallback
  let lo = Math.min(...values)
  let hi = Math.max(...values)
  if (!(hi > lo)) {
    lo -= 1
    hi += 1
  }
  const steps = Math.max(1, tickCount - 1)
  let step = niceStep((hi - lo) / steps)
  let niceLo = Math.floor(lo / step) * step
  // Grow the step through the 1/2/5 ladder until the range covers the data.
  let guard = 0
  while (niceLo + step * steps < hi && guard++ < 20) {
    step = niceStep(step * 1.5)
    niceLo = Math.floor(lo / step) * step
  }
  return [niceLo, niceLo + step * steps]
}

function ScatterMarks({
  series,
  xDomain,
  yDomain,
  pointRadius,
}: {
  series: ScatterSeries[]
  xDomain: [number, number]
  yDomain: [number, number]
  pointRadius: number
}) {
  const { innerWidth, innerHeight, seriesByKey } = useChart()
  const [xMin, xMax] = xDomain
  const [yMin, yMax] = yDomain
  const xSpan = xMax - xMin || 1
  const ySpan = yMax - yMin || 1
  const sx = (v: number) => ((v - xMin) / xSpan) * innerWidth
  const sy = (v: number) => innerHeight - ((v - yMin) / ySpan) * innerHeight

  return (
    <>
      {series.map((s) => {
        const color = seriesByKey[s.key]?.colorVar ?? "var(--color-chart-1)"
        return (
          <g key={s.key} data-slot="scatter-series" data-series={s.key}>
            {s.points.map((p, i) => (
              <circle
                key={i}
                data-slot="scatter-point"
                cx={sx(p.x).toFixed(2)}
                cy={sy(p.y).toFixed(2)}
                r={pointRadius}
                fill={color}
                fillOpacity={0.72}
                stroke={color}
                strokeWidth={1}
              />
            ))}
          </g>
        )
      })}
    </>
  )
}

function ScatterPlot({
  label,
  series,
  xDomain,
  yDomain,
  pointRadius = 4,
  showGrid = true,
  showXAxis = true,
  showYAxis = true,
  showLegend,
  tickCount = 5,
  xFormat,
  yFormat,
  width = 640,
  height = 360,
  margin,
}: ScatterPlotProps) {
  const allX = series.flatMap((s) => s.points.map((p) => p.x))
  const allY = series.flatMap((s) => s.points.map((p) => p.y))
  const xd = xDomain ?? niceDomain(allX, [0, 1], tickCount)
  const yd = yDomain ?? niceDomain(allY, [0, 1], tickCount)
  const legend = showLegend ?? series.length > 1
  const seriesMeta = series.map((s) => ({ key: s.key, label: s.label, color: s.color }))

  return (
    <ChartContainer
      label={label}
      width={width}
      height={height}
      margin={margin}
      series={seriesMeta}
    >
      <ChartPlot>
        {showYAxis ? (
          <Axis
            orientation="left"
            domain={yd}
            tickCount={tickCount}
            showGrid={showGrid}
            format={yFormat ? (v) => yFormat(v) : undefined}
          />
        ) : null}
        {showXAxis ? (
          <Axis
            orientation="bottom"
            domain={xd}
            tickCount={tickCount}
            format={xFormat ? (v) => xFormat(v) : undefined}
          />
        ) : null}
        <ScatterMarks
          series={series}
          xDomain={xd}
          yDomain={yd}
          pointRadius={pointRadius}
        />
      </ChartPlot>
      {legend ? <ChartLegend /> : null}
    </ChartContainer>
  )
}

export { ScatterPlot }
export type { ScatterPlotProps, ScatterSeries, ScatterPoint }
