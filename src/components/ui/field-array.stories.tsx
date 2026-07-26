import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"

import { FieldArray } from "@/components/ui/field-array"
import { TextField } from "@/components/ui/text-field"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */
const meta = {
  title: "Components/FieldArray",
  component: FieldArray,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FieldArray>

export default meta
type Story = StoryObj<typeof meta>

function EmailArrayDemo() {
  const [emails, setEmails] = React.useState<string[]>(["ada@example.com"])
  return (
    <FieldArray<string>
      label="Notification emails"
      value={emails}
      onChange={setEmails}
      newItem={() => ""}
      addLabel="Add email"
      min={1}
      renderItem={({ item, index }) => (
        <TextField
          aria-label={`Email ${index + 1}`}
          type="email"
          placeholder="name@example.com"
          value={item}
          onChange={(e) => {
            const next = [...emails]
            next[index] = (e.target as HTMLInputElement).value
            setEmails(next)
          }}
        />
      )}
    />
  )
}

export const Default: Story = {
  render: () => <EmailArrayDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // One row initially; min=1 so its remove is disabled.
    await expect(canvas.getByLabelText("Email 1")).toBeInTheDocument()
    await expect(canvas.getByRole("button", { name: /remove 1/i })).toBeDisabled()
    // Add a second row.
    await userEvent.click(canvas.getByRole("button", { name: /add email/i }))
    await expect(canvas.getByLabelText("Email 2")).toBeInTheDocument()
    // Now removal is enabled.
    await expect(canvas.getByRole("button", { name: /remove 1/i })).toBeEnabled()
  },
}

function BoundedDemo() {
  const [items, setItems] = React.useState<string[]>(["", ""])
  return (
    <FieldArray<string>
      label="Scan targets (max 3)"
      value={items}
      onChange={setItems}
      newItem={() => ""}
      max={3}
      renderItem={({ item, index }) => (
        <TextField
          aria-label={`Target ${index + 1}`}
          placeholder="host or IP"
          value={item}
          onChange={(e) => {
            const next = [...items]
            next[index] = (e.target as HTMLInputElement).value
            setItems(next)
          }}
        />
      )}
    />
  )
}

export const Bounded: Story = {
  render: () => <BoundedDemo />,
}
