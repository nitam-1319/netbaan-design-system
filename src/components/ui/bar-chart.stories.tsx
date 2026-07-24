import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { BarChart } from "@/components/ui/bar-chart"

/**
 * Bar / Column Chart is config-driven and composes the AEGIS chart foundation
 * (`ChartContainer` + `Axis` with band-centred category ticks + `ChartLegend`).
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global toolbar.
 */
const meta = {
  title: "Components/BarChart",
  component: BarChart,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    stacked: { control: "boolean" },
    showGrid: { control: "boolean" },
    showXAxis: { control: "boolean" },
    showYAxis: { control: "boolean" },
    showLegend: { control: "boolean" },
    bandPadding: { control: { type: "range", min: 0.2, max: 1, step: 0.05 } },
    yTickCount: { control: { type: "number" } },
  },
} satisfies Meta<typeof BarChart>

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
    stacked: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const img = canvas.getByRole("img", { name: "Findings by severity (stacked)" })
    await expect(img.querySelectorAll("[data-slot=bar-chart-bar]")).toHaveLength(18)
  },
}

export const SingleSeries: Story = {
  args: {
    label: "Monthly signups",
    data: [
      { month: "Jan", signups: 120 },
      { month: "Feb", signups: 180 },
      { month: "Mar", signups: 150 },
      { month: "Apr", signups: 240 },
      { month: "May", signups: 200 },
      { month: "Jun", signups: 300 },
    ],
    xKey: "month",
    series: [{ key: "signups", label: "Signups", color: 4 }],
  },
}

export const FormattedAxis: Story = {
  args: {
    label: "Revenue by quarter",
    data: [
      { q: "Q1", revenue: 42000 },
      { q: "Q2", revenue: 58000 },
      { q: "Q3", revenue: 51000 },
      { q: "Q4", revenue: 73000 },
    ],
    xKey: "q",
    series: [{ key: "revenue", label: "Revenue", color: 3 }],
    yFormat: (v) => `$${(v / 1000).toFixed(0)}k`,
  },
}
