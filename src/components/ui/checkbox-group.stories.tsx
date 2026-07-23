import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"
import * as React from "react"

import {
  CheckboxGroup,
  CheckboxGroupItem,
  CheckboxGroupSelectAll,
} from "@/components/ui/checkbox-group"

/**
 * Checkbox Group shares one value across related checkboxes. Each item's `value`
 * is the name the group tracks. Theme and direction come from the global
 * toolbar.
 */
const meta = {
  title: "Components/CheckboxGroup",
  component: CheckboxGroup,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="p-16 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CheckboxGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <CheckboxGroup defaultValue={["email"]}>
      <CheckboxGroupItem value="email">Email</CheckboxGroupItem>
      <CheckboxGroupItem value="sms">SMS</CheckboxGroupItem>
      <CheckboxGroupItem value="push">Push notifications</CheckboxGroupItem>
    </CheckboxGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const sms = canvas.getByRole("checkbox", { name: "SMS" })
    await expect(sms).toHaveAttribute("aria-checked", "false")
    await userEvent.click(sms)
    await expect(sms).toHaveAttribute("aria-checked", "true")
  },
}

export const Horizontal: Story = {
  render: () => (
    <CheckboxGroup orientation="horizontal" defaultValue={["s", "m"]}>
      <CheckboxGroupItem value="xs">XS</CheckboxGroupItem>
      <CheckboxGroupItem value="s">S</CheckboxGroupItem>
      <CheckboxGroupItem value="m">M</CheckboxGroupItem>
      <CheckboxGroupItem value="l">L</CheckboxGroupItem>
      <CheckboxGroupItem value="xl">XL</CheckboxGroupItem>
    </CheckboxGroup>
  ),
}

const ALL = ["read", "write", "delete"]

export const SelectAll: Story = {
  render: function SelectAllRender() {
    const [value, setValue] = React.useState<string[]>(["read"])
    return (
      <CheckboxGroup value={value} onValueChange={setValue} allValues={ALL}>
        <CheckboxGroupSelectAll>All permissions</CheckboxGroupSelectAll>
        <div className="ms-6 flex flex-col gap-3 border-s border-border ps-4">
          <CheckboxGroupItem value="read">Read</CheckboxGroupItem>
          <CheckboxGroupItem value="write">Write</CheckboxGroupItem>
          <CheckboxGroupItem value="delete">Delete</CheckboxGroupItem>
        </div>
      </CheckboxGroup>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const all = canvas.getByRole("checkbox", { name: "All permissions" })
    // "read" preselected → parent is mixed.
    await expect(all).toHaveAttribute("aria-checked", "mixed")
    await userEvent.click(all)
    await expect(all).toHaveAttribute("aria-checked", "true")
    const del = canvas.getByRole("checkbox", { name: "Delete" })
    await expect(del).toHaveAttribute("aria-checked", "true")
  },
}

export const Disabled: Story = {
  render: () => (
    <CheckboxGroup defaultValue={["b"]}>
      <CheckboxGroupItem value="a">Available</CheckboxGroupItem>
      <CheckboxGroupItem value="b" disabled>
        Locked (checked)
      </CheckboxGroupItem>
      <CheckboxGroupItem value="c" disabled>
        Locked
      </CheckboxGroupItem>
    </CheckboxGroup>
  ),
}
