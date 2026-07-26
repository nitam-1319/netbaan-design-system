import * as React from "react"

import {
  ChartContainer,
  ChartPlot,
  useChart,
  type ChartColorIndex,
} from "@/components/ui/chart-container"
import { ChartLegend } from "@/components/ui/chart-legend"

/**
 * AEGIS — Radar Chart
 *
 * A radar (spider) chart for comparing several series across the same set of
 * dimensions — capability coverage, category scores, control maturity. It
 * composes the AEGIS `Chart Container` (palette + accessible name), draws a
 * concentric grid with one spoke per axis, and overlays one token-coloured
 * polygon per series.
 *
 * A static, deterministic renderer. Public API is CLOSED — no `className` /
 * `style`. Colour is token-only (the chart palette). See
 * `.agent/rules/API_RULES.md`.
 */

type RadarSeries = {
  /** Series key (colour + legend). */
  key: string
  /** Legend label. Falls back to `key`. */
  label?: string
  /** Palette slot (1–5). Omit to auto-assign by order. */
  color?: ChartColorIndex
  /** One value per axis, in axis order. */
  values: number[]
}

type RadarChartProps = {
  /** Accessible chart name. Required. */
  label: string
  /** Axis (dimension) labels, in order. */
  axes: string[]
  /** One entry per series; `values` align to `axes`. */
  series: RadarSeries[]
  /** Value at the outer ring. Omit to derive from the data. */
  max?: number
  /** Number of concentric rings. Default 4. */
  rings?: number
  /** Render the legend. Default `true` when >1 series. */
  showLegend?: boolean
  /** Outer coordinate size (square). Default 380. */
  size?: number
}

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function RadarMarks({
  axes,
  series,
  max,
  rings,
}: {
  axes: string[]
  series: RadarSeries[]
  max: number
  rings: number
}) {
  const { innerWidth, innerHeight, seriesByKey } = useChart()
  const cx = innerWidth / 2
  const cy = innerHeight / 2
  const R = (Math.min(innerWidth, innerHeight) / 2) * 0.82
  const n = axes.length
  // Angle for axis i, starting at the top and going clockwise.
  const angleFor = (i: number) => -90 + (360 / n) * i

  const gridPolygon = (frac: number) =>
    axes
      .map((_, i) => {
        const p = polar(cx, cy, R * frac, angleFor(i))
        return `${p.x.toFixed(2)},${p.y.toFixed(2)}`
      })
      .join(" ")

  return (
    <>
      {/* Concentric grid rings */}
      {Array.from({ length: rings }).map((_, r) => (
        <polygon
          key={r}
          data-slot="radar-grid"
          points={gridPolygon((r + 1) / rings)}
          fill="none"
          className="stroke-border"
          strokeWidth={1}
        />
      ))}

      {/* Spokes + axis labels */}
      {axes.map((axisLabel, i) => {
        const end = polar(cx, cy, R, angleFor(i))
        const labelPos = polar(cx, cy, R + 14, angleFor(i))
        const anchor =
          Math.abs(labelPos.x - cx) < 4
            ? "middle"
            : labelPos.x > cx
              ? "start"
              : "end"
        return (
          <g key={i} data-slot="radar-axis">
            <line
              x1={cx}
              y1={cy}
              x2={end.x.toFixed(2)}
              y2={end.y.toFixed(2)}
              className="stroke-border"
              strokeWidth={1}
            />
            <text
              x={labelPos.x.toFixed(2)}
              y={labelPos.y.toFixed(2)}
              textAnchor={anchor}
              dominantBaseline="middle"
              className="fill-muted-foreground text-[11px]"
            >
              {axisLabel}
            </text>
          </g>
        )
      })}

      {/* Series polygons */}
      {series.map((s) => {
        const color = seriesByKey[s.key]?.colorVar ?? "var(--color-chart-1)"
        const pts = axes
          .map((_, i) => {
            const v = s.values[i] ?? 0
            const frac = max > 0 ? Math.min(1, Math.max(0, v / max)) : 0
            const p = polar(cx, cy, R * frac, angleFor(i))
            return `${p.x.toFixed(2)},${p.y.toFixed(2)}`
          })
          .join(" ")
        return (
          <g key={s.key} data-slot="radar-series" data-series={s.key}>
            <polygon
              points={pts}
              fill={color}
              fillOpacity={0.15}
              stroke={color}
              strokeWidth={2}
              strokeLinejoin="round"
            />
          </g>
        )
      })}
    </>
  )
}

function RadarChart({
  label,
  axes,
  series,
  max,
  rings = 4,
  showLegend,
  size = 380,
}: RadarChartProps) {
  const derivedMax =
    max ??
    Math.max(1, ...series.flatMap((s) => s.values.filter((v) => Number.isFinite(v))))
  const legend = showLegend ?? series.length > 1
  const seriesMeta = series.map((s) => ({ key: s.key, label: s.label, color: s.color }))

  return (
    <ChartContainer
      label={label}
      width={size}
      height={size}
      margin={{ top: 28, right: 60, bottom: 28, left: 60 }}
      series={seriesMeta}
    >
      <ChartPlot>
        <RadarMarks axes={axes} series={series} max={derivedMax} rings={rings} />
      </ChartPlot>
      {legend ? <ChartLegend /> : null}
    </ChartContainer>
  )
}

export { RadarChart }
export type { RadarChartProps, RadarSeries }
