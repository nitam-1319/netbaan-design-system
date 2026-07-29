"use client";

import * as React from "react"
import { useRender } from "@base-ui/react/use-render"

/**
 * AEGIS — Focus Trap (Overlays, closed API)
 *
 * The "keep keyboard focus inside this region" primitive, for the custom modal
 * surfaces you build yourself — a hand-rolled dialog, a command panel, a
 * takeover menu — that don't already sit on a Base UI overlay. Base UI's own
 * `Dialog` / `AlertDialog` / `Drawer` trap focus internally, so reach for those
 * first; `Focus Trap` fills the gap for surfaces with no overlay primitive
 * underneath.
 *
 *   // Hook — attach to your own ref:
 *   const ref = React.useRef<HTMLDivElement>(null)
 *   useFocusTrap(ref, { enabled: open })
 *
 *   // Component — wrap the surface (polymorphic via `render`):
 *   <FocusTrap enabled={open}>
 *     <MyPanel />
 *   </FocusTrap>
 *
 * While enabled it moves focus into the region (an `initialFocus` element, else
 * the first tabbable child, else the container), wraps `Tab` / `Shift+Tab` at
 * the edges so focus never escapes, and on teardown restores focus to whatever
 * was focused before it engaged. The tabbable set is recomputed on each `Tab`,
 * so it stays correct as the surface's contents change.
 *
 * Public API is CLOSED: no `className` / `style`. The wrapper adds no visual
 * styling; element polymorphism is available through `render`. Trapping focus is
 * not the same as a full dialog — pair with `Portal` and an
 * `aria-modal`/`role="dialog"` host, or just use a Base UI overlay.
 * See `.agent/rules/API_RULES.md`.
 */

// Elements that can receive keyboard focus via Tab. `:not([tabindex="-1"])`
// excludes programmatically-focusable-only nodes; disabled/hidden are filtered
// at runtime because CSS can't see `display`/`visibility` reliably here.
const TABBABLE_SELECTOR = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
  "audio[controls]",
  "video[controls]",
  "[contenteditable]:not([contenteditable='false'])",
  "details>summary:first-of-type",
].join(",")

function isVisible(el: HTMLElement): boolean {
  // offsetParent is null for display:none subtrees; also guard visibility:hidden.
  if (el.hidden) return false
  const style = typeof window !== "undefined" ? window.getComputedStyle(el) : null
  if (style && (style.visibility === "hidden" || style.display === "none")) return false
  return el.offsetParent !== null || el.getClientRects().length > 0
}

function getTabbables(container: HTMLElement): HTMLElement[] {
  const nodes = Array.from(
    container.querySelectorAll<HTMLElement>(TABBABLE_SELECTOR)
  )
  return nodes.filter((el) => !el.hasAttribute("disabled") && isVisible(el))
}

type UseFocusTrapOptions = {
  /** Only trap while `true`. Default `true`. */
  enabled?: boolean
  /** Element to focus first when the trap engages. Defaults to the first tabbable. */
  initialFocus?: React.RefObject<HTMLElement | null>
  /** Restore focus to the previously-focused element on teardown. Default `true`. */
  restoreFocus?: boolean
}

function useFocusTrap(
  ref: React.RefObject<HTMLElement | null>,
  options: UseFocusTrapOptions = {}
): void {
  const { enabled = true, initialFocus, restoreFocus = true } = options

  React.useEffect(() => {
    const container = ref.current
    if (!enabled || !container) return

    const previouslyFocused =
      typeof document !== "undefined"
        ? (document.activeElement as HTMLElement | null)
        : null

    // Move focus inside: explicit initialFocus → first tabbable → the container
    // itself (made focusable so a childless surface still catches focus).
    function focusFirst() {
      const explicit = initialFocus?.current
      if (explicit) {
        explicit.focus()
        return
      }
      const tabbables = getTabbables(container as HTMLElement)
      if (tabbables.length > 0) {
        tabbables[0].focus()
        return
      }
      if (!container!.hasAttribute("tabindex")) {
        container!.setAttribute("tabindex", "-1")
      }
      container!.focus()
    }
    focusFirst()

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Tab") return
      const tabbables = getTabbables(container as HTMLElement)
      if (tabbables.length === 0) {
        // Nothing tabbable inside — keep focus on the container.
        event.preventDefault()
        ;(container as HTMLElement).focus()
        return
      }
      const first = tabbables[0]
      const last = tabbables[tabbables.length - 1]
      const active = document.activeElement as HTMLElement | null

      if (event.shiftKey) {
        if (active === first || !container!.contains(active)) {
          event.preventDefault()
          last.focus()
        }
      } else {
        if (active === last || !container!.contains(active)) {
          event.preventDefault()
          first.focus()
        }
      }
    }

    // If focus somehow leaves the container (e.g. a programmatic focus call),
    // pull it back to the first tabbable so the trap holds.
    function onFocusIn(event: FocusEvent) {
      const target = event.target as Node | null
      if (target && !container!.contains(target)) {
        focusFirst()
      }
    }

    document.addEventListener("keydown", onKeyDown, true)
    document.addEventListener("focusin", onFocusIn, true)

    return () => {
      document.removeEventListener("keydown", onKeyDown, true)
      document.removeEventListener("focusin", onFocusIn, true)
      if (restoreFocus && previouslyFocused && typeof previouslyFocused.focus === "function") {
        previouslyFocused.focus()
      }
    }
  }, [ref, enabled, initialFocus, restoreFocus])
}

type FocusTrapProps = Omit<
  useRender.ComponentProps<"div">,
  "className" | "style"
> & {
  /** Only trap while `true`. Default `true`. */
  enabled?: boolean
  /** Element to focus first when the trap engages. Defaults to the first tabbable. */
  initialFocus?: React.RefObject<HTMLElement | null>
  /** Restore focus to the previously-focused element on teardown. Default `true`. */
  restoreFocus?: boolean
}

function FocusTrap({
  enabled = true,
  initialFocus,
  restoreFocus = true,
  render,
  ...props
}: FocusTrapProps) {
  const ref = React.useRef<HTMLElement | null>(null)
  useFocusTrap(ref, { enabled, initialFocus, restoreFocus })

  return useRender({
    render: render ?? <div />,
    ref,
    props: {
      "data-slot": "focus-trap",
      ...props,
    },
  })
}

export { FocusTrap, useFocusTrap }
export type { FocusTrapProps, UseFocusTrapOptions }
