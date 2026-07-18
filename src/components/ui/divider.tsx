import * as React from "react"
import { Separator as SeparatorPrimitive } from "@base-ui/react/separator"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Divider
 *
 * A horizontal or vertical rule that separates content, built on the Base UI
 * Separator primitive so the correct `role="separator"` and `aria-orientation`
 * are emitted for assistive tech. An optional inline label is supported for
 * horizontal dividers (e.g. "OR", section titles). Styling is AEGIS-token only.
 */

const dividerVariants = cva("shrink-0 border-0 bg-border", {
  variants: {
    orientation: {
      horizontal: "h-px w-full",
      vertical: "h-full min-h-4 w-px self-stretch",
    },
    tone: {
      default: "bg-border",
      strong: "bg-border-strong",
      faint: "bg-border/60",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
    tone: "default",
  },
})

function Divider({
  className,
  orientation = "horizontal",
  tone = "default",
  children,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof dividerVariants>) {
  // Labeled divider: only meaningful on the horizontal axis.
  if (children != null && orientation === "horizontal") {
    return (
      <div
        data-slot="divider"
        role="separator"
        aria-orientation="horizontal"
        className={cn(
          "text-text-faint flex w-full items-center gap-3 text-xs font-medium tracking-wide",
          className
        )}
        {...props}
      >
        <span
          aria-hidden
          className={cn(dividerVariants({ orientation, tone }))}
        />
        <span data-slot="divider-label" className="shrink-0 whitespace-nowrap">
          {children}
        </span>
        <span
          aria-hidden
          className={cn(dividerVariants({ orientation, tone }))}
        />
      </div>
    )
  }

  return (
    <SeparatorPrimitive
      data-slot="divider"
      orientation={orientation ?? "horizontal"}
      className={cn(dividerVariants({ orientation, tone }), className)}
      {...props}
    />
  )
}

export { Divider, dividerVariants }
