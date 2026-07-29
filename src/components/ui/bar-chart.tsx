"use client";

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
 * AEGIS — Bar / Column Chart
 *
 * A config-driven column chart built on the AEGIS chart foundation. Give it a
 * row array (`data`), the field that names each category (`xKey`), and one
 * `series` entry per numeric field. Categories are laid out in evenly-spaced
 * bands across the x-axis (whose ticks are band-centred), and within each band
 * the series are either drawn side-by-side (`grouped`, the default) or stacked.
 *
 *   <BarChart
 *     label="Findings by severity"
 *     data={rows}
 *     xKey="month"
 *     series={[{ key: "high", label: "High" }, { key: "medium", label: "Medium" }]}
 *     stacked
 *   />
 *
 * Bars always grow from the zero baseline; the y-axis is a linear scale from
 * `yDomain`, or the data extent extended to include zero (for stacked charts the
 * extent uses per-category sums).
 *
 * Scope: this first Bar Chart is a static, deterministic renderer — bands,
 * scales, axes, and the legend are all verifiable without a browser. A
 * pointer/focus **hover tooltip** is deferred to a follow-up (browser-verified),
 * per the honestly-scoped precedent in `.agent/DECISIONS.md`.
 *
 * Public API is CLOSED — no `className` / `style`. Colour is token-only (the
 * chart palette). See `.agent/rules/API_RULES.md`.
 */

type BarChartDatum = Record<string, React.ReactNode>

type BarChartSeries = {
  /** Field in each datum holding this series' numeric value. */
  key: string
  /** Legend/label text. Falls back to `key`. */
  label?: string
  /** Palette slot (1–5). Omit to auto-assign by order. */
  color?: ChartColorIndex
}

type BarChartProps = {
  /** Accessible chart name. Required. */
  label: string
  /** Row data; one row per category. */
  data: BarChartDatum[]
  /** Field naming each category (the x label). */
  xKey: string
  /** One entry per series. */
  series: BarChartSeries[]
  /** Stack series within each band instead of grouping side-by-side. */
  stacked?: boolean
  /** Fixed y range. Omit to derive from the data (extended to include 0). */
  yDomain?: [number, number]
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
  /** Fraction of each band occupied by its bars (0–1). Default `0.7`. */
  bandPadding?: number
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
  data: BarChartDatum[],
  seriesKeys: string[],
  stacked: boolean,
  yDomain: [number, number] | undefined
): { yMin: number; yMax: number } {
  if (yDomain) return { yMin: yDomain[0], yMax: yDomain[1] }
  let lo = 0
  let hi = -Infinity
  for (const d of data) {
    if (stacked) {
      // Positive and negative bars stack SEPARATELY in the render, so the
      // domain must bound the positive stack top and the negative stack bottom
      // independently (a net sum would clip mixed-sign categories).
      let posSum = 0
      let negSum = 0
      for (const k of seriesKeys) {
        const v = toNumber(d[k])
        if (v >= 0) posSum += v
        else negSum += v
      }
      if (posSum > hi) hi = posSum
      if (negSum < lo) lo = negSum
    } else {
      for (const k of seriesKeys) {
        const v = toNumber(d[k])
        if (v > hi) hi = v
        if (v < lo) lo = v
      }
    }
  }
  if (!Number.isFinite(hi)) hi = 1
  if (lo === hi) hi = lo + 1
  return { yMin: lo, yMax: hi }
}

/* --------------------------------------------------------------- the marks -- */

type MarksProps = {
  data: BarChartDatum[]
  seriesKeys: string[]
  yMin: number
  yMax: number
  stacked: boolean
  bandPadding: number
}

function BarMarks({
  data,
  seriesKeys,
  yMin,
  yMax,
  stacked,
  bandPadding,
}: MarksProps) {
  const { innerWidth, innerHeight, seriesByKey } = useChart()
  const span = yMax - yMin || 1
  const n = data.length || 1
  const band = innerWidth / n
  const yAt = (v: number) => innerHeight - ((v - yMin) / span) * innerHeight
  const baseY = Math.min(innerHeight, Math.max(0, yAt(0)))
  const barsWidth = band * Math.min(1, Math.max(0, bandPadding))
  const bandInset = (band - barsWidth) / 2

  return (
    <g data-slot="bar-chart-marks">
      {data.map((d, i) => {
        const bandStart = i * band + bandInset
        if (stacked) {
          let posAcc = 0
          let negAcc = 0
          return (
            <g key={i} data-slot="bar-chart-band">
              {seriesKeys.map((key) => {
                const v = toNumber(d[key])
                const color = seriesByKey[key]?.colorVar ?? "var(--color-chart-1)"
                let y: number
                let h: number
                if (v >= 0) {
                  const top = yAt(posAcc + v)
                  const bottom = yAt(posAcc)
                  y = top
                  h = bottom - top
                  posAcc += v
                } else {
                  const top = yAt(negAcc)
                  const bottom = yAt(negAcc + v)
                  y = top
                  h = bottom - top
                  negAcc += v
                }
                return (
                  <rect
                    key={key}
                    data-slot="bar-chart-bar"
                    data-series={key}
                    x={bandStart}
                    y={y}
                    width={barsWidth}
                    height={Math.max(0, h)}
                    fill={color}
                  />
                )
              })}
            </g>
          )
        }
        // Grouped: series share the band side-by-side.
        const each = barsWidth / seriesKeys.length
        return (
          <g key={i} data-slot="bar-chart-band">
            {seriesKeys.map((key, s) => {
              const v = toNumber(d[key])
              const color = seriesByKey[key]?.colorVar ?? "var(--color-chart-1)"
              const top = Math.min(yAt(v), baseY)
              const h = Math.abs(baseY - yAt(v))
              return (
                <rect
                  key={key}
                  data-slot="bar-chart-bar"
                  data-series={key}
                  x={bandStart + s * each}
                  y={top}
                  width={Math.max(0, each - 1)}
                  height={Math.max(0, h)}
                  rx={2}
                  fill={color}
                />
              )
            })}
          </g>
        )
      })}
    </g>
  )
}

/* -------------------------------------------------------------------- root -- */

function BarChart({
  label,
  data,
  xKey,
  series,
  stacked = false,
  yDomain,
  showGrid = true,
  showXAxis = true,
  showYAxis = true,
  showLegend,
  yTickCount = 5,
  yFormat,
  bandPadding = 0.7,
  width = 640,
  height = 320,
  margin,
}: BarChartProps) {
  const seriesKeys = series.map((s) => s.key)
  const { yMin, yMax } = computeYExtent(data, seriesKeys, stacked, yDomain)
  const categories = data.map((d) => d[xKey])
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
        <BarMarks
          data={data}
          seriesKeys={seriesKeys}
          yMin={yMin}
          yMax={yMax}
          stacked={stacked}
          bandPadding={bandPadding}
        />
        {showXAxis && <Axis orientation="bottom" categories={categories} />}
      </ChartPlot>
    </ChartContainer>
  )
}

export { BarChart }
export type { BarChartProps, BarChartSeries, BarChartDatum }
