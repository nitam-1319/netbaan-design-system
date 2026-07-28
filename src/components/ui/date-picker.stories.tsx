import type { Meta, StoryObj } from "@storybook/react-vite"
import * as React from "react"
import { expect, userEvent, waitFor, within } from "storybook/test"

import { DatePicker } from "@/components/ui/date-picker"

/**
 * Date Picker composes the AEGIS `Popover` + `Button` with a from-scratch month
 * grid. Theme (Light/Dark) and direction (LTR/RTL) come from the global
 * Storybook toolbar. The stories pin `defaultMonth` so the calendar is
 * deterministic.
 */
const meta = {
  title: "Components/DatePicker",
  component: DatePicker,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    weekStartsOn: { control: { type: "number", min: 0, max: 6 } },
    disabled: { control: "boolean" },
    invalid: { control: "boolean" },
  },
} satisfies Meta<typeof DatePicker>

export default meta
type Story = StoryObj<typeof meta>

const JUNE_2026 = new Date(2026, 5, 1)

export const Default: Story = {
  args: { defaultMonth: JUNE_2026, label: "Choose date" },
  render: (args) => {
    const [value, setValue] = React.useState<Date | null>(null)
    return <DatePicker {...args} value={value} onValueChange={setValue} />
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: "Choose date" }))
    const body = within(document.body)
    // The June 2026 grid is shown.
    const grid = await waitFor(() => body.getByRole("grid", { name: /June 2026/i }))
    await expect(grid).toBeInTheDocument()
    // Pick the 15th → the trigger reflects it and the popover closes.
    await userEvent.click(body.getByRole("gridcell", { name: /June 15, 2026/i }))
    await waitFor(() =>
      expect(canvas.getByRole("button", { name: "Choose date" })).toHaveTextContent(/Jun 15, 2026/)
    )
    await waitFor(() => expect(body.queryByRole("grid")).not.toBeInTheDocument())
  },
}

export const Preselected: Story = {
  args: { label: "Choose date" },
  render: (args) => {
    const [value, setValue] = React.useState<Date | null>(new Date(2026, 5, 20))
    return <DatePicker {...args} value={value} onValueChange={setValue} />
  },
}

export const MonthNavigation: Story = {
  args: { defaultMonth: JUNE_2026, label: "Choose date" },
  render: (args) => {
    const [value, setValue] = React.useState<Date | null>(null)
    return <DatePicker {...args} value={value} onValueChange={setValue} />
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: "Choose date" }))
    const body = within(document.body)
    await waitFor(() => body.getByRole("grid", { name: /June 2026/i }))
    await userEvent.click(body.getByRole("button", { name: "Next month" }))
    await waitFor(() => expect(body.getByRole("grid", { name: /July 2026/i })).toBeInTheDocument())
    await userEvent.click(body.getByRole("button", { name: "Previous month" }))
    await userEvent.click(body.getByRole("button", { name: "Previous month" }))
    await waitFor(() => expect(body.getByRole("grid", { name: /May 2026/i })).toBeInTheDocument())
  },
}

export const WithMinMax: Story = {
  args: {
    defaultMonth: JUNE_2026,
    label: "Choose date",
    minDate: new Date(2026, 5, 10),
    maxDate: new Date(2026, 5, 20),
  },
  render: (args) => {
    const [value, setValue] = React.useState<Date | null>(null)
    return <DatePicker {...args} value={value} onValueChange={setValue} />
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <DatePicker size="sm" label="Small" defaultMonth={JUNE_2026} />
      <DatePicker size="md" label="Medium" defaultMonth={JUNE_2026} />
      <DatePicker size="lg" label="Large" defaultMonth={JUNE_2026} />
    </div>
  ),
}

export const Invalid: Story = {
  args: { label: "Choose date", invalid: true, defaultMonth: JUNE_2026 },
}

export const Disabled: Story = {
  args: { label: "Choose date", disabled: true, defaultMonth: JUNE_2026 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole("button", { name: "Choose date" })
    await expect(trigger).toBeDisabled()
  },
}
