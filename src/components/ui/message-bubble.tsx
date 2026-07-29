"use client";

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Message Bubble
 *
 * A single turn in a conversation — a user prompt, an assistant reply, or a
 * system note. It aligns and colours itself by `author`: the user's turn sits
 * on the inline-end in the primary colour, the assistant's on the inline-start
 * on a surface, and a system note is a centred, muted line. The "tail" corner
 * uses logical radii so it points at the sender in both LTR and RTL.
 *
 * Each bubble carries a screen-reader-only author label ("You" / "Assistant" /
 * "System"), so the speaker is announced rather than inferred from side/colour.
 * Compose many bubbles inside a `Conversation Thread` (a `log`/`list`).
 *
 * Public API is CLOSED — no `className` / `style`. Turn via `author`. All colour
 * is token-driven. See `.agent/rules/API_RULES.md`.
 */

const containerVariants = cva("flex w-full", {
  variants: {
    author: {
      user: "justify-end",
      assistant: "justify-start",
      system: "justify-center",
    },
  },
  defaultVariants: { author: "assistant" },
})

const bubbleVariants = cva(
  "min-w-0 text-sm leading-relaxed break-words whitespace-pre-wrap",
  {
    variants: {
      author: {
        user: "max-w-[min(42rem,85%)] rounded-2xl rounded-ee-sm bg-primary-solid px-4 py-2.5 text-primary-foreground",
        assistant:
          "max-w-[min(42rem,85%)] rounded-2xl rounded-es-sm border border-border bg-surface-2 px-4 py-2.5 text-foreground",
        system:
          "max-w-[min(36rem,90%)] rounded-lg px-3 py-1.5 text-center text-xs text-muted-foreground",
      },
    },
    defaultVariants: { author: "assistant" },
  }
)

type MessageAuthor = "user" | "assistant" | "system"

const DEFAULT_SR_LABEL: Record<MessageAuthor, string> = {
  user: "You",
  assistant: "Assistant",
  system: "System",
}

type MessageBubbleProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style"
> &
  VariantProps<typeof bubbleVariants> & {
    /** Who is speaking — drives alignment, colour, and the announced label. */
    author: MessageAuthor
    /**
     * Screen-reader label announced before the message, so the speaker is not
     * conveyed by side/colour alone. Defaults to You / Assistant / System.
     */
    srAuthorLabel?: string
    /** The message content. */
    children?: React.ReactNode
  }

function MessageBubble({
  author,
  srAuthorLabel,
  children,
  ...props
}: MessageBubbleProps) {
  return (
    <div
      data-slot="message-bubble"
      data-author={author}
      className={cn(containerVariants({ author }))}
      {...props}
    >
      <div
        data-slot="message-bubble-body"
        className={cn(bubbleVariants({ author }))}
      >
        <span className="sr-only">{srAuthorLabel ?? DEFAULT_SR_LABEL[author]}: </span>
        {children}
      </div>
    </div>
  )
}

export { MessageBubble, bubbleVariants as messageBubbleVariants }
export type { MessageBubbleProps, MessageAuthor }
