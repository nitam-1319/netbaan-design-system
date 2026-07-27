import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { NetworkGraph } from "@/components/ui/network-graph"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component. Node coordinates are caller-supplied unit
 * `[0,1]` positions — the component runs no force simulation.
 */
const meta = {
  title: "Components/NetworkGraph",
  component: NetworkGraph,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    nodeRadius: { control: { type: "number" } },
    directed: { control: { type: "boolean" } },
  },
} satisfies Meta<typeof NetworkGraph>

export default meta
type Story = StoryObj<typeof meta>

const nodes = [
  { id: "gw", label: "Gateway", x: 0.5, y: 0.12, size: 13 },
  { id: "web", label: "Web", x: 0.16, y: 0.45 },
  { id: "api", label: "API", x: 0.5, y: 0.5 },
  { id: "auth", label: "Auth", x: 0.84, y: 0.45 },
  { id: "db", label: "Database", x: 0.32, y: 0.85 },
  { id: "cache", label: "Cache", x: 0.68, y: 0.85 },
]

const links = [
  { source: "gw", target: "web", value: 8 },
  { source: "gw", target: "api", value: 10 },
  { source: "gw", target: "auth", value: 4 },
  { source: "api", target: "db", value: 7 },
  { source: "api", target: "cache", value: 5 },
  { source: "web", target: "api", value: 6 },
  { source: "auth", target: "db", value: 3 },
]

export const Default: Story = {
  args: {
    label: "Service topology",
    nodes,
    links,
    width: 640,
    height: 420,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    expect(canvas.getByRole("img", { name: "Service topology" })).toBeInTheDocument()
    // One edge group per valid link, one node group per node.
    expect(canvasElement.querySelectorAll('[data-slot="network-graph-edge"]').length).toBe(
      links.length
    )
    expect(canvasElement.querySelectorAll('[data-slot="network-graph-node"]').length).toBe(
      nodes.length
    )
    // Labels render as real text.
    expect(canvas.getByText("Gateway")).toBeInTheDocument()
    expect(canvas.getByText("Database")).toBeInTheDocument()
  },
}

export const Directed: Story = {
  args: {
    label: "Request flow",
    nodes,
    links,
    width: 640,
    height: 420,
    directed: true,
  },
  play: async ({ canvasElement }) => {
    // Directed mode adds one arrowhead polygon per edge.
    expect(canvasElement.querySelectorAll('[data-slot="network-graph-edge"] polygon').length).toBe(
      links.length
    )
  },
}

export const SelfLinkAndUnknownDropped: Story = {
  args: {
    label: "Filtered edges",
    nodes: [
      { id: "a", label: "Alpha", x: 0.2, y: 0.3 },
      { id: "b", label: "Beta", x: 0.8, y: 0.3 },
      { id: "c", label: "Gamma", x: 0.5, y: 0.8 },
    ],
    links: [
      { source: "a", target: "b" },
      { source: "b", target: "c" },
      { source: "a", target: "a" }, // self-link → dropped
      { source: "a", target: "ghost" }, // unknown target → dropped
    ],
    width: 480,
    height: 320,
  },
  play: async ({ canvasElement }) => {
    // Two valid edges remain; self-link and unknown-target edges are filtered out.
    expect(canvasElement.querySelectorAll('[data-slot="network-graph-edge"]').length).toBe(2)
  },
}
