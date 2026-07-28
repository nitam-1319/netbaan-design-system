import type { Meta, StoryObj } from "@storybook/react-vite"
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

function SelectableTable({
  defaultSelectedIds,
  disabled = false,
}: {
  defaultSelectedIds?: string[]
  disabled?: boolean
}) {
  const selection = useRowSelection({ defaultSelectedIds })
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
              disabled={disabled}
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
                  disabled={disabled}
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

const STUB_ARGS = {
  state: { checked: false, indeterminate: false },
  onToggleAll: () => {},
}

export const Default: Story = {
  args: STUB_ARGS,
  render: () => <SelectableTable />,
}

export const Interactive: Story = {
  args: STUB_ARGS,
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

/**
 * A partial (some-but-not-all) selection: the header box shows the tri-state
 * `indeterminate` (`aria-checked="mixed"`) treatment and the selected row picks
 * up the `Table`'s `data-[state=selected]:bg-accent-soft` surface.
 */
export const Indeterminate: Story = {
  args: STUB_ARGS,
  render: () => <SelectableTable defaultSelectedIds={["inv-1"]} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const selectAll = canvas.getByRole("checkbox", { name: "Select all rows" })
    await waitFor(() => expect(selectAll).toHaveAttribute("aria-checked", "mixed"))
    expect(canvas.getByText("1 selected")).toBeInTheDocument()
  },
}

/**
 * Disabled select-all and per-row boxes — e.g. while the table is loading or the
 * viewer lacks permission. A pre-selected row shows the disabled+checked box.
 */
export const Disabled: Story = {
  args: STUB_ARGS,
  render: () => <SelectableTable defaultSelectedIds={["inv-2"]} disabled />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // The boxes are custom <span role="checkbox"> controls disabled via
    // aria-disabled (jest-dom's toBeDisabled only recognises native form
    // controls), so assert the ARIA state instead.
    expect(canvas.getByRole("checkbox", { name: "Select all rows" })).toHaveAttribute(
      "aria-disabled",
      "true"
    )
    expect(canvas.getByRole("checkbox", { name: "Select INV-1001" })).toHaveAttribute(
      "aria-disabled",
      "true"
    )
  },
}
