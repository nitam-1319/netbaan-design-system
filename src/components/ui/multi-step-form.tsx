import * as React from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Stepper, type StepperStep } from "@/components/ui/stepper"
import { Button } from "@/components/ui/button"

/**
 * AEGIS — Multi-step Form (Forms)
 *
 * A wizard shell that drives a linear, multi-step flow: a `Stepper` header shows
 * progress, the active step's content renders below, and a footer provides
 * Back / Next / Submit navigation. It composes the AEGIS `Stepper` and `Button`,
 * so progress and actions match the system.
 *
 * The shell owns step navigation (controlled or uncontrolled) but not your data —
 * render your own fields (e.g. `TextField` inside a `FormProvider`) as each step's
 * `content`. Public API is CLOSED — no `className` / `style`; everything is a
 * semantic prop. All colour is token-driven. See `.agent/rules/API_RULES.md`.
 */

type MultiStepFormStep = StepperStep & {
  /** The step's body — fields, content, anything. */
  content: React.ReactNode
}

type MultiStepFormProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style" | "children" | "onSubmit"
> & {
  /** Ordered steps: stepper meta + per-step content. */
  steps: MultiStepFormStep[]
  /** Controlled active step index. */
  activeStep?: number
  /** Initial active step when uncontrolled. Default 0. */
  defaultActiveStep?: number
  /** Fired with the new index whenever the step changes. */
  onStepChange?: (index: number) => void
  /** Fired when the final step's submit button is pressed. */
  onSubmit?: () => void
  /** Stepper orientation. Default "horizontal". */
  orientation?: "horizontal" | "vertical"
  /** Back button label. Default "Back". */
  backLabel?: React.ReactNode
  /** Next button label. Default "Next". */
  nextLabel?: React.ReactNode
  /** Submit button label (final step). Default "Submit". */
  submitLabel?: React.ReactNode
  /** Disable advancing / submitting (e.g. while the current step is invalid). */
  nextDisabled?: boolean
  /** Show a loading state on the submit button. */
  submitting?: boolean
}

function MultiStepForm({
  steps,
  activeStep,
  defaultActiveStep = 0,
  onStepChange,
  onSubmit,
  orientation = "horizontal",
  backLabel = "Back",
  nextLabel = "Next",
  submitLabel = "Submit",
  nextDisabled = false,
  submitting = false,
  ...props
}: MultiStepFormProps) {
  const isControlled = activeStep != null
  const [internal, setInternal] = React.useState(defaultActiveStep)
  const current = isControlled ? activeStep : internal

  const lastIndex = steps.length - 1
  const clamped = Math.min(lastIndex, Math.max(0, current))
  const isFirst = clamped === 0
  const isLast = clamped === lastIndex

  const goTo = (index: number) => {
    const next = Math.min(lastIndex, Math.max(0, index))
    if (!isControlled) setInternal(next)
    onStepChange?.(next)
  }

  const handleNext = () => {
    if (isLast) onSubmit?.()
    else goTo(clamped + 1)
  }

  const active = steps[clamped]

  return (
    <div
      data-slot="multi-step-form"
      data-orientation={orientation}
      className={cn("flex w-full flex-col gap-6")}
      {...props}
    >
      <Stepper steps={steps} activeStep={clamped} orientation={orientation} />

      <div
        data-slot="multi-step-form-content"
        role="group"
        aria-label={
          typeof active?.label === "string" ? active.label : `Step ${clamped + 1}`
        }
      >
        {active?.content}
      </div>

      <div
        data-slot="multi-step-form-footer"
        className={cn("flex items-center justify-between gap-2")}
      >
        <Button
          variant="ghost"
          onClick={() => goTo(clamped - 1)}
          disabled={isFirst || submitting}
        >
          <ArrowLeft aria-hidden className="rtl:rotate-180" />
          {backLabel}
        </Button>

        <span
          data-slot="multi-step-form-progress"
          className="text-xs text-muted-foreground tabular-nums"
        >
          Step {clamped + 1} of {steps.length}
        </span>

        <Button
          variant="primary"
          onClick={handleNext}
          disabled={nextDisabled}
          loading={isLast && submitting}
        >
          {isLast ? (
            submitLabel
          ) : (
            <>
              {nextLabel}
              <ArrowRight aria-hidden className="rtl:rotate-180" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

export { MultiStepForm }
export type { MultiStepFormProps, MultiStepFormStep }
