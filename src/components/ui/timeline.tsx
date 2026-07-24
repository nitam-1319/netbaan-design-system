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

function Timeline(
  props: Omit<useRender.ComponentProps<"ol">, "className" | "style">
) {
  const { render = <ol />, ...rest } = props
  return useRender({
    render,
    props: {
      "data-slot": "timeline",
      // The last item's connector is hidden so the rail stops at the final dot.
      className: cn(
        "flex flex-col [&>li:last-child_[data-slot=timeline-connector]]:hidden"
      ),
      ...rest,
    },
  })
}

/* ------------------------------------------------------------------ Item -- */

const markerVariants = cva(
  "relative z-10 mt-0.5 flex shrink-0 items-center justify-center rounded-full bg-current",
  {
    variants: {
      tone: {
        accent: "text-primary",
        neutral: "text-muted-foreground",
        success: "text-success",
        warning: "text-warning",
        danger: "text-destructive",
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
  }

function TimelineItem({
  tone = "accent",
  size = "md",
  marker,
  children,
  ...props
}: TimelineItemProps) {
  return (
    <li
      data-slot="timeline-item"
      data-tone={tone ?? undefined}
      className={cn("relative flex gap-3 pb-6 last:pb-0")}
      {...props}
    >
      <div
        data-slot="timeline-rail"
        className={cn("flex flex-col items-center gap-1")}
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
          className={cn("w-px flex-1 bg-border")}
        />
      </div>
      <div
        data-slot="timeline-content"
        className={cn("flex flex-1 flex-col gap-0.5 pb-1")}
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
export type { TimelineItemProps }
