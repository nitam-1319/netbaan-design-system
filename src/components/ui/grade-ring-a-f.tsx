"use client";

import { RadialGauge, type RadialGaugeProps } from "@/components/ui/radial-gauge"

/**
 * AEGIS — Grade Ring (A–F) (Domain / ASM)
 *
 * A letter-grade posture indicator — the A/B/C/D/F ring seen on security
 * scorecards. It composes the AEGIS `RadialGauge` (`shape="ring"`), placing the
 * grade letter at the centre and mapping the grade tier to a semantic `tone`
 * (A → success … F → danger) and a representative ring fill. Pass an explicit
 * numeric `score` (0–100) to drive the fill precisely; otherwise a sensible fill
 * per tier is used.
 *
 * The grade letter is the centre readout and is announced through the meter's
 * `aria-valuetext`, so the grade is available independently of colour. Public API
 * is CLOSED — no `className` / `style`. All colour is token-driven.
 * See `.agent/rules/API_RULES.md`.
 */

type GradeLetter = "A" | "B" | "C" | "D" | "F"

/** Tier metadata keyed on the leading letter (so "A+", "B-" all resolve). */
const TIER: Record<GradeLetter, { tone: RadialGaugeProps["tone"]; fill: number }> = {
  A: { tone: "success", fill: 95 },
  B: { tone: "accent", fill: 80 },
  C: { tone: "warning", fill: 60 },
  D: { tone: "warning", fill: 40 },
  F: { tone: "danger", fill: 20 },
}

type GradeRingProps = Omit<
  RadialGaugeProps,
  "value" | "valueLabel" | "shape" | "tone" | "min" | "max" | "children"
> & {
  /** The letter grade, e.g. "A+", "B", "C-", "F". Required. */
  grade: string
  /** Optional numeric score (0–100) driving the ring fill precisely. */
  score?: number
  /**
   * Accessible name for the meter. Defaults to "Grade". The grade letter is
   * carried in `aria-valuetext`.
   */
  label?: string
}

/** Resolve the tier for a grade string from its leading A–F letter. */
function tierFor(grade: string): { tone: RadialGaugeProps["tone"]; fill: number } {
  const letter = grade.trim().charAt(0).toUpperCase() as GradeLetter
  return TIER[letter] ?? TIER.F
}

function GradeRing({
  grade,
  score,
  label = "Grade",
  size = "md",
  thickness = "thick",
  showValue = true,
  ...props
}: GradeRingProps) {
  const tier = tierFor(grade)
  const fill = score != null ? Math.min(100, Math.max(0, score)) : tier.fill

  return (
    <RadialGauge
      data-slot="grade-ring"
      data-grade={grade}
      shape="ring"
      tone={tier.tone}
      value={fill}
      min={0}
      max={100}
      valueLabel={grade}
      showValue={showValue}
      label={label}
      size={size}
      thickness={thickness}
      {...props}
    >
      {/* Grade is an LTR identifier ("A+", "B-"); isolate it so the +/−
          modifier is not reordered under RTL (e.g. rendering as "+A"). */}
      {showValue ? <span dir="ltr">{grade}</span> : undefined}
    </RadialGauge>
  )
}

export { GradeRing, tierFor }
export type { GradeRingProps, GradeLetter }
