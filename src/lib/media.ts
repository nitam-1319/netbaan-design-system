/**
 * AEGIS — shared internals for asset-card media slots.
 *
 * `ScreenshotThumb` and `MiniLocationMap` are interchangeable fillers for the same
 * slot in `AssetTriageCard`: a domain card opens with what the host looks like, an
 * IP card with where it is. They must therefore agree exactly on media height and
 * on how an absent value is drawn, or a mixed grid loses its baseline.
 *
 * Internal module — not exported from the package barrel.
 */

/** Media-strip heights. The middle rung is the asset-card default. */
export const MEDIA_SIZE = {
  sm: "h-[104px]",
  md: "h-[132px]",
  lg: "h-[168px]",
} as const

/**
 * Shared frame for both media slots: full-bleed band on `--surface-2`, closed by
 * a hairline that separates the picture from the card body beneath it.
 */
export const MEDIA_FRAME =
  "relative flex w-full items-center justify-center overflow-hidden border-b border-border bg-surface-2"

/**
 * The empty-slot fill: a 135° hatch ruled in `--surface-3`. Written as an
 * arbitrary gradient because Tailwind ships no hatch utility — every stop is
 * still a token reference, never a colour literal.
 */
export const MEDIA_HATCH =
  "bg-[repeating-linear-gradient(135deg,var(--color-surface-3)_0px,var(--color-surface-3)_1px,transparent_1px,transparent_7px)]"
