import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"
import { LayoutDashboard, PanelLeft, Radar, ShieldAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  AppShell,
  AppShellSidebar,
  AppShellMain,
  AppShellHeader,
  AppShellContent,
  AppShellFooter,
} from "@/components/ui/app-shell"

const meta = {
  title: "Components/AppShell",
  component: AppShell,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AppShell>

export default meta
type Story = StoryObj<typeof meta>

const NavItem = ({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
}) => (
  <a
    href="#"
    className="text-sidebar-foreground hover:bg-sidebar-accent flex items-center gap-2 rounded-md px-2.5 py-2 text-sm"
  >
    <Icon className="size-4 shrink-0" />
    <span className="truncate">{label}</span>
  </a>
)

export const Default: Story = {
  render: () => (
    <div className="h-[32rem] overflow-hidden rounded-xl border border-border [&>[data-slot=app-shell]]:min-h-full">
    <AppShell>
      <AppShellSidebar>
        <div className="border-sidebar-border flex h-14 items-center gap-2 border-b px-4">
          <ShieldAlert className="text-sidebar-primary size-5" />
          <span className="font-heading font-semibold">AEGIS</span>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          <NavItem icon={LayoutDashboard} label="Dashboard" />
          <NavItem icon={Radar} label="Attack surface" />
          <NavItem icon={ShieldAlert} label="Findings" />
        </nav>
      </AppShellSidebar>
      <AppShellMain>
        <AppShellHeader>
          <span className="font-medium">Overview</span>
          <div className="ml-auto">
            <Button size="sm" variant="outline">
              Run scan
            </Button>
          </div>
        </AppShellHeader>
        <AppShellContent>
          <div className="bg-surface border-border rounded-lg border p-6 text-sm">
            Content region — scrolls independently of the header and sidebar.
          </div>
        </AppShellContent>
        <AppShellFooter>Last scan 3h ago · 128 assets monitored</AppShellFooter>
      </AppShellMain>
    </AppShell>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvasElement.querySelector("[data-slot='app-shell-sidebar']")
    ).toBeInTheDocument()
    await expect(
      canvasElement.querySelector("[data-slot='app-shell-header']")
    ).toBeInTheDocument()
    await expect(canvas.getByRole("button", { name: "Run scan" })).toBeEnabled()
  },
}

export const CollapsibleSidebar: Story = {
  render: () => {
    const Demo = () => {
      const [collapsed, setCollapsed] = React.useState(false)
      return (
        <div className="h-[24rem] overflow-hidden rounded-xl border border-border [&>[data-slot=app-shell]]:min-h-full">
        <AppShell>
          <AppShellSidebar collapsed={collapsed}>
            <nav className="flex flex-col gap-1 p-3">
              <NavItem icon={LayoutDashboard} label="Dashboard" />
              <NavItem icon={Radar} label="Attack surface" />
            </nav>
          </AppShellSidebar>
          <AppShellMain>
            <AppShellHeader>
              <Button
                size="icon-sm"
                variant="ghost"
                aria-label="Toggle sidebar"
                onClick={() => setCollapsed((v) => !v)}
              >
                <PanelLeft />
              </Button>
              <span className="font-medium">Overview</span>
            </AppShellHeader>
            <AppShellContent>
              <p className="text-muted-foreground text-sm">
                Toggle the sidebar with the button in the header.
              </p>
            </AppShellContent>
          </AppShellMain>
        </AppShell>
        </div>
      )
    }
    return <Demo />
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const sidebar = canvasElement.querySelector(
      "[data-slot='app-shell-sidebar']"
    )
    await expect(sidebar).not.toHaveAttribute("data-collapsed")
    await userEvent.click(
      canvas.getByRole("button", { name: "Toggle sidebar" })
    )
    await expect(sidebar).toHaveAttribute("data-collapsed")
  },
}
