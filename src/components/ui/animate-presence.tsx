import * as React from "react"

/**
 * AEGIS — Animate Presence (Motion)
 *
 * The low-level mount/unmount orchestrator: it keeps a single child in the DOM
 * through its *leave* transition, then removes it — so an element can animate out
 * as well as in. It injects a `data-state` of `"open"` / `"closed"` onto the child
 * (and exposes the same via context) so any element can drive its enter/leave
 * purely from CSS (`data-[state=open]:… data-[state=closed]:…`), the way the
 * `Fade / Slide / Scale` presets do.
 *
 * Removal is time-driven (a `duration` matched to the child's CSS transition),
 * not `transitionend`-driven, so it is deterministic and testable in a headless
 * runner. Motion is left to the child, which should guard itself with
 * `motion-reduce:*`. Public API is CLOSED — no `className` / `style`; behaviour is
 * the semantic props. See `.agent/rules/API_RULES.md`.
 */

type PresenceState = "open" | "closed"

const AnimatePresenceContext = React.createContext<PresenceState | null>(null)

/** Read the current presence state ("open" | "closed") from an ancestor. */
function useAnimatePresence(): PresenceState | null {
  return React.useContext(AnimatePresenceContext)
}

type AnimatePresenceProps = {
  /** Whether the content should be present. Toggling to `false` plays the leave transition before unmount. */
  present: boolean
  /** A single element to keep mounted through its leave transition. */
  children: React.ReactElement
  /** How long (ms) to keep the child mounted after `present` turns false — match the child's CSS duration. Default 200. */
  duration?: number
  /** Play the enter transition on the first mount too. Default `false` (content that is present from the start appears instantly). */
  appear?: boolean
}

function AnimatePresence({
  present,
  children,
  duration = 200,
  appear = false,
}: AnimatePresenceProps) {
  const [mounted, setMounted] = React.useState(present)
  const [state, setState] = React.useState<PresenceState>(
    present && !appear ? "open" : "closed"
  )

  // All state transitions run inside animation-frame / timeout callbacks (never
  // synchronously in the effect body) so a prop change never cascades renders.
  React.useEffect(() => {
    if (present) {
      // Ensure mounted (in the "closed" start state), then flip to "open" on the
      // next frame so the enter transition actually runs.
      let openFrame = 0
      const mountFrame = requestAnimationFrame(() => {
        setMounted(true)
        openFrame = requestAnimationFrame(() => setState("open"))
      })
      return () => {
        cancelAnimationFrame(mountFrame)
        cancelAnimationFrame(openFrame)
      }
    }

    // Leave: mark closed (plays the exit), then unmount after `duration`.
    let unmountTimer: ReturnType<typeof setTimeout> | undefined
    const closeFrame = requestAnimationFrame(() => {
      setState("closed")
      unmountTimer = setTimeout(() => setMounted(false), duration)
    })
    return () => {
      cancelAnimationFrame(closeFrame)
      if (unmountTimer) clearTimeout(unmountTimer)
    }
  }, [present, duration])

  if (!mounted) return null

  const child = React.Children.only(children)
  return (
    <AnimatePresenceContext.Provider value={state}>
      {React.cloneElement(child, { "data-state": state } as Partial<
        React.ComponentProps<"div">
      >)}
    </AnimatePresenceContext.Provider>
  )
}

export { AnimatePresence, useAnimatePresence }
export type { AnimatePresenceProps, PresenceState }
