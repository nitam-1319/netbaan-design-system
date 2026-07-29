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
}

function Sidebar({ navLabel = "Sidebar", ...props }: SidebarProps) {
  return (
    <nav
      data-slot="sidebar"
      aria-label={navLabel}
      className={cn(
        "bg-sidebar text-sidebar-foreground flex h-full min-h-0 w-full flex-col gap-1"
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
        "flex h-14 shrink-0 items-center gap-2 px-3 text-sm font-semibold text-sidebar-foreground [&_svg]:size-5"
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
      className={cn("flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-2 py-2")}
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
        "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        "focus-visible:ring-3 focus-visible:ring-accent-soft focus-visible:border-ring",
        "data-[active]:bg-sidebar-accent data-[active]:text-sidebar-accent-foreground"
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
        "border-sidebar-border mt-auto flex shrink-0 items-center gap-2 border-t px-3 py-3 text-sm text-muted-foreground"
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
