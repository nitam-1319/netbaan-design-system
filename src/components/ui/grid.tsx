import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Box } from "@/components/ui/box"

/**
 * AEGIS — Grid
 *
 * A two-dimensional CSS-grid layout wrapper built on the `Box` primitive. It
 * exposes a fixed column count and a token-driven `gap`, plus a `flow` option
 * for row/column auto-placement. For responsive layouts, add Tailwind
 * breakpoint utilities (e.g. `md:grid-cols-3`) through `className` — they merge
 * cleanly over the variant. Spacing maps to the AEGIS spacing scale; no colors
 * are set here.
 */

const gridVariants = cva("grid", {
  variants: {
    cols: {
      1: "grid-cols-1",
      2: "grid-cols-2",
      3: "grid-cols-3",
      4: "grid-cols-4",
      5: "grid-cols-5",
      6: "grid-cols-6",
      12: "grid-cols-12",
      none: "grid-cols-none",
    },
    gap: {
      none: "gap-0",
      xs: "gap-1",
      sm: "gap-2",
      md: "gap-4",
      lg: "gap-6",
      xl: "gap-8",
    },
    flow: {
      row: "grid-flow-row",
      column: "grid-flow-col",
      dense: "grid-flow-row-dense",
    },
    align: {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      stretch: "items-stretch",
    },
  },
  defaultVariants: {
    cols: 12,
    gap: "md",
    flow: "row",
    align: "stretch",
  },
})

function Grid({
  className,
  cols = 12,
  gap = "md",
  flow = "row",
  align = "stretch",
  ...props
}: React.ComponentProps<typeof Box> & VariantProps<typeof gridVariants>) {
  return (
    <Box
      data-slot="grid"
      className={cn(gridVariants({ cols, gap, flow, align }), className)}
      {...props}
    />
  )
}

export { Grid, gridVariants }
