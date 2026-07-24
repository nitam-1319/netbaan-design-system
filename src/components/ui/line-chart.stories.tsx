import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { LineChart } from "@/components/ui/line-chart"

/**
 * Line Chart is config-driven and composes the AEGIS chart foundation
 * (`ChartContainer` + `Axis` + `ChartLegend`). Theme (Light/Dark) and direction
 * (LTR/RTL) come from the global Storybook toolbar.
 */
const meta = {
  title: "Components/LineChart",
  component: LineChart,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    area: { control: "boolean" },
    showDots: { control: "boolean" },
    showGrid: { control: "boolean" },
    showXAxis: { control: "boolean" },
    showYAxis: { control: "boolean" },
    showLegend: { control: "boolean" },
    yTickCount: { control: { type: "number" } },
    width: { control: { type: "number" } },
    height: { control: { type: "number" } },
  },
} satisfies Meta<typeof LineChart>

export default meta
type Story = StoryObj<typeof meta>

const DATA = [
  { month: "Jan", desktop: 30, mobile: 20, tablet: 8 },
  { month: "Feb", desktop: 42, mobile: 25, tablet: 10 },
  { month: "Mar", desktop: 35, mobile: 30, tablet: 9 },
  { month: "Apr", desktop: 50, mobile: 28, tablet: 14 },
  { month: "May", desktop: 44, mobile: 36, tablet: 12 },
  { month: "Jun", desktop: 58, mobile: 40, tablet: 16 },
]

export const Default: Story = {
  args: {
    label: "Sessions by device",
    data: DATA,
    xKey: "month",
    series: [
      { key: "desktop", label: "Desktop" },
      { key: "mobile", label: "Mobile" },
      { key: "tablet", label: "Tablet" },
    ],
    showDots: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const img = canvas.getByRole("img", { name: "Sessions by device" })
    await expect(img).toBeInTheDocument()
    // one <g data-slot=line-chart-series> per series
    await expect(
      img.querySelectorAll("[data-slot=line-chart-series]")
    ).toHaveLength(3)
    // x-axis ticks line up with the six data points
    const xAxis = img.querySelector("[data-slot=axis][data-orientation=bottom]")
    await expect(xAxis!.querySelectorAll("[data-slot=axis-tick]")).toHaveLength(6)
    // legend lists the three series
    await expect(canvas.getAllByRole("listitem")).toHaveLength(3)
  },
}

export const SingleSeries: Story = {
  args: {
    label: "Desktop sessions",
    data: DATA,
    xKey: "month",
    series: [{ key: "desktop", label: "Desktop" }],
    showDots: true,
  },
}

export const Area: Story = {
  args: {
    label: "Sessions (area)",
    data: DATA,
    xKey: "month",
    series: [
      { key: "desktop", label: "Desktop", color: 4 },
      { key: "mobile", label: "Mobile", color: 1 },
    ],
    area: true,
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
    series: [{ key: "revenue", label: "Revenue", color: 3 }],
    yFormat: (v) => `$${(v / 1000).toFixed(0)}k`,
    area: true,
    showDots: true,
  },
}

export const NoGrid: Story = {
  args: {
    label: "Minimal",
    data: DATA,
    xKey: "month",
    series: [{ key: "desktop", label: "Desktop" }],
    showGrid: false,
    showYAxis: false,
  },
}
