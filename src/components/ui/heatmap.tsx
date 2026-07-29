"use client";


import { cn } from "@/lib/utils"
import {
  ChartContainer,
  type ChartColorIndex,
} from "@/components/ui/chart-container"

/**
 * AEGIS — Heatmap
 *
 * A matrix of values shown as a grid of colour-graded cells — activity by
 * day/hour, findings by asset/severity, coverage by team/control. It composes the
 * AEGIS `Chart Container` (figure role, accessible name, palette) and renders a
 * semantic table whose cell backgrounds scale from the surface to a single chart
 * hue by value intensity.
 *
 * Values are carried by each cell's accessible name (and optional visible text),
 * never colour alone. A static, deterministic renderer. Public API is CLOSED — no
 * `className` / `style`. Colour is token-only. See `.agent/rules/API_RULES.md`.
 */

type HeatmapProps = {
  /** Accessible chart name. Required. */
  label: string
  /** Column headers (x axis). */
  xLabels: string[]
  /** Row headers (y axis). */
  yLabels: string[]
  /** Value matrix indexed `[row][col]` (aligns to yLabels × xLabels). */
  values: number[][]
  /** Fixed low end of the colour scale. Omit to derive from the data. */
  min?: number
  /** Fixed high end of the colour scale. Omit to derive from the data. */
  max?: number
  /** Palette slot (1–5) used as the max-intensity hue. Default 1. */
  colorIndex?: ChartColorIndex
  /** Render the numeric value inside each cell. Default `false`. */
  showValues?: boolean
  /** Format a cell value (visible + accessible). Defaults to `String`. */
  valueFormat?: (value: number) => string
}

function Heatmap({
  label,
  xLabels,
  yLabels,
  values,
  min,
  max,
  colorIndex = 1,
  showValues = false,
  valueFormat = (v) => String(v),
}: HeatmapProps) {
  const flat = values.flat().filter((v) => Number.isFinite(v))
  const lo = min ?? (flat.length ? Math.min(...flat) : 0)
  const hi = max ?? (flat.length ? Math.max(...flat) : 1)
  const span = hi - lo || 1
  const hue = `var(--color-chart-${colorIndex})`

  return (
    <ChartContainer label={label}>
      <table
        data-slot="heatmap"
        className="w-full border-separate border-spacing-1 text-xs"
      >
        <thead>
          <tr>
            <th aria-hidden className="w-px" />
            {xLabels.map((x, i) => (
              <th
                key={i}
                scope="col"
                className="px-1 pb-1 text-center font-medium text-muted-foreground"
              >
                {x}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {yLabels.map((y, r) => (
            <tr key={r}>
              <th
                scope="row"
                className="pe-2 text-end font-medium whitespace-nowrap text-muted-foreground"
              >
                {y}
              </th>
              {xLabels.map((x, c) => {
                const v = values[r]?.[c] ?? 0
                const t = Math.min(1, Math.max(0, (v - lo) / span))
                const pct = Math.round(t * 100)
                return (
                  <td
                    key={c}
                    data-slot="heatmap-cell"
                    data-value={v}
                    className={cn(
                      "h-8 rounded-md text-center align-middle tabular-nums",
                      t > 0.55 ? "text-on-tone" : "text-foreground"
                    )}
                    style={{
                      backgroundColor: `color-mix(in oklch, ${hue} ${pct}%, var(--surface-2))`,
                    }}
                  >
                    <span className="sr-only">
                      {y}, {x}: {valueFormat(v)}
                    </span>
                    {showValues ? (
                      <span aria-hidden>{valueFormat(v)}</span>
                    ) : null}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </ChartContainer>
  )
}

export { Heatmap }
export type { HeatmapProps }
