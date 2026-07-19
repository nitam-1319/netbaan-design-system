import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress"

const meta = {
  title: "Components/Progress",
  component: Progress,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  args: {
    value: 60,
  },
  decorators: [
    (Story) => (
      <div className="w-96 p-8 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Progress>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <Progress value={64} aria-label="Scan progress" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const bar = canvas.getByRole("progressbar")
    await expect(bar).toHaveAttribute("aria-valuenow", "64")
  },
}

export const WithLabelAndValue: Story = {
  render: () => (
    <Progress value={42}>
      <div className="flex items-center justify-between">
        <ProgressLabel>Scan coverage</ProgressLabel>
        <ProgressValue />
      </div>
    </Progress>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("Scan coverage")).toBeVisible()
    await expect(canvas.getByText("42%")).toBeInTheDocument()
  },
}

export const Tones: Story = {
  render: () => (
    <div className="space-y-4">
      <Progress value={80} tone="success" aria-label="Resolved" />
      <Progress value={55} tone="warning" aria-label="Pending" />
      <Progress value={28} tone="critical" aria-label="Critical exposure" />
    </div>
  ),
}

export const Indeterminate: Story = {
  render: () => <Progress value={null} aria-label="Loading" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const bar = canvas.getByRole("progressbar")
    await expect(bar).not.toHaveAttribute("aria-valuenow")
  },
}
