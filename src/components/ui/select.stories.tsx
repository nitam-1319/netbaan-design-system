import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, screen, within } from "storybook/test"
import * as React from "react"

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectGroupLabel,
  SelectSeparator,
} from "@/components/ui/select"

/**
 * The Select popup portals to `document.body`, so — as with Dialog, Popover and
 * Menu — the toolbar theme applied on the story wrapper does not reach it. A
 * `.dark` wrapper carries the theme onto the portalled content for these
 * stories; use the global Theme/Locale toolbar to preview the trigger.
 */
const meta = {
  title: "Components/Select",
  component: Select,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="dark bg-background p-16 text-foreground">
        <div className="w-64">
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

const SEVERITIES = ["Critical", "High", "Medium", "Low", "Informational"]

export const Default: Story = {
  render: () => (
    <Select>
      <SelectTrigger>
        <SelectValue placeholder="Select severity" />
      </SelectTrigger>
      <SelectContent>
        {SEVERITIES.map((s) => (
          <SelectItem key={s} value={s.toLowerCase()}>
            {s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole("combobox")
    await expect(trigger).toHaveTextContent("Select severity")
    await userEvent.click(trigger)
    // Portalled listbox lands on document.body.
    const option = await screen.findByRole("option", { name: "High" })
    await userEvent.click(option)
    await expect(trigger).toHaveTextContent("High")
    // Popup closes on select.
    await expect(screen.queryByRole("option", { name: "Low" })).not.toBeInTheDocument()
  },
}

export const WithDefaultValue: Story = {
  render: () => (
    <Select defaultValue="medium">
      <SelectTrigger>
        <SelectValue placeholder="Select severity" />
      </SelectTrigger>
      <SelectContent>
        {SEVERITIES.map((s) => (
          <SelectItem key={s} value={s.toLowerCase()}>
            {s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ),
}

export const Grouped: Story = {
  render: () => (
    <Select>
      <SelectTrigger>
        <SelectValue placeholder="Assign to team" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectGroupLabel>Security</SelectGroupLabel>
          <SelectItem value="appsec">AppSec</SelectItem>
          <SelectItem value="redteam">Red Team</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectGroupLabel>Platform</SelectGroupLabel>
          <SelectItem value="infra">Infrastructure</SelectItem>
          <SelectItem value="sre">SRE</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {(["sm", "default", "lg"] as const).map((size) => (
        <Select key={size}>
          <SelectTrigger size={size}>
            <SelectValue placeholder={`Size: ${size}`} />
          </SelectTrigger>
          <SelectContent>
            {SEVERITIES.map((s) => (
              <SelectItem key={s} value={s.toLowerCase()}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <Select disabled defaultValue="high">
      <SelectTrigger>
        <SelectValue placeholder="Select severity" />
      </SelectTrigger>
      <SelectContent>
        {SEVERITIES.map((s) => (
          <SelectItem key={s} value={s.toLowerCase()}>
            {s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ),
}

export const DisabledItem: Story = {
  render: () => (
    <Select>
      <SelectTrigger>
        <SelectValue placeholder="Select plan" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="free">Free</SelectItem>
        <SelectItem value="pro">Pro</SelectItem>
        <SelectItem value="enterprise" disabled>
          Enterprise (contact sales)
        </SelectItem>
      </SelectContent>
    </Select>
  ),
}

export const Invalid: Story = {
  render: () => (
    <Select>
      <SelectTrigger aria-invalid>
        <SelectValue placeholder="Required field" />
      </SelectTrigger>
      <SelectContent>
        {SEVERITIES.map((s) => (
          <SelectItem key={s} value={s.toLowerCase()}>
            {s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ),
}

function ControlledDemo() {
  const [value, setValue] = React.useState<string | null>("critical")
  return (
    <div className="flex flex-col gap-2">
      <Select
        value={value}
        onValueChange={(v) => setValue(v as string | null)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select severity" />
        </SelectTrigger>
        <SelectContent>
          {SEVERITIES.map((s) => (
            <SelectItem key={s} value={s.toLowerCase()}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-muted-foreground text-xs">Selected: {value ?? "none"}</p>
    </div>
  )
}

export const Controlled: Story = {
  render: () => <ControlledDemo />,
}
