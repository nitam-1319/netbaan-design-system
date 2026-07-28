import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"
import * as React from "react"
import { ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Collapse,
  CollapseTrigger,
  CollapseContent,
} from "@/components/ui/collapse"

/**
 * Collapse is a low-level motion primitive: it animates a region's height open
 * and closed and wires the trigger↔panel ARIA. The trigger is unstyled — supply
 * your own control via `render`. Theme and direction come from the global
 * toolbar.
 */
const meta = {
  title: "Components/Collapse",
  component: Collapse,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-80 p-16 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Collapse>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Collapse defaultOpen={false}>
      <CollapseTrigger
        render={
          <Button variant="outline" data-icon="inline-end">
            <span>Details</span>
            <ChevronDown
              aria-hidden
              className="transition-transform duration-200 [[data-panel-open]_&]:rotate-180"
            />
          </Button>
        }
      />
      <CollapseContent>
        <div className="pt-3 text-sm text-muted-foreground">
          Collapse animates the height of this region from zero to its measured
          size using the <code>--collapsible-panel-height</code> variable, so the
          motion is smooth regardless of content length.
        </div>
      </CollapseContent>
    </Collapse>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole("button", { name: /Details/ })
    await expect(trigger).toHaveAttribute("aria-expanded", "false")
    await userEvent.click(trigger)
    await expect(trigger).toHaveAttribute("aria-expanded", "true")
  },
}

export const OpenByDefault: Story = {
  render: () => (
    <Collapse defaultOpen>
      <CollapseTrigger render={<Button variant="ghost">Toggle notes</Button>} />
      <CollapseContent>
        <div className="pt-3 text-sm text-muted-foreground">
          This region starts expanded. Click the trigger to collapse it.
        </div>
      </CollapseContent>
    </Collapse>
  ),
}

export const Disabled: Story = {
  render: () => (
    <Collapse defaultOpen={false} disabled>
      <CollapseTrigger
        render={
          <Button variant="outline" data-icon="inline-end">
            <span>Details</span>
            <ChevronDown
              aria-hidden
              className="transition-transform duration-200 [[data-panel-open]_&]:rotate-180"
            />
          </Button>
        }
      />
      <CollapseContent>
        <div className="pt-3 text-sm text-muted-foreground">
          This region cannot be toggled while the Collapse is disabled.
        </div>
      </CollapseContent>
    </Collapse>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole("button", { name: /Details/ })
    // The disabled Collapse trigger renders a native <button> that stays
    // discoverable but is marked aria-disabled (not the native `disabled`
    // attribute), so assert the ARIA state rather than jest-dom's toBeDisabled.
    await expect(trigger).toHaveAttribute("aria-disabled", "true")
    await expect(trigger).toHaveAttribute("aria-expanded", "false")
    await userEvent.click(trigger)
    await expect(trigger).toHaveAttribute("aria-expanded", "false")
  },
}

export const Controlled: Story = {
  render: function ControlledRender() {
    const [open, setOpen] = React.useState(false)
    return (
      <div className="flex flex-col gap-2">
        <Button variant="outline" onClick={() => setOpen((o) => !o)}>
          {open ? "Hide" : "Show"} advanced options
        </Button>
        <Collapse open={open} onOpenChange={setOpen}>
          <CollapseContent>
            <div className="pt-1 text-sm text-muted-foreground">
              Advanced options live here. Open state is owned by the parent.
            </div>
          </CollapseContent>
        </Collapse>
      </div>
    )
  },
}
