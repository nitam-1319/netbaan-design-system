import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import {
  SkeletonCard,
  SkeletonList,
  SkeletonTable,
  SkeletonText,
} from "@/components/ui/skeleton-templates"

const meta = {
  title: "Components/Skeleton Templates",
  component: SkeletonText,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[28rem] max-w-full p-8 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SkeletonText>

export default meta
type Story = StoryObj<typeof meta>

export const Text: Story = {
  args: { lines: 4 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const status = canvas.getByRole("status")
    await expect(status).toHaveAttribute("aria-busy", "true")
    await expect(status).toHaveAccessibleName(/loading/i)
  },
}

export const Card: Story = {
  render: () => <SkeletonCard />,
}

export const CardNoMedia: Story = {
  render: () => <SkeletonCard media={false} lines={3} />,
}

export const List: Story = {
  render: () => <SkeletonList rows={4} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole("status")).toHaveAccessibleName(
      /loading list/i
    )
  },
}

export const ListNoAvatar: Story = {
  render: () => <SkeletonList rows={3} avatar={false} />,
}

export const Table: Story = {
  render: () => (
    <div className="w-full">
      <SkeletonTable rows={5} columns={4} />
    </div>
  ),
}

export const Gallery: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <SkeletonText lines={3} />
      <SkeletonCard />
      <SkeletonList rows={2} />
      <SkeletonTable rows={3} columns={3} />
    </div>
  ),
}
