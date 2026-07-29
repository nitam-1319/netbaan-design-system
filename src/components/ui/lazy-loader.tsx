"use client";

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Lazy Loader (Utilities)
 *
 * Defers rendering its children until it scrolls near the viewport, so heavy
 * content (charts, images, embeds, long lists) doesn't cost anything until it's
 * about to be seen. It reserves space with a placeholder to prevent layout shift,
 * then swaps in the real content and (by default) keeps it mounted.
 *
 * Uses an `IntersectionObserver` with a preload margin. Token-only,
 * self-contained. Public API is CLOSED — no `className` / `style`; behaviour is
 * the semantic props. All colour is token-driven. See `.agent/rules/API_RULES.md`.
 */

type LazyLoaderProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style" | "children"
> & {
  /** The content to render once visible. */
  children: React.ReactNode
  /** Placeholder shown before load. Defaults to a pulsing surface box. */
  placeholder?: React.ReactNode
  /** Reserved min-height (px) to avoid layout shift while unloaded. Default 120. */
  minHeight?: number
  /** Preload distance from the viewport. Default "200px". */
  rootMargin?: string
  /** Keep content mounted once shown. Default `true`. */
  once?: boolean
  /** Fired the first time the content becomes visible. */
  onVisible?: () => void
}

function LazyLoader({
  children,
  placeholder,
  minHeight = 120,
  rootMargin = "200px",
  once = true,
  onVisible,
  ...props
}: LazyLoaderProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [visible, setVisible] = React.useState(false)
  const firedRef = React.useRef(false)

  React.useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === "undefined") {
      // No observer support → render eagerly.
      setVisible(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true)
            if (!firedRef.current) {
              firedRef.current = true
              onVisible?.()
            }
            if (once) observer.disconnect()
          } else if (!once) {
            setVisible(false)
          }
        }
      },
      { rootMargin }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [rootMargin, once, onVisible])

  return (
    <div ref={ref} data-slot="lazy-loader" data-visible={visible || undefined} {...props}>
      {visible ? (
        children
      ) : (
        <div data-slot="lazy-loader-placeholder" style={{ minHeight }}>
          {placeholder ?? (
            <div
              aria-hidden
              className={cn(
                "size-full animate-pulse rounded-lg bg-surface-3"
              )}
              style={{ minHeight }}
            />
          )}
        </div>
      )}
    </div>
  )
}

export { LazyLoader }
export type { LazyLoaderProps }
