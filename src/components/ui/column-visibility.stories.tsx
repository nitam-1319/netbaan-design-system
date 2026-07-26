import type { Meta, StoryObj } from "@storybook/react-vite"
import * as React from "react"
import { expect, userEvent, waitFor, within } from "storybook/test"

import { ColumnVisibility, type VisibilityMap } from "@/components/ui/column-visibility"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */
const meta = {
  title: "Components/ColumnVisibility",
  component: ColumnVisibility,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof ColumnVisibility>

export default meta
type Story = StoryObj<typeof meta>

const COLUMNS = [
  { key: "name", label: "Name", canHide: false },
  { key: "status", label: "Status" },
  { key: "owner", label: "Owner" },
  { key: "updated", label: "Last updated" },
]

export const Default: Story = {
  args: { columns: COLUMNS },
  render: () => {
    const [value, setValue] = React.useState<VisibilityMap>({ updated: false })
    return <ColumnVisibility columns={COLUMNS} value={value} onValueChange={setValue} />
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("open the menu", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /Columns/ }))
    })
    // Menu is portalled → query the document body.
    const body = within(document.body)
    await waitFor(() =>
      expect(body.getByRole("menuitemcheckbox", { name: "Status" })).toBeInTheDocument()
    )
    // The locked column is checked and disabled.
    const locked = body.getByRole("menuitemcheckbox", { name: "Name" })
    expect(locked).toHaveAttribute("aria-checked", "true")
    // Toggling "Status" flips its checked state without closing the menu.
    const status = body.getByRole("menuitemcheckbox", { name: "Status" })
    expect(status).toHaveAttribute("aria-checked", "true")
    await userEvent.click(status)
    await waitFor(() =>
      expect(body.getByRole("menuitemcheckbox", { name: "Status" })).toHaveAttribute(
        "aria-checked",
        "false"
      )
    )
  },
}

export const Uncontrolled: Story = {
  args: { columns: COLUMNS },
  render: () => <ColumnVisibility columns={COLUMNS} defaultValue={{ owner: false }} />,
}
