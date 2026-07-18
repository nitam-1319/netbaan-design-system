import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"

const meta = {
  title: "Components/Spinner",
  component: Spinner,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="dark bg-background flex min-h-24 items-center justify-center p-10 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Spinner>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const status = canvas.getByRole("status")
    await expect(status).toBeInTheDocument()
    await expect(canvas.getByText("Loading")).toBeInTheDocument()
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Spinner size="xs" />
      <Spinner size="sm" />
      <Spinner size="default" />
      <Spinner size="lg" />
      <Spinner size="xl" />
    </div>
  ),
}

export const Tones: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Spinner tone="default" />
      <Spinner tone="primary" />
    </div>
  ),
}

export const InButton: Story = {
  render: () => (
    <Button disabled>
      <Spinner size="sm" tone="current" label="Scanning" />
      Scanning…
    </Button>
  ),
}
