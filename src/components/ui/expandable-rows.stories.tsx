import type { Meta, StoryObj } from "@storybook/react-vite"
import * as React from "react"
import { expect, userEvent, waitFor, within } from "storybook/test"

import { ExpandableRow } from "@/components/ui/expandable-rows"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */
const meta = {
  title: "Components/ExpandableRow",
  component: ExpandableRow,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md"] },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof ExpandableRow>

export default meta
type Story = StoryObj<typeof meta>

const rows = [
  { id: "SRV-1", host: "api-01.prod", status: "Healthy", detail: "Region eu-west-1 · uptime 42d · last scan passed with 0 findings." },
  { id: "SRV-2", host: "api-02.prod", status: "Degraded", detail: "Region us-east-1 · uptime 8d · 2 medium findings open, 1 in remediation." },
  { id: "SRV-3", host: "db-01.prod", status: "Healthy", detail: "Region eu-west-1 · uptime 120d · encrypted at rest, backups current." },
]

export const Default: Story = {
  args: { size: "md", detail: "", colSpan: 4 },
  render: (args) => (
    <div style={{ maxWidth: 640 }}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{""}</TableHead>
            <TableHead>Asset</TableHead>
            <TableHead>Host</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r, i) => (
            <ExpandableRow
              key={r.id}
              size={args.size}
              disabled={args.disabled}
              colSpan={4}
              defaultExpanded={i === 0}
              detail={r.detail}
            >
              <TableCell>{r.id}</TableCell>
              <TableCell>{r.host}</TableCell>
              <TableCell>{r.status}</TableCell>
            </ExpandableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  ),
}

export const Controlled: Story = {
  args: { detail: "", colSpan: 3 },
  render: () => {
    const [open, setOpen] = React.useState(false)
    return (
      <div style={{ maxWidth: 520 }}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{""}</TableHead>
              <TableHead>Finding</TableHead>
              <TableHead>Severity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <ExpandableRow
              colSpan={3}
              expanded={open}
              onExpandedChange={setOpen}
              detail="CVE-2024-0001 — outdated TLS cipher suite negotiated on the edge listener. Remediation: disable CBC ciphers, enforce TLS 1.3."
            >
              <TableCell>Weak cipher</TableCell>
              <TableCell>Medium</TableCell>
            </ExpandableRow>
          </TableBody>
        </Table>
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const toggle = canvas.getByRole("button", { name: "Toggle row details" })
    expect(toggle).toHaveAttribute("aria-expanded", "false")
    await userEvent.click(toggle)
    await waitFor(() => expect(toggle).toHaveAttribute("aria-expanded", "true"))
    const panelId = toggle.getAttribute("aria-controls")
    expect(panelId).toBeTruthy()
    const panel = canvasElement.querySelector(`#${CSS.escape(panelId!)}`)
    expect(panel).toHaveAttribute("data-state", "expanded")
  },
}
