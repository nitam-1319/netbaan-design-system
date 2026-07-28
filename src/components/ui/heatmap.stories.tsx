import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { Heatmap } from "@/components/ui/heatmap"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */
const meta = {
  title: "Components/Heatmap",
  component: Heatmap,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    colorIndex: { control: "inline-radio", options: [1, 2, 3, 4, 5] },
    showValues: { control: "boolean" },
  },
  args: {
    label: "Findings by asset and severity",
    xLabels: ["Critical", "High", "Medium", "Low"],
    yLabels: ["web-01", "api-01", "db-01", "vpn-01"],
    values: [
      [2, 5, 8, 12],
      [1, 3, 6, 9],
      [0, 1, 2, 4],
      [3, 4, 1, 2],
    ],
    colorIndex: 1,
    showValues: true,
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 520 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Heatmap>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole("group", { name: "Findings by asset and severity" })
    ).toBeInTheDocument()
    const cells = canvasElement.querySelectorAll("[data-slot=heatmap-cell]")
    await expect(cells).toHaveLength(16)
    // Cell values are announced with their row/column context.
    await expect(canvas.getByText("web-01, Low: 12")).toBeInTheDocument()
  },
}

export const NoValues: Story = {
  args: { showValues: false },
}

export const Activity: Story = {
  args: {
    label: "Scan activity by day and week",
    colorIndex: 3,
    xLabels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    yLabels: ["W1", "W2", "W3"],
    values: [
      [1, 4, 2, 5, 3],
      [0, 2, 6, 1, 4],
      [3, 5, 4, 2, 6],
    ],
  },
}

/**
 * A fixed `min`/`max` scale (so multiple heatmaps stay comparable) with a custom
 * `valueFormat`. The formatter drives both the visible number and the cell's
 * accessible name.
 */
export const FixedScale: Story = {
  args: {
    label: "Control coverage by team and function",
    colorIndex: 4,
    xLabels: ["Detect", "Respond", "Recover"],
    yLabels: ["SOC", "IR", "Platform"],
    values: [
      [90, 60, 40],
      [75, 85, 55],
      [50, 30, 95],
    ],
    min: 0,
    max: 100,
    valueFormat: (v) => `${v}%`,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Fixed [0,100] scale + custom formatter drive the accessible name.
    await expect(canvas.getByText("SOC, Detect: 90%")).toBeInTheDocument()
  },
}
