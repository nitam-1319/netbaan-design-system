import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn, userEvent, screen, waitFor, within } from "storybook/test"
import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  ConfirmDialog,
  ConfirmDialogTrigger,
  ConfirmDialogContent,
} from "@/components/ui/confirm-dialog"

/**
 * The Confirmation Dialog portals to `document.body`; the global Theme/Locale
 * toolbar drives Light/Dark and English-LTR / Persian-RTL. An alert dialog is
 * always modal and cannot be dismissed by clicking outside — the user must
 * choose Cancel or Confirm.
 */
const meta = {
  title: "Components/ConfirmDialog",
  component: ConfirmDialog,
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
} satisfies Meta<typeof ConfirmDialog>

export default meta
type Story = StoryObj<typeof meta>

const onConfirmSpy = fn()

export const Destructive: Story = {
  render: () => (
    <ConfirmDialog>
      <ConfirmDialogTrigger render={<Button variant="destructive">Delete project</Button>} />
      <ConfirmDialogContent
        tone="destructive"
        title="Delete this project?"
        description="This permanently removes the project and all of its data. This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={onConfirmSpy}
      />
    </ConfirmDialog>
  ),
  play: async ({ canvasElement }) => {
    onConfirmSpy.mockClear()
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole("button", { name: "Delete project" })
    await userEvent.click(trigger)
    // Alert dialog is portalled to document.body.
    const dialog = await screen.findByRole("alertdialog")
    await waitFor(() => expect(dialog).toBeVisible())
    const confirm = within(dialog).getByRole("button", { name: "Delete" })
    await userEvent.click(confirm)
    await expect(onConfirmSpy).toHaveBeenCalledTimes(1)
  },
}

export const Default: Story = {
  render: () => (
    <ConfirmDialog>
      <ConfirmDialogTrigger render={<Button variant="outline">Publish</Button>} />
      <ConfirmDialogContent
        title="Publish these changes?"
        description="Your changes will be visible to all members of the workspace immediately."
        confirmLabel="Publish"
      />
    </ConfirmDialog>
  ),
}

export const WithBody: Story = {
  render: () => (
    <ConfirmDialog>
      <ConfirmDialogTrigger render={<Button variant="outline">Remove member</Button>} />
      <ConfirmDialogContent
        tone="destructive"
        title="Remove Ada from the team?"
        description="They will immediately lose access to all shared resources."
        confirmLabel="Remove"
      >
        <p className="text-muted-foreground">
          You can re-invite them later; their prior activity is preserved.
        </p>
      </ConfirmDialogContent>
    </ConfirmDialog>
  ),
}

export const Controlled: Story = {
  render: function ControlledRender() {
    const [open, setOpen] = React.useState(false)
    const [count, setCount] = React.useState(0)
    return (
      <div className="flex flex-col items-center gap-3">
        <Button variant="outline" onClick={() => setOpen(true)}>
          Reset counter
        </Button>
        <p className="text-sm text-muted-foreground">Reset {count} time(s)</p>
        <ConfirmDialog open={open} onOpenChange={setOpen}>
          <ConfirmDialogContent
            tone="destructive"
            title="Reset the counter?"
            description="The counter will return to zero."
            confirmLabel="Reset"
            onConfirm={() => setCount((c) => c + 1)}
          />
        </ConfirmDialog>
      </div>
    )
  },
}
