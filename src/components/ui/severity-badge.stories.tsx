import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { SeverityBadge } from "@/components/ui/severity-badge"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */
const meta = {
  title: "Components/SeverityBadge",
  component: SeverityBadge,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    level: {
      control: "inline-radio",
      options: ["critical", "high", "medium", "low", "info"],
    },
    variant: { control: "inline-radio", options: ["soft", "solid", "outline"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    dot: { control: "boolean" },
  },
  args: {
    level: "critical",
    variant: "soft",
    size: "md",
    dot: true,
  },
} satisfies Meta<typeof SeverityBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const badge = canvas.getByText("Critical")
    await expect(badge).toBeInTheDocument()
    // Severity must be spelled out — never colour alone.
    await expect(
      badge.closest("[data-slot=severity-badge]")
    ).toHaveAttribute("data-severity", "critical")
  },
}

export const Levels: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
      <SeverityBadge level="critical" />
      <SeverityBadge level="high" />
      <SeverityBadge level="medium" />
      <SeverityBadge level="low" />
      <SeverityBadge level="info" />
    </div>
  ),
}

export const Outline: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
      <SeverityBadge level="critical" variant="outline" />
      <SeverityBadge level="high" variant="outline" />
      <SeverityBadge level="medium" variant="outline" />
      <SeverityBadge level="low" variant="outline" />
      <SeverityBadge level="info" variant="outline" />
    </div>
  ),
}

export const Solid: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
      <SeverityBadge level="critical" variant="solid" />
      <SeverityBadge level="high" variant="solid" />
      <SeverityBadge level="medium" variant="solid" />
      <SeverityBadge level="low" variant="solid" />
      <SeverityBadge level="info" variant="solid" />
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
      <SeverityBadge level="high" size="sm" />
      <SeverityBadge level="high" size="md" />
      <SeverityBadge level="high" size="lg" />
    </div>
  ),
}

export const WithoutDot: Story = {
  args: { dot: false, level: "medium" },
}

export const CustomLabel: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
      <SeverityBadge level="critical">Critical · CVSS 9.8</SeverityBadge>
      <SeverityBadge level="low">Low · CVSS 3.1</SeverityBadge>
    </div>
  ),
}
