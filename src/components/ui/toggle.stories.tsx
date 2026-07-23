import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, screen } from "storybook/test"

import { Toggle } from "@/components/ui/toggle"

/**
 * Every story renders inside an explicit `.dark` surface so the AEGIS dark
 * theme (the design default) is exercised regardless of the toolbar globals.
 */
const meta = {
  title: "Components/Toggle",
  component: Toggle,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    variant: "default",
    size: "default",
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["default", "outline"],
    },
    size: {
      control: "inline-radio",
      options: ["sm", "default", "lg"],
    },
    disabled: { control: "boolean" },
    defaultPressed: { control: "boolean" },
    onPressedChange: { action: "pressedChange" },
  },
  decorators: [
    (Story) => (
      <div className="dark bg-background text-foreground flex min-h-24 items-center justify-center gap-3 p-10">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Toggle>

export default meta
type Story = StoryObj<typeof meta>

/* A small decorative glyph used by the icon stories. */
function BoldGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      <path d="M6 4h7a4 4 0 0 1 0 8H6zM6 12h8a4 4 0 0 1 0 8H6z" strokeLinejoin="round" />
    </svg>
  )
}

export const Default: Story = {
  render: (args) => <Toggle {...args}>Bold</Toggle>,
  play: async () => {
    const toggle = await screen.findByRole("button", { name: "Bold" })
    await expect(toggle).toHaveAttribute("aria-pressed", "false")
    await userEvent.click(toggle)
    await expect(toggle).toHaveAttribute("aria-pressed", "true")
    await userEvent.click(toggle)
    await expect(toggle).toHaveAttribute("aria-pressed", "false")
  },
}

export const Pressed: Story = {
  render: (args) => (
    <Toggle {...args} defaultPressed>
      Pinned
    </Toggle>
  ),
  play: async () => {
    const toggle = await screen.findByRole("button", { name: "Pinned" })
    await expect(toggle).toHaveAttribute("aria-pressed", "true")
  },
}

export const Variants: Story = {
  render: () => (
    <>
      <Toggle variant="default">Default</Toggle>
      <Toggle variant="default" defaultPressed>
        Default on
      </Toggle>
      <Toggle variant="outline">Outline</Toggle>
      <Toggle variant="outline" defaultPressed>
        Outline on
      </Toggle>
    </>
  ),
}

export const Sizes: Story = {
  render: () => (
    <>
      <Toggle size="sm" variant="outline">
        Small
      </Toggle>
      <Toggle size="default" variant="outline">
        Default
      </Toggle>
      <Toggle size="lg" variant="outline">
        Large
      </Toggle>
    </>
  ),
}

export const IconOnly: Story = {
  render: () => (
    <>
      <Toggle variant="outline" aria-label="Bold">
        <BoldGlyph />
      </Toggle>
      <Toggle variant="outline" defaultPressed aria-label="Bold (active)">
        <BoldGlyph />
      </Toggle>
    </>
  ),
  play: async () => {
    const toggle = await screen.findByRole("button", { name: "Bold" })
    await expect(toggle).toHaveAttribute("aria-pressed", "false")
    await userEvent.click(toggle)
    await expect(toggle).toHaveAttribute("aria-pressed", "true")
  },
}

export const Disabled: Story = {
  render: () => (
    <>
      <Toggle disabled>Off</Toggle>
      <Toggle disabled defaultPressed>
        On
      </Toggle>
    </>
  ),
  play: async () => {
    const toggle = await screen.findByRole("button", { name: "Off" })
    await expect(toggle).toBeDisabled()
  },
}
