import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, screen } from "storybook/test"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

/**
 * Every story renders inside an explicit `.dark` surface so the AEGIS dark
 * theme (the design default) is exercised regardless of the toolbar globals.
 */
const meta = {
  title: "Components/ToggleGroup",
  component: ToggleGroup,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    variant: "outline",
    size: "default",
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["default", "outline"],
    },
    size: {
      control: "inline-radio",
      options: ["sm", "default", "lg"],
    },
    multiple: { control: "boolean" },
    disabled: { control: "boolean" },
    loopFocus: { control: "boolean" },
    orientation: {
      control: "inline-radio",
      options: ["horizontal", "vertical"],
    },
    onValueChange: { action: "valueChange" },
  },
  decorators: [
    (Story) => (
      <div className="dark bg-background text-foreground flex min-h-24 items-center justify-center p-10">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ToggleGroup>

export default meta
type Story = StoryObj<typeof meta>

/* Single-select: exactly one option pressed at a time (view switcher). */
export const SingleSelect: Story = {
  render: (args) => (
    <ToggleGroup {...args} defaultValue={["list"]}>
      <ToggleGroupItem value="list">List</ToggleGroupItem>
      <ToggleGroupItem value="board">Board</ToggleGroupItem>
      <ToggleGroupItem value="graph">Graph</ToggleGroupItem>
    </ToggleGroup>
  ),
  play: async () => {
    const list = await screen.findByRole("button", { name: "List" })
    const board = await screen.findByRole("button", { name: "Board" })
    await expect(list).toHaveAttribute("aria-pressed", "true")
    await expect(board).toHaveAttribute("aria-pressed", "false")
    await userEvent.click(board)
    await expect(board).toHaveAttribute("aria-pressed", "true")
    // Single-select: activating one releases the other.
    await expect(list).toHaveAttribute("aria-pressed", "false")
    // Roving focus: arrow keys move between items without changing selection.
    await expect(board).toHaveFocus()
    await userEvent.keyboard("{ArrowRight}")
    const graph = await screen.findByRole("button", { name: "Graph" })
    await expect(graph).toHaveFocus()
    await expect(board).toHaveAttribute("aria-pressed", "true")
  },
}

/* Multi-select: any number of options pressed (text formatting). */
export const MultiSelect: Story = {
  render: (args) => (
    <ToggleGroup {...args} multiple defaultValue={["bold"]}>
      <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
      <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
      <ToggleGroupItem value="underline">Underline</ToggleGroupItem>
    </ToggleGroup>
  ),
  play: async () => {
    const bold = await screen.findByRole("button", { name: "Bold" })
    const italic = await screen.findByRole("button", { name: "Italic" })
    await expect(bold).toHaveAttribute("aria-pressed", "true")
    await userEvent.click(italic)
    // Multi-select: both stay pressed.
    await expect(bold).toHaveAttribute("aria-pressed", "true")
    await expect(italic).toHaveAttribute("aria-pressed", "true")
  },
}

/* Both appearances: borderless `default` and bordered `outline` (the group default). */
export const Variants: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-4">
      <ToggleGroup variant="default" defaultValue={["board"]}>
        <ToggleGroupItem value="list">List</ToggleGroupItem>
        <ToggleGroupItem value="board">Board</ToggleGroupItem>
        <ToggleGroupItem value="graph">Graph</ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup variant="outline" defaultValue={["board"]}>
        <ToggleGroupItem value="list">List</ToggleGroupItem>
        <ToggleGroupItem value="board">Board</ToggleGroupItem>
        <ToggleGroupItem value="graph">Graph</ToggleGroupItem>
      </ToggleGroup>
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-4">
      <ToggleGroup size="sm" defaultValue={["a"]}>
        <ToggleGroupItem value="a">Day</ToggleGroupItem>
        <ToggleGroupItem value="b">Week</ToggleGroupItem>
        <ToggleGroupItem value="c">Month</ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup size="default" defaultValue={["b"]}>
        <ToggleGroupItem value="a">Day</ToggleGroupItem>
        <ToggleGroupItem value="b">Week</ToggleGroupItem>
        <ToggleGroupItem value="c">Month</ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup size="lg" defaultValue={["c"]}>
        <ToggleGroupItem value="a">Day</ToggleGroupItem>
        <ToggleGroupItem value="b">Week</ToggleGroupItem>
        <ToggleGroupItem value="c">Month</ToggleGroupItem>
      </ToggleGroup>
    </div>
  ),
}

export const Vertical: Story = {
  render: () => (
    <ToggleGroup orientation="vertical" defaultValue={["start"]}>
      <ToggleGroupItem value="start">Start</ToggleGroupItem>
      <ToggleGroupItem value="center">Center</ToggleGroupItem>
      <ToggleGroupItem value="end">End</ToggleGroupItem>
    </ToggleGroup>
  ),
}

export const Disabled: Story = {
  render: () => (
    <ToggleGroup disabled defaultValue={["board"]}>
      <ToggleGroupItem value="list">List</ToggleGroupItem>
      <ToggleGroupItem value="board">Board</ToggleGroupItem>
      <ToggleGroupItem value="graph">Graph</ToggleGroupItem>
    </ToggleGroup>
  ),
  play: async () => {
    const board = await screen.findByRole("button", { name: "Board" })
    await expect(board).toBeDisabled()
  },
}
