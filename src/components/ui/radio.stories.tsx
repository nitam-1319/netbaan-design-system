import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio"

const meta = {
  title: "Components/RadioGroup",
  component: RadioGroup,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="flex min-h-24 items-center justify-center p-10 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RadioGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="weekly" aria-label="Scan frequency">
      <label className="flex items-center gap-2.5 text-sm">
        <RadioGroupItem value="daily" />
        Daily
      </label>
      <label className="flex items-center gap-2.5 text-sm">
        <RadioGroupItem value="weekly" />
        Weekly
      </label>
      <label className="flex items-center gap-2.5 text-sm">
        <RadioGroupItem value="monthly" />
        Monthly
      </label>
    </RadioGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const radios = canvas.getAllByRole("radio")
    // "weekly" is selected by default.
    await expect(radios[1]).toHaveAttribute("aria-checked", "true")
    // Selecting "daily" moves the selection.
    await userEvent.click(radios[0])
    await expect(radios[0]).toHaveAttribute("aria-checked", "true")
    await expect(radios[1]).toHaveAttribute("aria-checked", "false")
  },
}

export const Horizontal: Story = {
  render: () => (
    <RadioGroup
      orientation="horizontal"
      defaultValue="medium"
      aria-label="Severity threshold"
    >
      <label className="flex items-center gap-2 text-sm">
        <RadioGroupItem value="low" /> Low
      </label>
      <label className="flex items-center gap-2 text-sm">
        <RadioGroupItem value="medium" /> Medium
      </label>
      <label className="flex items-center gap-2 text-sm">
        <RadioGroupItem value="high" /> High
      </label>
    </RadioGroup>
  ),
}

export const KeyboardNavigation: Story = {
  render: () => (
    <RadioGroup defaultValue="daily" aria-label="Scan frequency">
      <label className="flex items-center gap-2.5 text-sm">
        <RadioGroupItem value="daily" />
        Daily
      </label>
      <label className="flex items-center gap-2.5 text-sm">
        <RadioGroupItem value="weekly" />
        Weekly
      </label>
    </RadioGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const radios = canvas.getAllByRole("radio")
    await userEvent.click(radios[0])
    await expect(radios[0]).toHaveAttribute("aria-checked", "true")
    // Arrow keys move selection within the group (roving tabindex).
    await userEvent.keyboard("{ArrowDown}")
    await expect(radios[1]).toHaveAttribute("aria-checked", "true")
  },
}

export const States: Story = {
  render: () => (
    <RadioGroup defaultValue="on" aria-label="States demo">
      <label className="flex items-center gap-2.5 text-sm">
        <RadioGroupItem value="off" /> Unselected
      </label>
      <label className="flex items-center gap-2.5 text-sm">
        <RadioGroupItem value="on" /> Selected
      </label>
      <label className="flex items-center gap-2.5 text-sm text-muted-foreground">
        <RadioGroupItem value="disabled" disabled /> Disabled
      </label>
      <label className="flex items-center gap-2.5 text-sm text-muted-foreground">
        <RadioGroupItem value="disabled-on" disabled /> Disabled + selected
      </label>
    </RadioGroup>
  ),
}

export const Disabled: Story = {
  render: () => (
    <RadioGroup defaultValue="weekly" disabled aria-label="Scan frequency">
      <label className="flex items-center gap-2.5 text-sm text-muted-foreground">
        <RadioGroupItem value="daily" /> Daily
      </label>
      <label className="flex items-center gap-2.5 text-sm text-muted-foreground">
        <RadioGroupItem value="weekly" /> Weekly
      </label>
    </RadioGroup>
  ),
}
