import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"

import { OTPInput } from "@/components/ui/otp-input"

const meta = {
  title: "Components/OTPInput",
  component: OTPInput,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    length: { control: { type: "number", min: 4, max: 8 } },
    disabled: { control: "boolean" },
    mask: { control: "boolean" },
    onValueChange: { action: "valueChange" },
    onValueComplete: { action: "valueComplete" },
  },
  args: {
    label: "Verification code",
    length: 6,
  },
  decorators: [
    (Story) => (
      <div className="p-6 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof OTPInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    description: "Enter the 6-digit code we sent to your device.",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const slots = canvas.getAllByRole("textbox")
    await expect(slots).toHaveLength(6)
    // Typing advances through the slots and fills the value.
    await userEvent.type(slots[0], "123456")
    await expect(slots[0]).toHaveValue("1")
    await expect(slots[5]).toHaveValue("6")
  },
}

export const Sizes: Story = {
  args: { label: undefined },
  render: () => (
    <div className="flex flex-col gap-6">
      <OTPInput size="sm" label="Small" length={6} />
      <OTPInput size="md" label="Medium" length={6} />
      <OTPInput size="lg" label="Large" length={6} />
    </div>
  ),
}

export const FourDigits: Story = {
  args: { label: "PIN", length: 4, description: "4-digit PIN." },
}

export const Masked: Story = {
  args: { label: "Secure code", mask: true, defaultValue: "1234" },
}

export const Error: Story = {
  args: {
    label: "Verification code",
    defaultValue: "000000",
    error: "That code is incorrect or expired.",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const message = canvas.getByText("That code is incorrect or expired.")
    await expect(message).toBeInTheDocument()
    // The error state marks the field-group invalid and links the message for AT.
    const root = canvasElement.querySelector('[data-slot="otp-input-root"]')
    await expect(root).toHaveAttribute("aria-invalid", "true")
    await expect(root).toHaveAttribute(
      "aria-describedby",
      message.getAttribute("id") as string
    )
  },
}

export const Disabled: Story = {
  args: { defaultValue: "123456", disabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getAllByRole("textbox")[0]).toBeDisabled()
  },
}
