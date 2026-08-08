"use client";

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { MEDIA_FRAME, MEDIA_HATCH, MEDIA_SIZE } from "@/lib/media"

/**
 * AEGIS — Mini Location Map
 *
 * The locator strip that opens an IP card: a dark regional map cropped around one
 * point, with a pulsing marker and a chip naming the place. Where a domain card
 * shows what a host looks like, an IP card shows where it is — this is the sibling
 * of `ScreenshotThumb` for the same media slot, at the same heights.
 *
 *   <MiniLocationMap
 *     label="Location of 203.0.113.7"
 *     paths={worldLand}
 *     marker={{ x: 512, y: 148 }}
 *     location="Frankfurt, DE"
 *     asn="AS3320"
 *     emptyLabel="Location unknown"
 *   />
 *
 * Like `GeoChoroplethMap`, this is a RENDERER, not a projection: there is no
 * bundled topology and no geographic maths. Run your projection upstream (d3-geo
 * and world-atlas, or whatever the backend serves) and pass the resulting SVG `d`
 * strings in `paths`, plus the marker already projected into that same coordinate
 * space. Projecting once at module scope and reusing it across a grid of cards is
 * far cheaper than projecting per card — the crop is pure viewBox arithmetic.
 *
 * `zoom` crops a window of the full coordinate space around the marker, clamped so
 * the window never runs past the edge of the geometry. Without a marker the whole
 * thing degrades to the shared hatched empty slot: no map, no pin, just the
 * caption — an unplaceable IP should not be drawn somewhere plausible.
 *
 * The marker sits in an HTML overlay rather than inside the SVG so its dot stays a
 * true 9px at any `zoom`. It is NOT mirrored in RTL: geography is not a reading
 * order. The ping obeys `prefers-reduced-motion`.
 *
 * Public API is CLOSED — no `className` / `style`. Colour is token-only.
 * See `.agent/rules/API_RULES.md`.
 */

const mapVariants = cva(MEDIA_FRAME, {
  variants: { size: MEDIA_SIZE },
  defaultVariants: { size: "md" },
})

/** A point already projected into the coordinate space of `paths`. */
type MiniLocationMapMarker = {
  x: number
  y: number
}

type MiniLocationMapProps = VariantProps<typeof mapVariants> & {
  /** Accessible name for the map (e.g. "Location of 203.0.113.7"). Required. */
  label: string
  /** Projected land outlines as SVG `d` strings. Projection runs upstream. */
  paths?: string[]
  /** SVG `viewBox` matching the coordinate space of `paths`. Default `"0 0 960 480"`. */
  viewBox?: string
  /** The projected point to centre on. Omit or null to render the empty slot. */
  marker?: MiniLocationMapMarker | null
  /** How tightly to crop around the marker (1 = whole world). Default `6`. */
  zoom?: number
  /** Place name for the chip (e.g. "Frankfurt, DE"). */
  location?: React.ReactNode
  /** Network operator for the chip, set in mono (e.g. "AS3320"). */
  asn?: React.ReactNode
  /** Caption for the empty slot (e.g. "Location unknown"). Required. */
  emptyLabel: string
}

/** Parse `"minX minY width height"`, falling back to the world frame. */
function parseViewBox(viewBox: string): [number, number, number, number] {
  const parts = viewBox.trim().split(/[\s,]+/).map(Number)
  if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) {
    return [0, 0, 960, 480]
  }
  const [x, y, w, h] = parts
  return w > 0 && h > 0 ? [x, y, w, h] : [0, 0, 960, 480]
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function MiniLocationMap({
  label,
  paths,
  viewBox = "0 0 960 480",
  marker,
  zoom = 6,
  location,
  asn,
  emptyLabel,
  size,
}: MiniLocationMapProps) {
  const placed = marker != null && Number.isFinite(marker.x) && Number.isFinite(marker.y)

  const crop = React.useMemo(() => {
    if (!placed) return null
    const [minX, minY, width, height] = parseViewBox(viewBox)
    const factor = Math.max(1, zoom)
    const cropW = width / factor
    const cropH = height / factor
    // Clamp so the window stays inside the geometry — a marker near the antimeridian
    // must not crop to empty space.
    const cropX = clamp(marker.x - cropW / 2, minX, minX + width - cropW)
    const cropY = clamp(marker.y - cropH / 2, minY, minY + height - cropH)
    return {
      viewBox: `${cropX} ${cropY} ${cropW} ${cropH}`,
      // Marker position as a percentage of the cropped window, for the HTML overlay.
      left: ((marker.x - cropX) / cropW) * 100,
      top: ((marker.y - cropY) / cropH) * 100,
    }
  }, [placed, marker?.x, marker?.y, viewBox, zoom])

  const hasChip = location != null || asn != null

  if (!placed || crop == null) {
    return (
      <div
        data-slot="mini-location-map"
        data-empty=""
        className={cn(mapVariants({ size }), MEDIA_HATCH)}
      >
        <span
          data-slot="mini-location-map-empty"
          className="px-3 text-center font-mono text-[11px] text-muted-foreground"
        >
          {emptyLabel}
        </span>
      </div>
    )
  }

  return (
    <div data-slot="mini-location-map" className={cn(mapVariants({ size }))}>
      <svg
        data-slot="mini-location-map-canvas"
        viewBox={crop.viewBox}
        role="img"
        aria-label={label}
        preserveAspectRatio="xMidYMid slice"
        className="size-full"
      >
        {paths?.map((d, index) => (
          <path
            key={index}
            data-slot="mini-location-map-land"
            d={d}
            className="fill-surface-3 stroke-border"
            strokeWidth={0.5}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>

      <span
        data-slot="mini-location-map-marker"
        aria-hidden
        // Physical left/top on purpose: the pin marks a place, so it must not
        // mirror with reading direction.
        style={{ left: `${crop.left}%`, top: `${crop.top}%` }}
        className="pointer-events-none absolute size-0 text-primary"
      >
        {/* Each child centres on the point by translating half its own size.
            The ring uses the AEGIS signature ping (`--animate-status-ping`), not
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
          {location != null ? <span className="truncate">{location}</span> : null}
          {asn != null ? (
            <span className="shrink-0 font-mono text-muted-foreground">{asn}</span>
          ) : null}
        </span>
      ) : null}
    </div>
  )
}

export { MiniLocationMap, mapVariants as miniLocationMapVariants }
export type { MiniLocationMapProps, MiniLocationMapMarker }
