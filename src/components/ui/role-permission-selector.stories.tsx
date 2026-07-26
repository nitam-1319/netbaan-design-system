import type { Meta, StoryObj } from "@storybook/react-vite"
import * as React from "react"
import { expect, userEvent, waitFor, within } from "storybook/test"

import {
  RolePermissionSelector,
  type PermissionGroup,
} from "@/components/ui/role-permission-selector"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */
const meta = {
  title: "Components/RolePermissionSelector",
  component: RolePermissionSelector,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md"] },
    disabled: { control: "boolean" },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 460 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RolePermissionSelector>

export default meta
type Story = StoryObj<typeof meta>

const GROUPS: PermissionGroup[] = [
  {
    key: "assets",
    label: "Assets",
    permissions: [
      { value: "assets.read", label: "View assets", description: "See the asset inventory." },
      { value: "assets.write", label: "Edit assets", description: "Add, edit, and archive assets." },
      { value: "assets.delete", label: "Delete assets" },
    ],
  },
  {
    key: "findings",
    label: "Findings",
    permissions: [
      { value: "findings.read", label: "View findings" },
      { value: "findings.triage", label: "Triage findings", description: "Change status and severity." },
      { value: "findings.export", label: "Export findings", disabled: true },
    ],
  },
]

export const Default: Story = {
  args: { size: "md", groups: GROUPS },
  render: (args) => {
    const [value, setValue] = React.useState<string[]>(["assets.read"])
    return <RolePermissionSelector {...args} groups={GROUPS} value={value} onValueChange={setValue} />
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // The "Assets" group select-all starts indeterminate (only one of three selected).
    const selectAll = canvas.getByRole("checkbox", { name: "Assets" })
    await waitFor(() => expect(selectAll).toHaveAttribute("aria-checked", "mixed"))
    // Selecting the group's remaining permissions flips it to fully checked.
    await userEvent.click(canvas.getByRole("checkbox", { name: /Edit assets/ }))
    await userEvent.click(canvas.getByRole("checkbox", { name: /Delete assets/ }))
    await waitFor(() => expect(selectAll).toHaveAttribute("aria-checked", "true"))
    // Toggling select-all off clears the group.
    await userEvent.click(selectAll)
    await waitFor(() =>
      expect(canvas.getByRole("checkbox", { name: /View assets/ })).toHaveAttribute(
        "aria-checked",
        "false"
      )
    )
  },
}

export const Uncontrolled: Story = {
  args: { groups: GROUPS },
  render: () => (
    <RolePermissionSelector
      groups={GROUPS}
      defaultValue={["assets.read", "findings.read", "findings.triage"]}
    />
  ),
}
