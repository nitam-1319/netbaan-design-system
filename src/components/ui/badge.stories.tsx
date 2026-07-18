import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"
import { Check, ShieldAlert } from "lucide-react"

import { Badge } from "@/components/ui/badge"

const meta = {
  title: "Components/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    children: "Badge",
  },
  decorators: [
    (Story) => (
      <div className="dark bg-background flex min-h-24 items-center justify-center p-10">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const badge = canvas.getByText("Badge")
    await expect(badge).toBeInTheDocument()
    await expect(badge).toHaveAttribute("data-slot", "badge")
  },
}

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="muted">Muted</Badge>
      <Badge variant="success">Resolved</Badge>
      <Badge variant="warning">Pending</Badge>
      <Badge variant="destructive">Critical</Badge>
    </div>
  ),
}

export const WithIcon: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="success">
        <Check /> Verified
      </Badge>
      <Badge variant="destructive">
        <ShieldAlert /> 3 CVEs
      </Badge>
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Badge size="sm">sm</Badge>
      <Badge size="default">default</Badge>
      <Badge size="lg">lg</Badge>
    </div>
  ),
}

export const AsLink: Story = {
  render: () => (
    <Badge variant="outline" render={<a href="#cve" />}>
      CVE-2025-0042
    </Badge>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const link = canvas.getByRole("link", { name: /CVE-2025-0042/ })
    await expect(link).toHaveAttribute("href", "#cve")
  },
}
