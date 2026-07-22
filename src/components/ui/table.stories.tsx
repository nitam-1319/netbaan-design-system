import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const meta = {
  title: "Components/Table",
  component: Table,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Table>

export default meta
type Story = StoryObj<typeof meta>

const findings = [
  { asset: "api-gw-prod.netbaan.io", severity: "Critical", cve: "CVE-2026-1043", status: "Open" },
  { asset: "cdn-edge-04.netbaan.io", severity: "High", cve: "CVE-2026-0912", status: "Open" },
  { asset: "auth.netbaan.io", severity: "Medium", cve: "CVE-2025-8871", status: "Triaged" },
  { asset: "static.netbaan.io", severity: "Low", cve: "CVE-2025-7710", status: "Resolved" },
]

export const Default: Story = {
  render: () => (
    <Table>
      <TableCaption>Active findings across monitored assets.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Asset</TableHead>
          <TableHead>Severity</TableHead>
          <TableHead>CVE</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {findings.map((f) => (
          <TableRow key={f.cve}>
            <TableCell>{f.asset}</TableCell>
            <TableCell>{f.severity}</TableCell>
            <TableCell>{f.cve}</TableCell>
            <TableCell>{f.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const table = canvas.getByRole("table")
    await expect(table).toBeVisible()
    // 4 column headers announce correctly.
    await expect(canvas.getAllByRole("columnheader")).toHaveLength(4)
    // Header row + 4 data rows.
    await expect(canvas.getAllByRole("row")).toHaveLength(5)
    await expect(
      canvas.getByRole("cell", { name: "api-gw-prod.netbaan.io" })
    ).toBeVisible()
  },
}

export const WithBadgesAndFooter: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Asset</TableHead>
          <TableHead>Severity</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {findings.map((f) => (
          <TableRow key={f.cve}>
            <TableCell>{f.asset}</TableCell>
            <TableCell>
              <Badge>{f.severity}</Badge>
            </TableCell>
            <TableCell>{f.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell>Total</TableCell>
          <TableCell>4 findings</TableCell>
          <TableCell>2 open</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
}

export const SelectedRow: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Asset</TableHead>
          <TableHead>CVE</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {findings.map((f, i) => (
          <TableRow key={f.cve} data-state={i === 1 ? "selected" : undefined}>
            <TableCell>{f.asset}</TableCell>
            <TableCell>{f.cve}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
}
