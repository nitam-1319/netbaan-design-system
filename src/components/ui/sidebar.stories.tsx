import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"
import { LayoutDashboard, ShieldAlert, Server, ScanLine, Settings } from "lucide-react"

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarItem,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const meta = {
  title: "Components/Sidebar",
  component: Sidebar,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="h-[32rem] w-64 border-e border-border">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Sidebar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Sidebar>
      <SidebarHeader>AEGIS Console</SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Monitor</SidebarGroupLabel>
          <SidebarItem href="#" active>
            <LayoutDashboard />
            Overview
          </SidebarItem>
          <SidebarItem href="#">
            <ShieldAlert />
            Findings
          </SidebarItem>
          <SidebarItem href="#">
            <Server />
            Assets
          </SidebarItem>
          <SidebarItem href="#">
            <ScanLine />
            Scans
          </SidebarItem>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarItem href="#">
            <Settings />
            Settings
          </SidebarItem>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Avatar size="sm">
          <AvatarFallback>SN</AvatarFallback>
        </Avatar>
        Sam Netbaan
      </SidebarFooter>
    </Sidebar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const nav = canvas.getByRole("navigation", { name: "Sidebar" })
    await expect(nav).toBeVisible()
    const active = canvas.getByRole("link", { name: "Overview" })
    await expect(active).toHaveAttribute("aria-current", "page")
    await expect(
      canvas.getByRole("link", { name: "Findings" })
    ).not.toHaveAttribute("aria-current")
  },
}

export const Grouped: Story = {
  render: () => (
    <Sidebar navLabel="Reports navigation">
      <SidebarHeader>Reports</SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Exposure</SidebarGroupLabel>
          <SidebarItem href="#" active>
            Attack surface
          </SidebarItem>
          <SidebarItem href="#">Remediation</SidebarItem>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Compliance</SidebarGroupLabel>
          <SidebarItem href="#">SSL / certificates</SidebarItem>
          <SidebarItem href="#">Coverage</SidebarItem>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  ),
}
