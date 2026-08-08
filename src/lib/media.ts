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

/**
 * Media-strip heights. The middle rung is the asset-card default.
 *
 * These are fixed heights, not minimums, and `MEDIA_FRAME` carries `shrink-0`:
 * the slot occupies exactly the same band whether it holds a capture, a map, or
 * the empty state, so every card in a grid keeps one silhouette and one baseline.
 */
export const MEDIA_SIZE = {
  sm: "h-[104px]",
  md: "h-[132px]",
  lg: "h-[168px]",
  /**
   * Detail-page rung. A card grid is scanned, so its media only has to be
   * recognisable; a detail page's evidence is *read*, and a capture at 168px is
   * too short to make out a login form or a default vhost page. Reserved for a
   * single, full-width evidence strip — not for anything that repeats in a grid.
   */
  xl: "h-[240px]",
} as const

/**
 * Layout for the empty slot's contents: the icon and its caption stacked and
 * centred in the band.
 */
export const MEDIA_EMPTY_STACK =
  "flex flex-col items-center justify-center gap-1.5 px-3 text-center text-muted-foreground"

/**
 * Shared frame for both media slots: full-bleed band on `--surface-2`, closed by
 * a hairline that separates the picture from the card body beneath it.
 */
export const MEDIA_FRAME =
  "relative flex w-full shrink-0 items-center justify-center overflow-hidden border-b border-border bg-surface-2"

/**
 * The empty-slot fill: a 135° hatch ruled in `--surface-3`. Written as an
 * arbitrary gradient because Tailwind ships no hatch utility — every stop is
 * still a token reference, never a colour literal.
 */
export const MEDIA_HATCH =
  "bg-[repeating-linear-gradient(135deg,var(--color-surface-3)_0px,var(--color-surface-3)_1px,transparent_1px,transparent_7px)]"
