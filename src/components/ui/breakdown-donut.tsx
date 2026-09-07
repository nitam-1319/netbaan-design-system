"use client";

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { donutLabelSize } from "@/lib/donut-label"
import {
  CAT_PALETTE,
  CHART_PALETTE,
  SEVERITY_AUTO_LEN,
  type ChartPalette,
} from "@/components/ui/chart-container"
import { donutSegmentPath } from "@/components/ui/donut-chart"

/**
 * AEGIS — Breakdown Donut (Domain / ASM)
 *
 * A compact ring + counted key, sized for a summary cell rather than a chart
 * panel. It answers "how does this population split, and by how much?" in one
 * glance: the ring carries the proportions, the centre carries the total, and
 * every legend row spells out its name AND its count so the split is readable
 * without decoding colour.
 *
 *   <BreakdownDonut
 *     label="Findings by severity"
 *     data={[
 *       { key: "critical", label: "Critical", value: 218 },
 *       { key: "high", label: "High", value: 604 },
 *     ]}
 *   />
 *
 * How it differs from `DonutChart`: that is the general charting primitive —
 * larger, with the shared chart legend (names only) stacked above the plot. This
 * is the dense summary-strip form: a fixed small ring with the key beside it and
 * a count per row. Both draw their arcs with the same exported geometry helper
 * and read the same palettes, so a severity split looks identical in either.
 *
 * **Pass `palette="categorical"` whenever the slices are not severities.** A
 * status or owner breakdown painted in the `--chart-*` severity ramp reads as an
 * alarm — the categorical `--cat-*` ramp exists precisely for that case.
 *
 * Public API is CLOSED — no `className` / `style`. All colour resolves from the
 * chart palettes. See `.agent/rules/API_RULES.md`.
 */

/** One slice of the breakdown. */
type BreakdownDonutDatum = {
  /** Stable identifier — also the colour/legend lookup key. */
  key: string
  /** Human label shown in the key. Falls back to `key`. */
  label?: string
  /** Count for this slice. Zero-valued slices keep their legend row but take no arc. */
  value: number
}

/** Ring geometry per size, in SVG user units (= px at 1×). */
const RING = {
  sm: { box: 84, outer: 34, inner: 21, gap: 3 },
  md: { box: 108, outer: 44, inner: 27, gap: 3 },
  /** For a two-up card at 440px, where `md` leaves the ring at a quarter of it. */
  lg: { box: 140, outer: 57, inner: 35, gap: 3 },
} as const

/**
 * Ring geometry for an arbitrary diameter, keeping `md`'s proportions
 * (outer 0.407·box, inner 0.25·box). A card that is 312px at four-up and 440px
 * at two-up needs a ring between the rungs, not one of them.
 */
function ringFor(box: number) {
  return {
    box,
    outer: box * (44 / 108),
    inner: box * (27 / 108),
    gap: 3,
  }
}

const rootVariants = cva("flex items-center gap-4", {
  variants: { size: { sm: "", md: "", lg: "" } },
  defaultVariants: { size: "sm" },
})

/**
 * The hole is fixed, so the type adapts, never the ring. The size itself comes
 * from the shared ladder in `@/lib/donut-label` (see `SeverityDonut`); a fixed
 * size overflowed the hole and collided with the ring once the total reached
 * four digits with a separator.
 */
const centerValueVariants = cva(
  "font-heading leading-none font-bold tracking-[-0.03em] whitespace-nowrap text-foreground tabular-nums"
)

const swatchVariants = cva("size-2 shrink-0", {
  variants: { swatch: { square: "rounded-[2px]", dot: "rounded-full" } },
  defaultVariants: { swatch: "square" },
})

type BreakdownDonutProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style" | "children"
> &
  VariantProps<typeof rootVariants> & {
    /** Accessible name for the figure (e.g. "Findings by severity"). Required. */
    label: string
    /** Slices, in the order they should be coloured and listed. */
    data: BreakdownDonutDatum[]
    /**
     * Which ramp the slices paint from. Default `"severity"` (`--chart-1..5`).
     * Pass `"categorical"` (`--cat-1..6`) for anything that is not a severity.
     */
    palette?: ChartPalette
    /**
     * An exact ring diameter in px, overriding `size` and keeping `md`'s
     * proportions. The rungs are 84/108/140; a card that is 312px wide at
     * four-up and 440px at two-up wants a ring between them, and a ring that
     * does not grow with its card falls out of balance with the key beside it,
     * which does.
     */
    diameter?: number
    /** Legend swatch glyph. Default `"square"`. */
    swatch?: "square" | "dot"
    /** Lay the key out in one or two columns. Default `1`. */
    legendColumns?: 1 | 2
    /** Small caption under the centre total (e.g. "TOTAL"). */
    centerSublabel?: React.ReactNode
    /** Format counts for display. Default `toLocaleString()`. */
    valueFormat?: (value: number) => string
  }

/** Non-negative, finite magnitude. Anything else contributes nothing. */
function toCount(value: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : 0
}

function BreakdownDonut({
  label,
  data,
  palette = "severity",
  size = "sm",
  diameter,
  swatch = "square",
  legendColumns = 1,
  centerSublabel,
  valueFormat = (v) => v.toLocaleString(),
  ...props
}: BreakdownDonutProps) {
  const ring = diameter != null ? ringFor(diameter) : RING[size ?? "sm"]
  const ramp = palette === "categorical" ? CAT_PALETTE : CHART_PALETTE
  // The severity ramp auto-assigns from its first five slots only: `--chart-6`
  // is the success green, and a breakdown slice never means "good" by position.
  const rampLen =
    palette === "categorical" ? CAT_PALETTE.length : SEVERITY_AUTO_LEN

  // Colour follows declaration order and wraps at the end of the ramp, so the
  // slice, its legend swatch and any sibling chart of the same data agree.
  const slices = data.map((d, i) => ({
    ...d,
    count: toCount(d.value),
    color: `var(${ramp[i % rampLen]})`,
  }))

  const total = slices.reduce((sum, d) => sum + d.count, 0)

  // Only non-zero slices take angular space (and a gap). A single slice draws a
  // full ring with no gap — a lone segment with a notch reads as missing data.
  const drawn = slices.filter((d) => d.count > 0)
  const gap = drawn.length > 1 ? ring.gap : 0
  const available = Math.max(0, 360 - gap * drawn.length) || 360

  // Each slice's start is the sum of the shares before it plus the gaps already
  // spent — derived per slice rather than accumulated, so nothing is reassigned
  // during render.
  const shares = drawn.map((d) => (total > 0 ? d.count / total : 0))
  const arcs = drawn.map((d, i) => {
    const before = shares.slice(0, i).reduce((sum, f) => sum + f, 0)
    const a0 = before * available + gap * i
    return { key: d.key, color: d.color, a0, a1: a0 + shares[i] * available }
  })

  const center = ring.box / 2

  return (
    <div
      data-slot="breakdown-donut"
      data-palette={palette}
      className={cn(rootVariants({ size }))}
      {...props}
    >
      <div
        data-slot="breakdown-donut-ring"
        className="relative shrink-0"
        style={{ width: ring.box, height: ring.box }}
      >
        {/* The ring is decorative: every figure it encodes is spelled out in the
            key beside it, which is the accessible representation. */}
        <svg
          width={ring.box}
          height={ring.box}
          viewBox={`0 0 ${ring.box} ${ring.box}`}
          aria-hidden
          className="animate-donut-in"
        >
          {arcs.map((arc) => (
            <path
              key={arc.key}
              data-slot="breakdown-donut-slice"
              data-key={arc.key}
              d={donutSegmentPath(
                center,
                center,
                ring.outer,
                ring.inner,
                arc.a0,
                arc.a1
              )}
              fill={arc.color}
              fillRule="evenodd"
            />
          ))}
        </svg>
        <div
          data-slot="breakdown-donut-center"
          aria-hidden
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
        >
          <span
            data-slot="breakdown-donut-total"
            style={{
              fontSize: `${donutLabelSize(ring.box, String(valueFormat(total)))}px`,
            }}
            className={cn(centerValueVariants())}
          >
            {valueFormat(total)}
          </span>
          {centerSublabel != null && (
            <span className="font-mono text-[8px] leading-relaxed tracking-[0.05em] text-muted-foreground">
              {centerSublabel}
            </span>
          )}
        </div>
      </div>

      <ul
        data-slot="breakdown-donut-legend"
        role="list"
        aria-label={label}
        className={cn(
          "grid min-w-0 flex-1 gap-x-4 gap-y-1",
          legendColumns === 2 &&
            "grid-cols-[repeat(auto-fit,minmax(100px,1fr))]"
        )}
      >
        {slices.map((d) => (
          <li
            key={d.key}
            data-slot="breakdown-donut-legend-item"
            data-key={d.key}
            className="flex items-center gap-[7px]"
          >
            <span
              aria-hidden
              // Per-slice colour is dynamic → set the resolved chart token here.
              // Internal wiring, not a consumer styling hatch.
              style={{ backgroundColor: d.color }}
              className={cn(swatchVariants({ swatch }))}
            />
            <span className="min-w-0 flex-1 truncate text-[11.5px] text-muted-foreground">
              {d.label ?? d.key}
            </span>
            <span className="font-mono text-[11.5px] font-semibold text-foreground tabular-nums">
              {valueFormat(d.count)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export { BreakdownDonut }
export type { BreakdownDonutProps, BreakdownDonutDatum }
