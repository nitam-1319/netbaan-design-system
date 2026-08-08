import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { ScoreRing } from "@/components/ui/score-ring"

const meta = {
  title: "Components/ScoreRing",
  component: ScoreRing,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    tone: {
      control: "inline-radio",
      options: ["critical", "high", "medium", "low", "info", "neutral", "accent"],
    },
    size: { control: "inline-radio", options: ["sm", "md"] },
  },
  args: { label: "CVSS score", value: 9.8, tone: "critical", size: "sm" },
  decorators: [
    (Story) => (
      <div className="p-6 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ScoreRing>

export default meta
type Story = StoryObj<typeof meta>

export const Critical: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("9.8")).toBeInTheDocument()
    await expect(canvas.getByRole("meter")).toHaveAccessibleName("CVSS score")
  },
}

export const Medium: Story = { args: { value: 6.5, tone: "medium" } }

/**
 * Not scored — NOT zero. The ring shows its empty track and an em dash, and it
 * stops being a meter because it has no value to report.
 */
export const Unscored: Story = {
  args: { value: null },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("—")).toBeInTheDocument()
    await expect(canvas.queryByRole("meter")).not.toBeInTheDocument()
  },
}

/** A real zero: the bottom of the scale, drawn as an empty arc but printed as 0.0. */
export const ZeroScore: Story = {
  args: { value: 0, tone: "info" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("0.0")).toBeInTheDocument()
    await expect(canvas.getByRole("meter")).toBeInTheDocument()
  },
}

export const FullScore: Story = { args: { value: 10, tone: "critical" } }

export const Large: Story = { args: { size: "md", value: 7.4, tone: "high" } }
