import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fireEvent, screen, waitFor, within } from "storybook/test"
import * as React from "react"
import { Copy, Download, Pencil, Share2, Star, Trash2 } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuGroupLabel,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuCheckboxItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubTrigger,
} from "@/components/ui/context-menu"

/**
 * The Context Menu surface portals to `document.body`; the global Theme/Locale
 * toolbar drives Light/Dark and English-LTR / Persian-RTL. Right-click (or
 * long-press on touch) anywhere inside the dashed trigger area to open the menu
 * at the pointer.
 */
const meta = {
  title: "Components/ContextMenu",
  component: ContextMenu,
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
} satisfies Meta<typeof ContextMenu>

export default meta
type Story = StoryObj<typeof meta>

/**
 * A dashed drop-zone-style area used across the stories as the trigger.
 *
 * NOTE: `ContextMenuTrigger` renders this via Base UI's `render` prop, which
 * injects the `contextmenu` handler, ref and data attributes into the element.
 * A custom render component MUST therefore forward its ref and spread the
 * incoming props onto a real DOM node — otherwise the trigger is inert and the
 * menu never opens.
 */
const TriggerArea = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & { label?: string }
>(function TriggerArea({ label = "Right-click here", className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn(
        "border-border-strong text-muted-foreground flex h-40 w-72 select-none items-center justify-center rounded-lg border border-dashed text-sm",
        className
      )}
      {...props}
    >
      {label}
    </div>
  )
})

export const Default: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger render={<TriggerArea />} />
      <ContextMenuContent>
        <ContextMenuItem>
          <Pencil /> Edit
          <ContextMenuShortcut>⌘E</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          <Copy /> Duplicate
          <ContextMenuShortcut>⌘D</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          <Share2 /> Share
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive">
          <Trash2 /> Delete
          <ContextMenuShortcut>⌦</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByText("Right-click here")
    // Right-click (contextmenu) opens the portalled menu on document.body.
    fireEvent.contextMenu(trigger)
    const menu = await screen.findByRole("menu")
    await waitFor(() => expect(menu).toBeVisible())
    await expect(
      screen.getByRole("menuitem", { name: /Delete/ })
    ).toBeInTheDocument()
  },
}

export const Grouped: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger render={<TriggerArea label="Right-click for groups" />} />
      <ContextMenuContent>
        <ContextMenuGroup>
          <ContextMenuGroupLabel>Actions</ContextMenuGroupLabel>
          <ContextMenuItem inset>
            <Copy /> Copy
          </ContextMenuItem>
          <ContextMenuItem inset>
            <Download /> Download
          </ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuGroup>
          <ContextMenuGroupLabel>Danger zone</ContextMenuGroupLabel>
          <ContextMenuItem inset variant="destructive">
            <Trash2 /> Delete
          </ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  ),
}

export const CheckboxItems: Story = {
  render: function CheckboxRender() {
    const [bookmarked, setBookmarked] = React.useState(true)
    const [watched, setWatched] = React.useState(false)
    return (
      <ContextMenu>
        <ContextMenuTrigger render={<TriggerArea label="Right-click for toggles" />} />
        <ContextMenuContent>
          <ContextMenuCheckboxItem
            checked={bookmarked}
            onCheckedChange={setBookmarked}
          >
            Bookmarked
          </ContextMenuCheckboxItem>
          <ContextMenuCheckboxItem
            checked={watched}
            onCheckedChange={setWatched}
          >
            Watching
          </ContextMenuCheckboxItem>
        </ContextMenuContent>
      </ContextMenu>
    )
  },
}

export const RadioItems: Story = {
  render: function RadioRender() {
    const [sort, setSort] = React.useState("name")
    return (
      <ContextMenu>
        <ContextMenuTrigger render={<TriggerArea label="Right-click to sort" />} />
        <ContextMenuContent>
          <ContextMenuRadioGroup value={sort} onValueChange={setSort}>
            <ContextMenuGroupLabel>Sort by</ContextMenuGroupLabel>
            <ContextMenuRadioItem value="name">Name</ContextMenuRadioItem>
            <ContextMenuRadioItem value="date">Date modified</ContextMenuRadioItem>
            <ContextMenuRadioItem value="size">Size</ContextMenuRadioItem>
          </ContextMenuRadioGroup>
        </ContextMenuContent>
      </ContextMenu>
    )
  },
}

export const WithSubmenu: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger render={<TriggerArea label="Right-click for submenu" />} />
      <ContextMenuContent>
        <ContextMenuItem>
          <Star /> Favorite
        </ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Share2 /> Share
          </ContextMenuSubTrigger>
          <ContextMenuContent>
            <ContextMenuItem>Copy link</ContextMenuItem>
            <ContextMenuItem>Email</ContextMenuItem>
            <ContextMenuItem>Export…</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive">
          <Trash2 /> Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
}
