import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, screen, waitFor, within } from "storybook/test"
import * as React from "react"
import {
  Copy,
  Download,
  MoreHorizontal,
  Pencil,
  Share2,
  Trash2,
  UserPlus,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Menu,
  MenuTrigger,
  MenuContent,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuSeparator,
  MenuCheckboxItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuShortcut,
  MenuSub,
  MenuSubTrigger,
} from "@/components/ui/menu"

/**
 * The Menu surface portals to `document.body`, so — as with Dialog and Popover
 * — the toolbar theme applied on the story wrapper does not reach it. A `.dark`
 * wrapper carries the theme onto the portalled content for these stories; use
 * the global Theme/Locale toolbar to preview the non-portalled trigger.
 */
const meta = {
  title: "Components/Menu",
  component: Menu,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="dark bg-background p-16 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Menu>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Menu>
      <MenuTrigger render={<Button variant="outline">Actions</Button>} />
      <MenuContent>
        <MenuItem>
          <Pencil /> Edit
          <MenuShortcut>⌘E</MenuShortcut>
        </MenuItem>
        <MenuItem>
          <Copy /> Duplicate
          <MenuShortcut>⌘D</MenuShortcut>
        </MenuItem>
        <MenuItem>
          <Share2 /> Share
        </MenuItem>
        <MenuSeparator />
        <MenuItem variant="destructive">
          <Trash2 /> Delete
          <MenuShortcut>⌦</MenuShortcut>
        </MenuItem>
      </MenuContent>
    </Menu>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole("button", { name: "Actions" })
    await expect(trigger).toHaveAttribute("aria-expanded", "false")
    await userEvent.click(trigger)
    // Portalled content lands on document.body.
    const menu = await screen.findByRole("menu")
    await waitFor(() => expect(menu).toBeVisible())
    await expect(trigger).toHaveAttribute("aria-expanded", "true")
    await expect(
      screen.getByRole("menuitem", { name: /Delete/ })
    ).toBeInTheDocument()
    // Escape dismisses.
    await userEvent.keyboard("{Escape}")
    await waitFor(() =>
      expect(screen.queryByRole("menu")).not.toBeInTheDocument()
    )
  },
}

export const WithGroups: Story = {
  render: () => (
    <Menu>
      <MenuTrigger
        render={
          <Button variant="outline" size="icon" aria-label="Open menu">
            <MoreHorizontal />
          </Button>
        }
      />
      <MenuContent>
        <MenuGroup>
          <MenuGroupLabel>Asset</MenuGroupLabel>
          <MenuItem>
            <UserPlus /> Assign owner
          </MenuItem>
          <MenuItem>
            <Download /> Export report
          </MenuItem>
        </MenuGroup>
        <MenuSeparator />
        <MenuGroup>
          <MenuGroupLabel>Danger zone</MenuGroupLabel>
          <MenuItem variant="destructive">
            <Trash2 /> Remove from scope
          </MenuItem>
        </MenuGroup>
      </MenuContent>
    </Menu>
  ),
}

function CheckboxDemo() {
  const [showResolved, setShowResolved] = React.useState(true)
  const [showInfo, setShowInfo] = React.useState(false)
  return (
    <Menu>
      <MenuTrigger render={<Button variant="outline">View options</Button>} />
      <MenuContent>
        <MenuGroup>
          <MenuGroupLabel>Show findings</MenuGroupLabel>
          <MenuCheckboxItem
            checked={showResolved}
            onCheckedChange={setShowResolved}
          >
            Resolved
          </MenuCheckboxItem>
          <MenuCheckboxItem checked={showInfo} onCheckedChange={setShowInfo}>
            Informational
          </MenuCheckboxItem>
        </MenuGroup>
      </MenuContent>
    </Menu>
  )
}

export const CheckboxItems: Story = {
  render: () => <CheckboxDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: "View options" }))
    const info = await screen.findByRole("menuitemcheckbox", {
      name: "Informational",
    })
    await expect(info).toHaveAttribute("aria-checked", "false")
    await userEvent.click(info)
    // Re-open (menu closes on select by default is off for checkbox items).
    await expect(
      await screen.findByRole("menuitemcheckbox", { name: "Informational" })
    ).toHaveAttribute("aria-checked", "true")
  },
}

function RadioDemo() {
  const [density, setDensity] = React.useState("comfortable")
  return (
    <Menu>
      <MenuTrigger render={<Button variant="outline">Density</Button>} />
      <MenuContent>
        <MenuRadioGroup value={density} onValueChange={setDensity}>
          <MenuGroupLabel>Row density</MenuGroupLabel>
          <MenuRadioItem value="compact">Compact</MenuRadioItem>
          <MenuRadioItem value="comfortable">Comfortable</MenuRadioItem>
          <MenuRadioItem value="spacious">Spacious</MenuRadioItem>
        </MenuRadioGroup>
      </MenuContent>
    </Menu>
  )
}

export const RadioItems: Story = {
  render: () => <RadioDemo />,
}

export const Submenu: Story = {
  render: () => (
    <Menu>
      <MenuTrigger render={<Button variant="outline">More</Button>} />
      <MenuContent>
        <MenuItem>
          <Pencil /> Rename
        </MenuItem>
        <MenuSub>
          <MenuSubTrigger>
            <Share2 /> Share with
          </MenuSubTrigger>
          <MenuContent>
            <MenuItem>Security team</MenuItem>
            <MenuItem>Platform team</MenuItem>
            <MenuSeparator />
            <MenuItem>Copy link</MenuItem>
          </MenuContent>
        </MenuSub>
        <MenuSeparator />
        <MenuItem variant="destructive">
          <Trash2 /> Delete
        </MenuItem>
      </MenuContent>
    </Menu>
  ),
}

export const DisabledItem: Story = {
  render: () => (
    <Menu>
      <MenuTrigger render={<Button variant="outline">Actions</Button>} />
      <MenuContent>
        <MenuItem>Approve</MenuItem>
        <MenuItem disabled>Escalate (needs permission)</MenuItem>
        <MenuItem>Snooze</MenuItem>
      </MenuContent>
    </Menu>
  ),
}
