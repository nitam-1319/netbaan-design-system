import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import {
  ChartContainer,
  ChartPlot,
  useChart,
} from "@/components/ui/chart-container"
import { ChartLegend } from "@/components/ui/chart-legend"
import { Axis } from "@/components/ui/axis"

/**
 * Chart Legend reads the resolved series from `ChartContainer`, so its colours
 * and labels match the marks automatically. Theme and direction come from the
 * global Storybook toolbar.
 */
const meta = {
  title: "Components/ChartLegend",
  component: ChartLegend,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    size: { control: "inline-radio", options: ["sm", "md"] },
    shape: { control: "inline-radio", options: ["square", "dot", "line"] },
  },
} satisfies Meta<typeof ChartLegend>

export default meta
type Story = StoryObj<typeof meta>

const SERIES = [
  { key: "desktop", label: "Desktop", color: 1 as const },
  { key: "mobile", label: "Mobile", color: 4 as const },
  { key: "tablet", label: "Tablet", color: 3 as const },
]

const DATA: Record<string, number[]> = {
  desktop: [30, 42, 35, 50, 44, 58],
  mobile: [20, 25, 30, 28, 36, 40],
  tablet: [8, 10, 9, 14, 12, 16],
}

function DemoLines() {
  const { innerWidth, innerHeight, series } = useChart()
  const all = Object.values(DATA).flat()
  const max = Math.max(...all, 1)
  const step = innerWidth / (DATA.desktop.length - 1)
  return (
    <g>
      {series.map((s) => {
        const d = DATA[s.key]
          .map((v, i) => `${i === 0 ? "M" : "L"}${i * step},${innerHeight - (v / max) * innerHeight}`)
          .join(" ")
        return (
          <path
            key={s.key}
            d={d}
            fill="none"
            stroke={s.colorVar}
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )
      })}
    </g>
  )
}

export const Default: Story = {
  render: (args) => (
    <ChartContainer label="Sessions by device" series={SERIES}>
      <ChartLegend {...args} />
      <ChartPlot>
        <Axis orientation="left" domain={[0, 60]} showGrid />
        <DemoLines />
        <Axis orientation="bottom" categories={["Jan", "Feb", "Mar", "Apr", "May", "Jun"]} />
      </ChartPlot>
    </ChartContainer>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const legend = canvas.getByRole("list")
    await expect(legend).toBeInTheDocument()
    const items = within(legend).getAllByRole("listitem")
    await expect(items).toHaveLength(3)
    await expect(within(legend).getByText("Desktop")).toBeInTheDocument()
    await expect(within(legend).getByText("Mobile")).toBeInTheDocument()
  },
}

export const Shapes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <ChartContainer label="Square swatches" series={SERIES} height={40}>
        <ChartLegend shape="square" />
      </ChartContainer>
      <ChartContainer label="Dot swatches" series={SERIES} height={40}>
        <ChartLegend shape="dot" />
      </ChartContainer>
      <ChartContainer label="Line swatches" series={SERIES} height={40}>
        <ChartLegend shape="line" />
      </ChartContainer>
    </div>
  ),
}

export const Vertical: Story = {
  render: () => (
    <ChartContainer label="Vertical legend" series={SERIES} height={60}>
      <ChartLegend orientation="vertical" />
    </ChartContainer>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <ChartContainer label="Small" series={SERIES} height={40}>
        <ChartLegend size="sm" />
      </ChartContainer>
      <ChartContainer label="Medium" series={SERIES} height={40}>
        <ChartLegend size="md" />
      </ChartContainer>
    </div>
  ),
}
