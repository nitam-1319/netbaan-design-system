"use client";

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Typing / Streaming Indicator
 *
 * The "…is composing / streaming" affordance for a conversation: three dots
 * that pulse in sequence with the signature `animate-pulse-dot` motion. It is a
 * live `status` region carrying a screen-reader label (default "Typing…"), so
 * assistive tech announces the activity while the dots convey it visually.
 *
 * Colour is inherited (`bg-current`), so it sits correctly on its own (muted by
 * default) or inside an assistant `MessageBubble`, where it picks up the bubble
 * text colour. Motion honours `prefers-reduced-motion` globally (see
 * `src/index.css`).
 *
 * Public API is CLOSED — no `className` / `style`; sizing is the semantic `size`
 * prop and colour is token-driven. See `.agent/rules/API_RULES.md`.
 */

const rootVariants = cva(
  "inline-flex items-center text-muted-foreground",
  {
    variants: {
      size: {
        sm: "gap-1",
        md: "gap-1.5",
        lg: "gap-2",
      },
    },
    defaultVariants: { size: "md" },
  }
)

const dotVariants = cva(
  "inline-block shrink-0 rounded-full bg-current motion-safe:animate-pulse-dot",
  {
    variants: {
      size: {
        sm: "size-1",
        md: "size-1.5",
        lg: "size-2",
      },
    },
    defaultVariants: { size: "md" },
  }
)

// Sequential offsets give the travelling "typing" ripple.
const DOT_DELAYS = ["", "[animation-delay:200ms]", "[animation-delay:400ms]"]

type TypingIndicatorProps = Omit<
  React.ComponentProps<"span">,
  "className" | "style"
> &
  VariantProps<typeof rootVariants> & {
    /**
     * Screen-reader label announced while the indicator is shown. Default
     * "Typing…". The dots are decorative; meaning is carried by this label.
     */
    label?: string
  }

function TypingIndicator({
  size = "md",
  label = "Typing…",
  ...props
}: TypingIndicatorProps) {
  return (
    <span
      role="status"
      aria-live="polite"
      data-slot="typing-indicator"
      className={cn(rootVariants({ size }))}
      {...props}
    >
      <span className="sr-only">{label}</span>
      {DOT_DELAYS.map((delay, index) => (
        <span
          key={index}
          aria-hidden="true"
          data-slot="typing-indicator-dot"
          className={cn(dotVariants({ size }), delay)}
        />
      ))}
    </span>
  )
}

export { TypingIndicator, rootVariants as typingIndicatorVariants }
export type { TypingIndicatorProps }
