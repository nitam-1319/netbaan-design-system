import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"

import { RichTextEditor } from "@/components/ui/rich-text-editor"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */

const meta = {
  title: "Components/RichTextEditor",
  component: RichTextEditor,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
    minHeightRem: { control: { type: "number" } },
  },
  args: {
    label: "Message",
    placeholder: "Write something…",
    minHeightRem: 6,
  },
} satisfies Meta<typeof RichTextEditor>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <div style={{ maxWidth: 520 }}>
      <RichTextEditor {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // The formatting toolbar and its controls are present and labelled.
    const toolbar = canvas.getByRole("toolbar", { name: "Text formatting" })
    await expect(toolbar).toBeInTheDocument()
    await expect(canvas.getByRole("button", { name: "Bold" })).toBeInTheDocument()
    await expect(canvas.getByRole("button", { name: "Numbered list" })).toBeInTheDocument()

    // The editor is a labelled multiline textbox; the placeholder shows while empty.
    const editor = canvas.getByRole("textbox", { name: "Message" })
    await expect(editor).toHaveAttribute("aria-multiline", "true")
    await expect(canvas.getByText("Write something…")).toBeInTheDocument()

    // Typing enters content and clears the placeholder.
    await userEvent.click(editor)
    await userEvent.type(editor, "Hello AEGIS")
    await expect(editor).toHaveTextContent("Hello AEGIS")
    await expect(canvas.queryByText("Write something…")).not.toBeInTheDocument()
  },
}

export const Prefilled: Story = {
  args: {
    defaultValue:
      "<p>A short intro paragraph.</p><ul><li>First point</li><li>Second point</li></ul>",
  },
  render: (args) => (
    <div style={{ maxWidth: 520 }}>
      <RichTextEditor {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const editor = canvas.getByRole("textbox", { name: "Message" })
    await expect(editor).toHaveTextContent("A short intro paragraph.")
    await expect(within(editor).getByText("First point")).toBeInTheDocument()
  },
}

export const BoldItalicOnly: Story = {
  args: { controls: ["bold", "italic"] },
  render: (args) => (
    <div style={{ maxWidth: 520 }}>
      <RichTextEditor {...args} />
    </div>
  ),
}

export const ReadOnly: Story = {
  args: {
    readOnly: true,
    defaultValue: "<p>This content is read-only.</p>",
  },
  render: (args) => (
    <div style={{ maxWidth: 520 }}>
      <RichTextEditor {...args} />
    </div>
  ),
}

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "<p>Editing is disabled.</p>" },
  render: (args) => (
    <div style={{ maxWidth: 520 }}>
      <RichTextEditor {...args} />
    </div>
  ),
}
