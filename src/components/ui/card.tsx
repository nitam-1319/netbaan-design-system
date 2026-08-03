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
  }

function Card({
  variant = "default",
  interactive = false,
  children,
  onMouseMove,
  ...props
}: CardProps) {
  // Pointer-tracked spotlight: write the local cursor position into --mx/--my
  // (read by the radial-gradient overlay). Behaviour only — no public style API.
  const handleMouseMove = interactive
    ? (e: React.MouseEvent<HTMLDivElement>) => {
        const r = e.currentTarget.getBoundingClientRect()
        e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`)
        e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`)
        onMouseMove?.(e)
      }
    : onMouseMove

  if (variant === "beam") {
    return (
      <div
        data-slot="card"
        data-variant="beam"
        onMouseMove={onMouseMove}
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
        <div className={cn("relative m-[1.5px]", cardVariants({ variant }))}>
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
      onMouseMove={handleMouseMove}
      className={cn(
        cardVariants({ variant }),
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
