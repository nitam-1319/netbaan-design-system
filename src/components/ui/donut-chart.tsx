"use client";

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
 * AEGIS — Donut Chart
 *
 * A config-driven donut chart built on the AEGIS chart foundation. Give it a
 * `label` and a `data` array of slices (`{ key, label?, value, color? }`); each
 * slice becomes an annular segment whose angle is its share of the total, and a
 * legend entry that carries the same colour and name. Colours resolve from the
 * shared `ChartContainer` palette, so the ring and the legend always agree.
 *
 *   <DonutChart
 *     label="Findings by severity"
 *     data={[
 *       { key: "critical", label: "Critical", value: 4 },
 *       { key: "high", label: "High", value: 11 },
 *       { key: "medium", label: "Medium", value: 23 },
 *     ]}
 *   />
 *
 * The hole in the middle is sized by `innerRatio` (0 → a full pie; the sibling
 * `PieChart` is exactly that preset) and can show a centre readout — by default
 * the summed total.
 *
 * Scope: this Donut Chart is a static, deterministic renderer — every segment
 * path, the centre readout, and the legend are verifiable without a browser. A
 * pointer/focus **hover tooltip** and segment selection are deferred to a
 * follow-up, per the honestly-scoped precedent in `.agent/DECISIONS.md`.
 *
 * Public API is CLOSED — no `className` / `style`. Colour is token-only (the
 * chart palette). See `.agent/rules/API_RULES.md`.
 */

/** One slice of the ring. */
type DonutChartDatum = {
  /** Stable identifier — also the legend/colour lookup key. */
  key: string
  /** Human label shown in the legend. Falls back to `key`. */
  label?: string
  /** Numeric magnitude; the slice angle is its share of the total. */
  value: number
  /** Palette slot (1–5). Omit to auto-assign by order. */
  color?: ChartColorIndex
}

type DonutChartProps = {
  /** Accessible chart name. Required. */
  label: string
  /** One entry per slice. */
  data: DonutChartDatum[]
  /**
   * Hole size as a fraction of the outer radius (0–0.95). `0` is a full pie.
   * Default `0.6`.
   */
  innerRatio?: number
  /** Angle (deg) the first slice starts from, clockwise from 12 o'clock. Default `0`. */
  startAngle?: number
  /** Gap between slices in degrees. Default `1.5`. */
  padAngle?: number
  /** Show a centre readout (donut only — ignored when `innerRatio` is 0). Default `true`. */
  showCenterLabel?: boolean
  /** Centre readout content. Defaults to the formatted total. */
  centerLabel?: React.ReactNode
  /** Small caption under the centre readout. */
  centerSublabel?: React.ReactNode
  /** Format the total (and any value readout). Default `String`. */
  valueFormat?: (value: number) => React.ReactNode
  /** Render the legend above the ring. Default `true`. */
  showLegend?: boolean
  /** Outer coordinate width. Default `320`. */
  width?: number
  /** Outer coordinate height. Default `320`. */
  height?: number
  /** Plot gutter override (defaults to a small symmetric inset). */
  margin?: Partial<ChartMargin>
}

const DONUT_MARGIN: Partial<ChartMargin> = {
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
 * SVG path for one annular sector (donut segment) or wedge (`rInner === 0`).
 * A single slice spanning the whole circle is drawn as two half arcs so the `A`
 * command never degenerates on a 360-degree sweep.
 */
function segmentPath(
  cx: number,
  cy: number,
  rOuter: number,
  rInner: number,
  a0: number,
  a1: number
): string {
  const sweep = a1 - a0
  const full = sweep >= 359.999
  const isPie = rInner <= 0.01

  if (full) {
    // Full ring/circle — draw with two arcs to avoid the 360-degree degeneracy.
    const oTop = polar(cx, cy, rOuter, a0)
    const oBot = polar(cx, cy, rOuter, a0 + 180)
    const outer = `M${oTop[0]},${oTop[1]} A${rOuter},${rOuter} 0 1 1 ${oBot[0]},${oBot[1]} A${rOuter},${rOuter} 0 1 1 ${oTop[0]},${oTop[1]} Z`
    if (isPie) return outer
    const iTop = polar(cx, cy, rInner, a0)
    const iBot = polar(cx, cy, rInner, a0 + 180)
    // Second (reversed) circle carves the hole via even-odd fill.
    const inner = `M${iTop[0]},${iTop[1]} A${rInner},${rInner} 0 1 0 ${iBot[0]},${iBot[1]} A${rInner},${rInner} 0 1 0 ${iTop[0]},${iTop[1]} Z`
    return `${outer} ${inner}`
  }

  const largeArc = sweep > 180 ? 1 : 0
  const [x0o, y0o] = polar(cx, cy, rOuter, a0)
  const [x1o, y1o] = polar(cx, cy, rOuter, a1)

  if (isPie) {
    return `M${cx},${cy} L${x0o},${y0o} A${rOuter},${rOuter} 0 ${largeArc} 1 ${x1o},${y1o} Z`
  }

  const [x1i, y1i] = polar(cx, cy, rInner, a1)
  const [x0i, y0i] = polar(cx, cy, rInner, a0)
  return `M${x0o},${y0o} A${rOuter},${rOuter} 0 ${largeArc} 1 ${x1o},${y1o} L${x1i},${y1i} A${rInner},${rInner} 0 ${largeArc} 0 ${x0i},${y0i} Z`
}

/* --------------------------------------------------------------- the marks -- */

type DonutMarksProps = {
  data: DonutChartDatum[]
  innerRatio: number
  startAngle: number
  padAngle: number
  showCenterLabel: boolean
  centerLabel: React.ReactNode
  centerSublabel: React.ReactNode
  total: number
  valueFormat: (value: number) => React.ReactNode
}

function DonutMarks({
  data,
  innerRatio,
  startAngle,
  padAngle,
  showCenterLabel,
  centerLabel,
  centerSublabel,
  total,
  valueFormat,
}: DonutMarksProps) {
  const { innerWidth, innerHeight, seriesByKey } = useChart()
  const cx = innerWidth / 2
  const cy = innerHeight / 2
  const rOuter = Math.max(0, Math.min(innerWidth, innerHeight) / 2)
  const rInner = rOuter * Math.min(0.95, Math.max(0, innerRatio))
  const isPie = rInner <= 0.01

  // Only non-zero slices take angular space (and a pad gap).
  const slices = data.filter((d) => toNumber(d.value) > 0)
  const pad = slices.length > 1 ? Math.max(0, padAngle) : 0
  const available = 360 - pad * slices.length
  const full = available <= 0 ? 360 : available

  const fracs = slices.map((d) => (total > 0 ? toNumber(d.value) / total : 0))
  const wedges = slices.map((d, idx) => {
    const before = fracs.slice(0, idx).reduce((s, f) => s + f, 0)
    const a0 = startAngle + before * full + pad * idx
    const a1 = a0 + fracs[idx] * full
    const color = seriesByKey[d.key]?.colorVar ?? "var(--color-chart-1)"
    return { d, a0, a1, color }
  })

  return (
    <g data-slot="donut-chart-marks">
      {wedges.map(({ d, a0, a1, color }) => (
        <path
          key={d.key}
          data-slot="donut-chart-slice"
          data-key={d.key}
          d={segmentPath(cx, cy, rOuter, rInner, a0, a1)}
          fill={color}
          fillRule="evenodd"
        />
      ))}

      {!isPie && showCenterLabel && (
        <g data-slot="donut-chart-center" aria-hidden>
          <text
            x={cx}
            y={centerSublabel != null ? cy - 4 : cy}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-foreground text-2xl font-semibold tabular-nums"
          >
            {centerLabel ?? valueFormat(total)}
          </text>
          {centerSublabel != null && (
            <text
              x={cx}
              y={cy + 18}
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-muted-foreground text-xs"
            >
              {centerSublabel}
            </text>
          )}
        </g>
      )}
    </g>
  )
}

/* -------------------------------------------------------------------- root -- */

function DonutChart({
  label,
  data,
  innerRatio = 0.6,
  startAngle = 0,
  padAngle = 1.5,
  showCenterLabel = true,
  centerLabel,
  centerSublabel,
  valueFormat = (v) => String(v),
  showLegend = true,
  width = 320,
  height = 320,
  margin,
}: DonutChartProps) {
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
      margin={{ ...DONUT_MARGIN, ...margin }}
    >
      {showLegend && <ChartLegend shape="square" />}
      <ChartPlot>
        <DonutMarks
          data={data}
          innerRatio={innerRatio}
          startAngle={startAngle}
          padAngle={padAngle}
          showCenterLabel={showCenterLabel}
          centerLabel={centerLabel}
          centerSublabel={centerSublabel}
          total={total}
          valueFormat={valueFormat}
        />
      </ChartPlot>
    </ChartContainer>
  )
}

export { DonutChart, segmentPath as donutSegmentPath }
export type { DonutChartProps, DonutChartDatum }
