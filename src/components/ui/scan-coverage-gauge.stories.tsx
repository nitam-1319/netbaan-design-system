import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { ScanCoverageGauge } from "@/components/ui/scan-coverage-gauge"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */
const meta = {
  title: "Components/ScanCoverageGauge",
  component: ScanCoverageGauge,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    scanned: { control: { type: "number" } },
    total: { control: { type: "number" } },
    showReadout: { control: "boolean" },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
  args: {
    scanned: 1245,
    total: 1380,
    label: "Scan coverage",
    unit: "assets",
    showReadout: true,
    size: "md",
  },
} satisfies Meta<typeof ScanCoverageGauge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const meter = canvas.getByRole("meter", { name: "Scan coverage" })
    await expect(meter).toHaveAttribute("aria-valuenow", "1245")
    await expect(meter).toHaveAttribute("aria-valuemax", "1380")
    // 1245/1380 ≈ 90% (≥ 0.9) → success tone.
    const root = canvas
      .getByText("Scan coverage")
      .closest("[data-slot=scan-coverage-gauge]")
    await expect(root).toHaveAttribute("data-tone", "success")
  },
}

export const Partial: Story = {
  args: { scanned: 720, total: 1380 },
}

export const Low: Story = {
  args: { scanned: 210, total: 1380 },
}

export const GaugeOnly: Story = {
  args: { label: undefined, showReadout: false },
}

export const Tiers: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
      <ScanCoverageGauge scanned={1330} total={1380} label="Full" />
      <ScanCoverageGauge scanned={980} total={1380} label="Good" />
      <ScanCoverageGauge scanned={560} total={1380} label="Partial" />
      <ScanCoverageGauge scanned={180} total={1380} label="Blind spots" />
    </div>
  ),
}
