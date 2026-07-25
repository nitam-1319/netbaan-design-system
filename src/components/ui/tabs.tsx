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

function Tabs(
  props: Omit<React.ComponentProps<typeof TabsPrimitive.Root>, "className" | "style">
) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2")}
      {...props}
    />
  )
}

function TabsList(
  props: Omit<React.ComponentProps<typeof TabsPrimitive.List>, "className" | "style">
) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "bg-surface-2 text-muted-foreground relative inline-flex h-9 w-fit items-center justify-center rounded-lg border border-border/70 p-1"
      )}
      {...props}
    />
  )
}

function TabsTab(
  props: Omit<React.ComponentProps<typeof TabsPrimitive.Tab>, "className" | "style">
) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-tab"
      className={cn(
        "relative z-10 inline-flex h-7 flex-1 items-center justify-center gap-1.5 rounded-md px-3 text-sm font-medium whitespace-nowrap transition-colors outline-none select-none",
        "text-muted-foreground data-[selected]:text-foreground hover:text-foreground",
        "focus-visible:ring-3 focus-visible:ring-accent-soft",
        "disabled:pointer-events-none disabled:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
      )}
      {...props}
    />
  )
}

function TabsIndicator(
  props: Omit<
    React.ComponentProps<typeof TabsPrimitive.Indicator>,
    "className" | "style"
  >
) {
  return (
    <TabsPrimitive.Indicator
      data-slot="tabs-indicator"
      renderBeforeHydration
      className={cn(
        "absolute top-1/2 left-0 z-0 h-7 -translate-y-1/2 rounded-md bg-background shadow-sm",
        "w-[var(--active-tab-width)] translate-x-[var(--active-tab-left)]",
        "transition-[width,transform] duration-200 ease-out"
      )}
      {...props}
    />
  )
}

function TabsPanel(
  props: Omit<React.ComponentProps<typeof TabsPrimitive.Panel>, "className" | "style">
) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-panel"
      className={cn(
        "flex-1 outline-none focus-visible:ring-3 focus-visible:ring-accent-soft rounded-md"
      )}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTab, TabsIndicator, TabsPanel }
