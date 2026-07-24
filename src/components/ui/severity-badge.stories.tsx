import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { SeverityBadge } from "@/components/ui/severity-badge"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` is passed to
 * an AEGIS component.
 */
const meta = {
  title: "Components/SeverityBadge",
  component: SeverityBadge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    severity: {
      control: "inline-radio",
      options: ["critical", "high", "medium", "low", "info"],
    },
    appearance: { control: "inline-radio", options: ["soft", "outline"] },
    size: { control: "inline-radio", options: ["sm", "default", "lg"] },
    showDot: { control: "boolean" },
  },
  args: {
    severity: "critical",
    appearance: "soft",
    size: "default",
    showDot: true,
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
      <SeverityBadge severity="critical" />
      <SeverityBadge severity="high" />
      <SeverityBadge severity="medium" />
      <SeverityBadge severity="low" />
      <SeverityBadge severity="info" />
    </div>
  ),
}

export const Outline: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
      <SeverityBadge severity="critical" appearance="outline" />
      <SeverityBadge severity="high" appearance="outline" />
      <SeverityBadge severity="medium" appearance="outline" />
      <SeverityBadge severity="low" appearance="outline" />
      <SeverityBadge severity="info" appearance="outline" />
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
      <SeverityBadge severity="high" size="sm" />
      <SeverityBadge severity="high" size="default" />
      <SeverityBadge severity="high" size="lg" />
    </div>
  ),
}

export const WithoutDot: Story = {
  args: { showDot: false, severity: "medium" },
}

export const CustomLabel: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
      <SeverityBadge severity="critical">Critical · CVSS 9.8</SeverityBadge>
      <SeverityBadge severity="low">Low · CVSS 3.1</SeverityBadge>
    </div>
  ),
}
