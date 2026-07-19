import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Stack (Layout primitive, closed API)
 *
 * One-dimensional flex container that auto-spaces children along a single axis.
 * Polymorphic via `render`. Layout is expressed through token props
 * (`direction` / `gap` / `align` / `justify` / `wrap`) — there is no public
 * `className`/`style`. Spacing steps map to the AEGIS spacing scale.
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

type StackProps = Omit<useRender.ComponentProps<"div">, "className" | "style"> &
  VariantProps<typeof stackVariants>

function Stack({
  render,
  direction = "column",
  gap = "md",
  align = "stretch",
  justify = "start",
  wrap = false,
  ...props
}: StackProps) {
  return useRender({
    render: render ?? <div />,
    props: {
      "data-slot": "stack",
      className: cn(stackVariants({ direction, gap, align, justify, wrap })),
      ...props,
    },
  })
}

export { Stack, stackVariants }
