import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { Spacer } from "@/components/ui/spacer"

const meta = {
  title: "Components/Spacer",
  component: Spacer,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    grow: { control: "boolean" },
    axis: {
      control: "inline-radio",
      options: ["horizontal", "vertical", "both"],
    },
    size: {
      control: "inline-radio",
      options: ["none", "xs", "sm", "md", "lg", "xl"],
    },
  },
  decorators: [
    (Story) => (
      <div className="text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Spacer>

export default meta
type Story = StoryObj<typeof meta>

/** Flexible spacer pushing trailing actions to the far edge of a toolbar. */
export const Flexible: Story = {
  args: { grow: true },
  render: (args) => (
    <div className="flex w-96 items-center rounded-lg border border-border-strong bg-surface p-3 text-sm">
      <span className="font-medium">Assets</span>
      <Spacer {...args} />
      <span className="rounded-md bg-accent px-2 py-1 text-xs text-accent-foreground">
        Export
      </span>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("Assets")).toBeVisible()
    await expect(canvas.getByText("Export")).toBeVisible()
  },
}

/** Fixed vertical gaps between stacked blocks. */
export const FixedVertical: Story = {
  args: { grow: false, axis: "vertical", size: "lg" },
  render: (args) => (
    <div className="flex w-64 flex-col">
      <div className="rounded-md bg-surface-2 p-3 text-sm">Section one</div>
      <Spacer {...args} />
      <div className="rounded-md bg-surface-2 p-3 text-sm">Section two</div>
    </div>
  ),
}

/** Fixed horizontal gaps between inline items. */
export const FixedHorizontal: Story = {
  args: { grow: false, axis: "horizontal", size: "md" },
  render: (args) => (
    <div className="flex items-center text-sm">
      <span className="rounded-md bg-surface-2 px-3 py-1">A</span>
      <Spacer {...args} />
      <span className="rounded-md bg-surface-2 px-3 py-1">B</span>
    </div>
  ),
}

/** The full fixed-size scale (vertical). */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col text-sm">
      {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
        <div key={size} className="flex flex-col">
          <div className="rounded-md bg-surface-2 px-3 py-1">{size}</div>
          <Spacer grow={false} axis="vertical" size={size} />
        </div>
      ))}
      <div className="rounded-md bg-surface-2 px-3 py-1">end</div>
    </div>
  ),
}
