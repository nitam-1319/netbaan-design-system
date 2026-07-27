import * as React from "react"

import { cn } from "@/lib/utils"
import { CHART_PALETTE, type ChartColorIndex } from "@/components/ui/chart-container"

/**
 * AEGIS — Network Graph (Data Visualization)
 *
 * A node-link diagram: circular nodes connected by edges. Positions are
 * caller-supplied normalised coordinates (`x` / `y` in the unit square `[0,1]`),
 * so the graph renders identically headless — there is NO force simulation,
 * NO physics, and NO layout randomness. The caller owns placement (from a
 * precomputed layout, a fixed topology, or hand-tuned coordinates); the
 * component owns the deterministic mapping into pixels, the token-driven look,
 * and the accessible scaffolding.
 *
 * Nodes take a chart-palette colour; edges are drawn first (under the nodes) in
 * the neutral `border` token, their thickness proportional to an optional
 * `value`. Directed graphs (`directed`) add an arrowhead near the target,
 * backed off by the target node's radius. Node labels are real text, so meaning
 * never rests on colour alone.
 *
 * SCOPE: a static renderer — hover highlighting, drag-to-reposition, zoom/pan,
 * and automatic force/hierarchical layout are out of scope (the caller provides
 * coordinates), consistent with the honestly-scoped chart precedents. Pair with
 * a table or list for a complete non-visual account of the topology.
 *
 * Public API is CLOSED — no `className` / `style`. Colour is token-only; sizes
 * are numeric props. See `.agent/rules/API_RULES.md` and `.agent/rules/TOKEN_RULES.md`.
 */

type NetworkGraphNode = {
  /** Stable identifier referenced by links. */
  id: string
  /** Human label drawn beneath the node. Falls back to `id`. */
  label?: string
  /** Horizontal position in the unit square `[0,1]` (clamped). */
  x: number
  /** Vertical position in the unit square `[0,1]` (clamped, top→bottom). */
  y: number
  /** Palette slot (1–5). Defaults by node order, wrapping after five. */
  color?: ChartColorIndex
  /** Node radius override, px. Defaults to `nodeRadius`. */
  size?: number
}

type NetworkGraphLink = {
  /** Source node id. */
  source: string
  /** Target node id. */
  target: string
  /** Edge magnitude — sets line thickness (relative to the largest value). */
  value?: number
}

type NetworkGraphProps = Omit<
  React.ComponentProps<"figure">,
  "className" | "style" | "children"
> & {
  /** Accessible name for the diagram. Always provide one. */
  label: string
  /** Graph nodes with normalised coordinates. */
  nodes: NetworkGraphNode[]
  /** Edges between nodes. */
  links: NetworkGraphLink[]
  /** SVG width in user units. Default `640`. */
  width?: number
  /** SVG height in user units. Default `420`. */
  height?: number
  /** Default node radius, px. Default `9`. */
  nodeRadius?: number
  /** Draw an arrowhead at each edge's target end. Default `false`. */
  directed?: boolean
}

const clamp01 = (n: number) => (Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0)
const LABEL_GAP = 4
const MIN_EDGE = 1
const MAX_EDGE = 4
const ARROW_LEN = 9
const ARROW_HALF = 4

function NetworkGraph({
  label,
  nodes,
  links,
  width = 640,
  height = 420,
  nodeRadius = 9,
  directed = false,
  ...props
}: NetworkGraphProps) {
  const layout = React.useMemo(() => {
    const radiusOf = (n: NetworkGraphNode) =>
      Math.max(2, Number.isFinite(n.size as number) ? (n.size as number) : nodeRadius)

    const maxR = nodes.reduce((m, n) => Math.max(m, radiusOf(n)), nodeRadius)
    const padX = maxR + 4
    const padTop = maxR + 4
    // Extra room beneath the lowest node for its text label.
    const padBottom = maxR + 4 + 12 + LABEL_GAP

    const innerW = Math.max(1, width - padX * 2)
    const innerH = Math.max(1, height - padTop - padBottom)

    type Placed = { id: string; cx: number; cy: number; r: number }
    const placed: Record<string, Placed> = {}
    for (const n of nodes) {
      placed[n.id] = {
        id: n.id,
        cx: padX + clamp01(n.x) * innerW,
        cy: padTop + clamp01(n.y) * innerH,
        r: radiusOf(n),
      }
    }

    const idSet = new Set(nodes.map((n) => n.id))
    const valid = links.filter(
      (l) => idSet.has(l.source) && idSet.has(l.target) && l.source !== l.target
    )
    const maxV = valid.reduce(
      (m, l) => (Number.isFinite(l.value as number) ? Math.max(m, l.value as number) : m),
      0
    )

    const edges = valid.map((l, i) => {
      const s = placed[l.source]
      const t = placed[l.target]
      const dx = t.cx - s.cx
      const dy = t.cy - s.cy
      const len = Math.hypot(dx, dy) || 1
      const ux = dx / len
      const uy = dy / len
      // Stop the line at the node rims so it never overlaps a circle.
      const x1 = s.cx + ux * s.r
      const y1 = s.cy + uy * s.r
      const x2 = t.cx - ux * t.r
      const y2 = t.cy - uy * t.r
      const w =
        maxV > 0 && Number.isFinite(l.value as number)
          ? MIN_EDGE + ((l.value as number) / maxV) * (MAX_EDGE - MIN_EDGE)
          : 1.5
      // Arrowhead triangle at the (backed-off) target end.
      const ax = x2
      const ay = y2
      const bx = x2 - ux * ARROW_LEN
      const by = y2 - uy * ARROW_LEN
      const px = -uy
      const py = ux
      const arrow = `${ax},${ay} ${bx + px * ARROW_HALF},${by + py * ARROW_HALF} ${bx - px * ARROW_HALF},${by - py * ARROW_HALF}`
      return { key: `${l.source}-${l.target}-${i}`, x1, y1, x2, y2, w, arrow }
    })

    return { placed, edges }
  }, [nodes, links, width, height, nodeRadius])

  const colorOf = (id: string) => {
    const idx = nodes.findIndex((n) => n.id === id)
    const node = nodes[idx]
    const ci = (node?.color ?? ((idx % CHART_PALETTE.length) + 1)) as ChartColorIndex
    return `var(${CHART_PALETTE[ci - 1]})`
  }

  const labelFor = (id: string) => nodes.find((n) => n.id === id)?.label ?? id

  return (
    <figure
      data-slot="network-graph"
      role="group"
      aria-label={label}
      className={cn("w-full text-foreground [&_svg]:overflow-visible")}
      {...props}
    >
      <svg
        data-slot="network-graph-plot"
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={label}
        className={cn("block h-auto w-full")}
      >
        {/* Edges first, so nodes sit on top. */}
        <g data-slot="network-graph-edges" aria-hidden>
          {layout.edges.map((e) => (
            <g key={e.key} data-slot="network-graph-edge">
              <line
                x1={e.x1}
                y1={e.y1}
                x2={e.x2}
                y2={e.y2}
                strokeWidth={e.w}
                strokeLinecap="round"
                className="stroke-border"
              />
              {directed ? (
                <polygon points={e.arrow} className="fill-border" />
              ) : null}
            </g>
          ))}
        </g>
        {/* Nodes + labels. */}
        <g data-slot="network-graph-nodes">
          {nodes.map((n) => {
            const p = layout.placed[n.id]
            if (!p) return null
            return (
              <g key={n.id} data-slot="network-graph-node">
                <circle cx={p.cx} cy={p.cy} r={p.r} fill={colorOf(n.id)} />
                <text
                  x={p.cx}
                  y={p.cy + p.r + LABEL_GAP}
                  textAnchor="middle"
                  dominantBaseline="hanging"
                  className="fill-foreground text-[11px]"
                >
                  {labelFor(n.id)}
                </text>
              </g>
            )
          })}
        </g>
      </svg>
    </figure>
  )
}

export { NetworkGraph }
export type { NetworkGraphProps, NetworkGraphNode, NetworkGraphLink }
