import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"

import { ResponseFeedback } from "@/components/ui/response-feedback"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers — no `className` is passed to
 * an AEGIS component.
 */
const meta = {
  title: "Components/ResponseFeedback",
  component: ResponseFeedback,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    disabled: { control: "boolean" },
    onValueChange: { action: "valueChange" },
  },
  args: {
    size: "md",
  },
} satisfies Meta<typeof ResponseFeedback>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const up = canvas.getByRole("button", { name: "Good response" })
    const down = canvas.getByRole("button", { name: "Bad response" })

    await expect(up).toHaveAttribute("aria-pressed", "false")
    await userEvent.click(up)
    await expect(up).toHaveAttribute("aria-pressed", "true")

    // Selecting the other clears the first.
    await userEvent.click(down)
    await expect(up).toHaveAttribute("aria-pressed", "false")
    await expect(down).toHaveAttribute("aria-pressed", "true")

    // Clicking the active one again clears it.
    await userEvent.click(down)
    await expect(down).toHaveAttribute("aria-pressed", "false")
  },
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
      <ResponseFeedback size="sm" />
      <ResponseFeedback size="md" />
      <ResponseFeedback size="lg" />
    </div>
  ),
}

export const PreselectedUp: Story = {
  args: { defaultValue: "up" },
}

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "down" },
}

export const InContext: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        color: "var(--muted-foreground)",
        fontSize: "0.8rem",
      }}
    >
      <span>Was this helpful?</span>
      <ResponseFeedback size="sm" />
    </div>
  ),
}
