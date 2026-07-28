import type { Meta, StoryObj } from "@storybook/react-vite"
import * as React from "react"
import { expect, userEvent, waitFor, within } from "storybook/test"

import { DateRangePicker, type DateRange } from "@/components/ui/date-range-picker"

/**
 * Date Range Picker composes the AEGIS `Popover` + `Button` with a from-scratch
 * month grid extended to two endpoints. Theme (Light/Dark) and direction
 * (LTR/RTL) come from the global Storybook toolbar; stories pin `defaultMonth`
 * for determinism.
 */
const meta = {
  title: "Components/DateRangePicker",
  component: DateRangePicker,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    weekStartsOn: { control: { type: "number", min: 0, max: 6 } },
    disabled: { control: "boolean" },
    invalid: { control: "boolean" },
  },
} satisfies Meta<typeof DateRangePicker>

export default meta
type Story = StoryObj<typeof meta>

const JUNE_2026 = new Date(2026, 5, 1)

export const Default: Story = {
  args: { defaultMonth: JUNE_2026, label: "Choose date range" },
  render: (args) => {
    const [value, setValue] = React.useState<DateRange | null>(null)
    return <DateRangePicker {...args} value={value} onValueChange={setValue} />
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: "Choose date range" }))
    const body = within(document.body)
    await waitFor(() => body.getByRole("grid", { name: /June 2026/i }))

    // Pick start (June 10) then end (June 15).
    await userEvent.click(body.getByRole("gridcell", { name: /June 10, 2026/i }))
    await userEvent.click(body.getByRole("gridcell", { name: /June 15, 2026/i }))

    // Trigger now shows the range and the popover has closed.
    await waitFor(() =>
      expect(canvas.getByRole("button", { name: "Choose date range" })).toHaveTextContent(
        /Jun 10, 2026\s*–\s*Jun 15, 2026/
      )
    )
    await waitFor(() => expect(body.queryByRole("grid")).not.toBeInTheDocument())
  },
}

export const OutOfOrder: Story = {
  args: { defaultMonth: JUNE_2026, label: "Choose date range" },
  render: (args) => {
    const [value, setValue] = React.useState<DateRange | null>(null)
    return <DateRangePicker {...args} value={value} onValueChange={setValue} />
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: "Choose date range" }))
    const body = within(document.body)
    await waitFor(() => body.getByRole("grid", { name: /June 2026/i }))
    // Pick the later day first — the picker swaps the endpoints.
    await userEvent.click(body.getByRole("gridcell", { name: /June 20, 2026/i }))
    await userEvent.click(body.getByRole("gridcell", { name: /June 12, 2026/i }))
    await waitFor(() =>
      expect(canvas.getByRole("button", { name: "Choose date range" })).toHaveTextContent(
        /Jun 12, 2026\s*–\s*Jun 20, 2026/
      )
    )
  },
}

export const Preselected: Story = {
  args: { label: "Choose date range" },
  render: (args) => {
    const [value, setValue] = React.useState<DateRange | null>({
      start: new Date(2026, 5, 8),
      end: new Date(2026, 5, 18),
    })
    return <DateRangePicker {...args} value={value} onValueChange={setValue} />
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <DateRangePicker size="sm" label="Small" defaultMonth={JUNE_2026} />
      <DateRangePicker size="md" label="Medium" defaultMonth={JUNE_2026} />
      <DateRangePicker size="lg" label="Large" defaultMonth={JUNE_2026} />
    </div>
  ),
}

export const WithMinMax: Story = {
  args: {
    defaultMonth: JUNE_2026,
    label: "Choose date range",
    minDate: new Date(2026, 5, 10),
    maxDate: new Date(2026, 5, 20),
  },
  render: (args) => {
    const [value, setValue] = React.useState<DateRange | null>(null)
    return <DateRangePicker {...args} value={value} onValueChange={setValue} />
  },
}

export const Invalid: Story = {
  args: { label: "Choose date range", invalid: true, defaultMonth: JUNE_2026 },
}

export const Disabled: Story = {
  args: { label: "Choose date range", disabled: true, defaultMonth: JUNE_2026 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole("button", { name: "Choose date range" })
    await expect(trigger).toBeDisabled()
  },
}
