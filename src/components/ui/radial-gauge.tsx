import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Radial Gauge
 *
 * A circular indicator for a single scalar value within a known range — a
 * posture score, scan coverage, a percentage complete. Two shapes: a classic
 * `gauge` (a 270° arc with a gap at the bottom) and a full `ring`. The filled
 * arc is painted with `currentColor` so its colour comes entirely from the
 * semantic `tone`; the track and centre label are token-driven too.
 *
 * Purely presentational and deterministic — the same `value` always yields the
 * same arc, no internal state. Exposes the ARIA `meter` role with
 * `aria-valuenow/min/max`, so the value is announced independently of colour.
 *
 * Public API is CLOSED — no `className` / `style`. Shape via `shape`, colour via
 * `tone`, scale via `size`, arc weight via `thickness`. All colour is
 * token-driven. See `.agent/rules/API_RULES.md` and `.agent/DECISIONS.md`.
 */

/* ------------------------------------------------------------- geometry -- */

const VIEWBOX = 100
const CENTER = VIEWBOX / 2

/** Stroke width (in viewBox units) per semantic thickness. */
const STROKE: Record<"thin" | "regular" | "thick", number> = {
  thin: 6,
  regular: 9,
  thick: 13,
}

/** Arc geometry per shape: where the sweep starts and how far it travels. */
const SHAPE: Record<"gauge" | "ring", { start: number; sweep: number }> = {
  // 270° arc with a symmetric 90° gap centred on the bottom.
  gauge: { start: 225, sweep: 270 },
  // Full circle, starting at the top.
  ring: { start: 0, sweep: 360 },
}

/** Point on a circle; angle measured in degrees clockwise from the top. */
function polar(cx: number, cy: number, r: number, angle: number) {
  const rad = (angle * Math.PI) / 180
  return { x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad) }
}

/** SVG path for a clockwise arc from `start` to `end` degrees (from the top). */
function describeArc(
  cx: number,
  cy: number,
  r: number,
  start: number,
  end: number
) {
  const from = polar(cx, cy, r, start)
  const to = polar(cx, cy, r, end)
  const largeArc = end - start > 180 ? 1 : 0
  return `M ${from.x.toFixed(3)} ${from.y.toFixed(3)} A ${r} ${r} 0 ${largeArc} 1 ${to.x.toFixed(3)} ${to.y.toFixed(3)}`
}

/* ---------------------------------------------------------------- root -- */

const gaugeVariants = cva(
  "relative inline-grid place-items-center [&>*]:[grid-area:1/1]",
  {
    variants: {
      size: {
        sm: "size-16",
        md: "size-24",
        lg: "size-32",
      },
      tone: {
        accent: "text-primary",
        success: "text-success",
        warning: "text-warning",
        danger: "text-destructive",
        neutral: "text-muted-foreground",
      },
    },
    defaultVariants: {
      size: "md",
      tone: "accent",
    },
  }
)

const valueTextVariants = cva(
  "font-heading font-semibold leading-none tracking-tight text-foreground tabular-nums",
  {
    variants: {
      size: {
        sm: "text-sm",
        md: "text-lg",
        lg: "text-2xl",
      },
    },
    defaultVariants: { size: "md" },
  }
)

type RadialGaugeProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style" | "children"
> &
  VariantProps<typeof gaugeVariants> & {
    /** Current value. Clamped to `[min, max]` before drawing. */
    value: number
    /** Range minimum. Default `0`. */
    min?: number
    /** Range maximum. Default `100`. */
    max?: number
    /** `gauge` — 270° arc with a bottom gap (default). `ring` — full circle. */
    shape?: "gauge" | "ring"
    /** Arc weight. Default `regular`. */
    thickness?: "thin" | "regular" | "thick"
    /**
     * Accessible name for the meter (e.g. "Security posture"). Strongly
     * recommended so the value is announced with a label.
     */
    label?: string
    /** Render the numeric value in the centre. Default `true`. */
    showValue?: boolean
    /**
     * Override the centre readout and the meter's `aria-valuetext`
     * (e.g. "A+", "72 / 100"). When omitted a rounded percentage is shown.
     */
    valueLabel?: string
    /** Custom centre content (replaces the value readout). */
    children?: React.ReactNode
  }

function RadialGauge({
  value,
  min = 0,
  max = 100,
  shape = "gauge",
  size = "md",
  tone = "accent",
  thickness = "regular",
  label,
  showValue = true,
  valueLabel,
  children,
  ...props
}: RadialGaugeProps) {
  const span = max - min || 1
  const fraction = Math.min(1, Math.max(0, (value - min) / span))
  const stroke = STROKE[thickness]
  const r = CENTER - stroke / 2 - 1
  const { start, sweep } = SHAPE[shape]

  const percentText = `${Math.round(fraction * 100)}%`
  const centre =
    children ?? (showValue ? (valueLabel ?? percentText) : null)

  // Track: the full arc/ring the value fills against.
  const trackPath =
    shape === "ring" ? null : describeArc(CENTER, CENTER, r, start, start + sweep)
  // Value: the filled portion. A full ring is drawn as a <circle> because a
  // 360° single arc command degenerates (start === end).
  const valueSweep = fraction * sweep
  const isFullRing = shape === "ring" && fraction >= 0.9999
  const valuePath =
    fraction > 0 && !isFullRing
      ? describeArc(CENTER, CENTER, r, start, start + valueSweep)
      : null

  return (
    <div
      data-slot="radial-gauge"
      data-shape={shape}
      role="meter"
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-label={label}
      aria-valuetext={valueLabel}
      className={cn(gaugeVariants({ size, tone }))}
      {...props}
    >
      <svg
        data-slot="radial-gauge-svg"
        viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
        fill="none"
        aria-hidden
        className="size-full"
      >
        {shape === "ring" ? (
          <circle
            data-slot="radial-gauge-track"
            cx={CENTER}
            cy={CENTER}
            r={r}
            strokeWidth={stroke}
            className="stroke-surface-3"
          />
        ) : (
          <path
            data-slot="radial-gauge-track"
            d={trackPath ?? undefined}
            strokeWidth={stroke}
            strokeLinecap="round"
            className="stroke-surface-3"
          />
        )}

        {isFullRing ? (
          <circle
            data-slot="radial-gauge-value"
            cx={CENTER}
            cy={CENTER}
            r={r}
            strokeWidth={stroke}
            className="stroke-current"
          />
        ) : valuePath ? (
          <path
            data-slot="radial-gauge-value"
            d={valuePath}
            strokeWidth={stroke}
            strokeLinecap="round"
            className="stroke-current"
          />
        ) : null}
      </svg>

      {centre != null ? (
        <div
          data-slot="radial-gauge-label"
          aria-hidden
          className={cn(valueTextVariants({ size }))}
        >
          {centre}
        </div>
      ) : null}
    </div>
  )
}

export { RadialGauge, gaugeVariants }
export type { RadialGaugeProps }
