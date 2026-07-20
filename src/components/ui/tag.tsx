import * as React from "react"
import { X } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Tag / Chip
 *
 * A compact, optionally dismissable label for categories, filters, and
 * selections. Unlike `Badge` (a purely decorative status marker), a Tag can be
 * removed via a first-class `onRemove` affordance and reads as user-managed
 * content. Renders a `<span>` container plus, when dismissable, a `<button>`.
 *
 * Public API is CLOSED (no `className` / `style`); every color comes from an
 * AEGIS token. Dismiss behavior is a semantic prop, not a styling hatch.
 * See `.agent/rules/API_RULES.md`.
 */

const tagVariants = cva(
  "inline-flex w-fit shrink-0 items-center gap-1 rounded-md border font-medium whitespace-nowrap transition-colors outline-none [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-3",
  {
    variants: {
      variant: {
        default: "border-transparent bg-secondary text-secondary-foreground",
        primary: "border-transparent bg-primary text-primary-foreground",
        outline: "border-border text-foreground",
        muted: "border-transparent bg-muted text-muted-foreground",
        success:
          "border-transparent bg-[color-mix(in_oklch,var(--success),transparent_86%)] text-success",
        warning:
          "border-transparent bg-[color-mix(in_oklch,var(--warning),transparent_86%)] text-warning",
        destructive:
          "border-transparent bg-destructive/12 text-destructive dark:bg-destructive/20",
      },
      size: {
        sm: "gap-0.5 px-1.5 py-0 text-[0.65rem]",
        default: "px-2 py-0.5 text-xs",
        lg: "px-2.5 py-1 text-[0.8rem]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

type TagProps = Omit<React.ComponentProps<"span">, "className" | "style"> &
  VariantProps<typeof tagVariants> & {
    /** Show a trailing dismiss button and fire this when it is activated. */
    onRemove?: () => void
    /** Accessible label for the dismiss button. */
    removeLabel?: string
    /** Disable the tag and its dismiss affordance. */
    disabled?: boolean
  }

function Tag({
  variant = "default",
  size = "default",
  onRemove,
  removeLabel = "Remove",
  disabled = false,
  children,
  ...props
}: TagProps) {
  return (
    <span
      data-slot="tag"
      data-disabled={disabled || undefined}
      className={cn(
        tagVariants({ variant, size }),
        disabled && "pointer-events-none opacity-50"
      )}
      {...props}
    >
      {children}
      {onRemove ? (
        <button
          type="button"
          data-slot="tag-remove"
          aria-label={removeLabel}
          disabled={disabled}
          onClick={onRemove}
          className={cn(
            "-mr-0.5 ml-0.5 inline-flex size-3.5 shrink-0 items-center justify-center rounded-sm opacity-70 transition-[opacity,background-color] outline-none",
            "hover:bg-foreground/10 hover:opacity-100",
            "focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:opacity-100",
            "disabled:pointer-events-none"
          )}
        >
          <X className="size-3" strokeWidth={2.5} />
        </button>
      ) : null}
    </span>
  )
}

export { Tag, tagVariants }
