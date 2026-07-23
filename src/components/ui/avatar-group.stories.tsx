import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { AvatarGroup } from "@/components/ui/avatar-group"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

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
      options: ["xs", "sm", "default", "lg", "xl"],
    },
    max: { control: { type: "number", min: 1, max: 8 } },
  },
  decorators: [
    (Story) => (
      <div className="p-8 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AvatarGroup>

export default meta
type Story = StoryObj<typeof meta>

const people = ["AL", "BR", "CK", "DP", "EM", "FT"]

function People({ size }: { size?: "xs" | "sm" | "default" | "lg" | "xl" }) {
  return (
    <>
      {people.map((initials) => (
        <Avatar key={initials} size={size}>
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      ))}
    </>
  )
}

export const Default: Story = {
  args: { max: 4 },
  render: (args) => (
    <AvatarGroup {...args}>
      <People size={args.size ?? undefined} />
    </AvatarGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // 4 shown + a "+2" overflow chip.
    await expect(canvas.getByText("+2")).toBeInTheDocument()
    await expect(canvas.getByLabelText("2 more")).toBeInTheDocument()
  },
}

export const NoOverflow: Story = {
  render: (args) => (
    <AvatarGroup {...args}>
      <Avatar>
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>BR</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>CK</AvatarFallback>
      </Avatar>
    </AvatarGroup>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <AvatarGroup size="xs" max={4}>
        <People size="xs" />
      </AvatarGroup>
      <AvatarGroup size="sm" max={4}>
        <People size="sm" />
      </AvatarGroup>
      <AvatarGroup size="default" max={4}>
        <People size="default" />
      </AvatarGroup>
      <AvatarGroup size="lg" max={4}>
        <People size="lg" />
      </AvatarGroup>
    </div>
  ),
}
