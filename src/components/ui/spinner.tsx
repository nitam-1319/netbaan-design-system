import * as React from "react"
import { LoaderCircle } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Spinner
 *
 * A circular indeterminate loading indicator. Wraps the lucide `LoaderCircle`
 * glyph with the AEGIS `animate-spin` treatment and exposes it to assistive tech
 * as `role="status"` with an accessible label. Sizes and tones are CVA variants.
 */

const spinnerVariants = cva("shrink-0 animate-spin", {
  variants: {
    size: {
      xs: "size-3",
      sm: "size-4",
      default: "size-5",
      lg: "size-6",
      xl: "size-8",
    },
    tone: {
      default: "text-muted-foreground",
      primary: "text-primary",
      current: "text-current",
    },
  },
  defaultVariants: {
    size: "default",
    tone: "default",
  },
})

function Spinner({
  className,
  size = "default",
  tone = "default",
  label = "Loading",
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof spinnerVariants> & {
    /** Accessible label announced by screen readers. */
    label?: string
  }) {
  return (
    <span
      data-slot="spinner"
      role="status"
      aria-live="polite"
      className={cn("inline-flex items-center justify-center", className)}
      {...props}
    >
      <LoaderCircle aria-hidden className={cn(spinnerVariants({ size, tone }))} />
      <span className="sr-only">{label}</span>
    </span>
  )
}

export { Spinner, spinnerVariants }
