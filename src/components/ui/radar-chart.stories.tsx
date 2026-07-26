import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { RadarChart } from "@/components/ui/radar-chart"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */
const meta = {
  title: "Components/RadarChart",
  component: RadarChart,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    label: "Control maturity by domain",
    axes: ["Identity", "Network", "Endpoint", "Data", "AppSec", "Response"],
    max: 100,
    series: [
      { key: "current", label: "Current", values: [80, 60, 70, 50, 65, 40] },
      { key: "target", label: "Target", values: [90, 85, 85, 80, 80, 75] },
    ],
    size: 380,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 400 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RadarChart>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole("img", { name: "Control maturity by domain" })
    ).toBeInTheDocument()
    const polygons = canvasElement.querySelectorAll("[data-slot=radar-series]")
    await expect(polygons).toHaveLength(2)
    await expect(canvas.getByText("Identity")).toBeInTheDocument()
    await expect(canvas.getByText("Target")).toBeInTheDocument()
  },
}

export const SingleSeries: Story = {
  args: {
    label: "Skill coverage",
    series: [{ key: "team", label: "Team", values: [70, 90, 55, 80, 60, 75] }],
  },
}
