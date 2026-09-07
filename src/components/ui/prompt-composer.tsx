"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { ArrowUp } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

/**
 * AEGIS — Prompt Composer
 *
 * The message input for a chat / assistant surface: an auto-growing multi-line
 * field wrapped in the AEGIS Input shell, with a trailing send button, an
 * optional leading action slot (attach, tools), an optional character counter,
 * and Enter-to-send (Shift+Enter for a newline). It reuses the Textarea's
 * auto-sizing behaviour but presents it as a self-contained composer rather than
 * a labelled form field.
 *
 * The public API is CLOSED — no `className` / `style`; behaviour is driven by
 * semantic props (`size`, `loading`, `submitOnEnter`, `value`). Colour, radius,
 * and focus come from tokens. See `.agent/rules/API_RULES.md`.
 */

const shellVariants = cva(
  cn(
    "group/composer flex w-full flex-col gap-2 text-foreground transition-[color,background-color,border-color,box-shadow] duration-150",
    "border border-border-strong",
    "focus-delegate focus-within:border-accent-strong focus-within:bg-surface focus-within:ring-[3px] focus-within:ring-accent-soft",
    "has-[textarea:disabled]:pointer-events-none has-[textarea:disabled]:opacity-50"
  ),
  {
    variants: {
      size: {
        sm: "gap-1.5 p-2 text-xs",
        md: "gap-2 p-2.5 text-sm",
        lg: "gap-2.5 p-3 text-base",
      },
      /**
       * Which surface the composer shell sits on. `raised` (default) is the
       * composer docked inside a panel that is already `--surface`; `base` is
       * the composer that IS the page's surface — a slightly larger radius and
       * the flat `--surface` fill, so it does not read as a tile inside itself.
       */
      surface: {
        raised: "bg-surface-2",
        base: "bg-surface",
      },
    },
    compoundVariants: [
      { surface: "raised", size: "sm", className: "rounded-[10px]" },
      { surface: "raised", size: "md", className: "rounded-[12px]" },
      { surface: "raised", size: "lg", className: "rounded-[14px]" },
      { surface: "base", size: "sm", className: "rounded-[11px]" },
      { surface: "base", size: "md", className: "rounded-[13px]" },
      { surface: "base", size: "lg", className: "rounded-[15px]" },
    ],
    defaultVariants: { size: "md", surface: "raised" },
  }
)

type PromptComposerProps = Omit<
  React.ComponentProps<"textarea">,
  | "className"
  | "style"
  | "size"
  | "value"
  | "defaultValue"
  | "onChange"
  // The composer submits TEXT, not a form event. Left in, the textarea's own
  // `onSubmit` intersects with ours and no single function satisfies both.
  | "onSubmit"
> &
  VariantProps<typeof shellVariants> & {
    /** Controlled text value. */
    value?: string
    /** Uncontrolled initial value. */
    defaultValue?: string
    /** Fires on every edit with the new text. */
    onValueChange?: (value: string) => void
    /** Fires when the user sends a non-empty, trimmed message. */
    onSubmit?: (value: string) => void
    /** Accessible name for the input (no visible label). */
    label?: string
    /** Streaming / busy: holds submit and shows a spinner on the send button. */
    loading?: boolean
    /** Enter sends, Shift+Enter inserts a newline. */
    submitOnEnter?: boolean
    /** Name for the send button — its aria-label, and its visible text when `sendVariant="labelled"`. */
    sendLabel?: string
    /**
     * `icon` (default) is the compact arrow. `labelled` renders `sendLabel` as
     * the button's visible text — the form a full-width composer wants, where
     * an unlabelled arrow is the only unlabelled control on the surface.
     */
    sendVariant?: "icon" | "labelled"
    /** Leading action slot (e.g. an attach Button) shown at the inline-start of the toolbar. */
    leading?: React.ReactNode
    /** Show a `count / maxLength` counter (requires `maxLength`). */
    showCount?: boolean
  }

function PromptComposer({
  size = "md",
  surface = "raised",
  value,
  defaultValue = "",
  onValueChange,
  onSubmit,
  label = "Message",
  placeholder = "Send a message…",
  loading = false,
  disabled,
  submitOnEnter = true,
  sendLabel = "Send message",
  sendVariant = "icon",
  leading,
  showCount = false,
  maxLength,
  rows = 1,
  onKeyDown,
  name,
  ...textarea
}: PromptComposerProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
  const text = value ?? uncontrolled
  const isControlled = value != null
  const countId = React.useId()

  const setText = React.useCallback(
    (next: string) => {
      if (!isControlled) setUncontrolled(next)
      onValueChange?.(next)
    },
    [isControlled, onValueChange]
  )

  const canSend = text.trim().length > 0 && !loading && !disabled

  const submit = React.useCallback(() => {
    const trimmed = text.trim()
    if (trimmed.length === 0 || loading || disabled) return
    onSubmit?.(trimmed)
    // Clear through setText so onValueChange fires for the reset-to-empty edit.
    setText("")
  }, [text, loading, disabled, onSubmit, setText])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    onKeyDown?.(e)
    if (e.defaultPrevented) return
    if (
      submitOnEnter &&
      e.key === "Enter" &&
      !e.shiftKey &&
      !e.nativeEvent.isComposing
    ) {
      e.preventDefault()
      submit()
    }
  }

  const size2 = size ?? "md"
  const over = maxLength != null && text.length > maxLength

  return (
    <div
      data-slot="prompt-composer"
      role="group"
      aria-label={label}
      className={cn(shellVariants({ size: size2, surface }))}
    >
      <textarea
        data-slot="prompt-composer-input"
        aria-label={label}
        aria-describedby={showCount && maxLength != null ? countId : undefined}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        name={name}
        value={text}
        maxLength={maxLength}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        className={cn(
          "field-sizing-content max-h-48 w-full resize-none bg-transparent px-1 font-medium outline-none placeholder:text-muted-foreground"
        )}
        {...textarea}
      />
      <div
        data-slot="prompt-composer-toolbar"
        className={cn("flex items-center justify-between gap-2")}
      >
        <div className={cn("flex min-w-0 items-center gap-1")}>{leading}</div>
        <div className={cn("flex items-center gap-2")}>
          {showCount && maxLength != null ? (
            <span
              id={countId}
              data-slot="prompt-composer-count"
              aria-live="polite"
              className={cn(
                "text-xs tabular-nums",
                over ? "text-destructive-ink" : "text-muted-foreground"
              )}
            >
              {text.length} / {maxLength}
            </span>
          ) : null}
          <Button
            type="button"
            data-slot="prompt-composer-send"
            variant="primary"
            size={
              sendVariant === "labelled"
                ? size2 === "lg"
                  ? "md"
                  : "sm"
                : size2 === "lg"
                  ? "icon"
                  : "icon-sm"
            }
            aria-label={sendVariant === "labelled" ? undefined : sendLabel}
            loading={loading}
            disabled={!canSend}
            onClick={submit}
          >
            {sendVariant === "labelled" ? sendLabel : <ArrowUp aria-hidden />}
          </Button>
        </div>
      </div>
    </div>
  )
}

export { PromptComposer, shellVariants as promptComposerVariants }
export type { PromptComposerProps }
