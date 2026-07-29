"use client";

import * as React from "react"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import { Separator as SeparatorPrimitive } from "@base-ui/react/separator"
import { cva, type VariantProps } from "class-variance-authority"
import { Check, ChevronRight, Circle } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Menu (Interactive tier, closed API)
 *
 * A list of actions or choices revealed from a trigger, built on the Base UI
 * Menu primitive. Portalling, floating-engine positioning (side / align /
 * offsets / collision flipping), roving focus, typeahead, modal focus
 * management and outside-press / Escape dismissal are handled by the primitive.
 * Checkbox items, radio groups, grouped sections and nested submenus are all
 * first-class.
 *
 * Public API is CLOSED: no `className` / `style` on any part. Item intent is a
 * semantic `variant`; alignment for icon rows is a semantic `inset`; layout
 * inside the surface belongs in `Box`/`Stack`. Element polymorphism stays
 * available through Base UI's `render` prop.
 * See `.agent/rules/API_RULES.md` and `.agent/DECISIONS.md` (escape-hatch policy).
 */

/* ------------------------------------------------------------------ Root -- */

function Menu(props: React.ComponentProps<typeof MenuPrimitive.Root>) {
  return <MenuPrimitive.Root data-slot="menu" {...props} />
}

function MenuTrigger(
  props: Omit<
    React.ComponentProps<typeof MenuPrimitive.Trigger>,
    "className" | "style"
  >
) {
  return <MenuPrimitive.Trigger data-slot="menu-trigger" {...props} />
}

function MenuGroup(
  props: Omit<
    React.ComponentProps<typeof MenuPrimitive.Group>,
    "className" | "style"
  >
) {
  return <MenuPrimitive.Group data-slot="menu-group" {...props} />
}

/* --------------------------------------------------------------- Content -- */

type MenuContentProps = Omit<
  React.ComponentProps<typeof MenuPrimitive.Popup>,
  "className" | "style"
> & {
  side?: React.ComponentProps<typeof MenuPrimitive.Positioner>["side"]
  align?: React.ComponentProps<typeof MenuPrimitive.Positioner>["align"]
  sideOffset?: number
  alignOffset?: number
}

function MenuContent({
  side = "bottom",
  align = "start",
  sideOffset = 6,
  alignOffset = 0,
  children,
  ...props
}: MenuContentProps) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        data-slot="menu-positioner"
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        className="z-50"
      >
        <MenuPrimitive.Popup
          data-slot="menu-content"
          className={cn(
            "bg-popover text-popover-foreground ring-border-strong min-w-40 max-w-[calc(100vw-2rem)] rounded-lg p-1 text-sm shadow-elevated ring-1 outline-none",
            "animate-menu-in origin-[var(--transform-origin)] transition-[transform,opacity] duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0"
          )}
          {...props}
        >
          {children}
        </MenuPrimitive.Popup>
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  )
}

/* ------------------------------------------------------------------ Item -- */

const menuItemVariants = cva(
  cn(
    "relative flex w-full cursor-default select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none transition-colors",
    "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
  ),
  {
    variants: {
      variant: {
        default:
          "text-popover-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground",
        destructive:
          "text-destructive-ink data-[highlighted]:bg-destructive/10 data-[highlighted]:text-destructive-ink",
      },
      inset: {
        true: "ps-8",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      inset: false,
    },
  }
)

type MenuItemProps = Omit<
  React.ComponentProps<typeof MenuPrimitive.Item>,
  "className" | "style"
> &
  VariantProps<typeof menuItemVariants>

function MenuItem({ variant, inset, ...props }: MenuItemProps) {
  return (
    <MenuPrimitive.Item
      data-slot="menu-item"
      data-variant={variant ?? "default"}
      className={cn(menuItemVariants({ variant, inset }))}
      {...props}
    />
  )
}

/* -------------------------------------------------------- Group heading -- */

function MenuGroupLabel(
  props: Omit<
    React.ComponentProps<typeof MenuPrimitive.GroupLabel>,
    "className" | "style"
  >
) {
  return (
    <MenuPrimitive.GroupLabel
      data-slot="menu-group-label"
      className={cn(
        "text-muted-foreground px-2 py-1.5 text-xs font-medium"
      )}
      {...props}
    />
  )
}

/* ------------------------------------------------------------- Separator -- */

function MenuSeparator(
  props: Omit<
    React.ComponentProps<typeof SeparatorPrimitive>,
    "className" | "style"
  >
) {
  return (
    <SeparatorPrimitive
      data-slot="menu-separator"
      className={cn("bg-border -mx-1 my-1 h-px")}
      {...props}
    />
  )
}

/* --------------------------------------------------------- Checkbox item -- */

type MenuCheckboxItemProps = Omit<
  React.ComponentProps<typeof MenuPrimitive.CheckboxItem>,
  "className" | "style"
>

function MenuCheckboxItem({ children, ...props }: MenuCheckboxItemProps) {
  return (
    <MenuPrimitive.CheckboxItem
      data-slot="menu-checkbox-item"
      className={cn(
        "text-popover-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground",
        "relative flex w-full cursor-default select-none items-center gap-2 rounded-md py-1.5 pe-2 ps-8 text-sm outline-none transition-colors",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
      )}
      {...props}
    >
      <span className="absolute start-2 flex size-4 items-center justify-center">
        <MenuPrimitive.CheckboxItemIndicator data-slot="menu-checkbox-item-indicator">
          <Check aria-hidden />
        </MenuPrimitive.CheckboxItemIndicator>
      </span>
      {children}
    </MenuPrimitive.CheckboxItem>
  )
}

/* ------------------------------------------------------------ Radio group -- */

function MenuRadioGroup(
  props: Omit<
    React.ComponentProps<typeof MenuPrimitive.RadioGroup>,
    "className" | "style"
  >
) {
  return <MenuPrimitive.RadioGroup data-slot="menu-radio-group" {...props} />
}

type MenuRadioItemProps = Omit<
  React.ComponentProps<typeof MenuPrimitive.RadioItem>,
  "className" | "style"
>

function MenuRadioItem({ children, ...props }: MenuRadioItemProps) {
  return (
    <MenuPrimitive.RadioItem
      data-slot="menu-radio-item"
      className={cn(
        "text-popover-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground",
        "relative flex w-full cursor-default select-none items-center gap-2 rounded-md py-1.5 pe-2 ps-8 text-sm outline-none transition-colors",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:size-2 [&_svg]:shrink-0"
      )}
      {...props}
    >
      <span className="absolute start-2 flex size-4 items-center justify-center">
        <MenuPrimitive.RadioItemIndicator data-slot="menu-radio-item-indicator">
          <Circle className="fill-current" aria-hidden />
        </MenuPrimitive.RadioItemIndicator>
      </span>
      {children}
    </MenuPrimitive.RadioItem>
  )
}

/* -------------------------------------------------------------- Shortcut -- */

function MenuShortcut({ children }: { children: React.ReactNode }) {
  return (
    <span
      data-slot="menu-shortcut"
      className={cn("text-muted-foreground ms-auto text-xs tracking-widest")}
    >
      {children}
    </span>
  )
}

/* --------------------------------------------------------------- Submenu -- */

function MenuSub(props: React.ComponentProps<typeof MenuPrimitive.SubmenuRoot>) {
  return <MenuPrimitive.SubmenuRoot data-slot="menu-sub" {...props} />
}

type MenuSubTriggerProps = Omit<
  React.ComponentProps<typeof MenuPrimitive.SubmenuTrigger>,
  "className" | "style"
> &
  VariantProps<typeof menuItemVariants>

function MenuSubTrigger({
  variant,
  inset,
  children,
  ...props
}: MenuSubTriggerProps) {
  return (
    <MenuPrimitive.SubmenuTrigger
      data-slot="menu-sub-trigger"
      className={cn(
        menuItemVariants({ variant, inset }),
        "data-[popup-open]:bg-accent data-[popup-open]:text-accent-foreground"
      )}
      {...props}
    >
      {children}
      <ChevronRight
        data-slot="menu-sub-trigger-icon"
        className="ms-auto rtl:rotate-180"
        aria-hidden
      />
    </MenuPrimitive.SubmenuTrigger>
  )
}

export {
  Menu,
  MenuTrigger,
  MenuContent,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuSeparator,
  MenuCheckboxItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuShortcut,
  MenuSub,
  MenuSubTrigger,
}
