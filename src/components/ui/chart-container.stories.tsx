import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import {
  ChartContainer,
  ChartPlot,
  useChart,
} from "@/components/ui/chart-container"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar — stories do not hardcode a `.dark` wrapper. Demo marks are plain SVG
 * that read the shared geometry via `useChart()`, so no `className` is ever
 * passed to an AEGIS component.
 */
const meta = {
  title: "Components/ChartContainer",
  component: ChartContainer,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
    width: { control: { type: "number" } },
    height: { control: { type: "number" } },
  },
  args: {
    label: "Weekly signups",
    width: 640,
    height: 320,
  },
} satisfies Meta<typeof ChartContainer>

export default meta
type Story = StoryObj<typeof meta>

const SAMPLE = [12, 19, 9, 24, 18, 27, 21]

/** A minimal bar mark that reads the plot geometry + series colour from context. */
function DemoBars({ data, seriesKey = "signups" }: { data: number[]; seriesKey?: string }) {
  const { innerWidth, innerHeight, seriesByKey, series } = useChart()
  const color = seriesByKey[seriesKey]?.colorVar ?? series[0]?.colorVar ?? "var(--color-chart-1)"
  const max = Math.max(...data, 1)
  const gap = 8
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

/** A minimal line mark reading the same geometry. */
function DemoLine({ data, seriesKey = "trend" }: { data: number[]; seriesKey?: string }) {
  const { innerWidth, innerHeight, seriesByKey } = useChart()
  const color = seriesByKey[seriesKey]?.colorVar ?? "var(--color-chart-4)"
  const max = Math.max(...data, 1)
  const step = innerWidth / (data.length - 1)
  const d = data
    .map((v, i) => `${i === 0 ? "M" : "L"}${i * step},${innerHeight - (v / max) * innerHeight}`)
    .join(" ")
  return <path d={d} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
}

export const Default: Story = {
  args: {
    series: [{ key: "signups", label: "Signups" }],
  },
  render: (args) => (
    <ChartContainer {...args}>
      <ChartPlot>
        <DemoBars data={SAMPLE} />
      </ChartPlot>
    </ChartContainer>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const region = canvas.getByRole("group", { name: "Weekly signups" })
    await expect(region).toBeInTheDocument()
    const img = canvas.getByRole("img", { name: "Weekly signups" })
    await expect(img).toBeInTheDocument()
    await expect(img).toHaveAttribute("viewBox", "0 0 640 320")
    // seven bars drawn inside the plot area
    await expect(img.querySelectorAll("rect")).toHaveLength(7)
  },
}

/** The palette auto-assigns one of the five chart tokens per series. */
export const Palette: Story = {
  args: {
    label: "Palette",
    height: 120,
    series: [
      { key: "a" },
      { key: "b" },
      { key: "c" },
      { key: "d" },
      { key: "e" },
    ],
  },
  render: (args) => (
    <ChartContainer {...args}>
      <ChartPlot>
        <PaletteSwatches />
      </ChartPlot>
    </ChartContainer>
  ),
}

function PaletteSwatches() {
  const { innerWidth, innerHeight, series } = useChart()
  const gap = 12
  const w = (innerWidth - gap * (series.length - 1)) / series.length
  return (
    <g>
      {series.map((s, i) => (
        <rect
          key={s.key}
          x={i * (w + gap)}
          y={0}
          width={w}
          height={innerHeight}
          rx={6}
          fill={s.colorVar}
        />
      ))}
    </g>
  )
}

/** Two series share the same coordinate space; each keeps its palette colour. */
export const MultiSeries: Story = {
  args: {
    label: "Signups vs. trend",
    series: [
      { key: "signups", label: "Signups", color: 1 },
      { key: "trend", label: "7-day avg", color: 4 },
    ],
  },
  render: (args) => (
    <ChartContainer {...args}>
      <ChartPlot>
        <DemoBars data={SAMPLE} />
        <DemoLine data={SAMPLE} />
      </ChartPlot>
    </ChartContainer>
  ),
}

/** Custom margins widen the left gutter (e.g. for long y-axis labels). */
export const CustomMargin: Story = {
  args: {
    label: "Wide gutter",
    margin: { left: 72, right: 24, top: 24, bottom: 40 },
    series: [{ key: "signups" }],
  },
  render: (args) => (
    <ChartContainer {...args}>
      <ChartPlot>
        <DemoBars data={SAMPLE} />
      </ChartPlot>
    </ChartContainer>
  ),
}
