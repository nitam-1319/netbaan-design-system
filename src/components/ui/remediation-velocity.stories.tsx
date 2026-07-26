import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { RemediationVelocity } from "@/components/ui/remediation-velocity"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */
const meta = {
  title: "Components/RemediationVelocity",
  component: RemediationVelocity,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: {
    title: "Remediation velocity",
    description: "Findings opened vs resolved per week",
    xKey: "week",
    data: [
      { week: "W1", opened: 12, resolved: 9 },
      { week: "W2", opened: 8, resolved: 14 },
      { week: "W3", opened: 10, resolved: 12 },
      { week: "W4", opened: 6, resolved: 15 },
    ],
    showNet: true,
    height: 260,
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 640 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RemediationVelocity>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const root = canvas
      .getByText("Remediation velocity")
      .closest("[data-slot=remediation-velocity]")
    // Resolved 50 vs opened 36 → net +14, backlog shrinking (up trend).
    await expect(root).toHaveAttribute("data-trend", "up")
    await expect(canvas.getByText("+14")).toBeInTheDocument()
    await expect(
      canvas.getByRole("img", { name: "Remediation velocity" })
    ).toBeInTheDocument()
  },
}

export const BacklogGrowing: Story = {
  args: {
    data: [
      { week: "W1", opened: 16, resolved: 9 },
      { week: "W2", opened: 18, resolved: 10 },
      { week: "W3", opened: 14, resolved: 11 },
      { week: "W4", opened: 20, resolved: 12 },
    ],
  },
}

export const NoNet: Story = {
  args: { showNet: false },
}
