import type { Meta, StoryObj } from "@storybook/react-vite"
import * as React from "react"
import { expect, userEvent, waitFor, within } from "storybook/test"

import {
  RowSelectionCell,
  RowSelectionHeader,
  useRowSelection,
} from "@/components/ui/row-selection"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */
const meta = {
  title: "Components/RowSelection",
  component: RowSelectionHeader,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
} satisfies Meta<typeof RowSelectionHeader>

export default meta
type Story = StoryObj<typeof meta>

type Invoice = { id: string; number: string; client: string }

const INVOICES: Invoice[] = [
  { id: "inv-1", number: "INV-1001", client: "Acme Corp" },
  { id: "inv-2", number: "INV-1002", client: "Globex" },
  { id: "inv-3", number: "INV-1003", client: "Initech" },
]

function SelectableTable() {
  const selection = useRowSelection()
  const allIds = INVOICES.map((i) => i.id)
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {selection.selectedCount} selected
      </p>
      <Table>
        <caption className="sr-only">Selectable invoices</caption>
        <TableHeader>
          <TableRow>
            <RowSelectionHeader
              state={selection.getToggleAllState(allIds)}
              onToggleAll={(checked) => selection.toggleAll(allIds, checked)}
            />
            <TableHead>Number</TableHead>
            <TableHead>Client</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {INVOICES.map((row) => {
            const selected = selection.isSelected(row.id)
            return (
              <TableRow key={row.id} data-state={selected ? "selected" : undefined}>
                <RowSelectionCell
                  selected={selected}
                  onSelectedChange={(checked) => selection.toggle(row.id, checked)}
                  label={`Select ${row.number}`}
                />
                <TableCell>{row.number}</TableCell>
                <TableCell>{row.client}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

export const Default: Story = {
  render: () => <SelectableTable />,
}

export const Interactive: Story = {
  render: () => <SelectableTable />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Select one row → its box is checked and the count updates.
    const first = canvas.getByRole("checkbox", { name: "Select INV-1001" })
    await userEvent.click(first)
    await waitFor(() => expect(first).toBeChecked())
    await waitFor(() => expect(canvas.getByText("1 selected")).toBeInTheDocument())

    // Select-all header selects every row.
    const selectAll = canvas.getByRole("checkbox", { name: "Select all rows" })
    await userEvent.click(selectAll)
    await waitFor(() => expect(canvas.getByText("3 selected")).toBeInTheDocument())
    await waitFor(() =>
      expect(canvas.getByRole("checkbox", { name: "Select INV-1003" })).toBeChecked()
    )

    // Toggle select-all off clears the selection.
    await userEvent.click(selectAll)
    await waitFor(() => expect(canvas.getByText("0 selected")).toBeInTheDocument())
  },
}
