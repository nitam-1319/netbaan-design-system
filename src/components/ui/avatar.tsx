import * as React from "react"
import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Avatar
 *
 * A user/entity image with an initials or icon fallback, built on the Base UI
 * Avatar primitive so image load state is tracked and the fallback swaps in
 * automatically. Sizes are CVA variants; all color comes from AEGIS tokens.
 */

const avatarVariants = cva(
  "relative flex shrink-0 overflow-hidden rounded-full border border-border/70 bg-surface-2 select-none",
  {
    variants: {
      size: {
        xs: "size-6 text-[0.6rem]",
        sm: "size-8 text-xs",
        default: "size-9 text-sm",
        lg: "size-11 text-base",
        xl: "size-14 text-lg",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

function Avatar({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> &
  VariantProps<typeof avatarVariants>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(avatarVariants({ size, className }))}
      {...props}
    />
  )
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full object-cover", className)}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "text-muted-foreground flex size-full items-center justify-center font-medium",
        className
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback, avatarVariants }
