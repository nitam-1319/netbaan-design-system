import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { TimePicker } from "@/components/ui/time-picker"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers — no `className` is passed to
 * an AEGIS component.
 */
const meta = {
  title: "Components/TimePicker",
  component: TimePicker,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    disabled: { control: "boolean" },
    onChange: { action: "change" },
  },
  args: {
    label: "Time",
  },
  decorators: [
    (Story) => (
      <div className="w-72 p-6 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TimePicker>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    defaultValue: "09:30",
    description: "Local time, 24-hour or 12-hour per your locale.",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByLabelText("Time") as HTMLInputElement
    // Native time control with the fixed type.
    await expect(input).toHaveAttribute("type", "time")
    await expect(input).toHaveValue("09:30")
    // Helper text is wired for assistive tech.
    await expect(input).toHaveAttribute("aria-describedby")
  },
}

export const Sizes: Story = {
  args: { label: undefined },
  render: () => (
    <div className="flex flex-col gap-5">
      <TimePicker size="sm" label="Small" defaultValue="08:00" />
      <TimePicker size="md" label="Medium" defaultValue="12:15" />
      <TimePicker size="lg" label="Large" defaultValue="18:45" />
    </div>
  ),
}

export const WithSeconds: Story = {
  args: {
    label: "Start time",
    // step in seconds; 1 exposes a seconds segment on supporting platforms.
    step: 1,
    defaultValue: "14:05:30",
    description: "Seconds are available when a sub-minute step is set.",
  },
}

export const Range: Story = {
  args: {
    label: "Business hours",
    min: "09:00",
    max: "17:00",
    step: 900, // 15-minute increments
    defaultValue: "09:00",
    description: "Constrained to 09:00–17:00 in 15-minute steps.",
  },
}

export const Error: Story = {
  args: {
    label: "Meeting time",
    defaultValue: "23:30",
    error: "Choose a time during business hours (09:00–17:00).",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByLabelText("Meeting time")
    await expect(input).toHaveAttribute("aria-invalid", "true")
    await expect(
      canvas.getByText(/business hours/i)
    ).toBeInTheDocument()
  },
}

export const Disabled: Story = {
  args: {
    label: "Time",
    defaultValue: "10:00",
    disabled: true,
  },
}

export const Empty: Story = {
  args: {
    label: "Reminder at",
    description: "No time selected yet.",
  },
}
