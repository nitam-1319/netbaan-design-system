import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { Kbd } from "@/components/ui/kbd"

const meta = {
  title: "Components/Kbd",
  component: Kbd,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
  args: {
    children: "K",
  },
  decorators: [
    (Story) => (
      <div className="p-8 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Kbd>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("K").tagName).toBe("KBD")
  },
}

export const Sizes: Story = {
  args: { children: undefined },
  render: () => (
    <div className="flex items-center gap-3">
      <Kbd size="sm">Esc</Kbd>
      <Kbd size="md">Esc</Kbd>
      <Kbd size="lg">Esc</Kbd>
    </div>
  ),
}

export const Chord: Story = {
  args: { children: undefined },
  render: () => (
    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <Kbd>⌘</Kbd>
      <span>+</span>
      <Kbd>Shift</Kbd>
      <span>+</span>
      <Kbd>P</Kbd>
    </div>
  ),
}

export const InText: Story = {
  args: { children: undefined },
  render: () => (
    <p className="max-w-sm text-sm text-foreground">
      Press <Kbd size="sm">/</Kbd> to focus search, or <Kbd size="sm">?</Kbd> to
      open the shortcut help.
    </p>
  ),
}
