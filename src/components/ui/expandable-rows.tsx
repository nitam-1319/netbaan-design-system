import * as React from "react"
import { ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Expandable Rows (Tables & Data Grid)
 *
 * Adds a disclosure detail panel to a data row. `ExpandableRow` renders the
 * visible row (a leading toggle cell followed by your `TableCell`s) plus a
 * full-width detail row beneath it that expands and collapses. It composes the
 * AEGIS `Table` parts — drop it inside a `TableBody` in place of a `TableRow`.
 *
 * State is controlled (`expanded` + `onExpandedChange`) or uncontrolled
 * (`defaultExpanded`). The toggle carries `aria-expanded` and `aria-controls`
 * wired to the panel, so the disclosure is announced correctly. The panel is
 * always mounted (so `aria-controls` is valid) and collapses with a token-scaled
 * `grid-template-rows` transition; it is `aria-hidden` while closed.
 *
 * Public API is CLOSED — no `className` / `style`. Tokens only.
 * See `.agent/rules/API_RULES.md`.
 */

type ExpandableRowProps = Omit<
  React.ComponentProps<"tr">,
  "className" | "style"
> & {
  /** Content shown in the full-width detail row beneath the visible row. */
  detail: React.ReactNode
  /** Total column count the detail panel should span (include the toggle column). */
  colSpan: number
  /** Controlled expanded state. */
  expanded?: boolean
  /** Uncontrolled initial expanded state. Default `false`. */
  defaultExpanded?: boolean
  /** Called with the next expanded state when the toggle is activated. */
  onExpandedChange?: (expanded: boolean) => void
  /** Render the leading toggle cell. Default `true`. */
  showToggle?: boolean
  /** Accessible label for the toggle button. Default "Toggle row details". */
  toggleLabel?: string
  /** Disable the toggle. Default `false`. */
  disabled?: boolean
  /** Density. Default "md". */
  size?: "sm" | "md"
  /** The visible cells of the row — compose AEGIS `TableCell`s. */
  children?: React.ReactNode
}

function ExpandableRow({
  detail,
  colSpan,
  expanded,
  defaultExpanded = false,
  onExpandedChange,
  showToggle = true,
  toggleLabel = "Toggle row details",
  disabled = false,
  size = "md",
  children,
  ...props
}: ExpandableRowProps) {
  const isControlled = expanded !== undefined
  const [internal, setInternal] = React.useState(defaultExpanded)
  const open = isControlled ? expanded : internal
  const panelId = React.useId()

  const toggle = () => {
    if (disabled) return
    const next = !open
    if (!isControlled) setInternal(next)
    onExpandedChange?.(next)
  }

  return (
    <>
      <tr
        data-slot="expandable-row"
        data-state={open ? "expanded" : "collapsed"}
        className={cn(
          "border-b border-border transition-colors hover:bg-muted/50 data-[state=expanded]:bg-muted/30"
        )}
        {...props}
      >
        {showToggle ? (
          <td
            data-slot="expandable-row-toggle-cell"
            className={cn("align-middle", size === "sm" ? "ps-2 pe-0 py-1.5" : "ps-3 pe-0 py-2")}
          >
            <button
              type="button"
              data-slot="expandable-row-toggle"
              aria-expanded={open}
              aria-controls={panelId}
              aria-label={toggleLabel}
              disabled={disabled}
              onClick={toggle}
              className={cn(
                "inline-flex items-center justify-center rounded-md text-muted-foreground outline-none transition-[background-color,color] hover:bg-muted hover:text-foreground focus-visible:focus-accent disabled:pointer-events-none disabled:opacity-45",
                size === "sm" ? "size-6" : "size-7"
              )}
            >
              <ChevronRight
                aria-hidden
                className={cn(
                  "size-4 transition-transform duration-200 ease-out rtl:-scale-x-100",
                  open && "rotate-90"
                )}
              />
            </button>
          </td>
        ) : null}
        {children}
      </tr>
      <tr data-slot="expandable-row-detail-row">
        <td colSpan={colSpan} className="p-0 align-top">
          <div
            id={panelId}
            data-slot="expandable-row-detail"
            data-state={open ? "expanded" : "collapsed"}
            aria-hidden={!open}
            className={cn(
              "grid grid-rows-[0fr] transition-[grid-template-rows] duration-200 ease-out data-[state=expanded]:grid-rows-[1fr]"
            )}
          >
            <div className="overflow-hidden">
              <div
                className={cn(
                  "border-b border-border bg-muted/20 text-sm text-foreground",
                  size === "sm" ? "px-3 py-2" : "px-4 py-3"
                )}
              >
                {detail}
              </div>
            </div>
          </div>
        </td>
      </tr>
    </>
  )
}

export { ExpandableRow }
export type { ExpandableRowProps }
