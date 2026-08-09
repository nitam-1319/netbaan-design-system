"use client"

import * as React from "react"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Card
 *
 * A flexible content container using the AEGIS surface treatment. Composed of
 * slot parts (`Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`,
 * `CardContent`, `CardFooter`) so any layout can be assembled. Colors are
 * AEGIS-token only; the header uses a container-query grid so an optional action
 * pins to the top-right.
 *
 * Variants (matching the reference):
 *  - `default`  — resting content surface: solid card + hairline border + a
 *                 subtle neutral glass panel (`glass-panel`) — no accent bloom.
 *  - `elevated` — the deep overlay-grade `--shadow` for floating/featured cards.
 *  - `beam`     — the signature animated border: a rotating conic-gradient arc
 *                 revealed as a 1.5px frame around an inset panel (masthead beam).
 */

const cardVariants = cva("flex flex-col gap-6 py-6 text-card-foreground", {
  variants: {
    variant: {
      default: "rounded-xl border border-border bg-card glass-panel",
      elevated: "rounded-xl border border-border bg-card shadow-elevated",
      beam: "rounded-[18.5px] bg-card",
    },
  },
  defaultVariants: { variant: "default" },
})

type CardProps = Omit<React.ComponentProps<"div">, "className" | "style"> &
  VariantProps<typeof cardVariants> & {
    /**
     * Interactive (clickable) card. Matches the reference `card()`/`hover()`:
     * on hover it lifts 3px, its border lights up to the accent, and it gains
     * the elevation shadow — plus a subtle accent spotlight that follows the
     * pointer across the surface. Resting cards stay static (the reference only
     * animates its clickable nav cards).
     */
    interactive?: boolean
    /**
     * The pointer spotlight, on its own: a 260px accent bloom that follows the
     * cursor across the surface, with **no** lift, no border change, no shadow
     * change and no pointer cursor.
     *
     * This is the treatment `interactive` uses to say "this surface is alive",
     * separated from the three that say "this surface is a control". A board of
     * resting cards wants the first and must not have the second: a card that
     * rises and lights its border under the cursor reads as clickable, and a
     * reader who clicks it and gets nothing has been lied to. `PageHeaderBand`
     * already draws this distinction internally — it carries the spotlight and
     * nothing else "because the header is a landmark, not a control" — so the
     * behaviour existed in the system without being reachable on `Card`.
     *
     * Composes with every variant, `beam` included. Setting it alongside
     * `interactive` is harmless but redundant.
     *
     * The bloom paints between the card's own background and its content (a
     * negative z-index inside the card's stacking context), so nothing it passes
     * under is tinted. It parks off-surface at `-500px` and returns there on
     * `mouseleave`, so a card the pointer has left is not left glowing at the
     * last place it saw one.
     */
    spotlight?: boolean
    /**
     * Full-bleed body. Drops the card's block padding and inter-slot gap so a
     * divided `List`, a `Table` or a `ScanHistoryList` runs edge to edge, and puts
     * a hairline under the header to separate it from the first row.
     *
     * This is the "card with a header over a list" shape, which the padded default
     * cannot express: a resting card's 24px block padding leaves rows floating
     * inside a frame, and rows that carry their own inset instead end up
     * double-padded. The slots keep their own vertical rhythm in this mode, so the
     * header does not collapse.
     *
     * Not for prose or form content — those want the padded default.
     */
    flush?: boolean
  }

/**
 * The spotlight bloom itself. Parked at `-500px` so it is off-surface until the
 * first `mousemove` writes a real position, and `-z-10` so it paints above the
 * card's background but under its content — the card root isolates, so the
 * negative index cannot escape behind the surface it is meant to light.
 */
const SPOTLIGHT_LAYER =
  "pointer-events-none absolute inset-0 -z-10 rounded-[inherit] bg-[radial-gradient(260px_circle_at_var(--mx,-500px)_var(--my,-500px),color-mix(in_srgb,var(--primary)_16%,transparent),transparent_72%)]"

function Card({
  variant = "default",
  interactive = false,
  spotlight = false,
  flush = false,
  children,
  onMouseMove,
  onMouseLeave,
  ...props
}: CardProps) {
  const tracks = interactive || spotlight

  // Pointer-tracked spotlight: write the local cursor position into --mx/--my
  // (read by the radial-gradient overlay). Behaviour only — no public style API.
  const handleMouseMove = tracks
    ? (e: React.MouseEvent<HTMLDivElement>) => {
        const r = e.currentTarget.getBoundingClientRect()
        e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`)
        e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`)
        onMouseMove?.(e)
      }
    : onMouseMove

  // `interactive` fades its bloom out by opacity on hover-out; a bare spotlight
  // has no hover state to fade, so it is parked off-surface instead.
  const handleMouseLeave = spotlight
    ? (e: React.MouseEvent<HTMLDivElement>) => {
        e.currentTarget.style.setProperty("--mx", "-500px")
        e.currentTarget.style.setProperty("--my", "-500px")
        onMouseLeave?.(e)
      }
    : onMouseLeave

  if (variant === "beam") {
    return (
      <div
        data-slot="card"
        data-variant="beam"
        data-spotlight={spotlight || undefined}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative isolate overflow-hidden rounded-[20px] bg-border-strong shadow-elevated"
        {...props}
      >
        {/* Signature beam: rotating conic-gradient arc clipped to a 1.5px frame. */}
        <span
          data-slot="beam"
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
        >
          <span className="absolute top-1/2 left-1/2 aspect-square w-[140%] -translate-x-1/2 -translate-y-1/2 animate-beam-spin bg-[conic-gradient(from_0deg,transparent_0_74%,var(--primary)_85%,var(--accent-strong)_92%,transparent_100%)]" />
        </span>
        {/* The bloom belongs to the INNER panel: that is the one carrying `--card`,
            and the 1.5px frame around it is the beam's, not a surface to light.
            `--mx`/`--my` are written on the outer element and inherit down. */}
        <div
          className={cn(
            "relative m-[1.5px]",
            spotlight && "isolate",
            cardVariants({ variant })
          )}
        >
          {spotlight ? <span aria-hidden className={SPOTLIGHT_LAYER} /> : null}
          {children}
        </div>
      </div>
    )
  }

  return (
    <div
      data-slot="card"
      data-variant={variant ?? "default"}
      data-interactive={interactive || undefined}
      data-spotlight={spotlight || undefined}
      data-flush={flush || undefined}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        cardVariants({ variant }),
        // `overflow-clip` (not hidden) so the bloom is cut to the radius without
        // turning the card into a scroll container.
        spotlight && !interactive && "relative isolate overflow-clip",
        flush && [
          "gap-0 overflow-clip py-0",
          // The slots supply their own rhythm once the root stops doing it.
          "[&>[data-slot=card-header]]:border-b [&>[data-slot=card-header]]:border-border [&>[data-slot=card-header]]:pt-4 [&>[data-slot=card-header]]:pb-3.5",
          "[&>[data-slot=card-content]]:py-5",
          "[&>[data-slot=card-footer]]:border-t [&>[data-slot=card-footer]]:border-border [&>[data-slot=card-footer]]:py-3.5",
        ],
        interactive &&
          "group/card relative cursor-pointer overflow-hidden transition-[transform,border-color,box-shadow] duration-[180ms] ease-out hover:-translate-y-[3px] hover:border-primary hover:shadow-elevated"
      )}
      {...props}
    >
      {interactive ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(240px_circle_at_var(--mx,50%)_var(--my,50%),var(--accent-soft),transparent_60%)] opacity-0 transition-opacity duration-300 group-hover/card:opacity-100"
        />
      ) : spotlight ? (
        <span aria-hidden className={SPOTLIGHT_LAYER} />
      ) : null}
      {children}
    </div>
  )
}

function CardHeader({
  ...props
}: Omit<React.ComponentProps<"div">, "className" | "style">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6"
      )}
      {...props}
    />
  )
}

type CardTitleProps = Omit<
  useRender.ComponentProps<"div">,
  "className" | "style"
>

/**
 * The card's title. Renders a styled `div` by default, but is polymorphic via
 * `render` (Base UI `useRender`) so it can carry real heading semantics — e.g.
 * `render={<h2 />}` — without losing the AEGIS styling. Reach for a heading so
 * the title is exposed as `role="heading"` and page structure stays navigable.
 */
function CardTitle({ render = <div />, ...props }: CardTitleProps) {
  return useRender({
    render,
    props: {
      "data-slot": "card-title",
      className: cn("font-heading leading-none font-semibold tracking-tight"),
      ...props,
    },
  })
}

function CardDescription({
  ...props
}: Omit<React.ComponentProps<"div">, "className" | "style">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-pretty text-muted-foreground")}
      {...props}
    />
  )
}

function CardAction({
  ...props
}: Omit<React.ComponentProps<"div">, "className" | "style">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end"
      )}
      {...props}
    />
  )
}

function CardContent({
  ...props
}: Omit<React.ComponentProps<"div">, "className" | "style">) {
  return <div data-slot="card-content" className={cn("px-6")} {...props} />
}

function CardFooter({
  ...props
}: Omit<React.ComponentProps<"div">, "className" | "style">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6")}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
  cardVariants,
}
export type { CardProps, CardTitleProps }
