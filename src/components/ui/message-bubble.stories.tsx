import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { MessageBubble } from "@/components/ui/message-bubble"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers — no `className` is passed to
 * an AEGIS component.
 */
const meta = {
  title: "Components/MessageBubble",
  component: MessageBubble,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    author: {
      control: "inline-radio",
      options: ["user", "assistant", "system"],
    },
    children: { control: "text" },
  },
  args: {
    author: "assistant",
    children: "Here's a summary of the latest scan results.",
  },
} satisfies Meta<typeof MessageBubble>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const bubble = canvas.getByText(/summary of the latest scan/)
    await expect(
      bubble.closest("[data-slot=message-bubble]")
    ).toHaveAttribute("data-author", "assistant")
    // Speaker is announced, not inferred from side/colour.
    await expect(canvas.getByText("Assistant:")).toBeInTheDocument()
  },
}

export const Conversation: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <MessageBubble author="system">Session started · 3 assets in scope</MessageBubble>
      <MessageBubble author="user">Which hosts have expiring certificates?</MessageBubble>
      <MessageBubble author="assistant">
        Two hosts have certificates expiring within 14 days: api.corp.io and
        vpn.corp.io. Want me to open findings for them?
      </MessageBubble>
      <MessageBubble author="user">Yes, open both.</MessageBubble>
      <MessageBubble author="assistant">
        Done — created two findings and assigned them to the SOC queue.
      </MessageBubble>
    </div>
  ),
}

export const LongContent: Story = {
  args: {
    author: "assistant",
    children:
      "Line one of the response.\nLine two preserves the newline.\nAnd a very long token like supercalifragilisticexpialidocious-attack-surface-management wraps instead of overflowing.",
  },
}
