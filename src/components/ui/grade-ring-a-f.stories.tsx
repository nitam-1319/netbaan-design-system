import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { GradeRing } from "@/components/ui/grade-ring-a-f"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */
const meta = {
  title: "Components/GradeRing",
  component: GradeRing,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    grade: { control: "text" },
    score: { control: { type: "number", min: 0, max: 100 } },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    thickness: { control: "inline-radio", options: ["thin", "regular", "thick"] },
  },
  args: {
    grade: "A",
    label: "Security grade",
    size: "md",
    thickness: "thick",
  },
} satisfies Meta<typeof GradeRing>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const meter = canvas.getByRole("meter", { name: "Security grade" })
    await expect(meter).toHaveAttribute("data-grade", "A")
    await expect(meter).toHaveAttribute("aria-valuetext", "A")
  },
}

export const Scale: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
      <GradeRing grade="A" label="Grade A" />
      <GradeRing grade="B" label="Grade B" />
      <GradeRing grade="C" label="Grade C" />
      <GradeRing grade="D" label="Grade D" />
      <GradeRing grade="F" label="Grade F" />
    </div>
  ),
}

export const WithModifiers: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
      <GradeRing grade="A+" label="Grade A plus" />
      <GradeRing grade="B-" label="Grade B minus" />
      <GradeRing grade="C+" label="Grade C plus" />
    </div>
  ),
}

export const FromScore: Story = {
  args: { grade: "B", score: 83, label: "Posture 83 of 100" },
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
      <GradeRing grade="A" size="sm" label="Small" />
      <GradeRing grade="A" size="md" label="Medium" />
      <GradeRing grade="A" size="lg" label="Large" />
    </div>
  ),
}
