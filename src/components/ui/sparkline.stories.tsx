import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { Sparkline } from "@/components/ui/sparkline"

const SERIES = [4, 8, 5, 9, 7, 12, 10, 14, 11, 16]

/**
 * Every story renders inside an explicit `.dark` surface so the AEGIS dark
 * theme (the design system's primary theme) is exercised.
 */
const meta = {
  title: "Components/Sparkline",
  component: Sparkline,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "inline-radio", options: ["line", "area", "bar"] },
    tone: {
      control: "inline-radio",
      options: ["accent", "neutral", "success", "warning", "danger", "info"],
    },
    width: { control: { type: "number" } },
    height: { control: { type: "number" } },
    strokeWidth: { control: { type: "number" } },
  },
  args: {
    data: SERIES,
    variant: "line",
    tone: "accent",
    label: "Requests over the last 10 days",
  },
  decorators: [
    (Story) => (
      <div className="dark bg-background text-foreground flex min-h-24 items-center justify-center gap-3 p-10">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Sparkline>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const chart = canvas.getByRole("img", {
      name: "Requests over the last 10 days",
    })
    await expect(chart).toBeInTheDocument()
    await expect(chart.querySelector("[data-slot=sparkline-line]")).not.toBeNull()
  },
}

export const Variants: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <Sparkline data={SERIES} variant="line" label="Line" />
      <Sparkline data={SERIES} variant="area" label="Area" />
      <Sparkline data={SERIES} variant="bar" label="Bar" />
    </div>
  ),
}

export const Tones: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <Sparkline data={SERIES} tone="accent" variant="area" label="Accent" />
      <Sparkline data={SERIES} tone="success" variant="area" label="Success" />
      <Sparkline data={SERIES} tone="warning" variant="area" label="Warning" />
      <Sparkline data={SERIES} tone="danger" variant="area" label="Danger" />
    </div>
  ),
}

export const InlineWithValue: Story = {
  render: () => (
    <div className="flex items-baseline gap-2 text-foreground">
      <span className="text-2xl font-semibold tabular-nums">1,284</span>
      <Sparkline
        data={SERIES}
        tone="success"
        width={64}
        height={20}
        aria-hidden
      />
      <span className="text-success text-sm font-medium">+12%</span>
    </div>
  ),
}

export const Empty: Story = {
  args: { data: [], label: "No data" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const chart = canvas.getByRole("img", { name: "No data" })
    await expect(chart).toHaveAttribute("data-empty")
  },
}
