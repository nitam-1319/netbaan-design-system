import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { AspectRatio } from "@/components/ui/aspect-ratio"

const meta = {
  title: "Components/AspectRatio",
  component: AspectRatio,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    ratio: {
      control: "select",
      options: [
        "square",
        "video",
        "portrait",
        "wide",
        "ultrawide",
        "4/3",
        "3/2",
        "3/4",
        "2/1",
        "golden",
      ],
    },
  },
  decorators: [
    (Story) => (
      <div className="w-80 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AspectRatio>

export default meta
type Story = StoryObj<typeof meta>

// A token-only placeholder panel (plain HTML so no AEGIS component gets a class).
function Panel({ label }: { label: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-lg border border-border-strong bg-surface-2 text-sm text-muted-foreground">
      {label}
    </div>
  )
}

export const Video: Story = {
  args: { ratio: "video" },
  render: (args) => (
    <AspectRatio {...args}>
      <Panel label="16 / 9" />
    </AspectRatio>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const box = canvas.getByText("16 / 9").parentElement?.parentElement
    await expect(box).toHaveAttribute("data-slot", "aspect-ratio")
  },
}

export const Square: Story = {
  args: { ratio: "square" },
  render: (args) => (
    <AspectRatio {...args}>
      <Panel label="1 / 1" />
    </AspectRatio>
  ),
}

export const Portrait: Story = {
  args: { ratio: "portrait" },
  render: (args) => (
    <AspectRatio {...args}>
      <Panel label="3 / 4" />
    </AspectRatio>
  ),
}

/** A grid of thumbnails all locked to the same ratio. */
export const ThumbnailGrid: Story = {
  render: () => (
    <div className="grid w-80 grid-cols-3 gap-3">
      {["us-east-1", "eu-west-2", "ap-south-1", "sa-east-1", "af-south-1", "me-central-1"].map(
        (region) => (
          <AspectRatio key={region} ratio="4/3">
            <Panel label={region} />
          </AspectRatio>
        )
      )}
    </div>
  ),
}

/** All named ratios side by side. */
export const AllRatios: Story = {
  render: () => (
    <div className="grid w-[36rem] grid-cols-3 gap-4">
      {(
        ["square", "video", "portrait", "wide", "ultrawide", "golden"] as const
      ).map((r) => (
        <AspectRatio key={r} ratio={r}>
          <Panel label={r} />
        </AspectRatio>
      ))}
    </div>
  ),
}
