import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Grid (Layout primitive, closed API)
 *
 * Two-dimensional CSS-grid wrapper. Polymorphic via `render`. Layout is
 * expressed through token props (`cols` / `gap` / `flow` / `align`) — there is
 * no public `className`/`style`. Responsive column counts are exposed as
 * dedicated props rather than raw breakpoint utilities.
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

type GridProps = Omit<useRender.ComponentProps<"div">, "className" | "style"> &
  VariantProps<typeof gridVariants>

function Grid({
  render,
  cols = 12,
  gap = "md",
  flow = "row",
  align = "stretch",
  ...props
}: GridProps) {
  return useRender({
    render: render ?? <div />,
    props: {
      "data-slot": "grid",
      className: cn(gridVariants({ cols, gap, flow, align })),
      ...props,
    },
  })
}

export { Grid, gridVariants }
