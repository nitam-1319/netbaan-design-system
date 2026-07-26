import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, screen, waitFor, within } from "storybook/test"
import { SlidersHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverTrigger,
  PopoverClose,
  PopoverContent,
  PopoverTitle,
  PopoverDescription,
} from "@/components/ui/popover"

const meta = {
  title: "Components/Popover",
  component: Popover,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  // Content portals to the body; the `.dark` wrapper carries the theme, which
  // Base UI copies into the portal.
  decorators: [
    (Story) => (
      <div className="dark bg-background p-16 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Popover>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="outline">
            <SlidersHorizontal /> Filters
          </Button>
        }
      />
      <PopoverContent>
        <PopoverTitle>Filter findings</PopoverTitle>
        <PopoverDescription>
          Narrow the queue by severity, asset group, or first-seen date.
        </PopoverDescription>
      </PopoverContent>
    </Popover>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole("button", { name: /Filters/ })
    await expect(trigger).toHaveAttribute("aria-expanded", "false")
    await userEvent.click(trigger)
    // Portalled content lands on document.body.
    const panel = await screen.findByText("Filter findings")
    await waitFor(() => expect(panel).toBeVisible())
    await expect(trigger).toHaveAttribute("aria-expanded", "true")
    // Escape dismisses.
    await userEvent.keyboard("{Escape}")
    await waitFor(() =>
      expect(screen.queryByText("Filter findings")).not.toBeInTheDocument()
    )
  },
}

export const WithArrow: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger render={<Button variant="outline">Details</Button>} />
      <PopoverContent showArrow>
        <PopoverTitle>api-gw-prod.netbaan.io</PopoverTitle>
        <PopoverDescription>
          Last scanned 4 hours ago · 3 open findings · TLS 1.3.
        </PopoverDescription>
      </PopoverContent>
    </Popover>
  ),
}

export const Placement: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger render={<Button variant="outline">Open on the right</Button>} />
      <PopoverContent side="right" align="start" showArrow>
        <PopoverDescription>
          Placement is a semantic prop: <code>side</code> and <code>align</code>,
          with automatic collision flipping from the floating engine.
        </PopoverDescription>
      </PopoverContent>
    </Popover>
  ),
}

export const WithActions: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger render={<Button variant="outline">Snooze finding</Button>} />
      <PopoverContent>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <PopoverTitle>Snooze for 7 days?</PopoverTitle>
            <PopoverDescription>
              It will reappear in the queue if still unresolved next week.
            </PopoverDescription>
          </div>
          <div className="flex justify-end gap-2">
            <PopoverClose render={<Button variant="ghost" size="sm">Cancel</Button>} />
            <PopoverClose render={<Button size="sm">Snooze</Button>} />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: "Snooze finding" }))
    const snooze = await screen.findByRole("button", { name: "Snooze" })
    await userEvent.click(snooze)
    // A PopoverClose control dismisses the surface.
    await waitFor(() =>
      expect(screen.queryByText("Snooze for 7 days?")).not.toBeInTheDocument()
    )
  },
}
