import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Check, Minus } from "lucide-react"

import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"

/**
 * AEGIS — Password Strength Meter
 *
 * A live readout of how strong a password is, built on the AEGIS `Progress`
 * bar. Pass the password string via `value`; a deterministic, dependency-free
 * estimator (`estimatePasswordStrength`) grades it 0–4 and the bar's fill, tone,
 * and text label update together. An optional requirements checklist shows which
 * rules are still unmet.
 *
 * The estimator is a coarse heuristic (length + character-class variety), not a
 * cryptographic strength model — it is a UX nudge, never a substitute for
 * server-side policy enforcement.
 *
 * Public API is CLOSED — no `className` / `style`. Use the semantic `size` and
 * the data props. Colour is token-only. See `.agent/rules/API_RULES.md`.
 */

export type PasswordStrength = {
  /** 0 (very weak) … 4 (strong). */
  score: 0 | 1 | 2 | 3 | 4
  /** True when the password is empty. */
  empty: boolean
  /** Which character classes are present. */
  classes: {
    lower: boolean
    upper: boolean
    digit: boolean
    symbol: boolean
  }
  length: number
}

/** Deterministic, dependency-free strength estimate. */
export function estimatePasswordStrength(password: string): PasswordStrength {
  const length = password.length
  const classes = {
    lower: /[a-z]/.test(password),
    upper: /[A-Z]/.test(password),
    digit: /[0-9]/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  }
  if (length === 0) {
    return { score: 0, empty: true, classes, length }
  }

  const variety =
    Number(classes.lower) +
    Number(classes.upper) +
    Number(classes.digit) +
    Number(classes.symbol)

  let s = 0
  if (length >= 8) s += 1
  if (length >= 12) s += 1
  if (variety >= 2) s += 1
  if (variety >= 3) s += 1

  // Very short passwords can never rate above the weakest level.
  if (length < 6) s = 0

  const score = Math.max(0, Math.min(4, s)) as PasswordStrength["score"]
  return { score, empty: false, classes, length }
}

const DEFAULT_LABELS = [
  "Very weak",
  "Weak",
  "Fair",
  "Good",
  "Strong",
] as const

type StrengthTone = "critical" | "warning" | "default" | "success"

const SCORE_TONE: StrengthTone[] = [
  "critical",
  "critical",
  "warning",
  "default",
  "success",
]

const labelToneVariants = cva("font-medium tabular-nums", {
  variants: {
    tone: {
      critical: "text-destructive-ink",
      warning: "text-warning-ink",
      default: "text-accent-strong",
      success: "text-success-ink",
    },
    size: {
      sm: "text-[0.7rem]",
      md: "text-xs",
    },
  },
  defaultVariants: { tone: "critical", size: "md" },
})

export type PasswordRequirement = {
  /** Human-readable rule, e.g. "At least 8 characters". */
  label: React.ReactNode
  /** Whether the current password satisfies the rule. */
  met: boolean
}

/** Default requirements derived from a strength estimate. */
export function defaultPasswordRequirements(
  password: string
): PasswordRequirement[] {
  const { classes, length } = estimatePasswordStrength(password)
  return [
    { label: "At least 8 characters", met: length >= 8 },
    { label: "An uppercase & a lowercase letter", met: classes.upper && classes.lower },
    { label: "A number", met: classes.digit },
    { label: "A symbol", met: classes.symbol },
  ]
}

type PasswordStrengthMeterProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style" | "children"
> &
  Pick<VariantProps<typeof labelToneVariants>, "size"> & {
    /** The password to grade. */
    value: string
    /**
     * Override the computed score (0–4). When omitted the score is derived from
     * `value` via `estimatePasswordStrength`.
     */
    score?: 0 | 1 | 2 | 3 | 4
    /** Show the textual strength label. Default `true`. */
    showLabel?: boolean
    /** Custom label per score index (5 entries, weakest → strongest). */
    labels?: readonly string[]
    /** Show the requirements checklist. Default `false`. */
    showRequirements?: boolean
    /** Override the requirements list. */
    requirements?: PasswordRequirement[]
  }

function PasswordStrengthMeter({
  value,
  score: scoreProp,
  size = "md",
  showLabel = true,
  labels = DEFAULT_LABELS,
  showRequirements = false,
  requirements,
  ...props
}: PasswordStrengthMeterProps) {
  const est = estimatePasswordStrength(value)
  const score = scoreProp ?? est.score
  const tone = SCORE_TONE[score]
  const label = labels[score] ?? DEFAULT_LABELS[score]
  // Even the weakest non-empty password shows a sliver so the bar reads as live.
  const pct = est.empty ? 0 : ((score + 1) / 5) * 100
  const reqs = requirements ?? (showRequirements ? defaultPasswordRequirements(value) : [])

  return (
    <div
      data-slot="password-strength-meter"
      className={cn("flex flex-col gap-2")}
      {...props}
    >
      <Progress
        value={pct}
        tone={tone}
        aria-label="Password strength"
      >
        {showLabel && (
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground text-xs">
              Password strength
            </span>
            <span
              data-slot="password-strength-label"
              aria-live="polite"
              className={cn(labelToneVariants({ tone, size }))}
            >
              {est.empty ? "—" : label}
            </span>
          </div>
        )}
      </Progress>

      {reqs.length > 0 && (
        <ul
          data-slot="password-strength-requirements"
          className="mt-0.5 grid gap-1"
        >
          {reqs.map((r, i) => (
            <li
              key={i}
              className={cn(
                "flex items-center gap-1.5 text-xs",
                r.met ? "text-success-ink" : "text-muted-foreground"
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "inline-flex size-3.5 shrink-0 items-center justify-center rounded-full",
                  r.met ? "bg-success/15" : "bg-surface-3"
                )}
              >
                {r.met ? (
                  <Check className="size-2.5" />
                ) : (
                  <Minus className="size-2.5" />
                )}
              </span>
              <span>{r.label}</span>
              <span className="sr-only">{r.met ? " (met)" : " (not met)"}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export { PasswordStrengthMeter }
export type { PasswordStrengthMeterProps }
