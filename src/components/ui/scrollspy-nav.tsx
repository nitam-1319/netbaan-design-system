"use client";

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Scrollspy Nav (Navigation)
 *
 * An in-page navigation list that highlights the section currently in view and
 * scrolls to a section when its link is clicked — the "on this page" rail beside
 * long documents. It observes each target section with an `IntersectionObserver`
 * and marks the active link with `aria-current`.
 *
 * Token-only, self-contained (no Base UI primitive). Active state is
 * controllable or derived from scroll. Public API is CLOSED — no `className` /
 * `style`; behaviour is the semantic props. All colour is token-driven.
 * See `.agent/rules/API_RULES.md`.
 */

type ScrollspyItem = {
  /** The target section's element id. */
  id: string
  /** Link label. */
  label: React.ReactNode
  /**
   * Leading glyph. Smuggling one in through `label` works, but the label then
   * also owns the gap and the icon cannot be tinted apart from the text — an
   * inactive row wants a dimmer icon than its label, and an active one the
   * reverse.
   */
  icon?: React.ReactNode
}

type ScrollspyNavProps = Omit<
  React.ComponentProps<"nav">,
  "className" | "style" | "children"
> & {
  /** The sections to track (in document order). */
  items: ScrollspyItem[]
  /** Controlled active section id. */
  activeId?: string
  /** Fired when the active section changes. */
  onActiveChange?: (id: string) => void
  /** Layout direction. Default "vertical". */
  orientation?: "vertical" | "horizontal"
  /** Accessible name for the nav. Default "On this page". */
  label?: string
  /**
   * How the current item is marked. `rail` (default) is the tinted start
   * border. `pill` is a plain rounded plate on `--surface-2` with foreground
   * ink and no border — for a nav that is itself inside a card, where a second
   * rail beside the card's edge reads as a stray rule.
   */
  activeVariant?: "rail" | "pill"
  /** Row density. `compact` is 9px/12px at 13px. Default `default`. */
  density?: "default" | "compact"
  /**
   * Let a horizontal nav wrap to a second line. Default `true`. `false` keeps
   * one line and scrolls — the shape a narrow strip wants, and one the caller
   * cannot produce from a wrapper.
   */
  wrap?: boolean
}

function ScrollspyNav({
  items,
  activeId,
  activeVariant = "rail",
  density = "default",
  wrap = true,
  onActiveChange,
  orientation = "vertical",
  label = "On this page",
  ...props
}: ScrollspyNavProps) {
  const isControlled = activeId != null
  const [internalActive, setInternalActive] = React.useState<string | undefined>(
    items[0]?.id
  )
  const active = isControlled ? activeId : internalActive

  const setActive = React.useCallback(
    (id: string) => {
      if (!isControlled) setInternalActive(id)
      onActiveChange?.(id)
    },
    [isControlled, onActiveChange]
  )

  React.useEffect(() => {
    if (typeof document === "undefined") return
    const elements = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el != null)
    if (elements.length === 0) return

    const visible = new Set<string>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id)
          else visible.delete(entry.target.id)
        }
        // Choose the first item (document order) currently visible.
        const firstVisible = items.find((i) => visible.has(i.id))
        if (firstVisible) setActive(firstVisible.id)
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    )
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [items, setActive])

  const handleClick = (e: React.MouseEvent, id: string) => {
    const el = typeof document !== "undefined" ? document.getElementById(id) : null
    if (el) {
      e.preventDefault()
      el.scrollIntoView({ behavior: "smooth", block: "start" })
      setActive(id)
    }
  }

  return (
    <nav
      data-slot="scrollspy-nav"
      data-orientation={orientation}
      aria-label={label}
      {...props}
    >
      <ul
        className={cn(
          "flex gap-1",
          orientation === "vertical"
            ? "flex-col"
            : wrap
              ? "flex-row flex-wrap"
              : "flex-row flex-nowrap overflow-x-auto"
        )}
      >
        {items.map((item) => {
          const isActive = item.id === active
          return (
            <li key={item.id} data-slot="scrollspy-nav-item">
              <a
                href={`#${item.id}`}
                aria-current={isActive ? "location" : undefined}
                data-active={isActive || undefined}
                onClick={(e) => handleClick(e, item.id)}
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap outline-none transition-colors",
                  density === "compact"
                    ? "rounded-lg px-3 py-[9px] text-[13px]"
                    : "rounded-md px-3 py-1.5 text-sm",
                  "hover:bg-muted focus-visible:ring-3 focus-visible:ring-accent-soft",
                  activeVariant === "rail" &&
                    orientation === "vertical" &&
                    "border-s-2 rounded-s-none ps-3",
                  isActive
                    ? activeVariant === "pill"
                      ? "bg-surface-2 font-semibold text-foreground"
                      : orientation === "vertical"
                        ? "border-primary bg-accent-soft font-medium text-accent-strong"
                        : "bg-accent-soft font-medium text-accent-strong"
                    : cn(
                        "text-muted-foreground hover:text-foreground",
                        activeVariant === "rail" &&
                          orientation === "vertical" &&
                          "border-transparent"
                      )
                )}
              >
                {item.icon ? (
                  <span
                    data-slot="scrollspy-nav-icon"
                    aria-hidden
                    className={cn(
                      "flex shrink-0 items-center [&_svg]:size-4",
                      isActive ? "text-foreground" : "text-muted-foreground/70"
                    )}
                  >
                    {item.icon}
                  </span>
                ) : null}
                <span className="min-w-0 truncate">{item.label}</span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export { ScrollspyNav }
export type { ScrollspyNavProps, ScrollspyItem }
