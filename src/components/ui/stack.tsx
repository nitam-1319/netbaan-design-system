import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Box } from "@/components/ui/box"

/**
 * AEGIS — Stack
 *
 * A one-dimensional flex container that auto-spaces its children along a single
 * axis. Built on top of the `Box` primitive, so it stays polymorphic (`render`)
 * while exposing ergonomic `direction` / `gap` / `align` / `justify` / `wrap`
 * variants as CVA options. Spacing steps map to the AEGIS spacing scale; no
 * colors are involved. Use it instead of hand-writing `flex` utilities whenever
 * you want consistent, token-driven rhythm.
 */

const stackVariants = cva("flex", {
  variants: {
    direction: {
      row: "flex-row",
      column: "flex-col",
      "row-reverse": "flex-row-reverse",
      "column-reverse": "flex-col-reverse",
    },
    gap: {
      none: "gap-0",
      xs: "gap-1",
      sm: "gap-2",
      md: "gap-4",
      lg: "gap-6",
      xl: "gap-8",
    },
    align: {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      stretch: "items-stretch",
      baseline: "items-baseline",
    },
    justify: {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
      around: "justify-around",
      evenly: "justify-evenly",
    },
    wrap: {
      true: "flex-wrap",
      false: "flex-nowrap",
    },
  },
  defaultVariants: {
    direction: "column",
    gap: "md",
    align: "stretch",
    justify: "start",
    wrap: false,
  },
})

function Stack({
  className,
  direction = "column",
  gap = "md",
  align = "stretch",
  justify = "start",
  wrap = false,
  ...props
}: React.ComponentProps<typeof Box> & VariantProps<typeof stackVariants>) {
  return (
    <Box
      data-slot="stack"
      className={cn(
        stackVariants({ direction, gap, align, justify, wrap }),
        className
      )}
      {...props}
    />
  )
}

export { Stack, stackVariants }
