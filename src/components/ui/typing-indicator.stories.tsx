import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { TypingIndicator } from "@/components/ui/typing-indicator"
import { MessageBubble } from "@/components/ui/message-bubble"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers — no `className` is passed to
 * an AEGIS component.
 */
const meta = {
  title: "Components/TypingIndicator",
  component: TypingIndicator,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    label: { control: "text" },
  },
  args: {
    size: "md",
    label: "Assistant is typing…",
  },
  decorators: [
    (Story) => (
      <div className="p-6 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TypingIndicator>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const status = canvas.getByRole("status")
    // Live status region announces the activity via an sr-only label.
    await expect(status).toHaveAttribute("aria-live", "polite")
    await expect(canvas.getByText("Assistant is typing…")).toBeInTheDocument()
    // Three decorative dots.
    await expect(
      status.querySelectorAll("[data-slot=typing-indicator-dot]")
    ).toHaveLength(3)
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-8">
      <TypingIndicator size="sm" label="Small" />
      <TypingIndicator size="md" label="Medium" />
      <TypingIndicator size="lg" label="Large" />
    </div>
  ),
}

export const InAssistantBubble: Story = {
  render: () => (
    <div className="w-96">
      <MessageBubble author="assistant">
        <TypingIndicator label="Assistant is replying…" />
      </MessageBubble>
    </div>
  ),
}
