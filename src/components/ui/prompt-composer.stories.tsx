import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn, userEvent, within } from "storybook/test"
import { Paperclip } from "lucide-react"

import { PromptComposer } from "@/components/ui/prompt-composer"
import { Button } from "@/components/ui/button"

const meta = {
  title: "Components/Prompt Composer",
  component: PromptComposer,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
    submitOnEnter: { control: "boolean" },
    showCount: { control: "boolean" },
    maxLength: { control: "number" },
  },
  args: {
    label: "Message",
    placeholder: "Send a message…",
    size: "md",
    loading: false,
    submitOnEnter: true,
    onSubmit: fn(),
    onValueChange: fn(),
  },
  decorators: [
    (Story) => (
      <div className="text-foreground w-[30rem] max-w-full p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PromptComposer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: "Message" })
    const send = canvas.getByRole("button", { name: "Send message" })

    // Empty → send disabled.
    await expect(send).toBeDisabled()

    // Type → send enables; onValueChange fired.
    await userEvent.type(input, "Run a scan")
    await expect(send).toBeEnabled()
    await expect(args.onValueChange).toHaveBeenCalled()

    // Enter submits the trimmed text and clears the (uncontrolled) field.
    await userEvent.keyboard("{Enter}")
    await expect(args.onSubmit).toHaveBeenCalledWith("Run a scan")
    await expect(input).toHaveValue("")
  },
}

export const ShiftEnterNewline: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox", { name: "Message" })
    await userEvent.type(input, "line one")
    // Shift+Enter must NOT submit — it inserts a newline.
    await userEvent.keyboard("{Shift>}{Enter}{/Shift}")
    await userEvent.type(input, "line two")
    await expect(args.onSubmit).not.toHaveBeenCalled()
    await expect(input).toHaveValue("line one\nline two")
  },
}

export const WithAttachAndCount: Story = {
  args: { showCount: true, maxLength: 280 },
  render: (args) => (
    <PromptComposer
      {...args}
      leading={
        <Button variant="ghost" size="icon-sm" aria-label="Attach file">
          <Paperclip aria-hidden />
        </Button>
      }
    />
  ),
}

export const Streaming: Story = {
  args: { loading: true, defaultValue: "Summarise the latest findings" },
}

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "You can't edit this right now" },
}

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <PromptComposer {...args} size="sm" placeholder="Small" />
      <PromptComposer {...args} size="md" placeholder="Medium" />
      <PromptComposer {...args} size="lg" placeholder="Large" />
    </div>
  ),
}
