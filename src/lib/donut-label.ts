/**
 * AEGIS — shared centre-label fit for donut rings.
 *
 * Every donut in the system has a FIXED hole, so when the total gets longer the
 * type has to give, never the ring. At a fixed size, three- and four-digit totals
 * overflowed the hole, collided with the ring, and pushed the surrounding card
 * taller than its neighbours.
 *
 * The ladder lives here, not in each component, so `SeverityDonut` (58/84) and
 * `BreakdownDonut` (84/108) cannot drift apart — and so no consumer can override
 * it back to a fixed size.
 *
 * Steps are keyed by the length of the FORMATTED string: thousands separators
 * count, so `3,412` is five characters, not four.
 *
 * Internal module — not exported from the package barrel.
 */

/** `[maxChars, fontSizePx]`, first match wins. */
type LabelStep = readonly [number, number]

/**
 * Ladders by hole diameter, expressed as the ring's box size. 58 → 26px hole,
 * 84 → 42px hole, 108 → 54px hole.
 */
const LADDERS: Record<number, readonly LabelStep[]> = {
  58: [
    [2, 15],
    [3, 12.5],
    [4, 10.5],
    [Infinity, 9],
  ],
  84: [
    [3, 17],
    [4, 15],
    [6, 13],
    [Infinity, 11],
  ],
  // No spec rung for the 108px ring; scaled from 84 by the hole ratio (54/42)
  // and rounded to the nearest half-pixel so it stays on the type grid.
  108: [
    [3, 22],
    [4, 19],
    [6, 16.5],
    [Infinity, 14],
  ],
}

/**
 * Font size (px) for `text` inside a ring of `box` px. Unknown box sizes fall
 * back to the nearest defined ladder rather than a fixed guess.
 */
export function donutLabelSize(box: number, text: string): number {
  const ladder =
    LADDERS[box] ??
    LADDERS[
      Object.keys(LADDERS)
        .map(Number)
        .reduce((best, k) => (Math.abs(k - box) < Math.abs(best - box) ? k : best))
    ]
  for (const [maxChars, px] of ladder) if (text.length <= maxChars) return px
  return ladder[ladder.length - 1][1]
}
