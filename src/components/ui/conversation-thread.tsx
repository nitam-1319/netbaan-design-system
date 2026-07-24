import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Conversation Thread
 *
 * The container for a chat transcript: a vertical `log` of `MessageBubble`
 * turns. It owns the transcript semantics (a labelled `role="log"` region with
 * an optional polite live region for streamed replies) and the rhythm between
 * turns (a tokened gap), while each turn's alignment and colour stay with the
 * individual `MessageBubble`.
 *
 * It deliberately does not cap its own height or scroll — compose it inside a
 * `ScrollArea` (or any scroll container) when the transcript should scroll, so
 * height stays a layout decision, not a baked-in style.
 *
 * Public API is CLOSED — no `className` / `style`; spacing is the semantic `gap`
 * prop and all colour is token-driven. See `.agent/rules/API_RULES.md`.
 */

const threadVariants = cva("flex w-full flex-col", {
  variants: {
    gap: {
      sm: "gap-1.5",
      md: "gap-3",
      lg: "gap-5",
    },
  },
  defaultVariants: { gap: "md" },
})

type ConversationThreadProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style"
> &
  VariantProps<typeof threadVariants> & {
    /**
     * Accessible name for the transcript's `log` region. Default "Conversation".
     */
    label?: string
    /**
     * Announce newly appended turns to assistive tech. `"polite"` wires an
     * additions-only live region (good for streamed assistant replies);
     * `"off"` (default) leaves announcement to the individual turns.
     */
    live?: "off" | "polite"
    /** The conversation turns — typically `MessageBubble`s. */
    children?: React.ReactNode
  }

function ConversationThread({
  gap = "md",
  label = "Conversation",
  live = "off",
  children,
  ...props
}: ConversationThreadProps) {
  return (
    <div
      role="log"
      aria-label={label}
      aria-live={live === "polite" ? "polite" : undefined}
      aria-relevant={live === "polite" ? "additions" : undefined}
      aria-atomic={live === "polite" ? false : undefined}
      data-slot="conversation-thread"
      data-live={live}
      className={cn(threadVariants({ gap }))}
      {...props}
    >
      {children}
    </div>
  )
}

export { ConversationThread, threadVariants as conversationThreadVariants }
export type { ConversationThreadProps }
