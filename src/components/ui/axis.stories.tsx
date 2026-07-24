import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import {
  ChartContainer,
  ChartPlot,
  useChart,
} from "@/components/ui/chart-container"
import { Axis } from "@/components/ui/axis"

/**
 * Axis renders inside a `ChartPlot` and reads the shared plot geometry via
 * `useChart()`. Theme (Light/Dark) and direction (LTR/RTL) come from the global
 * Storybook toolbar. Demo marks are plain SVG reading the same geometry, so no
 * `className` is passed to any AEGIS component.
 */
const meta = {
  title: "Components/Axis",
  component: Axis,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: "inline-radio",
      options: ["bottom", "left", "top", "right"],
    },
    tickCount: { control: { type: "number" } },
    tickSize: { control: { type: "number" } },
    showGrid: { control: "boolean" },
    showLine: { control: "boolean" },
    showTicks: { control: "boolean" },
    label: { control: "text" },
  },
} satisfies Meta<typeof Axis>

export default meta
type Story = StoryObj<typeof meta>

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
const VALUES = [18, 24, 15, 30, 27, 36]

function DemoBars({ data }: { data: number[] }) {
  const { innerWidth, innerHeight, series } = useChart()
  const color = series[0]?.colorVar ?? "var(--color-chart-1)"
  const max = Math.max(...data, 1)
  const gap = 12
  const barW = (innerWidth - gap * (data.length - 1)) / data.length
  return (
    <g>
      {data.map((v, i) => {
        const h = (v / max) * innerHeight
        return (
          <rect
            key={i}
            x={i * (barW + gap)}
            y={innerHeight - h}
            width={barW}
            height={h}
            rx={4}
            fill={color}
          />
        )
      })}
    </g>
  )
}

/** A category x-axis paired with a linear y-axis and gridlines. */
export const Default: Story = {
  args: { orientation: "bottom" },
  render: () => (
    <ChartContainer label="Revenue by month" series={[{ key: "rev" }]}>
      <ChartPlot>
        <Axis orientation="left" domain={[0, 40]} showGrid />
        <DemoBars data={VALUES} />
        <Axis orientation="bottom" categories={MONTHS} />
      </ChartPlot>
    </ChartContainer>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const img = canvas.getByRole("img", { name: "Revenue by month" })
    const bottom = img.querySelector("[data-slot=axis][data-orientation=bottom]")
    const left = img.querySelector("[data-slot=axis][data-orientation=left]")
    await expect(bottom).not.toBeNull()
    await expect(left).not.toBeNull()
    // Six category ticks on the x-axis.
    await expect(
      bottom!.querySelectorAll("[data-slot=axis-tick]")
    ).toHaveLength(6)
    // Gridlines drawn for the linear y-axis.
    await expect(
      left!.querySelectorAll("[data-slot=axis-grid]").length
    ).toBeGreaterThan(0)
  },
}

/** All four orientations around a single plot. */
export const Orientations: Story = {
  render: () => (
    <ChartContainer
      label="All axes"
      margin={{ top: 40, right: 56, bottom: 40, left: 56 }}
    >
      <ChartPlot>
        <Axis orientation="top" domain={[0, 100]} />
        <Axis orientation="right" domain={[0, 100]} />
        <Axis orientation="bottom" domain={[0, 100]} label="X value" />
        <Axis orientation="left" domain={[0, 100]} label="Y value" />
      </ChartPlot>
    </ChartContainer>
  ),
}

/** A linear axis with a value formatter (thousands) and gridlines. */
export const Formatted: Story = {
  render: () => (
    <ChartContainer label="Traffic" series={[{ key: "hits", color: 4 }]}>
      <ChartPlot>
        <Axis
          orientation="left"
          domain={[0, 4000]}
          tickCount={5}
          format={(v) => `${v / 1000}k`}
          showGrid
        />
        <DemoBars data={[3200, 2100, 3800, 1500, 2600, 3400]} />
        <Axis orientation="bottom" categories={MONTHS} />
      </ChartPlot>
    </ChartContainer>
  ),
}

/** Explicit ticks placed by 0–1 fraction from the data origin. */
export const ExplicitTicks: Story = {
  render: () => (
    <ChartContainer label="Explicit ticks">
      <ChartPlot>
        <Axis
          orientation="bottom"
          ticks={[
            { value: "start", position: 0 },
            { value: "¼", position: 0.25 },
            { value: "½", position: 0.5 },
            { value: "¾", position: 0.75 },
            { value: "end", position: 1 },
          ]}
          showGrid
        />
      </ChartPlot>
    </ChartContainer>
  ),
}
