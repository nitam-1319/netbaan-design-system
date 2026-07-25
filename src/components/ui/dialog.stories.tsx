import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, screen, within } from "storybook/test"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

const meta = {
  title: "Components/Dialog",
  component: Dialog,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  // Modal content portals to the body; the `.dark` wrapper carries the theme
  // to the trigger, and Base UI copies theme context into the portal.
  decorators: [
    (Story) => (
      <div className="dark bg-background p-8 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Dialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button variant="outline">Review finding</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm remediation</DialogTitle>
          <DialogDescription>
            Marking CVE-2026-1043 as remediated will remove it from the active
            findings queue. You can reopen it from history at any time.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="ghost">Cancel</Button>} />
          <DialogClose render={<Button variant="primary">Mark remediated</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole("button", { name: "Review finding" })
    await userEvent.click(trigger)
    // Portalled content lands on document.body, so query the screen.
    const dialog = await screen.findByRole("dialog")
    await expect(dialog).toBeVisible()
    await expect(
      screen.getByRole("heading", { name: "Confirm remediation" })
    ).toBeVisible()
    // Escape dismisses and returns focus to the trigger.
    await userEvent.keyboard("{Escape}")
    await expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    await expect(trigger).toHaveFocus()
  },
}

export const Destructive: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button variant="destructive">Delete asset</Button>} />
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Delete asset?</DialogTitle>
          <DialogDescription>
            This permanently removes api-gw-prod.netbaan.io and its scan history.
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="ghost">Cancel</Button>} />
          <DialogClose render={<Button variant="destructive">Delete</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

export const Large: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button variant="outline">Scan details</Button>} />
      <DialogContent size="xl">
        <DialogHeader>
          <DialogTitle>Scan configuration</DialogTitle>
          <DialogDescription>
            Review the surface, cadence, and credentials this recurring scan will
            use before you schedule it.
          </DialogDescription>
        </DialogHeader>
        <div className="text-sm text-muted-foreground">
          A larger surface for forms and richer content. Layout inside the dialog
          is composed from AEGIS layout primitives, never inline styling.
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="ghost">Close</Button>} />
          <DialogClose render={<Button>Schedule scan</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

export const Controlled: Story = {
  render: function ControlledDialog() {
    return (
      <Dialog defaultOpen>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Session expiring</DialogTitle>
            <DialogDescription>
              Your session ends in 2 minutes. Stay signed in to keep working.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="ghost">Sign out</Button>} />
            <DialogClose render={<Button>Stay signed in</Button>} />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  },
}
