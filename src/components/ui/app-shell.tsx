import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * AEGIS — App Shell
 *
 * A full-application scaffold that arranges a sidebar, a topbar, and a scrolling
 * content region. It is a set of composable slot parts (`AppShell`,
 * `AppShellSidebar`, `AppShellMain`, `AppShellHeader`, `AppShellContent`,
 * `AppShellFooter`) rather than a single monolith, so product screens can be
 * assembled consistently. Surfaces use AEGIS sidebar/surface tokens only; the
 * shell fills the viewport (`min-h-svh`) and keeps the content column
 * independently scrollable.
 *
 * Public API is CLOSED — no `className` / `style` on any part; tokens only.
 */

function AppShell(
  props: Omit<React.ComponentProps<"div">, "className" | "style">
) {
  return (
    <div
      data-slot="app-shell"
      className={cn("bg-background text-foreground flex min-h-svh w-full")}
      {...props}
    />
  )
}

const appShellSidebarVariants = cva(
  "bg-sidebar text-sidebar-foreground border-sidebar-border flex shrink-0 flex-col border-e transition-[width] duration-200",
  {
    variants: {
      width: {
        sm: "w-52",
        md: "w-64",
        lg: "w-72",
      },
      collapsed: {
        true: "w-16",
        false: "",
      },
    },
    defaultVariants: {
      width: "md",
      collapsed: false,
    },
  }
)

function AppShellSidebar({
  width = "md",
  collapsed = false,
  ...props
}: Omit<React.ComponentProps<"aside">, "className" | "style"> &
  VariantProps<typeof appShellSidebarVariants>) {
  return (
    <aside
      data-slot="app-shell-sidebar"
      data-collapsed={collapsed ? "" : undefined}
      className={cn(appShellSidebarVariants({ width, collapsed }))}
      {...props}
    />
  )
}

function AppShellMain(
  props: Omit<React.ComponentProps<"div">, "className" | "style">
) {
  return (
    <div
      data-slot="app-shell-main"
      className={cn("flex min-w-0 flex-1 flex-col")}
      {...props}
    />
  )
}

function AppShellHeader(
  props: Omit<React.ComponentProps<"header">, "className" | "style">
) {
  return (
    <header
      data-slot="app-shell-header"
      className={cn(
        "bg-surface/80 border-border sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b px-4 backdrop-blur-md"
      )}
      {...props}
    />
  )
}

function AppShellContent(
  props: Omit<React.ComponentProps<"main">, "className" | "style">
) {
  return (
    <main
      data-slot="app-shell-content"
      className={cn("min-h-0 flex-1 overflow-auto p-6")}
      {...props}
    />
  )
}

function AppShellFooter(
  props: Omit<React.ComponentProps<"footer">, "className" | "style">
) {
  return (
    <footer
      data-slot="app-shell-footer"
      className={cn(
        "border-border text-muted-foreground flex h-12 shrink-0 items-center gap-3 border-t px-4 text-sm"
      )}
      {...props}
    />
  )
}

export {
  AppShell,
  AppShellSidebar,
  AppShellMain,
  AppShellHeader,
  AppShellContent,
  AppShellFooter,
  appShellSidebarVariants,
}
