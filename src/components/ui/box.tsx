import { useRender } from "@base-ui/react/use-render"

/**
 * AEGIS — Box (Layout primitive, closed API)
 *
 * The lowest-level polymorphic slot that underpins the other layout primitives
 * (Stack, Grid, Container). It renders a `div` by default and can become any
 * element via Base UI's `render`. It adds no styling and exposes **no**
 * `className`/`style` — layout is expressed through the token props of `Stack`,
 * `Grid`, and `Container`, never a raw class. See `.agent/rules/API_RULES.md`.
 */

type BoxProps = Omit<useRender.ComponentProps<"div">, "className" | "style">

function Box({ render, ...props }: BoxProps) {
  return useRender({
    render: render ?? <div />,
    props: {
      "data-slot": "box",
      ...props,
    },
  })
}

export { Box }
export type { BoxProps }
