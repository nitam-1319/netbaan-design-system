import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn, userEvent, within } from "storybook/test"

import { InlineEdit } from "@/components/ui/inline-edit"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */
const meta = {
  title: "Components/InlineEdit",
  component: InlineEdit,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    disabled: { control: "boolean" },
    onValueChange: { action: "valueChange" },
  },
  args: {
    onValueChange: fn(),
    label: "Display name",
    defaultValue: "Netbaan Security",
    placeholder: "Add a name",
    size: "md",
    disabled: false,
  },
} satisfies Meta<typeof InlineEdit>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    // Enter edit mode.
    await userEvent.click(canvas.getByRole("button", { name: /edit display name/i }))
    const input = canvas.getByRole("textbox", { name: "Display name" })
    await expect(input).toHaveValue("Netbaan Security")
    // Edit and commit with Enter.
    await userEvent.clear(input)
    await userEvent.type(input, "AEGIS{Enter}")
    await expect(args.onValueChange).toHaveBeenCalledWith("AEGIS")
  },
}

export const CancelReverts: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: /edit display name/i }))
    const input = canvas.getByRole("textbox", { name: "Display name" })
    await userEvent.clear(input)
    await userEvent.type(input, "Throwaway{Escape}")
    // Back to display mode with the original value.
    await expect(
      canvas.getByRole("button", { name: /edit display name/i })
    ).toBeInTheDocument()
    await expect(canvas.getByText("Netbaan Security")).toBeInTheDocument()
  },
}

export const Empty: Story = {
  args: { defaultValue: "", placeholder: "Add a description" },
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <InlineEdit label="Small" defaultValue="Small value" size="sm" />
      <InlineEdit label="Medium" defaultValue="Medium value" size="md" />
      <InlineEdit label="Large" defaultValue="Large value" size="lg" />
    </div>
  ),
}

export const Disabled: Story = {
  args: { disabled: true },
}
