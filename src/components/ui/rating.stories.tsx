import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"

import { Rating } from "@/components/ui/rating"

const meta = {
  title: "Components/Rating",
  component: Rating,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    "aria-label": "Rate this item",
  },
  decorators: [
    (Story) => (
      <div className="text-foreground p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Rating>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    defaultValue: 3,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Selecting a star checks its radio in the group.
    const four = canvas.getByRole("radio", { name: "4 stars" })
    await userEvent.click(four)
    await expect(four).toBeChecked()
    // A radio group exposes exactly `max` options.
    await expect(canvas.getAllByRole("radio")).toHaveLength(5)
  },
}

export const ReadOnly: Story = {
  args: {
    value: 4,
    readOnly: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Read-only ratings are a single labelled image, not a form control.
    await expect(
      canvas.getByRole("img", { name: "4 out of 5 stars" })
    ).toBeVisible()
    await expect(canvas.queryByRole("radio")).toBeNull()
  },
}

export const Disabled: Story = {
  args: {
    defaultValue: 2,
    disabled: true,
  },
}

export const TenStars: Story = {
  args: {
    defaultValue: 7,
    max: 10,
  },
}

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <Rating {...args} size="sm" defaultValue={3} aria-label="Small rating" />
      <Rating {...args} size="md" defaultValue={3} aria-label="Medium rating" />
      <Rating {...args} size="lg" defaultValue={3} aria-label="Large rating" />
    </div>
  ),
}
