import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { Divider } from "@/components/ui/divider"

const meta = {
  title: "Components/Divider",
  component: Divider,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-80 p-10 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Divider>

export default meta
type Story = StoryObj<typeof meta>

export const Horizontal: Story = {
  render: () => (
    <div className="space-y-4">
      <p className="text-sm">Discovered assets</p>
      <Divider />
      <p className="text-sm text-muted-foreground">Monitored assets</p>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const rule = canvas.getByRole("separator")
    await expect(rule).toBeInTheDocument()
    await expect(rule).toHaveAttribute("aria-orientation", "horizontal")
  },
}

export const Vertical: Story = {
  render: () => (
    <div className="flex h-8 items-center gap-3 text-sm">
      <span>12 open</span>
      <Divider orientation="vertical" />
      <span>4 resolved</span>
      <Divider orientation="vertical" tone="strong" />
      <span>MTTR 3d</span>
    </div>
  ),
}

export const Tones: Story = {
  render: () => (
    <div className="space-y-4">
      <Divider tone="faint" />
      <Divider tone="default" />
      <Divider tone="strong" />
    </div>
  ),
}

export const Labeled: Story = {
  render: () => <Divider>OR</Divider>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("OR")).toBeVisible()
    await expect(canvas.getByRole("separator")).toBeInTheDocument()
  },
}
