import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"

import { PasswordInput } from "@/components/ui/password-input"

const meta = {
  title: "Components/PasswordInput",
  component: PasswordInput,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    disabled: { control: "boolean" },
    hideReveal: { control: "boolean" },
    onChange: { action: "change" },
  },
  args: {
    label: "Password",
    placeholder: "••••••••",
  },
  decorators: [
    (Story) => (
      <div className="w-72 p-6 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PasswordInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByLabelText("Password")
    await expect(input).toHaveAttribute("type", "password")
    // Reveal toggle flips the input type.
    const toggle = canvas.getByRole("button", { name: "Show password" })
    await userEvent.click(toggle)
    await expect(input).toHaveAttribute("type", "text")
    await expect(
      canvas.getByRole("button", { name: "Hide password" })
    ).toHaveAttribute("aria-pressed", "true")
  },
}

export const Sizes: Story = {
  args: { label: undefined },
  render: () => (
    <div className="flex flex-col gap-5">
      <PasswordInput size="sm" label="Small" placeholder="••••••••" />
      <PasswordInput size="md" label="Medium" placeholder="••••••••" />
      <PasswordInput size="lg" label="Large" placeholder="••••••••" />
    </div>
  ),
}

export const WithHelperText: Story = {
  args: {
    label: "New password",
    description: "At least 12 characters, one number and one symbol.",
    autoComplete: "new-password",
  },
}

export const Error: Story = {
  args: {
    label: "Password",
    defaultValue: "short",
    error: "Password is too short.",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByLabelText("Password")
    // The error state marks the control invalid and links the message for AT.
    await expect(input).toHaveAttribute("aria-invalid", "true")
    const message = canvas.getByText("Password is too short.")
    await expect(input).toHaveAttribute(
      "aria-describedby",
      message.getAttribute("id") as string
    )
  },
}

export const Disabled: Story = {
  args: { defaultValue: "secret-value", disabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByLabelText("Password")).toBeDisabled()
  },
}

export const NoRevealToggle: Story = {
  args: { label: "PIN", hideReveal: true, placeholder: "••••" },
}
