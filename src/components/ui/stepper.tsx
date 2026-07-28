import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Stepper (Data Display / Navigation tier, closed API)
 *
 * A presentational progress indicator for a linear, multi-step flow: an ordered
 * list of steps, each shown as a numbered (or checked) indicator with a label,
 * connected by a track that fills as the user advances. Steps derive their state
 * from a single `activeStep` index — everything before it is complete, the index
 * itself is current, everything after is upcoming.
 *
 * This is a token-only composite (no Base UI primitive); it renders a semantic
 * `<ol>` / `<li>` structure and marks the active step with `aria-current="step"`.
 * It reports progress; it does not own navigation — drive `activeStep` from your
 * flow state and wire any step interactivity in the surrounding form/wizard.
 *
 * Public API is CLOSED: no `className` / `style`. Steps are supplied as a typed
 * `steps` config (label / description / optional icon); presentation is the
 * semantic `orientation` and `size` props. All colour comes from AEGIS tokens.
 * See `.agent/rules/API_RULES.md` and `.agent/DECISIONS.md` (config-driven,
 * closed-API precedent: DataTable 2026-07-22b).
 */

type StepperStep = {
  /** The step's short title. */
  label: React.ReactNode
  /** Optional secondary line under the label. */
  description?: React.ReactNode
  /** Optional icon shown in the indicator instead of the step number. */
  icon?: React.ReactNode
}

type StepStatus = "complete" | "current" | "upcoming"

/* --------------------------------------------------------------- Variants -- */

const indicatorVariants = cva(
  cn(
    "flex shrink-0 items-center justify-center rounded-full border-2 font-medium transition-colors",
    "[&_svg]:shrink-0"
  ),
  {
    variants: {
      size: {
        sm: "size-6 text-xs [&_svg]:size-3.5",
        md: "size-8 text-sm [&_svg]:size-4",
      },
      status: {
        complete: "border-transparent bg-primary-solid text-primary-foreground",
        current: "border-primary bg-background text-primary ring-accent-soft ring-[3px]",
        upcoming: "border-border-strong bg-background text-muted-foreground",
      },
    },
    defaultVariants: { size: "md", status: "upcoming" },
  }
)

const labelVariants = cva("leading-tight font-medium", {
  variants: {
    size: {
      sm: "text-xs",
      md: "text-sm",
    },
    status: {
      complete: "text-foreground",
      current: "text-foreground",
      upcoming: "text-muted-foreground",
    },
  },
  defaultVariants: { size: "md", status: "upcoming" },
})

/* ----------------------------------------------------------------- Types -- */

type StepperProps = Omit<
  React.ComponentProps<"ol">,
  "className" | "style" | "children"
> &
  VariantProps<typeof indicatorVariants> & {
    /** Ordered steps to render. */
    steps: StepperStep[]
    /** Index of the current step; earlier steps are complete, later upcoming. */
    activeStep: number
    /** Track direction. @default "horizontal" */
    orientation?: "horizontal" | "vertical"
  }

function statusOf(index: number, activeStep: number): StepStatus {
  if (index < activeStep) return "complete"
  if (index === activeStep) return "current"
  return "upcoming"
}

/* ------------------------------------------------------------------ Root -- */

function Stepper({
  steps,
  activeStep,
  orientation = "horizontal",
  size = "md",
  ...props
}: StepperProps) {
  const lastIndex = steps.length - 1
  const isVertical = orientation === "vertical"

  return (
    <ol
      data-slot="stepper"
      data-orientation={orientation}
      className={cn("flex w-full", isVertical ? "flex-col" : "items-start")}
      {...props}
    >
      {steps.map((step, index) => {
        const status = statusOf(index, activeStep)
        const isLast = index === lastIndex
        // The track leading out of a step is filled once that step is complete.
        const trackFilled = index < activeStep

        const indicator = (
          <span
            data-slot="stepper-indicator"
            className={cn(indicatorVariants({ size, status }))}
          >
            {status === "complete" && !step.icon ? (
              <Check aria-hidden />
            ) : step.icon ? (
              step.icon
            ) : (
              index + 1
            )}
            <span className="sr-only">
              {status === "complete"
                ? " (completed)"
                : status === "current"
                  ? " (current step)"
                  : " (upcoming)"}
            </span>
          </span>
        )

        const track = !isLast ? (
          <span
            aria-hidden="true"
            data-slot="stepper-track"
            className={cn(
              "rounded-full transition-colors",
              trackFilled ? "bg-primary-solid" : "bg-border",
              isVertical ? "my-1 w-0.5 flex-1" : "mx-1 h-0.5 flex-1"
            )}
          />
        ) : null

        const labelBlock = (
          <div
            data-slot="stepper-label-block"
            className={cn(
              "flex flex-col gap-0.5",
              isVertical ? "pb-6" : "mt-2"
            )}
          >
            <span
              data-slot="stepper-label"
              className={cn(labelVariants({ size, status }))}
            >
              {step.label}
            </span>
            {step.description ? (
              <span
                data-slot="stepper-description"
                className={cn(
                  "text-muted-foreground leading-snug",
                  size === "sm" ? "text-[0.7rem]" : "text-xs"
                )}
              >
                {step.description}
              </span>
            ) : null}
          </div>
        )

        return (
          <li
            key={index}
            data-slot="stepper-item"
            data-status={status}
            aria-current={status === "current" ? "step" : undefined}
            className={cn(
              "flex",
              isVertical ? "gap-3" : "flex-col",
              !isLast && "flex-1"
            )}
          >
            {isVertical ? (
              <>
                {/* Left rail: indicator stacked over a vertical track */}
                <div className="flex flex-col items-center">
                  {indicator}
                  {track}
                </div>
                {labelBlock}
              </>
            ) : (
              <>
                {/* Top rail: indicator followed by a horizontal track */}
                <div className="flex w-full items-center">
                  {indicator}
                  {track}
                </div>
                {labelBlock}
              </>
            )}
          </li>
        )
      })}
    </ol>
  )
}

export { Stepper, indicatorVariants as stepperIndicatorVariants }
export type { StepperProps, StepperStep }
