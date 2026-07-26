import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { ScatterPlot } from "@/components/ui/scatter-plot"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */
const meta = {
  title: "Components/ScatterPlot",
  component: ScatterPlot,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: {
    label: "Exposure vs. severity",
    series: [
      {
        key: "web",
        label: "Web",
        points: [
          { x: 2, y: 8 },
          { x: 4, y: 6 },
          { x: 5, y: 9 },
          { x: 7, y: 5 },
        ],
      },
      {
        key: "api",
        label: "API",
        points: [
          { x: 1, y: 3 },
          { x: 3, y: 4 },
          { x: 6, y: 2 },
          { x: 8, y: 7 },
        ],
      },
    ],
    width: 640,
    height: 360,
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 640 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ScatterPlot>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole("img", { name: "Exposure vs. severity" })
    ).toBeInTheDocument()
    // 8 points total across two series.
    const points = canvasElement.querySelectorAll("[data-slot=scatter-point]")
    await expect(points).toHaveLength(8)
    // Both series appear in the legend.
    await expect(canvas.getByText("Web")).toBeInTheDocument()
    await expect(canvas.getByText("API")).toBeInTheDocument()
  },
}

export const SingleSeries: Story = {
  args: {
    label: "Assets by risk",
    series: [
      {
        key: "assets",
        label: "Assets",
        points: [
          { x: 10, y: 20 },
          { x: 25, y: 40 },
          { x: 40, y: 35 },
          { x: 60, y: 70 },
          { x: 80, y: 55 },
        ],
      },
    ],
  },
}

export const FixedDomain: Story = {
  args: { xDomain: [0, 10], yDomain: [0, 10] },
}
