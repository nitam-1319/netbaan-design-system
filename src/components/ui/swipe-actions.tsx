import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Swipe Actions (Mobile-specific)
 *
 * Wraps a list row so a horizontal swipe reveals trailing actions (archive,
 * delete, …) behind it — the familiar mobile row gesture. Built on pointer events
 * with snap-open / snap-closed, it composes cleanly inside a `List`.
 *
 * The actions are real, labelled `<button>`s that stay in the DOM (so they remain
 * operable and testable). Because a swipe alone isn't keyboard-accessible, always
 * provide an equivalent action elsewhere for keyboard/AT users. Public API is
 * CLOSED — no `className` / `style`; the swipe offset is an internal transform.
 * See `.agent/rules/API_RULES.md`.
 */

type SwipeAction = {
  /** Action label (accessible name + visible text). */
  label: string
  /** Optional leading icon. */
  icon?: React.ReactNode
  /** Fired when the action is activated. */
  onClick: () => void
  /** Style as destructive (critical tone). */
  destructive?: boolean
}

type SwipeActionsProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style" | "children"
> & {
  /** The row content. */
  children: React.ReactNode
  /** Trailing actions revealed on swipe. */
  actions: SwipeAction[]
  /** Width (px) of each action button. Default 76. */
  actionWidth?: number
  /** Disable the gesture. */
  disabled?: boolean
}

function SwipeActions({
  children,
  actions,
  actionWidth = 76,
  disabled = false,
  ...props
}: SwipeActionsProps) {
  const total = actions.length * actionWidth
  const [offset, setOffset] = React.useState(0)
  const startX = React.useRef<number | null>(null)
  const startOffset = React.useRef(0)
  const [dragging, setDragging] = React.useState(false)

  const clamp = (v: number) => Math.min(0, Math.max(-total, v))

  const onPointerDown = (e: React.PointerEvent) => {
    if (disabled || actions.length === 0) return
    startX.current = e.clientX
    startOffset.current = offset
    setDragging(true)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (startX.current == null) return
    setOffset(clamp(startOffset.current + (e.clientX - startX.current)))
  }
  const endDrag = () => {
    if (startX.current == null) return
    startX.current = null
    setDragging(false)
    setOffset((o) => (o < -total / 2 ? -total : 0))
  }

  const close = () => setOffset(0)

  return (
    <div
      data-slot="swipe-actions"
      data-open={offset <= -total && total > 0 ? "" : undefined}
      className={cn("relative overflow-hidden")}
      {...props}
    >
      {/* Trailing action buttons revealed behind the row. */}
      <div
        data-slot="swipe-actions-actions"
        className="absolute inset-y-0 end-0 flex"
        style={{ width: total }}
      >
        {actions.map((action, i) => (
          <button
            key={i}
            type="button"
            data-slot="swipe-action"
            aria-label={action.label}
            onClick={() => {
              action.onClick()
              close()
            }}
            className={cn(
              "flex h-full flex-col items-center justify-center gap-1 text-xs font-medium outline-none transition-[filter] focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-accent-soft [&_svg]:size-4",
              action.destructive
                ? "bg-destructive text-white hover:brightness-110"
                : "bg-surface-3 text-foreground hover:bg-border"
            )}
            style={{ width: actionWidth }}
          >
            {action.icon}
            {action.label}
          </button>
        ))}
      </div>

      {/* The swipeable row content. */}
      <div
        data-slot="swipe-actions-content"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="relative touch-pan-y bg-card"
        style={{
          transform: offset ? `translateX(${offset}px)` : undefined,
          transition: dragging ? undefined : "transform 200ms ease-out",
        }}
      >
        {children}
      </div>
    </div>
  )
}

export { SwipeActions }
export type { SwipeActionsProps, SwipeAction }
