"use client";

import * as React from "react"

/**
 * AEGIS — Reduced Motion (Accessibility, closed API)
 *
 * The single source of truth for "does this user prefer reduced motion?". It
 * wraps the `(prefers-reduced-motion: reduce)` media query in a reactive,
 * SSR-safe hook (`usePrefersReducedMotion`) and a small declarative gate
 * (`ReducedMotion`) so motion-bearing components can offer a calm alternative
 * without each re-implementing the query.
 *
 *   // Hook — branch imperative animation:
 *   const reduced = usePrefersReducedMotion()
 *   el.scrollIntoView({ behavior: reduced ? "auto" : "smooth" })
 *
 *   // Gate — swap the rendered output:
 *   <ReducedMotion whenReduced={<StaticChart />}>
 *     <AnimatedChart />
 *   </ReducedMotion>
 *
 *   // Gate — render-prop form:
 *   <ReducedMotion>{(reduced) => <Ticker animate={!reduced} />}</ReducedMotion>
 *
 * Note: honouring reduced motion in *CSS* is better expressed with Tailwind's
 * `motion-reduce:` variant or a `@media (prefers-reduced-motion: reduce)` block;
 * reach for this hook/gate when the decision has to happen in **JavaScript**
 * (choosing an animation driver, swapping whole subtrees, computing a duration).
 *
 * Public API is CLOSED: no `className` / `style`. This is a behavioural utility
 * with no visual output of its own. See `.agent/rules/API_RULES.md`.
 */

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)"

function getMatch(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia(REDUCED_MOTION_QUERY).matches
  )
}

/**
 * Reactively tracks the user's reduced-motion preference. Updates if the
 * preference changes at runtime (OS-level toggle), and is SSR-safe — it reports
 * `false` on the server and hydrates to the real value on the client.
 */
function usePrefersReducedMotion(): boolean {
  const subscribe = React.useCallback((onChange: () => void) => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return () => {}
    }
    const mql = window.matchMedia(REDUCED_MOTION_QUERY)
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return React.useSyncExternalStore(subscribe, getMatch, () => false)
}

type ReducedMotionRenderFn = (reduced: boolean) => React.ReactNode

type ReducedMotionProps = {
  /**
   * The full-motion output, or a render function `(reduced) => ReactNode` that
   * receives the current preference.
   */
  children?: React.ReactNode | ReducedMotionRenderFn
  /**
   * What to render when the user prefers reduced motion (ignored when `children`
   * is a render function). Omit to simply render `children` regardless.
   */
  whenReduced?: React.ReactNode
}

/**
 * Declarative gate: renders the calm alternative when reduced motion is
 * preferred, or hands the preference to a render function.
 */
function ReducedMotion({ children, whenReduced }: ReducedMotionProps) {
  const reduced = usePrefersReducedMotion()

  if (typeof children === "function") {
    return <>{(children as ReducedMotionRenderFn)(reduced)}</>
  }
  if (reduced && whenReduced !== undefined) {
    return <>{whenReduced}</>
  }
  return <>{children}</>
}

export { ReducedMotion, usePrefersReducedMotion }
export type { ReducedMotionProps }
