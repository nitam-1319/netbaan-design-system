import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, waitFor, within } from "storybook/test"

import { MentionInput } from "@/components/ui/mention-input"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */

const PEOPLE = [
  { id: "alice", label: "Alice Ng", description: "Security lead" },
  { id: "alan", label: "Alan Ford", description: "SRE" },
  { id: "bob", label: "Bob Rivera", description: "Analyst" },
  { id: "carol", label: "Carol Diaz", description: "Product" },
]

const meta = {
  title: "Components/MentionInput",
  component: MentionInput,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    trigger: { control: "text" },
  },
  args: {
    options: PEOPLE,
    label: "Comment",
    placeholder: "Type @ to mention someone…",
    trigger: "@",
    size: "md",
    rows: 3,
  },
} satisfies Meta<typeof MentionInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <div style={{ maxWidth: 460 }}>
      <MentionInput {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const control = canvas.getByRole("textbox", { name: "Comment" })
    await userEvent.click(control)
    await userEvent.type(control, "Ping @al")

    // The suggestion listbox opens and filters to matches for "al".
    const listbox = await canvas.findByRole("listbox")
    await expect(listbox).toBeInTheDocument()
    await expect(within(listbox).getByText(/Alice Ng/)).toBeInTheDocument()

    // Enter completes the first match, replacing the @al token with "@Alice Ng ".
    await userEvent.keyboard("{Enter}")
    await expect(control).toHaveValue("Ping @Alice Ng ")

    // Popup dismisses after completion.
    await waitFor(() => expect(canvas.queryByRole("listbox")).not.toBeInTheDocument())
  },
}

export const KeyboardNavigation: Story = {
  render: (args) => (
    <div style={{ maxWidth: 460 }}>
      <MentionInput {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const control = canvas.getByRole("textbox", { name: "Comment" })
    await userEvent.click(control)
    await userEvent.type(control, "cc @")
    await canvas.findByRole("listbox")
    // Move to the second option, then complete it.
    await userEvent.keyboard("{ArrowDown}{Enter}")
    await expect(control).toHaveValue("cc @Alan Ford ")
  },
}

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: 460 }}>
      <MentionInput {...args} size="sm" label="Small" />
      <MentionInput {...args} size="md" label="Medium" />
      <MentionInput {...args} size="lg" label="Large" />
    </div>
  ),
}

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "You can't @mention here." },
  render: (args) => (
    <div style={{ maxWidth: 460 }}>
      <MentionInput {...args} />
    </div>
  ),
}
