import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * AEGIS — List
 *
 * A vertical collection of related items rendered as semantic `<ul>` / `<ol>` +
 * `<li>`. Composition-first (`List` + `ListItem`) so consumers control content
 * while the system owns spacing, dividers, and density. Public API is CLOSED
 * (no `className` / `style`); all borders/spacing come from AEGIS tokens.
 * See `.agent/rules/API_RULES.md`.
 */

const listVariants = cva("flex flex-col text-sm text-foreground", {
  variants: {
    variant: {
      plain: "",
      divided:
        "divide-y divide-border [&>[data-slot=list-item]]:rounded-none",
      bordered:
        "divide-y divide-border overflow-hidden rounded-lg border border-border bg-card",
    },
  },
  defaultVariants: {
    variant: "plain",
  },
})

const listItemVariants = cva(
  "flex items-center gap-3 outline-none data-[interactive]:cursor-pointer data-[interactive]:transition-colors data-[interactive]:hover:bg-muted data-[interactive]:focus-visible:bg-muted data-[interactive]:focus-visible:ring-2 data-[interactive]:focus-visible:ring-ring/50 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
  {
    variants: {
      density: {
        compact: "px-2.5 py-1.5",
        default: "px-3 py-2",
        comfortable: "px-4 py-3",
      },
    },
    defaultVariants: {
      density: "default",
    },
  }
)

type ListProps = Omit<
  React.ComponentProps<"ul">,
  "className" | "style" | "children"
> &
  VariantProps<typeof listVariants> & {
    /** Render as an ordered list (`<ol>`) instead of `<ul>`. */
    ordered?: boolean
    children?: React.ReactNode
  }

function List({ variant = "plain", ordered = false, ...props }: ListProps) {
  const className = cn(listVariants({ variant }))
  if (ordered) {
    return (
      <ol
        data-slot="list"
        role="list"
        className={className}
        {...(props as Omit<React.ComponentProps<"ol">, "className" | "style" | "children">)}
      />
    )
  }
  return <ul data-slot="list" role="list" className={className} {...props} />
}

type ListItemProps = Omit<
  React.ComponentProps<"li">,
  "className" | "style"
> &
  VariantProps<typeof listItemVariants> & {
    /** Apply hover/focus affordances for clickable rows. */
    interactive?: boolean
    disabled?: boolean
  }

function ListItem({
  density = "default",
  interactive = false,
  disabled = false,
  ...props
}: ListItemProps) {
  return (
    <li
      data-slot="list-item"
      data-interactive={interactive || undefined}
      data-disabled={disabled || undefined}
      tabIndex={interactive && !disabled ? 0 : undefined}
      aria-disabled={disabled || undefined}
      className={cn(listItemVariants({ density }))}
      {...props}
    />
  )
}

/** Optional leading/trailing content wrapper that pushes remaining space between. */
function ListItemContent(
  props: Omit<React.ComponentProps<"div">, "className" | "style">
) {
  return (
    <div
      data-slot="list-item-content"
      className={cn("flex min-w-0 flex-1 flex-col gap-0.5")}
      {...props}
    />
  )
}

export { List, ListItem, ListItemContent, listVariants, listItemVariants }
