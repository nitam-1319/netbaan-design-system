import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { DonutChart } from "@/components/ui/donut-chart"

/**
 * Donut Chart is config-driven and composes the AEGIS chart foundation
 * (`ChartContainer` + `ChartLegend`). Theme (Light/Dark) and direction (LTR/RTL)
 * come from the global Storybook toolbar.
 */
const meta = {
  title: "Components/DonutChart",
  component: DonutChart,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    innerRatio: { control: { type: "range", min: 0, max: 0.95, step: 0.05 } },
    startAngle: { control: { type: "number" } },
    padAngle: { control: { type: "range", min: 0, max: 8, step: 0.5 } },
    showCenterLabel: { control: "boolean" },
    showLegend: { control: "boolean" },
    width: { control: { type: "number" } },
    height: { control: { type: "number" } },
  },
} satisfies Meta<typeof DonutChart>

export default meta
type Story = StoryObj<typeof meta>

const SEVERITY = [
  { key: "critical", label: "Critical", value: 4 },
  { key: "high", label: "High", value: 11 },
  { key: "medium", label: "Medium", value: 23 },
  { key: "low", label: "Low", value: 38 },
]

export const Default: Story = {
  args: {
    label: "Findings by severity",
    data: SEVERITY,
    centerSublabel: "findings",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const img = canvas.getByRole("img", { name: "Findings by severity" })
    await expect(img).toBeInTheDocument()
    // one slice path per non-zero datum
    await expect(
      img.querySelectorAll("[data-slot=donut-chart-slice]")
    ).toHaveLength(4)
    // centre readout shows the total (4 + 11 + 23 + 38 = 76)
    const center = img.querySelector("[data-slot=donut-chart-center]")
    await expect(center).toBeInTheDocument()
    await expect(center).toHaveTextContent("76")
    // legend lists every slice
    await expect(canvas.getAllByRole("listitem")).toHaveLength(4)
  },
}

export const Thin: Story = {
  args: {
    label: "Storage used",
    data: [
      { key: "used", label: "Used", value: 68 },
      { key: "free", label: "Free", value: 32 },
    ],
    innerRatio: 0.82,
    centerLabel: "68%",
    centerSublabel: "used",
    valueFormat: (v) => `${v}%`,
  },
}

export const Thick: Story = {
  args: {
    label: "Traffic by device",
    data: [
      { key: "desktop", label: "Desktop", value: 540 },
      { key: "mobile", label: "Mobile", value: 420 },
      { key: "tablet", label: "Tablet", value: 90 },
    ],
    innerRatio: 0.45,
    centerSublabel: "sessions",
    valueFormat: (v) => v.toLocaleString(),
  },
}

export const NoCenterLabel: Story = {
  args: {
    label: "Budget split",
    data: [
      { key: "eng", label: "Engineering", value: 45 },
      { key: "sales", label: "Sales", value: 25 },
      { key: "ops", label: "Operations", value: 18 },
      { key: "other", label: "Other", value: 12 },
    ],
    showCenterLabel: false,
  },
}

export const SingleValue: Story = {
  args: {
    label: "Scan coverage",
    data: [{ key: "covered", label: "Covered", value: 100 }],
    centerLabel: "100%",
    centerSublabel: "coverage",
  },
}
