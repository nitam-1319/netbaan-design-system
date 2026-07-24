import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { StatusIndicator } from "@/components/ui/status-indicator"

/**
 * Every story renders inside an explicit `.dark` surface so the AEGIS dark
 * theme (the design system's primary theme) is exercised.
 */
const meta = {
  title: "Components/StatusIndicator",
  component: StatusIndicator,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    status: {
      control: "inline-radio",
      options: ["online", "away", "busy", "offline", "neutral", "accent"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    pulse: { control: "boolean" },
    ping: { control: "boolean" },
    label: { control: "text" },
  },
  args: {
    status: "online",
    label: "Online",
  },
  decorators: [
    (Story) => (
      <div className="dark bg-background text-foreground flex min-h-24 items-center justify-center gap-3 p-10">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StatusIndicator>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("Online")).toBeInTheDocument()
  },
}

export const Statuses: Story = {
  args: { label: undefined },
  render: () => (
    <div className="flex flex-col items-start gap-2">
      <StatusIndicator status="online" label="Online" />
      <StatusIndicator status="away" label="Away" />
      <StatusIndicator status="busy" label="Busy" />
      <StatusIndicator status="offline" label="Offline" />
      <StatusIndicator status="accent" label="Syncing" pulse />
    </div>
  ),
}

export const Sizes: Story = {
  args: { label: undefined },
  render: () => (
    <div className="flex items-center gap-4">
      <StatusIndicator size="sm" status="online" label="Small" />
      <StatusIndicator size="md" status="online" label="Medium" />
      <StatusIndicator size="lg" status="online" label="Large" />
    </div>
  ),
}

export const LivePing: Story = {
  args: { status: "online", label: "Live", ping: true },
}

/**
 * With no visible `label`, the dot still exposes an accessible name so screen
 * readers announce the status — colour is never the only channel.
 */
export const DotOnly: Story = {
  args: { label: undefined, status: "busy" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("Busy")).toBeInTheDocument()
    await expect(canvas.getByText("Busy")).toHaveClass("sr-only")
  },
}
