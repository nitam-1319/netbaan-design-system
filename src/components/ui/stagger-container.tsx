import * as React from "react"

import { cn } from "@/lib/utils"
import { ScrollReveal, type ScrollRevealProps } from "@/components/ui/scroll-reveal"

/**
 * AEGIS — Stagger Container (Motion)
 *
 * Reveals a set of children in sequence — each one entering a beat after the last
 * — so a list, grid, or card row cascades into view instead of appearing all at
 * once. It composes `Scroll Reveal` per child, assigning an incremental `delay`,
 * so it inherits the viewport trigger, directional slide, and automatic
 * reduced-motion fallback.
 *
 * Public API is CLOSED — no `className` / `style`; timing/direction are semantic
 * props. All motion is token-scaled and reduced-motion-aware. See
 * `.agent/rules/API_RULES.md`.
 */

type StaggerContainerProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style" | "children"
> & {
  /** Items to reveal in sequence. */
  children: React.ReactNode
  /** Delay added per item, in ms. Default 80. */
  stagger?: number
  /** Base delay before the first item, in ms. Default 0. */
  initialDelay?: number
  /** Slide origin for each item (passed to Scroll Reveal). Default "up". */
  from?: ScrollRevealProps["from"]
  /** Transition speed for each item. Default "default". */
  speed?: ScrollRevealProps["speed"]
  /** Reveal only once. Default `true`. */
  once?: boolean
  /** Gap utility between items. Default "md". */
  gap?: "none" | "sm" | "md" | "lg"
}

const gapClass: Record<NonNullable<StaggerContainerProps["gap"]>, string> = {
  none: "",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
}

function StaggerContainer({
  children,
  stagger = 80,
  initialDelay = 0,
  from = "up",
  speed = "default",
  once = true,
  gap = "md",
  ...props
}: StaggerContainerProps) {
  const items = React.Children.toArray(children)
  return (
    <div
      data-slot="stagger-container"
      className={cn("flex flex-col", gapClass[gap])}
      {...props}
    >
      {items.map((child, i) => (
        <ScrollReveal
          key={i}
          from={from}
          speed={speed}
          once={once}
          delay={initialDelay + i * stagger}
        >
          {child}
        </ScrollReveal>
      ))}
    </div>
  )
}

export { StaggerContainer }
export type { StaggerContainerProps }
