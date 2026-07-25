import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { AreaChart } from "@/components/ui/area-chart"

/**
 * Area Chart is config-driven and composes the AEGIS chart foundation
 * (`ChartContainer` + `Axis` + `ChartLegend`). Theme (Light/Dark) and direction
 * (LTR/RTL) come from the global Storybook toolbar.
 */
const meta = {
  title: "Components/AreaChart",
  component: AreaChart,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    stackMode: {
      control: "inline-radio",
      options: ["overlap", "stacked", "expand"],
    },
    fillOpacity: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    showLine: { control: "boolean" },
    showDots: { control: "boolean" },
    showGrid: { control: "boolean" },
    showXAxis: { control: "boolean" },
    showYAxis: { control: "boolean" },
    showLegend: { control: "boolean" },
    yTickCount: { control: { type: "number" } },
    width: { control: { type: "number" } },
    height: { control: { type: "number" } },
  },
} satisfies Meta<typeof AreaChart>

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
    // one <g data-slot=area-chart-series> per series
    await expect(
      img.querySelectorAll("[data-slot=area-chart-series]")
    ).toHaveLength(3)
    // each series draws a filled area
    await expect(img.querySelectorAll("[data-slot=area-chart-area]")).toHaveLength(3)
    // x-axis ticks line up with the six data points
    const xAxis = img.querySelector("[data-slot=axis][data-orientation=bottom]")
    await expect(xAxis!.querySelectorAll("[data-slot=axis-tick]")).toHaveLength(6)
    // legend lists the three series
    await expect(canvas.getAllByRole("listitem")).toHaveLength(3)
  },
}

export const Stacked: Story = {
  args: {
    label: "Traffic by source (stacked)",
    data: DATA,
    xKey: "month",
    series: SERIES,
    stackMode: "stacked",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const img = canvas.getByRole("img", { name: "Traffic by source (stacked)" })
    await expect(
      img.querySelectorAll("[data-slot=area-chart-series]")
    ).toHaveLength(3)
  },
}

export const Expand: Story = {
  args: {
    label: "Traffic share",
    data: DATA,
    xKey: "month",
    series: SERIES,
    stackMode: "expand",
    yFormat: (v) => `${Math.round(v * 100)}%`,
  },
}

export const SingleSeries: Story = {
  args: {
    label: "Organic sessions",
    data: DATA,
    xKey: "month",
    series: [{ key: "organic", label: "Organic", color: 3 }],
    showDots: true,
  },
}

export const FormattedAxis: Story = {
  args: {
    label: "Monthly revenue",
    data: [
      { month: "Jan", revenue: 12400 },
      { month: "Feb", revenue: 15800 },
      { month: "Mar", revenue: 14200 },
      { month: "Apr", revenue: 21600 },
      { month: "May", revenue: 19800 },
      { month: "Jun", revenue: 26400 },
    ],
    xKey: "month",
    series: [{ key: "revenue", label: "Revenue", color: 4 }],
    yFormat: (v) => `$${(v / 1000).toFixed(0)}k`,
    showDots: true,
  },
}

export const NoGrid: Story = {
  args: {
    label: "Minimal",
    data: DATA,
    xKey: "month",
    series: [{ key: "organic", label: "Organic" }],
    showGrid: false,
    showYAxis: false,
    showLegend: false,
  },
}
