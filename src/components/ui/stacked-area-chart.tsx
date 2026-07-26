import * as React from "react"

import { AreaChart, type AreaChartProps } from "@/components/ui/area-chart"

/**
 * AEGIS — Stacked Area Chart (Charts, queue #92)
 *
 * The part-to-whole-over-time sibling of `AreaChart`: a config-driven convenience
 * that fixes the stacking mode so series always accumulate into opaque bands
 * (first-declared series at the bottom). It is to `AreaChart` what
 * `ConfirmDialog` is to `Dialog` — the same engine with the ambiguous knob
 * removed, so a stacked area chart is one obvious component rather than
 * `<AreaChart stackMode="stacked">` written correctly every time.
 *
 *   <StackedAreaChart
 *     label="Traffic by source"
 *     data={rows}
 *     xKey="month"
 *     series={[{ key: "organic", label: "Organic" }, { key: "paid", label: "Paid" }]}
 *   />
 *
 * Set `normalized` to stack to 100 % (each x column sums to the full height) for a
 * share-of-total trend. Everything else — data shape, series/palette, axes, grid,
 * dots, legend, sizing — is `AreaChart`'s, forwarded unchanged.
 *
 * Like `AreaChart` this is a static, deterministic renderer; a hover tooltip is
 * deferred to the same follow-up. Public API is CLOSED — no `className` / `style`,
 * and the `stackMode` knob is intentionally not exposed. Colour is token-only.
 * See `.agent/rules/API_RULES.md` and `.agent/DECISIONS.md` (2026-07-25 area/bar
 * stacking).
 */

type StackedAreaChartProps = Omit<AreaChartProps, "stackMode"> & {
  /** Normalise each x column to sum to 100 % (part-to-whole). Default `false`. */
  normalized?: boolean
}

function StackedAreaChart({ normalized = false, ...props }: StackedAreaChartProps) {
  return <AreaChart {...props} stackMode={normalized ? "expand" : "stacked"} />
}

export { StackedAreaChart }
export type { StackedAreaChartProps }
