import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { Box } from "@/components/ui/box"

const meta = {
  title: "Components/Box",
  component: Box,
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
} satisfies Meta<typeof Box>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Box
      render={
        <div className="bg-surface border-border rounded-lg border p-4 text-sm" />
      }
    >
      A Box renders a plain <code>div</code> by default and merges any utility
      classes you give it.
    </Box>
  ),
  play: async ({ canvasElement }) => {
    const box = canvasElement.querySelector("[data-slot='box']")
    await expect(box).toBeInTheDocument()
    await expect(box?.tagName).toBe("DIV")
  },
}

export const Polymorphic: Story = {
  render: () => (
    <Box
      render={
        <section
          aria-label="Panel"
          className="bg-surface-2 border-border rounded-lg border p-4 text-sm"
        />
      }
    >
      With the <code>render</code> prop the same Box becomes a{" "}
      <code>section</code> — no wrapper element added.
    </Box>
  ),
  play: async ({ canvasElement }) => {
    const box = canvasElement.querySelector("[data-slot='box']")
    await expect(box).toBeInTheDocument()
    await expect(box?.tagName).toBe("SECTION")
  },
}

export const AsList: Story = {
  render: () => (
    <Box
      render={
        <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-sm" />
      }
    >
      <li>Discovered assets</li>
      <li>Monitored assets</li>
      <li>Unmonitored assets</li>
    </Box>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole("list")).toBeInTheDocument()
  },
}
