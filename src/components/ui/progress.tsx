"use client";

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
      default: "accent-fill",
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
  tone = "default",
  size = "md",
  value,
  children,
  ...props
}: Omit<
  React.ComponentProps<typeof ProgressPrimitive.Root>,
  "className" | "style"
> &
  VariantProps<typeof progressIndicatorVariants> & {
    /**
     * Track height. `sm` (4px) is the hairline a metric cell wants under a
     * figure; `md` (8px) is the form-control default; `lg` (12px) reads at a
     * distance.
     */
    size?: "sm" | "md" | "lg"
  }) {
  const indeterminate = value === null

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={value}
      className={cn("flex w-full flex-col gap-2")}
      {...props}
    >
      {children}
      <ProgressPrimitive.Track
        data-slot="progress-track"
        // E4: recessed groove — inset elevation plus the 1px ring that carries
        // the track boundary's 3:1 contrast (WCAG 1.4.11).
        className={cn(
          "bg-surface-3 elevation-inset relative w-full overflow-hidden rounded-full",
          // A metric cell wants a hairline under a figure, not a form control's
          // bar; 8px was the only height, so a coverage readout had to hand-roll
          // its own track.
          size === "sm" ? "h-1" : size === "lg" ? "h-3" : "h-2"
        )}
      >
        <ProgressPrimitive.Indicator
          data-slot="progress-indicator"
          // A5: marks the sweep as essential motion, so the reduced-motion
          // allowlist can keep it running (a frozen indeterminate bar is
          // indistinguishable from a hung one).
          data-indeterminate={indeterminate || undefined}
          className={cn(
            progressIndicatorVariants({ tone }),
            // B5: was an arbitrary `animate-[…]` value, the only keyframe with
            // no --animate-* token to reference.
            indeterminate &&
              "animate-progress-indeterminate w-1/3 flex-none rounded-full"
          )}
        />
      </ProgressPrimitive.Track>
    </ProgressPrimitive.Root>
  )
}

function ProgressLabel(
  props: Omit<
    React.ComponentProps<typeof ProgressPrimitive.Label>,
    "className" | "style"
  >
) {
  return (
    <ProgressPrimitive.Label
      data-slot="progress-label"
      className={cn("text-sm font-medium text-foreground")}
      {...props}
    />
  )
}

function ProgressValue(
  props: Omit<
    React.ComponentProps<typeof ProgressPrimitive.Value>,
    "className" | "style"
  >
) {
  return (
    <ProgressPrimitive.Value
      data-slot="progress-value"
      className={cn("text-text-faint font-mono text-xs tabular-nums")}
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
