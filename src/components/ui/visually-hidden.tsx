import { useRender } from "@base-ui/react/use-render"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Visually Hidden (Utility primitive, closed API)
 *
 * Hides its children from sight while keeping them in the accessibility tree,
 * so assistive tech still announces them. Use it to give an icon-only control a
 * spoken label, to add screen-reader-only context to a link ("opens in new
 * tab"), or to expose a caption that would be visual clutter on screen.
 *
 * It renders a `<span>` by default and can become any element via Base UI's
 * `render` (e.g. an `<h2>` that is present for structure but not shown). Unlike
 * `display: none` or `hidden`, the content stays perceivable to screen readers.
 *
 * Public API is CLOSED: no `className` / `style`. There are no visual variants —
 * the whole point is that it is not seen. For a control that is hidden until
 * focused (a skip link), use `Skip to Content`, not this primitive.
 * See `.agent/rules/API_RULES.md` and `.agent/DECISIONS.md` (escape-hatch policy).
 */

// The canonical, robust visually-hidden technique: clip to a 1px box, remove it
// from layout flow, and prevent it from affecting scroll or wrapping. Purely
// structural (no color/spacing tokens), so it needs none.
const visuallyHiddenClasses = cn(
  "absolute m-[-1px] h-px w-px overflow-hidden border-0 p-0 whitespace-nowrap",
  "[clip:rect(0_0_0_0)] [clip-path:inset(50%)]"
)

type VisuallyHiddenProps = Omit<
  useRender.ComponentProps<"span">,
  "className" | "style"
>

function VisuallyHidden({ render, ...props }: VisuallyHiddenProps) {
  return useRender({
    render: render ?? <span />,
    props: {
      "data-slot": "visually-hidden",
      className: visuallyHiddenClasses,
      ...props,
    },
  })
}

export { VisuallyHidden }
export type { VisuallyHiddenProps }
