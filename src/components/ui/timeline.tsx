"use client";

import * as React from "react"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Timeline
 *
 * A vertical, ordered sequence of events: activity feeds, audit logs, change
 * history, onboarding steps. Built on semantic `<ol>` / `<li>` so the order is
 * conveyed to assistive tech. Each `TimelineItem` draws a token-coloured marker
 * and a connector line to the next item (the connector is hidden on the last
 * item automatically). Compose `TimelineTitle`, `TimelineTime`, and
 * `TimelineDescription` inside each item.
 *
 * The public API is CLOSED — no `className` / `style`; use the semantic `tone`
 * and `size` props. Colour is token-driven. See `.agent/rules/API_RULES.md`.
 */

/* ------------------------------------------------------------------ Root -- */

const TimelineOrientationContext = React.createContext<
  "vertical" | "horizontal"
>("vertical")

type TimelineProps = Omit<
  useRender.ComponentProps<"ol">,
  "className" | "style"
> & {
  /**
   * `vertical` (default) is the feed. `horizontal` is the dense chronological
   * RAIL — a scrolling strip of events, newest first, the shape a detail
   * panel's history tab wants. The connector then runs along the row rather
   * than down the side, and the strip scrolls instead of wrapping.
   */
  orientation?: "vertical" | "horizontal"
}

function Timeline({ orientation = "vertical", ...props }: TimelineProps) {
  const { render = <ol />, ...rest } = props
  const horizontal = orientation === "horizontal"
  const list = useRender({
    render,
    props: {
      "data-slot": "timeline",
      "data-orientation": orientation,
      // The last item's connector is hidden so the rail stops at the final dot.
      className: cn(
        "[&>li:last-child_[data-slot=timeline-connector]]:hidden",
        horizontal
          ? "flex flex-row items-stretch overflow-x-auto"
          : "flex flex-col"
      ),
      ...rest,
    },
  })

  return (
    <TimelineOrientationContext.Provider value={orientation}>
      {list}
    </TimelineOrientationContext.Provider>
  )
}

/* ------------------------------------------------------------------ Item -- */

const markerVariants = cva(
  "relative z-10 mt-0.5 flex shrink-0 items-center justify-center rounded-full bg-current",
  {
    variants: {
      tone: {
        accent: "text-primary",
        neutral: "text-muted-foreground",
        success: "text-success-ink",
        warning: "text-warning-ink",
        danger: "text-destructive-ink",
        info: "text-primary",
      },
      size: {
        sm: "size-2",
        md: "size-2.5",
        lg: "size-3",
      },
    },
    defaultVariants: { tone: "accent", size: "md" },
  }
)

type TimelineItemProps = Omit<
  React.ComponentProps<"li">,
  "className" | "style"
> &
  VariantProps<typeof markerVariants> & {
    /**
     * Custom marker content (e.g. an icon). Rendered centred on the rail in
     * place of the default dot; the coloured ring is kept.
     */
    marker?: React.ReactNode
    /**
     * Makes the item a CONTROL — it activates on click, Enter and Space and
     * reports `aria-pressed`. A rail where one event type opens its record
     * below otherwise has to nest a `<button>` inside the `<li>`, which puts
     * the affordance on part of the item and leaves the rest inert.
     */
    onSelect?: () => void
    /** Marks this item as the selected one. Requires `onSelect` to be meaningful. */
    selected?: boolean
  }

function TimelineItem({
  tone = "accent",
  size = "md",
  marker,
  onSelect,
  selected = false,
  children,
  ...props
}: TimelineItemProps) {
  const orientation = React.useContext(TimelineOrientationContext)
  const horizontal = orientation === "horizontal"
  return (
    <li
      data-slot="timeline-item"
      data-tone={tone ?? undefined}
      data-selected={selected || undefined}
      {...(onSelect
        ? {
            role: "button" as const,
            tabIndex: 0,
            "aria-pressed": selected,
            onClick: onSelect,
            onKeyDown: (e: React.KeyboardEvent<HTMLLIElement>) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onSelect()
              }
            },
          }
        : {})}
      className={cn(
        "relative flex",
        horizontal
          ? "min-w-[168px] shrink-0 flex-col gap-2 pe-6 last:pe-0"
          : "gap-3 pb-6 last:pb-0",
        onSelect &&
          cn(
            "cursor-pointer rounded-lg outline-none transition-colors",
            "focus-visible:ring-3 focus-visible:ring-accent-soft",
            horizontal ? "px-2 py-1.5 hover:bg-surface-2" : "hover:bg-surface-2"
          ),
        selected && "bg-accent-soft"
      )}
      {...props}
    >
      <div
        data-slot="timeline-rail"
        className={cn(
          "flex gap-1",
          horizontal ? "flex-row items-center" : "flex-col items-center"
        )}
      >
        {marker != null ? (
          <span
            aria-hidden="true"
            data-slot="timeline-marker"
            className={cn(
              markerVariants({ tone, size: "lg" }),
              "size-6 bg-transparent [&_svg]:size-3.5"
            )}
          >
            {marker}
          </span>
        ) : (
          <span
            aria-hidden="true"
            data-slot="timeline-marker"
            className={cn(markerVariants({ tone, size }))}
          />
        )}
        <span
          aria-hidden="true"
          data-slot="timeline-connector"
          className={cn(
            "bg-border flex-1",
            horizontal ? "h-px" : "w-px"
          )}
        />
      </div>
      <div
        data-slot="timeline-content"
        className={cn(
          "flex flex-1 flex-col gap-0.5",
          horizontal ? "min-w-0" : "pb-1"
        )}
      >
        {children}
      </div>
    </li>
  )
}

/* ------------------------------------------------------- Content pieces -- */

function TimelineTitle(
  props: Omit<useRender.ComponentProps<"div">, "className" | "style">
) {
  const { render = <div />, ...rest } = props
  return useRender({
    render,
    props: {
      "data-slot": "timeline-title",
      className: cn("text-foreground text-sm font-medium"),
      ...rest,
    },
  })
}

function TimelineTime(
  props: Omit<useRender.ComponentProps<"time">, "className" | "style">
) {
  const { render = <time />, ...rest } = props
  return useRender({
    render,
    props: {
      "data-slot": "timeline-time",
      className: cn("text-muted-foreground text-xs font-normal"),
      ...rest,
    },
  })
}

function TimelineDescription(
  props: Omit<React.ComponentProps<"p">, "className" | "style">
) {
  return (
    <p
      data-slot="timeline-description"
      className={cn("text-muted-foreground mt-0.5 text-sm")}
      {...props}
    />
  )
}

export {
  Timeline,
  TimelineItem,
  TimelineTitle,
  TimelineTime,
  TimelineDescription,
  markerVariants as timelineMarkerVariants,
}
export type { TimelineProps, TimelineItemProps }
