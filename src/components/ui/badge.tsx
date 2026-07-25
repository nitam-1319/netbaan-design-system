import * as React from "react"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Badge (Primitive tier, closed API, restored to reference)
 *
 * Matches `.agent/references/spec/Badge.dc.html`: a read-only status / count
 * marker on **two axes** — `tone` (the semantic hue: accent · neutral · success ·
 * warning · danger · info + the severity ramp low · medium · high · critical) ×
 * `variant` (soft [default] · solid · outline) — plus the sm/md/lg size scale
 * (per-size radius 6/7/8px), an optional leading status `dot` (the signature
 * `animate-pulse-dot`), a leading `icon`, and a numeric `count` clamped to
 * `max` → "99+". Every hue resolves from an AEGIS `--tone` token; nothing is
 * hard-coded. Closed API — no `className` / `style`; polymorphism via `render`
 * (Base UI `useRender`). See `.agent/rules/REFERENCE_FIDELITY.md`.
 */

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1.5 border font-semibold whitespace-nowrap leading-tight transition-colors [&_svg]:pointer-events-none [&_svg]:size-3",
  {
    variants: {
      // Fill treatment — reads the tone via the `--tone` custom property below.
      variant: {
        soft: "text-(--tone) bg-[color-mix(in_oklch,var(--tone),transparent_86%)] border-[color-mix(in_oklch,var(--tone),transparent_76%)]",
        solid: "text-white bg-(--tone) border-transparent",
        outline: "text-(--tone) bg-transparent border-(--tone)",
      },
      // Semantic hue — sets `--tone` to an AEGIS colour token (no literals).
      tone: {
        accent: "[--tone:var(--accent-strong)]",
        neutral: "[--tone:var(--muted-foreground)]",
        success: "[--tone:var(--success)]",
        warning: "[--tone:var(--warning)]",
        danger: "[--tone:var(--destructive)]",
        info: "[--tone:var(--sev-info)]",
        low: "[--tone:var(--sev-low)]",
        medium: "[--tone:var(--sev-medium)]",
        high: "[--tone:var(--sev-high)]",
        critical: "[--tone:var(--sev-critical)]",
      },
      size: {
        sm: "rounded-[6px] px-2 py-0.5 text-[11px]",
        md: "rounded-[7px] px-2.5 py-1 text-xs",
        lg: "rounded-[8px] px-3 py-[5px] text-[13px]",
      },
    },
    compoundVariants: [
      // Neutral steps off the card surface rather than a tinted wash / white fill.
      { tone: "neutral", variant: "soft", className: "bg-surface-3 border-border-strong" },
      // Reference rule: solid badges are flat tone + WHITE text, switching to
      // ink only on the neutral tone.
      { tone: "neutral", variant: "solid", className: "bg-surface-3 text-foreground" },
      // Accent solid: reference fills with the accent base + white; we use the
      // slightly deeper --primary-solid so white clears AA (≈5.3:1) in both themes.
      { tone: "accent", variant: "solid", className: "bg-primary-solid text-white" },
    ],
    defaultVariants: { tone: "neutral", variant: "soft", size: "md" },
  }
)

type BadgeProps = Omit<useRender.ComponentProps<"span">, "className" | "style"> &
  VariantProps<typeof badgeVariants> & {
    /** Leading status dot in the tone colour; carries the signature pulse. */
    dot?: boolean
    /** Upgrades the dot to a live/changing status — adds the `statusPing` ring. */
    pinging?: boolean
    /** Optional ~12px leading category icon. */
    icon?: React.ReactNode
    /** Renders the numeric count variant instead of a label. */
    count?: number
    /** Count clamp threshold before "N+". Default 99. */
    max?: number
  }

function Badge({
  variant = "soft",
  tone = "neutral",
  size = "md",
  dot = false,
  pinging = false,
  icon,
  count,
  max = 99,
  render = <span />,
  children,
  ...props
}: BadgeProps) {
  const isCount = count != null
  const countLabel = isCount ? (count > max ? `${max}+` : String(count)) : null

  return useRender({
    render,
    props: {
      "data-slot": "badge",
      className: cn(
        badgeVariants({ variant, tone, size }),
        // Count reads as a pill of mono digits with a stable minimum width.
        isCount && "min-w-5 justify-center rounded-full px-1.5 font-mono tabular-nums"
      ),
      // Expose the full value to assistive tech; a caller aria-label still wins.
      ...(isCount ? { "aria-label": String(count) } : {}),
      children: (
        <>
          {dot ? (
            <span
              data-slot="badge-dot"
              aria-hidden
              className="relative flex size-1.5 shrink-0"
            >
              {pinging ? (
                <span className="absolute inline-flex size-full animate-status-ping rounded-full bg-current" />
              ) : null}
              <span
                className={cn(
                  "relative inline-flex size-full rounded-full bg-current",
                  !pinging && "animate-pulse-dot"
                )}
              />
            </span>
          ) : null}
          {icon}
          {isCount ? countLabel : children}
        </>
      ),
      ...props,
    },
  })
}

export { Badge, badgeVariants }
export type { BadgeProps }
