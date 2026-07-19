import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Container (Layout primitive, closed API)
 *
 * Max-width, horizontally-centered content wrapper. Polymorphic via `render`.
 * Layout is expressed through token props (`size` / `gutter`) — there is no
 * public `className`/`style`. Widths and padding come from the AEGIS scale.
 */

const containerVariants = cva("mx-auto w-full", {
  variants: {
    size: {
      sm: "max-w-screen-sm",
      md: "max-w-screen-md",
      lg: "max-w-screen-lg",
      xl: "max-w-screen-xl",
      "2xl": "max-w-screen-2xl",
      prose: "max-w-prose",
      full: "max-w-full",
    },
    gutter: {
      none: "px-0",
      sm: "px-4",
      md: "px-6",
      lg: "px-8",
    },
  },
  defaultVariants: {
    size: "xl",
    gutter: "md",
  },
})

type ContainerProps = Omit<
  useRender.ComponentProps<"div">,
  "className" | "style"
> &
  VariantProps<typeof containerVariants>

function Container({
  render,
  size = "xl",
  gutter = "md",
  ...props
}: ContainerProps) {
  return useRender({
    render: render ?? <div />,
    props: {
      "data-slot": "container",
      className: cn(containerVariants({ size, gutter })),
      ...props,
    },
  })
}

export { Container, containerVariants }
