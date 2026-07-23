import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { avatarVariants } from "@/components/ui/avatar"

/**
 * AEGIS — Avatar Group
 *
 * A compact, overlapping stack of `Avatar`s for showing the people on a thread,
 * team, or shared resource. Pass `Avatar` elements as children; the group
 * overlaps them, rings each in the `background` colour so they read as separate,
 * and — when `max` is set — collapses the remainder into a "+N" chip. Keep the
 * group's `size` in step with the `size` you give the child `Avatar`s.
 *
 * Public API is CLOSED — no `className` / `style`; use the semantic `size` and
 * `max` props. All colour comes from AEGIS tokens.
 */

const overlapVariants = cva("flex items-center", {
  variants: {
    size: {
      xs: "[&>*:not(:first-child)]:-ml-1.5",
      sm: "[&>*:not(:first-child)]:-ml-2",
      default: "[&>*:not(:first-child)]:-ml-2.5",
      lg: "[&>*:not(:first-child)]:-ml-3",
      xl: "[&>*:not(:first-child)]:-ml-4",
    },
  },
  defaultVariants: { size: "default" },
})

const overflowVariants = cva(
  "flex items-center justify-center rounded-full bg-muted font-medium text-muted-foreground",
  {
    variants: {
      size: {
        xs: "text-[0.55rem]",
        sm: "text-[0.65rem]",
        default: "text-xs",
        lg: "text-sm",
        xl: "text-base",
      },
    },
    defaultVariants: { size: "default" },
  }
)

type AvatarGroupProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style"
> &
  VariantProps<typeof overlapVariants> & {
    /** Maximum avatars to show before collapsing the rest into a "+N" chip. */
    max?: number
  }

function AvatarGroup({
  size = "default",
  max,
  children,
  ...props
}: AvatarGroupProps) {
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
          className="relative inline-flex rounded-full ring-2 ring-background"
        >
          {child}
        </span>
      ))}

      {overflow > 0 && (
        <span
          aria-label={`${overflow} more`}
          data-slot="avatar-group-overflow"
          className={cn(
            avatarVariants({ size }),
            overflowVariants({ size }),
            "relative ring-2 ring-background"
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
