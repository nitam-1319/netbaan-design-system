import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { ConversationThread } from "@/components/ui/conversation-thread"
import { MessageBubble } from "@/components/ui/message-bubble"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers — no `className` is passed to
 * an AEGIS component.
 */
const meta = {
  title: "Components/ConversationThread",
  component: ConversationThread,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    gap: { control: "inline-radio", options: ["sm", "md", "lg"] },
    live: { control: "inline-radio", options: ["off", "polite"] },
    label: { control: "text" },
  },
  args: {
    label: "Scan assistant conversation",
    gap: "md",
    live: "off",
  },
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-2xl text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ConversationThread>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <ConversationThread {...args}>
      <MessageBubble author="system">Session started · 3 assets in scope</MessageBubble>
      <MessageBubble author="user">Which hosts have expiring certificates?</MessageBubble>
      <MessageBubble author="assistant">
        Two hosts have certificates expiring within 14 days: api.corp.io and
        vpn.corp.io.
      </MessageBubble>
      <MessageBubble author="user">Open findings for both.</MessageBubble>
      <MessageBubble author="assistant">
        Done — created two findings and assigned them to the SOC queue.
      </MessageBubble>
    </ConversationThread>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const log = canvas.getByRole("log", {
      name: "Scan assistant conversation",
    })
    await expect(log).toBeInTheDocument()
    // Turns are rendered in order inside the log.
    await expect(within(log).getByText(/expiring certificates/)).toBeInTheDocument()
    await expect(within(log).getByText(/SOC queue/)).toBeInTheDocument()
  },
}

export const Streaming: Story = {
  args: { live: "polite" },
  render: (args) => (
    <ConversationThread {...args}>
      <MessageBubble author="user">Summarize the latest scan.</MessageBubble>
      <MessageBubble author="assistant">
        The latest scan found 4 new exposed services and 1 expired certificate…
      </MessageBubble>
    </ConversationThread>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const log = canvas.getByRole("log")
    // Polite live region wired for streamed additions.
    await expect(log).toHaveAttribute("aria-live", "polite")
    await expect(log).toHaveAttribute("aria-relevant", "additions")
  },
}

export const Gaps: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      {(["sm", "md", "lg"] as const).map((gap) => (
        <div key={gap}>
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            gap={gap}
          </p>
          <ConversationThread gap={gap} label={`Conversation ${gap}`}>
            <MessageBubble author="user">Ping</MessageBubble>
            <MessageBubble author="assistant">Pong</MessageBubble>
          </ConversationThread>
        </div>
      ))}
    </div>
  ),
}
