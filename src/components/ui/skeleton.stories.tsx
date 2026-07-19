import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect } from "storybook/test"

import { Skeleton } from "@/components/ui/skeleton"

const meta = {
  title: "Components/Skeleton",
  component: Skeleton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="p-10 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Skeleton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <Skeleton render={<div className="h-4 w-48" />} />,
  play: async ({ canvasElement }) => {
    const el = canvasElement.querySelector("[data-slot='skeleton']")
    await expect(el).toBeInTheDocument()
    await expect(el).toHaveAttribute("aria-hidden", "true")
  },
}

export const CardPlaceholder: Story = {
  render: () => (
    <div className="w-72 space-y-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <Skeleton render={<div className="size-9 rounded-full" />} />
        <div className="space-y-2">
          <Skeleton render={<div className="h-3.5 w-28" />} />
          <Skeleton render={<div className="h-3 w-20" />} />
        </div>
      </div>
      <Skeleton render={<div className="h-24 w-full" />} />
      <div className="space-y-2">
        <Skeleton render={<div className="h-3 w-full" />} />
        <Skeleton render={<div className="h-3 w-4/5" />} />
      </div>
    </div>
  ),
}
