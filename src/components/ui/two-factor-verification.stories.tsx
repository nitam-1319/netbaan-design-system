import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn, userEvent, within } from "storybook/test"

import { TwoFactorVerification } from "@/components/ui/two-factor-verification"

const meta = {
  title: "Components/Two-Factor Verification",
  component: TwoFactorVerification,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    length: { control: { type: "number", min: 4, max: 8 } },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    channel: { control: "text" },
    resendCooldown: { control: { type: "number", min: 0, max: 120 } },
    verifying: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: {
    length: 6,
    size: "md",
    channel: "+1 (•••) •••-4821",
    resendCooldown: 30,
  },
  decorators: [
    (Story) => (
      <div className="w-[26rem] max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TwoFactorVerification>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { onComplete: fn(), onResend: fn() },
}

export const WithVerifyButton: Story = {
  args: { onSubmit: fn(), onResend: fn() },
}

export const EmailChannel: Story = {
  args: {
    channel: "s•••@example.com",
    title: "Check your email",
    onComplete: fn(),
    onResend: fn(),
  },
}

export const ErrorState: Story = {
  args: {
    error: "That code is incorrect or expired.",
    value: "123456",
    onSubmit: fn(),
    onResend: fn(),
  },
}

export const Verifying: Story = {
  args: { value: "482913", verifying: true, onSubmit: fn(), onResend: fn() },
}

export const ResendReady: Story = {
  args: { resendCooldown: 0, onResend: fn(), onComplete: fn() },
}

export const FourDigit: Story = {
  args: { length: 4, onComplete: fn(), onResend: fn() },
}

export const Disabled: Story = {
  args: { disabled: true, onSubmit: fn() },
}

/**
 * Persian / RTL — the panel mirrors and the code slots read right-to-left.
 */
export const RTLPersian: Story = {
  name: "RTL (Persian)",
  render: (args) => (
    <div dir="rtl">
      <TwoFactorVerification
        {...args}
        title="تأیید دو مرحله‌ای"
        description="کد ۶ رقمی ارسال‌شده را وارد کنید."
        onComplete={args.onComplete}
      />
    </div>
  ),
  args: { onComplete: fn(), onResend: fn() },
}

/** Typing a full code fires `onComplete`; the verify button enables. */
export const CompleteInteraction: Story = {
  render: (args) => {
    const [code, setCode] = React.useState("")
    return (
      <TwoFactorVerification
        {...args}
        value={code}
        onChange={setCode}
        onSubmit={args.onSubmit}
        onComplete={args.onComplete}
      />
    )
  },
  args: { onComplete: fn(), onSubmit: fn(), onResend: fn(), resendCooldown: 0 },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const first = canvas.getByLabelText("Character 1 of 6")
    await userEvent.click(first)
    await userEvent.keyboard("482913")
    await expect(args.onComplete).toHaveBeenCalledWith("482913")

    const verify = canvas.getByRole("button", { name: "Verify" })
    await expect(verify).toBeEnabled()
    await userEvent.click(verify)
    await expect(args.onSubmit).toHaveBeenCalledWith("482913")
  },
}
