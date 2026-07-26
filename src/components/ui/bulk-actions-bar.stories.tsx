import type { Meta, StoryObj } from "@storybook/react-vite"
import * as React from "react"
import { expect, userEvent, waitFor, within } from "storybook/test"

import { BulkActionsBar } from "@/components/ui/bulk-actions-bar"
import { Button } from "@/components/ui/button"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */
const meta = {
  title: "Components/BulkActionsBar",
  component: BulkActionsBar,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    count: { control: { type: "number" } },
    sticky: { control: "boolean" },
    size: { control: "inline-radio", options: ["sm", "md"] },
  },
} satisfies Meta<typeof BulkActionsBar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { count: 3, size: "md" },
  render: (args) => (
    <BulkActionsBar {...args} onClear={() => {}}>
      <Button variant="ghost" size="sm">
        Export
      </Button>
      <Button variant="destructive" size="sm">
        Delete
      </Button>
    </BulkActionsBar>
  ),
}

export const Interactive: Story = {
  render: () => {
    const [count, setCount] = React.useState(2)
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <Button size="sm" onClick={() => setCount((c) => c + 1)}>
            Select one
          </Button>
        </div>
        <div style={{ minHeight: 64 }}>
          <BulkActionsBar count={count} onClear={() => setCount(0)}>
            <Button variant="destructive" size="sm">
              Delete
            </Button>
          </BulkActionsBar>
        </div>
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const bar = canvas.getByRole("region", { name: "Bulk actions" })
    expect(within(bar).getByText("2 selected")).toBeInTheDocument()
    // Clearing selection hides the bar.
    await userEvent.click(within(bar).getByRole("button", { name: "Clear" }))
    await waitFor(() =>
      expect(canvas.queryByRole("region", { name: "Bulk actions" })).not.toBeInTheDocument()
    )
  },
}
