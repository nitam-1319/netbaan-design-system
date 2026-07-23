import type { ReactNode } from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { Fieldset } from "@/components/ui/fieldset"
import { TextField } from "@/components/ui/text-field"
import { Checkbox } from "@/components/ui/checkbox"

const meta = {
  title: "Components/Fieldset",
  component: Fieldset,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "inline-radio", options: ["plain", "card"] },
    disabled: { control: "boolean" },
  },
  args: {
    legend: "Contact details",
    variant: "plain",
  },
  decorators: [
    (Story) => (
      <div className="w-96 p-6 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Fieldset>

export default meta
type Story = StoryObj<typeof meta>

// Plain HTML label pairing for demo purposes (Checkbox is box-only by design).
function CheckRow({
  children,
  defaultChecked,
}: {
  children: ReactNode
  defaultChecked?: boolean
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-foreground select-none">
      <Checkbox defaultChecked={defaultChecked} />
      {children}
    </label>
  )
}

export const Default: Story = {
  args: {
    description: "How can we reach you about your order?",
    children: (
      <>
        <TextField label="Full name" placeholder="Ada Lovelace" />
        <TextField label="Email" type="email" placeholder="ada@example.com" />
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // The legend labels the group.
    await expect(
      canvas.getByRole("group", { name: /contact details/i })
    ).toBeInTheDocument()
  },
}

export const Card: Story = {
  args: {
    variant: "card",
    legend: "Notifications",
    description: "Choose what you want to hear about.",
    children: (
      <>
        <CheckRow defaultChecked>Product updates</CheckRow>
        <CheckRow defaultChecked>Security alerts</CheckRow>
        <CheckRow>Marketing emails</CheckRow>
      </>
    ),
  },
}

export const Disabled: Story = {
  args: {
    variant: "card",
    legend: "Billing address",
    disabled: true,
    children: (
      <>
        <TextField label="Street" placeholder="1 Main St" />
        <TextField label="City" placeholder="Springfield" />
      </>
    ),
  },
}

export const WithoutDescription: Story = {
  args: {
    legend: "Preferences",
    children: (
      <>
        <CheckRow>Remember this device</CheckRow>
        <CheckRow>Enable two-factor authentication</CheckRow>
      </>
    ),
  },
}
