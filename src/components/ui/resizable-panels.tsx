"use client";

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Resizable Panels (Layout)
 *
 * Two panels separated by a draggable divider — a split view (sidebar + content,
 * editor + preview) the user can resize by pointer or keyboard. The divider is a
 * proper `role="separator"` with `aria-valuenow/min/max`, and the split is
 * controllable or uncontrolled. Works horizontally or vertically and is
 * RTL-aware.
 *
 * Token-only; the first panel's size is written as an internal inline flex-basis
 * (an implementation detail, not a public `style` prop). Public API is CLOSED —
 * no `className` / `style`; behaviour is the semantic props. All colour is
 * token-driven. See `.agent/rules/API_RULES.md`.
 */

type ResizablePanelsProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style" | "children"
> & {
  /** The two panels (first = start, second = end). */
  children: [React.ReactNode, React.ReactNode]
  /** Split direction. Default "horizontal" (side-by-side). */
  orientation?: "horizontal" | "vertical"
  /** Controlled size of the first panel, as a percentage (0–100). */
  size?: number
  /** Initial first-panel size when uncontrolled. Default 50. */
  defaultSize?: number
  /** Fired with the new first-panel percentage on resize. */
  onSizeChange?: (size: number) => void
  /** Minimum first-panel percentage. Default 10. */
  min?: number
  /** Maximum first-panel percentage. Default 90. */
  max?: number
  /** Keyboard step in percent. Default 2. */
  step?: number
  /** Accessible name for the divider. Default "Resize panels". */
  label?: string
}

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v))
}

function ResizablePanels({
  children,
  orientation = "horizontal",
  size,
  defaultSize = 50,
  onSizeChange,
  min = 10,
  max = 90,
  step = 2,
  label = "Resize panels",
  ...props
}: ResizablePanelsProps) {
  const isControlled = size != null
  const [internal, setInternal] = React.useState(defaultSize)
  const current = clamp(isControlled ? size : internal, min, max)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const dragging = React.useRef(false)
  const isVertical = orientation === "vertical"

  const update = (pct: number) => {
    const next = clamp(pct, min, max)
    if (!isControlled) setInternal(next)
    onSizeChange?.(next)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging.current || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    let pct = isVertical
      ? ((e.clientY - rect.top) / rect.height) * 100
      : ((e.clientX - rect.left) / rect.width) * 100
    if (!isVertical) {
      const rtl =
        getComputedStyle(containerRef.current).direction === "rtl"
      if (rtl) pct = 100 - pct
    }
    update(pct)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const dec = isVertical ? "ArrowUp" : "ArrowLeft"
    const inc = isVertical ? "ArrowDown" : "ArrowRight"
    if (e.key === dec) {
      e.preventDefault()
      update(current - step)
    } else if (e.key === inc) {
      e.preventDefault()
      update(current + step)
    } else if (e.key === "Home") {
      e.preventDefault()
      update(min)
    } else if (e.key === "End") {
      e.preventDefault()
      update(max)
    }
  }

  return (
    <div
      ref={containerRef}
      data-slot="resizable-panels"
      data-orientation={orientation}
      className={cn(
        "flex h-full w-full overflow-hidden rounded-lg border border-border",
        isVertical ? "flex-col" : "flex-row"
      )}
      {...props}
    >
      <div
        data-slot="resizable-panel"
        data-panel="start"
        className="min-h-0 min-w-0 overflow-auto"
        style={{ flexBasis: `${current}%`, flexGrow: 0, flexShrink: 0 }}
      >
        {children[0]}
      </div>

      <div
        role="separator"
        data-slot="resizable-handle"
        tabIndex={0}
        aria-label={label}
        aria-orientation={isVertical ? "horizontal" : "vertical"}
        aria-valuenow={Math.round(current)}
        aria-valuemin={min}
        aria-valuemax={max}
        onPointerDown={(e) => {
          dragging.current = true
          e.currentTarget.setPointerCapture(e.pointerId)
        }}
        onPointerMove={handlePointerMove}
        onPointerUp={(e) => {
          dragging.current = false
          e.currentTarget.releasePointerCapture(e.pointerId)
        }}
        onKeyDown={handleKeyDown}
        className={cn(
          "group/handle relative flex shrink-0 items-center justify-center bg-border outline-none transition-colors",
          "hover:bg-accent-strong/40 focus-visible:bg-accent-strong/40 focus-visible:ring-3 focus-visible:ring-accent-soft",
          isVertical ? "h-1 w-full cursor-row-resize" : "w-1 cursor-col-resize"
        )}
      >
        <span
          aria-hidden
          className={cn(
            "rounded-full bg-muted-foreground/50 transition-colors group-hover/handle:bg-accent-strong",
            isVertical ? "h-0.5 w-8" : "h-8 w-0.5"
          )}
        />
      </div>

      <div
        data-slot="resizable-panel"
        data-panel="end"
        className="min-h-0 min-w-0 flex-1 overflow-auto"
      >
        {children[1]}
      </div>
    </div>
  )
}

export { ResizablePanels }
export type { ResizablePanelsProps }
