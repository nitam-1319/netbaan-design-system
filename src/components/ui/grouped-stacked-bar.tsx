import { BarChart, type BarChartProps } from "@/components/ui/bar-chart"

/**
 * AEGIS — Grouped / Stacked Bar (Charts, queue #94)
 *
 * The multi-series sibling of `BarChart`: a config-driven convenience that makes
 * the grouped-vs-stacked choice a single explicit `mode` prop instead of a
 * boolean `stacked` flag. It is to `BarChart` what `StackedAreaChart` is to
 * `AreaChart` — the same engine with the layout decision named, so a comparison
 * chart reads as one obvious component.
 *
 *   <GroupedStackedBar
 *     label="Findings by severity"
 *     data={rows}
 *     xKey="month"
 *     series={[{ key: "high", label: "High" }, { key: "low", label: "Low" }]}
 *     mode="stacked"
 *   />
 *
 *   - `grouped` (default) — series sit side-by-side within each category band, for
 *                           comparing series against each other.
 *   - `stacked`           — series stack within one column per category (positive
 *                           and negative bars stack independently), for the
 *                           category total plus its composition.
 *
 * Everything else — data shape, series/palette, axes, grid, legend, band padding,
 * sizing — is `BarChart`'s, forwarded unchanged. Like `BarChart` this is a static,
 * deterministic renderer; a hover tooltip is deferred to the same follow-up.
 *
 * Public API is CLOSED — no `className` / `style`, and the raw `stacked` boolean is
 * intentionally replaced by `mode`. Colour is token-only. See
 * `.agent/rules/API_RULES.md` and `.agent/DECISIONS.md` (2026-07-25 area/bar
 * stacking).
 */

/** How the series in each category are laid out. */
type GroupedStackedBarMode = "grouped" | "stacked"

type GroupedStackedBarProps = Omit<BarChartProps, "stacked"> & {
  /** Lay series out side-by-side (`grouped`) or stacked in one column (`stacked`). Default `grouped`. */
  mode?: GroupedStackedBarMode
}

function GroupedStackedBar({ mode = "grouped", ...props }: GroupedStackedBarProps) {
  return <BarChart {...props} stacked={mode === "stacked"} />
}

export { GroupedStackedBar }
export type { GroupedStackedBarProps, GroupedStackedBarMode }
