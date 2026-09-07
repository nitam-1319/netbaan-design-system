"use client";

import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { type Severity } from "@/components/ui/severity-badge"

/**
 * AEGIS — Severity Legend
 *
 * The five-rung tally that sits under a page title: one pill per severity, each
 * carrying its colour, its name, and how many findings sit on it. It is the
 * page-level counterpart to the per-asset breakdown inside `AssetTriageCard` —
 * same order, same inks — so a reader can move between the header and a card
 * without re-learning what a colour means.
 *
 *   <SeverityLegend
 *     label="Findings by severity"
 *     counts={{ critical: 7, high: 12, medium: 19, low: 20, info: 24 }}
 *     labels={severityLabels}
 *   />
 *
 * Every rung is always rendered, zeros included: "no criticals" is the thing a
 * triage reader most wants to confirm, and a legend that hides empty rungs
 * changes width as data changes, which makes it unreadable at a glance.
 *
 * Distinct from `Badge` with a `count`, which shows a number *instead of* a
 * label, and from `ChartLegend`, which names series without quantifying them.
 *
 * Public API is CLOSED — no `className` / `style`; labels are `ReactNode` so the
 * consuming app owns translation. Colour is token-only.
 * See `.agent/rules/API_RULES.md`.
 */

/** Severity rungs, worst first — the order every AEGIS severity surface uses. */
const SEVERITY_ORDER: readonly Severity[] = [
  "critical",
  "high",
  "medium",
  "low",
  "info",
] as const

/** Per-rung dot fill. */
const dotVariants = cva("size-2 shrink-0 rounded-full", {
  variants: {
    level: {
      critical: "bg-sev-critical",
      high: "bg-sev-high",
      medium: "bg-sev-medium",
      low: "bg-sev-low",
      info: "bg-sev-info",
    },
  },
})

type SeverityLegendProps = {
  /** Accessible name for the tally (e.g. "Findings by severity"). Required. */
  label: string
  /** Findings on each rung. All five are rendered, zeros included. Required. */
  counts: Record<Severity, number>
  /** Display name per rung — the consuming app translates these. Required. */
  labels: Record<Severity, string>
}

function SeverityLegend({ label, counts, labels }: SeverityLegendProps) {
  return (
    // A bare `<dl>` exposes as `generic`, where `aria-label` is ignored — the
    // explicit group role is what makes the tally a named region.
    <dl
      data-slot="severity-legend"
      role="group"
      aria-label={label}
      className="flex flex-wrap items-center gap-2"
    >
      {SEVERITY_ORDER.map((level) => (
        <div
          key={level}
          data-slot="severity-legend-item"
          data-severity={level}
          className="inline-flex items-center gap-[7px] rounded-full border border-border bg-surface-2 px-[11px] py-[5px] text-xs font-medium text-muted-foreground"
        >
          <span aria-hidden="true" className={cn(dotVariants({ level }))} />
          <dt>{labels[level]}</dt>
          <dd className="font-mono font-semibold tabular-nums text-foreground">
            {Math.max(0, counts[level] ?? 0)}
          </dd>
        </div>
      ))}
    </dl>
  )
}

export { SeverityLegend, dotVariants as severityLegendDotVariants }
export type { SeverityLegendProps }
