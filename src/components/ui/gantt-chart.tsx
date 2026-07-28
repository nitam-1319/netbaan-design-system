import * as React from "react"

import { cn } from "@/lib/utils"
import { CHART_PALETTE, type ChartColorIndex } from "@/components/ui/chart-container"

/**
 * AEGIS — Gantt Chart (Data Visualization)
 *
 * A deterministic timeline: one row per task, each drawn as a horizontal bar
 * spanning its `start`→`end` on a shared numeric time axis, with an optional
 * progress fill. Times are plain numbers (day/week indices, timestamps — you
 * choose the unit) and a `formatTick` turns axis positions into labels, so the
 * whole thing renders identically headless, without a date engine.
 *
 * It reuses the AEGIS chart palette (`--color-chart-*`) so a task's colour
 * matches the rest of the chart family. The `<svg>` is a labelled `role="img"`;
 * task names are real text, so meaning never rests on colour alone.
 *
 * SCOPE: a static renderer — dependency arrows, drag-to-reschedule, a "today"
 * marker, and collapsible task groups are deferred (additive layers), consistent
 * with the honestly-scoped chart precedents. Times read left→right (LTR) by
 * convention; pair with a table for a full non-visual alternative.
 *
 * Public API is CLOSED — no `className` / `style`. Colour is token-only; sizes
 * are numeric props. See `.agent/rules/API_RULES.md` and `.agent/rules/TOKEN_RULES.md`.
 */

type GanttTask = {
  /** Stable identifier (also the React key). */
  id: string
  /** Row label shown in the left gutter. */
  name: string
  /** Bar start on the numeric time axis. */
  start: number
  /** Bar end on the numeric time axis (must be ≥ `start`). */
  end: number
  /** Palette slot (1–5). Defaults by row order, wrapping after five. */
  color?: ChartColorIndex
  /** Completion fraction 0–1; draws a solid fill over the translucent bar. */
  progress?: number
}

type GanttChartProps = Omit<
  React.ComponentProps<"figure">,
  "className" | "style" | "children"
> & {
  /** Accessible name for the chart. Always provide one. */
  label: string
  /** Tasks, one bar per row, top to bottom. */
  tasks: GanttTask[]
  /** Time axis domain `[min, max]`. Defaults to the tasks' extent. */
  domain?: [number, number]
  /** Number of evenly spaced axis ticks. Default `6`. */
  tickCount?: number
  /** Format an axis position into a label. Default `String`. */
  formatTick?: (value: number) => string
  /** Width of the left task-name gutter, px. Default `140`. */
  labelWidth?: number
  /** Row height, px. Default `36`. */
  rowHeight?: number
  /** Overall SVG width in user units. Default `720`. */
  width?: number
  /** Draw vertical gridlines at each tick. Default `true`. */
  showGrid?: boolean
}

const HEADER = 28
const MARGIN_RIGHT = 16
const MARGIN_BOTTOM = 8
const BAR_GAP = 10

function clamp01(n: number) {
  return n < 0 ? 0 : n > 1 ? 1 : n
}

function GanttChart({
  label,
  tasks,
  domain,
  tickCount = 6,
  formatTick = String,
  labelWidth = 140,
  rowHeight = 36,
  width = 720,
  showGrid = true,
  ...props
}: GanttChartProps) {
  const height = HEADER + tasks.length * rowHeight + MARGIN_BOTTOM
  const plotLeft = labelWidth
  const plotWidth = Math.max(0, width - labelWidth - MARGIN_RIGHT)

  const dMin = domain?.[0] ?? (tasks.length ? Math.min(...tasks.map((t) => t.start)) : 0)
  const dMax = domain?.[1] ?? (tasks.length ? Math.max(...tasks.map((t) => t.end)) : 1)
  const span = dMax - dMin || 1
  const xOf = (v: number) => plotLeft + ((v - dMin) / span) * plotWidth

  const ticks = React.useMemo(() => {
    const n = Math.max(2, tickCount)
    return Array.from({ length: n }, (_, i) => dMin + (span * i) / (n - 1))
  }, [dMin, span, tickCount])

  const barHeight = Math.max(4, rowHeight - BAR_GAP)

  return (
    <figure
      data-slot="gantt-chart"
      role="group"
      aria-label={label}
      // Times read left→right by convention; force LTR so RTL locales don't
      // re-anchor the SVG axis/label text and clip it off-canvas.
      dir="ltr"
      className={cn("w-full text-foreground [&_svg]:overflow-visible")}
      {...props}
    >
      <svg
        data-slot="gantt-plot"
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={label}
        className={cn("block h-auto w-full")}
      >
        {/* Gridlines + axis tick labels */}
        <g data-slot="gantt-axis" aria-hidden>
          {ticks.map((t, i) => {
            const x = xOf(t)
            return (
              <g key={i}>
                {showGrid ? (
                  <line
                    x1={x}
                    y1={HEADER}
                    x2={x}
                    y2={height - MARGIN_BOTTOM}
                    className="stroke-border/50"
                    strokeWidth={1}
                  />
                ) : null}
                <text
                  x={x}
                  y={HEADER - 10}
                  textAnchor="middle"
                  className="fill-muted-foreground text-xs"
                >
                  {formatTick(t)}
                </text>
              </g>
            )
          })}
          {/* Gutter divider */}
          <line
            x1={plotLeft}
            y1={HEADER}
            x2={plotLeft}
            y2={height - MARGIN_BOTTOM}
            className="stroke-border"
            strokeWidth={1}
          />
        </g>

        {/* Rows: label + bar */}
        {tasks.map((task, i) => {
          const colorIndex = (task.color ?? ((i % CHART_PALETTE.length) + 1)) as ChartColorIndex
          const colorVar = `var(${CHART_PALETTE[colorIndex - 1]})`
          const rowTop = HEADER + i * rowHeight
          const barY = rowTop + (rowHeight - barHeight) / 2
          const x1 = xOf(task.start)
          const x2 = xOf(Math.max(task.start, task.end))
          const barW = Math.max(2, x2 - x1)
          const progress = task.progress === undefined ? null : clamp01(task.progress)
          return (
            <g key={task.id} data-slot="gantt-row">
              <text
                x={12}
                y={rowTop + rowHeight / 2}
                dominantBaseline="middle"
                className="fill-foreground text-xs"
              >
                {task.name}
              </text>
              <rect
                data-slot="gantt-bar"
                x={x1}
                y={barY}
                width={barW}
                height={barHeight}
                rx={4}
                fill={colorVar}
                fillOpacity={0.32}
              />
              {progress !== null ? (
                <rect
                  data-slot="gantt-bar-progress"
                  x={x1}
                  y={barY}
                  width={Math.max(0, barW * progress)}
                  height={barHeight}
                  rx={4}
                  fill={colorVar}
                />
              ) : null}
            </g>
          )
        })}
      </svg>
    </figure>
  )
}

export { GanttChart }
export type { GanttChartProps, GanttTask }
