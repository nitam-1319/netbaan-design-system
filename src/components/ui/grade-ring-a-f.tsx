"use client";

import type * as React from "react"

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

/**
 * Tier metadata keyed on the leading letter (so "A+", "B-" all resolve).
 *
 * The tones follow ONE ladder, shared with the score thresholds a consuming app
 * uses to pick the letter (A ≥ 90 · B ≥ 80 · C ≥ 65 · D ≥ 50 · else F): passing
 * grades read as success, a C is merely accented, a D warns and an F is a
 * failure. A letter and a colour that disagree — a green D, an amber B — is the
 * one thing a scorecard must never do, so the mapping lives here rather than at
 * each call site.
 */
const TIER: Record<GradeLetter, { tone: RadialGaugeProps["tone"]; fill: number }> = {
  A: { tone: "success", fill: 95 },
  B: { tone: "success", fill: 80 },
  C: { tone: "accent", fill: 60 },
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
  /**
   * Small readout under the letter, inside the ring (e.g. "62/100"). Use it when
   * the letter alone is too coarse to act on — a 50 and a 64 are both a D, and a
   * reader deciding what to fix next needs to tell them apart. Decorative: it is
   * `aria-hidden`, because the number is already the meter's `aria-valuenow`.
   */
  caption?: React.ReactNode
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
  caption,
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
      {showValue ? (
        caption != null ? (
          <span className="flex flex-col items-center gap-px">
            <span dir="ltr">{grade}</span>
            <span
              data-slot="grade-ring-caption"
              aria-hidden
              dir="ltr"
              className="font-mono text-[9.5px] font-medium leading-none tracking-[0.06em] text-muted-foreground"
            >
              {caption}
            </span>
          </span>
        ) : (
          <span dir="ltr">{grade}</span>
        )
      ) : undefined}
    </RadialGauge>
  )
}

export { GradeRing, tierFor }
export type { GradeRingProps, GradeLetter }
