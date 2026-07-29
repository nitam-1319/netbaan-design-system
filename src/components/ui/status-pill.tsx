"use client";

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Status Pill
 *
 * A compact status marker: a coloured dot plus a short label on a soft, rounded
 * chip. Use it to show the state of an entity in a table cell, list row, or
 * header — "Active", "Pending", "Failed". The `tone` maps to AEGIS semantic
 * colours; the dot inherits the label colour so the pair always agrees. An
 * optional `pulse` animates the dot for live/ongoing states.
 *
 * Public API is CLOSED — no `className` / `style`; use the semantic `tone`,
 * `size`, and `pulse` props. All colour comes from AEGIS tokens.
 */

const pillVariants = cva(
  cn(
    "inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border border-transparent font-medium whitespace-nowrap align-middle select-none"
  ),
  {
    variants: {
      tone: {
        neutral: "bg-muted text-muted-foreground",
        info: "bg-[color-mix(in_oklch,var(--primary),transparent_88%)] text-accent-strong",
        success:
          "bg-[color-mix(in_oklch,var(--success),transparent_86%)] text-success-ink",
        warning:
          "bg-[color-mix(in_oklch,var(--warning),transparent_86%)] text-warning-ink",
        danger:
          "bg-[color-mix(in_oklch,var(--destructive),transparent_88%)] text-destructive-ink",
      },
      size: {
        sm: "h-5 px-2 text-[0.65rem]",
        md: "h-6 px-2.5 text-xs",
      },
    },
    defaultVariants: { tone: "neutral", size: "md" },
  }
)

const dotVariants = cva("shrink-0 rounded-full bg-current", {
  variants: {
    size: {
      sm: "size-1.5",
      md: "size-2",
    },
  },
  defaultVariants: { size: "md" },
})

type StatusPillProps = Omit<
  React.ComponentProps<"span">,
  "className" | "style"
> &
  VariantProps<typeof pillVariants> & {
    /** Animate the dot to signal a live / ongoing state. */
    pulse?: boolean
  }

function StatusPill({
  tone = "neutral",
  size = "md",
  pulse = false,
  children,
  ...props
}: StatusPillProps) {
  return (
    <span
      data-slot="status-pill"
      className={cn(pillVariants({ tone, size }))}
      {...props}
    >
      <span
        aria-hidden="true"
        data-slot="status-pill-dot"
        className={cn(dotVariants({ size }), pulse && "animate-pulse")}
      />
      {children}
    </span>
  )
}

export { StatusPill, pillVariants as statusPillVariants }
export type { StatusPillProps }
