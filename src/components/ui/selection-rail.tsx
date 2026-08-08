"use client";

import * as React from "react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * AEGIS — Selection Rail (Domain / ASM)
 *
 * The left half of a two-panel browser: a narrow, sticky column of entities you
 * pick from, with a detail panel beside it that shows what you picked. It is the
 * answer to "which one am I reading?" — the rail says which row is open, and it
 * says it three ways at once (an accent edge, a tinted row, and a marker line
 * under the label), so the selection survives a glance, a screenshot and a
 * monochrome print.
 *
 *   <SelectionRail
 *     title="Affected hosts"
 *     meta="1/4"
 *     hint="Select a host to open its leaked records"
 *     status="6 hosts loaded · page 1 of 4"
 *     items={hosts}
 *     value={selectedId}
 *     onValueChange={setSelectedId}
 *     onLoadMore={loadMore}
 *     loadMoreLabel="Load more hosts"
 *   />
 *
 * The list scrolls inside a bounded, overscroll-contained box so a long rail
 * never takes the page's scroll with it, and the "load more" control is pinned
 * under that box rather than inside it — a control that scrolls out of reach is
 * the reason accumulating lists get abandoned half-loaded.
 *
 * This is a *selector*, not navigation and not a menu: rows are real buttons
 * carrying `aria-current`, so the open row is announced as the current one.
 * Reach for `Sidebar` when the rows are destinations, `List` when nothing is
 * ever "open", and `Tabs` when there are five of something rather than five
 * hundred.
 *
 * Counts are the entity's own figure and nothing else — the rail never adds them
 * up. A total across rows would describe the pages fetched so far, not the data,
 * and it would change as the user loads more.
 *
 * Public API is CLOSED — no `className` / `style`; every label is a `ReactNode`
 * so the consuming app owns translation and number formatting. Colour is
 * token-only. See `.agent/rules/API_RULES.md`.
 */

/** The count chip's hue — the `Badge` tone ramp, passed straight through. */
type SelectionRailTone = NonNullable<React.ComponentProps<typeof Badge>["tone"]>

interface SelectionRailItem {
  /** Stable identity; matched against `value` to find the open row. */
  id: string
  /** The row's name. Rendered mono, on one truncated line. */
  label: React.ReactNode
  /**
   * The entity's own count, shown as a Badge at the inline end. A `ReactNode`
   * so the app formats and localises the digits — the rail never touches them.
   */
  count?: React.ReactNode
  /** Tone for the count Badge — escalate it from a ladder the app owns. */
  countTone?: SelectionRailTone
  /** Marker shown under the label on the open row only (e.g. "Showing records"). */
  currentLabel?: React.ReactNode
  disabled?: boolean
}

type SelectionRailProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style" | "children"
> & {
  /** The rail's heading (e.g. "Affected hosts"). */
  title: React.ReactNode
  /** Short figure beside the title — a position, not a total (e.g. "1/4"). */
  meta?: React.ReactNode
  /** One line telling the reader what picking a row does. */
  hint?: React.ReactNode
  /** What is loaded so far (e.g. "6 hosts loaded · page 1 of 4"). */
  status?: React.ReactNode
  /** The rows, in the order the API returned them. */
  items: SelectionRailItem[]
  /** The open row's `id`. */
  value?: string | null
  /** Fired with the picked row's `id`. */
  onValueChange?: (id: string) => void
  /** Show placeholder rows instead of `items` (first load). */
  loading?: boolean
  /** How many placeholder rows to draw while `loading`. Default 6. */
  loadingCount?: number
  /** Rendered inside the scroll box when there are no rows and nothing is loading. */
  empty?: React.ReactNode
  /** Show the pinned "load more" control and fire this when it is pressed. */
  onLoadMore?: () => void
  /** Label for the "load more" control. Required for it to render. */
  loadMoreLabel?: React.ReactNode
  /** Disables the "load more" control while the next page is in flight. */
  loadingMore?: boolean
  /** Stick the rail to the top of the viewport as the detail panel scrolls. Default `true`. */
  sticky?: boolean
  /** Accessible name for the list of rows. */
  "aria-label"?: string
}

function ChevronGlyph({ current }: { current: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="13"
      height="13"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={cn(
        "shrink-0 rtl:-scale-x-100",
        current ? "text-primary" : "text-muted-foreground"
      )}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

function SelectionRail({
  title,
  meta,
  hint,
  status,
  items,
  value = null,
  onValueChange,
  loading = false,
  loadingCount = 6,
  empty,
  onLoadMore,
  loadMoreLabel,
  loadingMore = false,
  sticky = true,
  "aria-label": ariaLabel,
  ...props
}: SelectionRailProps) {
  const showLoadMore = onLoadMore != null && loadMoreLabel != null

  return (
    <div
      data-slot="selection-rail"
      className={cn(
        "focus-escape rounded-xl border border-border bg-card shadow-elevation-1",
        sticky && "sticky top-4"
      )}
      {...props}
    >
      <div
        data-slot="selection-rail-head"
        className="flex flex-col gap-2.5 px-[18px] pt-4 pb-3"
      >
        <div className="flex items-baseline justify-between gap-2.5">
          <span
            data-slot="selection-rail-title"
            className="text-[13px] leading-[1.4] font-semibold text-foreground"
          >
            {title}
          </span>
          {meta != null ? (
            <span
              data-slot="selection-rail-meta"
              className="font-mono text-[11px] leading-[1.4] font-medium tabular-nums text-muted-foreground"
            >
              {meta}
            </span>
          ) : null}
        </div>
        {hint != null ? (
          <span
            data-slot="selection-rail-hint"
            className="text-[10.5px] leading-[1.45] text-muted-foreground"
          >
            {hint}
          </span>
        ) : null}
        {status != null ? (
          <span
            data-slot="selection-rail-status"
            className="font-mono text-[10px] leading-[1.45] font-medium tabular-nums text-muted-foreground"
          >
            {status}
          </span>
        ) : null}
      </div>

      <div
        data-slot="selection-rail-scroll"
        className="max-h-[420px] overflow-auto overscroll-contain"
      >
        {loading ? (
          <ul aria-hidden>
            {Array.from({ length: loadingCount }, (_, i) => (
              <li
                key={i}
                className="flex items-center justify-between gap-2.5 border-t border-border px-[18px] py-[11px]"
              >
                <Skeleton render={<div className="h-3 w-1/2 rounded-md" />} />
                <Skeleton render={<div className="h-4 w-9 rounded-md" />} />
              </li>
            ))}
          </ul>
        ) : items.length === 0 ? (
          <div data-slot="selection-rail-empty" className="border-t border-border px-[18px] py-6">
            {empty}
          </div>
        ) : (
          <ul aria-label={ariaLabel}>
            {items.map((item) => {
              const current = item.id === value
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    data-slot="selection-rail-item"
                    data-current={current || undefined}
                    aria-current={current || undefined}
                    disabled={item.disabled}
                    onClick={() => onValueChange?.(item.id)}
                    className={cn(
                      "relative grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-2.5",
                      "cursor-pointer border-t border-border px-[18px] py-[11px] text-start",
                      "transition-colors motion-enter motion-reduce:transition-none",
                      "hover:bg-accent-soft",
                      "focus-visible:focus-accent",
                      "disabled:pointer-events-none disabled:opacity-50",
                      current && "bg-accent-soft"
                    )}
                  >
                    {/* The open row's accent edge. An absolute rule rather than a
                        border so the row's own geometry never shifts on select. */}
                    {current ? (
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-y-0 start-0 w-0.5 bg-primary"
                      />
                    ) : null}
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="truncate font-mono text-xs leading-[1.4] font-medium text-foreground">
                        {item.label}
                      </span>
                      {item.currentLabel != null ? (
                        // Kept in flow when hidden so selecting a row does not
                        // reflow the rail under the pointer.
                        <span
                          className={cn(
                            "text-[10px] leading-[1.4] font-medium text-primary",
                            !current && "invisible"
                          )}
                        >
                          {item.currentLabel}
                        </span>
                      ) : null}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      {item.count != null ? (
                        <Badge variant="soft" tone={item.countTone ?? "neutral"} size="sm">
                          {item.count}
                        </Badge>
                      ) : null}
                      <ChevronGlyph current={current} />
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {showLoadMore ? (
        <button
          type="button"
          data-slot="selection-rail-load-more"
          onClick={onLoadMore}
          disabled={loadingMore}
          className={cn(
            "h-9 w-full cursor-pointer border-t border-border bg-surface",
            "text-[11.5px] leading-none font-medium text-muted-foreground",
            "transition-colors motion-enter motion-reduce:transition-none",
            "hover:text-foreground",
            "focus-visible:focus-accent",
            "disabled:pointer-events-none disabled:opacity-50"
          )}
        >
          {loadMoreLabel}
        </button>
      ) : null}
    </div>
  )
}

export { SelectionRail }
export type { SelectionRailProps, SelectionRailItem, SelectionRailTone }
