"use client";

import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { donutLabelSize } from "@/lib/donut-label"
import { type Severity } from "@/components/ui/severity-badge"

/**
 * AEGIS — Severity Donut
 *
 * The findings ring: one wedge per severity, sized by its share, with the total
 * in the hole. It is ONE component with a `size` prop, not a separate drawing per
 * surface — the 58px rung opens an asset card, the 84px rung anchors the
 * vulnerabilities summary bar.
 *
 *   <SeverityDonut counts={{ critical: 2, high: 3, medium: 4, low: 2, info: 3 }} />
 *   <SeverityDonut counts={counts} size={84} label="Total" />
 *
 * Wedges are real `<path>` arcs (arc out, line in, arc back, close), not dashed
 * strokes: a dash offset cannot hold a true angular gap at both ends of a segment,
 * and the inner edge has to be a straight radial line for the hole to read as a
 * hole. The ring starts at 12 o'clock and runs clockwise in fixed severity order.
 *
 * Two rules keep it honest at the extremes. A severity with **no findings is
 * omitted from the ring** — drawing a zero-width wedge would still cost a gap and
 * imply a sliver that is not there — while the legend beside it still lists every
 * rung. And when exactly **one** severity is non-zero the gap drops to zero,
 * because a full circle with a notch in it reads as missing data rather than as
 * "all of it".
 *
 * The hole is a fixed size, so the CENTRE LABEL adapts, never the ring: the type
 * steps down as the formatted total gets longer. A fixed size overflowed the hole
 * at three and four digits, collided with the ring, and pushed the card taller
 * than its neighbours — the step table lives here so no consumer can reintroduce
 * that.
 *
 * The legend is deliberately NOT drawn by this component: cards and the summary
 * bar lay it out differently, and both need it beside the ring rather than inside.
 *
 * Public API is CLOSED — no `className` / `style`; colour is token-only, from the
 * severity ramp or the categorical palette. See `.agent/rules/API_RULES.md`.
 */

/** Severity rungs, worst first — the order the ring always follows. */
const SEVERITY_ORDER: readonly Severity[] = [
  "critical",
  "high",
  "medium",
  "low",
  "info",
] as const

/**
 * Ring geometry per size. The hole is what the centre label has to fit inside, so
 * these numbers and the label step table below are a matched pair.
 */
const GEOMETRY = {
  58: { box: 58, centre: 29, outer: 25, inner: 13 },
  84: { box: 84, centre: 42, outer: 34, inner: 21 },
} as const

type DonutSize = keyof typeof GEOMETRY

/** Gap between wedges, in degrees. Dropped to 0 when only one rung is non-zero. */
const GAP_DEGREES = 3

/** Severity ramp — the default. */
const SEVERITY_FILL: Record<Severity, string> = {
  critical: "fill-sev-critical",
  high: "fill-sev-high",
  medium: "fill-sev-medium",
  low: "fill-sev-low",
  info: "fill-sev-info",
}

/**
 * Categorical palette, for breakdowns that are NOT severity (status, kind, …).
 * Reusing the severity ramp for a status split would imply a badness ordering
 * that does not exist.
 */
const CATEGORICAL_FILL: Record<Severity, string> = {
  critical: "fill-cat-1",
  high: "fill-cat-2",
  medium: "fill-cat-3",
  low: "fill-cat-4",
  info: "fill-cat-5",
}

/** Point on the ring at `deg`, measured clockwise from 12 o'clock. */
function polar(centre: number, radius: number, deg: number): [number, number] {
  const rad = ((deg - 90) * Math.PI) / 180
  return [centre + radius * Math.cos(rad), centre + radius * Math.sin(rad)]
}

/**
 * One annular wedge: out along the start radius, arc across the outer edge, in
 * along the end radius, arc back across the inner edge.
 */
function wedgePath(
  centre: number,
  outer: number,
  inner: number,
  startDeg: number,
  endDeg: number
): string {
  const sweep = endDeg - startDeg
  const largeArc = sweep > 180 ? 1 : 0
  const [ox1, oy1] = polar(centre, outer, startDeg)
  const [ox2, oy2] = polar(centre, outer, endDeg)
  const [ix2, iy2] = polar(centre, inner, endDeg)
  const [ix1, iy1] = polar(centre, inner, startDeg)
  return [
    `M${ox1},${oy1}`,
    `A${outer},${outer} 0 ${largeArc} 1 ${ox2},${oy2}`,
    `L${ix2},${iy2}`,
    `A${inner},${inner} 0 ${largeArc} 0 ${ix1},${iy1}`,
    "Z",
  ].join("")
}

const donutVariants = cva("relative shrink-0", {
  variants: {
    size: {
      58: "size-[58px]",
      84: "size-[84px]",
    },
  },
  defaultVariants: { size: 58 },
})

type SeverityDonutProps = {
  /** Findings per rung. Zeroes are dropped from the ring, never from the total. */
  counts: Record<Severity, number>
  /** Ring size in px. `58` opens an asset card, `84` anchors a summary bar. */
  size?: DonutSize
  /** `"categorical"` for non-severity breakdowns (status, kind). Default severity. */
  palette?: "severity" | "categorical"
  /** Centre readout. Defaults to the sum of `counts`. */
  total?: number
  /** Caption under the readout (e.g. "Total"). Shown at `size={84}`. */
  label?: React.ReactNode
  /** Accessible name for the ring (e.g. "Findings by severity"). Required. */
  chartLabel: string
  /** Format the total. Default `toLocaleString()` — separators affect label fit. */
  formatTotal?: (value: number) => string
}

function SeverityDonut({
  counts,
  size = 58,
  palette = "severity",
  total,
  label,
  chartLabel,
  formatTotal = (value) => value.toLocaleString(),
}: SeverityDonutProps) {
  const { box, centre, outer, inner } = GEOMETRY[size]
  const fills = palette === "categorical" ? CATEGORICAL_FILL : SEVERITY_FILL

  const present = SEVERITY_ORDER.map((rung) => ({
    rung,
    value: Math.max(0, counts[rung] ?? 0),
  })).filter((d) => d.value > 0)

  const sum = present.reduce((acc, d) => acc + d.value, 0)
  const readout = formatTotal(total ?? sum)

  // A lone wedge would otherwise be a full circle with a meaningless notch cut
  // out of it, which reads as missing data rather than "all of it".
  const gap = present.length > 1 ? GAP_DEGREES : 0

  const wedges: { rung: Severity; d: string }[] = []
  let cursor = 0
  for (const { rung, value } of present) {
    const sweep = (value / sum) * 360
    wedges.push({
      rung,
      d: wedgePath(centre, outer, inner, cursor + gap / 2, cursor + sweep - gap / 2),
    })
    cursor += sweep
  }

  return (
    <span data-slot="severity-donut" data-size={size} className={cn(donutVariants({ size }))}>
      <svg
        viewBox={`0 0 ${box} ${box}`}
        role="img"
        aria-label={chartLabel}
        // Decorative entrance; the global reduced-motion rule sweeps it.
        className="size-full animate-donut-in"
      >
        {wedges.map(({ rung, d }) => (
          <path key={rung} data-severity={rung} d={d} className={cn(fills[rung])} />
        ))}
      </svg>

      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
      >
        <span
          data-slot="severity-donut-total"
          // The one place a computed value reaches `style`: the step table picks
          // from a fixed set, and Tailwind cannot express "size by string length".
          style={{ fontSize: `${donutLabelSize(box, readout)}px` }}
          className="whitespace-nowrap font-heading font-bold leading-none tracking-[-0.03em] tabular-nums text-foreground"
        >
          {readout}
        </span>
        {label != null && size === 84 ? (
          <span
            data-slot="severity-donut-caption"
            className="mt-0.5 font-mono text-[8px] font-medium uppercase leading-[1.6] tracking-[0.05em] text-muted-foreground"
          >
            {label}
          </span>
        ) : null}
      </span>
    </span>
  )
}

export { SeverityDonut, donutVariants as severityDonutVariants }
export type { SeverityDonutProps, DonutSize }
