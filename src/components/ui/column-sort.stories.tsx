import type { Meta, StoryObj } from "@storybook/react-vite"
import * as React from "react"
import { expect, userEvent, waitFor, within } from "storybook/test"

import {
  SortableColumnHeader,
  useColumnSort,
} from "@/components/ui/column-sort"
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
  title: "Components/ColumnSort",
  component: SortableColumnHeader,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
} satisfies Meta<typeof SortableColumnHeader>

export default meta
type Story = StoryObj<typeof meta>

type Person = { id: string; name: string; role: string; commits: number }

const PEOPLE: Person[] = [
  { id: "1", name: "Ada Lovelace", role: "Engineer", commits: 42 },
  { id: "2", name: "Grace Hopper", role: "Admiral", commits: 128 },
  { id: "3", name: "Alan Turing", role: "Researcher", commits: 87 },
  { id: "4", name: "Edith Clarke", role: "Engineer", commits: 15 },
]

const COMPARATORS = {
  name: (r: Person) => r.name,
  role: (r: Person) => r.role,
  commits: (r: Person) => r.commits,
}

function SortableTable() {
  const { getDirection, toggle, sortRows } = useColumnSort<Person>()
  const rows = sortRows(PEOPLE, COMPARATORS)
  return (
    <Table>
      <caption className="sr-only">People sorted by column</caption>
      <TableHeader>
        <TableRow>
          <SortableColumnHeader
            label="Name"
            direction={getDirection("name")}
            onSort={() => toggle("name")}
          />
          <SortableColumnHeader
            label="Role"
            direction={getDirection("role")}
            onSort={() => toggle("role")}
          />
          <SortableColumnHeader
            label="Commits"
            align="end"
            direction={getDirection("commits")}
            onSort={() => toggle("commits")}
          />
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((p) => (
          <TableRow key={p.id}>
            <TableCell>{p.name}</TableCell>
            <TableCell>{p.role}</TableCell>
            <TableCell data-align="end">
              <div className="text-end tabular-nums">{p.commits}</div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export const Default: Story = {
  render: () => <SortableTable />,
}

export const Ascending: Story = {
  render: () => (
    <Table>
      <caption className="sr-only">Sorted ascending demo</caption>
      <TableHeader>
        <TableRow>
          <SortableColumnHeader label="Name" direction="asc" onSort={() => {}} />
          <SortableColumnHeader label="Role" direction={false} onSort={() => {}} />
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Ada Lovelace</TableCell>
          <TableCell>Engineer</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
}

export const Descending: Story = {
  render: () => (
    <Table>
      <caption className="sr-only">Sorted descending demo</caption>
      <TableHeader>
        <TableRow>
          <SortableColumnHeader label="Commits" align="end" direction="desc" onSort={() => {}} />
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell data-align="end">
            <div className="text-end tabular-nums">128</div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
}

export const Interactive: Story = {
  render: () => <SortableTable />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const commits = canvas.getByRole("button", { name: "Sort by Commits" })
    const header = () => commits.closest("th") as HTMLTableCellElement

    // Unsorted → ascending.
    await expect(header()).toHaveAttribute("aria-sort", "none")
    await userEvent.click(commits)
    await waitFor(() => expect(header()).toHaveAttribute("aria-sort", "ascending"))

    // First row is now the smallest commit count.
    await waitFor(() => {
      const firstRow = canvas.getAllByRole("row")[1]
      expect(within(firstRow).getByText("15")).toBeInTheDocument()
    })

    // Ascending → descending.
    await userEvent.click(commits)
    await waitFor(() => expect(header()).toHaveAttribute("aria-sort", "descending"))
    await waitFor(() => {
      const firstRow = canvas.getAllByRole("row")[1]
      expect(within(firstRow).getByText("128")).toBeInTheDocument()
    })

    // Descending → unsorted.
    await userEvent.click(commits)
    await waitFor(() => expect(header()).toHaveAttribute("aria-sort", "none"))
  },
}
