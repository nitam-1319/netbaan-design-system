import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn, userEvent, within } from "storybook/test"
import { Plus, Pencil, MessageCircle } from "lucide-react"

import { FloatingActionButton } from "@/components/ui/floating-action-button"

const meta = {
  title: "Components/Floating Action Button",
  component: FloatingActionButton,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["primary", "secondary", "surface", "destructive"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    label: { control: "text" },
  },
  args: {
    icon: <Plus />,
    variant: "primary",
    size: "md",
    "aria-label": "Create",
  },
} satisfies Meta<typeof FloatingActionButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { onClick: fn() } }

export const Extended: Story = {
  args: { label: "New scan", icon: <Plus />, "aria-label": undefined, onClick: fn() },
}

export const Variants: Story = {
  render: (args) => (
    <div className="flex items-center gap-4">
      <FloatingActionButton {...args} variant="primary" aria-label="Create" />
      <FloatingActionButton {...args} variant="secondary" aria-label="Edit" icon={<Pencil />} />
      <FloatingActionButton {...args} variant="surface" aria-label="Message" icon={<MessageCircle />} />
      <FloatingActionButton {...args} variant="destructive" aria-label="Delete" />
    </div>
  ),
}

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-4">
      <FloatingActionButton {...args} size="sm" aria-label="Create small" />
      <FloatingActionButton {...args} size="md" aria-label="Create medium" />
      <FloatingActionButton {...args} size="lg" aria-label="Create large" />
    </div>
  ),
}

export const ExtendedSizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-4">
      <FloatingActionButton {...args} size="sm" label="Add" aria-label={undefined} />
      <FloatingActionButton {...args} size="md" label="New scan" aria-label={undefined} />
      <FloatingActionButton {...args} size="lg" label="New scan" aria-label={undefined} />
    </div>
  ),
}

/**
 * Disabled — non-interactive (pointer events off, reduced opacity). Shown for a
 * circle, a secondary circle, and an extended pill.
 */
export const Disabled: Story = {
  args: { disabled: true, onClick: fn() },
  render: (args) => (
    <div className="flex items-center gap-4">
      <FloatingActionButton {...args} variant="primary" aria-label="Create" />
      <FloatingActionButton {...args} variant="secondary" aria-label="Edit" icon={<Pencil />} />
      <FloatingActionButton {...args} label="New scan" aria-label={undefined} />
    </div>
  ),
}

export const Pinned: Story = {
  parameters: { layout: "fullscreen" },
  args: { placement: "bottom-end", onClick: fn() },
  render: (args) => (
    <div className="relative h-[22rem] w-[26rem] max-w-full overflow-hidden rounded-lg bg-surface-2">
      <FloatingActionButton {...args} />
    </div>
  ),
}

/**
 * Persian / RTL — a bottom-end FAB pins to the logical end (left in RTL).
 */
export const RTLPersian: Story = {
  name: "RTL (Persian)",
  parameters: { layout: "fullscreen" },
  render: (args) => (
    <div dir="rtl" className="relative h-[18rem] w-[26rem] max-w-full overflow-hidden rounded-lg bg-surface-2">
      <FloatingActionButton {...args} placement="bottom-end" label="افزودن" aria-label={undefined} />
    </div>
  ),
  args: { onClick: fn() },
}

/** The FAB is a labelled button that fires onClick. */
export const ClickInteraction: Story = {
  args: { onClick: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const fab = canvas.getByRole("button", { name: "Create" })
    await expect(fab).toBeVisible()
    await userEvent.click(fab)
    await expect(args.onClick).toHaveBeenCalledTimes(1)
  },
}
