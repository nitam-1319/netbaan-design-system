import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, screen, waitFor, within } from "storybook/test"

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer"

const meta = {
  title: "Components/Drawer",
  component: Drawer,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Drawer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger render={<Button variant="outline">Open filters</Button>} />
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Filter findings</DrawerTitle>
          <DrawerDescription>
            Narrow the active findings queue by severity, asset, and scan date.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          Filter controls live here — composed from AEGIS inputs and layout
          primitives, never inline styling.
        </DrawerBody>
        <DrawerFooter>
          <DrawerClose render={<Button variant="ghost">Reset</Button>} />
          <DrawerClose render={<Button>Apply</Button>} />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole("button", { name: "Open filters" })
    await userEvent.click(trigger)
    // Portalled content lands on document.body, so query the screen.
    const drawer = await screen.findByRole("dialog")
    await waitFor(() => expect(drawer).toBeVisible())
    await expect(
      screen.getByRole("heading", { name: "Filter findings" })
    ).toBeVisible()
    // Escape dismisses and returns focus to the trigger.
    await userEvent.keyboard("{Escape}")
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    )
    await expect(trigger).toHaveFocus()
  },
}

export const LeftSide: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger render={<Button variant="outline">Open navigation</Button>} />
      <DrawerContent side="left">
        <DrawerHeader>
          <DrawerTitle>Navigation</DrawerTitle>
          <DrawerDescription>Jump to a section of the console.</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>Primary navigation slides in from the inline-start edge.</DrawerBody>
        <DrawerFooter>
          <DrawerClose render={<Button variant="ghost">Close</Button>} />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
}

export const BottomSheet: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger render={<Button variant="outline">Quick actions</Button>} />
      <DrawerContent side="bottom" size="sm">
        <DrawerHeader>
          <DrawerTitle>Quick actions</DrawerTitle>
          <DrawerDescription>Common tasks for the selected asset.</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <DrawerClose render={<Button variant="ghost">Dismiss</Button>} />
          <DrawerClose render={<Button>Run scan</Button>} />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
}

export const TopSheet: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger render={<Button variant="outline">Announcements</Button>} />
      <DrawerContent side="top" size="sm">
        <DrawerHeader>
          <DrawerTitle>System notice</DrawerTitle>
          <DrawerDescription>
            A banner-style panel that slides in from the top edge.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <DrawerClose render={<Button variant="ghost">Dismiss</Button>} />
          <DrawerClose render={<Button>Acknowledge</Button>} />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
}

export const LargeDetail: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger render={<Button variant="outline">Asset details</Button>} />
      <DrawerContent side="right" size="xl">
        <DrawerHeader>
          <DrawerTitle>api-gw-prod.netbaan.io</DrawerTitle>
          <DrawerDescription>
            Full detail panel for the selected asset, including scan history and
            exposed services.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          A wider panel for read-heavy detail views. Content is composed from AEGIS
          primitives; the drawer never accepts a styling hatch.
        </DrawerBody>
        <DrawerFooter>
          <DrawerClose render={<Button variant="ghost">Close</Button>} />
          <DrawerClose render={<Button>Open full page</Button>} />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
}

export const Controlled: Story = {
  render: function ControlledDrawer() {
    return (
      <Drawer defaultOpen>
        <DrawerContent side="right" size="sm">
          <DrawerHeader>
            <DrawerTitle>Session details</DrawerTitle>
            <DrawerDescription>
              This drawer opened via `defaultOpen` to demonstrate the open state.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <DrawerClose render={<Button variant="ghost">Sign out</Button>} />
            <DrawerClose render={<Button>Stay signed in</Button>} />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  },
}
