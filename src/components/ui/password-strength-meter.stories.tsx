import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"

import { PasswordStrengthMeter } from "@/components/ui/password-strength-meter"

const meta = {
  title: "Components/Password Strength Meter",
  component: PasswordStrengthMeter,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    value: { control: "text" },
    size: { control: "inline-radio", options: ["sm", "md"] },
    showLabel: { control: "boolean" },
    showRequirements: { control: "boolean" },
  },
  args: { value: "Password1", size: "md", showLabel: true, showRequirements: false },
  decorators: [
    (Story) => (
      <div className="w-[22rem] max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PasswordStrengthMeter>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Scale: Story = {
  render: (args) => (
    <div className="flex flex-col gap-5">
      <PasswordStrengthMeter {...args} value="ab" />
      <PasswordStrengthMeter {...args} value="abcdefg" />
      <PasswordStrengthMeter {...args} value="abcdefgh" />
      <PasswordStrengthMeter {...args} value="Abcdefgh1" />
      <PasswordStrengthMeter {...args} value="Abcd3fgh!jkl" />
    </div>
  ),
}

export const WithRequirements: Story = {
  args: { value: "abc", showRequirements: true },
}

export const Small: Story = {
  args: { size: "sm", value: "Abcd3fgh!jkl", showRequirements: true },
}

export const Empty: Story = {
  args: { value: "" },
}

/** A live example wired to a password input. */
export const Interactive: Story = {
  render: (args) => {
    const [pw, setPw] = React.useState("")
    return (
      <div className="flex flex-col gap-2">
        <input
          aria-label="Password"
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="Type a password…"
          className="h-10 w-full rounded-[9px] border border-border-strong bg-surface-2 px-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-accent-soft"
        />
        <PasswordStrengthMeter {...args} value={pw} showRequirements />
      </div>
    )
  },
}

/**
 * Persian / RTL — label and requirements mirror to the correct side.
 */
export const RTLPersian: Story = {
  name: "RTL (Persian)",
  render: (args) => (
    <div dir="rtl">
      <PasswordStrengthMeter
        {...args}
        value="Abcd3fgh!"
        labels={["خیلی ضعیف", "ضعیف", "متوسط", "خوب", "قوی"]}
        showRequirements
        requirements={[
          { label: "حداقل ۸ کاراکتر", met: true },
          { label: "یک عدد", met: true },
          { label: "یک نماد", met: true },
        ]}
      />
    </div>
  ),
}

/** The meter exposes a labelled progressbar whose value rises with strength. */
export const StrengthInteraction: Story = {
  render: (args) => {
    const [pw, setPw] = React.useState("")
    return (
      <div className="flex flex-col gap-2">
        <input
          aria-label="Password"
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          className="h-10 w-full rounded-[9px] border border-border-strong bg-surface-2 px-3.5 text-sm text-foreground outline-none focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-accent-soft"
        />
        <PasswordStrengthMeter {...args} value={pw} />
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const bar = canvas.getByRole("progressbar", { name: "Password strength" })
    await expect(bar).toHaveAttribute("aria-valuenow", "0")

    const input = canvas.getByLabelText("Password")
    await userEvent.type(input, "Abcd3fgh!jkl")
    await expect(canvas.getByText("Strong")).toBeVisible()
    await expect(Number(bar.getAttribute("aria-valuenow"))).toBeGreaterThan(80)
  },
}
