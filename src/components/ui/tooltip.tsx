import * as React from "react"
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Tooltip
 *
 * A hover/focus contextual label built on the Base UI tooltip primitive, so
 * pointer + keyboard triggering, grouped delays, collision-aware positioning,
 * and dismissal are handled for us. Styling is driven entirely by AEGIS tokens.
 */

function TooltipProvider({
  delay = 200,
  closeDelay = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delay={delay}
      closeDelay={closeDelay}
      {...props}
    />
  )
}

function Tooltip(props: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  )
}

function TooltipTrigger(
  props: React.ComponentProps<typeof TooltipPrimitive.Trigger>
) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

function TooltipContent({
  className,
  sideOffset = 8,
  side = "top",
  align = "center",
  showArrow = true,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Popup> & {
  sideOffset?: number
  side?: React.ComponentProps<typeof TooltipPrimitive.Positioner>["side"]
  align?: React.ComponentProps<typeof TooltipPrimitive.Positioner>["align"]
  showArrow?: boolean
}) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        data-slot="tooltip-positioner"
        sideOffset={sideOffset}
        side={side}
        align={align}
        className="z-50"
      >
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cn(
            "bg-popover text-popover-foreground ring-border-strong relative max-w-[18rem] rounded-md px-2.5 py-1.5 text-xs leading-relaxed font-medium text-pretty shadow-[0_18px_50px_-18px_rgba(0,0,0,0.7)] ring-1",
            "origin-[var(--transform-origin)] transition-[transform,opacity] duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
            className
          )}
          {...props}
        >
          {children}
          {showArrow ? (
            <TooltipPrimitive.Arrow
              data-slot="tooltip-arrow"
              className="text-popover data-[side=bottom]:top-[-6px] data-[side=bottom]:rotate-180 data-[side=left]:right-[-9px] data-[side=left]:-rotate-90 data-[side=right]:left-[-9px] data-[side=right]:rotate-90 data-[side=top]:bottom-[-6px]"
            >
              <svg width="12" height="7" viewBox="0 0 12 7" fill="none" aria-hidden>
                <path
                  d="M6 6.5 0.5 0.5H11.5L6 6.5Z"
                  className="fill-popover stroke-border-strong"
                  strokeWidth="1"
                />
              </svg>
            </TooltipPrimitive.Arrow>
          ) : null}
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
