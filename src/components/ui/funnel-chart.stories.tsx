import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { FunnelChart } from "@/components/ui/funnel-chart"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */
const meta = {
  title: "Components/FunnelChart",
  component: FunnelChart,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: {
    label: "Onboarding funnel",
    showConversion: true,
    stages: [
      { key: "visited", label: "Visited", value: 12000 },
      { key: "signup", label: "Signed up", value: 4800 },
      { key: "verified", label: "Verified email", value: 3100 },
      { key: "activated", label: "Activated", value: 1450 },
    ],
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FunnelChart>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole("group", { name: "Onboarding funnel" })
    ).toBeInTheDocument()
    await expect(canvas.getByText("Visited")).toBeInTheDocument()
    // 1450 / 12000 ≈ 12% at the last stage.
    await expect(canvas.getByText("12%")).toBeInTheDocument()
    const bars = canvasElement.querySelectorAll("[data-slot=funnel-chart-bar]")
    await expect(bars).toHaveLength(4)
  },
}

export const NoConversion: Story = {
  args: { showConversion: false },
}

export const SecurityPipeline: Story = {
  args: {
    label: "Vulnerability pipeline",
    stages: [
      { key: "found", label: "Detected", value: 820 },
      { key: "triaged", label: "Triaged", value: 540 },
      { key: "fixing", label: "In remediation", value: 210 },
      { key: "resolved", label: "Resolved", value: 175 },
    ],
  },
}
