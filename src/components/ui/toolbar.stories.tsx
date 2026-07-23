import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from "lucide-react"

import {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarSeparator,
  ToolbarLink,
} from "@/components/ui/toolbar"

const meta = {
  title: "Components/Toolbar",
  component: Toolbar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="p-8 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Toolbar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Toolbar aria-label="Text formatting">
      <ToolbarGroup>
        <ToolbarButton aria-label="Bold">
          <Bold />
        </ToolbarButton>
        <ToolbarButton aria-label="Italic">
          <Italic />
        </ToolbarButton>
        <ToolbarButton aria-label="Underline">
          <Underline />
        </ToolbarButton>
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <ToolbarButton aria-label="Align left">
          <AlignLeft />
        </ToolbarButton>
        <ToolbarButton aria-label="Align center">
          <AlignCenter />
        </ToolbarButton>
        <ToolbarButton aria-label="Align right">
          <AlignRight />
        </ToolbarButton>
      </ToolbarGroup>
    </Toolbar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const toolbar = canvas.getByRole("toolbar", { name: "Text formatting" })
    await expect(toolbar).toBeInTheDocument()
    // Roving focus: focus enters at the first item, arrow key moves to the next.
    const bold = canvas.getByRole("button", { name: "Bold" })
    bold.focus()
    await expect(bold).toHaveFocus()
    await userEvent.keyboard("{ArrowRight}")
    await expect(canvas.getByRole("button", { name: "Italic" })).toHaveFocus()
  },
}

export const WithTextButtons: Story = {
  render: () => (
    <Toolbar aria-label="Document actions">
      <ToolbarButton>Save</ToolbarButton>
      <ToolbarButton>Duplicate</ToolbarButton>
      <ToolbarSeparator />
      <ToolbarButton disabled>Delete</ToolbarButton>
      <ToolbarSeparator />
      <ToolbarLink href="#help">Help</ToolbarLink>
    </Toolbar>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-4">
      <Toolbar aria-label="Small">
        <ToolbarButton size="sm">
          <Bold />
        </ToolbarButton>
        <ToolbarButton size="sm">
          <Italic />
        </ToolbarButton>
      </Toolbar>
      <Toolbar aria-label="Medium">
        <ToolbarButton size="md">
          <Bold />
        </ToolbarButton>
        <ToolbarButton size="md">
          <Italic />
        </ToolbarButton>
      </Toolbar>
      <Toolbar aria-label="Large">
        <ToolbarButton size="lg">
          <Bold />
        </ToolbarButton>
        <ToolbarButton size="lg">
          <Italic />
        </ToolbarButton>
      </Toolbar>
    </div>
  ),
}

export const Vertical: Story = {
  render: () => (
    <Toolbar orientation="vertical" aria-label="Vertical tools">
      <ToolbarButton aria-label="Bold">
        <Bold />
      </ToolbarButton>
      <ToolbarButton aria-label="Italic">
        <Italic />
      </ToolbarButton>
      <ToolbarSeparator />
      <ToolbarButton aria-label="Underline">
        <Underline />
      </ToolbarButton>
    </Toolbar>
  ),
}
