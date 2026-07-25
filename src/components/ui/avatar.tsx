import * as React from "react"
import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar"
import { User } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Avatar (restored to reference)
 *
 * Matches `.agent/references/spec/Avatar.dc.html`: the xs/sm/md/lg/xl size scale
 * (24/32/40/64/88px), circle | square shape (square = 28% radius), and the
 * graceful fallback chain image → initials → icon on the Base UI Avatar
 * primitive. Initials get a **name-seeded** fill — the `name` prop is hashed to
 * pick one of eight fixed token gradients, so a given person always keeps the
 * same hue. Presence is a `status` dot (online pings via `animate-status-ping`)
 * and `ring` marks the current user. Closed API — no `className` / `style`;
 * polymorphism via `render`. Tokens only. See `.agent/rules/REFERENCE_FIDELITY.md`.
 */

const avatarVariants = cva(
  "flex size-full items-center justify-center overflow-hidden font-heading font-semibold text-white select-none",
  {
    variants: {
      size: {
        xs: "text-[9px]",
        sm: "text-xs",
        md: "text-[15px]",
        lg: "text-[22px]",
        xl: "text-[30px]",
      },
      shape: {
        circle: "rounded-full",
        square: "rounded-[28%]",
      },
    },
    defaultVariants: { size: "md", shape: "circle" },
  }
)

/** Outer frame diameter per size. */
const FRAME: Record<string, string> = {
  xs: "size-6",
  sm: "size-8",
  md: "size-10",
  lg: "size-16",
  xl: "size-[88px]",
}

/**
 * Eight fixed token gradients (NOT hard-coded hex). A name hashes to one entry,
 * so the same person always seeds the same hue across the product.
 */
const SEED_FILLS = [
  "bg-[linear-gradient(145deg,var(--primary),color-mix(in_srgb,var(--primary)_60%,white))]",
  "bg-[linear-gradient(145deg,var(--chart-4),color-mix(in_srgb,var(--chart-4)_60%,white))]",
  "bg-[linear-gradient(145deg,var(--success),color-mix(in_srgb,var(--success)_60%,white))]",
  "bg-[linear-gradient(145deg,var(--warning),color-mix(in_srgb,var(--warning)_60%,white))]",
  "bg-[linear-gradient(145deg,var(--chart-1),color-mix(in_srgb,var(--chart-1)_60%,white))]",
  "bg-[linear-gradient(145deg,var(--chart-2),color-mix(in_srgb,var(--chart-2)_60%,white))]",
  "bg-[linear-gradient(145deg,var(--chart-5),color-mix(in_srgb,var(--chart-5)_60%,white))]",
  "bg-[linear-gradient(145deg,var(--accent-strong),color-mix(in_srgb,var(--accent-strong)_60%,white))]",
]

/** Presence dot fill — one token per status. Online is the pinging state. */
const STATUS_COLOR: Record<string, string> = {
  online: "bg-success",
  away: "bg-warning",
  busy: "bg-destructive",
  offline: "bg-text-faint",
}

/** Presence dot diameter + border weight, tracked to the avatar size. */
const DOT_SIZE: Record<string, string> = {
  xs: "size-[7px] border-[1.5px]",
  sm: "size-[9px] border-2",
  md: "size-[11px] border-2",
  lg: "size-4 border-[2.5px]",
  xl: "size-5 border-[3px]",
}

/** Stable string hash → non-negative int (matches the reference seeding). */
function hashName(str: string) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0
  return Math.abs(h)
}

/** First letters of up to the first two words, uppercased. */
function initialsFrom(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

type AvatarStatus = "online" | "away" | "busy" | "offline"

type AvatarProps = Omit<
  React.ComponentProps<typeof AvatarPrimitive.Root>,
  "className" | "style"
> &
  VariantProps<typeof avatarVariants> & {
    /** Person / entity name — drives initials, hue seeding, and the aria-label. */
    name?: string
    /** Optional image; falls back to initials, then a neutral icon. */
    src?: string
    /** Presence indicator. Online pings via `animate-status-ping`. */
    status?: AvatarStatus
    /** Card-colored + accent ring marking the current user or a selection. */
    ring?: boolean
    /**
     * Advanced composition escape — pass `AvatarImage` / `AvatarFallback`
     * children to hand-build the disc instead of the name-seeded chain.
     */
    children?: React.ReactNode
  }

function Avatar({
  size = "md",
  shape = "circle",
  name,
  src,
  status,
  ring = false,
  children,
  ...props
}: AvatarProps) {
  const key = (size ?? "md") as string
  const initials = name ? initialsFrom(name) : ""
  const fill = initials
    ? SEED_FILLS[hashName(name!) % SEED_FILLS.length]
    : "bg-surface-3 border border-border-strong text-text-faint"

  // With no name we can't derive an accessible label from content, so only
  // claim `role="img"` when there is a label (name, or the icon fallback).
  const label = name || (children === undefined ? "Avatar" : undefined)

  return (
    <span
      data-slot="avatar"
      role={label ? "img" : undefined}
      aria-label={label}
      className={cn("relative inline-flex", FRAME[key])}
    >
      <AvatarPrimitive.Root
        data-slot="avatar-disc"
        className={cn(
          avatarVariants({ size, shape }),
          fill,
          ring && "ring-2 ring-primary ring-offset-2 ring-offset-card"
        )}
        {...props}
      >
        {children ?? (
          <>
            {src ? (
              <AvatarPrimitive.Image
                src={src}
                alt=""
                className="size-full object-cover"
              />
            ) : null}
            <AvatarPrimitive.Fallback className="flex size-full items-center justify-center">
              {initials || <User className="size-[55%]" aria-hidden />}
            </AvatarPrimitive.Fallback>
          </>
        )}
      </AvatarPrimitive.Root>

      {status ? (
        <span
          aria-hidden
          data-slot="avatar-status"
          className={cn(
            "absolute right-0 bottom-0 rounded-full border-solid border-card",
            DOT_SIZE[key],
            STATUS_COLOR[status]
          )}
        >
          {status === "online" ? (
            <span className="absolute inset-0 rounded-full bg-success animate-status-ping" />
          ) : null}
        </span>
      ) : null}
    </span>
  )
}

/**
 * Composition sub-parts (Base UI passthrough) for the advanced `children` path.
 * Prefer the `name` / `src` props above; these exist for bespoke layouts.
 */
function AvatarImage(
  props: Omit<
    React.ComponentProps<typeof AvatarPrimitive.Image>,
    "className" | "style"
  >
) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className="size-full object-cover"
      {...props}
    />
  )
}

function AvatarFallback(
  props: Omit<
    React.ComponentProps<typeof AvatarPrimitive.Fallback>,
    "className" | "style"
  >
) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className="flex size-full items-center justify-center"
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback, avatarVariants }
export type { AvatarProps, AvatarStatus }
