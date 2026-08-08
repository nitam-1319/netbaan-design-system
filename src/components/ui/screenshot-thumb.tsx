"use client";

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { MEDIA_FRAME, MEDIA_HATCH, MEDIA_SIZE } from "@/lib/media"

/**
 * AEGIS — Screenshot Thumb
 *
 * The capture strip that opens an asset card: a website screenshot rendered at a
 * fixed media height, cropped to fill. When no capture exists — not yet taken,
 * failed, or the host serves nothing — it degrades to a quiet hatched slot with a
 * mono caption instead of a broken image or an empty gap, so a grid of cards keeps
 * its rhythm whatever the data does.
 *
 *   <ScreenshotThumb
 *     src={asset.thumbnail}
 *     alt={`Screenshot of ${asset.host}`}
 *     emptyLabel="No screenshot yet"
 *   />
 *
 * The image is lazy by default — a card grid mounts many at once and only the
 * first screenful is worth fetching eagerly. A load error falls back to the same
 * empty slot, so a dead URL and a missing one look identical.
 *
 * Pairs with `AssetTriageCard`, which supplies it as the `media` slot; the sibling
 * `MiniLocationMap` fills the same slot for assets whose defining visual is where
 * they are rather than what they look like.
 *
 * Public API is CLOSED — no `className` / `style`; the media height is the typed
 * `size` prop. Colour is token-only. See `.agent/rules/API_RULES.md`.
 */

const thumbVariants = cva(MEDIA_FRAME, {
  variants: { size: MEDIA_SIZE },
  defaultVariants: { size: "md" },
})

type ScreenshotThumbProps = VariantProps<typeof thumbVariants> & {
  /** Capture URL. Omitted, null, or failing to load renders the empty slot. */
  src?: string | null
  /** Accessible description of the capture — e.g. "Screenshot of example.com". */
  alt?: string
  /** Caption for the empty slot (e.g. "No screenshot yet"). Required. */
  emptyLabel: string
  /** Image loading strategy. Default `"lazy"` — a card grid mounts many at once. */
  loading?: "lazy" | "eager"
}

function ScreenshotThumb({
  src,
  alt,
  emptyLabel,
  size,
  loading = "lazy",
}: ScreenshotThumbProps) {
  // Remember WHICH src failed, not merely that one did: a changed src then
  // retries by itself, so one dead URL cannot poison the slot for every asset
  // that later recycles this node.
  const [failedSrc, setFailedSrc] = React.useState<string | null>(null)

  const hasImage = src != null && src !== "" && failedSrc !== src

  return (
    <div
      data-slot="screenshot-thumb"
      data-empty={hasImage ? undefined : ""}
      className={cn(thumbVariants({ size }), !hasImage && MEDIA_HATCH)}
    >
      {hasImage ? (
        <img
          data-slot="screenshot-thumb-image"
          src={src}
          alt={alt ?? ""}
          loading={loading}
          decoding="async"
          onError={() => setFailedSrc(src)}
          className="size-full object-cover object-top"
        />
      ) : (
        <span
          data-slot="screenshot-thumb-empty"
          className="px-3 text-center font-mono text-[11px] text-muted-foreground"
        >
          {emptyLabel}
        </span>
      )}
    </div>
  )
}

export { ScreenshotThumb, thumbVariants as screenshotThumbVariants }
export type { ScreenshotThumbProps }
