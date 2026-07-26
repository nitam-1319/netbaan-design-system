import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { GroupedStackedBar } from "@/components/ui/grouped-stacked-bar"

/**
 * Grouped / Stacked Bar is a config-driven convenience over `BarChart` that makes
 * the layout an explicit `mode`. Theme (Light/Dark) and direction (LTR/RTL) come
 * from the global Storybook toolbar.
 */
const meta = {
  title: "Components/GroupedStackedBar",
  component: GroupedStackedBar,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    mode: { control: "inline-radio", options: ["grouped", "stacked"] },
    showGrid: { control: "boolean" },
    showXAxis: { control: "boolean" },
    showYAxis: { control: "boolean" },
    showLegend: { control: "boolean" },
    bandPadding: { control: { type: "range", min: 0.2, max: 1, step: 0.05 } },
  },
} satisfies Meta<typeof GroupedStackedBar>

export default meta
type Story = StoryObj<typeof meta>

const DATA = [
  { month: "Jan", high: 8, medium: 14, low: 20 },
  { month: "Feb", high: 6, medium: 18, low: 24 },
  { month: "Mar", high: 11, medium: 12, low: 19 },
  { month: "Apr", high: 4, medium: 16, low: 27 },
  { month: "May", high: 9, medium: 13, low: 22 },
  { month: "Jun", high: 5, medium: 20, low: 30 },
]

const SEVERITY = [
  { key: "high", label: "High", color: 1 as const },
  { key: "medium", label: "Medium", color: 3 as const },
  { key: "low", label: "Low", color: 5 as const },
]

export const Grouped: Story = {
  args: {
    label: "Findings by severity",
    data: DATA,
    xKey: "month",
    series: SEVERITY,
    mode: "grouped",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const img = canvas.getByRole("img", { name: "Findings by severity" })
    await expect(img).toBeInTheDocument()
    // 6 categories × 3 series = 18 bars
    await expect(img.querySelectorAll("[data-slot=bar-chart-bar]")).toHaveLength(18)
    const xAxis = img.querySelector("[data-slot=axis][data-orientation=bottom]")
    await expect(xAxis!.querySelectorAll("[data-slot=axis-tick]")).toHaveLength(6)
    await expect(canvas.getAllByRole("listitem")).toHaveLength(3)
  },
}

export const Stacked: Story = {
  args: {
    label: "Findings by severity (stacked)",
    data: DATA,
    xKey: "month",
    series: SEVERITY,
    mode: "stacked",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const img = canvas.getByRole("img", { name: "Findings by severity (stacked)" })
    // still one bar per category×series, now stacked
    await expect(img.querySelectorAll("[data-slot=bar-chart-bar]")).toHaveLength(18)
    await expect(canvas.getAllByRole("listitem")).toHaveLength(3)
  },
}

export const TwoSeries: Story = {
  args: {
    label: "Opened vs resolved",
    data: [
      { week: "W1", opened: 12, resolved: 9 },
      { week: "W2", opened: 8, resolved: 14 },
      { week: "W3", opened: 15, resolved: 11 },
      { week: "W4", opened: 6, resolved: 17 },
    ],
    xKey: "week",
    series: [
      { key: "opened", label: "Opened", color: 2 },
      { key: "resolved", label: "Resolved", color: 4 },
    ],
    mode: "grouped",
  },
}
