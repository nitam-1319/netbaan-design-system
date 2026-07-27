import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, screen, waitFor, within } from "storybook/test"
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
 * Select restored to `.agent/references/spec/Select.dc.html`: outline / filled /
 * flush variants (default outline), the sm/md/lg size scale (32 / 42 / 48px), the
 * open-focus accent ring + 180° chevron, the selected-row tint + check, and a menu
 * that enters with `animate-menu-in` on the shared `shadow-elevated` surface.
 *
 * The popup portals to `document.body`; use the Theme / Locale toolbar to preview.
 *
 * A11y note: the trigger renders with `role="combobox"`, whose accessible name is
 * NOT derived from its text content — every trigger therefore carries an explicit
 * `aria-label`. In product, that name comes from the associated `FormField` label.
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
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

const SEVERITIES = ["Critical", "High", "Medium", "Low", "Informational"]

export const Default: Story = {
  render: () => (
    <Select
      items={SEVERITIES.map((s) => ({ value: s.toLowerCase(), label: s }))}
    >
      <SelectTrigger aria-label="Severity">
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
    // Chevron rotates while the menu is open (attribute lands after the popup mounts).
    await waitFor(() => expect(trigger).toHaveAttribute("data-popup-open"))
    // Portalled listbox lands on document.body.
    const option = await screen.findByRole("option", { name: "High" })
    await userEvent.click(option)
    await expect(trigger).toHaveTextContent("High")
    // Popup closes on select.
    await waitFor(() =>
      expect(
        screen.queryByRole("option", { name: "Low" })
      ).not.toBeInTheDocument()
    )
  },
}

export const WithDefaultValue: Story = {
  render: () => (
    <Select defaultValue="medium">
      <SelectTrigger aria-label="Severity">
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

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {(["outline", "filled", "flush"] as const).map((variant) => (
        <Select key={variant} defaultValue="high">
          <SelectTrigger variant={variant} aria-label={`Severity (${variant})`}>
            <SelectValue placeholder={`Variant: ${variant}`} />
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

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {(["sm", "md", "lg"] as const).map((size) => (
        <Select key={size}>
          <SelectTrigger size={size} aria-label={`Severity (${size})`}>
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

export const Grouped: Story = {
  render: () => (
    <Select>
      <SelectTrigger aria-label="Assign to team">
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

export const Error: Story = {
  name: "Error (invalid)",
  render: () => (
    <Select>
      <SelectTrigger aria-invalid aria-label="Required field">
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole("combobox")).toHaveAttribute(
      "aria-invalid",
      "true"
    )
  },
}

export const Disabled: Story = {
  render: () => (
    <Select disabled defaultValue="high">
      <SelectTrigger aria-label="Severity">
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
      <SelectTrigger aria-label="Plan">
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

function ControlledDemo() {
  const [value, setValue] = React.useState<string | null>("critical")
  return (
    <div className="flex flex-col gap-2">
      <Select value={value} onValueChange={(v) => setValue(v as string | null)}>
        <SelectTrigger aria-label="Severity">
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
