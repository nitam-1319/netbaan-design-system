import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within, fn } from "storybook/test"
import { ChevronRight, Globe, Server, ShieldAlert } from "lucide-react"

import { List, ListItem, ListItemContent } from "@/components/ui/list"

const meta = {
  title: "Components/List",
  component: List,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-80 p-10 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof List>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <List>
      <ListItem>Daily scan completed</ListItem>
      <ListItem>3 new assets discovered</ListItem>
      <ListItem>1 certificate expiring soon</ListItem>
    </List>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const list = canvas.getByRole("list")
    await expect(list).toHaveAttribute("data-slot", "list")
    await expect(canvas.getAllByRole("listitem")).toHaveLength(3)
  },
}

export const Divided: Story = {
  render: () => (
    <List variant="divided">
      <ListItem>
        <Server className="size-4 text-muted-foreground" />
        <ListItemContent>api.netbaan.io</ListItemContent>
      </ListItem>
      <ListItem>
        <Globe className="size-4 text-muted-foreground" />
        <ListItemContent>cdn.netbaan.io</ListItemContent>
      </ListItem>
      <ListItem>
        <ShieldAlert className="size-4 text-destructive" />
        <ListItemContent>legacy.netbaan.io</ListItemContent>
      </ListItem>
    </List>
  ),
}

export const Bordered: Story = {
  render: () => (
    <List variant="bordered">
      <ListItem>
        <ListItemContent>
          <span className="font-medium">Production</span>
          <span className="text-xs text-muted-foreground">42 assets</span>
        </ListItemContent>
      </ListItem>
      <ListItem>
        <ListItemContent>
          <span className="font-medium">Staging</span>
          <span className="text-xs text-muted-foreground">17 assets</span>
        </ListItemContent>
      </ListItem>
    </List>
  ),
}

export const Interactive: Story = {
  render: () => (
    <List variant="bordered">
      <ListItem interactive onClick={fn()}>
        <ListItemContent>Attack surface</ListItemContent>
        <ChevronRight className="size-4 text-muted-foreground" />
      </ListItem>
      <ListItem interactive onClick={fn()}>
        <ListItemContent>Certificates</ListItemContent>
        <ChevronRight className="size-4 text-muted-foreground" />
      </ListItem>
      <ListItem interactive disabled>
        <ListItemContent>Archived (disabled)</ListItemContent>
        <ChevronRight className="size-4 text-muted-foreground" />
      </ListItem>
    </List>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const items = canvas.getAllByRole("listitem")
    // Interactive rows are focusable; the disabled one is not.
    await expect(items[0]).toHaveAttribute("data-interactive", "true")
    await expect(items[0]).toHaveAttribute("tabindex", "0")
    await expect(items[2]).toHaveAttribute("aria-disabled", "true")
    await expect(items[2]).not.toHaveAttribute("tabindex")
    await userEvent.tab()
    await expect(items[0]).toHaveFocus()
  },
}

export const Disabled: Story = {
  render: () => (
    <List variant="bordered">
      <ListItem interactive onClick={fn()}>
        <ListItemContent>Attack surface</ListItemContent>
        <ChevronRight className="size-4 text-muted-foreground" />
      </ListItem>
      <ListItem interactive disabled>
        <ListItemContent>Certificates (disabled)</ListItemContent>
        <ChevronRight className="size-4 text-muted-foreground" />
      </ListItem>
      <ListItem disabled>
        <ListItemContent>Archived (disabled)</ListItemContent>
      </ListItem>
    </List>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const items = canvas.getAllByRole("listitem")
    // Disabled rows expose aria-disabled and are removed from the tab order.
    await expect(items[1]).toHaveAttribute("aria-disabled", "true")
    await expect(items[1]).not.toHaveAttribute("tabindex")
    await expect(items[2]).toHaveAttribute("aria-disabled", "true")
    await expect(items[2]).not.toHaveAttribute("tabindex")
  },
}

export const Densities: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <List variant="bordered">
        <ListItem density="compact">Compact row</ListItem>
        <ListItem density="compact">Compact row</ListItem>
      </List>
      <List variant="bordered">
        <ListItem density="default">Default row</ListItem>
        <ListItem density="default">Default row</ListItem>
      </List>
      <List variant="bordered">
        <ListItem density="comfortable">Comfortable row</ListItem>
        <ListItem density="comfortable">Comfortable row</ListItem>
      </List>
    </div>
  ),
}

export const Ordered: Story = {
  render: () => (
    <List ordered variant="divided">
      <ListItem>Enumerate assets</ListItem>
      <ListItem>Fingerprint services</ListItem>
      <ListItem>Score exposure</ListItem>
    </List>
  ),
}
