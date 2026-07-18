import * as React from "react"
import { Progress as ProgressPrimitive } from "@base-ui/react/progress"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Progress Bar
 *
 * A linear determinate/indeterminate progress indicator built on the Base UI
 * Progress primitive, which supplies `role="progressbar"` and the aria value
 * wiring. Pass `value={null}` for the indeterminate (sliding) state. Tones map
 * to AEGIS tokens; an optional label + value readout can be rendered above.
 */

const progressIndicatorVariants = cva("h-full w-full flex-1 transition-all", {
  variants: {
    tone: {
      default: "bg-primary",
      success: "bg-success",
      warning: "bg-warning",
      critical: "bg-sev-critical",
    },
  },
  defaultVariants: {
    tone: "default",
  },
})

function Progress({
  className,
  tone = "default",
  value,
  children,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> &
  VariantProps<typeof progressIndicatorVariants>) {
  const indeterminate = value === null

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={value}
      className={cn("flex w-full flex-col gap-2", className)}
      {...props}
    >
      {children}
      <ProgressPrimitive.Track
        data-slot="progress-track"
        className="bg-surface-3 relative h-2 w-full overflow-hidden rounded-full"
      >
        <ProgressPrimitive.Indicator
          data-slot="progress-indicator"
          className={cn(
            progressIndicatorVariants({ tone }),
            indeterminate &&
              "w-1/3 flex-none animate-[progress-indeterminate_1.2s_ease-in-out_infinite] rounded-full"
          )}
        />
      </ProgressPrimitive.Track>
    </ProgressPrimitive.Root>
  )
}

function ProgressLabel({
  className,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Label>) {
  return (
    <ProgressPrimitive.Label
      data-slot="progress-label"
      className={cn("text-sm font-medium text-foreground", className)}
      {...props}
    />
  )
}

function ProgressValue({
  className,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Value>) {
  return (
    <ProgressPrimitive.Value
      data-slot="progress-value"
      className={cn(
        "text-text-faint font-mono text-xs tabular-nums",
        className
      )}
      {...props}
    />
  )
}

export {
  Progress,
  ProgressLabel,
  ProgressValue,
  progressIndicatorVariants,
}
