import * as React from "react"

import {
  ChartContainer,
  ChartPlot,
  useChart,
  type ChartMargin,
  type ChartColorIndex,
} from "@/components/ui/chart-container"
import { Axis, type AxisTick } from "@/components/ui/axis"
import { ChartLegend } from "@/components/ui/chart-legend"

/**
 * AEGIS — Line Chart
 *
 * A config-driven line chart built entirely on the AEGIS chart foundation: it
 * composes `ChartContainer` (geometry + palette), `Axis` (x categories + linear
 * y), `ChartLegend`, and its own SVG line/area/dot marks. Give it a row array
 * (`data`), the field that names each point (`xKey`), and one `series` entry per
 * numeric field to plot; colours and labels come from the shared palette so the
 * legend and marks always agree.
 *
 *   <LineChart
 *     label="Sessions by device"
 *     data={rows}
 *     xKey="month"
 *     series={[{ key: "desktop", label: "Desktop" }, { key: "mobile", label: "Mobile" }]}
 *   />
 *
 * Points sit at even fractions across the plot (first at the left edge, last at
 * the right), and the x-axis ticks line up with them. The y-axis is a linear
 * scale from `yDomain` (or the data extent, extended to include zero).
 *
 * Scope: this first Line Chart is a static, deterministic renderer — scales,
 * paths, axes, dots, and the legend are all verifiable without a browser. A
 * pointer/focus **hover tooltip** (tracking the nearest point and showing a
 * `ChartTooltip`) is browser-verification-heavy and is deferred to a follow-up,
 * per the honestly-scoped precedent in `.agent/DECISIONS.md`.
 *
 * Public API is CLOSED — no `className` / `style`. Colour is token-only (the
 * chart palette). See `.agent/rules/API_RULES.md`.
 */

/** A datum row: the `xKey` field names the point; series `key` fields are numbers. */
type LineChartDatum = Record<string, React.ReactNode>

/** One plotted line. */
type LineChartSeries = {
  /** Field in each datum holding this line's numeric value. */
  key: string
  /** Legend/label text. Falls back to `key`. */
  label?: string
  /** Palette slot (1–5). Omit to auto-assign by order. */
  color?: ChartColorIndex
}

type LineChartProps = {
  /** Accessible chart name. Required. */
  label: string
  /** Row data. Each row is one x position. */
  data: LineChartDatum[]
  /** Field naming each point (the x category label). */
  xKey: string
  /** One entry per line to plot. */
  series: LineChartSeries[]
  /** Fixed y range. Omit to derive from the data (extended to include 0). */
  yDomain?: [number, number]
  /** Fill the area under each line. Default `false`. */
  area?: boolean
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

function computeYExtent(
  data: LineChartDatum[],
  seriesKeys: string[],
  yDomain: [number, number] | undefined
): { yMin: number; yMax: number } {
  if (yDomain) return { yMin: yDomain[0], yMax: yDomain[1] }
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

type MarksProps = {
  data: LineChartDatum[]
  seriesKeys: string[]
  yMin: number
  yMax: number
  area: boolean
  showDots: boolean
}

function LineMarks({
  data,
  seriesKeys,
  yMin,
  yMax,
  area,
  showDots,
}: MarksProps) {
  const { innerWidth, innerHeight, seriesByKey } = useChart()
  const span = yMax - yMin || 1
  const n = data.length
  const xAt = (i: number) => (n > 1 ? (i / (n - 1)) * innerWidth : innerWidth / 2)
  const yAt = (v: number) => innerHeight - ((v - yMin) / span) * innerHeight

  return (
    <g data-slot="line-chart-marks">
      {seriesKeys.map((key) => {
        const resolved = seriesByKey[key]
        const color = resolved?.colorVar ?? "var(--color-chart-1)"
        const pts = data.map((d, i) => [xAt(i), yAt(toNumber(d[key]))] as const)
        const linePath = pts
          .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`)
          .join(" ")
        const areaPath =
          pts.length > 0
            ? `${linePath} L${pts[pts.length - 1][0].toFixed(2)},${innerHeight.toFixed(
                2
              )} L${pts[0][0].toFixed(2)},${innerHeight.toFixed(2)} Z`
            : ""
        return (
          <g key={key} data-slot="line-chart-series" data-series={key}>
            {area && pts.length > 1 && (
              <path
                data-slot="line-chart-area"
                d={areaPath}
                fill={color}
                fillOpacity={0.14}
                stroke="none"
              />
            )}
            {pts.length > 1 && (
              <path
                data-slot="line-chart-line"
                d={linePath}
                fill="none"
                stroke={color}
                strokeWidth={2.5}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            )}
            {showDots &&
              pts.map(([x, y], i) => (
                <circle
                  key={i}
                  data-slot="line-chart-dot"
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

function LineChart({
  label,
  data,
  xKey,
  series,
  yDomain,
  area = false,
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
}: LineChartProps) {
  const seriesKeys = series.map((s) => s.key)

  // y extent across all plotted series, extended to include zero so the
  // baseline is meaningful (unless the caller fixes `yDomain`). The data sets a
  // chart handles are small, so this runs inline each render.
  const { yMin, yMax } = computeYExtent(data, seriesKeys, yDomain)

  const xTicks: AxisTick[] = data.map((d, i) => ({
    value: d[xKey],
    position: data.length > 1 ? i / (data.length - 1) : 0.5,
  }))

  const legendVisible = showLegend ?? series.length > 1

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
            domain={[yMin, yMax]}
            tickCount={yTickCount}
            format={yFormat ? (v) => yFormat(v) : undefined}
            showGrid={showGrid}
          />
        )}
        <LineMarks
          data={data}
          seriesKeys={seriesKeys}
          yMin={yMin}
          yMax={yMax}
          area={area}
          showDots={showDots}
        />
        {showXAxis && <Axis orientation="bottom" ticks={xTicks} />}
      </ChartPlot>
    </ChartContainer>
  )
}

export { LineChart }
export type { LineChartProps, LineChartSeries, LineChartDatum }
