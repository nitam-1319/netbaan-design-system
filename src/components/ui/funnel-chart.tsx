import * as React from "react"

import {
  ChartContainer,
  useChart,
  type ChartColorIndex,
} from "@/components/ui/chart-container"

/**
 * AEGIS — Funnel Chart
 *
 * A staged conversion funnel: each stage is a centred bar whose width is
 * proportional to its value, so drop-off between steps reads at a glance. It
 * composes the AEGIS `Chart Container` (figure role, accessible name, and the
 * shared palette) and renders token-coloured stage rows with the value and the
 * conversion rate versus the first stage.
 *
 * A deterministic, token-only renderer (HTML bars, no SVG geometry needed). The
 * value and conversion are always shown as text (never colour alone). Public API
 * is CLOSED — no `className` / `style`. See `.agent/rules/API_RULES.md`.
 */

type FunnelStage = {
  /** Stable key (colour lookup). Falls back to the label. */
  key?: string
  /** Stage label. */
  label: React.ReactNode
  /** Stage value (count). */
  value: number
  /** Palette slot (1–5). Omit to auto-assign by order. */
  color?: ChartColorIndex
}

type FunnelChartProps = {
  /** Accessible chart name. Required. */
  label: string
  /** Ordered stages, largest first. */
  stages: FunnelStage[]
  /** Format a stage value. Defaults to locale integer. */
  valueFormat?: (value: number) => React.ReactNode
  /** Show the conversion rate vs. the first stage. Default `true`. */
  showConversion?: boolean
}

const nf = new Intl.NumberFormat("en")

function FunnelBars({
  stages,
  valueFormat,
  showConversion,
}: {
  stages: FunnelStage[]
  valueFormat: (v: number) => React.ReactNode
  showConversion: boolean
}) {
  const { seriesByKey } = useChart()
  const base = stages[0]?.value || 1
  const max = Math.max(...stages.map((s) => s.value), 1)

  return (
    <div data-slot="funnel-chart-stages" className="flex flex-col gap-2">
      {stages.map((stage, i) => {
        const id = stage.key ?? String(stage.label)
        const color = seriesByKey[id]?.colorVar ?? "var(--color-chart-1)"
        const widthPct = Math.max(4, (stage.value / max) * 100)
        const conversion = Math.round((stage.value / base) * 100)
        return (
          <div
            key={id}
            data-slot="funnel-chart-stage"
            data-stage={id}
            className="flex flex-col gap-1"
          >
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="truncate font-medium text-foreground">
                {stage.label}
              </span>
              <span
                dir="ltr"
                className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground"
              >
                {valueFormat(stage.value)}
                {showConversion && i > 0 ? (
                  <span className="ms-2 text-text-faint">{conversion}%</span>
                ) : null}
              </span>
            </div>
            <div className="flex h-7 w-full items-center justify-center rounded-md bg-surface-3">
              <div
                data-slot="funnel-chart-bar"
                className="h-full rounded-md transition-all"
                style={{ width: `${widthPct}%`, backgroundColor: color }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function FunnelChart({
  label,
  stages,
  valueFormat = (v) => nf.format(v),
  showConversion = true,
}: FunnelChartProps) {
  const seriesMeta = stages.map((s) => ({
    key: s.key ?? String(s.label),
    label: typeof s.label === "string" ? s.label : s.key,
    color: s.color,
  }))

  return (
    <ChartContainer label={label} series={seriesMeta}>
      <FunnelBars
        stages={stages}
        valueFormat={valueFormat}
        showConversion={showConversion}
      />
    </ChartContainer>
  )
}

export { FunnelChart }
export type { FunnelChartProps, FunnelStage }
