import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { SeverityLegend } from "@/components/ui/severity-legend"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */

const LABELS = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
  info: "Info",
}

const meta = {
  title: "Components/SeverityLegend",
  component: SeverityLegend,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: {
    label: "Findings by severity",
    counts: { critical: 7, high: 12, medium: 19, low: 20, info: 24 },
    labels: LABELS,
  },
} satisfies Meta<typeof SeverityLegend>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("Critical")).toBeInTheDocument()
    await expect(canvas.getByText("7")).toBeInTheDocument()
  },
}

/** Zeros stay on the board — "no criticals" is the reassurance a reader wants. */
export const WithZeros: Story = {
  args: { counts: { critical: 0, high: 0, medium: 3, low: 8, info: 11 } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Both empty rungs still render, so the legend keeps a stable width.
    await expect(canvas.getAllByText("0")).toHaveLength(2)
  },
}

/** A freshly onboarded org: nothing found yet, every rung still named. */
export const AllClear: Story = {
  args: { counts: { critical: 0, high: 0, medium: 0, low: 0, info: 0 } },
}

/** Large tallies keep their digits — the count is mono and tabular, never clamped. */
export const LargeCounts: Story = {
  args: {
    counts: { critical: 128, high: 1402, medium: 3987, low: 512, info: 20486 },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("20486")).toBeInTheDocument()
  },
}
