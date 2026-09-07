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
  "min-w-0 break-words whitespace-pre-wrap",
  {
    variants: {
      author: {
        user: "max-w-[min(42rem,85%)] rounded-2xl rounded-ee-sm px-4 py-2.5",
        assistant: "max-w-[min(42rem,85%)] rounded-2xl rounded-es-sm px-4 py-2.5",
        system:
          "max-w-[min(36rem,90%)] rounded-lg px-3 py-1.5 text-center text-xs text-muted-foreground",
      },
      /**
       * How the turn is dressed.
       *
       * `bubble` (default) is today's plate. `soft` is the QUIET bubble — a
       * `--surface-2` fill and a hairline instead of a solid accent plate, for
       * a transcript where the user's own words should not be the loudest thing
       * on the screen. `prose` drops the container entirely: an assistant answer
       * is the longest prose in the product, and a bubble caps it at a width
       * nobody wants to read at.
       */
      surface: {
        bubble: "",
        soft: "border border-border bg-surface-2 text-foreground",
        prose: "border-0 bg-transparent px-0 py-0",
      },
    },
    compoundVariants: [
      {
        author: "user",
        surface: "bubble",
        className: "bg-primary-solid text-primary-foreground",
      },
      {
        author: "assistant",
        surface: "bubble",
        className: "border border-border bg-surface-2 text-foreground",
      },
      // Prose is a reading view, so it takes the reading size and leading, not
      // the chat-UI ones.
      { surface: "prose", className: "text-[15px] leading-[1.75] text-foreground" },
      { surface: "bubble", className: "text-sm leading-relaxed" },
      { surface: "soft", className: "text-sm leading-relaxed" },
    ],
    defaultVariants: { author: "assistant", surface: "bubble" },
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
    /**
     * Cap the line length in `ch` — the measure. A reading view needs one (78ch
     * on a page, 72ch in a modal); `max-w` in rem is the wrong unit for it,
     * because the measure is a count of characters, not a distance.
     */
    measure?: number
    /** The message content. */
    children?: React.ReactNode
  }

function MessageBubble({
  author,
  surface = "bubble",
  measure,
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
        data-surface={surface}
        // A measure is a character count; no utility spells a caller's own.
        style={measure != null ? { maxWidth: `${measure}ch` } : undefined}
        className={cn(bubbleVariants({ author, surface }))}
      >
        <span className="sr-only">{srAuthorLabel ?? DEFAULT_SR_LABEL[author]}: </span>
        {children}
      </div>
    </div>
  )
}

export { MessageBubble, bubbleVariants as messageBubbleVariants }
export type { MessageBubbleProps, MessageAuthor }
