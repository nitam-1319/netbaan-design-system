import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { LoadingOverlay } from "@/components/ui/loading-overlay"

/**
 * Theme (Light/Dark) and direction (English-LTR / Persian-RTL) come from the
 * global Storybook toolbar — stories never hard-code a `.dark` wrapper.
 */
const meta = {
  title: "Components/LoadingOverlay",
  component: LoadingOverlay,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    open: { control: "boolean" },
    label: { control: "text" },
    hideLabel: { control: "boolean" },
    blur: { control: "boolean" },
    spinnerSize: {
      control: "inline-radio",
      options: ["xs", "sm", "default", "lg", "xl"],
    },
  },
  args: {
    open: true,
    label: "Loading",
  },
} satisfies Meta<typeof LoadingOverlay>

export default meta
type Story = StoryObj<typeof meta>

/** Sample content the overlay masks. */
function Panel() {
  return (
    <div className="w-80 rounded-xl border border-border bg-card p-5">
      <h3 className="font-heading text-base font-semibold text-foreground">
        Asset inventory
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        6,912 hosts across 14 environments, refreshed hourly.
      </p>
      <div className="mt-4 h-24 rounded-lg bg-muted" />
    </div>
  )
}

export const Wrapping: Story = {
  render: (args) => (
    <LoadingOverlay {...args}>
      <Panel />
    </LoadingOverlay>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const overlay = canvas.getByRole("status")
    await expect(overlay).toHaveAttribute("aria-busy", "true")
    // Content stays mounted beneath the scrim.
    await expect(canvas.getByText("Asset inventory")).toBeInTheDocument()
  },
}

export const WithBlur: Story = {
  args: { blur: true, label: "Refreshing…" },
  render: (args) => (
    <LoadingOverlay {...args}>
      <Panel />
    </LoadingOverlay>
  ),
}

export const SpinnerOnly: Story = {
  args: { hideLabel: true },
  render: (args) => (
    <LoadingOverlay {...args}>
      <Panel />
    </LoadingOverlay>
  ),
}

/** When `open` is false the scrim is gone and the content is interactive. */
export const Closed: Story = {
  args: { open: false },
  render: (args) => (
    <LoadingOverlay {...args}>
      <Panel />
    </LoadingOverlay>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.queryByRole("status")).not.toBeInTheDocument()
  },
}

/** Bare mode: the overlay fills a positioned ancestor you provide. */
export const BareOverPositionedBox: Story = {
  render: (args) => (
    <div className="relative h-48 w-80 overflow-hidden rounded-xl border border-border bg-card">
      <LoadingOverlay {...args} />
    </div>
  ),
}
