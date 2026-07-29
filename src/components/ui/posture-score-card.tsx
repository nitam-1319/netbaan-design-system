"use client";

import * as React from "react"

import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { RadialGauge, type RadialGaugeProps } from "@/components/ui/radial-gauge"
import { Badge } from "@/components/ui/badge"
import { StatTileDelta } from "@/components/ui/stat-tile"

/**
 * AEGIS — Posture Score Card (Domain / ASM)
 *
 * The headline "how secure are we" tile: a large `RadialGauge` showing a posture
 * score out of a maximum, an optional letter grade, a period-over-period delta,
 * and a caption. It composes the AEGIS `Card` surface with `RadialGauge`,
 * `Badge` (grade), and `StatTileDelta` (trend), so every hue and affordance is
 * inherited from the system.
 *
 * Tone is derived from the score (≥90 success … <50 danger) so the ring's colour
 * always reflects the number; the score and delta are also spelled out as text.
 * Public API is CLOSED — no `className` / `style`; everything is a semantic prop.
 * All colour is token-driven. See `.agent/rules/API_RULES.md`.
 */

/** Derive a gauge tone from the score fraction. */
function toneForScore(fraction: number): RadialGaugeProps["tone"] {
  if (fraction >= 0.9) return "success"
  if (fraction >= 0.7) return "accent"
  if (fraction >= 0.5) return "warning"
  return "danger"
}

type PostureScoreCardProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style" | "children"
> & {
  /** The posture score. Required. */
  score: number
  /** Maximum score. Default 100. */
  max?: number
  /** Card label. Default "Security posture". */
  label?: React.ReactNode
  /** Optional letter grade shown as a badge (e.g. "A-"). */
  grade?: string
  /** Previous-period score → computes the delta shown under the gauge. */
  previousScore?: number
  /** Supporting caption (e.g. "vs. last 30 days"). */
  caption?: React.ReactNode
  /** Gauge scale. Default "lg". */
  size?: RadialGaugeProps["size"]
}

function PostureScoreCard({
  score,
  max = 100,
  label = "Security posture",
  grade,
  previousScore,
  caption,
  size = "lg",
  ...props
}: PostureScoreCardProps) {
  const safeMax = max > 0 ? max : 100
  const clamped = Math.min(safeMax, Math.max(0, score))
  const fraction = clamped / safeMax
  const tone = toneForScore(fraction)

  const delta =
    previousScore != null ? Math.round(clamped - previousScore) : null
  const trend = delta == null ? "flat" : delta > 0 ? "up" : delta < 0 ? "down" : "flat"

  return (
    <Card
      data-slot="posture-score-card"
      data-tone={tone}
      variant="default"
      {...props}
    >
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <span
            data-slot="posture-score-card-label"
            className="text-sm font-medium text-muted-foreground"
          >
            {label}
          </span>
          {grade != null ? (
            <Badge
              tone={
                tone === "danger" ? "danger" : tone === "warning" ? "warning" : tone === "success" ? "success" : "accent"
              }
              variant="soft"
              size="sm"
              dir="ltr"
              data-slot="posture-score-card-grade"
            >
              Grade {grade}
            </Badge>
          ) : null}
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col items-center gap-3">
          <RadialGauge
            data-slot="posture-score-card-gauge"
            value={clamped}
            min={0}
            max={safeMax}
            tone={tone}
            shape="gauge"
            thickness="thick"
            size={size}
            label={typeof label === "string" ? label : "Security posture"}
            valueLabel={`${Math.round(clamped)}`}
          />

          <div className="flex flex-col items-center gap-1">
            <span className="text-xs text-text-faint">
              out of {safeMax}
            </span>
            {delta != null ? (
              <StatTileDelta
                trend={trend}
                dir="ltr"
                srTrendLabel={
                  trend === "up" ? "Improved" : trend === "down" ? "Declined" : "No change"
                }
              >
                {delta > 0 ? `+${delta}` : `${delta}`} pts
              </StatTileDelta>
            ) : null}
            {caption != null ? (
              <p
                data-slot="posture-score-card-caption"
                className="text-xs text-muted-foreground text-pretty"
              >
                {caption}
              </p>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export { PostureScoreCard, toneForScore }
export type { PostureScoreCardProps }
