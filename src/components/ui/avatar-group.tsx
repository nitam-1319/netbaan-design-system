import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Avatar Group (restored to reference)
 *
 * The stacked-group behavior from `.agent/references/spec/Avatar.dc.html`:
 * `Avatar` children overlap with a negative inline margin and a card-colored
 * ring so each reads as a separate disc; past `max` (default 4) the remainder
 * collapses into a `+N` overflow chip that carries the hidden count as its
 * accessible name. Keep the group's `size` in step with the child avatars.
 *
 * Public API is CLOSED — no `className` / `style`; use the semantic `size` and
 * `max` props. All color comes from AEGIS tokens.
 */

const overlapVariants = cva("flex items-center", {
  variants: {
    size: {
      xs: "[&>*:not(:first-child)]:-ml-1.5",
      sm: "[&>*:not(:first-child)]:-ml-2",
      md: "[&>*:not(:first-child)]:-ml-2.5",
      lg: "[&>*:not(:first-child)]:-ml-3.5",
      xl: "[&>*:not(:first-child)]:-ml-5",
    },
  },
  defaultVariants: { size: "md" },
})

/** Overflow chip diameter + label size, tracked to the avatar size scale. */
const OVERFLOW: Record<string, string> = {
  xs: "size-6 text-[9px]",
  sm: "size-8 text-xs",
  md: "size-10 text-[13px]",
  lg: "size-16 text-[17px]",
  xl: "size-[88px] text-[22px]",
}

type AvatarGroupProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style"
> &
  VariantProps<typeof overlapVariants> & {
    /** Maximum avatars to show before collapsing the rest into a "+N" chip. */
    max?: number
  }

function AvatarGroup({
  size = "md",
  max = 4,
  children,
  ...props
}: AvatarGroupProps) {
  const key = (size ?? "md") as string
  const items = React.Children.toArray(children)
  const visible =
    max != null && max > 0 && items.length > max ? items.slice(0, max) : items
  const overflow = items.length - visible.length

  return (
    <div
      data-slot="avatar-group"
      className={cn(overlapVariants({ size }))}
      {...props}
    >
      {visible.map((child, index) => (
        <span
          key={index}
          data-slot="avatar-group-item"
          className="relative inline-flex rounded-full ring-[2.5px] ring-card"
        >
          {child}
        </span>
      ))}

      {overflow > 0 && (
        <span
          aria-label={`${overflow} more`}
          data-slot="avatar-group-overflow"
          className={cn(
            "relative inline-flex items-center justify-center rounded-full border border-border-strong bg-surface-3 font-heading font-semibold text-muted-foreground ring-[2.5px] ring-card",
            OVERFLOW[key]
          )}
        >
          +{overflow}
        </span>
      )}
    </div>
  )
}

export { AvatarGroup, overlapVariants as avatarGroupVariants }
export type { AvatarGroupProps }
