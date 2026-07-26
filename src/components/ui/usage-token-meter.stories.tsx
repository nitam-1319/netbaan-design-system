import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { UsageTokenMeter } from "@/components/ui/usage-token-meter"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */
const meta = {
  title: "Components/UsageTokenMeter",
  component: UsageTokenMeter,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    used: { control: { type: "number" } },
    limit: { control: { type: "number" } },
    warnAt: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    criticalAt: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    showValue: { control: "boolean" },
  },
  args: {
    used: 82000,
    limit: 128000,
    label: "Context window",
    unit: "tokens",
    warnAt: 0.75,
    criticalAt: 0.9,
    showValue: true,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof UsageTokenMeter>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const bar = canvas.getByRole("progressbar")
    await expect(bar).toHaveAttribute("aria-valuenow", "82000")
    await expect(bar).toHaveAttribute("aria-valuemax", "128000")
    // 82000 / 128000 ≈ 64% → default tone (below warnAt).
    const root = canvas.getByText("Context window").closest(
      "[data-slot=usage-token-meter]"
    )
    await expect(root).toHaveAttribute("data-tone", "default")
  },
}

export const Nearing: Story = {
  args: { used: 104000, limit: 128000, label: "Context window" },
}

export const Critical: Story = {
  args: { used: 122000, limit: 128000, label: "Context window" },
}

export const Spend: Story = {
  args: {
    used: 42.5,
    limit: 50,
    label: "Monthly spend",
    unit: "USD",
    formatValue: (n: number) => `$${n.toFixed(2)}`,
  },
}

export const ValueOnly: Story = {
  args: { label: undefined, used: 64000, limit: 128000 },
}

export const Thresholds: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <UsageTokenMeter used={30000} limit={128000} label="Low usage" />
      <UsageTokenMeter used={100000} limit={128000} label="Warning" />
      <UsageTokenMeter used={125000} limit={128000} label="Critical" />
    </div>
  ),
}
