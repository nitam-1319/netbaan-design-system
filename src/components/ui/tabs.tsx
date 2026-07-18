import * as React from "react"
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Tabs
 *
 * In-view switching between related panels, built on the Base UI Tabs primitive:
 * roving-tabindex keyboard navigation, `role="tablist"/"tab"/"tabpanel"`, and an
 * optional sliding `TabsIndicator` are handled for us. The list is a pill-style
 * segmented track; the active tab sits on an AEGIS surface highlight.
 */

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "bg-surface-2 text-muted-foreground relative inline-flex h-9 w-fit items-center justify-center rounded-lg border border-border/70 p-1",
        className
      )}
      {...props}
    />
  )
}

function TabsTab({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Tab>) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-tab"
      className={cn(
        "relative z-10 inline-flex h-7 flex-1 items-center justify-center gap-1.5 rounded-md px-3 text-sm font-medium whitespace-nowrap transition-colors outline-none select-none",
        "text-muted-foreground data-[selected]:text-foreground hover:text-foreground",
        "focus-visible:ring-3 focus-visible:ring-ring/50",
        "disabled:pointer-events-none disabled:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        className
      )}
      {...props}
    />
  )
}

function TabsIndicator({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Indicator>) {
  return (
    <TabsPrimitive.Indicator
      data-slot="tabs-indicator"
      renderBeforeHydration
      className={cn(
        "absolute top-1/2 left-0 z-0 h-7 -translate-y-1/2 rounded-md bg-background shadow-sm",
        "w-[var(--active-tab-width)] translate-x-[var(--active-tab-left)]",
        "transition-[width,transform] duration-200 ease-out",
        className
      )}
      {...props}
    />
  )
}

function TabsPanel({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Panel>) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-panel"
      className={cn(
        "flex-1 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 rounded-md",
        className
      )}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTab, TabsIndicator, TabsPanel }
