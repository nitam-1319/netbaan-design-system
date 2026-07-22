import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"

import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"

/* --------------------------------------------------------------- fixtures -- */

type Asset = {
  id: string
  host: string
  type: string
  severity: "critical" | "high" | "medium" | "low"
  findings: number
}

const ASSETS: Asset[] = [
  { id: "a1", host: "api.netbaan.io", type: "API", severity: "critical", findings: 12 },
  { id: "a2", host: "www.netbaan.io", type: "Web", severity: "high", findings: 7 },
  { id: "a3", host: "vpn.netbaan.io", type: "Network", severity: "medium", findings: 3 },
  { id: "a4", host: "mail.netbaan.io", type: "Mail", severity: "low", findings: 1 },
  { id: "a5", host: "db.netbaan.io", type: "Database", severity: "high", findings: 9 },
]

const severityVariant: Record<Asset["severity"], React.ComponentProps<typeof Badge>["variant"]> = {
  critical: "destructive",
  high: "warning",
  medium: "secondary",
  low: "muted",
}

const columns: DataTableColumn<Asset>[] = [
  {
    id: "host",
    header: "Host",
    cell: (row) => <span className="font-medium">{row.host}</span>,
    sortable: true,
    sortValue: (row) => row.host,
  },
  {
    id: "type",
    header: "Type",
    cell: (row) => row.type,
    sortable: true,
    sortValue: (row) => row.type,
  },
  {
    id: "severity",
    header: "Severity",
    cell: (row) => <Badge variant={severityVariant[row.severity]}>{row.severity}</Badge>,
    sortable: true,
    sortValue: (row) => row.severity,
  },
  {
    id: "findings",
    header: "Findings",
    align: "end",
    cell: (row) => row.findings,
    sortable: true,
    sortValue: (row) => row.findings,
  },
]

const getRowId = (row: Asset) => row.id

const meta = {
  title: "Components/DataTable",
  component: DataTable<Asset>,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof DataTable<Asset>>

export default meta
type Story = StoryObj<typeof meta>

/* ----------------------------------------------------------------- stories -- */

export const Filled: Story = {
  args: {
    columns,
    data: ASSETS,
    getRowId,
    caption: "Discovered assets and their open findings",
  },
}

export const Sortable: Story = {
  args: {
    columns,
    data: ASSETS,
    getRowId,
    caption: "Assets sortable by column",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const sortHost = canvas.getByRole("button", { name: /sort by host/i })
    const header = sortHost.closest("th")
    await expect(header).toHaveAttribute("aria-sort", "none")
    await userEvent.click(sortHost)
    await expect(header).toHaveAttribute("aria-sort", "ascending")
    await userEvent.click(sortHost)
    await expect(header).toHaveAttribute("aria-sort", "descending")
  },
}

export const Selectable: Story = {
  args: {
    columns,
    data: ASSETS,
    getRowId,
    caption: "Assets with row selection",
    selectable: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const selectAll = canvas.getByRole("checkbox", { name: /select all rows/i })
    await expect(selectAll).toHaveAttribute("aria-checked", "false")
    await userEvent.click(selectAll)
    await expect(selectAll).toHaveAttribute("aria-checked", "true")
    const rowBoxes = canvas.getAllByRole("checkbox", { name: /select row/i })
    await expect(rowBoxes).toHaveLength(ASSETS.length)
    for (const box of rowBoxes) {
      await expect(box).toHaveAttribute("aria-checked", "true")
    }
  },
}

export const Compact: Story = {
  args: {
    columns,
    data: ASSETS,
    getRowId,
    caption: "Assets in compact density",
    density: "compact",
    selectable: true,
  },
}

export const Loading: Story = {
  args: {
    columns,
    data: [],
    getRowId,
    caption: "Assets loading",
    loading: true,
    selectable: true,
  },
}

export const Empty: Story = {
  args: {
    columns,
    data: [],
    getRowId,
    caption: "No assets discovered",
    emptyTitle: "No assets found",
    emptyDescription: "Run a discovery scan to populate this table.",
  },
}

export const ErrorState: Story = {
  args: {
    columns,
    data: [],
    getRowId,
    caption: "Assets failed to load",
    error: true,
    onRetry: () => {},
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole("alert")).toBeInTheDocument()
    await expect(canvas.getByRole("button", { name: /try again/i })).toBeInTheDocument()
  },
}

export const WithToolbarAndFooter: Story = {
  args: {
    columns,
    data: ASSETS,
    getRowId,
    caption: "Assets with a toolbar and footer",
    selectable: true,
    toolbar: <span className="text-sm text-muted-foreground">5 assets</span>,
    footer: <span className="text-sm text-muted-foreground">Page 1 of 1</span>,
  },
}
