import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { Avatar } from "@/components/ui/avatar"

const meta = {
  title: "Components/Avatar",
  component: Avatar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    name: "Jane Doe",
    size: "md",
    shape: "circle",
  },
  argTypes: {
    size: {
      control: "inline-radio",
      options: ["xs", "sm", "md", "lg", "xl"],
    },
    shape: { control: "inline-radio", options: ["circle", "square"] },
    status: {
      control: "inline-radio",
      options: ["online", "away", "busy", "offline"],
    },
    ring: { control: "boolean" },
  },
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: { status: "online" },
}

export const Fallbacks: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar name="Ana Ruiz" src="https://i.pravatar.cc/120?img=5" />
      <Avatar name="Ben Cho" />
      <Avatar />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // No image + a name → seeded initials.
    await expect(canvas.getByText("BC")).toBeVisible()
    // No image + no name → the neutral icon fallback, labelled "Avatar".
    await expect(canvas.getByLabelText("Avatar")).toBeInTheDocument()
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
        <Avatar key={size} name="Jane Doe" size={size} />
      ))}
    </div>
  ),
}

export const Shapes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar name="Jane Doe" size="lg" shape="circle" />
      <Avatar name="Aegis Co" size="lg" shape="square" />
    </div>
  ),
}

/** The `name` hash seeds a stable hue, so each person keeps one color. */
export const SeededColors: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      {["Ana Ruiz", "Ben Cho", "Kai Ito", "Lea Von", "Mo Diaz", "Sky Poe"].map(
        (name) => (
          <Avatar key={name} name={name} />
        )
      )}
    </div>
  ),
}

export const Presence: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      {(["online", "away", "busy", "offline"] as const).map((status) => (
        <Avatar key={status} name="Jane Doe" size="lg" status={status} />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getAllByLabelText("Jane Doe")).toHaveLength(4)
  },
}

/** The card + accent ring marks the current user or a selected avatar. */
export const CurrentUser: Story = {
  args: { size: "lg", ring: true, status: "online" },
}
