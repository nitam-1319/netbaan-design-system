import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Badge
 *
 * A small count or status marker. Renders a `<span>` by default and composes
 * with any element via the `render` prop (Base UI `useRender`) — e.g. render a
 * link badge with `render={<a href="…" />}`. All color comes from AEGIS tokens.
 */

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 rounded-md border px-1.5 py-0.5 text-xs font-medium whitespace-nowrap transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none [&_svg]:pointer-events-none [&_svg]:size-3",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "border-border text-foreground",
        muted: "border-transparent bg-muted text-muted-foreground",
        success:
          "border-transparent bg-[color-mix(in_oklch,var(--success),transparent_86%)] text-success",
        warning:
          "border-transparent bg-[color-mix(in_oklch,var(--warning),transparent_86%)] text-warning",
        destructive:
          "border-transparent bg-destructive/12 text-destructive dark:bg-destructive/20",
      },
      size: {
        sm: "px-1 py-0 text-[0.65rem]",
        default: "px-1.5 py-0.5 text-xs",
        lg: "px-2 py-0.5 text-[0.8rem]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Badge({
  variant = "default",
  size = "default",
  render = <span />,
  ...props
}: Omit<useRender.ComponentProps<"span">, "className" | "style"> &
  VariantProps<typeof badgeVariants>) {
  return useRender({
    render,
    props: {
      "data-slot": "badge",
      className: cn(badgeVariants({ variant, size })),
      ...props,
    },
  })
}

export { Badge, badgeVariants }
