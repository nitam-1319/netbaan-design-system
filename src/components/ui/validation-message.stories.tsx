import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { ValidationMessage } from "@/components/ui/validation-message"
import { Label } from "@/components/ui/field-label"

const meta = {
  title: "Components/Validation Message",
  component: ValidationMessage,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    tone: { control: "inline-radio", options: ["error", "warning", "success"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
  args: {
    tone: "error",
    children: "Enter a valid email address.",
    id: "email-error",
  },
  decorators: [
    (Story) => (
      <div className="max-w-sm p-8 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ValidationMessage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const alert = canvas.getByRole("alert")
    await expect(alert).toHaveTextContent("Enter a valid email address.")
    await expect(alert).toHaveAttribute("id", "email-error")
    await expect(alert).toHaveAttribute("data-tone", "error")
  },
}

export const Tones: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <ValidationMessage tone="error">
        Passwords don't match.
      </ValidationMessage>
      <ValidationMessage tone="warning">
        This username is unusual — double-check it.
      </ValidationMessage>
      <ValidationMessage tone="success">
        Username is available.
      </ValidationMessage>
    </div>
  ),
}

export const Success: Story = {
  args: { tone: "success", children: "Looks good!" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // success announces politely via role="status", not assertive role="alert".
    const status = canvas.getByRole("status")
    await expect(status).toHaveTextContent("Looks good!")
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <ValidationMessage size="sm">Small · required.</ValidationMessage>
      <ValidationMessage size="md">Medium · required.</ValidationMessage>
      <ValidationMessage size="lg">Large · required.</ValidationMessage>
    </div>
  ),
}

export const NoIcon: Story = {
  args: { icon: false, children: "Text-only validation message." },
}

export const WithField: Story = {
  render: () => (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="vm-email" required>
        Email address
      </Label>
      <input
        id="vm-email"
        type="email"
        aria-invalid
        aria-describedby="vm-email-error"
        defaultValue="not-an-email"
        className="h-10 rounded-lg border border-[var(--destructive)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] outline-none"
      />
      <ValidationMessage id="vm-email-error">
        Enter a valid email address.
      </ValidationMessage>
    </div>
  ),
}
