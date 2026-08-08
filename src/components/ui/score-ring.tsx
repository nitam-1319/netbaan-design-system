"use client";

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Score Ring (Domain / ASM)
 *
 * A small ring that carries one bounded score and prints it in the middle — the
 * per-row form of a severity-weighted figure such as CVSS. The arc length is the
 * score's share of the scale and the arc colour is its severity band, so a table
 * of findings can be skimmed for "how bad" before any number is read.
 *
 *   <ScoreRing label="CVSS" value={9.8} tone="critical" />
 *
 * How it differs from `RadialGauge`: the gauge is a standalone meter — larger,
 * with a 270° dial and the semantic accent/success/warning tones. This is a
 * dense inline ring sized for a table cell, tinted from the **severity** ramp,
 * and it renders an explicit unscored state rather than drawing zero.
 *
 * An absent score is NOT zero. Pass `value={null}` and the ring renders its
 * empty track with an em dash — a finding that was never scored must never be
 * shown as a 0.0.
 *
 * Public API is CLOSED — no `className` / `style`; colour comes from the
 * `--sev-*` tokens via `tone`. See `.agent/rules/API_RULES.md`.
 */

/** Ring geometry per size, in SVG user units (= px at 1×). */
const RING = {
  sm: { box: 38, radius: 15, stroke: 4 },
  md: { box: 48, radius: 19, stroke: 5 },
} as const

const rootVariants = cva("relative shrink-0", {
  variants: {
    size: { sm: "size-[38px]", md: "size-12" },
    tone: {
      critical: "text-sev-critical",
      high: "text-sev-high",
      medium: "text-sev-medium",
      low: "text-sev-low",
      info: "text-sev-info",
      neutral: "text-muted-foreground",
      accent: "text-primary",
    },
  },
  defaultVariants: { size: "sm", tone: "neutral" },
})

const valueVariants = cva(
  "font-mono font-semibold tabular-nums text-foreground",
  {
    variants: { size: { sm: "text-[10.5px]", md: "text-xs" } },
    defaultVariants: { size: "sm" },
  }
)

type ScoreRingProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style" | "children"
> &
  VariantProps<typeof rootVariants> & {
    /**
     * The score. `null` means "not scored" and renders the empty state — it is
     * NOT interchangeable with `0`, which is a real score at the bottom of the
     * scale.
     */
    value: number | null
    /** Top of the scale. Default `10` (CVSS). */
    max?: number
    /** Accessible name for the reading (e.g. "CVSS score"). Required. */
    label: string
    /** Placeholder shown when `value` is `null`. Default `"—"`. */
    emptyLabel?: string
    /** Decimal places in the centre readout. Default `1`. */
    precision?: number
  }

function ScoreRing({
  value,
  max = 10,
  size = "sm",
  tone = "neutral",
  label,
  emptyLabel = "—",
  precision = 1,
  ...props
}: ScoreRingProps) {
  const ring = RING[size ?? "sm"]
  const scored = value != null && Number.isFinite(value)
  const fraction = scored ? Math.min(1, Math.max(0, value / (max || 1))) : 0

  const circumference = 2 * Math.PI * ring.radius
  const center = ring.box / 2

  return (
    <div
      data-slot="score-ring"
      data-scored={scored || undefined}
      // A meter needs a value; an unscored ring has none, so it degrades to a
      // labelled group whose text ("—") is the whole reading.
      role={scored ? "meter" : "group"}
      aria-label={label}
      aria-valuenow={scored ? value : undefined}
      aria-valuemin={scored ? 0 : undefined}
      aria-valuemax={scored ? max : undefined}
      aria-valuetext={scored ? `${value} / ${max}` : emptyLabel}
      className={cn(rootVariants({ size, tone }))}
      {...props}
    >
      <svg
        width={ring.box}
        height={ring.box}
        viewBox={`0 0 ${ring.box} ${ring.box}`}
        fill="none"
        aria-hidden
        // Start the sweep at 12 o'clock rather than 3.
        className="-rotate-90"
      >
        <circle
          data-slot="score-ring-track"
          cx={center}
          cy={center}
          r={ring.radius}
          strokeWidth={ring.stroke}
          className="stroke-track"
        />
        {scored && fraction > 0 && (
          <circle
            data-slot="score-ring-value"
            cx={center}
            cy={center}
            r={ring.radius}
            strokeWidth={ring.stroke}
            strokeLinecap="round"
            strokeDasharray={`${fraction * circumference} ${circumference}`}
            className="stroke-current"
          />
        )}
      </svg>
      <span
        data-slot="score-ring-value-label"
        aria-hidden
        className="absolute inset-0 flex items-center justify-center"
      >
        <span className={cn(valueVariants({ size }))}>
          {scored ? value.toFixed(precision) : emptyLabel}
        </span>
      </span>
    </div>
  )
}

export { ScoreRing }
export type { ScoreRingProps }
