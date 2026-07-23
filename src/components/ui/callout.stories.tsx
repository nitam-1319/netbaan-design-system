import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { Callout } from "@/components/ui/callout"

const meta = {
  title: "Components/Callout",
  component: Callout,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    tone: {
      control: "inline-radio",
      options: ["note", "info", "success", "warning", "danger"],
    },
  },
  args: {
    tone: "info",
    title: "Heads up",
    children: "This is a callout — use it to draw attention to a single aside.",
  },
  decorators: [
    (Story) => (
      <div className="w-[28rem] max-w-full p-6 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Callout>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("Heads up")).toBeInTheDocument()
  },
}

export const Tones: Story = {
  args: { title: undefined, children: undefined },
  render: () => (
    <div className="flex flex-col gap-3">
      <Callout tone="note" title="Note">
        A neutral aside with a bit more weight than plain text.
      </Callout>
      <Callout tone="info" title="Tip">
        You can pin frequently used filters to the toolbar.
      </Callout>
      <Callout tone="success" title="Deployed">
        Your changes are live in production.
      </Callout>
      <Callout tone="warning" title="Careful">
        Renaming a field updates every reference to it.
      </Callout>
      <Callout tone="danger" title="Destructive">
        Deleting a workspace cannot be undone.
      </Callout>
    </div>
  ),
}

export const WithoutTitle: Story = {
  args: {
    tone: "note",
    title: undefined,
    children: "A callout can be body-only, without a heading.",
  },
}

export const WithoutIcon: Story = {
  args: {
    tone: "info",
    icon: false,
    title: "No icon",
    children: "Pass icon={false} to drop the leading glyph.",
  },
}
