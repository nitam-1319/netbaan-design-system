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
 */

function AppShell({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="app-shell"
      className={cn(
        "bg-background text-foreground flex min-h-svh w-full",
        className
      )}
      {...props}
    />
  )
}

const appShellSidebarVariants = cva(
  "bg-sidebar text-sidebar-foreground border-sidebar-border flex shrink-0 flex-col border-r transition-[width] duration-200",
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
  className,
  width = "md",
  collapsed = false,
  ...props
}: React.ComponentProps<"aside"> &
  VariantProps<typeof appShellSidebarVariants>) {
  return (
    <aside
      data-slot="app-shell-sidebar"
      data-collapsed={collapsed ? "" : undefined}
      className={cn(appShellSidebarVariants({ width, collapsed }), className)}
      {...props}
    />
  )
}

function AppShellMain({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="app-shell-main"
      className={cn("flex min-w-0 flex-1 flex-col", className)}
      {...props}
    />
  )
}

function AppShellHeader({ className, ...props }: React.ComponentProps<"header">) {
  return (
    <header
      data-slot="app-shell-header"
      className={cn(
        "bg-surface/80 border-border sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b px-4 backdrop-blur-md",
        className
      )}
      {...props}
    />
  )
}

function AppShellContent({ className, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      data-slot="app-shell-content"
      className={cn("min-h-0 flex-1 overflow-auto p-6", className)}
      {...props}
    />
  )
}

function AppShellFooter({ className, ...props }: React.ComponentProps<"footer">) {
  return (
    <footer
      data-slot="app-shell-footer"
      className={cn(
        "border-border text-muted-foreground flex h-12 shrink-0 items-center gap-3 border-t px-4 text-sm",
        className
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
