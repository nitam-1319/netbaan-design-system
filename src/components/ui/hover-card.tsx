import * as React from "react"
import { PreviewCard as PreviewCardPrimitive } from "@base-ui/react/preview-card"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Hover Card (Interactive tier, closed API)
 *
 * A rich preview surface that opens when the user hovers or focuses a trigger —
 * a person card behind an @mention, a repo card behind a link, a product peek.
 * Built on the Base UI PreviewCard primitive: hover-intent open/close delays,
 * portalling, floating-engine positioning (side / align / offsets / collision
 * flipping), and focus/dismissal are handled for us. Unlike a **Tooltip** (a
 * short text label) it holds structured content; unlike a **Popover** it is
 * opened by hover, not click, and is non-interactive-first.
 *
 * Public API is CLOSED: no `className` / `style`. Placement and arrow are
 * semantic props; layout inside the card belongs in `Box`/`Stack`.
 * See `.agent/rules/API_RULES.md` and `.agent/DECISIONS.md` (escape-hatch policy).
 */

function HoverCard(
  props: React.ComponentProps<typeof PreviewCardPrimitive.Root>
) {
  return <PreviewCardPrimitive.Root data-slot="hover-card" {...props} />
}

function HoverCardTrigger(
  props: Omit<
    React.ComponentProps<typeof PreviewCardPrimitive.Trigger>,
    "className" | "style"
  >
) {
  return (
    <PreviewCardPrimitive.Trigger data-slot="hover-card-trigger" {...props} />
  )
}

type HoverCardContentProps = Omit<
  React.ComponentProps<typeof PreviewCardPrimitive.Popup>,
  "className" | "style"
> & {
  side?: React.ComponentProps<typeof PreviewCardPrimitive.Positioner>["side"]
  align?: React.ComponentProps<typeof PreviewCardPrimitive.Positioner>["align"]
  sideOffset?: number
  alignOffset?: number
  showArrow?: boolean
}

function HoverCardContent({
  side = "bottom",
  align = "center",
  sideOffset = 8,
  alignOffset = 0,
  showArrow = false,
  children,
  ...props
}: HoverCardContentProps) {
  return (
    <PreviewCardPrimitive.Portal>
      <PreviewCardPrimitive.Positioner
        data-slot="hover-card-positioner"
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        className="z-50"
      >
        <PreviewCardPrimitive.Popup
          data-slot="hover-card-content"
          className={cn(
            "bg-popover text-popover-foreground ring-border-strong w-72 max-w-[calc(100vw-2rem)] rounded-lg p-4 text-sm shadow-elevated ring-1 outline-none",
            "origin-[var(--transform-origin)] transition-[transform,opacity] duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0"
          )}
          {...props}
        >
          {children}
          {showArrow ? (
            <PreviewCardPrimitive.Arrow
              data-slot="hover-card-arrow"
              className="text-popover data-[side=bottom]:top-[-6px] data-[side=bottom]:rotate-180 data-[side=left]:right-[-9px] data-[side=left]:-rotate-90 data-[side=right]:left-[-9px] data-[side=right]:rotate-90 data-[side=top]:bottom-[-6px]"
            >
              <svg width="12" height="7" viewBox="0 0 12 7" fill="none" aria-hidden>
                <path
                  d="M6 6.5 0.5 0.5H11.5L6 6.5Z"
                  className="fill-popover stroke-border-strong"
                  strokeWidth="1"
                />
              </svg>
            </PreviewCardPrimitive.Arrow>
          ) : null}
        </PreviewCardPrimitive.Popup>
      </PreviewCardPrimitive.Positioner>
    </PreviewCardPrimitive.Portal>
  )
}

export { HoverCard, HoverCardTrigger, HoverCardContent }
export type { HoverCardContentProps }
