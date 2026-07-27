import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fireEvent, waitFor, within } from "storybook/test"

import {
  VirtualizedGrid,
  type VirtualizedGridColumn,
} from "@/components/ui/virtualized-grid"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */

type Host = { id: string; name: string; ip: string; findings: number }

const DATA: Host[] = Array.from({ length: 1000 }, (_, i) => ({
  id: `h-${i}`,
  name: `host-${i}.example.com`,
  ip: `10.${Math.floor(i / 256)}.${i % 256}.1`,
  findings: (i * 7) % 50,
}))

const COLUMNS: VirtualizedGridColumn<Host>[] = [
  { id: "idx", header: "#", width: "64px", align: "end", cell: (_r, i) => i },
  { id: "name", header: "Host", cell: (r) => r.name },
  { id: "ip", header: "IP", width: "160px", cell: (r) => r.ip },
  { id: "findings", header: "Findings", width: "120px", align: "end", cell: (r) => r.findings },
]

// Fix the generic to `Host` via a TS instantiation expression so Storybook's
// arg/prop inference is concrete rather than `unknown`.
const HostGrid = VirtualizedGrid<Host>

const meta = {
  title: "Components/VirtualizedGrid",
  component: HostGrid,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    rowHeight: { control: { type: "number" } },
    visibleRows: { control: { type: "number" } },
    overscan: { control: { type: "number" } },
  },
  args: {
    columns: COLUMNS,
    data: DATA,
    getRowId: (r: Host) => r.id,
    label: "Hosts",
    rowHeight: 44,
    visibleRows: 8,
    overscan: 4,
  },
} satisfies Meta<typeof HostGrid>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <div style={{ maxWidth: 720 }}>
      <HostGrid {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const grid = canvas.getByRole("grid", { name: "Hosts" })
    // The grid advertises the FULL dataset size (1000 rows + 1 header).
    await expect(grid).toHaveAttribute("aria-rowcount", "1001")
    await expect(grid).toHaveAttribute("aria-colcount", "4")

    // The first row is materialised; a far-off row is NOT (virtualized).
    await expect(canvas.getByText("host-0.example.com")).toBeInTheDocument()
    await expect(canvas.queryByText("host-500.example.com")).not.toBeInTheDocument()

    // Scrolling brings a deep row into the window.
    const viewport = grid.querySelector(
      "[data-slot=virtualized-grid-viewport]"
    ) as HTMLElement
    viewport.scrollTop = 500 * 44
    fireEvent.scroll(viewport)
    await waitFor(() =>
      expect(canvas.getByText("host-500.example.com")).toBeInTheDocument()
    )
    // Its row carries the true 1-based aria-rowindex (500 + 2).
    const cell = canvas.getByText("host-500.example.com")
    await expect(cell.closest("[role=row]")).toHaveAttribute("aria-rowindex", "502")
  },
}

export const Empty: Story = {
  args: { data: [] },
  render: (args) => (
    <div style={{ maxWidth: 720 }}>
      <HostGrid {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("No rows")).toBeInTheDocument()
  },
}

export const Activatable: Story = {
  args: { onRowActivate: () => {}, visibleRows: 6 },
  render: (args) => (
    <div style={{ maxWidth: 720 }}>
      <HostGrid {...args} />
    </div>
  ),
}
