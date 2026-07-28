import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect } from "storybook/test"

import { Grid } from "@/components/ui/grid"

const meta = {
  title: "Components/Grid",
  component: Grid,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[28rem] p-10 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Grid>

export default meta
type Story = StoryObj<typeof meta>

const Cell = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-surface-2 border-border rounded-md border px-3 py-4 text-center text-sm">
    {children}
  </div>
)

export const ThreeColumns: Story = {
  render: () => (
    <Grid cols={3} gap="md">
      <Cell>Critical</Cell>
      <Cell>High</Cell>
      <Cell>Medium</Cell>
      <Cell>Low</Cell>
      <Cell>Info</Cell>
      <Cell>Total</Cell>
    </Grid>
  ),
  play: async ({ canvasElement }) => {
    const grid = canvasElement.querySelector("[data-slot='grid']")
    await expect(grid).toBeInTheDocument()
    await expect(grid).toHaveClass("grid-cols-3")
  },
}

export const ColumnFlow: Story = {
  render: () => (
    <Grid cols={3} flow="column" gap="sm">
      <Cell>Assets</Cell>
      <Cell>Findings</Cell>
      <Cell>Hosts</Cell>
      <Cell>Certs</Cell>
    </Grid>
  ),
  play: async ({ canvasElement }) => {
    const grid = canvasElement.querySelector("[data-slot='grid']")
    await expect(grid).toHaveClass("grid-flow-col")
  },
}

export const Alignment: Story = {
  render: () => (
    <Grid cols={3} gap="md" align="center">
      <Cell>Short</Cell>
      <div className="bg-surface-2 border-border rounded-md border px-3 py-8 text-center text-sm">
        Tall
      </div>
      <Cell>Short</Cell>
    </Grid>
  ),
  play: async ({ canvasElement }) => {
    const grid = canvasElement.querySelector("[data-slot='grid']")
    await expect(grid).toHaveClass("items-center")
  },
}

export const TwelveColumn: Story = {
  render: () => (
    <Grid cols={12} gap="sm">
      <div className="bg-primary/20 border-border col-span-8 rounded-md border px-3 py-4 text-center text-sm">
        col-span-8
      </div>
      <div className="bg-surface-3 border-border col-span-4 rounded-md border px-3 py-4 text-center text-sm">
        col-span-4
      </div>
    </Grid>
  ),
  play: async ({ canvasElement }) => {
    const grid = canvasElement.querySelector("[data-slot='grid']")
    await expect(grid).toHaveClass("grid-cols-12")
  },
}
