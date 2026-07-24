import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn, userEvent, within } from "storybook/test"

import { ErrorState } from "@/components/ui/error-state"
import { Button } from "@/components/ui/button"

/**
 * Theme (Light/Dark) and direction (English-LTR / Persian-RTL) come from the
 * global Storybook toolbar — stories never hard-code a `.dark` wrapper.
 */
const meta = {
  title: "Components/ErrorState",
  component: ErrorState,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "default", "lg"] },
    title: { control: "text" },
    description: { control: "text" },
    detail: { control: "text" },
    retryLabel: { control: "text" },
  },
  args: {
    onRetry: fn(),
  },
  decorators: [
    (Story) => (
      <div className="w-[28rem] max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ErrorState>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    // Error surfaces are announced assertively.
    await expect(canvas.getByRole("alert")).toBeInTheDocument()
    await userEvent.click(canvas.getByRole("button", { name: "Try again" }))
    await expect(args.onRetry).toHaveBeenCalledOnce()
  },
}

export const WithDetail: Story = {
  args: {
    detail: "TypeError: Failed to fetch (GET /api/assets)",
  },
}

export const NoRetry: Story = {
  args: { onRetry: undefined },
}

export const CustomActions: Story = {
  args: {
    title: "Couldn't reach the scanner",
    description: "The scan service is unreachable. Retry, or contact support.",
    detail: "503 Service Unavailable",
    children: <Button variant="outline" size="sm">Contact support</Button>,
  },
}

export const Sizes: Story = {
  args: { onRetry: undefined },
  render: (args) => (
    <div className="flex flex-col gap-6">
      <ErrorState {...args} size="sm" />
      <ErrorState {...args} size="default" />
      <ErrorState {...args} size="lg" />
    </div>
  ),
}
