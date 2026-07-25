import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"
import { Check, ShieldAlert } from "lucide-react"

import { Badge } from "@/components/ui/badge"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to the AEGIS Badge.
 */
const TONES = [
  "accent",
  "neutral",
  "success",
  "warning",
  "danger",
  "info",
  "low",
  "medium",
  "high",
  "critical",
] as const

const meta = {
  title: "Components/Badge",
  component: Badge,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    tone: { control: "inline-radio", options: TONES },
    variant: { control: "inline-radio", options: ["soft", "solid", "outline"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    dot: { control: "boolean" },
  },
  args: {
    children: "Active",
  },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const badge = canvas.getByText("Active")
    await expect(badge).toBeInTheDocument()
    await expect(badge).toHaveAttribute("data-slot", "badge")
  },
}

export const Tones: Story = {
  render: () => (
    <div
      style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", maxWidth: 420 }}
    >
      {TONES.map((tone) => (
        <Badge key={tone} tone={tone}>
          {tone}
        </Badge>
      ))}
    </div>
  ),
}

export const Variants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {(["soft", "solid", "outline"] as const).map((variant) => (
        <div key={variant} style={{ display: "flex", gap: "0.5rem" }}>
          <Badge variant={variant} tone="accent">
            Accent
          </Badge>
          <Badge variant={variant} tone="success">
            Success
          </Badge>
          <Badge variant={variant} tone="danger">
            Danger
          </Badge>
          <Badge variant={variant} tone="neutral">
            Neutral
          </Badge>
        </div>
      ))}
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
      <Badge size="sm" tone="accent">
        Small
      </Badge>
      <Badge size="md" tone="accent">
        Medium
      </Badge>
      <Badge size="lg" tone="accent">
        Large
      </Badge>
    </div>
  ),
}

export const WithDot: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
      <Badge dot tone="success">
        Active
      </Badge>
      <Badge dot tone="warning">
        Pending
      </Badge>
      <Badge dot tone="danger">
        Failed
      </Badge>
      <Badge dot tone="neutral">
        Draft
      </Badge>
    </div>
  ),
}

export const WithIcon: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
      <Badge tone="success" icon={<Check />}>
        Verified
      </Badge>
      <Badge tone="danger" variant="solid" icon={<ShieldAlert />}>
        3 CVEs
      </Badge>
    </div>
  ),
}

export const Counts: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
      <Badge tone="accent" variant="solid" count={3} />
      <Badge tone="danger" variant="solid" count={42} />
      <Badge tone="danger" variant="solid" count={128} max={99} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("99+")).toBeInTheDocument()
    await expect(canvas.getByLabelText("128")).toBeInTheDocument()
  },
}

export const AsLink: Story = {
  render: () => (
    <Badge tone="accent" variant="outline" render={<a href="#cve" />}>
      CVE-2025-0042
    </Badge>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const link = canvas.getByRole("link", { name: /CVE-2025-0042/ })
    await expect(link).toHaveAttribute("href", "#cve")
  },
}
