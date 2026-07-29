"use client";

import * as React from "react"

import { cn } from "@/lib/utils"
import { useChart } from "@/components/ui/chart-container"

/**
 * AEGIS — Axis
 *
 * A chart axis drawn inside `ChartPlot`. It reads the shared plot geometry from
 * `useChart()`, so it always lines up with the marks: a baseline along one edge
 * of the plot, evenly-spaced (or explicitly-placed) ticks, tick labels, and
 * optional gridlines spanning the plot.
 *
 * Ticks come from one of three sources, in priority order:
 *   1. `ticks`      — explicit `{ value, position }[]` (position is a 0–1
 *                     fraction from the data origin: left for a horizontal axis,
 *                     bottom for a vertical one).
 *   2. `categories` — one band-centred tick per category (bar/column charts).
 *   3. `domain`     — a linear numeric `[min, max]`, sampled into `tickCount`
 *                     evenly-spaced ticks (formatted via `format`).
 *
 * The data origin is the plot's bottom-left, so a vertical axis increases
 * upward and a horizontal axis increases rightward — matching how marks read
 * the same geometry.
 *
 * Public API is CLOSED — no `className` / `style`. All colour is token-driven
 * (`stroke-border`, `text-muted-foreground`); geometry comes from the shared
 * container and the numeric `tickSize`. See `.agent/rules/API_RULES.md`.
 */

type AxisOrientation = "bottom" | "left" | "top" | "right"

/** An explicitly-placed tick. `position` is a 0–1 fraction from the data origin. */
type AxisTick = { value: React.ReactNode; position: number }

type ResolvedTick = { label: React.ReactNode; position: number }

type AxisProps = Omit<
  React.ComponentProps<"g">,
  "className" | "style" | "children" | "format"
> & {
  /** Which plot edge the axis sits on. Default `bottom`. */
  orientation?: AxisOrientation
  /** Explicit ticks (highest priority). */
  ticks?: AxisTick[]
  /** Category labels → one band-centred tick each (bar/column axes). */
  categories?: React.ReactNode[]
  /** Linear numeric domain `[min, max]` → sampled ticks. */
  domain?: [number, number]
  /** How many ticks to sample from `domain`. Default `5`. */
  tickCount?: number
  /** Format a numeric domain tick value. Default `String`. */
  format?: (value: number) => React.ReactNode
  /** Draw gridlines across the plot at each tick. Default `false`. */
  showGrid?: boolean
  /** Draw the axis baseline. Default `true`. */
  showLine?: boolean
  /** Draw the short tick marks. Default `true`. */
  showTicks?: boolean
  /** Length of a tick mark in SVG user units. Default `6`. */
  tickSize?: number
  /** Optional axis title (e.g. a unit), placed outside the ticks. */
  label?: React.ReactNode
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n))

function linspace(min: number, max: number, count: number): number[] {
  const n = Math.max(2, Math.floor(count))
  if (max === min) return [min]
  return Array.from({ length: n }, (_, i) => min + ((max - min) * i) / (n - 1))
}

function buildTicks(
  ticks: AxisTick[] | undefined,
  categories: React.ReactNode[] | undefined,
  domain: [number, number] | undefined,
  tickCount: number,
  format: (value: number) => React.ReactNode
): ResolvedTick[] {
  if (ticks && ticks.length) {
    return ticks.map((t) => ({ label: t.value, position: clamp01(t.position) }))
  }
  if (categories && categories.length) {
    const n = categories.length
    return categories.map((c, i) => ({ label: c, position: (i + 0.5) / n }))
  }
  if (domain) {
    const [min, max] = domain
    const span = max - min || 1
    return linspace(min, max, tickCount).map((v) => ({
      label: format(v),
      position: clamp01((v - min) / span),
    }))
  }
  return []
}

function Axis({
  orientation = "bottom",
  ticks,
  categories,
  domain,
  tickCount = 5,
  format = (v) => String(v),
  showGrid = false,
  showLine = true,
  showTicks = true,
  tickSize = 6,
  label,
  ...props
}: AxisProps) {
  const { innerWidth, innerHeight } = useChart()
  const resolved = React.useMemo(
    () => buildTicks(ticks, categories, domain, tickCount, format),
    [ticks, categories, domain, tickCount, format]
  )

  const isHorizontal = orientation === "bottom" || orientation === "top"

  // Where the axis line sits, and how far tick marks / labels extend.
  // Horizontal ticks/labels sit below (bottom) or above (top) the plot;
  // vertical ones to the left (left) or right (right).
  const axisY = orientation === "bottom" ? innerHeight : 0
  const axisX = orientation === "right" ? innerWidth : 0
  const tickDir = orientation === "bottom" || orientation === "right" ? 1 : -1
  const labelGap = tickSize + 4

  const posToX = (p: number) => p * innerWidth
  const posToY = (p: number) => innerHeight - p * innerHeight // origin at bottom

  const textAnchor =
    orientation === "left"
      ? "end"
      : orientation === "right"
        ? "start"
        : "middle"

  return (
    <g
      data-slot="axis"
      data-orientation={orientation}
      aria-hidden
      {...props}
    >
      {/* Gridlines span the whole plot at each tick. */}
      {showGrid &&
        resolved.map((t, i) =>
          isHorizontal ? (
            <line
              key={`grid-${i}`}
              data-slot="axis-grid"
              x1={posToX(t.position)}
              y1={0}
              x2={posToX(t.position)}
              y2={innerHeight}
              className={cn("stroke-border/50")}
              strokeWidth={1}
            />
          ) : (
            <line
              key={`grid-${i}`}
              data-slot="axis-grid"
              x1={0}
              y1={posToY(t.position)}
              x2={innerWidth}
              y2={posToY(t.position)}
              className={cn("stroke-border/50")}
              strokeWidth={1}
            />
          )
        )}

      {/* Axis baseline. */}
      {showLine &&
        (isHorizontal ? (
          <line
            data-slot="axis-line"
            x1={0}
            y1={axisY}
            x2={innerWidth}
            y2={axisY}
            className={cn("stroke-border")}
            strokeWidth={1}
          />
        ) : (
          <line
            data-slot="axis-line"
            x1={axisX}
            y1={0}
            x2={axisX}
            y2={innerHeight}
            className={cn("stroke-border")}
            strokeWidth={1}
          />
        ))}

      {/* Ticks + labels. */}
      {resolved.map((t, i) => {
        if (isHorizontal) {
          const x = posToX(t.position)
          return (
            <g key={`tick-${i}`} data-slot="axis-tick">
              {showTicks && (
                <line
                  x1={x}
                  y1={axisY}
                  x2={x}
                  y2={axisY + tickSize * tickDir}
                  className={cn("stroke-border")}
                  strokeWidth={1}
                />
              )}
              <text
                x={x}
                y={axisY + labelGap * tickDir}
                textAnchor={textAnchor}
                dominantBaseline={orientation === "bottom" ? "hanging" : "auto"}
                className={cn("fill-muted-foreground text-xs")}
              >
                {t.label}
              </text>
            </g>
          )
        }
        const y = posToY(t.position)
        return (
          <g key={`tick-${i}`} data-slot="axis-tick">
            {showTicks && (
              <line
                x1={axisX}
                y1={y}
                x2={axisX + tickSize * tickDir}
                y2={y}
                className={cn("stroke-border")}
                strokeWidth={1}
              />
            )}
            <text
              x={axisX + labelGap * tickDir}
              y={y}
              textAnchor={textAnchor}
              dominantBaseline="central"
              className={cn("fill-muted-foreground text-xs")}
            >
              {t.label}
            </text>
          </g>
        )
      })}

      {/* Optional axis title, outside the tick labels. */}
      {label != null &&
        (isHorizontal ? (
          <text
            data-slot="axis-label"
            x={innerWidth / 2}
            y={
              orientation === "bottom"
                ? innerHeight + tickSize + 22
                : -(tickSize + 22)
            }
            textAnchor="middle"
            className={cn("fill-foreground text-xs font-medium")}
          >
            {label}
          </text>
        ) : (
          <text
            data-slot="axis-label"
            transform={`translate(${
              orientation === "left" ? -(tickSize + 30) : innerWidth + tickSize + 30
            }, ${innerHeight / 2}) rotate(${orientation === "left" ? -90 : 90})`}
            textAnchor="middle"
            className={cn("fill-foreground text-xs font-medium")}
          >
            {label}
          </text>
        ))}
    </g>
  )
}

export { Axis }
export type { AxisProps, AxisTick, AxisOrientation }
