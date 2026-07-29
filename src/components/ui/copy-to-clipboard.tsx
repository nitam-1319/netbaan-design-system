"use client";

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Check, Copy } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Copy to Clipboard
 *
 * A one-tap "copy this text" control plus the `useCopyToClipboard` hook behind
 * it. `CopyButton` copies its `value` to the clipboard, then briefly swaps its
 * glyph to a check (`animate-check-pop`) and flips its accessible label to
 * "Copied" so the confirmation is announced, not just shown. After `timeout`
 * it resets. Use it beside code snippets, API keys, IDs, and share links.
 *
 * Built as an AEGIS-conformant control: resting `border-strong` (outline
 * appearance), 3px `accent-soft` focus ring, no shadcn defaults. The public API
 * is CLOSED — no `className` / `style`; customise via the semantic `variant`,
 * `size`, and `value` props. See `.agent/rules/API_RULES.md`.
 */

/* ------------------------------------------------------------------ hook -- */

interface UseCopyToClipboardOptions {
  /** How long the `copied` flag stays true, in ms. Default 2000. */
  timeout?: number
  /** Called with the copied text after a successful write. */
  onCopy?: (value: string) => void
}

interface UseCopyToClipboardResult {
  /** True for `timeout` ms after a successful copy. */
  copied: boolean
  /** Copy `value` to the clipboard; resolves to whether it succeeded. */
  copy: (value: string) => Promise<boolean>
}

/**
 * Copy-to-clipboard state machine. Returns `copied` (true briefly after a
 * successful write) and a `copy(text)` action. Safe to call in SSR — the write
 * only runs in the browser when the Clipboard API is available.
 */
function useCopyToClipboard({
  timeout = 2000,
  onCopy,
}: UseCopyToClipboardOptions = {}): UseCopyToClipboardResult {
  const [copied, setCopied] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])

  const copy = React.useCallback(
    async (value: string) => {
      if (
        typeof navigator === "undefined" ||
        !navigator.clipboard?.writeText
      ) {
        return false
      }
      try {
        await navigator.clipboard.writeText(value)
        setCopied(true)
        onCopy?.(value)
        if (timer.current) clearTimeout(timer.current)
        timer.current = setTimeout(() => setCopied(false), timeout)
        return true
      } catch {
        return false
      }
    },
    [onCopy, timeout]
  )

  return { copied, copy }
}

/* ---------------------------------------------------------------- button -- */

const copyButtonVariants = cva(
  cn(
    "group/copy inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border font-medium whitespace-nowrap transition-colors select-none",
    "outline-none focus-visible:border-accent-strong focus-visible:ring-3 focus-visible:ring-accent-soft",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0"
  ),
  {
    variants: {
      variant: {
        outline:
          "border-border-strong bg-background text-foreground hover:bg-muted",
        ghost:
          "border-transparent bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
        soft: "border-transparent bg-muted text-foreground hover:bg-border",
      },
      size: {
        sm: "h-8 px-2.5 text-[0.8rem] [&_svg]:size-3.5",
        md: "h-10 px-3 text-sm [&_svg]:size-4",
        lg: "h-12 px-4 text-base [&_svg]:size-5",
      },
      iconOnly: {
        true: "px-0 aspect-square",
        false: "",
      },
    },
    defaultVariants: { variant: "outline", size: "md", iconOnly: false },
  }
)

type CopyButtonProps = Omit<
  React.ComponentProps<"button">,
  "className" | "style" | "value" | "children"
> &
  Omit<VariantProps<typeof copyButtonVariants>, "iconOnly"> & {
    /** The text written to the clipboard when pressed. */
    value: string
    /** Optional label beside the glyph; omit for an icon-only button. */
    children?: React.ReactNode
    /** Label shown/announced after a successful copy. Default "Copied". */
    copiedLabel?: React.ReactNode
    /** How long the copied state persists, in ms. Default 2000. */
    timeout?: number
    /** Called with the copied text after a successful write. */
    onCopy?: (value: string) => void
  }

function CopyButton({
  variant = "outline",
  size = "md",
  value,
  children,
  copiedLabel = "Copied",
  timeout = 2000,
  onCopy,
  onClick,
  disabled,
  "aria-label": ariaLabel,
  ...props
}: CopyButtonProps) {
  const { copied, copy } = useCopyToClipboard({ timeout, onCopy })
  const hasLabel = children != null
  const accessibleLabel = copied
    ? typeof copiedLabel === "string"
      ? copiedLabel
      : "Copied"
    : (ariaLabel ?? (hasLabel ? undefined : "Copy"))

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    void copy(value)
    onClick?.(event)
  }

  return (
    <button
      type="button"
      data-slot="copy-button"
      data-copied={copied ? "" : undefined}
      disabled={disabled}
      onClick={handleClick}
      aria-label={accessibleLabel}
      className={cn(
        copyButtonVariants({ variant, size, iconOnly: !hasLabel })
      )}
      {...props}
    >
      {copied ? (
        <Check
          key="copied"
          aria-hidden="true"
          className="animate-check-pop text-success-ink"
        />
      ) : (
        <Copy key="copy" aria-hidden="true" />
      )}
      {hasLabel && (
        <span data-slot="copy-button-label">
          {copied ? copiedLabel : children}
        </span>
      )}
    </button>
  )
}

export { CopyButton, copyButtonVariants, useCopyToClipboard }
export type {
  CopyButtonProps,
  UseCopyToClipboardOptions,
  UseCopyToClipboardResult,
}
