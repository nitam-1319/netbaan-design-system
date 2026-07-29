"use client";

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

/**
 * AEGIS — Carousel
 *
 * A horizontally-scrolling, snap-aligned slideshow: hero banners, product
 * galleries, onboarding highlights, "what's new" rows. Built on native CSS
 * scroll-snap (no external engine), so momentum scroll, touch, and trackpad
 * gestures work for free; `CarouselPrevious` / `CarouselNext` / `CarouselDots`
 * drive the same viewport programmatically and stay in sync with manual scroll.
 *
 * Compose it:
 *   <Carousel label="Featured">
 *     <CarouselContent>
 *       <CarouselItem>…</CarouselItem>
 *       <CarouselItem>…</CarouselItem>
 *     </CarouselContent>
 *     <CarouselPrevious /> <CarouselNext />
 *     <CarouselDots />
 *   </Carousel>
 *
 * The public API is CLOSED — no `className` / `style`; behaviour is driven by
 * semantic props (`loop`, `autoPlay`, `interval`, `label`). Colour, radius, and
 * motion come from tokens. One slide is shown per view; multi-per-view and a
 * vertical axis are deferred (see the guidelines + `.agent/DECISIONS.md`).
 * See `.agent/rules/API_RULES.md`.
 */

/* ---------------------------------------------------------------- utils -- */

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
}

/* -------------------------------------------------------------- context -- */

type CarouselState = {
  activeIndex: number
  count: number
  canPrev: boolean
  canNext: boolean
}

type CarouselContextValue = {
  viewportRef: React.RefObject<HTMLDivElement | null>
  loop: boolean
  autoPlay: boolean
  activeIndex: number
  count: number
  canPrev: boolean
  canNext: boolean
  scrollTo: (index: number) => void
  scrollPrev: () => void
  scrollNext: () => void
  setPaused: (paused: boolean) => void
}

const CarouselContext = React.createContext<CarouselContextValue | null>(null)

function useCarousel(): CarouselContextValue {
  const ctx = React.useContext(CarouselContext)
  if (!ctx) {
    throw new Error("Carousel parts must be used within <Carousel>.")
  }
  return ctx
}

/* ----------------------------------------------------------------- root -- */

type CarouselProps = Omit<React.ComponentProps<"section">, "className" | "style"> & {
  /** Accessible name for the carousel region (announced with its role). */
  label?: string
  /** Wrap from the last slide back to the first (and vice-versa). */
  loop?: boolean
  /** Advance automatically. Pauses on hover / focus and honours reduced-motion. */
  autoPlay?: boolean
  /** Autoplay cadence in milliseconds. */
  interval?: number
}

function Carousel({
  label = "Carousel",
  loop = false,
  autoPlay = false,
  interval = 5000,
  children,
  ...props
}: CarouselProps) {
  const viewportRef = React.useRef<HTMLDivElement | null>(null)
  const [state, setState] = React.useState<CarouselState>({
    activeIndex: 0,
    count: 0,
    canPrev: false,
    canNext: false,
  })
  const stateRef = React.useRef(state)
  const [paused, setPaused] = React.useState(false)

  // Read the viewport and recompute which slide is centred + edge affordances.
  // Called from scroll/resize/mutation handlers (event context — safe to set
  // state) and from a deferred rAF in the mount effect.
  const update = React.useCallback(() => {
    const el = viewportRef.current
    if (!el) return
    const items = Array.from(
      el.querySelectorAll<HTMLElement>("[data-slot=carousel-item]")
    )
    const n = items.length
    const rect = el.getBoundingClientRect()
    const center = rect.left + rect.width / 2

    let best = 0
    let bestDist = Number.POSITIVE_INFINITY
    items.forEach((it, idx) => {
      const r = it.getBoundingClientRect()
      const c = r.left + r.width / 2
      const d = Math.abs(c - center)
      if (d < bestDist) {
        bestDist = d
        best = idx
      }
    })

    const maxScroll = el.scrollWidth - el.clientWidth
    const pos = Math.abs(el.scrollLeft) // abs() keeps RTL (negative scrollLeft) correct
    const next: CarouselState = {
      activeIndex: n > 0 ? best : 0,
      count: n,
      canPrev: loop ? n > 1 : pos > 1,
      canNext: loop ? n > 1 : pos < maxScroll - 1,
    }
    stateRef.current = next
    setState(next)
  }, [loop])

  const scrollTo = React.useCallback(
    (index: number) => {
      const el = viewportRef.current
      if (!el) return
      const items = el.querySelectorAll<HTMLElement>("[data-slot=carousel-item]")
      const n = items.length
      if (n === 0) return
      const i = loop
        ? ((index % n) + n) % n
        : Math.max(0, Math.min(n - 1, index))
      const target = items[i]
      if (!target) return
      target.scrollIntoView({
        behavior: prefersReducedMotion() ? "auto" : "smooth",
        block: "nearest",
        inline: "start",
      })
    },
    [loop]
  )

  const scrollPrev = React.useCallback(
    () => scrollTo(stateRef.current.activeIndex - 1),
    [scrollTo]
  )
  const scrollNext = React.useCallback(
    () => scrollTo(stateRef.current.activeIndex + 1),
    [scrollTo]
  )

  // Track the viewport: initial measure (deferred out of the effect body),
  // then live updates on scroll, resize, and slide add/remove.
  React.useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const raf = requestAnimationFrame(update)
    el.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    const mo = new MutationObserver(update)
    mo.observe(el, { childList: true, subtree: true })
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
      mo.disconnect()
    }
  }, [update])

  // Autoplay: only while enabled, not paused, motion allowed, >1 slide.
  React.useEffect(() => {
    if (!autoPlay || paused) return
    if (prefersReducedMotion()) return
    if (state.count <= 1) return
    const id = window.setInterval(scrollNext, Math.max(1000, interval))
    return () => window.clearInterval(id)
  }, [autoPlay, paused, interval, state.count, scrollNext])

  const value = React.useMemo<CarouselContextValue>(
    () => ({
      viewportRef,
      loop,
      autoPlay,
      activeIndex: state.activeIndex,
      count: state.count,
      canPrev: state.canPrev,
      canNext: state.canNext,
      scrollTo,
      scrollPrev,
      scrollNext,
      setPaused,
    }),
    [loop, autoPlay, state, scrollTo, scrollPrev, scrollNext]
  )

  return (
    <CarouselContext.Provider value={value}>
      <section
        data-slot="carousel"
        role="region"
        aria-roledescription="carousel"
        aria-label={label}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
            setPaused(false)
          }
        }}
        className={cn("relative flex flex-col gap-4")}
        {...props}
      >
        {children}
      </section>
    </CarouselContext.Provider>
  )
}

/* -------------------------------------------------------------- content -- */

type CarouselContentProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style"
>

function CarouselContent({ children, ...props }: CarouselContentProps) {
  const { viewportRef, autoPlay, scrollPrev, scrollNext, scrollTo, count } =
    useCarousel()

  const items = React.Children.toArray(children)
  const total = items.length

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const rtl =
      typeof window !== "undefined" && viewportRef.current
        ? window.getComputedStyle(viewportRef.current).direction === "rtl"
        : false
    switch (e.key) {
      case "ArrowRight":
        e.preventDefault()
        if (rtl) scrollPrev()
        else scrollNext()
        break
      case "ArrowLeft":
        e.preventDefault()
        if (rtl) scrollNext()
        else scrollPrev()
        break
      case "Home":
        e.preventDefault()
        scrollTo(0)
        break
      case "End":
        e.preventDefault()
        scrollTo(count - 1)
        break
      default:
        break
    }
  }

  return (
    <div
      ref={viewportRef}
      data-slot="carousel-viewport"
      role="group"
      aria-roledescription="carousel content"
      aria-live={autoPlay ? "off" : "polite"}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className={cn(
        "relative snap-x snap-mandatory overflow-x-auto scroll-smooth rounded-[var(--radius-lg)] outline-none",
        "focus-visible:ring-[3px] focus-visible:ring-accent-soft",
        // Hide the native scrollbar — the dots/buttons are the affordance.
        "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      )}
      {...props}
    >
      <div data-slot="carousel-track" className={cn("flex")}>
        {items.map((child, i) =>
          React.isValidElement(child)
            ? React.cloneElement(
                child as React.ReactElement<CarouselItemProps>,
                { index: i, total }
              )
            : child
        )}
      </div>
    </div>
  )
}

/* ----------------------------------------------------------------- item -- */

type CarouselItemProps = Omit<React.ComponentProps<"div">, "className" | "style"> & {
  /** Overrides the auto "{n} of {total}" slide label. */
  label?: string
  /** Injected by CarouselContent — do not set manually. */
  index?: number
  /** Injected by CarouselContent — do not set manually. */
  total?: number
}

function CarouselItem({ label, index, total, children, ...props }: CarouselItemProps) {
  const auto =
    index != null && total != null ? `${index + 1} of ${total}` : undefined
  return (
    <div
      data-slot="carousel-item"
      role="group"
      aria-roledescription="slide"
      aria-label={label ?? auto}
      className={cn("min-w-0 shrink-0 grow-0 basis-full snap-start")}
      {...props}
    >
      {children}
    </div>
  )
}

/* ------------------------------------------------------- prev / next -- */

type CarouselNavProps = Omit<
  React.ComponentProps<typeof Button>,
  "children" | "size" | "render"
>

function CarouselPrevious({
  variant = "secondary",
  disabled,
  ...props
}: CarouselNavProps) {
  const { scrollPrev, canPrev } = useCarousel()
  return (
    <Button
      data-slot="carousel-previous"
      variant={variant}
      size="icon"
      aria-label="Previous slide"
      disabled={disabled ?? !canPrev}
      onClick={scrollPrev}
      {...props}
    >
      <span className="inline-flex rtl:rotate-180">
        <ChevronLeft />
      </span>
    </Button>
  )
}

function CarouselNext({
  variant = "secondary",
  disabled,
  ...props
}: CarouselNavProps) {
  const { scrollNext, canNext } = useCarousel()
  return (
    <Button
      data-slot="carousel-next"
      variant={variant}
      size="icon"
      aria-label="Next slide"
      disabled={disabled ?? !canNext}
      onClick={scrollNext}
      {...props}
    >
      <span className="inline-flex rtl:rotate-180">
        <ChevronRight />
      </span>
    </Button>
  )
}

/* ----------------------------------------------------------------- dots -- */

type CarouselDotsProps = Omit<React.ComponentProps<"div">, "className" | "style">

function CarouselDots(props: CarouselDotsProps) {
  const { count, activeIndex, scrollTo } = useCarousel()
  if (count <= 0) return null
  return (
    <div
      data-slot="carousel-dots"
      role="group"
      aria-label="Choose slide to display"
      className={cn("flex items-center justify-center gap-2")}
      {...props}
    >
      {Array.from({ length: count }, (_, i) => {
        const active = i === activeIndex
        return (
          <button
            key={i}
            type="button"
            data-slot="carousel-dot"
            data-active={active || undefined}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={active ? "true" : undefined}
            onClick={() => scrollTo(i)}
            className={cn(
              "h-2 rounded-full outline-none transition-[width,background-color] duration-150",
              "focus-visible:ring-[3px] focus-visible:ring-accent-soft",
              active
                ? "bg-primary w-5"
                : "bg-border-strong hover:bg-muted-foreground w-2"
            )}
          />
        )
      })}
    </div>
  )
}

export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselDots,
}
export type { CarouselProps, CarouselItemProps }
