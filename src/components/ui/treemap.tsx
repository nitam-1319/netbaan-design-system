
import { cn } from "@/lib/utils"
import {
  ChartContainer,
  useChart,
  type ChartColorIndex,
} from "@/components/ui/chart-container"

/**
 * AEGIS — Treemap
 *
 * A space-filling chart where each item is a rectangle sized in proportion to its
 * value — asset counts by group, spend by category, findings by service. It
 * composes the AEGIS `Chart Container` (figure role, accessible name, palette) and
 * lays items out with a deterministic recursive split (area ∝ value).
 *
 * Each tile's value is in its accessible name and (space permitting) its visible
 * label, never colour alone. A static, deterministic renderer. Public API is
 * CLOSED — no `className` / `style`. Colour is token-only.
 * See `.agent/rules/API_RULES.md`.
 */

type TreemapItem = {
  /** Stable key (colour + legend). Falls back to the label. */
  key?: string
  /** Tile label. */
  label: string
  /** Tile value (drives area). */
  value: number
  /** Palette slot (1–5). Omit to auto-assign by order. */
  color?: ChartColorIndex
}

type Rect = { x: number; y: number; w: number; h: number }
type PlacedItem = TreemapItem & Rect & { id: string }

type TreemapProps = {
  /** Accessible chart name. Required. */
  label: string
  /** The items to lay out. */
  items: TreemapItem[]
  /** Tile height of the map in px. Default 320. */
  height?: number
  /** Format a tile value (visible + accessible). Defaults to locale integer. */
  valueFormat?: (value: number) => string
}

const nf = new Intl.NumberFormat("en")

/**
 * Deterministic slice-and-dice layout: split the list into two value-balanced
 * groups, divide the rect proportionally along its longer side, and recurse.
 */
function layout(items: TreemapItem[], rect: Rect): PlacedItem[] {
  if (items.length === 0) return []
  if (items.length === 1) {
    const it = items[0]
    return [{ ...it, ...rect, id: it.key ?? it.label }]
  }
  const total = items.reduce((s, it) => s + Math.max(0, it.value), 0) || 1
  const half = total / 2
  let acc = 0
  let split = 0
  for (let i = 0; i < items.length - 1; i++) {
    if (acc + Math.max(0, items[i].value) > half && i > 0) break
    acc += Math.max(0, items[i].value)
    split = i + 1
  }
  const groupA = items.slice(0, split)
  const groupB = items.slice(split)
  const sumA = groupA.reduce((s, it) => s + Math.max(0, it.value), 0)
  const fracA = sumA / total

  if (rect.w >= rect.h) {
    const wA = rect.w * fracA
    return [
      ...layout(groupA, { ...rect, w: wA }),
      ...layout(groupB, { x: rect.x + wA, y: rect.y, w: rect.w - wA, h: rect.h }),
    ]
  }
  const hA = rect.h * fracA
  return [
    ...layout(groupA, { ...rect, h: hA }),
    ...layout(groupB, { x: rect.x, y: rect.y + hA, w: rect.w, h: rect.h - hA }),
  ]
}

function TreemapTiles({
  items,
  height,
  valueFormat,
}: {
  items: TreemapItem[]
  height: number
  valueFormat: (v: number) => string
}) {
  const { seriesByKey } = useChart()
  // Lay out in a 100×100 space, then position tiles as percentages.
  const sorted = [...items].sort((a, b) => b.value - a.value)
  const placed = layout(sorted, { x: 0, y: 0, w: 100, h: 100 })

  return (
    <div
      data-slot="treemap"
      role="group"
      className="relative w-full overflow-hidden rounded-lg"
      style={{ height }}
    >
      {placed.map((p) => {
        const color = seriesByKey[p.id]?.colorVar ?? "var(--color-chart-1)"
        const bigEnough = p.w > 14 && p.h > 14
        return (
          <div
            key={p.id}
            data-slot="treemap-tile"
            data-tile={p.id}
            role="img"
            aria-label={`${p.label}: ${valueFormat(p.value)}`}
            className={cn(
              "absolute flex flex-col justify-end overflow-hidden rounded-md p-2",
              "border border-background"
            )}
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.w}%`,
              height: `${p.h}%`,
              backgroundColor: color,
            }}
          >
            {bigEnough ? (
              <span aria-hidden className="text-on-tone">
                <span className="block truncate text-xs font-semibold leading-tight">
                  {p.label}
                </span>
                <span className="block text-[11px] tabular-nums opacity-90">
                  {valueFormat(p.value)}
                </span>
              </span>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

function Treemap({
  label,
  items,
  height = 320,
  valueFormat = (v) => nf.format(v),
}: TreemapProps) {
  const seriesMeta = items.map((it) => ({
    key: it.key ?? it.label,
    label: it.label,
    color: it.color,
  }))

  return (
    <ChartContainer label={label} series={seriesMeta}>
      <TreemapTiles items={items} height={height} valueFormat={valueFormat} />
    </ChartContainer>
  )
}

export { Treemap }
export type { TreemapProps, TreemapItem }
