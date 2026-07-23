import * as React from "react"
import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Scroll Area (Layout tier, closed API)
 *
 * A scrollable container with custom, overlay scrollbars that match the AEGIS
 * surface, built on the Base UI ScrollArea primitive. It replaces the native
 * browser scrollbar with a thin, theme-aware thumb that appears on hover /
 * scroll and never shifts layout, while keeping native scrolling physics,
 * keyboard scrolling, and accessibility intact.
 *
 * The area fills its parent, so give it a bounded size from the outside (a
 * `Box`/`Stack` with a fixed height or `max-h`) — that constraint is what makes
 * it scroll. `orientation` picks which scrollbars are shown.
 *
 * Public API is CLOSED: no `className` / `style`. Element polymorphism stays
 * available through Base UI's `render` prop. Sizing/layout belongs in the
 * parent `Box`/`Stack`. See `.agent/rules/API_RULES.md` and `.agent/DECISIONS.md`.
 */

type ScrollAreaOrientation = "vertical" | "horizontal" | "both"

const scrollbarBase = cn(
  "flex touch-none p-px opacity-0 transition-opacity delay-150 select-none",
  "data-[hovering]:opacity-100 data-[hovering]:delay-0 data-[scrolling]:opacity-100 data-[scrolling]:delay-0",
  "data-[orientation=vertical]:w-2 data-[orientation=horizontal]:h-2 data-[orientation=horizontal]:flex-col"
)

const thumbBase = cn(
  "bg-border-strong hover:bg-muted-foreground/60 relative flex-1 rounded-full transition-colors"
)

type ScrollAreaProps = Omit<
  React.ComponentProps<typeof ScrollAreaPrimitive.Root>,
  "className" | "style"
> & {
  /** Which scrollbars to render. Defaults to `"vertical"`. */
  orientation?: ScrollAreaOrientation
}

function ScrollArea({
  orientation = "vertical",
  children,
  ...props
}: ScrollAreaProps) {
  const showVertical = orientation === "vertical" || orientation === "both"
  const showHorizontal = orientation === "horizontal" || orientation === "both"

  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn("relative size-full overflow-hidden rounded-[inherit]")}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        className={cn(
          "size-full overscroll-contain rounded-[inherit] outline-none",
          "focus-visible:ring-accent-soft focus-visible:ring-3"
        )}
      >
        <ScrollAreaPrimitive.Content data-slot="scroll-area-content">
          {children}
        </ScrollAreaPrimitive.Content>
      </ScrollAreaPrimitive.Viewport>

      {showVertical ? (
        <ScrollAreaPrimitive.Scrollbar
          data-slot="scroll-area-scrollbar"
          orientation="vertical"
          className={scrollbarBase}
        >
          <ScrollAreaPrimitive.Thumb
            data-slot="scroll-area-thumb"
            className={thumbBase}
          />
        </ScrollAreaPrimitive.Scrollbar>
      ) : null}

      {showHorizontal ? (
        <ScrollAreaPrimitive.Scrollbar
          data-slot="scroll-area-scrollbar"
          orientation="horizontal"
          className={scrollbarBase}
        >
          <ScrollAreaPrimitive.Thumb
            data-slot="scroll-area-thumb"
            className={thumbBase}
          />
        </ScrollAreaPrimitive.Scrollbar>
      ) : null}

      {orientation === "both" ? (
        <ScrollAreaPrimitive.Corner
          data-slot="scroll-area-corner"
          className={cn("bg-transparent")}
        />
      ) : null}
    </ScrollAreaPrimitive.Root>
  )
}

export { ScrollArea }
export type { ScrollAreaOrientation }
