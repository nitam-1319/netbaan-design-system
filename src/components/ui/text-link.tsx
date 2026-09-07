"use client"

import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Text Link
 *
 * A link that IS a value: an IP address inside a neighbours row, a hostname in
 * a table cell, a reference inside a sentence. It renders as PHRASING content —
 * no height, no inline padding, no control box — so it inherits the size,
 * face and line-height of the text around it and leaves the row rhythm alone.
 *
 * This is deliberately not `Button variant="link"`. That is a control: 32px
 * tall at `sm` with the button's inline padding, which is right beside other
 * buttons and wrong inside a 10px/4px row, where it inflates every linked row
 * by ~12px and breaks the rhythm against the hairlines above and below.
 *
 * Renders an `<a>` by default; compose a router link (or any element) through
 * the Base UI `render` prop. Public API is CLOSED — no `className` / `style`.
 * See `.agent/rules/API_RULES.md`.
 */

const textLinkVariants = cva(
  cn(
    "inline cursor-pointer bg-transparent p-0 font-[inherit] text-[length:inherit] leading-[inherit]",
    "underline-offset-[3px] transition-[color,text-decoration-color] duration-150 outline-none",
    "rounded-[3px] focus-visible:ring-[3px] focus-visible:ring-accent-soft",
    "aria-disabled:pointer-events-none aria-disabled:opacity-50"
  ),
  {
    variants: {
      /**
       * The link's ink. `accent` (default) is the ordinary link. `inherit`
       * takes the colour of the text it sits in — for a link whose meaning is
       * carried by the row it is in rather than by being blue, where a coloured
       * value in every cell of a column is noise. `muted` is the de-emphasised
       * link in a secondary line.
       */
      tone: {
        accent: "text-accent-strong hover:brightness-110",
        inherit: "text-[color:inherit] hover:text-accent-strong",
        muted: "text-muted-foreground hover:text-foreground",
      },
      /**
       * When the underline is drawn. `always` (default) is the accessible
       * default — colour is never the only signal. `hover` is for a dense
       * column where every cell is a link and a permanent rule under all of
       * them reads as a texture; use it only where the column header or the
       * surrounding structure already says the values are links.
       */
      underline: {
        always: "underline decoration-current/40 hover:decoration-current",
        hover: "no-underline hover:underline",
      },
    },
    defaultVariants: { tone: "accent", underline: "always" },
  }
)

type TextLinkProps = Omit<
  useRender.ComponentProps<"a">,
  "className" | "style"
> &
  VariantProps<typeof textLinkVariants> & {
    /** Non-interactive: dims the link and removes it from the tab order. */
    disabled?: boolean
  }

function TextLink({
  tone = "accent",
  underline = "always",
  disabled = false,
  render = <a />,
  ...props
}: TextLinkProps) {
  return useRender({
    render,
    props: {
      "data-slot": "text-link",
      "data-tone": tone,
      "aria-disabled": disabled || undefined,
      tabIndex: disabled ? -1 : undefined,
      className: cn(textLinkVariants({ tone, underline })),
      ...props,
    },
  })
}

export { TextLink, textLinkVariants }
export type { TextLinkProps }
