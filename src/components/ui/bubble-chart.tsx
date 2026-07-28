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
 * AEGIS — Bubble Chart
 *
 * A scatter chart with a third dimension: each point's `size` is encoded as the
 * bubble's **area** (radius ∝ √size), so magnitude reads honestly. It shares the
 * `Scatter Plot` model and the AEGIS chart foundation — linear x/y `Axis`,
 * `ChartLegend`, token palette — and adds an area-proportional radius scale.
 *
 * Static, deterministic renderer; a hover tooltip is deferred (browser-verified),
 * per the honestly-scoped chart precedent in `.agent/DECISIONS.md`. Public API is
 * CLOSED — no `className` / `style`. Colour is token-only.
 * See `.agent/rules/API_RULES.md`.
 */

type BubblePoint = { x: number; y: number; size: number }

type BubbleSeries = {
  key: string
  label?: string
  color?: ChartColorIndex
  points: BubblePoint[]
}

type BubbleChartProps = {
  /** Accessible chart name. Required. */
  label: string
  /** One entry per series. */
  series: BubbleSeries[]
  /** Fixed x range. Omit to derive from the data (padded). */
  xDomain?: [number, number]
  /** Fixed y range. Omit to derive from the data (padded). */
  yDomain?: [number, number]
  /** Smallest bubble radius (SVG units). Default 6. */
  minRadius?: number
  /** Largest bubble radius (SVG units). Default 28. */
  maxRadius?: number
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
  /** Outer coordinate height. Default 400. */
  height?: number
  /** Plot gutter override. */
  margin?: Partial<ChartMargin>
}

// Derived domains are padded, so evenly-sampled ticks land on values like
// 29.449999999999996 — floating-point noise that renders a 17-char label,
// overflowing the axis gutter. Trim the representation error (non-lossy to 6
// decimals) unless the consumer supplies their own formatter.
function formatTick(value: number): string {
  return String(Number(value.toFixed(6)))
}

function extent(values: number[], fallback: [number, number]): [number, number] {
  if (values.length === 0) return fallback
  let lo = Infinity
  let hi = -Infinity
  for (const v of values) {
    if (v < lo) lo = v
    if (v > hi) hi = v
  }
  if (lo === hi) return [lo - 1, hi + 1]
  const pad = (hi - lo) * 0.08
  return [lo - pad, hi + pad]
}

function BubbleMarks({
  series,
  xDomain,
  yDomain,
  sizeExtent,
  minRadius,
  maxRadius,
}: {
  series: BubbleSeries[]
  xDomain: [number, number]
  yDomain: [number, number]
  sizeExtent: [number, number]
  minRadius: number
  maxRadius: number
}) {
  const { innerWidth, innerHeight, seriesByKey } = useChart()
  const [xMin, xMax] = xDomain
  const [yMin, yMax] = yDomain
  const [sMin, sMax] = sizeExtent
  const xSpan = xMax - xMin || 1
  const ySpan = yMax - yMin || 1
  const sx = (v: number) => ((v - xMin) / xSpan) * innerWidth
  const sy = (v: number) => innerHeight - ((v - yMin) / ySpan) * innerHeight
  // Area-proportional radius: r = minR + (maxR-minR) * sqrt(normalised size).
  const radius = (size: number) => {
    const denom = sMax - sMin || 1
    const t = Math.sqrt(Math.min(1, Math.max(0, (size - sMin) / denom)))
    return minRadius + (maxRadius - minRadius) * t
  }

  return (
    <>
      {series.map((s) => {
        const color = seriesByKey[s.key]?.colorVar ?? "var(--color-chart-1)"
        // Draw larger bubbles first so small ones stay visible on top.
        const ordered = [...s.points].sort((a, b) => b.size - a.size)
        return (
          <g key={s.key} data-slot="bubble-series" data-series={s.key}>
            {ordered.map((p, i) => (
              <circle
                key={i}
                data-slot="bubble-point"
                cx={sx(p.x).toFixed(2)}
                cy={sy(p.y).toFixed(2)}
                r={radius(p.size).toFixed(2)}
                fill={color}
                fillOpacity={0.35}
                stroke={color}
                strokeWidth={1.5}
              />
            ))}
          </g>
        )
      })}
    </>
  )
}

function BubbleChart({
  label,
  series,
  xDomain,
  yDomain,
  minRadius = 6,
  maxRadius = 28,
  showGrid = true,
  showXAxis = true,
  showYAxis = true,
  showLegend,
  tickCount = 5,
  xFormat,
  yFormat,
  width = 640,
  height = 400,
  margin,
}: BubbleChartProps) {
  const allX = series.flatMap((s) => s.points.map((p) => p.x))
  const allY = series.flatMap((s) => s.points.map((p) => p.y))
  const allSize = series.flatMap((s) => s.points.map((p) => p.size))
  const xd = xDomain ?? extent(allX, [0, 1])
  const yd = yDomain ?? extent(allY, [0, 1])
  const sizeExtent = extent(allSize, [0, 1])
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
            format={(v) => (yFormat ? yFormat(v) : formatTick(v))}
          />
        ) : null}
        {showXAxis ? (
          <Axis
            orientation="bottom"
            domain={xd}
            tickCount={tickCount}
            format={(v) => (xFormat ? xFormat(v) : formatTick(v))}
          />
        ) : null}
        <BubbleMarks
          series={series}
          xDomain={xd}
          yDomain={yd}
          sizeExtent={sizeExtent}
          minRadius={minRadius}
          maxRadius={maxRadius}
        />
      </ChartPlot>
      {legend ? <ChartLegend /> : null}
    </ChartContainer>
  )
}

export { BubbleChart }
export type { BubbleChartProps, BubbleSeries, BubblePoint }
