import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { ChartContainer } from "@/components/ui/chart-container"
import { ChartTooltip } from "@/components/ui/chart-tooltip"

/**
 * Chart Tooltip is the presentational surface; a chart positions it on hover.
 * It reads the resolved series from `ChartContainer`, so passing a series `key`
 * fills in the colour and label. Theme and direction come from the global
 * Storybook toolbar. Stories render it statically inside a container.
 */
const meta = {
  title: "Components/ChartTooltip",
  component: ChartTooltip,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
    size: { control: "inline-radio", options: ["sm", "md"] },
    indicator: { control: "inline-radio", options: ["dot", "square", "line"] },
  },
} satisfies Meta<typeof ChartTooltip>

export default meta
type Story = StoryObj<typeof meta>

const SERIES = [
  { key: "desktop", label: "Desktop", color: 1 as const },
  { key: "mobile", label: "Mobile", color: 4 as const },
  { key: "tablet", label: "Tablet", color: 3 as const },
]

export const Default: Story = {
  args: {
    label: "March",
    items: [
      { key: "desktop", value: "1,204" },
      { key: "mobile", value: "842" },
      { key: "tablet", value: "196" },
    ],
  },
  render: (args) => (
    <ChartContainer label="Sessions by device" series={SERIES} height={40}>
      <ChartTooltip {...args} />
    </ChartContainer>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const tip = canvas.getByRole("tooltip")
    await expect(tip).toBeInTheDocument()
    await expect(within(tip).getByText("March")).toBeInTheDocument()
    const rows = within(tip).getAllByRole("listitem")
    await expect(rows).toHaveLength(3)
    await expect(within(tip).getByText("Desktop")).toBeInTheDocument()
    await expect(within(tip).getByText("1,204")).toBeInTheDocument()
  },
}

/** Rows without a series `key` use their own label/value and no swatch. */
export const NoSwatch: Story = {
  args: {
    label: "Total",
    items: [
      { label: "Requests", value: "48,120" },
      { label: "Errors", value: "312" },
      { label: "Error rate", value: "0.65%" },
    ],
  },
  render: (args) => (
    <ChartContainer label="Request summary" series={[]} height={40}>
      <ChartTooltip {...args} />
    </ChartContainer>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const tip = canvas.getByRole("tooltip")
    const rows = within(tip).getAllByRole("listitem")
    await expect(rows).toHaveLength(3)
    // Rows without a series `key`/`colorVar` render no swatch.
    await expect(
      tip.querySelectorAll('[data-slot="chart-tooltip-swatch"]')
    ).toHaveLength(0)
    await expect(within(tip).getByText("Error rate")).toBeInTheDocument()
    await expect(within(tip).getByText("0.65%")).toBeInTheDocument()
  },
}

export const Indicators: Story = {
  args: { items: [] },
  render: () => (
    <ChartContainer label="Indicators" series={SERIES} height={40}>
      <div style={{ display: "flex", gap: "1rem" }}>
        <ChartTooltip
          label="Dot"
          indicator="dot"
          items={[{ key: "desktop", value: "1,204" }, { key: "mobile", value: "842" }]}
        />
        <ChartTooltip
          label="Square"
          indicator="square"
          items={[{ key: "desktop", value: "1,204" }, { key: "mobile", value: "842" }]}
        />
        <ChartTooltip
          label="Line"
          indicator="line"
          items={[{ key: "desktop", value: "1,204" }, { key: "mobile", value: "842" }]}
        />
      </div>
    </ChartContainer>
  ),
}

export const Small: Story = {
  args: {
    size: "sm",
    label: "Q2",
    items: [
      { key: "desktop", value: "1,204" },
      { key: "mobile", value: "842" },
    ],
  },
  render: (args) => (
    <ChartContainer label="Compact tooltip" series={SERIES} height={40}>
      <ChartTooltip {...args} />
    </ChartContainer>
  ),
}
