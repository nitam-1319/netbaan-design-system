import type { Meta, StoryObj } from "@storybook/react-vite"
import * as React from "react"
import { expect, userEvent, waitFor, within } from "storybook/test"

import { ColumnFilter } from "@/components/ui/column-filter"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */
const meta = {
  title: "Components/ColumnFilter",
  component: ColumnFilter,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    type: { control: "inline-radio", options: ["text", "select"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
} satisfies Meta<typeof ColumnFilter>

export default meta
type Story = StoryObj<typeof meta>

export const Text: Story = {
  args: { label: "Name", type: "text" },
  render: (args) => {
    const [value, setValue] = React.useState<string | string[]>("")
    return <ColumnFilter {...args} value={value} onValueChange={setValue} />
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: "Filter by Name" }))
    const body = within(document.body)
    const input = await waitFor(() => body.getByRole("textbox", { name: "Filter by Name" }))
    await userEvent.type(input, "acme")
    await waitFor(() => expect(input).toHaveValue("acme"))
    // Trigger now advertises the active filter.
    await waitFor(() =>
      expect(canvas.getByRole("button", { name: "Filter by Name (active)" })).toBeInTheDocument()
    )
  },
}

export const Select: Story = {
  args: {
    label: "Status",
    type: "select",
    options: [
      { value: "open", label: "Open" },
      { value: "in-progress", label: "In progress" },
      { value: "closed", label: "Closed" },
    ],
  },
  render: (args) => {
    const [value, setValue] = React.useState<string | string[]>([])
    return <ColumnFilter {...args} value={value} onValueChange={setValue} />
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: "Filter by Status" }))
    const body = within(document.body)
    const open = await waitFor(() => body.getByRole("checkbox", { name: "Open" }))
    await userEvent.click(open)
    await waitFor(() =>
      expect(canvas.getByRole("button", { name: "Filter by Status (active)" })).toBeInTheDocument()
    )
  },
}
