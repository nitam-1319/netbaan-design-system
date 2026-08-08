import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { BreakdownDonut } from "@/components/ui/breakdown-donut"

const SEVERITY = [
  { key: "critical", label: "Critical", value: 218 },
  { key: "high", label: "High", value: 604 },
  { key: "medium", label: "Medium", value: 1187 },
  { key: "low", label: "Low", value: 942 },
  { key: "info", label: "Info", value: 461 },
]

const STATUS = [
  { key: "open", label: "Open", value: 1493 },
  { key: "in_progress", label: "In progress", value: 528 },
  { key: "fixed", label: "Fixed", value: 1102 },
  { key: "accepted_risk", label: "Accepted", value: 289 },
]

const meta = {
  title: "Components/BreakdownDonut",
  component: BreakdownDonut,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    palette: { control: "inline-radio", options: ["severity", "categorical"] },
    size: { control: "inline-radio", options: ["sm", "md"] },
    swatch: { control: "inline-radio", options: ["square", "dot"] },
    legendColumns: { control: "inline-radio", options: [1, 2] },
  },
  args: {
    label: "Findings by severity",
    data: SEVERITY,
    palette: "severity",
    size: "sm",
    swatch: "square",
    legendColumns: 2,
    centerSublabel: "TOTAL",
  },
  decorators: [
    (Story) => (
      <div className="w-[26rem] max-w-full p-6 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BreakdownDonut>

export default meta
type Story = StoryObj<typeof meta>

export const Severity: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // The centre carries the summed total, not a per-slice figure.
    await expect(canvas.getByText("3,412")).toBeInTheDocument()
    await expect(canvas.getByText("Critical")).toBeInTheDocument()
  },
}

/** Statuses are NOT severities — the categorical ramp keeps them off the alarm hues. */
export const Status: Story = {
  args: {
    label: "Findings by status",
    data: STATUS,
    palette: "categorical",
    swatch: "dot",
    legendColumns: 1,
    centerSublabel: undefined,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("In progress")).toBeInTheDocument()
  },
}

/** A zero-count slice keeps its legend row — an absent status is information. */
export const WithZeroSlice: Story = {
  args: {
    data: [
      { key: "critical", label: "Critical", value: 12 },
      { key: "high", label: "High", value: 0 },
      { key: "medium", label: "Medium", value: 30 },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("0")).toBeInTheDocument()
    await expect(canvas.getByText("42")).toBeInTheDocument()
  },
}

/** A lone slice draws a closed ring — a single segment with a gap reads as missing data. */
export const SingleSlice: Story = {
  args: { data: [{ key: "info", label: "Info", value: 7 }] },
}

/** Nothing to show: the ring is empty and the total is zero, never blank. */
export const Empty: Story = {
  args: { data: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("0")).toBeInTheDocument()
  },
}

export const Large: Story = { args: { size: "md" } }
