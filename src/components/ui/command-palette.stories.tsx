import type { Meta, StoryObj } from "@storybook/react-vite"
import * as React from "react"
import { expect, fn, userEvent, screen, waitFor } from "storybook/test"
import { FileText, Settings, User, LogOut, Trash2 } from "lucide-react"

import { CommandPalette } from "@/components/ui/command-palette"
import { Button } from "@/components/ui/button"

/**
 * The palette opens in a modal `Dialog` portalled to `document.body`; the global
 * Theme/Locale toolbar drives Light/Dark and English-LTR / Persian-RTL.
 */
const meta = {
  title: "Components/CommandPalette",
  component: CommandPalette,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof CommandPalette>

export default meta
type Story = StoryObj<typeof meta>

const ITEMS = [
  { value: "new-doc", label: "New document", icon: <FileText />, shortcut: "⌘N", keywords: ["create", "file"] },
  { value: "profile", label: "Open profile", icon: <User />, keywords: ["account"] },
  { value: "settings", label: "Settings", icon: <Settings />, shortcut: "⌘,", keywords: ["preferences"] },
  { value: "logout", label: "Log out", icon: <LogOut />, keywords: ["sign out"] },
]

export const Default: Story = {
  args: { items: ITEMS },
  render: (args) => {
    const [open, setOpen] = React.useState(false)
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
        <Button onClick={() => setOpen(true)}>Open palette (or press ⌘K)</Button>
        <CommandPalette {...args} open={open} onOpenChange={setOpen} />
      </div>
    )
  },
}

export const OpenAndSelect: Story = {
  args: { items: ITEMS, defaultOpen: true, onSelect: fn() },
  play: async ({ args }) => {
    // The palette is portalled to the document body.
    const input = await screen.findByRole("combobox")
    await userEvent.type(input, "sett")
    const option = await screen.findByRole("option", { name: /Settings/ })
    await expect(option).toBeVisible()
    await userEvent.click(option)
    // The matching command's value is reported and the palette closes.
    await expect(args.onSelect).toHaveBeenCalledWith("settings")
    await waitFor(() => expect(screen.queryByRole("combobox")).toBeNull())
  },
}

export const Empty: Story = {
  args: { items: ITEMS, defaultOpen: true },
  play: async () => {
    const input = await screen.findByRole("combobox")
    await userEvent.type(input, "zzzzz")
    await expect(await screen.findByText("No results found.")).toBeVisible()
  },
}

const ITEMS_WITH_DISABLED = [
  ...ITEMS,
  {
    value: "delete",
    label: "Delete workspace",
    icon: <Trash2 />,
    keywords: ["remove"],
    disabled: true,
  },
]

export const WithDisabledItem: Story = {
  args: { items: ITEMS_WITH_DISABLED, defaultOpen: true, onSelect: fn() },
  play: async ({ args }) => {
    // A disabled command is exposed to AT as disabled and is not selectable:
    // keyboard highlight skips it and Enter cannot run it.
    const input = await screen.findByRole("combobox")
    const option = await screen.findByRole("option", { name: /Delete workspace/ })
    await expect(option).toHaveAttribute("aria-disabled", "true")
    await userEvent.type(input, "delete{Enter}")
    await expect(args.onSelect).not.toHaveBeenCalled()
  },
}
