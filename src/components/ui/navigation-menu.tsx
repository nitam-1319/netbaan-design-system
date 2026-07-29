"use client";

import * as React from "react"
import { NavigationMenu as NavigationMenuPrimitive } from "@base-ui/react/navigation-menu"
import { cva } from "class-variance-authority"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Navigation Menu (Interactive tier, closed API)
 *
 * A horizontal site-navigation bar whose items can open rich dropdown panels,
 * built on the Base UI Navigation Menu primitive. The primitive handles
 * hover/click open intent, portalling, floating-engine positioning
 * (side / align / offsets / collision flipping), roving-focus keyboard
 * navigation, teleporting the active item's content into a single shared
 * viewport, and outside-press / Escape dismissal.
 *
 * Compose it as: a `NavigationMenu` root wrapping a `NavigationMenuList` of
 * `NavigationMenuItem`s — each item is either a plain `NavigationMenuLink` or a
 * `NavigationMenuTrigger` + `NavigationMenuContent` pair — followed by exactly
 * one `NavigationMenuViewport`, the floating surface the active panel renders
 * into.
 *
 * Public API is CLOSED: no `className` / `style` on any part. Placement and the
 * arrow are semantic props; layout inside a content panel belongs in plain
 * demo markup or `Box`/`Stack`. Element polymorphism (e.g. routing a link
 * through a framework `<Link>`) stays available through Base UI's `render` prop.
 * See `.agent/rules/API_RULES.md` and `.agent/DECISIONS.md` (escape-hatch policy).
 */

/* ------------------------------------------------------------------ Root -- */

function NavigationMenu(
  props: Omit<
    React.ComponentProps<typeof NavigationMenuPrimitive.Root>,
    "className" | "style"
  >
) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      className={cn("relative flex max-w-max flex-1 items-center")}
      {...props}
    />
  )
}

/* ------------------------------------------------------------------ List -- */

function NavigationMenuList(
  props: Omit<
    React.ComponentProps<typeof NavigationMenuPrimitive.List>,
    "className" | "style"
  >
) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn("flex flex-1 list-none items-center gap-1")}
      {...props}
    />
  )
}

/* ------------------------------------------------------------------ Item -- */

function NavigationMenuItem(
  props: Omit<
    React.ComponentProps<typeof NavigationMenuPrimitive.Item>,
    "className" | "style"
  >
) {
  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      className={cn("relative")}
      {...props}
    />
  )
}

/* ------------------------------------------------- Shared nav-item look -- */

const navItemVariants = cva(
  cn(
    "inline-flex h-9 w-max cursor-default items-center justify-center gap-1 rounded-md px-3 py-2 text-sm font-medium outline-none transition-colors select-none",
    "text-foreground hover:bg-accent hover:text-accent-foreground",
    "focus-visible:ring-accent-soft focus-visible:ring-[3px]",
    "data-[active]:bg-accent/60 data-[active]:text-accent-foreground",
    "data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
  )
)

/* --------------------------------------------------------------- Trigger -- */

function NavigationMenuTrigger({
  children,
  ...props
}: Omit<
  React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>,
  "className" | "style"
>) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      className={cn(
        navItemVariants(),
        "group data-[popup-open]:bg-accent data-[popup-open]:text-accent-foreground"
      )}
      {...props}
    >
      {children}
      <NavigationMenuPrimitive.Icon
        data-slot="navigation-menu-icon"
        className={cn(
          "transition-transform duration-200 group-data-[popup-open]:rotate-180"
        )}
      >
        <ChevronDown className="size-4 shrink-0" aria-hidden />
      </NavigationMenuPrimitive.Icon>
    </NavigationMenuPrimitive.Trigger>
  )
}

/* ------------------------------------------------------------------ Link -- */

function NavigationMenuLink(
  props: Omit<
    React.ComponentProps<typeof NavigationMenuPrimitive.Link>,
    "className" | "style"
  >
) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(navItemVariants())}
      {...props}
    />
  )
}

/* --------------------------------------------------------------- Content -- */

function NavigationMenuContent(
  props: Omit<
    React.ComponentProps<typeof NavigationMenuPrimitive.Content>,
    "className" | "style"
  >
) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        "w-max p-2",
        "transition-[opacity,transform] duration-200 ease-out",
        "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
        "data-[activation-direction=left]:data-[starting-style]:translate-x-2",
        "data-[activation-direction=right]:data-[starting-style]:-translate-x-2"
      )}
      {...props}
    />
  )
}

/* -------------------------------------------------- Viewport (surface) -- */

type NavigationMenuViewportProps = {
  side?: React.ComponentProps<typeof NavigationMenuPrimitive.Positioner>["side"]
  align?: React.ComponentProps<typeof NavigationMenuPrimitive.Positioner>["align"]
  sideOffset?: number
  alignOffset?: number
  showArrow?: boolean
}

function NavigationMenuViewport({
  side = "bottom",
  align = "center",
  sideOffset = 8,
  alignOffset = 0,
  showArrow = false,
}: NavigationMenuViewportProps) {
  return (
    <NavigationMenuPrimitive.Portal>
      <NavigationMenuPrimitive.Positioner
        data-slot="navigation-menu-positioner"
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        className="z-50 box-border"
      >
        <NavigationMenuPrimitive.Popup
          data-slot="navigation-menu-content-surface"
          className={cn(
            "bg-popover text-popover-foreground ring-border-strong relative min-w-40 max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg text-sm shadow-elevated ring-1 outline-none",
            "origin-[var(--transform-origin)] transition-[transform,opacity] duration-200 ease-out",
            "data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0"
          )}
        >
          {showArrow ? (
            <NavigationMenuPrimitive.Arrow
              data-slot="navigation-menu-arrow"
              className="z-10 text-popover data-[side=bottom]:top-[-6px] data-[side=bottom]:rotate-180 data-[side=left]:right-[-9px] data-[side=left]:-rotate-90 data-[side=right]:left-[-9px] data-[side=right]:rotate-90 data-[side=top]:bottom-[-6px]"
            >
              <svg width="12" height="7" viewBox="0 0 12 7" fill="none" aria-hidden>
                <path
                  d="M6 6.5 0.5 0.5H11.5L6 6.5Z"
                  className="fill-popover stroke-border-strong"
                  strokeWidth="1"
                />
              </svg>
            </NavigationMenuPrimitive.Arrow>
          ) : null}
          <NavigationMenuPrimitive.Viewport
            data-slot="navigation-menu-viewport"
            className="relative h-full w-full"
          />
        </NavigationMenuPrimitive.Popup>
      </NavigationMenuPrimitive.Positioner>
    </NavigationMenuPrimitive.Portal>
  )
}

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuViewport,
}
