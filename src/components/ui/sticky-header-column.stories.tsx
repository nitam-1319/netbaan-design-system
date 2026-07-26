import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import {
  StickyTable,
  StickyTableHeader,
  StickyTableBody,
  StickyTableRow,
  StickyTableHead,
  StickyTableCell,
} from "@/components/ui/sticky-header-column"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */
const meta = {
  title: "Components/StickyTable",
  component: StickyTable,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    maxHeight: { control: { type: "number" } },
  },
} satisfies Meta<typeof StickyTable>

export default meta
type Story = StoryObj<typeof meta>

const cols = ["Region", "Requests", "Errors", "p95 (ms)", "Uptime"]
const data = Array.from({ length: 24 }, (_, i) => ({
  host: `edge-${String(i + 1).padStart(2, "0")}`,
  region: i % 2 ? "us-east-1" : "eu-west-1",
  requests: (1200 + i * 37).toLocaleString(),
  errors: i % 5,
  p95: 60 + (i % 7) * 4,
  uptime: `${(99.9 - (i % 3) * 0.1).toFixed(1)}%`,
}))

export const HeaderAndColumn: Story = {
  args: { maxHeight: 300 },
  render: (args) => (
    <div style={{ maxWidth: 720 }}>
      <StickyTable maxHeight={args.maxHeight}>
        <StickyTableHeader>
          <StickyTableRow>
            <StickyTableHead sticky>Host</StickyTableHead>
            {cols.map((c) => (
              <StickyTableHead key={c}>{c}</StickyTableHead>
            ))}
          </StickyTableRow>
        </StickyTableHeader>
        <StickyTableBody>
          {data.map((r) => (
            <StickyTableRow key={r.host}>
              <StickyTableCell sticky>{r.host}</StickyTableCell>
              <StickyTableCell>{r.region}</StickyTableCell>
              <StickyTableCell>{r.requests}</StickyTableCell>
              <StickyTableCell>{r.errors}</StickyTableCell>
              <StickyTableCell>{r.p95}</StickyTableCell>
              <StickyTableCell>{r.uptime}</StickyTableCell>
            </StickyTableRow>
          ))}
        </StickyTableBody>
      </StickyTable>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Header cells are present and the leading column is marked sticky.
    const hostHead = canvas.getByRole("columnheader", { name: "Host" })
    expect(hostHead).toHaveAttribute("data-sticky", "true")
    // Body sticky column cells carry the sticky marker.
    const firstCell = canvas.getByText("edge-01")
    expect(firstCell).toHaveAttribute("data-sticky", "true")
    // Non-sticky cells do not.
    const region = canvas.getAllByText("eu-west-1")[0]
    expect(region).not.toHaveAttribute("data-sticky")
  },
}

export const HeaderOnly: Story = {
  args: { maxHeight: 260 },
  render: (args) => (
    <div style={{ maxWidth: 640 }}>
      <StickyTable maxHeight={args.maxHeight}>
        <StickyTableHeader>
          <StickyTableRow>
            <StickyTableHead>Host</StickyTableHead>
            {cols.map((c) => (
              <StickyTableHead key={c}>{c}</StickyTableHead>
            ))}
          </StickyTableRow>
        </StickyTableHeader>
        <StickyTableBody>
          {data.map((r) => (
            <StickyTableRow key={r.host}>
              <StickyTableCell>{r.host}</StickyTableCell>
              <StickyTableCell>{r.region}</StickyTableCell>
              <StickyTableCell>{r.requests}</StickyTableCell>
              <StickyTableCell>{r.errors}</StickyTableCell>
              <StickyTableCell>{r.p95}</StickyTableCell>
              <StickyTableCell>{r.uptime}</StickyTableCell>
            </StickyTableRow>
          ))}
        </StickyTableBody>
      </StickyTable>
    </div>
  ),
}
