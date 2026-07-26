import * as React from "react"

import { cn } from "@/lib/utils"
import { CHART_PALETTE, type ChartColorIndex } from "@/components/ui/chart-container"

/**
 * AEGIS — Sankey Diagram (Data Visualization)
 *
 * A flow diagram: nodes arranged in columns, linked by ribbons whose thickness
 * is proportional to the value that flows between them. It computes a
 * deterministic left→right layered layout from a directed acyclic graph of
 * `nodes` + `links` — node columns by longest path from a source, node heights
 * and ribbon widths by a single shared value→pixel scale — so it renders
 * identically headless with no force simulation.
 *
 * It reuses the AEGIS chart palette (`--color-chart-*`); each node takes a
 * palette colour and its outgoing ribbons inherit it (translucent). Node labels
 * are real text, so meaning never rests on colour alone.
 *
 * SCOPE: a static renderer — hover highlighting, drag-to-reorder, and cyclic
 * graphs are out of scope (assumes a DAG; a node in a cycle falls back to
 * column 0), consistent with the honestly-scoped chart precedents. Flows read
 * left→right (LTR) by convention; pair with a table for a non-visual account.
 *
 * Public API is CLOSED — no `className` / `style`. Colour is token-only; sizes
 * are numeric props. See `.agent/rules/API_RULES.md` and `.agent/rules/TOKEN_RULES.md`.
 */

type SankeyNode = {
  /** Stable identifier referenced by links. */
  id: string
  /** Human label drawn beside the node. Falls back to `id`. */
  label?: string
  /** Palette slot (1–5). Defaults by node order, wrapping after five. */
  color?: ChartColorIndex
}

type SankeyLink = {
  /** Source node id. */
  source: string
  /** Target node id. */
  target: string
  /** Flow magnitude — sets ribbon thickness. */
  value: number
}

type SankeyDiagramProps = Omit<
  React.ComponentProps<"figure">,
  "className" | "style" | "children"
> & {
  /** Accessible name for the diagram. Always provide one. */
  label: string
  /** Graph nodes. */
  nodes: SankeyNode[]
  /** Directed links between nodes. */
  links: SankeyLink[]
  /** SVG width in user units. Default `720`. */
  width?: number
  /** SVG height in user units. Default `360`. */
  height?: number
  /** Node column thickness, px. Default `14`. */
  nodeWidth?: number
  /** Vertical gap between stacked nodes in a column, px. Default `16`. */
  nodePadding?: number
}

const MARGIN = { top: 8, right: 8, bottom: 8, left: 8 }
const LABEL_GAP = 6

function SankeyDiagram({
  label,
  nodes,
  links,
  width = 720,
  height = 360,
  nodeWidth = 14,
  nodePadding = 16,
  ...props
}: SankeyDiagramProps) {
  const layout = React.useMemo(() => {
    const ids = nodes.map((n) => n.id)
    const idSet = new Set(ids)
    const incoming: Record<string, SankeyLink[]> = {}
    const outgoing: Record<string, SankeyLink[]> = {}
    for (const id of ids) {
      incoming[id] = []
      outgoing[id] = []
    }
    const validLinks = links.filter((l) => idSet.has(l.source) && idSet.has(l.target))
    for (const l of validLinks) {
      outgoing[l.source].push(l)
      incoming[l.target].push(l)
    }

    // Column (layer) by longest path from a source; cycle-safe via a visited set.
    const layerCache: Record<string, number> = {}
    const layerOf = (id: string, stack: Set<string>): number => {
      if (layerCache[id] !== undefined) return layerCache[id]
      if (stack.has(id)) return 0
      const ins = incoming[id]
      if (ins.length === 0) return (layerCache[id] = 0)
      stack.add(id)
      let max = 0
      for (const l of ins) max = Math.max(max, layerOf(l.source, stack) + 1)
      stack.delete(id)
      return (layerCache[id] = max)
    }
    for (const id of ids) layerOf(id, new Set())

    const maxLayer = ids.reduce((m, id) => Math.max(m, layerCache[id]), 0)

    // Node throughput = max(sum in, sum out).
    const value: Record<string, number> = {}
    for (const id of ids) {
      const inSum = incoming[id].reduce((s, l) => s + l.value, 0)
      const outSum = outgoing[id].reduce((s, l) => s + l.value, 0)
      value[id] = Math.max(inSum, outSum, 0)
    }

    // Group node ids by column, preserving declaration order.
    const columns: string[][] = Array.from({ length: maxLayer + 1 }, () => [])
    for (const id of ids) columns[layerCache[id]].push(id)

    const plotTop = MARGIN.top
    const plotHeight = Math.max(0, height - MARGIN.top - MARGIN.bottom)
    const plotLeft = MARGIN.left
    const plotWidth = Math.max(0, width - MARGIN.left - MARGIN.right)

    // One shared value→px scale so ribbon widths are comparable everywhere; pick
    // the tightest column so none overflows its available height.
    let scale = Infinity
    for (const col of columns) {
      if (col.length === 0) continue
      const total = col.reduce((s, id) => s + value[id], 0) || 1
      const avail = Math.max(1, plotHeight - nodePadding * (col.length - 1))
      scale = Math.min(scale, avail / total)
    }
    if (!Number.isFinite(scale)) scale = 1

    const xOfLayer = (layer: number) =>
      maxLayer === 0 ? plotLeft : plotLeft + (layer / maxLayer) * (plotWidth - nodeWidth)

    type Placed = { id: string; x: number; y: number; h: number; layer: number }
    const placed: Record<string, Placed> = {}
    columns.forEach((col, layer) => {
      const totalH = col.reduce((s, id) => s + value[id] * scale, 0) + nodePadding * (col.length - 1)
      let y = plotTop + (plotHeight - totalH) / 2
      for (const id of col) {
        const h = Math.max(2, value[id] * scale)
        placed[id] = { id, x: xOfLayer(layer), y, h, layer }
        y += h + nodePadding
      }
    })

    // Ribbon endpoints: accumulate offsets down each node's edge, in link order.
    const srcOffset: Record<string, number> = {}
    const tgtOffset: Record<string, number> = {}
    for (const id of ids) {
      srcOffset[id] = 0
      tgtOffset[id] = 0
    }
    const ribbons = validLinks.map((l, i) => {
      const s = placed[l.source]
      const t = placed[l.target]
      const w = Math.max(1, l.value * scale)
      const sy = s.y + srcOffset[l.source] + w / 2
      const ty = t.y + tgtOffset[l.target] + w / 2
      srcOffset[l.source] += w
      tgtOffset[l.target] += w
      const x0 = s.x + nodeWidth
      const x1 = t.x
      const mx = (x0 + x1) / 2
      const d = `M${x0},${sy} C${mx},${sy} ${mx},${ty} ${x1},${ty}`
      return { key: `${l.source}-${l.target}-${i}`, d, w, source: l.source }
    })

    return { placed, ribbons, columns, maxLayer, plotLeft, plotWidth }
  }, [nodes, links, width, height, nodeWidth, nodePadding])

  const colorOf = (id: string) => {
    const idx = nodes.findIndex((n) => n.id === id)
    const node = nodes[idx]
    const ci = (node?.color ?? ((idx % CHART_PALETTE.length) + 1)) as ChartColorIndex
    return `var(${CHART_PALETTE[ci - 1]})`
  }

  const labelFor = (id: string) => nodes.find((n) => n.id === id)?.label ?? id

  return (
    <figure
      data-slot="sankey-diagram"
      role="group"
      aria-label={label}
      className={cn("w-full text-foreground [&_svg]:overflow-visible")}
      {...props}
    >
      <svg
        data-slot="sankey-plot"
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={label}
        className={cn("block h-auto w-full")}
      >
        {/* Ribbons first, so nodes sit on top. */}
        <g data-slot="sankey-links" aria-hidden fill="none">
          {layout.ribbons.map((r) => (
            <path
              key={r.key}
              data-slot="sankey-link"
              d={r.d}
              stroke={colorOf(r.source)}
              strokeOpacity={0.28}
              strokeWidth={r.w}
            />
          ))}
        </g>
        {/* Nodes + labels. */}
        <g data-slot="sankey-nodes" aria-hidden>
          {Object.values(layout.placed).map((p) => {
            const isLast = p.layer === layout.maxLayer
            return (
              <g key={p.id} data-slot="sankey-node">
                <rect
                  x={p.x}
                  y={p.y}
                  width={nodeWidth}
                  height={p.h}
                  rx={2}
                  fill={colorOf(p.id)}
                />
                <text
                  x={isLast ? p.x - LABEL_GAP : p.x + nodeWidth + LABEL_GAP}
                  y={p.y + p.h / 2}
                  textAnchor={isLast ? "end" : "start"}
                  dominantBaseline="middle"
                  className="fill-foreground text-[11px]"
                >
                  {labelFor(p.id)}
                </text>
              </g>
            )
          })}
        </g>
      </svg>
    </figure>
  )
}

export { SankeyDiagram }
export type { SankeyDiagramProps, SankeyNode, SankeyLink }
