import * as React from "react"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Popover (Interactive tier, closed API)
 *
 * A non-modal floating surface anchored to a trigger, built on the Base UI
 * Popover primitive: portalling, floating-engine positioning (side / align /
 * offsets / collision flipping), focus management, and outside-press / Escape
 * dismissal are all handled for us. The Menu, Select, and Combobox families
 * build on this same primitive.
 *
 * Public API is CLOSED: no `className` / `style`. Placement and arrow are
 * semantic props; layout inside the popover belongs in `Box`/`Stack`.
 * See `.agent/rules/API_RULES.md` and `.agent/DECISIONS.md` (escape-hatch policy).
 */

function Popover(props: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

function PopoverTrigger(
  props: Omit<
    React.ComponentProps<typeof PopoverPrimitive.Trigger>,
    "className" | "style"
  >
) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

function PopoverClose(
  props: Omit<
    React.ComponentProps<typeof PopoverPrimitive.Close>,
    "className" | "style"
  >
) {
  return <PopoverPrimitive.Close data-slot="popover-close" {...props} />
}

type PopoverContentProps = Omit<
  React.ComponentProps<typeof PopoverPrimitive.Popup>,
  "className" | "style"
> & {
  side?: React.ComponentProps<typeof PopoverPrimitive.Positioner>["side"]
  align?: React.ComponentProps<typeof PopoverPrimitive.Positioner>["align"]
  sideOffset?: number
  alignOffset?: number
  showArrow?: boolean
}

function PopoverContent({
  side = "bottom",
  align = "center",
  sideOffset = 8,
  alignOffset = 0,
  showArrow = false,
  children,
  ...props
}: PopoverContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        data-slot="popover-positioner"
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        className="z-50"
      >
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          className={cn(
            "bg-popover text-popover-foreground ring-border-strong w-72 max-w-[calc(100vw-2rem)] rounded-lg p-4 text-sm shadow-elevated ring-1 outline-none",
            "origin-[var(--transform-origin)] transition-[transform,opacity] duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0"
          )}
          {...props}
        >
          {children}
          {showArrow ? (
            <PopoverPrimitive.Arrow
              data-slot="popover-arrow"
              className="text-popover data-[side=bottom]:top-[-6px] data-[side=bottom]:rotate-180 data-[side=left]:right-[-9px] data-[side=left]:-rotate-90 data-[side=right]:left-[-9px] data-[side=right]:rotate-90 data-[side=top]:bottom-[-6px]"
            >
              <svg width="12" height="7" viewBox="0 0 12 7" fill="none" aria-hidden>
                <path
                  d="M6 6.5 0.5 0.5H11.5L6 6.5Z"
                  className="fill-popover stroke-border-strong"
                  strokeWidth="1"
                />
              </svg>
            </PopoverPrimitive.Arrow>
          ) : null}
        </PopoverPrimitive.Popup>
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  )
}

function PopoverTitle(
  props: Omit<
    React.ComponentProps<typeof PopoverPrimitive.Title>,
    "className" | "style"
  >
) {
  return (
    <PopoverPrimitive.Title
      data-slot="popover-title"
      className={cn("text-sm font-semibold text-foreground")}
      {...props}
    />
  )
}

function PopoverDescription(
  props: Omit<
    React.ComponentProps<typeof PopoverPrimitive.Description>,
    "className" | "style"
  >
) {
  return (
    <PopoverPrimitive.Description
      data-slot="popover-description"
      className={cn("text-sm text-muted-foreground")}
      {...props}
    />
  )
}

export {
  Popover,
  PopoverTrigger,
  PopoverClose,
  PopoverContent,
  PopoverTitle,
  PopoverDescription,
}
