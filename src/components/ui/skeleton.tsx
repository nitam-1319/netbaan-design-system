import { useRender } from "@base-ui/react/use-render"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Skeleton
 *
 * A content-shaped loading placeholder. Renders a `<div>` by default and can be
 * reshaped with utility classes (size, radius) or composed onto another element
 * via `render`. Uses `aria-hidden` so the pulsing shape is not announced; pair a
 * visually-hidden live message elsewhere when load status must be conveyed.
 */

function Skeleton({
  className,
  render = <div />,
  ...props
}: useRender.ComponentProps<"div">) {
  return useRender({
    render,
    props: {
      "data-slot": "skeleton",
      "aria-hidden": true,
      className: cn("bg-surface-3/70 animate-pulse rounded-md", className),
      ...props,
    },
  })
}

export { Skeleton }
