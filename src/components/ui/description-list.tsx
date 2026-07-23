import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Description List
 *
 * A semantic list of term/description pairs (`<dl>` / `<dt>` / `<dd>`) for
 * key–value metadata: entity details, summaries, spec sheets. The `stacked`
 * variant places each description under its term; the `grid` variant aligns
 * terms and descriptions into two columns. Terms are muted; descriptions take
 * the foreground colour.
 *
 * Public API is CLOSED — no `className` / `style`; use the semantic `variant`
 * prop. Compose with `DescriptionTerm` and `DescriptionDetails`.
 */

const listVariants = cva("min-w-0 text-sm", {
  variants: {
    variant: {
      stacked: "flex flex-col gap-4",
      grid: "grid grid-cols-[minmax(6rem,auto)_1fr] gap-x-6 gap-y-3 items-baseline",
    },
  },
  defaultVariants: { variant: "stacked" },
})

type DescriptionListProps = Omit<
  React.ComponentProps<"dl">,
  "className" | "style"
> &
  VariantProps<typeof listVariants>

function DescriptionList({
  variant = "stacked",
  ...props
}: DescriptionListProps) {
  return (
    <dl
      data-slot="description-list"
      className={cn(listVariants({ variant }))}
      {...props}
    />
  )
}

function DescriptionTerm(
  props: Omit<React.ComponentProps<"dt">, "className" | "style">
) {
  return (
    <dt
      data-slot="description-term"
      className={cn("font-medium text-muted-foreground")}
      {...props}
    />
  )
}

function DescriptionDetails(
  props: Omit<React.ComponentProps<"dd">, "className" | "style">
) {
  return (
    <dd
      data-slot="description-details"
      className={cn("m-0 text-foreground")}
      {...props}
    />
  )
}

export {
  DescriptionList,
  DescriptionTerm,
  DescriptionDetails,
  listVariants as descriptionListVariants,
}
export type { DescriptionListProps }
