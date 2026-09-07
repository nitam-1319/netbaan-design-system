"use client";

import * as React from "react"
import { useRender } from "@base-ui/react/use-render"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Sidebar (Navigation tier, closed API)
 *
 * The vertical section-level navigation rail: a header (brand / workspace), a
 * scrollable body of grouped navigation items, and a pinned footer. Composed of
 * slot parts (`Sidebar`, `SidebarHeader`, `SidebarContent`, `SidebarGroup`,
 * `SidebarGroupLabel`, `SidebarItem`, `SidebarFooter`) so a product can assemble
 * a consistent rail. It renders a `<nav>` landmark, and each item is a real
 * link/button with an `active` (current-page) state.
 *
 * Designed to sit inside `AppShellSidebar`; pair it with a `Navbar` for the top
 * bar. Public API is CLOSED: no `className` / `style`. Element polymorphism
 * (router `Link`) is available on `SidebarItem` through `render`.
 * See `.agent/rules/API_RULES.md` and `.agent/DECISIONS.md`.
 */

type SidebarProps = Omit<React.ComponentProps<"nav">, "className" | "style"> & {
  /** Accessible label for the navigation landmark. */
  navLabel?: string
  /**
   * Row density for the whole rail.
   *
   * `comfortable` (default) is the desktop rail: ~36px rows, right under a
   * mouse. `touch` raises every slot to the 44px minimum a tap target needs,
   * and grows the label and icon with it.
   *
   * Declared once at the root rather than per slot, because density is a
   * property of the surface: a rail with touch rows and a comfortable header
   * is worse than either, and there was previously no prop at all — a rail
   * that was correct on desktop was uniformly too tight in a drawer.
   */
  density?: "comfortable" | "touch"
}

function Sidebar({ navLabel = "Sidebar", density = "comfortable", ...props }: SidebarProps) {
  return (
    <nav
      data-slot="sidebar"
      aria-label={navLabel}
      // The slots below read this through `group-data-[density=touch]/sidebar:`,
      // so one prop at the root reaches every row without threading context.
      data-density={density}
      className={cn(
        "group/sidebar bg-sidebar text-sidebar-foreground flex h-full min-h-0 w-full flex-col gap-1"
      )}
      {...props}
    />
  )
}

function SidebarHeader({
  ...props
}: Omit<React.ComponentProps<"div">, "className" | "style">) {
  return (
    <div
      data-slot="sidebar-header"
      className={cn(
        "flex h-14 shrink-0 items-center gap-2 px-3 text-sm font-semibold text-sidebar-foreground [&_svg]:size-5",
        "group-data-[density=touch]/sidebar:h-16 group-data-[density=touch]/sidebar:text-[15px]"
      )}
      {...props}
    />
  )
}

function SidebarContent({
  ...props
}: Omit<React.ComponentProps<"div">, "className" | "style">) {
  return (
    <div
      data-slot="sidebar-content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-2 py-2",
        "group-data-[density=touch]/sidebar:gap-5 group-data-[density=touch]/sidebar:px-3 group-data-[density=touch]/sidebar:py-3"
      )}
      {...props}
    />
  )
}

function SidebarGroup({
  ...props
}: Omit<React.ComponentProps<"div">, "className" | "style">) {
  return (
    <div
      data-slot="sidebar-group"
      className={cn("flex flex-col gap-0.5")}
      {...props}
    />
  )
}

function SidebarGroupLabel({
  ...props
}: Omit<React.ComponentProps<"div">, "className" | "style">) {
  return (
    <div
      data-slot="sidebar-group-label"
      className={cn(
        "px-3 pt-2 pb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase"
      )}
      {...props}
    />
  )
}

type SidebarItemProps = Omit<
  useRender.ComponentProps<"a">,
  "className" | "style"
> & {
  /** Marks this item as the current page (`aria-current="page"` + active styling). */
  active?: boolean
}

function SidebarItem({ active = false, render, ...props }: SidebarItemProps) {
  return useRender({
    render: render ?? <a />,
    props: {
      "data-slot": "sidebar-item",
      "data-active": active ? "" : undefined,
      "aria-current": active ? "page" : undefined,
      className: cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors outline-none [&_svg]:size-4 [&_svg]:shrink-0",
        // 44px is the floor docs/responsive-policy.md sets for touch; the
        // comfortable row lands at about 36px, which is right for a pointer
        // and short for a thumb.
        "group-data-[density=touch]/sidebar:min-h-11 group-data-[density=touch]/sidebar:px-3.5 group-data-[density=touch]/sidebar:text-[15px] group-data-[density=touch]/sidebar:[&_svg]:size-[18px]",
        "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        "focus-visible:ring-3 focus-visible:ring-accent-soft focus-visible:border-ring",
        // The current row is marked TWICE: a 2px `--primary` bar on the row's
        // inline-start edge (inset 7px, 11px at touch density) and a primary
        // tint. `bg-sidebar-accent` alone is the same wash a hover produces, so
        // a pointer resting anywhere on the rail made two rows look current.
        "relative data-[active]:bg-[color-mix(in_oklch,var(--primary),transparent_84%)] data-[active]:text-sidebar-accent-foreground",
        "data-[active]:before:absolute data-[active]:before:inset-y-[7px] data-[active]:before:start-0 data-[active]:before:w-0.5 data-[active]:before:rounded-full data-[active]:before:bg-primary data-[active]:before:content-['']",
        "group-data-[density=touch]/sidebar:data-[active]:before:inset-y-[11px]"
      ),
      ...props,
    },
  })
}

function SidebarFooter({
  ...props
}: Omit<React.ComponentProps<"div">, "className" | "style">) {
  return (
    <div
      data-slot="sidebar-footer"
      className={cn(
        "border-sidebar-border mt-auto flex shrink-0 items-center gap-2 border-t px-3 py-3 text-sm text-muted-foreground",
        // A drawer's footer is the row closest to the home indicator, so the
        // touch density also has to clear the safe area or the last control
        // sits under it.
        "group-data-[density=touch]/sidebar:min-h-12 group-data-[density=touch]/sidebar:px-3.5 group-data-[density=touch]/sidebar:pb-[max(0.75rem,env(safe-area-inset-bottom))] group-data-[density=touch]/sidebar:text-[15px]"
      )}
      {...props}
    />
  )
}

export {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarItem,
  SidebarFooter,
}
