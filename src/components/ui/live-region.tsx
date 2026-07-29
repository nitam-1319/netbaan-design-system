"use client";

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Live Region (Accessibility primitive, closed API)
 *
 * An ARIA live region that announces dynamic, non-focus-stealing updates to
 * assistive tech — "3 findings loaded", "Filters applied", "Copied to
 * clipboard". Screen readers read its content whenever it changes, without
 * moving focus, so background updates are perceivable to non-sighted users the
 * same way a visual toast or count is to sighted ones.
 *
 * By default it is visually hidden (present only in the accessibility tree). Set
 * `visible` to also render the message on screen (e.g. an inline form status).
 *
 * Public API is CLOSED: no `className` / `style`. Urgency is the semantic
 * `politeness` prop. See `.agent/rules/ACCESSIBILITY_RULES.md` and
 * `.agent/DECISIONS.md` (escape-hatch policy).
 */

// Canonical visually-hidden technique: clip to a 1px box, out of layout flow,
// no wrapping. Purely structural — no color/spacing tokens needed.
const srOnlyClasses = cn(
  "absolute m-[-1px] h-px w-px overflow-hidden border-0 p-0 whitespace-nowrap",
  "[clip:rect(0_0_0_0)] [clip-path:inset(50%)]"
)

type LiveRegionProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style" | "aria-live" | "aria-atomic" | "role"
> & {
  /**
   * Announcement urgency.
   * - `polite` (default): announced when the screen reader is idle.
   * - `assertive`: announced immediately, interrupting speech. Reserve for errors.
   */
  politeness?: "polite" | "assertive"
  /**
   * Whether the whole region is re-read on any change (`aria-atomic`).
   * @default true
   */
  atomic?: boolean
  /**
   * Also render the message visually, not only to assistive tech.
   * @default false
   */
  visible?: boolean
}

function LiveRegion({
  politeness = "polite",
  atomic = true,
  visible = false,
  ...props
}: LiveRegionProps) {
  return (
    <div
      data-slot="live-region"
      role={politeness === "assertive" ? "alert" : "status"}
      aria-live={politeness}
      aria-atomic={atomic}
      className={cn(
        visible ? "text-sm text-muted-foreground" : srOnlyClasses
      )}
      {...props}
    />
  )
}

export { LiveRegion }
export type { LiveRegionProps }
