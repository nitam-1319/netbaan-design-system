import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { Stack } from "@/components/ui/stack"

const meta = {
  title: "Components/Stack",
  component: Stack,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="dark bg-background w-96 p-10 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Stack>

export default meta
type Story = StoryObj<typeof meta>

const Item = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-surface-2 border-border rounded-md border px-3 py-2 text-sm">
    {children}
  </div>
)

export const Vertical: Story = {
  render: () => (
    <Stack gap="sm">
      <Item>Critical</Item>
      <Item>High</Item>
      <Item>Medium</Item>
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const stack = canvasElement.querySelector("[data-slot='stack']")
    await expect(stack).toBeInTheDocument()
    await expect(stack).toHaveClass("flex-col")
  },
}

export const Horizontal: Story = {
  render: () => (
    <Stack direction="row" gap="md" align="center">
      <Item>12 open</Item>
      <Item>4 resolved</Item>
      <Item>MTTR 3d</Item>
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const stack = canvasElement.querySelector("[data-slot='stack']")
    await expect(stack).toHaveClass("flex-row")
  },
}

export const SpaceBetween: Story = {
  render: () => (
    <div className="w-full">
      <Stack direction="row" justify="between" align="center">
        <Item>Attack surface</Item>
        <Item>128</Item>
      </Stack>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("Attack surface")).toBeVisible()
  },
}

export const Wrapping: Story = {
  render: () => (
    <div className="w-64">
      <Stack direction="row" gap="sm" wrap>
        <Item>tag-1</Item>
        <Item>tag-2</Item>
        <Item>tag-3</Item>
        <Item>tag-4</Item>
        <Item>tag-5</Item>
      </Stack>
    </div>
  ),
}
