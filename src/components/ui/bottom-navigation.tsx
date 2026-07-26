import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Bottom Navigation
 *
 * A mobile navigation bar pinned to the bottom edge: three to five destinations,
 * each an icon over a short label, with a clear active state. It is a navigation
 * landmark (`<nav>`) whose items carry `aria-current` — the mobile sibling of
 * `Tabs`, but for top-level app destinations rather than in-page panels.
 *
 * Items render as buttons by default, or as links when given an `href`. An
 * optional per-item badge (a count or a dot) surfaces unread state.
 *
 * Public API is CLOSED — no `className` / `style`. Configure via the semantic
 * props; colour and spacing are token-only. See `.agent/rules/API_RULES.md`.
 */

export type BottomNavigationItem = {
  /** Stable value identifying the destination. */
  value: string
  /** Short label under the icon. */
  label: React.ReactNode
  /** The destination glyph. */
  icon: React.ReactNode
  /** Renders the item as a link instead of a button. */
  href?: string
  /** Badge: a number (count) or `true` (dot). */
  badge?: number | true
  disabled?: boolean
}

const itemVariants = cva(
  "relative inline-flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1.5 text-[0.68rem] font-medium outline-none transition-colors select-none focus-visible:ring-[3px] focus-visible:ring-accent-soft disabled:pointer-events-none disabled:opacity-45 [&_svg]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      active: {
        true: "text-accent-strong",
        false: "text-muted-foreground hover:text-foreground",
      },
    },
    defaultVariants: { active: false },
  }
)

type BottomNavigationProps = Omit<
  React.ComponentProps<"nav">,
  "className" | "style" | "onChange"
> &
  VariantProps<typeof itemVariants> & {
    /** Destinations (3–5 recommended). */
    items: BottomNavigationItem[]
    /** Active destination value. */
    value?: string
    /** Fired with the chosen value (buttons only; links navigate). */
    onValueChange?: (value: string) => void
    /** When to show labels. Default `"always"`. */
    showLabels?: "always" | "active" | "never"
    /** Pin to the viewport bottom (`fixed`) or flow inline. Default `"fixed"`. */
    placement?: "fixed" | "inline"
    /** Accessible name for the nav landmark. Default "Primary". */
    "aria-label"?: string
  }

function BottomNavigation({
  items,
  value,
  onValueChange,
  showLabels = "always",
  placement = "fixed",
  "aria-label": ariaLabel = "Primary",
  ...props
}: BottomNavigationProps) {
  return (
    <nav
      data-slot="bottom-navigation"
      aria-label={ariaLabel}
      className={cn(
        "flex items-stretch gap-1 border-t border-border bg-card/95 px-2 py-1 backdrop-blur-sm supports-[padding:max(0px)]:pb-[max(0.25rem,env(safe-area-inset-bottom))]",
        placement === "fixed" && "fixed inset-x-0 bottom-0 z-40"
      )}
      {...props}
    >
      {items.map((item) => {
        const active = item.value === value
        const showLabel =
          showLabels === "always" || (showLabels === "active" && active)
        const content = (
          <>
            <span className="relative inline-flex items-center justify-center">
              {item.icon}
              {item.badge != null && (
                <span
                  data-slot="bottom-navigation-badge"
                  className={cn(
                    "absolute -end-1.5 -top-1 inline-flex items-center justify-center rounded-full bg-destructive text-white",
                    item.badge === true
                      ? "size-2 ring-2 ring-card"
                      : "h-4 min-w-4 px-1 text-[0.6rem] font-semibold tabular-nums ring-2 ring-card"
                  )}
                >
                  {item.badge === true ? (
                    <span className="sr-only">New</span>
                  ) : (
                    <>
                      {item.badge > 99 ? "99+" : item.badge}
                      <span className="sr-only"> notifications</span>
                    </>
                  )}
                </span>
              )}
            </span>
            {showLabel ? (
              <span className="max-w-full truncate">{item.label}</span>
            ) : (
              <span className="sr-only">{item.label}</span>
            )}
          </>
        )

        if (item.href != null) {
          return (
            <a
              key={item.value}
              href={item.href}
              data-slot="bottom-navigation-item"
              aria-current={active ? "page" : undefined}
              aria-disabled={item.disabled || undefined}
              className={cn(itemVariants({ active }))}
            >
              {content}
            </a>
          )
        }

        return (
          <button
            key={item.value}
            type="button"
            data-slot="bottom-navigation-item"
            aria-current={active ? "page" : undefined}
            disabled={item.disabled}
            onClick={() => onValueChange?.(item.value)}
            className={cn(itemVariants({ active }))}
          >
            {content}
          </button>
        )
      })}
    </nav>
  )
}

export { BottomNavigation, itemVariants as bottomNavigationItemVariants }
export type { BottomNavigationProps }
