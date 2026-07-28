import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, screen, waitFor, within, fn } from "storybook/test"
import { RefreshCw, Share2, Star, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  ActionSheet,
  ActionSheetTrigger,
  ActionSheetContent,
} from "@/components/ui/action-sheet"

const meta = {
  title: "Components/Action Sheet",
  component: ActionSheet,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ActionSheet>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <ActionSheet>
      <ActionSheetTrigger render={<Button variant="outline">Options</Button>} />
      <ActionSheetContent
        title="asset-42.netbaan.io"
        description="Choose an action for this asset."
        actions={[
          { label: "Rescan now", icon: <RefreshCw /> },
          { label: "Share report", icon: <Share2 /> },
          { label: "Add to watchlist", icon: <Star /> },
          { label: "Delete asset", icon: <Trash2 />, destructive: true },
        ]}
      />
    </ActionSheet>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole("button", { name: "Options" })
    await userEvent.click(trigger)
    const sheet = await screen.findByRole("dialog")
    await waitFor(() => expect(sheet).toBeVisible())
    // The destructive row is present and reachable.
    await expect(
      screen.getByRole("button", { name: "Delete asset" })
    ).toBeVisible()
    // Cancel dismisses and returns focus to the trigger.
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }))
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    )
    await expect(trigger).toHaveFocus()
  },
}

const onRescan = fn()

export const FiresHandler: Story = {
  render: () => (
    <ActionSheet>
      <ActionSheetTrigger render={<Button variant="outline">Manage</Button>} />
      <ActionSheetContent
        title="Manage asset"
        actions={[
          { label: "Rescan now", icon: <RefreshCw />, onClick: onRescan },
          { label: "Delete asset", icon: <Trash2 />, destructive: true },
        ]}
      />
    </ActionSheet>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: "Manage" }))
    await screen.findByRole("dialog")
    // Choosing a row fires its handler, then closes the sheet.
    await userEvent.click(screen.getByRole("button", { name: "Rescan now" }))
    await expect(onRescan).toHaveBeenCalledOnce()
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    )
  },
}

export const TitleLess: Story = {
  render: () => (
    <ActionSheet>
      <ActionSheetTrigger render={<Button variant="outline">More</Button>} />
      <ActionSheetContent
        aria-label="Post actions"
        actions={[
          { label: "Copy link", icon: <Share2 /> },
          { label: "Report", icon: <Trash2 />, destructive: true },
        ]}
      />
    </ActionSheet>
  ),
}

export const WithDisabledRow: Story = {
  render: () => (
    <ActionSheet>
      <ActionSheetTrigger render={<Button variant="outline">Row actions</Button>} />
      <ActionSheetContent
        title="Row actions"
        actions={[
          { label: "Open", icon: <Share2 /> },
          { label: "Rescan (running…)", icon: <RefreshCw />, disabled: true },
          { label: "Delete", icon: <Trash2 />, destructive: true },
        ]}
      />
    </ActionSheet>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: "Row actions" }))
    await screen.findByRole("dialog")
    // The disabled row is exposed as disabled and stays non-interactive.
    await expect(
      screen.getByRole("button", { name: "Rescan (running…)" })
    ).toBeDisabled()
  },
}
