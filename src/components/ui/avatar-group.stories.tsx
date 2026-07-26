import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { AvatarGroup } from "@/components/ui/avatar-group"
import { Avatar } from "@/components/ui/avatar"

const meta = {
  title: "Components/AvatarGroup",
  component: AvatarGroup,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "inline-radio",
      options: ["xs", "sm", "md", "lg", "xl"],
    },
    max: { control: { type: "number", min: 1, max: 8 } },
  },
} satisfies Meta<typeof AvatarGroup>

export default meta
type Story = StoryObj<typeof meta>

const PEOPLE = ["Ana Ruiz", "Ben Cho", "Kai Ito", "Lea Von", "Mo Diaz", "Sky Poe"]

// Avatars must be passed as direct children (a wrapping component would count as
// a single child, so the "+N" overflow would never trigger).
function people(size?: "xs" | "sm" | "md" | "lg" | "xl") {
  return PEOPLE.map((name) => <Avatar key={name} name={name} size={size} />)
}

export const Default: Story = {
  args: { max: 4, size: "md" },
  render: (args) => (
    <AvatarGroup {...args}>{people(args.size ?? undefined)}</AvatarGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // 4 shown + a "+2" overflow chip.
    await expect(canvas.getByText("+2")).toBeInTheDocument()
    await expect(canvas.getByLabelText("2 more")).toBeInTheDocument()
  },
}

export const NoOverflow: Story = {
  args: { size: "md" },
  render: (args) => (
    <AvatarGroup {...args} max={10}>
      <Avatar name="Ana Ruiz" size={args.size ?? undefined} />
      <Avatar name="Ben Cho" size={args.size ?? undefined} />
      <Avatar name="Kai Ito" size={args.size ?? undefined} />
    </AvatarGroup>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {(["xs", "sm", "md", "lg"] as const).map((size) => (
        <AvatarGroup key={size} size={size} max={4}>
          {people(size)}
        </AvatarGroup>
      ))}
    </div>
  ),
}
