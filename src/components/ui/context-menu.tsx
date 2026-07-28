import * as React from "react"
import { ContextMenu as ContextMenuPrimitive } from "@base-ui/react/context-menu"
import { Separator as SeparatorPrimitive } from "@base-ui/react/separator"
import { cva, type VariantProps } from "class-variance-authority"
import { Check, ChevronRight, Circle } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Context Menu (Interactive tier, closed API)
 *
 * A menu of actions revealed by right-click (or long-press on touch), built on
 * the Base UI Context Menu primitive. It shares the Menu surface family:
 * portalling, floating-engine positioning anchored at the pointer, roving
 * focus, typeahead, modal focus management and outside-press / Escape dismissal
 * are handled by the primitive. Checkbox items, radio groups, grouped sections
 * and nested submenus are all first-class, exactly as in `Menu`.
 *
 * Unlike `Menu`, the trigger is not a button but an **area** (`ContextMenuTrigger`
 * renders a `<div>`): right-clicking anywhere inside it opens the menu at the
 * pointer.
 *
 * Public API is CLOSED: no `className` / `style` on any part. Item intent is a
 * semantic `variant`; alignment for icon rows is a semantic `inset`; layout
 * inside the surface belongs in `Box`/`Stack`. Element polymorphism stays
 * available through Base UI's `render` prop.
 * See `.agent/rules/API_RULES.md` and `.agent/DECISIONS.md` (escape-hatch policy).
 */

/* ------------------------------------------------------------------ Root -- */

function ContextMenu(
  props: React.ComponentProps<typeof ContextMenuPrimitive.Root>
) {
  return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />
}

function ContextMenuTrigger(
  props: Omit<
    React.ComponentProps<typeof ContextMenuPrimitive.Trigger>,
    "className" | "style"
  >
) {
  return (
    <ContextMenuPrimitive.Trigger data-slot="context-menu-trigger" {...props} />
  )
}

function ContextMenuGroup(
  props: Omit<
    React.ComponentProps<typeof ContextMenuPrimitive.Group>,
    "className" | "style"
  >
) {
  return (
    <ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />
  )
}

/* --------------------------------------------------------------- Content -- */

type ContextMenuContentProps = Omit<
  React.ComponentProps<typeof ContextMenuPrimitive.Popup>,
  "className" | "style"
> & {
  side?: React.ComponentProps<typeof ContextMenuPrimitive.Positioner>["side"]
  align?: React.ComponentProps<typeof ContextMenuPrimitive.Positioner>["align"]
  sideOffset?: number
  alignOffset?: number
}

function ContextMenuContent({
  side = "bottom",
  align = "start",
  sideOffset = 2,
  alignOffset = 0,
  children,
  ...props
}: ContextMenuContentProps) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Positioner
        data-slot="context-menu-positioner"
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        className="z-50"
      >
        <ContextMenuPrimitive.Popup
          data-slot="context-menu-content"
          className={cn(
            "bg-popover text-popover-foreground ring-border-strong min-w-40 max-w-[calc(100vw-2rem)] rounded-lg p-1 text-sm shadow-elevated ring-1 outline-none",
            "animate-menu-in origin-[var(--transform-origin)] transition-[transform,opacity] duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0"
          )}
          {...props}
        >
          {children}
        </ContextMenuPrimitive.Popup>
      </ContextMenuPrimitive.Positioner>
    </ContextMenuPrimitive.Portal>
  )
}

/* ------------------------------------------------------------------ Item -- */

const contextMenuItemVariants = cva(
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
        true: "pl-8",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      inset: false,
    },
  }
)

type ContextMenuItemProps = Omit<
  React.ComponentProps<typeof ContextMenuPrimitive.Item>,
  "className" | "style"
> &
  VariantProps<typeof contextMenuItemVariants>

function ContextMenuItem({ variant, inset, ...props }: ContextMenuItemProps) {
  return (
    <ContextMenuPrimitive.Item
      data-slot="context-menu-item"
      data-variant={variant ?? "default"}
      className={cn(contextMenuItemVariants({ variant, inset }))}
      {...props}
    />
  )
}

/* -------------------------------------------------------- Group heading -- */

function ContextMenuGroupLabel(
  props: Omit<
    React.ComponentProps<typeof ContextMenuPrimitive.GroupLabel>,
    "className" | "style"
  >
) {
  return (
    <ContextMenuPrimitive.GroupLabel
      data-slot="context-menu-group-label"
      className={cn("text-muted-foreground px-2 py-1.5 text-xs font-medium")}
      {...props}
    />
  )
}

/* ------------------------------------------------------------- Separator -- */

function ContextMenuSeparator(
  props: Omit<
    React.ComponentProps<typeof SeparatorPrimitive>,
    "className" | "style"
  >
) {
  return (
    <SeparatorPrimitive
      data-slot="context-menu-separator"
      className={cn("bg-border -mx-1 my-1 h-px")}
      {...props}
    />
  )
}

/* --------------------------------------------------------- Checkbox item -- */

type ContextMenuCheckboxItemProps = Omit<
  React.ComponentProps<typeof ContextMenuPrimitive.CheckboxItem>,
  "className" | "style"
>

function ContextMenuCheckboxItem({
  children,
  ...props
}: ContextMenuCheckboxItemProps) {
  return (
    <ContextMenuPrimitive.CheckboxItem
      data-slot="context-menu-checkbox-item"
      className={cn(
        "text-popover-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground",
        "relative flex w-full cursor-default select-none items-center gap-2 rounded-md py-1.5 pr-2 pl-8 text-sm outline-none transition-colors",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
      )}
      {...props}
    >
      <span className="absolute left-2 flex size-4 items-center justify-center">
        <ContextMenuPrimitive.CheckboxItemIndicator data-slot="context-menu-checkbox-item-indicator">
          <Check aria-hidden />
        </ContextMenuPrimitive.CheckboxItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.CheckboxItem>
  )
}

/* ------------------------------------------------------------ Radio group -- */

function ContextMenuRadioGroup(
  props: Omit<
    React.ComponentProps<typeof ContextMenuPrimitive.RadioGroup>,
    "className" | "style"
  >
) {
  return (
    <ContextMenuPrimitive.RadioGroup
      data-slot="context-menu-radio-group"
      {...props}
    />
  )
}

type ContextMenuRadioItemProps = Omit<
  React.ComponentProps<typeof ContextMenuPrimitive.RadioItem>,
  "className" | "style"
>

function ContextMenuRadioItem({
  children,
  ...props
}: ContextMenuRadioItemProps) {
  return (
    <ContextMenuPrimitive.RadioItem
      data-slot="context-menu-radio-item"
      className={cn(
        "text-popover-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground",
        "relative flex w-full cursor-default select-none items-center gap-2 rounded-md py-1.5 pr-2 pl-8 text-sm outline-none transition-colors",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:size-2 [&_svg]:shrink-0"
      )}
      {...props}
    >
      <span className="absolute left-2 flex size-4 items-center justify-center">
        <ContextMenuPrimitive.RadioItemIndicator data-slot="context-menu-radio-item-indicator">
          <Circle className="fill-current" aria-hidden />
        </ContextMenuPrimitive.RadioItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>
  )
}

/* -------------------------------------------------------------- Shortcut -- */

function ContextMenuShortcut({ children }: { children: React.ReactNode }) {
  return (
    <span
      data-slot="context-menu-shortcut"
      className={cn("text-muted-foreground ml-auto text-xs tracking-widest")}
    >
      {children}
    </span>
  )
}

/* --------------------------------------------------------------- Submenu -- */

function ContextMenuSub(
  props: React.ComponentProps<typeof ContextMenuPrimitive.SubmenuRoot>
) {
  return (
    <ContextMenuPrimitive.SubmenuRoot data-slot="context-menu-sub" {...props} />
  )
}

type ContextMenuSubTriggerProps = Omit<
  React.ComponentProps<typeof ContextMenuPrimitive.SubmenuTrigger>,
  "className" | "style"
> &
  VariantProps<typeof contextMenuItemVariants>

function ContextMenuSubTrigger({
  variant,
  inset,
  children,
  ...props
}: ContextMenuSubTriggerProps) {
  return (
    <ContextMenuPrimitive.SubmenuTrigger
      data-slot="context-menu-sub-trigger"
      className={cn(
        contextMenuItemVariants({ variant, inset }),
        "data-[popup-open]:bg-accent data-[popup-open]:text-accent-foreground"
      )}
      {...props}
    >
      {children}
      <ChevronRight
        data-slot="context-menu-sub-trigger-icon"
        className="ml-auto rtl:rotate-180"
        aria-hidden
      />
    </ContextMenuPrimitive.SubmenuTrigger>
  )
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuGroupLabel,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuCheckboxItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubTrigger,
}
