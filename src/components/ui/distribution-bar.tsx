"use client";

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Distribution Bar
 *
 * A proportional part-of-whole "runway" whose parts are CONTROLS: one segment
 * per bucket, sized by its count, over a key of tiles — and both halves toggle
 * the same filter. It is the summary band that sits above a table and says
 * "here is how this population splits, and here is how you narrow it".
 *
 * Nothing in the catalog covers it. `GroupedStackedBar` is an axed chart with
 * gridlines and a tooltip, far too heavy above a table and with no per-segment
 * activation. `Progress` carries one value. `SeverityLegend` is the fixed
 * five-rung scale, not proportional and not interactive. `TrendBars` is one bar
 * per period, not parts of one total.
 *
 *   <DistributionBar
 *     label="Certificates by time to expiry"
 *     segments={[{ id: "expired", label: "Expired", count: 4, tone: "critical" }]}
 *     selected={selected}
 *     onToggle={setSelected}
 *   />
 *
 * ACCESSIBILITY — the categorical palette (`--cat-1..6`) is designed for FILLS,
 * and at least one slot fails AA as small bold text on `--card`. Because slot
 * assignment here is frequency-driven, a per-colour exception cannot work, so
 * the component lifts every label's ink toward `--foreground` and keeps the raw
 * hue for the swatch and the segment only. Selection is never carried by colour
 * alone: a selected tile also takes a ring and `aria-pressed`.
 *
 * Public API is CLOSED — no `className` / `style`. See `.agent/rules/API_RULES.md`.
 */

/** Tones a segment may wear. Categorical slots plus the severity ramp. */
type DistributionTone =
  | "cat-1"
  | "cat-2"
  | "cat-3"
  | "cat-4"
  | "cat-5"
  | "cat-6"
  | "critical"
  | "high"
  | "medium"
  | "low"
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "neutral"

const TONE_VAR: Record<DistributionTone, string> = {
  "cat-1": "--cat-1",
  "cat-2": "--cat-2",
  "cat-3": "--cat-3",
  "cat-4": "--cat-4",
  "cat-5": "--cat-5",
  "cat-6": "--cat-6",
  critical: "--sev-critical",
  high: "--sev-high",
  medium: "--sev-medium",
  low: "--sev-low",
  info: "--sev-info",
  success: "--success",
  warning: "--warning",
  danger: "--destructive",
  neutral: "--muted-foreground",
}

/** Auto-assigned tones, in order, when a segment does not name one. */
const AUTO_TONES: DistributionTone[] = [
  "cat-1",
  "cat-2",
  "cat-3",
  "cat-4",
  "cat-5",
  "cat-6",
]

type DistributionSegment = {
  /** Stable id — what `selected` holds and `onToggle` reports. */
  id: string
  /** Visible name in the key. */
  label: React.ReactNode
  /** Size of this part. Negatives are clamped to zero. */
  count: number
  /** Colour. Omit to auto-assign from the categorical palette by order. */
  tone?: DistributionTone
  /** Not selectable — the tile renders as plain text rather than a button. */
  disabled?: boolean
}

const rootVariants = cva("flex w-full min-w-0 flex-col", {
  variants: {
    /** How much room the band takes. */
    density: {
      default: "gap-3",
      compact: "gap-2",
    },
  },
  defaultVariants: { density: "default" },
})

type DistributionBarProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style" | "children"
> &
  VariantProps<typeof rootVariants> & {
    /** Accessible name for the band (e.g. "Certificates by time to expiry"). Required. */
    label: string
    /** The parts, in the order they should be drawn and listed. */
    segments: DistributionSegment[]
    /** Ids of the currently selected segments. */
    selected?: string[]
    /** Fires with the toggled segment's id. Omit for a read-only band. */
    onToggle?: (id: string) => void
    /**
     * `stat` (default) puts the figure UNDER the label, the shape a summary
     * band wants. `inline` puts it at the inline end of a single row, for a
     * band squeezed beside other content.
     */
    legend?: "stat" | "inline"
    /** Height of the runway in px. Default `14`. */
    barHeight?: number
    /** Format counts. Default `toLocaleString()`. */
    formatCount?: (value: number) => string
  }

function DistributionBar({
  label,
  segments,
  selected,
  onToggle,
  legend = "stat",
  density = "default",
  barHeight = 14,
  formatCount = (value) => value.toLocaleString(),
  ...props
}: DistributionBarProps) {
  const parts = segments.map((s, i) => {
    const tone = s.tone ?? AUTO_TONES[i % AUTO_TONES.length]
    return {
      ...s,
      tone,
      count: Number.isFinite(s.count) ? Math.max(0, s.count) : 0,
      // The raw hue, for fills only.
      fill: `var(${TONE_VAR[tone]})`,
      // Label ink lifted toward the foreground — see the note above: the
      // categorical palette is a fill palette and does not clear AA as text.
      ink: `color-mix(in oklch, var(${TONE_VAR[tone]}), var(--foreground) 55%)`,
    }
  })

  const total = parts.reduce((sum, p) => sum + p.count, 0)
  const isSelected = (id: string) => selected?.includes(id) ?? false
  const interactive = onToggle != null

  return (
    <div
      data-slot="distribution-bar"
      role="group"
      aria-label={label}
      className={cn(rootVariants({ density }))}
      {...props}
    >
      <div
        data-slot="distribution-bar-runway"
        // The runway height is a caller-chosen continuous value; the rest of
        // the band is utility-driven.
        style={{ height: barHeight }}
        className={cn(
          "flex w-full overflow-hidden rounded-full bg-surface-2",
          "gap-[2px]"
        )}
      >
        {parts.map((p) => {
          if (p.count === 0) return null
          const inner = (
            <span
              aria-hidden
              className="block size-full"
              // A segment's width IS the data; `flex-grow` by count with a
              // 3px floor so a one-item bucket stays clickable.
              style={{ backgroundColor: p.fill }}
            />
          )
          const common = {
            key: p.id,
            "data-slot": "distribution-bar-segment",
            "data-segment": p.id,
            "data-tone": p.tone,
            style: { flexGrow: p.count, minWidth: 3, flexBasis: 0 },
          }
          return interactive && !p.disabled ? (
            <button
              {...common}
              type="button"
              aria-pressed={isSelected(p.id)}
              aria-label={`${labelText(p.label)} — ${formatCount(p.count)}`}
              onClick={() => onToggle?.(p.id)}
              className={cn(
                "relative cursor-pointer transition-opacity outline-none",
                "focus-visible:ring-3 focus-visible:ring-accent-soft",
                // Selection is never colour alone: an unselected segment in a
                // band that HAS a selection is dimmed, and the selected one
                // keeps full strength.
                selected?.length && !isSelected(p.id)
                  ? "opacity-45"
                  : "opacity-100"
              )}
            >
              {inner}
            </button>
          ) : (
            <span {...common} aria-hidden className="relative">
              {inner}
            </span>
          )
        })}
        {total === 0 ? (
          <span
            aria-hidden
            data-slot="distribution-bar-empty"
            className="block size-full bg-border"
          />
        ) : null}
      </div>

      <ul
        data-slot="distribution-bar-key"
        className={cn(
          legend === "stat"
            ? "grid [grid-template-columns:repeat(auto-fit,minmax(108px,1fr))] gap-2"
            : "flex flex-wrap items-center gap-x-4 gap-y-1"
        )}
      >
        {parts.map((p) => {
          const body = (
            <>
              <span
                aria-hidden
                data-slot="distribution-bar-swatch"
                className="size-2 shrink-0 rounded-[2px]"
                style={{ backgroundColor: p.fill }}
              />
              <span
                data-slot="distribution-bar-key-label"
                className={cn(
                  "min-w-0 truncate text-xs font-semibold",
                  legend === "inline" && "me-1"
                )}
                style={{ color: p.ink }}
              >
                {p.label}
              </span>
              <span
                data-slot="distribution-bar-key-count"
                className={cn(
                  "font-mono text-[12.5px] text-foreground tabular-nums",
                  legend === "stat" ? "mt-0.5 block" : "ms-auto"
                )}
              >
                {formatCount(p.count)}
              </span>
            </>
          )

          return (
            <li
              key={p.id}
              data-slot="distribution-bar-key-item"
              className="min-w-0"
            >
              {interactive && !p.disabled ? (
                <button
                  type="button"
                  aria-pressed={isSelected(p.id)}
                  onClick={() => onToggle?.(p.id)}
                  className={cn(
                    "flex w-full min-w-0 cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 text-start outline-none",
                    "border transition-colors",
                    "focus-visible:ring-3 focus-visible:ring-accent-soft",
                    isSelected(p.id)
                      ? "border-accent-strong/35 bg-accent-soft"
                      : "border-transparent hover:bg-surface-2",
                    legend === "stat" && "flex-wrap"
                  )}
                >
                  {body}
                </button>
              ) : (
                <span
                  className={cn(
                    "flex w-full min-w-0 items-center gap-1.5 px-2 py-1.5",
                    legend === "stat" && "flex-wrap"
                  )}
                >
                  {body}
                </span>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/** Best-effort text for an aria-label built from a ReactNode label. */
function labelText(label: React.ReactNode): string {
  return typeof label === "string" || typeof label === "number"
    ? String(label)
    : ""
}

export { DistributionBar }
export type { DistributionBarProps, DistributionSegment, DistributionTone }
