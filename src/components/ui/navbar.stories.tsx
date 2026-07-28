import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"
import { ShieldCheck } from "lucide-react"

import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarActions,
} from "@/components/ui/navbar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const meta = {
  title: "Components/Navbar",
  component: Navbar,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Navbar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Navbar>
      <NavbarBrand>
        <ShieldCheck />
        AEGIS
      </NavbarBrand>
      <NavbarContent>
        <NavbarItem href="#" active>
          Overview
        </NavbarItem>
        <NavbarItem href="#">Findings</NavbarItem>
        <NavbarItem href="#">Assets</NavbarItem>
        <NavbarItem href="#">Scans</NavbarItem>
      </NavbarContent>
      <NavbarActions>
        <Button variant="outline" size="sm">
          Invite
        </Button>
        <Avatar size="sm">
          <AvatarFallback>SN</AvatarFallback>
        </Avatar>
      </NavbarActions>
    </Navbar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Navigation landmark is labelled.
    const nav = canvas.getByRole("navigation", { name: "Primary" })
    await expect(nav).toBeVisible()
    // Active item exposes aria-current=page.
    const active = canvas.getByRole("link", { name: "Overview" })
    await expect(active).toHaveAttribute("aria-current", "page")
    const inactive = canvas.getByRole("link", { name: "Findings" })
    await expect(inactive).not.toHaveAttribute("aria-current")
  },
}

export const CenteredNav: Story = {
  render: () => (
    <Navbar size="lg">
      <NavbarBrand>
        <ShieldCheck />
        AEGIS
      </NavbarBrand>
      <NavbarContent justify="center">
        <NavbarItem href="#" active>
          Dashboard
        </NavbarItem>
        <NavbarItem href="#">Reports</NavbarItem>
        <NavbarItem href="#">Settings</NavbarItem>
      </NavbarContent>
      <NavbarActions>
        <Button size="sm">New scan</Button>
      </NavbarActions>
    </Navbar>
  ),
}

export const Compact: Story = {
  render: () => (
    <Navbar size="sm">
      <NavbarBrand>AEGIS</NavbarBrand>
      <NavbarContent>
        <NavbarItem href="#" active>
          Overview
        </NavbarItem>
        <NavbarItem href="#">Findings</NavbarItem>
      </NavbarContent>
      <NavbarActions>
        <Button variant="ghost" size="sm">
          Docs
        </Button>
      </NavbarActions>
    </Navbar>
  ),
}

export const EndAligned: Story = {
  render: () => (
    <Navbar>
      <NavbarBrand>
        <ShieldCheck />
        AEGIS
      </NavbarBrand>
      <NavbarContent justify="end">
        <NavbarItem href="#" active>
          Overview
        </NavbarItem>
        <NavbarItem href="#">Findings</NavbarItem>
        <NavbarItem href="#">Assets</NavbarItem>
      </NavbarContent>
    </Navbar>
  ),
}
