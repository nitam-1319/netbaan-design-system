"use client";

import * as React from "react"
import { createPortal } from "react-dom"

/**
 * AEGIS — Portal (Overlays, closed API)
 *
 * The "render this subtree somewhere else in the DOM" primitive, for the custom
 * overlays you build yourself — a bespoke tooltip, a floating panel, a banner
 * that must escape an `overflow:hidden` / `transform` ancestor. Base UI's own
 * `Dialog` / `Popover` / `Menu` / `Tooltip` (and the AEGIS components on them)
 * portal internally, so reach for those first; `Portal` fills the gap for
 * surfaces with no overlay primitive underneath.
 *
 *   // Teleport into <body> (default):
 *   <Portal>
 *     <MyFloatingPanel />
 *   </Portal>
 *
 *   // Teleport into a specific container (element or a lazy getter):
 *   <Portal container={() => document.getElementById("overlay-root")}>
 *     <Toast />
 *   </Portal>
 *
 * Render is deferred until after mount, so the first client paint matches the
 * server (no hydration mismatch) — the portal only attaches once `document`
 * exists. `disabled` renders the children inline in place instead, which is
 * handy for tests or when a parent already provides a portal boundary.
 *
 * Public API is CLOSED: no `className` / `style`. `Portal` has no host element
 * of its own — it teleports its children unchanged — so it adds no wrapper and
 * no styling. See `.agent/rules/API_RULES.md`.
 */

type PortalContainer =
  | Element
  | DocumentFragment
  | (() => Element | DocumentFragment | null | undefined)
  | null

type PortalProps = {
  /** The subtree to teleport. */
  children: React.ReactNode
  /**
   * Where to mount. An element, a document fragment, or a lazy getter returning
   * one (evaluated on the client after mount). Defaults to `document.body`.
   */
  container?: PortalContainer
  /** Render the children inline in place instead of teleporting. Default `false`. */
  disabled?: boolean
}

/**
 * Resolve a container value to a live DOM node, or `null` if it is not yet
 * available. A function getter lets callers point at an element that mounts
 * later without evaluating it during render on the server.
 */
function resolveContainer(container: PortalContainer): Element | DocumentFragment | null {
  const target = typeof container === "function" ? container() : container
  if (target) return target
  return typeof document !== "undefined" ? document.body : null
}

const noopSubscribe = () => () => {}

/**
 * `false` on the server and during the first client render, `true` thereafter.
 * `useSyncExternalStore` reconciles the two snapshots without a hydration
 * warning and without setting state inside an effect — so the portal only
 * attaches once `document` exists.
 */
function useIsClient(): boolean {
  return React.useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  )
}

function Portal({ children, container, disabled = false }: PortalProps) {
  // Defer the portal to the client: on the server and on the first client
  // render there is nothing to portal into, so both agree on `null`.
  const mounted = useIsClient()

  if (disabled) {
    return <>{children}</>
  }
  if (!mounted) {
    return null
  }

  const node = resolveContainer(container ?? null)
  if (!node) {
    return null
  }

  return createPortal(children, node)
}

export { Portal }
export type { PortalProps, PortalContainer }
