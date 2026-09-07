"use client";

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

type TabsListProps = Omit<
  React.ComponentProps<typeof TabsPrimitive.List>,
  "className" | "style"
> & {
  /**
   * `segmented` (default) is the pill: a bounded control that reads as a
   * switch. `underline` is the page-level form — a rule under the row with the
   * active tab marked on it, for a tab strip that navigates rather than
   * toggles. The pill form implies a small, closed set of options; a detail
   * page's sections are neither.
   */
  variant?: "segmented" | "underline"
}

function TabsList({ variant = "segmented", ...props }: TabsListProps) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      // TabsTab and TabsIndicator read the form from here, so the three cannot
      // disagree about which shape the row is.
      data-variant={variant}
      className={cn(
        "group/tabs-list text-muted-foreground relative inline-flex w-fit items-center justify-center",
        variant === "segmented"
          ? "bg-surface-2 h-9 rounded-lg border border-border/70 p-1"
          : "h-10 gap-1 border-b border-border"
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
        "relative z-10 inline-flex flex-1 items-center justify-center gap-1.5 px-3 text-sm font-medium whitespace-nowrap transition-colors outline-none select-none",
        "h-7 rounded-md group-data-[variant=underline]/tabs-list:h-10 group-data-[variant=underline]/tabs-list:rounded-none",
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
        "absolute left-0 z-0 w-[var(--active-tab-width)] translate-x-[var(--active-tab-left)] transition-[width,transform] duration-200 ease-out",
        // The pill slides a filled plate behind the tab; the underline marks
        // the rule beneath it. Same geometry, different mark.
        "top-1/2 h-7 -translate-y-1/2 rounded-md bg-surface-3 group-data-[variant=segmented]/tabs-list:glass-panel",
        "group-data-[variant=underline]/tabs-list:top-auto group-data-[variant=underline]/tabs-list:bottom-0 group-data-[variant=underline]/tabs-list:h-[2px] group-data-[variant=underline]/tabs-list:translate-y-0 group-data-[variant=underline]/tabs-list:rounded-none group-data-[variant=underline]/tabs-list:bg-primary"
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
