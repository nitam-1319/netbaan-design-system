import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Geo / Choropleth Map (Data Visualization)
 *
 * A choropleth: geographic regions shaded by a value. It is a deterministic,
 * token-only STATIC renderer — the caller supplies each region's already-projected
 * SVG path (`d`) plus its `value`, and the component owns the sequential
 * value→shade mapping, the "no data" treatment, the legend, and the accessible
 * scaffolding. There is NO geographic projection and NO bundled topology data:
 * run your projection (d3-geo / topojson, etc.) upstream and pass the resulting
 * path strings, exactly as `NetworkGraph` takes caller-supplied node coordinates.
 *
 * The sequential ramp is one hue — the `--primary` brand token at stepped
 * opacity — so darker = larger; regions without a value use the neutral `muted`
 * token. Each region carries a `<title>` (label + value) for pointer/AT
 * discovery, and the shade is never the only signal (pair with the built-in
 * legend and, for a full account, a table).
 *
 * SCOPE: static renderer — projection, zoom/pan, hover highlighting, and
 * bundled world/country topologies are out of scope (the caller owns geometry),
 * consistent with the honestly-scoped chart precedents.
 *
 * Public API is CLOSED — no `className` / `style`. Colour is token-only; sizes
 * are numeric props. See `.agent/rules/API_RULES.md` and `.agent/rules/TOKEN_RULES.md`.
 */

type ChoroplethRegion = {
  /** Stable identifier. */
  id: string
  /** Human label — shown in the region's `<title>`. Falls back to `id`. */
  label?: string
  /** Already-projected SVG path data for the region outline. */
  d: string
  /** Value driving the shade. Omit for a "no data" region. */
  value?: number
}

type GeoChoroplethMapProps = Omit<
  React.ComponentProps<"figure">,
  "className" | "style" | "children"
> & {
  /** Accessible name for the map. Always provide one. */
  label: string
  /** Regions with projected paths and values. */
  regions: ChoroplethRegion[]
  /** SVG `viewBox` matching the coordinate space of the region paths. Default `"0 0 960 600"`. */
  viewBox?: string
  /** Number of shade buckets. Default `5`. */
  steps?: number
  /** Render the shade legend beneath the map. Default `true`. */
  showLegend?: boolean
  /** Format a domain value for the legend. Default rounds to a short number. */
  formatValue?: (value: number) => string
}

const MIN_OPACITY = 0.18
const MAX_OPACITY = 1

const defaultFormat = (v: number) => {
  const abs = Math.abs(v)
  if (abs >= 1000) return `${(v / 1000).toFixed(abs >= 10000 ? 0 : 1)}k`
  return Number.isInteger(v) ? String(v) : v.toFixed(1)
}

function GeoChoroplethMap({
  label,
  regions,
  viewBox = "0 0 960 600",
  steps = 5,
  showLegend = true,
  formatValue = defaultFormat,
  ...props
}: GeoChoroplethMapProps) {
  const model = React.useMemo(() => {
    const nSteps = Math.max(1, Math.floor(steps))
    const values = regions
      .map((r) => r.value)
      .filter((v): v is number => Number.isFinite(v as number))
    const min = values.length ? Math.min(...values) : 0
    const max = values.length ? Math.max(...values) : 0
    const span = max - min

    // Bucket 0..nSteps-1; a flat/empty domain collapses to the top bucket.
    const bucketOf = (v: number) => {
      if (span <= 0) return nSteps - 1
      const b = Math.floor(((v - min) / span) * nSteps)
      return Math.min(nSteps - 1, Math.max(0, b))
    }
    const opacityOfBucket = (b: number) =>
      nSteps === 1 ? MAX_OPACITY : MIN_OPACITY + (b / (nSteps - 1)) * (MAX_OPACITY - MIN_OPACITY)

    const shaded = regions.map((r) => {
      const hasValue = Number.isFinite(r.value as number)
      const bucket = hasValue ? bucketOf(r.value as number) : -1
      return {
        id: r.id,
        d: r.d,
        title: `${r.label ?? r.id}${hasValue ? `: ${formatValue(r.value as number)}` : " — no data"}`,
        hasValue,
        opacity: hasValue ? opacityOfBucket(bucket) : 1,
      }
    })

    // Legend bucket boundaries (only meaningful when there is real data).
    const legend =
      values.length && span > 0
        ? Array.from({ length: nSteps }, (_, b) => {
            const lo = min + (b / nSteps) * span
            const hi = min + ((b + 1) / nSteps) * span
            return {
              b,
              opacity: opacityOfBucket(b),
              range: `${formatValue(lo)}–${formatValue(hi)}`,
            }
          })
        : []

    return { shaded, legend, hasData: values.length > 0 }
  }, [regions, steps, formatValue])

  return (
    <figure
      data-slot="geo-choropleth-map"
      role="group"
      aria-label={label}
      className={cn("w-full text-foreground [&_svg]:overflow-visible")}
      {...props}
    >
      <svg
        data-slot="geo-choropleth-plot"
        viewBox={viewBox}
        width="100%"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={label}
        className={cn("block h-auto w-full")}
      >
        <g data-slot="geo-choropleth-regions">
          {model.shaded.map((r) => (
            <path
              key={r.id}
              data-slot="geo-choropleth-region"
              data-nodata={r.hasValue ? undefined : ""}
              d={r.d}
              fill={r.hasValue ? "var(--color-primary)" : "var(--color-muted)"}
              fillOpacity={r.opacity}
              strokeWidth={0.5}
              className="stroke-background"
            >
              <title>{r.title}</title>
            </path>
          ))}
        </g>
      </svg>
      {showLegend && model.legend.length > 0 ? (
        <figcaption
          data-slot="geo-choropleth-legend"
          aria-hidden
          className={cn(
            "mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground"
          )}
        >
          {model.legend.map((l) => (
            <span
              key={l.b}
              data-slot="geo-choropleth-legend-item"
              className={cn("inline-flex items-center gap-1.5")}
            >
              <span
                className={cn("inline-block size-3 rounded-[2px]")}
                style={{ backgroundColor: "var(--color-primary)", opacity: l.opacity }}
              />
              {l.range}
            </span>
          ))}
        </figcaption>
      ) : null}
    </figure>
  )
}

export { GeoChoroplethMap }
export type { GeoChoroplethMapProps, ChoroplethRegion }
