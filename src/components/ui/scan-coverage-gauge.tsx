import * as React from "react"

import { RadialGauge, type RadialGaugeProps } from "@/components/ui/radial-gauge"

/**
 * AEGIS — Scan Coverage Gauge (Domain / ASM)
 *
 * A gauge for how much of the attack surface has actually been scanned —
 * `scanned` assets out of `total`. It composes the AEGIS `RadialGauge`, showing
 * the coverage percentage in the arc and, below it, the exact `scanned / total`
 * readout. Coverage tone escalates as it drops (high → success, low → danger) so
 * blind spots are visible at a glance.
 *
 * The percentage and the count are both real text, announced via the meter's
 * `aria-valuenow` / `aria-valuetext`, so coverage never depends on colour. Public
 * API is CLOSED — no `className` / `style`; everything is a semantic prop. All
 * colour is token-driven. See `.agent/rules/API_RULES.md`.
 */

const nf = new Intl.NumberFormat("en")

/** Coverage tone from the fraction scanned. */
function toneForCoverage(fraction: number): RadialGaugeProps["tone"] {
  if (fraction >= 0.9) return "success"
  if (fraction >= 0.6) return "accent"
  if (fraction >= 0.3) return "warning"
  return "danger"
}

type ScanCoverageGaugeProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style" | "children"
> & {
  /** Number of assets scanned. Required. */
  scanned: number
  /** Total number of assets. Required. */
  total: number
  /** Label above the gauge / meter accessible name. Default "Scan coverage". */
  label?: React.ReactNode
  /** Unit noun in the readout. Default "assets". */
  unit?: string
  /** Show the `scanned / total` readout under the gauge. Default `true`. */
  showReadout?: boolean
  /** Gauge scale. Default "md". */
  size?: RadialGaugeProps["size"]
  /** Arc weight. Default "thick". */
  thickness?: RadialGaugeProps["thickness"]
}

function ScanCoverageGauge({
  scanned,
  total,
  label = "Scan coverage",
  unit = "assets",
  showReadout = true,
  size = "md",
  thickness = "thick",
  ...props
}: ScanCoverageGaugeProps) {
  const safeTotal = total > 0 ? total : 1
  const clamped = Math.min(safeTotal, Math.max(0, scanned))
  const fraction = clamped / safeTotal
  const percent = Math.round(fraction * 100)
  const tone = toneForCoverage(fraction)
  const labelText = typeof label === "string" ? label : "Scan coverage"

  return (
    <div
      data-slot="scan-coverage-gauge"
      data-tone={tone}
      role="group"
      className="flex flex-col items-center gap-2"
      {...props}
    >
      {label != null ? (
        <span
          data-slot="scan-coverage-gauge-label"
          className="text-sm font-medium text-muted-foreground"
        >
          {label}
        </span>
      ) : null}

      <RadialGauge
        data-slot="scan-coverage-gauge-meter"
        value={clamped}
        min={0}
        max={safeTotal}
        tone={tone}
        shape="gauge"
        size={size}
        thickness={thickness}
        label={labelText}
        valueLabel={`${percent}% (${nf.format(clamped)} of ${nf.format(safeTotal)} ${unit})`}
      >
        <span className="font-heading text-xl font-semibold leading-none tracking-tight text-foreground tabular-nums">
          {percent}%
        </span>
      </RadialGauge>

      {showReadout ? (
        <span
          data-slot="scan-coverage-gauge-readout"
          className="font-mono text-xs tabular-nums text-text-faint"
        >
          <span className="text-foreground">{nf.format(clamped)}</span>
          {" / "}
          {nf.format(safeTotal)} {unit}
        </span>
      ) : null}
    </div>
  )
}

export { ScanCoverageGauge, toneForCoverage }
export type { ScanCoverageGaugeProps }
