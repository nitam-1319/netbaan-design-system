import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"

import { NumberInput } from "@/components/ui/number-input"

const meta = {
  title: "Components/NumberInput",
  component: NumberInput,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
    hideSteppers: { control: "boolean" },
    onValueChange: { action: "valueChange" },
  },
  args: {
    label: "Max concurrent scans",
    defaultValue: 8,
    min: 0,
    max: 64,
  },
  decorators: [
    (Story) => (
      <div className="w-72 p-6 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NumberInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox")
    await expect(input).toHaveValue("8")
    // Increment via the stepper button.
    await userEvent.click(canvas.getByRole("button", { name: "Increase" }))
    await expect(input).toHaveValue("9")
    await userEvent.click(canvas.getByRole("button", { name: "Decrease" }))
    await userEvent.click(canvas.getByRole("button", { name: "Decrease" }))
    await expect(input).toHaveValue("7")
  },
}

export const Sizes: Story = {
  args: { label: undefined },
  render: () => (
    <div className="flex flex-col gap-5">
      <NumberInput size="sm" label="Small" defaultValue={4} />
      <NumberInput size="md" label="Medium" defaultValue={8} />
      <NumberInput size="lg" label="Large" defaultValue={12} />
    </div>
  ),
}

export const WithHelperText: Story = {
  args: {
    label: "Rate limit (req/s)",
    description: "Requests above this threshold are throttled.",
    defaultValue: 100,
    step: 10,
  },
}

export const Error: Story = {
  args: {
    label: "Port",
    defaultValue: 70000,
    max: 65535,
    error: "Port must be between 0 and 65535.",
  },
}

export const Steps: Story = {
  args: {
    label: "Timeout (s)",
    defaultValue: 30,
    min: 0,
    max: 300,
    step: 5,
    largeStep: 30,
    description: "Arrow keys ±5 · Page keys ±30.",
  },
}

export const Disabled: Story = {
  args: { defaultValue: 8, disabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole("textbox")).toBeDisabled()
  },
}

export const HideSteppers: Story = {
  args: { label: "Weight", defaultValue: 1, hideSteppers: true, step: 0.1 },
}

export const Controlled: Story = {
  args: { label: undefined },
  render: () => {
    const [value, setValue] = React.useState<number | null>(20)
    return (
      <div className="flex flex-col gap-3">
        <NumberInput
          label="Budget (k)"
          value={value}
          onValueChange={(v) => setValue(v)}
          min={0}
        />
        <p className="text-sm text-muted-foreground">
          Current: {value ?? "—"}
        </p>
      </div>
    )
  },
}
