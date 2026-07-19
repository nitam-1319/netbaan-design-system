import { useRender } from "@base-ui/react/use-render"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Box
 *
 * The lowest-level layout primitive that underpins every other layout
 * component (Stack, Grid, Container). It renders a `div` by default but is
 * fully polymorphic through Base UI's `useRender`, so it can become any tag or
 * compose with another component via the `render` prop — the same escape hatch
 * shadcn/Base UI expose everywhere. It adds no styling of its own; it just
 * merges `className` through `cn()` and stamps a `data-slot="box"` so it is
 * targetable. Colors are never hard-coded here — pass AEGIS token utilities.
 */

function Box({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div">) {
  return useRender({
    render: render ?? <div />,
    props: {
      "data-slot": "box",
      className: cn(className),
      ...props,
    },
  })
}

export { Box }
