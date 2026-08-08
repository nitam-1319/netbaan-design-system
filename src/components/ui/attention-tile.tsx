"use client";

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Attention Tile (Domain / ASM)
 *
 * A count and the thing it counts, on a tone-tinted plate: "218 · Critical
 * findings open". It is the smallest unit of a needs-attention strip — a row of
 * these answers "what should I look at first?" without a chart.
 *
 *   <AttentionTile tone="critical" count={218}>Critical findings open</AttentionTile>
 *
 * How it differs from `StatTile`: that is a KPI panel — a large value, a trend
 * delta, an optional icon and sparkline, sized to sit in a metric grid. This is
 * a single dense line whose count is the badge and whose label carries the
 * meaning, tuned for stacking two or three inside one summary cell.
 *
 * Give it an `href`/`onClick` (via `render` or the native props) when the tile
 * should filter the list it summarises — a count you cannot act on is trivia.
 *
 * Public API is CLOSED — no `className` / `style`. `tone` drives `--tone` and
 * `--tone-ink`, the same badge-tone maths `Badge` uses, so a tile and a badge of
 * the same tone are the same colour. See `.agent/rules/API_RULES.md`.
 */

const tileVariants = cva(
  cn(
    "flex w-full items-center gap-2.5 rounded-[10px] border px-3 py-[9px] text-start",
    "bg-[color-mix(in_oklch,var(--tone),transparent_88%)] border-[color-mix(in_oklch,var(--tone),transparent_76%)]"
  ),
  {
    variants: {
      // Sets `--tone` (fill/border) and `--tone-ink` (accessible text), exactly
      // as `Badge` does — the two must stay interchangeable.
      tone: {
        accent: "[--tone:var(--accent-strong)] [--tone-ink:var(--accent-strong)]",
        neutral: "[--tone:var(--muted-foreground)] [--tone-ink:var(--muted-foreground)]",
        success: "[--tone:var(--success)] [--tone-ink:var(--success-ink)]",
        warning: "[--tone:var(--warning)] [--tone-ink:var(--warning-ink)]",
        danger: "[--tone:var(--destructive)] [--tone-ink:var(--destructive-ink)]",
        info: "[--tone:var(--sev-info)] [--tone-ink:var(--sev-info-ink)]",
        low: "[--tone:var(--sev-low)] [--tone-ink:var(--sev-low-ink)]",
        medium: "[--tone:var(--sev-medium)] [--tone-ink:var(--sev-medium-ink)]",
        high: "[--tone:var(--sev-high)] [--tone-ink:var(--sev-high-ink)]",
        critical: "[--tone:var(--sev-critical)] [--tone-ink:var(--sev-critical-ink)]",
      },
      interactive: {
        true: cn(
          "cursor-pointer transition-colors duration-[180ms] ease-out",
          "hover:bg-[color-mix(in_oklch,var(--tone),transparent_82%)]",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        ),
        false: "",
      },
    },
    defaultVariants: { tone: "neutral", interactive: false },
  }
)

type AttentionTileProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style"
> &
  VariantProps<typeof tileVariants> & {
    /** The figure. Rendered in the solid tone chip at the start of the tile. */
    count: React.ReactNode
    /** What the count counts. Carries the meaning — never colour alone. */
    children: React.ReactNode
  }

function AttentionTile({
  tone = "neutral",
  interactive = false,
  count,
  children,
  ...props
}: AttentionTileProps) {
  return (
    <div
      data-slot="attention-tile"
      data-tone={tone ?? "neutral"}
      className={cn(tileVariants({ tone, interactive }))}
      {...props}
    >
      <span
        data-slot="attention-tile-count"
        className={cn(
          "inline-flex h-[22px] min-w-[22px] shrink-0 items-center justify-center rounded-md px-1",
          "bg-(--tone) font-mono text-[11px] font-bold text-on-tone tabular-nums"
        )}
      >
        {count}
      </span>
      <span
        data-slot="attention-tile-label"
        className="min-w-0 text-xs leading-snug text-foreground"
      >
        {children}
      </span>
    </div>
  )
}

export { AttentionTile, tileVariants as attentionTileVariants }
export type { AttentionTileProps }
