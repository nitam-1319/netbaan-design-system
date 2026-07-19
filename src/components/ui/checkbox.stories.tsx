import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"

import { Checkbox } from "@/components/ui/checkbox"

const meta = {
  title: "Components/Checkbox",
  component: Checkbox,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
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
  render: () => (
    <label className="flex items-center gap-2.5 text-sm">
      <Checkbox defaultChecked />
      Notify me about critical findings
    </label>
  ),
}

export const Indeterminate: Story = {
  render: () => <Checkbox indeterminate aria-label="Select all rows" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const box = canvas.getByRole("checkbox")
    await expect(box).toHaveAttribute("aria-checked", "mixed")
  },
}

export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Checkbox aria-label="unchecked" />
      <Checkbox defaultChecked aria-label="checked" />
      <Checkbox indeterminate aria-label="indeterminate" />
      <Checkbox disabled aria-label="disabled" />
      <Checkbox disabled defaultChecked aria-label="disabled checked" />
    </div>
  ),
}
