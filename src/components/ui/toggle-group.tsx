"use client";

import * as React from "react"
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group"

import { cn } from "@/lib/utils"
import { Toggle, type toggleVariants } from "@/components/ui/toggle"
import type { VariantProps } from "class-variance-authority"

/**
 * AEGIS — Toggle Group (Selection Controls tier, closed API)
 *
 * Coordinates a set of `Toggle` buttons that share state — single-select
 * (default) or multi-select (`multiple`) — built on the Base UI ToggleGroup
 * primitive, which wires roving focus, arrow-key navigation, and the pressed
 * coordination between items. Use it for view switches, text alignment, or any
 * small set of related on/off options.
 *
 * Appearance (`variant` / `size`) is set once on the group and inherited by
 * every `ToggleGroupItem` through context, so a group reads as one unit; an
 * item may still override either prop.
 *
 * Public API is CLOSED: no `className` / `style`. Element polymorphism stays
 * available through Base UI's `render` prop. Layout between groups belongs in
 * `Box`/`Stack`. See `.agent/rules/API_RULES.md` and `.agent/DECISIONS.md`.
 */

type ToggleAppearance = VariantProps<typeof toggleVariants>

const ToggleGroupContext = React.createContext<ToggleAppearance>({
  variant: "outline",
  size: "default",
})

/* ------------------------------------------------------------------ Root -- */

type ToggleGroupProps = Omit<
  ToggleGroupPrimitive.Props,
  "className" | "style"
> &
  ToggleAppearance

function ToggleGroup({
  variant = "outline",
  size = "default",
  children,
  ...props
}: ToggleGroupProps) {
  return (
    <ToggleGroupPrimitive
      data-slot="toggle-group"
      className={cn(
        "inline-flex items-center gap-1",
        "data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch"
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive>
  )
}

/* ------------------------------------------------------------------ Item -- */

type ToggleGroupItemProps = Omit<
  React.ComponentProps<typeof Toggle>,
  "variant" | "size"
> &
  ToggleAppearance

function ToggleGroupItem({ variant, size, ...props }: ToggleGroupItemProps) {
  const ctx = React.useContext(ToggleGroupContext)
  return (
    <Toggle
      data-slot="toggle-group-item"
      variant={variant ?? ctx.variant}
      size={size ?? ctx.size}
      {...props}
    />
  )
}

export { ToggleGroup, ToggleGroupItem }
