import * as React from "react"

import {
  ChartContainer,
  ChartPlot,
  useChart,
  type ChartMargin,
  type ChartColorIndex,
} from "@/components/ui/chart-container"
import { ChartLegend } from "@/components/ui/chart-legend"

/**
 * AEGIS — Pie Chart
 *
 * A config-driven pie chart built on the AEGIS chart foundation. Give it a
 * `label` and a `data` array of slices (`{ key, label?, value, color? }`); each
 * slice becomes a wedge whose angle is its share of the total, and a legend
 * entry that carries the same colour and name. Colours resolve from the shared
 * `ChartContainer` palette, so the pie and the legend always agree.
 *
 *   <PieChart
 *     label="Budget split"
 *     data={[
 *       { key: "eng", label: "Engineering", value: 45 },
 *       { key: "sales", label: "Sales", value: 25 },
 *       { key: "ops", label: "Operations", value: 30 },
 *     ]}
 *     showLabels
 *   />
 *
 * The Pie Chart is the solid sibling of the **Donut Chart** (a donut with no
 * hole); reach for the donut when you want a centre readout. With `showLabels`,
 * a percentage is drawn outside each slice on the surface (so it keeps AA
 * contrast regardless of the slice colour).
 *
 * Scope: this Pie Chart is a static, deterministic renderer — every wedge path,
 * the outside labels, and the legend are verifiable without a browser. A
 * pointer/focus **hover tooltip** and slice selection are deferred to a
 * follow-up, per the honestly-scoped precedent in `.agent/DECISIONS.md`.
 *
 * Public API is CLOSED — no `className` / `style`. Colour is token-only (the
 * chart palette). See `.agent/rules/API_RULES.md`.
 */

/** One slice of the pie. */
type PieChartDatum = {
  /** Stable identifier — also the legend/colour lookup key. */
  key: string
  /** Human label shown in the legend. Falls back to `key`. */
  label?: string
  /** Numeric magnitude; the slice angle is its share of the total. */
  value: number
  /** Palette slot (1–5). Omit to auto-assign by order. */
  color?: ChartColorIndex
}

type PieChartProps = {
  /** Accessible chart name. Required. */
  label: string
  /** One entry per slice. */
  data: PieChartDatum[]
  /** Angle (deg) the first slice starts from, clockwise from 12 o'clock. Default `0`. */
  startAngle?: number
  /** Gap between slices in degrees. Default `1.5`. */
  padAngle?: number
  /** Draw a percentage outside each slice. Default `false`. */
  showLabels?: boolean
  /** Hide labels for slices below this share of the total (0–1). Default `0.04`. */
  labelThreshold?: number
  /** Format a slice's outside label. Defaults to a rounded percentage. */
  labelFormat?: (datum: PieChartDatum, fraction: number) => React.ReactNode
  /** Render the legend above the pie. Default `true`. */
  showLegend?: boolean
  /** Outer coordinate width. Default `320`. */
  width?: number
  /** Outer coordinate height. Default `320`. */
  height?: number
  /** Plot gutter override (defaults to a small symmetric inset). */
  margin?: Partial<ChartMargin>
}

const PIE_MARGIN: Partial<ChartMargin> = {
  top: 8,
  right: 8,
  bottom: 8,
  left: 8,
}

function toNumber(v: number): number {
  return Number.isFinite(v) ? Math.max(0, v) : 0
}

/** Point on a circle, measuring clockwise from 12 o'clock. */
function polar(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number
): [number, number] {
  const a = ((angleDeg - 90) * Math.PI) / 180
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)]
}

/**
 * SVG wedge path from the centre. A single slice spanning the whole circle is
 * drawn as two arcs so the `A` command never degenerates on a 360-degree sweep.
 */
function wedgePath(
  cx: number,
  cy: number,
  r: number,
  a0: number,
  a1: number
): string {
  const sweep = a1 - a0
  if (sweep >= 359.999) {
    const top = polar(cx, cy, r, a0)
    const bot = polar(cx, cy, r, a0 + 180)
    return `M${top[0]},${top[1]} A${r},${r} 0 1 1 ${bot[0]},${bot[1]} A${r},${r} 0 1 1 ${top[0]},${top[1]} Z`
  }
  const largeArc = sweep > 180 ? 1 : 0
  const [x0, y0] = polar(cx, cy, r, a0)
  const [x1, y1] = polar(cx, cy, r, a1)
  return `M${cx},${cy} L${x0},${y0} A${r},${r} 0 ${largeArc} 1 ${x1},${y1} Z`
}

/* --------------------------------------------------------------- the marks -- */

type PieMarksProps = {
  data: PieChartDatum[]
  startAngle: number
  padAngle: number
  showLabels: boolean
  labelThreshold: number
  labelFormat: (datum: PieChartDatum, fraction: number) => React.ReactNode
  total: number
}

function PieMarks({
  data,
  startAngle,
  padAngle,
  showLabels,
  labelThreshold,
  labelFormat,
  total,
}: PieMarksProps) {
  const { innerWidth, innerHeight, seriesByKey } = useChart()
  const cx = innerWidth / 2
  const cy = innerHeight / 2
  // Leave room outside the pie for labels so they stay within the coordinate box.
  const rOuter = Math.max(0, Math.min(innerWidth, innerHeight) / 2 - (showLabels ? 20 : 0))

  const slices = data.filter((d) => toNumber(d.value) > 0)
  const pad = slices.length > 1 ? Math.max(0, padAngle) : 0
  const available = 360 - pad * slices.length
  const full = available <= 0 ? 360 : available

  const fracs = slices.map((d) => (total > 0 ? toNumber(d.value) / total : 0))
  const wedges = slices.map((d, idx) => {
    const before = fracs.slice(0, idx).reduce((s, f) => s + f, 0)
    const frac = fracs[idx]
    const a0 = startAngle + before * full + pad * idx
    const a1 = a0 + frac * full
    const mid = (a0 + a1) / 2
    const color = seriesByKey[d.key]?.colorVar ?? "var(--color-chart-1)"
    return { d, a0, a1, mid, frac, color }
  })

  return (
    <g data-slot="pie-chart-marks">
      {wedges.map(({ d, a0, a1, color }) => (
        <path
          key={d.key}
          data-slot="pie-chart-slice"
          data-key={d.key}
          d={wedgePath(cx, cy, rOuter, a0, a1)}
          fill={color}
        />
      ))}

      {showLabels &&
        wedges.map(({ d, mid, frac }) => {
          if (frac < labelThreshold) return null
          const [lx, ly] = polar(cx, cy, rOuter + 12, mid)
          const cos = Math.cos(((mid - 90) * Math.PI) / 180)
          const anchor = cos > 0.2 ? "start" : cos < -0.2 ? "end" : "middle"
          return (
            <text
              key={d.key}
              data-slot="pie-chart-label"
              x={lx}
              y={ly}
              textAnchor={anchor}
              dominantBaseline="central"
              aria-hidden
              className="fill-muted-foreground text-xs tabular-nums"
            >
              {labelFormat(d, frac)}
            </text>
          )
        })}
    </g>
  )
}

/* -------------------------------------------------------------------- root -- */

function PieChart({
  label,
  data,
  startAngle = 0,
  padAngle = 1.5,
  showLabels = false,
  labelThreshold = 0.04,
  labelFormat = (_d, frac) => `${Math.round(frac * 100)}%`,
  showLegend = true,
  width = 320,
  height = 320,
  margin,
}: PieChartProps) {
  const series = data.map((d) => ({
    key: d.key,
    label: d.label,
    color: d.color,
  }))
  const total = data.reduce((sum, d) => sum + toNumber(d.value), 0)

  return (
    <ChartContainer
      label={label}
      series={series}
      width={width}
      height={height}
      margin={{ ...PIE_MARGIN, ...margin }}
    >
      {showLegend && <ChartLegend shape="square" />}
      <ChartPlot>
        <PieMarks
          data={data}
          startAngle={startAngle}
          padAngle={padAngle}
          showLabels={showLabels}
          labelThreshold={labelThreshold}
          labelFormat={labelFormat}
          total={total}
        />
      </ChartPlot>
    </ChartContainer>
  )
}

export { PieChart }
export type { PieChartProps, PieChartDatum }
