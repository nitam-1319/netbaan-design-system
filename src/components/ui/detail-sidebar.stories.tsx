import type { Meta, StoryObj } from "@storybook/react-vite"
import * as React from "react"
import { expect, userEvent, within } from "storybook/test"

import { Button } from "@/components/ui/button"
import {
  DetailSidebar,
  DetailSidebarBody,
  DetailSidebarHeader,
  DetailSidebarSection,
} from "@/components/ui/detail-sidebar"
import { SeverityBadge } from "@/components/ui/severity-badge"
import { StatusPill } from "@/components/ui/status-pill"

const meta = {
  title: "Components/DetailSidebar",
  component: DetailSidebar,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
  args: {
    open: true,
    label: "Finding detail",
    width: 440,
    onClose: () => {},
  },
} satisfies Meta<typeof DetailSidebar>

export default meta
type Story = StoryObj<typeof meta>

const detail = (onClose: () => void) => (
  <>
    <DetailSidebarHeader onClose={onClose} closeLabel="Close detail">
      <div className="flex items-center gap-2">
        <SeverityBadge level="critical" size="sm" />
        <StatusPill tone="danger" size="sm">
          Open
        </StatusPill>
      </div>
      <h2 className="font-heading text-[17px] leading-tight font-semibold tracking-[-0.02em] text-pretty">
        SQL injection in login handler
      </h2>
      <div className="font-mono text-[10.5px] text-muted-foreground">
        192.0.2.180:443 · Aug 6 · CVE-2026-1043
      </div>
    </DetailSidebarHeader>

    <DetailSidebarBody>
      <DetailSidebarSection label="Description">
        <p className="text-[13px] leading-relaxed text-pretty">
          The login handler concatenates the username parameter into a SQL
          statement. A crafted value returns database errors and allows
          boolean-based extraction.
        </p>
      </DetailSidebarSection>
      <DetailSidebarSection label="Remediation">
        <p className="text-[13px] leading-relaxed text-pretty">
          Use parameterized queries for all statements in the auth module.
        </p>
      </DetailSidebarSection>
    </DetailSidebarBody>
  </>
)

/**
 * The panel overlays the page — the content behind it stays readable and
 * clickable. Try the button underneath while the panel is open.
 */
export const Open: Story = {
  render: function Render(args) {
    const [open, setOpen] = React.useState(true)
    return (
      <div className="min-h-[28rem] bg-background p-6 text-foreground">
        <p className="mb-4 text-sm text-muted-foreground">
          This page is NOT inert while the panel is open.
        </p>
        <Button variant="outline" onClick={() => setOpen(true)}>
          Background control
        </Button>
        <DetailSidebar {...args} open={open} onClose={() => setOpen(false)}>
          {detail(() => setOpen(false))}
        </DetailSidebar>
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const panel = canvas.getByRole("complementary", { name: "Finding detail" })
    await expect(panel).toBeInTheDocument()
    // Non-modal: the page behind stays reachable. A Dialog would fail this.
    await expect(
      canvas.getByRole("button", { name: "Background control" })
    ).toBeVisible()
  },
}

/** Esc closes it, from anywhere on the page — focus is not trapped inside. */
export const ClosesOnEscape: Story = {
  render: Open.render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole("complementary")).toBeInTheDocument()
    await userEvent.keyboard("{Escape}")
    await expect(canvas.queryByRole("complementary")).not.toBeInTheDocument()
  },
}

/** The close button is a labelled control, not an icon alone. */
export const ClosesOnButton: Story = {
  render: Open.render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: "Close detail" }))
    await expect(canvas.queryByRole("complementary")).not.toBeInTheDocument()
  },
}

export const Closed: Story = {
  args: { open: false },
  render: (args) => (
    <div className="min-h-[12rem] bg-background p-6 text-foreground">
      <DetailSidebar {...args}>{detail(() => {})}</DetailSidebar>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.queryByRole("complementary")).not.toBeInTheDocument()
  },
}
