"use client";

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { MapPinOff } from "lucide-react"

import { cn } from "@/lib/utils"
import { MEDIA_EMPTY_STACK, MEDIA_FRAME, MEDIA_HATCH, MEDIA_SIZE } from "@/lib/media"

/**
 * AEGIS — Mini Location Map
 *
 * The locator strip that opens an IP card: a dark regional map centred on one
 * address, with a pulsing marker and a chip naming the place. Where a domain card
 * shows what a host looks like, an IP card shows where it is — this is the sibling
 * of `ScreenshotThumb` for the same media slot, at the same heights.
 *
 *   <MiniLocationMap
 *     lat={50.11} lon={8.68}
 *     city="Frankfurt" countryCode="DE" asn="AS24940"
 *     geometry={{ land: WORLD_LAND_50M, borders: WORLD_BORDERS_50M }}
 *     label="Location of 203.0.113.7"
 *     emptyLabel="Location unknown"
 *   />
 *
 * The map is location EVIDENCE, not decoration: a reviewer has to be able to tell
 * which country an address sits in, so **country borders are a required layer**.
 * A render showing only sea and a land silhouette fails the job.
 *
 * This component owns the projection — a Mercator centred on the address at a
 * fixed scale. That has to happen here rather than upstream because every card
 * has a different centre, and Mercator's y is non-linear in latitude, so a single
 * pre-projected frame cannot be re-centred by cropping. What it does NOT own is
 * the geometry: the consuming app generates that at build time (Natural Earth 50m,
 * simplified) and passes it in, so a ~300kB dataset is not baked into the sealed
 * library and can be code-split by the app that needs it.
 *
 * Cost is managed by clipping to a window around the centre before projecting —
 * near a typical city that is ~13% of the coastline rings — and by memoising the
 * path strings per coordinate, so a grid of cards re-renders without re-pathing.
 *
 * Without coordinates it degrades to the shared hatched empty slot: no map, no
 * pin, just the caption. An unplaceable IP must not be drawn somewhere plausible.
 *
 * The marker sits in an HTML overlay rather than inside the SVG so its dot stays a
 * true 9px. It is NOT mirrored in RTL: geography is not a reading order. The ping
 * obeys `prefers-reduced-motion`.
 *
 * Public API is CLOSED — no `className` / `style`. Colour is token-only.
 * See `.agent/rules/API_RULES.md`.
 */

const mapVariants = cva(MEDIA_FRAME, {
  variants: { size: MEDIA_SIZE },
  defaultVariants: { size: "md" },
})

/** One ring, flattened: `[lon, lat, lon, lat, …]`. */
type GeoRing = number[]

type MiniLocationMapGeometry = {
  /** Dissolved landmass — filled, and stroked as the coastline. */
  land: GeoRing[]
  /** Internal country borders only; each shared border once. */
  borders: GeoRing[]
}

type MiniLocationMapProps = VariantProps<typeof mapVariants> & {
  /** Accessible name for the map (e.g. "Location of 203.0.113.7"). Required. */
  label: string
  /** Latitude in degrees. Missing or out of range renders the empty slot. */
  lat?: number | null
  /** Longitude in degrees. Missing or out of range renders the empty slot. */
  lon?: number | null
  /** Land + border rings, unprojected. Omit to render the empty slot. */
  geometry?: MiniLocationMapGeometry
  /** City name for the chip (e.g. "Frankfurt"). */
  city?: string | null
  /** ISO country code appended to the city (e.g. "DE"). */
  countryCode?: string | null
  /** Network operator for the chip, set in mono (e.g. "AS24940"). */
  asn?: string | null
  /** Caption for the empty slot (e.g. "Location unknown"). Required. */
  emptyLabel: string
}

/** Frame the projection is computed in. The SVG scales it to the strip. */
const FRAME_WIDTH = 720
const FRAME_HEIGHT = 240
/** Spec scale. One radian of longitude is this many px, so 1° ≈ 15.7px. */
const SCALE = 900
/** Half-window to keep, in degrees — generous enough to cover the frame corners. */
const WINDOW_LON = 30
const WINDOW_LAT = 20

const DEG = Math.PI / 180

/** Mercator y for a latitude, clamped away from the poles where it diverges. */
function mercatorY(latDeg: number): number {
  const clamped = Math.max(-85, Math.min(85, latDeg))
  return Math.log(Math.tan(Math.PI / 4 + (clamped * DEG) / 2))
}

/**
 * Project a flat ring into frame coordinates, or null when it falls outside the
 * window. Clipping before projecting is what keeps a grid of maps cheap.
 */
function projectRing(
  ring: GeoRing,
  centreLon: number,
  centreLat: number,
  centreY: number
): string | null {
  let visible = false
  for (let i = 0; i < ring.length; i += 2) {
    if (
      Math.abs(ring[i] - centreLon) < WINDOW_LON &&
      Math.abs(ring[i + 1] - centreLat) < WINDOW_LAT
    ) {
      visible = true
      break
    }
  }
  if (!visible) return null

  let d = ""
  for (let i = 0; i < ring.length; i += 2) {
    // Wrap longitude into [-180, 180) relative to the centre so a ring that
    // straddles the antimeridian does not stretch across the whole frame.
    let dLon = ring[i] - centreLon
    if (dLon > 180) dLon -= 360
    else if (dLon < -180) dLon += 360

    const x = FRAME_WIDTH / 2 + SCALE * dLon * DEG
    const y = FRAME_HEIGHT / 2 - SCALE * (mercatorY(ring[i + 1]) - centreY)
    d += `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`
  }
  return d
}

function MiniLocationMap({
  label,
  lat,
  lon,
  geometry,
  city,
  countryCode,
  asn,
  emptyLabel,
  size,
}: MiniLocationMapProps) {
  const placed =
    lat != null &&
    lon != null &&
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180

  // Path strings depend only on the centre and the geometry, so a card that
  // re-renders for any other reason never re-projects.
  const paths = React.useMemo(() => {
    if (!placed || geometry == null) return null
    const centreY = mercatorY(lat)
    const project = (rings: GeoRing[]) => {
      const out: string[] = []
      for (const ring of rings) {
        const d = projectRing(ring, lon, lat, centreY)
        if (d) out.push(d)
      }
      return out
    }
    return { land: project(geometry.land), borders: project(geometry.borders) }
  }, [placed, geometry, lat, lon])

  if (!placed || paths == null) {
    return (
      <div
        data-slot="mini-location-map"
        data-empty=""
        className={cn(mapVariants({ size }), MEDIA_HATCH)}
      >
        <span data-slot="mini-location-map-empty" className={cn(MEDIA_EMPTY_STACK)}>
          {/* The icon carries the meaning at a glance; the caption states it. */}
          <MapPinOff aria-hidden className="size-4 opacity-70" />
          <span className="font-mono text-[11px]">{emptyLabel}</span>
        </span>
      </div>
    )
  }

  const place = [city, countryCode].filter(Boolean).join(", ")
  const hasChip = place.length > 0 || asn != null

  return (
    <div data-slot="mini-location-map" className={cn(mapVariants({ size }))}>
      <svg
        data-slot="mini-location-map-canvas"
        viewBox={`0 0 ${FRAME_WIDTH} ${FRAME_HEIGHT}`}
        role="img"
        aria-label={label}
        preserveAspectRatio="xMidYMid slice"
        className="size-full"
      >
        {/* 1 — water */}
        <rect width={FRAME_WIDTH} height={FRAME_HEIGHT} className="fill-surface" />

        {/* 2 — graticule, every 10 degrees, as a faint sense of scale */}
        <g data-slot="mini-location-map-graticule" className="stroke-border opacity-40">
          {Array.from({ length: 13 }, (_, i) => {
            const x = FRAME_WIDTH / 2 + SCALE * (i - 6) * 10 * DEG
            return <line key={`m${i}`} x1={x} y1={0} x2={x} y2={FRAME_HEIGHT} strokeWidth={1} />
          })}
          {Array.from({ length: 9 }, (_, i) => {
            const y =
              FRAME_HEIGHT / 2 -
              SCALE * (mercatorY(Math.round(lat / 10) * 10 + (i - 4) * 10) - mercatorY(lat))
            return <line key={`p${i}`} x1={0} y1={y} x2={FRAME_WIDTH} y2={y} strokeWidth={1} />
          })}
        </g>

        {/* 3 + 4 — land fill, then its own outline as the coastline. Stroking the
            land paths rather than a separate mesh means the coastline can never
            drift out of register with the fill. */}
        <g data-slot="mini-location-map-land">
          {paths.land.map((d, index) => (
            <path
              key={index}
              d={d}
              className="fill-surface-3 stroke-border-strong"
              strokeWidth={1.1}
              strokeLinejoin="round"
            />
          ))}
        </g>

        {/* 5 — internal borders, lighter than the coastline so political
            divisions read first inside a landmass while the outline stays calm. */}
        <g data-slot="mini-location-map-borders" className="opacity-80">
          {paths.borders.map((d, index) => (
            <path
              key={index}
              d={d}
              fill="none"
              className="stroke-muted-foreground"
              strokeWidth={0.9}
              strokeLinejoin="round"
            />
          ))}
        </g>
      </svg>

      <span
        data-slot="mini-location-map-marker"
        aria-hidden
        // Physical centring on purpose: the pin marks a place on a map, so it
        // must NOT mirror with reading direction the way UI chrome does.
        // eslint-disable-next-line no-restricted-syntax -- geography is not a reading order (RTL_I18N_RULES)
        className="pointer-events-none absolute left-1/2 top-1/2 size-0 text-primary"
      >
        {/* The ring uses the AEGIS signature ping (`--animate-status-ping`), not
            Tailwind's generic one, so it expands like every other live marker in
            the system. Reduced motion is handled globally by the token layer. */}
        <span
          data-slot="mini-location-map-ping"
          className="absolute size-[9px] -translate-x-1/2 -translate-y-1/2 animate-status-ping rounded-full bg-current"
        />
        <span className="absolute size-[9px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-current ring-2 ring-primary/35" />
      </span>

      {hasChip ? (
        <span
          data-slot="mini-location-map-chip"
          className="absolute bottom-2.5 start-2.5 inline-flex max-w-[calc(100%-1.25rem)] items-center gap-1.5 rounded-full bg-[color-mix(in_srgb,var(--color-card)_80%,transparent)] px-2.5 py-1 text-[10.5px] font-medium text-foreground backdrop-blur-sm"
        >
          {place ? <span className="truncate">{place}</span> : null}
          {asn != null ? (
            <span className="shrink-0 font-mono text-muted-foreground">{asn}</span>
          ) : null}
        </span>
      ) : null}
    </div>
  )
}

export { MiniLocationMap, mapVariants as miniLocationMapVariants }
export type { MiniLocationMapProps, MiniLocationMapGeometry, GeoRing }
