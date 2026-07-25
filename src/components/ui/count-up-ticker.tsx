import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Count-up Ticker (Motion, closed API)
 *
 * Animates a number from a start value up (or down) to a target, easing to a
 * stop — for KPI headlines, stat tiles, and dashboard counters. It respects
 * `prefers-reduced-motion` (snapping straight to the target) and, optionally,
 * only starts once it scrolls into view.
 *
 * Accessibility is built in: the animated digits are `aria-hidden` (a rapidly
 * changing number is noise to a screen reader), while a visually-hidden copy of
 * the *final* formatted value carries the meaning — so assistive tech reads the
 * number once, correctly, and never mid-count.
 *
 * Public API is CLOSED — no `className` / `style`; customise via the semantic
 * props (`value`, `from`, `duration`, `decimals`, `prefix`, `suffix`,
 * `format`, `size`). Colour is inherited (`currentColor`). See
 * `.agent/rules/API_RULES.md`.
 */

const countUpVariants = cva("tabular-nums", {
  variants: {
    size: {
      sm: "text-sm",
      md: "text-base",
      lg: "text-2xl font-semibold",
      xl: "text-4xl font-bold tracking-tight",
      inherit: "",
    },
  },
  defaultVariants: { size: "inherit" },
})

/** Deterministic grouping formatter (locale-independent) — comma thousands,
 *  dot decimals. Override with the `format` prop for locale-specific output. */
function defaultFormat(n: number, decimals: number): string {
  const fixed = n.toFixed(decimals)
  const [intPart, fracPart] = fixed.split(".")
  const sign = intPart.startsWith("-") ? "-" : ""
  const digits = sign ? intPart.slice(1) : intPart
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  return sign + grouped + (fracPart ? "." + fracPart : "")
}

type CountUpTickerProps = Omit<
  React.ComponentProps<"span">,
  "className" | "style" | "children" | "prefix"
> &
  VariantProps<typeof countUpVariants> & {
    /** Target value to count to. */
    value: number
    /** Value to count from. Default 0. */
    from?: number
    /** Animation length in ms. Default 1200. */
    duration?: number
    /** Fixed decimal places. Default 0. */
    decimals?: number
    /** Text (or node) before the number, e.g. "$". */
    prefix?: React.ReactNode
    /** Text (or node) after the number, e.g. "%" or "k". */
    suffix?: React.ReactNode
    /** Override the number formatter (receives the current value). */
    format?: (value: number) => string
    /** Only start the animation once the ticker scrolls into view. Default false. */
    startOnView?: boolean
  }

function CountUpTicker({
  value,
  from = 0,
  duration = 1200,
  decimals = 0,
  prefix,
  suffix,
  format,
  size = "inherit",
  startOnView = false,
  ...props
}: CountUpTickerProps) {
  const rootRef = React.useRef<HTMLSpanElement | null>(null)
  const [displayed, setDisplayed] = React.useState(from)
  const displayedRef = React.useRef(from)
  const [inView, setInView] = React.useState(!startOnView)

  const setValue = React.useCallback((n: number) => {
    displayedRef.current = n
    setDisplayed(n)
  }, [])

  // Gate on viewport entry when requested.
  React.useEffect(() => {
    if (!startOnView) return
    const el = rootRef.current
    if (!el || typeof IntersectionObserver === "undefined") {
      // Defer out of the effect body (avoid a synchronous state update in an
      // effect); no observer available, so just enable immediately.
      const raf = requestAnimationFrame(() => setInView(true))
      return () => cancelAnimationFrame(raf)
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true)
          io.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [startOnView])

  // Run the count animation toward `value`.
  React.useEffect(() => {
    if (!inView) return

    const prefersReduced =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (prefersReduced || duration <= 0) {
      // Snap to the target, but defer the state update out of the effect body
      // (satisfies react-hooks/set-state-in-effect).
      const snap = requestAnimationFrame(() => setValue(value))
      return () => cancelAnimationFrame(snap)
    }

    const initial = displayedRef.current
    const startTime =
      typeof performance !== "undefined" ? performance.now() : 0
    let raf = 0

    const tick = (now: number) => {
      const elapsed = now - startTime
      const t = Math.min(1, elapsed / duration)
      const eased = 1 - Math.pow(1 - t, 3) // easeOutCubic
      setValue(initial + (value - initial) * eased)
      if (t < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        setValue(value)
      }
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, duration, inView, setValue])

  const fmt = format ?? ((n: number) => defaultFormat(n, decimals))

  return (
    <span
      ref={rootRef}
      data-slot="count-up-ticker"
      className={cn(countUpVariants({ size }))}
      {...props}
    >
      <span aria-hidden="true">
        {prefix}
        {fmt(displayed)}
        {suffix}
      </span>
      <span className="sr-only">
        {prefix}
        {fmt(value)}
        {suffix}
      </span>
    </span>
  )
}

export { CountUpTicker, countUpVariants }
export type { CountUpTickerProps }
