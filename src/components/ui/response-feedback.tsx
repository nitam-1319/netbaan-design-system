import * as React from "react"
import { ThumbsDown, ThumbsUp } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Response Feedback
 *
 * A thumbs-up / thumbs-down control for rating an assistant response. It is a
 * single-choice toggle: pressing the active rating again clears it. Works
 * controlled (`value` + `onValueChange`) or uncontrolled (`defaultValue`).
 *
 * Built as an AEGIS-conformant control — native buttons with `aria-pressed`,
 * a 3px `accent-soft` focus ring, and token-driven pressed states (success for
 * up, destructive for down). Grouped under a labelled `role="group"`.
 *
 * Public API is CLOSED — no `className` / `style`. Scale via `size`, labels via
 * `upLabel` / `downLabel`. See `.agent/rules/API_RULES.md`.
 */

type FeedbackValue = "up" | "down" | null

const feedbackButtonVariants = cva(
  cn(
    "inline-flex shrink-0 aspect-square items-center justify-center rounded-lg border border-transparent bg-transparent text-muted-foreground transition-colors select-none",
    "outline-none hover:bg-muted hover:text-foreground",
    "focus-visible:border-accent-strong focus-visible:ring-3 focus-visible:ring-accent-soft",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0"
  ),
  {
    variants: {
      tone: { up: "", down: "" },
      active: { true: "", false: "" },
      size: {
        sm: "size-8 [&_svg]:size-4",
        md: "size-9 [&_svg]:size-4.5",
        lg: "size-10 [&_svg]:size-5",
      },
    },
    compoundVariants: [
      {
        tone: "up",
        active: true,
        className:
          "text-success hover:text-success bg-[color-mix(in_oklch,var(--success),transparent_86%)] hover:bg-[color-mix(in_oklch,var(--success),transparent_80%)]",
      },
      {
        tone: "down",
        active: true,
        className:
          "text-destructive hover:text-destructive bg-destructive/12 hover:bg-destructive/20",
      },
    ],
    defaultVariants: { size: "md", active: false },
  }
)

type ResponseFeedbackProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style" | "onChange" | "defaultValue"
> &
  Pick<VariantProps<typeof feedbackButtonVariants>, "size"> & {
    /** Controlled value. */
    value?: FeedbackValue
    /** Uncontrolled initial value. Default `null`. */
    defaultValue?: FeedbackValue
    /** Called with the next value (`"up"`, `"down"`, or `null` when cleared). */
    onValueChange?: (value: FeedbackValue) => void
    /** Accessible name for the group. Default "Was this response helpful?". */
    groupLabel?: string
    /** Accessible label for the up button. Default "Good response". */
    upLabel?: string
    /** Accessible label for the down button. Default "Bad response". */
    downLabel?: string
    /** Disable both buttons. */
    disabled?: boolean
  }

function ResponseFeedback({
  size = "md",
  value: valueProp,
  defaultValue = null,
  onValueChange,
  groupLabel = "Was this response helpful?",
  upLabel = "Good response",
  downLabel = "Bad response",
  disabled,
  ...props
}: ResponseFeedbackProps) {
  const isControlled = valueProp !== undefined
  const [internal, setInternal] = React.useState<FeedbackValue>(defaultValue)
  const value = isControlled ? valueProp : internal

  const select = (next: "up" | "down") => {
    const resolved: FeedbackValue = value === next ? null : next
    if (!isControlled) setInternal(resolved)
    onValueChange?.(resolved)
  }

  return (
    <div
      data-slot="response-feedback"
      role="group"
      aria-label={groupLabel}
      className={cn("inline-flex items-center gap-1")}
      {...props}
    >
      <button
        type="button"
        data-slot="response-feedback-up"
        aria-label={upLabel}
        aria-pressed={value === "up"}
        disabled={disabled}
        onClick={() => select("up")}
        className={cn(
          feedbackButtonVariants({ tone: "up", active: value === "up", size })
        )}
      >
        <ThumbsUp aria-hidden="true" />
      </button>
      <button
        type="button"
        data-slot="response-feedback-down"
        aria-label={downLabel}
        aria-pressed={value === "down"}
        disabled={disabled}
        onClick={() => select("down")}
        className={cn(
          feedbackButtonVariants({
            tone: "down",
            active: value === "down",
            size,
          })
        )}
      >
        <ThumbsDown aria-hidden="true" />
      </button>
    </div>
  )
}

export { ResponseFeedback, feedbackButtonVariants }
export type { ResponseFeedbackProps, FeedbackValue }
