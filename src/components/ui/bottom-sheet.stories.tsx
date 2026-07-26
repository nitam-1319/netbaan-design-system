import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, screen, waitFor, within } from "storybook/test"

import { Button } from "@/components/ui/button"
import {
  BottomSheet,
  BottomSheetTrigger,
  BottomSheetClose,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetBody,
  BottomSheetFooter,
  BottomSheetTitle,
  BottomSheetDescription,
} from "@/components/ui/bottom-sheet"

const meta = {
  title: "Components/Bottom Sheet",
  component: BottomSheet,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof BottomSheet>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <BottomSheet>
      <BottomSheetTrigger render={<Button variant="outline">Share asset</Button>} />
      <BottomSheetContent>
        <BottomSheetHeader>
          <BottomSheetTitle>Share asset</BottomSheetTitle>
          <BottomSheetDescription>
            Pick where to send api-gw-prod.netbaan.io.
          </BottomSheetDescription>
        </BottomSheetHeader>
        <BottomSheetBody>
          Sharing options live here — composed from AEGIS list and button
          primitives, never inline styling.
        </BottomSheetBody>
        <BottomSheetFooter>
          <BottomSheetClose render={<Button variant="ghost">Cancel</Button>} />
          <BottomSheetClose render={<Button>Share</Button>} />
        </BottomSheetFooter>
      </BottomSheetContent>
    </BottomSheet>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole("button", { name: "Share asset" })
    await userEvent.click(trigger)
    // Portalled content lands on document.body, so query the screen.
    const sheet = await screen.findByRole("dialog")
    await waitFor(() => expect(sheet).toBeVisible())
    await expect(
      screen.getByRole("heading", { name: "Share asset" })
    ).toBeVisible()
    // Escape dismisses and returns focus to the trigger.
    await userEvent.keyboard("{Escape}")
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    )
    await expect(trigger).toHaveFocus()
  },
}

export const CompactActions: Story = {
  render: () => (
    <BottomSheet>
      <BottomSheetTrigger render={<Button variant="outline">Quick actions</Button>} />
      <BottomSheetContent height="sm">
        <BottomSheetHeader>
          <BottomSheetTitle>Quick actions</BottomSheetTitle>
          <BottomSheetDescription>
            Common tasks for the selected asset.
          </BottomSheetDescription>
        </BottomSheetHeader>
        <BottomSheetFooter>
          <BottomSheetClose render={<Button variant="ghost">Dismiss</Button>} />
          <BottomSheetClose render={<Button>Run scan</Button>} />
        </BottomSheetFooter>
      </BottomSheetContent>
    </BottomSheet>
  ),
}

export const TallDetail: Story = {
  render: () => (
    <BottomSheet>
      <BottomSheetTrigger render={<Button variant="outline">Asset details</Button>} />
      <BottomSheetContent height="lg">
        <BottomSheetHeader>
          <BottomSheetTitle>api-gw-prod.netbaan.io</BottomSheetTitle>
          <BottomSheetDescription>
            Scan history and exposed services for the selected asset.
          </BottomSheetDescription>
        </BottomSheetHeader>
        <BottomSheetBody>
          A taller sheet for read-heavy detail views. The body scrolls
          independently once its content exceeds the height cap, while the
          header and footer stay pinned.
        </BottomSheetBody>
        <BottomSheetFooter>
          <BottomSheetClose render={<Button variant="ghost">Close</Button>} />
          <BottomSheetClose render={<Button>Open full page</Button>} />
        </BottomSheetFooter>
      </BottomSheetContent>
    </BottomSheet>
  ),
}

export const WithoutGrabber: Story = {
  render: () => (
    <BottomSheet>
      <BottomSheetTrigger render={<Button variant="outline">Plain sheet</Button>} />
      <BottomSheetContent showGrabber={false}>
        <BottomSheetHeader>
          <BottomSheetTitle>Plain sheet</BottomSheetTitle>
          <BottomSheetDescription>
            The grabber handle is optional and hidden here.
          </BottomSheetDescription>
        </BottomSheetHeader>
        <BottomSheetFooter>
          <BottomSheetClose render={<Button>Done</Button>} />
        </BottomSheetFooter>
      </BottomSheetContent>
    </BottomSheet>
  ),
}

export const Open: Story = {
  render: function OpenSheet() {
    return (
      <BottomSheet defaultOpen>
        <BottomSheetContent height="sm">
          <BottomSheetHeader>
            <BottomSheetTitle>Session details</BottomSheetTitle>
            <BottomSheetDescription>
              This sheet opened via `defaultOpen` to demonstrate the open state.
            </BottomSheetDescription>
          </BottomSheetHeader>
          <BottomSheetFooter>
            <BottomSheetClose render={<Button variant="ghost">Sign out</Button>} />
            <BottomSheetClose render={<Button>Stay signed in</Button>} />
          </BottomSheetFooter>
        </BottomSheetContent>
      </BottomSheet>
    )
  },
}
