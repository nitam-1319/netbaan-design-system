import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { FormActions } from "@/components/ui/form-actions"
import { Button } from "@/components/ui/button"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Real AEGIS Buttons are placed inside — no `className` is passed to
 * any AEGIS component.
 */
const meta = {
  title: "Components/FormActions",
  component: FormActions,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    align: {
      control: "inline-radio",
      options: ["start", "center", "end", "between"],
    },
    divider: { control: "boolean" },
    sticky: { control: "boolean" },
  },
  args: {
    align: "end",
    divider: false,
    sticky: false,
  },
} satisfies Meta<typeof FormActions>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <FormActions {...args}>
      <Button variant="ghost">Cancel</Button>
      <Button>Save changes</Button>
    </FormActions>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const group = canvas.getByRole("group")
    await expect(group).toHaveAttribute("data-align", "end")
    await expect(canvas.getByRole("button", { name: "Save changes" })).toBeInTheDocument()
  },
}

export const Alignments: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {(["start", "center", "end", "between"] as const).map((align) => (
        <FormActions key={align} align={align}>
          <Button variant="ghost">Back</Button>
          <Button>Continue</Button>
        </FormActions>
      ))}
    </div>
  ),
}

export const WithDivider: Story = {
  args: { divider: true },
  render: (args) => (
    <FormActions {...args}>
      <Button variant="ghost">Cancel</Button>
      <Button variant="destructive">Delete account</Button>
    </FormActions>
  ),
}

export const Sticky: Story = {
  render: (args) => (
    <div style={{ maxHeight: 220, overflow: "auto" }}>
      <div style={{ height: 360, padding: "0 0.25rem" }}>
        <p style={{ color: "var(--muted-foreground)" }}>
          Scroll down — the action bar stays pinned to the bottom.
        </p>
      </div>
      <FormActions {...args} sticky divider>
        <Button variant="ghost">Cancel</Button>
        <Button>Save</Button>
      </FormActions>
    </div>
  ),
}
