import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Box } from "@/components/ui/box"

/**
 * AEGIS — Container
 *
 * A max-width, horizontally-centered content wrapper built on the `Box`
 * primitive. It constrains a page or section to a readable measure and applies
 * responsive gutters. The `size` variant selects the max width; `gutter`
 * controls the horizontal padding. Widths and padding come from the AEGIS
 * spacing scale; no colors are set here.
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

function Container({
  className,
  size = "xl",
  gutter = "md",
  ...props
}: React.ComponentProps<typeof Box> & VariantProps<typeof containerVariants>) {
  return (
    <Box
      data-slot="container"
      className={cn(containerVariants({ size, gutter }), className)}
      {...props}
    />
  )
}

export { Container, containerVariants }
