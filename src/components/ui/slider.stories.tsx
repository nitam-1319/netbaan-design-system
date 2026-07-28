import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"

import { Slider } from "@/components/ui/slider"

const meta = {
  title: "Components/Slider",
  component: Slider,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    disabled: { control: "boolean" },
    invalid: { control: "boolean" },
    showValue: { control: "boolean" },
    onValueChange: { action: "valueChange" },
    onValueCommitted: { action: "valueCommitted" },
  },
  args: {
    label: "Severity threshold",
    showValue: true,
  },
  decorators: [
    (Story) => (
      <div className="w-80 p-6 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Slider>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { defaultValue: 40 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const thumb = canvas.getByRole("slider")
    await expect(thumb).toHaveAttribute("aria-valuenow", "40")
    // Keyboard stepping increments the value.
    thumb.focus()
    await userEvent.keyboard("{ArrowRight}")
    await expect(thumb).toHaveAttribute("aria-valuenow", "41")
  },
}

export const Sizes: Story = {
  args: { showValue: false, label: undefined },
  render: () => (
    <div className="flex flex-col gap-8">
      <Slider
        size="sm"
        defaultValue={30}
        getAriaLabel={() => "Threshold (small)"}
      />
      <Slider
        size="md"
        defaultValue={50}
        getAriaLabel={() => "Threshold (medium)"}
      />
      <Slider
        size="lg"
        defaultValue={70}
        getAriaLabel={() => "Threshold (large)"}
      />
    </div>
  ),
}

export const Range: Story = {
  args: {
    label: "Port range",
    defaultValue: [20, 80],
    getAriaLabel: (i: number) => (i === 0 ? "Minimum port" : "Maximum port"),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const thumbs = canvas.getAllByRole("slider")
    await expect(thumbs).toHaveLength(2)
    await expect(thumbs[0]).toHaveAttribute("aria-valuenow", "20")
    await expect(thumbs[1]).toHaveAttribute("aria-valuenow", "80")
  },
}

export const Steps: Story = {
  args: { label: "Scan interval (h)", min: 0, max: 24, step: 4, defaultValue: 12 },
}

export const Disabled: Story = {
  args: { defaultValue: 55, disabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole("slider")).toBeDisabled()
  },
}

export const Invalid: Story = {
  args: { label: "Risk tolerance", defaultValue: 90, invalid: true },
}

export const Vertical: Story = {
  args: {
    label: undefined,
    showValue: false,
    orientation: "vertical",
    defaultValue: 60,
    getAriaLabel: () => "Volume",
  },
  render: (args) => (
    <div className="flex h-56 items-center justify-center">
      <Slider {...args} />
    </div>
  ),
}

/** Controlled usage with an external readout. */
export const Controlled: Story = {
  args: { label: undefined, showValue: false },
  render: () => {
    const [value, setValue] = React.useState(35)
    return (
      <div className="flex flex-col gap-3">
        <Slider
          label="Coverage"
          value={value}
          onValueChange={(v) => setValue(v as number)}
        />
        <p className="text-sm text-muted-foreground">Current: {value}%</p>
      </div>
    )
  },
}
