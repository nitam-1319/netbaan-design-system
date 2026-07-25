import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio"

const meta = {
  title: "Components/RadioGroup",
  component: RadioGroup,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    orientation: { control: "inline-radio", options: ["vertical", "horizontal"] },
    disabled: { control: "boolean" },
  },
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
      <RadioGroupItem value="daily" label="Daily" />
      <RadioGroupItem value="weekly" label="Weekly" />
      <RadioGroupItem value="monthly" label="Monthly" />
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

export const WithDescription: Story = {
  render: () => (
    <RadioGroup defaultValue="standard" aria-label="Plan tier">
      <RadioGroupItem
        value="standard"
        label="Standard plan"
        description="Up to 10 seats, community support."
      />
      <RadioGroupItem
        value="team"
        label="Team plan"
        description="Up to 50 seats, priority support."
      />
      <RadioGroupItem
        value="enterprise"
        label="Enterprise plan"
        description="Unlimited seats, dedicated SLA."
      />
    </RadioGroup>
  ),
}

export const Sizes: Story = {
  render: () => (
    <RadioGroup defaultValue="md" aria-label="Ring sizes">
      <RadioGroupItem value="sm" size="sm" label="Small — 16px ring" />
      <RadioGroupItem value="md" size="md" label="Medium — 20px ring (default)" />
      <RadioGroupItem value="lg" size="lg" label="Large — 24px ring" />
    </RadioGroup>
  ),
}

export const Horizontal: Story = {
  render: () => (
    <RadioGroup
      orientation="horizontal"
      defaultValue="medium"
      aria-label="Severity threshold"
    >
      <RadioGroupItem value="low" label="Low" />
      <RadioGroupItem value="medium" label="Medium" />
      <RadioGroupItem value="high" label="High" />
    </RadioGroup>
  ),
}

export const KeyboardNavigation: Story = {
  render: () => (
    <RadioGroup defaultValue="daily" aria-label="Scan frequency">
      <RadioGroupItem value="daily" label="Daily" />
      <RadioGroupItem value="weekly" label="Weekly" />
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
      <RadioGroupItem value="off" label="Unselected" />
      <RadioGroupItem value="on" label="Selected" />
      <RadioGroupItem value="invalid" aria-invalid label="Error (none picked)" />
      <RadioGroupItem value="readonly" readOnly label="Read-only" />
      <RadioGroupItem value="disabled" disabled label="Disabled off" />
      <RadioGroupItem value="disabled-on" disabled label="Disabled on" />
    </RadioGroup>
  ),
}

export const Disabled: Story = {
  render: () => (
    <RadioGroup defaultValue="weekly" disabled aria-label="Scan frequency">
      <RadioGroupItem value="daily" label="Daily" />
      <RadioGroupItem value="weekly" label="Weekly" />
    </RadioGroup>
  ),
}
