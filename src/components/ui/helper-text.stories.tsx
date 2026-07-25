import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { HelperText } from "@/components/ui/helper-text"
import { Label } from "@/components/ui/field-label"

const meta = {
  title: "Components/Helper Text",
  component: HelperText,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    disabled: { control: "boolean" },
  },
  args: {
    children: "We'll never share your email with anyone else.",
    id: "email-help",
  },
  decorators: [
    (Story) => (
      <div className="max-w-sm p-8 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof HelperText>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const text = canvas.getByText(/never share your email/i)
    await expect(text).toBeInTheDocument()
    await expect(text).toHaveAttribute("id", "email-help")
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <HelperText size="sm">Small · 8+ characters.</HelperText>
      <HelperText size="md">Medium · include a number and a symbol.</HelperText>
      <HelperText size="lg">Large · this is the roomiest helper size.</HelperText>
    </div>
  ),
}

export const Disabled: Story = {
  args: { disabled: true, children: "This field is currently unavailable." },
}

export const WithLabelAndControl: Story = {
  render: () => (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="hp-email">Email address</Label>
      <input
        id="hp-email"
        type="email"
        aria-describedby="hp-email-help"
        placeholder="you@example.com"
        className="h-10 rounded-lg border border-[var(--border-strong)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] outline-none"
      />
      <HelperText id="hp-email-help">
        We'll only use this to send a confirmation.
      </HelperText>
    </div>
  ),
}
