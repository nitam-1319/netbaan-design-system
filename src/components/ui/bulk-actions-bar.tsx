"use client";

import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Transition } from "@/components/ui/fade-slide-scale"

/**
 * AEGIS — Bulk Actions Bar (Tables & Data Grid)
 *
 * The contextual action bar that appears once rows are selected: it shows the
 * selection count, a clear affordance, and a slot for the actions that apply to
 * the whole selection (delete, export, assign…). It is presentation only — you
 * own the selection state (e.g. from a Data Table) and pass `count` + the
 * actions; the bar animates in when `count > 0` and out when it returns to zero.
 *
 * Floating (`sticky`) it pins to the bottom of the viewport, centred; inline it
 * flows in normal layout. Compose AEGIS `Button`s as the actions. Public API is
 * CLOSED — no `className` / `style`. See `.agent/rules/API_RULES.md`.
 */

type BulkActionsBarProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style" | "children"
> & {
  /** Number of selected rows. The bar is shown while this is > 0 (unless `open` is set). */
  count: number
  /** Action controls that apply to the selection — compose AEGIS `Button`s. */
  children?: React.ReactNode
  /** Clear-selection handler; when provided a "Clear" button is rendered. */
  onClear?: () => void
  /** Override the count text. Default `` `${n} selected` ``. */
  label?: (count: number) => string
  /** Clear button text. Default "Clear". */
  clearLabel?: string
  /** Force visibility, independent of `count`. Defaults to `count > 0`. */
  open?: boolean
  /** Pin to the bottom of the viewport, centred, instead of flowing inline. Default `false`. */
  sticky?: boolean
  /** Density. Default "md". */
  size?: "sm" | "md"
}

const sizePad: Record<NonNullable<BulkActionsBarProps["size"]>, string> = {
  sm: "h-11 gap-2 ps-3 pe-2 text-xs",
  md: "h-14 gap-3 ps-4 pe-3 text-sm",
}

function BulkActionsBar({
  count,
  children,
  onClear,
  label,
  clearLabel = "Clear",
  open,
  sticky = false,
  size = "md",
  ...props
}: BulkActionsBarProps) {
  const isOpen = open ?? count > 0
  const countText = label ? label(count) : `${count} selected`

  const bar = (
    <Transition open={isOpen} preset="slide-up" speed="fast">
      <div
        data-slot="bulk-actions-bar"
        role="region"
        aria-label="Bulk actions"
        className={cn(
          "pointer-events-auto inline-flex items-center rounded-xl border border-border-strong bg-card text-foreground shadow-elevated",
          sizePad[size]
        )}
        {...props}
      >
        <span aria-live="polite" className="font-semibold tabular-nums">
          {countText}
        </span>
        {onClear ? (
          <Button variant="ghost" size="sm" onClick={onClear}>
            {clearLabel}
          </Button>
        ) : null}
        {children ? (
          <>
            <span aria-hidden className="mx-1 h-6 w-px bg-border-strong" />
            <div className="flex items-center gap-2">{children}</div>
          </>
        ) : null}
      </div>
    </Transition>
  )

  if (!sticky) return bar

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      {bar}
    </div>
  )
}

export { BulkActionsBar }
export type { BulkActionsBarProps }
