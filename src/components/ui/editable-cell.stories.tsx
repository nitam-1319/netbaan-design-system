import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"

import { EditableCell } from "@/components/ui/editable-cell"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */
const meta = {
  title: "Components/EditableCell",
  component: EditableCell,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    align: { control: "inline-radio", options: ["start", "center", "end"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    disabled: { control: "boolean" },
    onValueChange: { action: "valueChange" },
  },
  args: {
    label: "Asset name",
    defaultValue: "api.example.com",
    placeholder: "Empty",
    align: "start",
    size: "sm",
  },
  decorators: [
    (Story) => (
      <div style={{ width: 260 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EditableCell>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: /edit asset name/i }))
    const input = canvas.getByRole("textbox", { name: "Asset name" })
    await userEvent.clear(input)
    await userEvent.type(input, "db-01.internal{Enter}")
    await expect(args.onValueChange).toHaveBeenCalledWith("db-01.internal")
  },
}

export const NumericEnd: Story = {
  args: { label: "Port", defaultValue: "8443", align: "end" },
}

export const InTable: Story = {
  render: () => (
    <table style={{ borderCollapse: "collapse", width: 420 }}>
      <thead>
        <tr>
          <th style={{ textAlign: "start", padding: "8px", fontSize: 12 }}>Host</th>
          <th style={{ textAlign: "end", padding: "8px", fontSize: 12 }}>Port</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style={{ padding: "4px 8px" }}>
            <EditableCell label="Host" defaultValue="api.example.com" />
          </td>
          <td style={{ padding: "4px 8px" }}>
            <EditableCell label="Port" defaultValue="443" align="end" />
          </td>
        </tr>
        <tr>
          <td style={{ padding: "4px 8px" }}>
            <EditableCell label="Host" defaultValue="db-01.internal" />
          </td>
          <td style={{ padding: "4px 8px" }}>
            <EditableCell label="Port" defaultValue="5432" align="end" />
          </td>
        </tr>
      </tbody>
    </table>
  ),
}

export const Disabled: Story = {
  args: { disabled: true },
}
