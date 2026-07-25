import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { PieChart } from "@/components/ui/pie-chart"

/**
 * Pie Chart is config-driven and composes the AEGIS chart foundation
 * (`ChartContainer` + `ChartLegend`). Theme (Light/Dark) and direction (LTR/RTL)
 * come from the global Storybook toolbar.
 */
const meta = {
  title: "Components/PieChart",
  component: PieChart,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    startAngle: { control: { type: "number" } },
    padAngle: { control: { type: "range", min: 0, max: 8, step: 0.5 } },
    showLabels: { control: "boolean" },
    labelThreshold: { control: { type: "range", min: 0, max: 0.2, step: 0.01 } },
    showLegend: { control: "boolean" },
    width: { control: { type: "number" } },
    height: { control: { type: "number" } },
  },
} satisfies Meta<typeof PieChart>

export default meta
type Story = StoryObj<typeof meta>

const BUDGET = [
  { key: "eng", label: "Engineering", value: 45 },
  { key: "sales", label: "Sales", value: 25 },
  { key: "ops", label: "Operations", value: 18 },
  { key: "other", label: "Other", value: 12 },
]

export const Default: Story = {
  args: {
    label: "Budget split",
    data: BUDGET,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const img = canvas.getByRole("img", { name: "Budget split" })
    await expect(img).toBeInTheDocument()
    // one wedge path per non-zero datum
    await expect(
      img.querySelectorAll("[data-slot=pie-chart-slice]")
    ).toHaveLength(4)
    // no outside labels by default
    await expect(
      img.querySelectorAll("[data-slot=pie-chart-label]")
    ).toHaveLength(0)
    // legend lists every slice
    await expect(canvas.getAllByRole("listitem")).toHaveLength(4)
  },
}

export const WithLabels: Story = {
  args: {
    label: "Budget split",
    data: BUDGET,
    showLabels: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const img = canvas.getByRole("img", { name: "Budget split" })
    // a percentage label per slice above the threshold
    await expect(
      img.querySelectorAll("[data-slot=pie-chart-label]").length
    ).toBeGreaterThan(0)
  },
}

export const TwoWay: Story = {
  args: {
    label: "Pass / fail",
    data: [
      { key: "pass", label: "Pass", value: 812, color: 2 },
      { key: "fail", label: "Fail", value: 188, color: 4 },
    ],
    showLabels: true,
    labelFormat: (d, frac) => `${d.label}: ${Math.round(frac * 100)}%`,
  },
}

export const Rotated: Story = {
  args: {
    label: "Traffic by device",
    data: [
      { key: "desktop", label: "Desktop", value: 540 },
      { key: "mobile", label: "Mobile", value: 420 },
      { key: "tablet", label: "Tablet", value: 90 },
    ],
    startAngle: -90,
    padAngle: 3,
  },
}

export const SingleValue: Story = {
  args: {
    label: "All clear",
    data: [{ key: "ok", label: "Healthy", value: 100, color: 2 }],
  },
}
