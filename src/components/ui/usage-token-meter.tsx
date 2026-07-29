"use client";

import * as React from "react"

import { cn } from "@/lib/utils"
import { Progress, ProgressLabel } from "@/components/ui/progress"

/**
 * AEGIS — Usage / Token Meter (AI Components)
 *
 * A readout of how much of a bounded budget has been consumed — LLM context
 * tokens against a window, monthly spend against a quota, requests against a rate
 * limit. It composes the AEGIS `Progress` bar and adds a labelled header with a
 * `used / limit` readout and percentage, escalating the bar's `tone` as usage
 * approaches the ceiling (accent → warning → critical) so pressure is visible at
 * a glance.
 *
 * The numbers always carry the meaning; colour is reinforcement, never the sole
 * signal. Values are announced through the underlying progressbar
 * (`aria-valuenow` = used, `aria-valuemax` = limit). Public API is CLOSED — no
 * `className` / `style`; feed `used` / `limit` and tune the semantic thresholds.
 * All colour is token-driven. See `.agent/rules/API_RULES.md`.
 */

const compact = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
})

type UsageTokenMeterProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style" | "children"
> & {
  /** Amount consumed so far. Clamped to `[0, limit]` for the bar. */
  used: number
  /** The budget ceiling. */
  limit: number
  /** Header label, e.g. "Context window". */
  label?: React.ReactNode
  /** Unit noun shown after the readout. Default "tokens". */
  unit?: string
  /** Fraction (0–1) at which the bar turns warning. Default 0.75. */
  warnAt?: number
  /** Fraction (0–1) at which the bar turns critical. Default 0.9. */
  criticalAt?: number
  /** Show the `used / limit` + percent readout. Default `true`. */
  showValue?: boolean
  /** Format the used/limit numbers. Defaults to compact notation (1.2K). */
  formatValue?: (n: number) => string
}

function UsageTokenMeter({
  used,
  limit,
  label,
  unit = "tokens",
  warnAt = 0.75,
  criticalAt = 0.9,
  showValue = true,
  formatValue,
  ...props
}: UsageTokenMeterProps) {
  const safeLimit = limit > 0 ? limit : 1
  const clamped = Math.min(safeLimit, Math.max(0, used))
  const fraction = clamped / safeLimit
  const percent = Math.round(fraction * 100)

  const tone: "default" | "warning" | "critical" =
    fraction >= criticalAt
      ? "critical"
      : fraction >= warnAt
        ? "warning"
        : "default"

  const fmt = formatValue ?? ((n: number) => compact.format(n))

  return (
    <div
      data-slot="usage-token-meter"
      data-tone={tone}
      className={cn("flex w-full flex-col gap-1.5")}
      {...props}
    >
      <Progress
        value={clamped}
        max={safeLimit}
        tone={tone}
        // With no visible label there is no ProgressLabel to name the bar, so
        // give the progressbar an explicit accessible name (values are carried
        // by aria-valuenow/valuemax on the underlying primitive).
        aria-label={label == null ? "Usage" : undefined}
      >
        {(label != null || showValue) && (
          <div className="flex items-baseline justify-between gap-3">
            {label != null ? (
              <ProgressLabel>{label}</ProgressLabel>
            ) : (
              <span aria-hidden />
            )}
            {showValue && (
              <span
                data-slot="usage-token-meter-value"
                className="font-mono text-xs tabular-nums text-text-faint"
              >
                <span className="text-foreground">{fmt(clamped)}</span>
                {" / "}
                {fmt(safeLimit)} {unit}
                <span className="ms-1.5 text-muted-foreground">({percent}%)</span>
              </span>
            )}
          </div>
        )}
      </Progress>
    </div>
  )
}

export { UsageTokenMeter }
export type { UsageTokenMeterProps }
