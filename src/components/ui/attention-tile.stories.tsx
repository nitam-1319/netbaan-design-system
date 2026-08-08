import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { AttentionTile } from "@/components/ui/attention-tile"

const meta = {
  title: "Components/AttentionTile",
  component: AttentionTile,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    tone: {
      control: "select",
      options: [
        "critical",
        "high",
        "medium",
        "low",
        "info",
        "accent",
        "neutral",
        "success",
        "warning",
        "danger",
      ],
    },
  },
  args: { tone: "critical", count: 218, children: "Critical findings open" },
  decorators: [
    (Story) => (
      <div className="w-80 max-w-full p-6 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AttentionTile>

export default meta
type Story = StoryObj<typeof meta>

export const Critical: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("218")).toBeInTheDocument()
    // The label carries the meaning; colour only reinforces it.
    await expect(canvas.getByText("Critical findings open")).toBeInTheDocument()
  },
}

export const High: Story = {
  args: { tone: "high", count: 87, children: "Likely exploited" },
}

/** Nothing outstanding. Zero is worth showing — it is the good news. */
export const Zero: Story = {
  args: { tone: "neutral", count: 0, children: "Critical findings open" },
}

/** Counts stay legible past the chip's minimum width. */
export const LargeCount: Story = {
  args: { count: "12,480", children: "Findings in scope" },
}

/** Give the tile an action when it can filter the list it summarises. */
export const Interactive: Story = {
  args: { interactive: true, role: "button", tabIndex: 0 },
}
