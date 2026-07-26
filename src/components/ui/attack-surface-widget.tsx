import * as React from "react"

import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { BarChart } from "@/components/ui/bar-chart"

/**
 * AEGIS — Attack Surface Widget (Domain / ASM)
 *
 * A dashboard tile that summarises the exposed attack surface as a column chart —
 * exposed services by type, open ports by category, or findings by severity across
 * a period. It composes the AEGIS `Card` framing with the config-driven
 * `BarChart`, adding a title, an optional description, and an optional headline
 * total, so a surface breakdown reads as one system component.
 *
 * All the chart's semantics (categories, series, stacking, axes, legend) are
 * passed straight through to `BarChart`. Public API is CLOSED — no `className` /
 * `style`; everything is a semantic prop. Colour is token-only (the chart
 * palette). See `.agent/rules/API_RULES.md`.
 */

type AttackSurfaceWidgetProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style" | "children"
> & {
  /** Widget title. Default "Attack surface". */
  title?: React.ReactNode
  /** Supporting description under the title. */
  description?: React.ReactNode
  /** Row data; one row per category (passed to BarChart). */
  data: React.ComponentProps<typeof BarChart>["data"]
  /** Field naming each category. */
  xKey: string
  /** One entry per series. */
  series: React.ComponentProps<typeof BarChart>["series"]
  /** Accessible chart name. Defaults to the title (or "Attack surface"). */
  chartLabel?: string
  /** Stack series within each band instead of grouping. */
  stacked?: boolean
  /** Headline total shown at the top-right (e.g. total exposed services). */
  total?: React.ReactNode
  /** Label under the headline total. */
  totalLabel?: React.ReactNode
  /** Chart height in coordinate units. Default 260. */
  height?: number
  /** Format a y-axis tick value. */
  yFormat?: (value: number) => React.ReactNode
  /** Show the legend. Defaults to BarChart's rule (>1 series). */
  showLegend?: boolean
}

function AttackSurfaceWidget({
  title = "Attack surface",
  description,
  data,
  xKey,
  series,
  chartLabel,
  stacked = false,
  total,
  totalLabel,
  height = 260,
  yFormat,
  showLegend,
  ...props
}: AttackSurfaceWidgetProps) {
  const label =
    chartLabel ?? (typeof title === "string" ? title : "Attack surface")

  return (
    <Card data-slot="attack-surface-widget" variant="default" {...props}>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <span
              data-slot="attack-surface-widget-title"
              className="font-heading text-base font-semibold tracking-tight text-foreground"
            >
              {title}
            </span>
            {description != null ? (
              <span className="text-sm text-muted-foreground text-pretty">
                {description}
              </span>
            ) : null}
          </div>
          {total != null ? (
            <div
              data-slot="attack-surface-widget-total"
              className="flex shrink-0 flex-col items-end"
            >
              <span className="font-heading text-2xl font-semibold tabular-nums text-foreground">
                {total}
              </span>
              {totalLabel != null ? (
                <span className="text-xs text-muted-foreground">{totalLabel}</span>
              ) : null}
            </div>
          ) : null}
        </div>
      </CardHeader>

      <CardContent>
        <BarChart
          label={label}
          data={data}
          xKey={xKey}
          series={series}
          stacked={stacked}
          height={height}
          yFormat={yFormat}
          {...(showLegend != null ? { showLegend } : {})}
        />
      </CardContent>
    </Card>
  )
}

export { AttackSurfaceWidget }
export type { AttackSurfaceWidgetProps }
