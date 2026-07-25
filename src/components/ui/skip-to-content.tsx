import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Skip to Content
 *
 * The "Skip to main content" bypass link — WCAG 2.4.1 (Bypass Blocks). It is
 * visually hidden until it receives keyboard focus, at which point it pops into
 * the top of the viewport as a proper AEGIS surface (elevated card, 3px
 * `accent-soft` focus ring). As the first focusable element on the page it lets
 * keyboard and screen-reader users jump past the masthead/nav straight to the
 * main region.
 *
 * Pair it with a matching landmark, e.g. `<main id="main-content" tabIndex={-1}>`.
 *
 * The public API is CLOSED — no `className` / `style`; target the region via
 * `targetId` and adjust prominence via `size`. See `.agent/rules/API_RULES.md`.
 */

const skipLinkVariants = cva(
  cn(
    "sr-only rounded-lg border border-border-strong bg-popover text-popover-foreground font-medium shadow-elevated transition-colors",
    // Reveal on focus: pull it out of sr-only and pin it to the top-start corner.
    "focus-visible:not-sr-only focus-visible:fixed focus-visible:start-4 focus-visible:top-4 focus-visible:z-[100] focus-visible:inline-flex focus-visible:items-center",
    "outline-none focus-visible:border-accent-strong focus-visible:ring-3 focus-visible:ring-accent-soft"
  ),
  {
    variants: {
      size: {
        sm: "focus-visible:h-8 focus-visible:px-3 focus-visible:text-[0.8rem]",
        md: "focus-visible:h-10 focus-visible:px-4 focus-visible:text-sm",
        lg: "focus-visible:h-12 focus-visible:px-5 focus-visible:text-base",
      },
    },
    defaultVariants: { size: "md" },
  }
)

type SkipToContentProps = Omit<
  React.ComponentProps<"a">,
  "className" | "style" | "href"
> &
  VariantProps<typeof skipLinkVariants> & {
    /**
     * The `id` of the main landmark to jump to (without `#`). Default
     * `"main-content"`. Give the target `tabIndex={-1}` so focus lands on it.
     */
    targetId?: string
  }

function SkipToContent({
  size = "md",
  targetId = "main-content",
  children = "Skip to main content",
  ...props
}: SkipToContentProps) {
  return (
    <a
      href={`#${targetId}`}
      data-slot="skip-to-content"
      className={cn(skipLinkVariants({ size }))}
      {...props}
    >
      {children}
    </a>
  )
}

export { SkipToContent, skipLinkVariants as skipToContentVariants }
export type { SkipToContentProps }
