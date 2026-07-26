import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { BubbleChart } from "@/components/ui/bubble-chart"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */
const meta = {
  title: "Components/BubbleChart",
  component: BubbleChart,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: {
    label: "Assets: exposure, risk, and blast radius",
    series: [
      {
        key: "prod",
        label: "Production",
        points: [
          { x: 2, y: 8, size: 40 },
          { x: 5, y: 6, size: 120 },
          { x: 7, y: 9, size: 20 },
        ],
      },
      {
        key: "staging",
        label: "Staging",
        points: [
          { x: 3, y: 3, size: 80 },
          { x: 6, y: 4, size: 30 },
          { x: 8, y: 7, size: 60 },
        ],
      },
    ],
    width: 640,
    height: 400,
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 640 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BubbleChart>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole("img", { name: /blast radius/i })
    ).toBeInTheDocument()
    const bubbles = canvasElement.querySelectorAll("[data-slot=bubble-point]")
    await expect(bubbles).toHaveLength(6)
    await expect(canvas.getByText("Production")).toBeInTheDocument()
  },
}

export const SingleSeries: Story = {
  args: {
    label: "Findings by asset",
    series: [
      {
        key: "assets",
        label: "Assets",
        points: [
          { x: 10, y: 20, size: 5 },
          { x: 30, y: 45, size: 25 },
          { x: 55, y: 30, size: 60 },
          { x: 75, y: 65, size: 15 },
        ],
      },
    ],
  },
}
