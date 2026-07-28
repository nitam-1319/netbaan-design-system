import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"

import { TagInput } from "@/components/ui/tag-input"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers — no `className` is passed to
 * an AEGIS component.
 */
const meta = {
  title: "Components/TagInput",
  component: TagInput,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    disabled: { control: "boolean" },
    allowDuplicates: { control: "boolean" },
    addOnBlur: { control: "boolean" },
    maxTags: { control: "number" },
    onValueChange: { action: "valueChange" },
  },
  args: {
    label: "Tags",
    placeholder: "Add a tag…",
  },
  decorators: [
    (Story) => (
      <div className="w-96 p-6 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TagInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    defaultValue: ["asm", "critical"],
    description: "Press Enter to add · Backspace on an empty field removes the last.",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: "Tags" })
    // Seeded tags render.
    await expect(canvas.getByText("asm")).toBeInTheDocument()
    await expect(canvas.getByText("critical")).toBeInTheDocument()

    // Enter commits a new tag and clears the draft.
    await userEvent.type(input, "exposed{Enter}")
    await expect(canvas.getByText("exposed")).toBeInTheDocument()
    await expect(input).toHaveValue("")

    // Per-chip remove.
    await userEvent.click(canvas.getByRole("button", { name: "Remove asm" }))
    await expect(canvas.queryByText("asm")).toBeNull()

    // Backspace on an empty field removes the last tag.
    input.focus()
    await userEvent.keyboard("{Backspace}")
    await expect(canvas.queryByText("exposed")).toBeNull()
  },
}

export const Sizes: Story = {
  args: { label: undefined },
  render: () => (
    <div className="flex flex-col gap-5">
      <TagInput size="sm" label="Small" defaultValue={["one", "two"]} />
      <TagInput size="md" label="Medium" defaultValue={["alpha", "beta"]} />
      <TagInput size="lg" label="Large" defaultValue={["red", "amber", "green"]} />
    </div>
  ),
}

export const NoDuplicates: Story = {
  args: {
    defaultValue: ["prod"],
    description: "Adding an existing tag is ignored (default).",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: "Tags" })
    await userEvent.type(input, "prod{Enter}")
    // Still only one "prod".
    await expect(canvas.getAllByText("prod")).toHaveLength(1)
    await expect(input).toHaveValue("")
  },
}

export const MaxTags: Story = {
  args: {
    label: "Up to 3 tags",
    defaultValue: ["a", "b"],
    maxTags: 3,
    description: "Additions stop once the cap is reached.",
  },
}

export const Error: Story = {
  args: {
    defaultValue: ["only-one"],
    error: "Add at least two tags.",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole("textbox", { name: "Tags" })).toHaveAttribute(
      "aria-invalid",
      "true"
    )
    await expect(canvas.getByText(/at least two tags/i)).toBeInTheDocument()
  },
}

export const Disabled: Story = {
  args: {
    defaultValue: ["locked", "read-only"],
    disabled: true,
  },
}

export const Required: Story = {
  args: {
    label: "Tags",
    required: true,
    description: "At least one tag is required.",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: "Tags" })
    // Required applies while the field is empty…
    await expect(input).toBeRequired()
    // …and lifts once a tag is committed.
    await userEvent.type(input, "asm{Enter}")
    await expect(input).not.toBeRequired()
  },
}

export const Empty: Story = {
  args: {
    label: "Recipients",
    placeholder: "Type an email and press Enter…",
  },
}
