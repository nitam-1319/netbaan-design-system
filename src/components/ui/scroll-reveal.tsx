import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Scroll Reveal (Motion)
 *
 * Animates its children into view as they enter the viewport — a subtle fade plus
 * directional slide — so sections arrive with intent instead of popping in. It
 * observes visibility with an `IntersectionObserver` and toggles a token-scaled
 * transition; motion is disabled automatically under `prefers-reduced-motion`.
 *
 * Unlike `Lazy Loader` (which defers *rendering*), Scroll Reveal always renders
 * its children and animates their *appearance*. Public API is CLOSED — no
 * `className` / `style`; behaviour is the semantic props. All colour/motion is
 * token-driven. See `.agent/rules/API_RULES.md`.
 */

type ScrollRevealProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style" | "children"
> & {
  /** Content to reveal. */
  children: React.ReactNode
  /** Slide direction the content travels from. Default "up". */
  from?: "up" | "down" | "left" | "right" | "none"
  /** Transition speed. Default "default". */
  speed?: "fast" | "default" | "slow"
  /** Delay before the reveal, in ms (for staggering). Default 0. */
  delay?: number
  /** Reveal only once (stay revealed). Default `true`. */
  once?: boolean
  /** Viewport trigger margin. Default "0px 0px -10% 0px". */
  rootMargin?: string
}

const hiddenTransform: Record<NonNullable<ScrollRevealProps["from"]>, string> = {
  up: "translate-y-4",
  down: "-translate-y-4",
  left: "translate-x-4",
  right: "-translate-x-4",
  none: "",
}

const speedClass: Record<NonNullable<ScrollRevealProps["speed"]>, string> = {
  fast: "duration-300",
  default: "duration-500",
  slow: "duration-700",
}

function ScrollReveal({
  children,
  from = "up",
  speed = "default",
  delay = 0,
  once = true,
  rootMargin = "0px 0px -10% 0px",
  ...props
}: ScrollRevealProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [revealed, setRevealed] = React.useState(false)

  React.useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === "undefined") {
      setRevealed(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true)
            if (once) observer.disconnect()
          } else if (!once) {
            setRevealed(false)
          }
        }
      },
      { rootMargin, threshold: 0.05 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [rootMargin, once])

  return (
    <div
      ref={ref}
      data-slot="scroll-reveal"
      data-revealed={revealed || undefined}
      style={{ transitionDelay: delay ? `${delay}ms` : undefined }}
      className={cn(
        "transition-[opacity,transform] ease-out will-change-[opacity,transform] motion-reduce:transition-none motion-reduce:transform-none",
        speedClass[speed],
        revealed
          ? "translate-x-0 translate-y-0 opacity-100"
          : cn("opacity-0", hiddenTransform[from])
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { ScrollReveal }
export type { ScrollRevealProps }
