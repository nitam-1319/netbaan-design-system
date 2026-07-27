import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { GeoChoroplethMap } from "@/components/ui/geo-choropleth-map"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component. Region paths are caller-supplied,
 * already-projected SVG geometry — the component runs no projection. The demo
 * uses a simple synthetic grid of rectangles in place of real map paths.
 */
const meta = {
  title: "Components/GeoChoroplethMap",
  component: GeoChoroplethMap,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    steps: { control: { type: "number" } },
    showLegend: { control: { type: "boolean" } },
  },
} satisfies Meta<typeof GeoChoroplethMap>

export default meta
type Story = StoryObj<typeof meta>

// A synthetic 3×2 grid standing in for projected region outlines.
const rect = (col: number, row: number) => {
  const x = col * 100 + 10
  const y = row * 100 + 10
  return `M${x},${y} h80 v80 h-80 Z`
}

const regions = [
  { id: "r1", label: "North", d: rect(0, 0), value: 1200 },
  { id: "r2", label: "Central", d: rect(1, 0), value: 4800 },
  { id: "r3", label: "East", d: rect(2, 0), value: 300 },
  { id: "r4", label: "South", d: rect(0, 1), value: 2600 },
  { id: "r5", label: "West", d: rect(1, 1), value: 900 },
  { id: "r6", label: "Islands", d: rect(2, 1) }, // no value → "no data"
]

export const Default: Story = {
  args: {
    label: "Requests by region",
    regions,
    viewBox: "0 0 310 210",
    steps: 5,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    expect(canvas.getByRole("img", { name: "Requests by region" })).toBeInTheDocument()
    // One path per region.
    expect(canvasElement.querySelectorAll('[data-slot="geo-choropleth-region"]').length).toBe(
      regions.length
    )
    // Exactly one region has no value → marked no-data.
    expect(canvasElement.querySelectorAll("[data-nodata]").length).toBe(1)
    // Legend renders one item per bucket.
    expect(
      canvasElement.querySelectorAll('[data-slot="geo-choropleth-legend-item"]').length
    ).toBe(5)
  },
}

export const NoLegend: Story = {
  args: {
    label: "Coverage",
    regions,
    viewBox: "0 0 310 210",
    showLegend: false,
  },
  play: async ({ canvasElement }) => {
    expect(canvasElement.querySelector('[data-slot="geo-choropleth-legend"]')).toBeNull()
  },
}
