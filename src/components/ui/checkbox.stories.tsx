import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"

import { Checkbox } from "@/components/ui/checkbox"

const meta = {
  title: "Components/Checkbox",
  component: Checkbox,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    disabled: { control: "boolean" },
    indeterminate: { control: "boolean" },
    label: { control: "text" },
    description: { control: "text" },
  },
  decorators: [
    (Story) => (
      <div className="flex min-h-24 items-center justify-center p-10 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <Checkbox aria-label="Include resolved findings" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const box = canvas.getByRole("checkbox")
    await expect(box).toHaveAttribute("aria-checked", "false")
    await userEvent.click(box)
    await expect(box).toHaveAttribute("aria-checked", "true")
  },
}

export const WithLabel: Story = {
  args: {
    defaultChecked: true,
    label: "Enable audit logging",
    description: "Records every access event for 90 days.",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const box = canvas.getByRole("checkbox")
    // The whole label row toggles the box.
    await expect(box).toHaveAttribute("aria-checked", "true")
    await userEvent.click(canvas.getByText("Enable audit logging"))
    await expect(box).toHaveAttribute("aria-checked", "false")
  },
}

export const Indeterminate: Story = {
  render: () => <Checkbox indeterminate aria-label="Select all rows" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const box = canvas.getByRole("checkbox")
    await expect(box).toHaveAttribute("aria-checked", "mixed")
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Checkbox size="sm" defaultChecked label="Small — 16px box" />
      <Checkbox size="md" defaultChecked label="Medium — 20px box (default)" />
      <Checkbox size="lg" defaultChecked label="Large — 24px box" />
    </div>
  ),
}

export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Checkbox label="Default (unchecked)" />
      <Checkbox defaultChecked label="Checked" />
      <Checkbox indeterminate label="Indeterminate" />
      <Checkbox aria-invalid label="Error (required, unchecked)" />
      <Checkbox readOnly defaultChecked label="Read-only (locked value)" />
      <Checkbox disabled label="Disabled off" />
      <Checkbox disabled defaultChecked label="Disabled on" />
    </div>
  ),
}
