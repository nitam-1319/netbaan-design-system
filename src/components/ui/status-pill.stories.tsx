import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { StatusPill } from "@/components/ui/status-pill"

const meta = {
  title: "Components/StatusPill",
  component: StatusPill,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    tone: {
      control: "inline-radio",
      options: ["neutral", "info", "success", "warning", "danger"],
    },
    size: { control: "inline-radio", options: ["sm", "md"] },
    pulse: { control: "boolean" },
  },
  args: {
    tone: "success",
    children: "Active",
  },
  decorators: [
    (Story) => (
      <div className="p-8 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StatusPill>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("Active")).toBeInTheDocument()
  },
}

export const Tones: Story = {
  args: { children: undefined },
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <StatusPill tone="neutral">Draft</StatusPill>
      <StatusPill tone="info">In review</StatusPill>
      <StatusPill tone="success">Active</StatusPill>
      <StatusPill tone="warning">Degraded</StatusPill>
      <StatusPill tone="danger">Failed</StatusPill>
    </div>
  ),
}

export const Sizes: Story = {
  args: { children: undefined },
  render: () => (
    <div className="flex items-center gap-3">
      <StatusPill size="sm" tone="success">
        Small
      </StatusPill>
      <StatusPill size="md" tone="success">
        Medium
      </StatusPill>
    </div>
  ),
}

export const Live: Story = {
  args: { tone: "info", pulse: true, children: "Syncing" },
}
