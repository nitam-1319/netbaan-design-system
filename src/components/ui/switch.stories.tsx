import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"

import { Switch } from "@/components/ui/switch"

const meta = {
  title: "Components/Switch",
  component: Switch,
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
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <Switch aria-label="Enable monitoring" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const sw = canvas.getByRole("switch")
    await expect(sw).toHaveAttribute("aria-checked", "false")
    await userEvent.click(sw)
    await expect(sw).toHaveAttribute("aria-checked", "true")
  },
}

export const WithLabel: Story = {
  render: () => (
    <label className="flex items-center gap-3 text-sm">
      <Switch defaultChecked />
      Continuous monitoring
    </label>
  ),
}

export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Switch aria-label="off" />
      <Switch defaultChecked aria-label="on" />
      <Switch disabled aria-label="disabled off" />
      <Switch disabled defaultChecked aria-label="disabled on" />
    </div>
  ),
}
