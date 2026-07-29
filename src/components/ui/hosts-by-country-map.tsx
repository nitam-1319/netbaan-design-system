"use client";

import * as React from "react"
import { Globe } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  GeoChoroplethMap,
  type ChoroplethRegion,
} from "@/components/ui/geo-choropleth-map"

/**
 * AEGIS — Hosts-by-Country Map (Domain / ASM)
 *
 * An attack-surface readout of where an organisation's internet-facing hosts
 * live geographically. It composes the AEGIS `GeoChoroplethMap` (regions shaded
 * by host count) and frames it for the ASM domain: a titled header with the
 * fleet total, plus a ranked list of the top countries with their host count and
 * share of the surface.
 *
 * Like `GeoChoroplethMap`, this is a deterministic, token-only STATIC renderer:
 * the caller supplies each country's already-projected SVG path (`d`) and its
 * `hosts` count. There is NO geographic projection and NO bundled topology —
 * run your projection upstream and pass the resulting paths, exactly as the
 * underlying map does.
 *
 * Every country's count and share are spelled out as text in the ranking, so the
 * distribution never depends on shade alone (the choropleth colour is a
 * secondary cue paired with the built-in legend). Public API is CLOSED — no
 * `className` / `style`; colour is token-only. See `.agent/rules/API_RULES.md`.
 */

type HostCountry = {
  /** Stable identifier / ISO code. */
  id: string
  /** Human label — shown in the map title and ranking. Falls back to `id`. */
  label?: string
  /** Already-projected SVG path data for the country outline. */
  d: string
  /** Number of hosts in this country. Omit or 0 for a "no data" region. */
  hosts?: number
}

type HostsByCountryMapProps = Omit<
  React.ComponentProps<"figure">,
  "className" | "style" | "children"
> & {
  /** Accessible name / heading for the widget. Default "Hosts by country". */
  label?: React.ReactNode
  /** Countries with projected paths and host counts. */
  countries: HostCountry[]
  /** SVG `viewBox` matching the coordinate space of the paths. Default `"0 0 960 600"`. */
  viewBox?: string
  /** Number of shade buckets on the map. Default `5`. */
  steps?: number
  /** Render the map's shade legend. Default `true`. */
  showLegend?: boolean
  /** Render the ranked country list. Default `true`. */
  showRanking?: boolean
  /** How many countries to list in the ranking. Default `5`. */
  topCount?: number
  /** Format a host count for display. Default groups thousands. */
  formatCount?: (value: number) => string
}

const defaultFormat = (v: number) => v.toLocaleString("en-US")

function HostsByCountryMap({
  label = "Hosts by country",
  countries,
  viewBox = "0 0 960 600",
  steps = 5,
  showLegend = true,
  showRanking = true,
  topCount = 5,
  formatCount = defaultFormat,
  ...props
}: HostsByCountryMapProps) {
  const model = React.useMemo(() => {
    const withHosts = countries.map((c) => ({
      id: c.id,
      label: c.label ?? c.id,
      hosts: Number.isFinite(c.hosts as number) ? Math.max(0, c.hosts as number) : 0,
    }))
    const total = withHosts.reduce((sum, c) => sum + c.hosts, 0)
    const present = withHosts.filter((c) => c.hosts > 0)
    const ranked = [...present]
      .sort((a, b) => b.hosts - a.hosts)
      .slice(0, Math.max(0, Math.floor(topCount)))
      .map((c) => ({
        ...c,
        share: total > 0 ? c.hosts / total : 0,
      }))

    const regions: ChoroplethRegion[] = countries.map((c) => ({
      id: c.id,
      label: c.label ?? c.id,
      d: c.d,
      value: Number.isFinite(c.hosts as number) && (c.hosts as number) > 0 ? (c.hosts as number) : undefined,
    }))

    return { total, countryCount: present.length, ranked, regions }
  }, [countries, topCount])

  const labelText = typeof label === "string" ? label : "Hosts by country"
  const summary = `${formatCount(model.total)} hosts across ${model.countryCount} ${
    model.countryCount === 1 ? "country" : "countries"
  }`

  return (
    <figure
      data-slot="hosts-by-country-map"
      role="group"
      aria-label={`${labelText} — ${summary}`}
      className={cn("flex w-full flex-col gap-3 text-foreground")}
      {...props}
    >
      <figcaption
        data-slot="hosts-by-country-map-header"
        className={cn("flex items-start justify-between gap-3")}
      >
        <span className={cn("flex items-center gap-2")}>
          <Globe aria-hidden className="size-4 shrink-0 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">{label}</span>
        </span>
        <span
          data-slot="hosts-by-country-map-total"
          className={cn("text-end leading-tight")}
        >
          <span className="block font-heading text-lg font-semibold tabular-nums text-foreground">
            {formatCount(model.total)}
          </span>
          <span className="block text-[11px] font-medium uppercase tracking-wide text-text-faint">
            hosts
          </span>
        </span>
      </figcaption>

      <GeoChoroplethMap
        data-slot="hosts-by-country-map-plot"
        label={`${labelText} — ${summary}`}
        regions={model.regions}
        viewBox={viewBox}
        steps={steps}
        showLegend={showLegend}
        formatValue={(v) => formatCount(v)}
      />

      {showRanking && model.ranked.length > 0 ? (
        <ol
          data-slot="hosts-by-country-map-ranking"
          className={cn("flex flex-col gap-1.5")}
        >
          {model.ranked.map((c, i) => (
            <li
              key={c.id}
              data-slot="hosts-by-country-map-rank"
              className={cn("flex items-center gap-2 text-sm")}
            >
              <span className="w-4 shrink-0 text-end font-mono text-xs text-text-faint tabular-nums">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1 truncate text-foreground">{c.label}</span>
              <span className="shrink-0 font-medium tabular-nums text-foreground">
                {formatCount(c.hosts)}
              </span>
              <span className="w-12 shrink-0 text-end text-xs tabular-nums text-muted-foreground">
                {(c.share * 100).toFixed(c.share >= 0.1 ? 0 : 1)}%
              </span>
            </li>
          ))}
        </ol>
      ) : null}
    </figure>
  )
}

export { HostsByCountryMap }
export type { HostsByCountryMapProps, HostCountry }
