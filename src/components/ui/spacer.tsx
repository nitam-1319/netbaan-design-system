import { useRender } from "@base-ui/react/use-render"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Spacer (Layout primitive, closed API)
 *
 * A token-only spacing element. Two modes:
 * - **Flexible** (`grow`, the default): expands to consume free space along the
 *   parent flex axis — the idiomatic way to push siblings apart in a `Stack`
 *   (e.g. a toolbar with a leading title and trailing actions).
 * - **Fixed**: a rigid gap of a chosen `size` on one or both `axis`es, used when
 *   a hard, non-collapsing space is needed between elements.
 *
 * Polymorphic via `render`; adds no visual styling and exposes **no**
 * `className`/`style`. All spacing comes from the AEGIS spacing scale.
 * See `.agent/rules/API_RULES.md` and `.agent/rules/TOKEN_RULES.md`.
 */

type SpacerAxis = "horizontal" | "vertical" | "both"
type SpacerSize = "none" | "xs" | "sm" | "md" | "lg" | "xl"

// Literal class maps (Tailwind JIT needs whole class names, not interpolations).
const WIDTH: Record<SpacerSize, string> = {
  none: "w-0",
  xs: "w-1",
  sm: "w-2",
  md: "w-4",
  lg: "w-6",
  xl: "w-8",
}
const HEIGHT: Record<SpacerSize, string> = {
  none: "h-0",
  xs: "h-1",
  sm: "h-2",
  md: "h-4",
  lg: "h-6",
  xl: "h-8",
}

type SpacerProps = Omit<useRender.ComponentProps<"div">, "className" | "style"> & {
  /** Expand to fill free space along the parent flex axis. Default `true`. */
  grow?: boolean
  /** Fixed-spacer axis (ignored when `grow`). Default `vertical`. */
  axis?: SpacerAxis
  /** Fixed-spacer size on the spacing scale (ignored when `grow`). Default `md`. */
  size?: SpacerSize
}

function Spacer({
  render,
  grow = true,
  axis = "vertical",
  size = "md",
  ...props
}: SpacerProps) {
  const className = grow
    ? "flex-1 self-stretch"
    : cn(
        "shrink-0",
        (axis === "horizontal" || axis === "both") && WIDTH[size],
        (axis === "vertical" || axis === "both") && HEIGHT[size]
      )

  return useRender({
    render: render ?? <div />,
    props: {
      "data-slot": "spacer",
      "aria-hidden": true,
      className,
      ...props,
    },
  })
}

export { Spacer }
export type { SpacerProps }
