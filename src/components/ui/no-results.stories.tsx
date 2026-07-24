import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn, userEvent, within } from "storybook/test"
import { FilterX } from "lucide-react"

import { NoResults } from "@/components/ui/no-results"
import { Button } from "@/components/ui/button"

/**
 * Theme (Light/Dark) and direction (English-LTR / Persian-RTL) come from the
 * global Storybook toolbar — stories never hard-code a `.dark` wrapper.
 */
const meta = {
  title: "Components/NoResults",
  component: NoResults,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "default", "lg"] },
    query: { control: "text" },
    title: { control: "text" },
    description: { control: "text" },
    clearLabel: { control: "text" },
  },
  args: {
    query: "acme corp",
    onClear: fn(),
  },
  decorators: [
    (Story) => (
      <div className="w-[28rem] max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NoResults>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("No results found")).toBeInTheDocument()
    // Clicking clear invokes the handler.
    await userEvent.click(canvas.getByRole("button", { name: "Clear search" }))
    await expect(args.onClear).toHaveBeenCalledOnce()
  },
}

export const WithoutQuery: Story = {
  args: { query: undefined },
}

export const NoClearAction: Story = {
  args: { onClear: undefined },
}

export const CustomIconAndActions: Story = {
  args: {
    query: "critical",
    icon: <FilterX />,
    clearLabel: "Reset filters",
    children: <Button size="sm">Browse all</Button>,
  },
}

export const Sizes: Story = {
  args: { onClear: undefined },
  render: (args) => (
    <div className="flex flex-col gap-6">
      <NoResults {...args} size="sm" query="sm" />
      <NoResults {...args} size="default" query="default" />
      <NoResults {...args} size="lg" query="lg" />
    </div>
  ),
}
