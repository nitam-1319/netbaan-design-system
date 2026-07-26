import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { SankeyDiagram } from "@/components/ui/sankey-diagram"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */
const meta = {
  title: "Components/SankeyDiagram",
  component: SankeyDiagram,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    nodeWidth: { control: { type: "number" } },
    nodePadding: { control: { type: "number" } },
  },
} satisfies Meta<typeof SankeyDiagram>

export default meta
type Story = StoryObj<typeof meta>

const nodes = [
  { id: "visitors", label: "Visitors" },
  { id: "signup", label: "Signed up" },
  { id: "bounced", label: "Bounced" },
  { id: "active", label: "Activated" },
  { id: "churned", label: "Churned" },
  { id: "paying", label: "Paying" },
]

const links = [
  { source: "visitors", target: "signup", value: 40 },
  { source: "visitors", target: "bounced", value: 60 },
  { source: "signup", target: "active", value: 28 },
  { source: "signup", target: "churned", value: 12 },
  { source: "active", target: "paying", value: 18 },
  { source: "active", target: "churned", value: 10 },
]

export const Default: Story = {
  args: {
    label: "Funnel flow",
    nodes,
    links,
    width: 720,
    height: 340,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    expect(canvas.getByRole("img", { name: "Funnel flow" })).toBeInTheDocument()
    // One ribbon per valid link, one node group per node.
    expect(canvasElement.querySelectorAll('[data-slot="sankey-link"]').length).toBe(links.length)
    expect(canvasElement.querySelectorAll('[data-slot="sankey-node"]').length).toBe(nodes.length)
    // Labels render as text.
    expect(canvas.getByText("Paying")).toBeInTheDocument()
    expect(canvas.getByText("Visitors")).toBeInTheDocument()
  },
}

export const Compact: Story = {
  args: {
    label: "Traffic split",
    nodes: [
      { id: "in", label: "Inbound" },
      { id: "web", label: "Web" },
      { id: "api", label: "API" },
    ],
    links: [
      { source: "in", target: "web", value: 70 },
      { source: "in", target: "api", value: 30 },
    ],
    width: 480,
    height: 240,
    nodeWidth: 16,
  },
}
