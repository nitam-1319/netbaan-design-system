import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Kbd
 *
 * A keyboard-key marker for documenting shortcuts (e.g. ⌘, Ctrl, Enter).
 * Renders a `<kbd>` element by default and composes with any element via the
 * `render` prop (Base UI `useRender`). Style it in monospace-ish caps on a
 * `muted` chip with a subtle bottom edge so it reads as a physical key. Combine
 * several `Kbd`s with a "+" between them for chords.
 *
 * Public API is CLOSED — no `className` / `style`; use the semantic `size`
 * prop. All color comes from AEGIS tokens. See `.agent/rules/API_RULES.md`.
 */

const kbdVariants = cva(
  cn(
    "inline-flex w-fit shrink-0 items-center justify-center gap-1 rounded-md border border-border border-b-2 bg-muted font-medium text-muted-foreground whitespace-nowrap select-none align-middle",
    "[font-variant:small-caps] [&_svg]:pointer-events-none"
  ),
  {
    variants: {
      size: {
        sm: "min-w-5 h-5 px-1 text-[0.65rem] [&_svg]:size-3",
        md: "min-w-6 h-6 px-1.5 text-xs [&_svg]:size-3.5",
        lg: "min-w-7 h-7 px-2 text-sm [&_svg]:size-4",
      },
    },
    defaultVariants: { size: "md" },
  }
)

type KbdProps = Omit<useRender.ComponentProps<"kbd">, "className" | "style"> &
  VariantProps<typeof kbdVariants>

function Kbd({ size = "md", render = <kbd />, ...props }: KbdProps) {
  return useRender({
    render,
    props: {
      "data-slot": "kbd",
      className: cn(kbdVariants({ size })),
      ...props,
    },
  })
}

export { Kbd, kbdVariants }
export type { KbdProps }
