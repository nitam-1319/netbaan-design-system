"use client";

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Marquee (Motion)
 *
 * A continuously scrolling strip of content — logos, testimonials, tickers — that
 * loops seamlessly. The content is repeated and each copy is translated by its own
 * width plus the gap, so the row snaps back invisibly and the motion reads as an
 * endless belt.
 *
 * Horizontal or vertical, either direction, with an optional pause-on-hover. All
 * motion is token-scaled and disabled under `prefers-reduced-motion` (the strip
 * simply sits still). Public API is CLOSED — no `className` / `style`; behaviour is
 * the semantic props. See `.agent/rules/API_RULES.md`.
 */

type MarqueeProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style" | "children"
> & {
  /** Content to scroll (repeated to fill the belt). */
  children: React.ReactNode
  /** Scroll axis + direction. Default "left". */
  direction?: "left" | "right" | "up" | "down"
  /** Loop speed. Default "default". */
  speed?: "fast" | "default" | "slow"
  /** Pause while the pointer is over the strip. Default `true`. */
  pauseOnHover?: boolean
  /** Gap between items and repeats. Default "md". */
  gap?: "none" | "sm" | "md" | "lg"
  /** How many times to repeat the content. Higher fills wider containers. Default 2. */
  repeat?: number
}

const speedDuration: Record<NonNullable<MarqueeProps["speed"]>, string> = {
  fast: "10s",
  default: "20s",
  slow: "40s",
}

/** Gap value in px so the keyframe (`--marquee-gap`) and the flex `gap` agree. */
const gapPx: Record<NonNullable<MarqueeProps["gap"]>, number> = {
  none: 0,
  sm: 8,
  md: 16,
  lg: 24,
}

function Marquee({
  children,
  direction = "left",
  speed = "default",
  pauseOnHover = true,
  gap = "md",
  repeat = 2,
  ...props
}: MarqueeProps) {
  const vertical = direction === "up" || direction === "down"
  const reversed = direction === "right" || direction === "down"
  const gapValue = gapPx[gap]
  const count = Math.max(2, Math.floor(repeat))

  return (
    <div
      data-slot="marquee"
      data-direction={direction}
      className={cn(
        "group/marquee flex overflow-hidden",
        vertical ? "flex-col" : "flex-row"
      )}
      style={
        { "--marquee-gap": `${gapValue}px`, gap: `${gapValue}px` } as React.CSSProperties
      }
      {...props}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          aria-hidden={i > 0 || undefined}
          inert={i > 0 || undefined}
          className={cn(
            "flex shrink-0 justify-around",
            vertical ? "flex-col" : "flex-row",
            vertical ? "animate-marquee-vertical" : "animate-marquee",
            "motion-reduce:animate-none",
            pauseOnHover && "group-hover/marquee:[animation-play-state:paused]"
          )}
          style={{
            gap: `${gapValue}px`,
            animationDuration: speedDuration[speed],
            animationDirection: reversed ? "reverse" : undefined,
          }}
        >
          {children}
        </div>
      ))}
    </div>
  )
}

export { Marquee }
export type { MarqueeProps }
