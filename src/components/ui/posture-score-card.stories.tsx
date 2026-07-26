import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { PostureScoreCard } from "@/components/ui/posture-score-card"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */
const meta = {
  title: "Components/PostureScoreCard",
  component: PostureScoreCard,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    score: { control: { type: "number", min: 0, max: 100 } },
    previousScore: { control: { type: "number", min: 0, max: 100 } },
    grade: { control: "text" },
  },
  args: {
    score: 82,
    max: 100,
    label: "Security posture",
    grade: "B+",
    previousScore: 74,
    caption: "vs. last 30 days",
  },
  decorators: [
    (Story) => (
      <div style={{ width: 300 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PostureScoreCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const meter = canvas.getByRole("meter", { name: "Security posture" })
    await expect(meter).toHaveAttribute("aria-valuenow", "82")
    // 82/100 → accent tone.
    const root = canvas
      .getByText("Security posture")
      .closest("[data-slot=posture-score-card]")
    await expect(root).toHaveAttribute("data-tone", "accent")
    // Improved by 8 points.
    await expect(canvas.getByText(/\+8 pts/)).toBeInTheDocument()
  },
}

export const Strong: Story = {
  args: { score: 94, grade: "A", previousScore: 91 },
}

export const AtRisk: Story = {
  args: { score: 41, grade: "F", previousScore: 55 },
}

export const NoTrend: Story = {
  args: { previousScore: undefined, grade: undefined, caption: undefined },
}

export const Tiers: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
      <div style={{ width: 240 }}>
        <PostureScoreCard score={96} grade="A" label="Excellent" />
      </div>
      <div style={{ width: 240 }}>
        <PostureScoreCard score={78} grade="B" label="Good" />
      </div>
      <div style={{ width: 240 }}>
        <PostureScoreCard score={58} grade="C" label="Fair" />
      </div>
      <div style={{ width: 240 }}>
        <PostureScoreCard score={38} grade="F" label="Poor" />
      </div>
    </div>
  ),
}
