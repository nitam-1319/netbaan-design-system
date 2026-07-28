import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { StackedAreaChart } from "@/components/ui/stacked-area-chart"

/**
 * Stacked Area Chart is a config-driven convenience over `AreaChart` with the
 * stacking mode fixed. Theme (Light/Dark) and direction (LTR/RTL) come from the
 * global Storybook toolbar.
 */
const meta = {
  title: "Components/StackedAreaChart",
  component: StackedAreaChart,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    normalized: { control: "boolean" },
    showLine: { control: "boolean" },
    showDots: { control: "boolean" },
    showGrid: { control: "boolean" },
    showXAxis: { control: "boolean" },
    showYAxis: { control: "boolean" },
    showLegend: { control: "boolean" },
    width: { control: { type: "number" } },
    height: { control: { type: "number" } },
  },
} satisfies Meta<typeof StackedAreaChart>

export default meta
type Story = StoryObj<typeof meta>

const DATA = [
  { month: "Jan", organic: 30, paid: 18, referral: 8 },
  { month: "Feb", organic: 42, paid: 22, referral: 10 },
  { month: "Mar", organic: 35, paid: 26, referral: 9 },
  { month: "Apr", organic: 50, paid: 24, referral: 14 },
  { month: "May", organic: 44, paid: 33, referral: 12 },
  { month: "Jun", organic: 58, paid: 38, referral: 16 },
]

const SERIES = [
  { key: "organic", label: "Organic" },
  { key: "paid", label: "Paid" },
  { key: "referral", label: "Referral" },
]

export const Default: Story = {
  args: {
    label: "Traffic by source",
    data: DATA,
    xKey: "month",
    series: SERIES,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const img = canvas.getByRole("img", { name: "Traffic by source" })
    await expect(img).toBeInTheDocument()
    // one opaque band per series
    await expect(
      img.querySelectorAll("[data-slot=area-chart-series]")
    ).toHaveLength(3)
    await expect(img.querySelectorAll("[data-slot=area-chart-area]")).toHaveLength(3)
    // x-axis ticks line up with the six data points
    const xAxis = img.querySelector("[data-slot=axis][data-orientation=bottom]")
    await expect(xAxis!.querySelectorAll("[data-slot=axis-tick]")).toHaveLength(6)
    // legend lists the three series
    await expect(canvas.getAllByRole("listitem")).toHaveLength(3)
  },
}

export const Normalized: Story = {
  args: {
    label: "Traffic share",
    data: DATA,
    xKey: "month",
    series: SERIES,
    normalized: true,
    yFormat: (v) => `${Math.round(v * 100)}%`,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const img = canvas.getByRole("img", { name: "Traffic share" })
    await expect(
      img.querySelectorAll("[data-slot=area-chart-series]")
    ).toHaveLength(3)
  },
}

export const WithDots: Story = {
  args: {
    label: "Revenue by tier",
    data: [
      { q: "Q1", starter: 40, pro: 80, enterprise: 30 },
      { q: "Q2", starter: 44, pro: 96, enterprise: 42 },
      { q: "Q3", starter: 50, pro: 110, enterprise: 55 },
      { q: "Q4", starter: 58, pro: 128, enterprise: 72 },
    ],
    xKey: "q",
    series: [
      { key: "starter", label: "Starter" },
      { key: "pro", label: "Pro" },
      { key: "enterprise", label: "Enterprise" },
    ],
    showDots: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const img = canvas.getByRole("img", { name: "Revenue by tier" })
    await expect(
      img.querySelectorAll("[data-slot=area-chart-series]")
    ).toHaveLength(3)
    // a dot at every point of every band: 3 series × 4 quarters
    await expect(img.querySelectorAll("[data-slot=area-chart-dot]")).toHaveLength(12)
  },
}
