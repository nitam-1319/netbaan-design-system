import * as React from "react"
import { ArrowDown, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Pull to Refresh (Mobile-specific)
 *
 * Wraps a scrollable region so a downward pull from the top reveals a refresh
 * affordance and, when released past a threshold, runs `onRefresh` and shows a
 * spinner until it resolves. Built on pointer events (touch + mouse), with a
 * resistance curve and a rotating chevron that flips at the release point.
 *
 * Token-only, self-contained. The status is text ("Pull…", "Release…",
 * "Refreshing…"), never colour alone. Public API is CLOSED — no `className` /
 * `style`; the pull offset is an internal transform. See
 * `.agent/rules/API_RULES.md`.
 */

type PullToRefreshProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style" | "children" | "onScroll"
> & {
  /** The scrollable content. */
  children: React.ReactNode
  /** Called on release past the threshold; awaited to end the refresh. */
  onRefresh: () => void | Promise<void>
  /** Pull distance (px) required to trigger a refresh. Default 72. */
  threshold?: number
  /** Disable the gesture. */
  disabled?: boolean
  /** Label while pulling below threshold. Default "Pull to refresh". */
  pullLabel?: string
  /** Label once past threshold. Default "Release to refresh". */
  releaseLabel?: string
  /** Label while refreshing. Default "Refreshing…". */
  refreshingLabel?: string
}

function PullToRefresh({
  children,
  onRefresh,
  threshold = 72,
  disabled = false,
  pullLabel = "Pull to refresh",
  releaseLabel = "Release to refresh",
  refreshingLabel = "Refreshing…",
  ...props
}: PullToRefreshProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const startY = React.useRef<number | null>(null)
  const [pull, setPull] = React.useState(0)
  const [refreshing, setRefreshing] = React.useState(false)

  const maxPull = threshold * 1.6
  const ready = pull >= threshold
  const offset = refreshing ? threshold : pull

  const status = refreshing ? refreshingLabel : ready ? releaseLabel : pullLabel

  const onPointerDown = (e: React.PointerEvent) => {
    if (disabled || refreshing) return
    const el = scrollRef.current
    if (el && el.scrollTop <= 0) startY.current = e.clientY
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (startY.current == null || refreshing) return
    const delta = e.clientY - startY.current
    if (delta <= 0) {
      setPull(0)
      return
    }
    // Resistance: the further you pull, the slower it moves.
    setPull(Math.min(maxPull, delta * 0.5))
  }

  const endPull = () => {
    if (startY.current == null) return
    startY.current = null
    if (pull >= threshold && !refreshing) {
      setRefreshing(true)
      Promise.resolve(onRefresh()).finally(() => {
        setRefreshing(false)
        setPull(0)
      })
    } else {
      setPull(0)
    }
  }

  return (
    <div data-slot="pull-to-refresh" className={cn("relative overflow-hidden")} {...props}>
      <div
        data-slot="pull-to-refresh-indicator"
        aria-hidden={offset === 0}
        className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground"
        style={{ height: offset, opacity: offset > 0 ? 1 : 0 }}
      >
        {refreshing ? (
          <Loader2 aria-hidden className="size-4 animate-spin" />
        ) : (
          <ArrowDown
            aria-hidden
            className={cn(
              "size-4 transition-transform",
              ready && "rotate-180"
            )}
          />
        )}
        <span role="status">{status}</span>
      </div>

      <div
        ref={scrollRef}
        data-slot="pull-to-refresh-scroll"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPull}
        onPointerCancel={endPull}
        className="h-full overflow-auto overscroll-contain"
        style={{
          transform: offset ? `translateY(${offset}px)` : undefined,
          transition: startY.current == null ? "transform 200ms ease-out" : undefined,
        }}
      >
        {children}
      </div>
    </div>
  )
}

export { PullToRefresh }
export type { PullToRefreshProps }
