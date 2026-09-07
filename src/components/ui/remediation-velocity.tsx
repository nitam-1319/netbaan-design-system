"use client";

import * as React from "react"

import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { BarChart } from "@/components/ui/bar-chart"
import { StatTileDelta } from "@/components/ui/stat-tile"

/**
 * AEGIS — Remediation Velocity (Domain / ASM)
 *
 * A widget that tracks how fast findings are being closed versus opened over time
 * — the security team's remediation velocity. It composes the AEGIS `Card` with a
 * grouped `BarChart` (opened vs resolved per period) and a headline net figure
 * rendered through `StatTileDelta`, so the trend reads as one system component.
 *
 * Net is `resolved − opened` across the series: positive means the backlog is
 * shrinking (good). The number and its direction are always spelled out (never
 * colour alone). Public API is CLOSED — no `className` / `style`; everything is a
 * semantic prop. Colour is token-only. See `.agent/rules/API_RULES.md`.
 */

type VelocityDatum = Record<string, React.ReactNode>

type RemediationVelocityProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style" | "children"
> & {
  /** Row data; one row per period. */
  data: VelocityDatum[]
  /** Field naming each period (the x label). */
  xKey: string
  /** Field holding the count opened in each period. Default "opened". */
  openedKey?: string
  /** Field holding the count resolved in each period. Default "resolved". */
  resolvedKey?: string
  /** Legend label for opened. Default "Opened". */
  openedLabel?: string
  /** Legend label for resolved. Default "Resolved". */
  resolvedLabel?: string
  /** Widget title. Default "Remediation velocity". */
  title?: React.ReactNode
  /** Supporting description. */
  description?: React.ReactNode
  /** Show the headline net figure. Default `true`. */
  showNet?: boolean
  /** Chart height in coordinate units. Default 260. */
  height?: number
  /**
   * Header action slot — a status marker, a period switch, a menu. The widget
   * owns its whole `Card`, so without this there is nowhere top-right for one
   * to go and the caller has to abandon the widget to place it.
   */
  action?: React.ReactNode
  /**
   * Supporting content under the chart — mean time to fix, fixed this quarter.
   * Figures that belong WITH the chart otherwise have nowhere to live.
   */
  footer?: React.ReactNode
  /** Caption under the net figure. Default `"net closed"` — English, so translate it. */
  netLabel?: React.ReactNode
  /**
   * Screen-reader wording for the three trend directions. The defaults are
   * English ("Backlog shrinking" / "Backlog growing" / "No change") and are
   * announced, not shown, so they are invisible to a translator who only looks
   * at the screen.
   */
  srTrendLabels?: { up?: string; down?: string; flat?: string }
}

function toNumber(v: React.ReactNode): number {
  const n = typeof v === "number" ? v : Number(v)
  return Number.isFinite(n) ? n : 0
}

function RemediationVelocity({
  data,
  xKey,
  openedKey = "opened",
  resolvedKey = "resolved",
  openedLabel = "Opened",
  resolvedLabel = "Resolved",
  title = "Remediation velocity",
  description,
  showNet = true,
  height = 260,
  action,
  footer,
  netLabel = "net closed",
  srTrendLabels,
  ...props
}: RemediationVelocityProps) {
  let totalOpened = 0
  let totalResolved = 0
  for (const row of data) {
    totalOpened += toNumber(row[openedKey])
    totalResolved += toNumber(row[resolvedKey])
  }
  const net = totalResolved - totalOpened
  const trend = net > 0 ? "up" : net < 0 ? "down" : "flat"
  const label = typeof title === "string" ? title : "Remediation velocity"

  return (
    <Card data-slot="remediation-velocity" data-trend={trend} variant="default" {...props}>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <span
              data-slot="remediation-velocity-title"
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
          {showNet ? (
            <div
              data-slot="remediation-velocity-net"
              className="flex shrink-0 flex-col items-end gap-0.5"
            >
              <StatTileDelta
                trend={trend}
                sentiment={net > 0 ? "positive" : net < 0 ? "negative" : "neutral"}
                srTrendLabel={
                  net > 0
                    ? (srTrendLabels?.up ?? "Backlog shrinking")
                    : net < 0
                      ? (srTrendLabels?.down ?? "Backlog growing")
                      : (srTrendLabels?.flat ?? "No change")
                }
              >
                {net > 0 ? `+${net}` : `${net}`}
              </StatTileDelta>
              <span className="text-xs text-muted-foreground">{netLabel}</span>
            </div>
          ) : null}
          {action ? (
            <div
              data-slot="remediation-velocity-action"
              className="flex shrink-0 items-center gap-2"
            >
              {action}
            </div>
          ) : null}
        </div>
      </CardHeader>

      <CardContent>
        <BarChart
          label={label}
          data={data}
          xKey={xKey}
          series={[
            { key: openedKey, label: openedLabel },
            { key: resolvedKey, label: resolvedLabel },
          ]}
          height={height}
        />
        {footer ? (
          <div
            data-slot="remediation-velocity-footer"
            className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border pt-3"
          >
            {footer}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

export { RemediationVelocity }
export type { RemediationVelocityProps }
