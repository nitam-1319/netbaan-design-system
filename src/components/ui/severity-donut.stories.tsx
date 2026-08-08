import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { SeverityDonut } from "@/components/ui/severity-donut"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */

const meta = {
  title: "Components/SeverityDonut",
  component: SeverityDonut,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: [58, 84] },
    palette: { control: "inline-radio", options: ["severity", "categorical"] },
  },
  args: {
    counts: { critical: 2, high: 3, medium: 4, low: 2, info: 3 },
    chartLabel: "Findings by severity",
  },
} satisfies Meta<typeof SeverityDonut>

export default meta
type Story = StoryObj<typeof meta>

export const Card: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole("img", { name: "Findings by severity" })).toBeInTheDocument()
    await expect(canvas.getByText("14")).toBeInTheDocument()
  },
}

export const Summary: Story = {
  args: { size: 84, label: "Total" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("Total")).toBeInTheDocument()
  },
}

/** Zero rungs leave the ring entirely — the legend beside it still lists them. */
export const ZeroRungsOmitted: Story = {
  args: { counts: { critical: 0, high: 4, medium: 0, low: 2, info: 0 } },
  play: async ({ canvasElement }) => {
    // Two non-zero rungs → exactly two wedges.
    const paths = canvasElement.querySelectorAll("path[data-severity]")
    await expect(paths).toHaveLength(2)
  },
}

/** A lone rung draws a full ring with NO gap — a notch would read as missing data. */
export const SingleSeverityNoGap: Story = {
  args: { counts: { critical: 0, high: 7, medium: 0, low: 0, info: 0 } },
  play: async ({ canvasElement }) => {
    const paths = canvasElement.querySelectorAll("path[data-severity]")
    await expect(paths).toHaveLength(1)
  },
}

/** Nothing found yet: no wedges, and the hole still reads zero. */
export const AllClear: Story = {
  args: { counts: { critical: 0, high: 0, medium: 0, low: 0, info: 0 } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvasElement.querySelectorAll("path[data-severity]")).toHaveLength(0)
    await expect(canvas.getByText("0")).toBeInTheDocument()
  },
}

/**
 * The reported bug: at a fixed size, three- and four-digit totals overflowed the
 * hole and pushed the card taller. The label steps down instead — these are the
 * spec's acceptance values.
 */
export const CentreLabelFit: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
      {[7, 21, 146, 1284, 23025].map((total) => (
        <SeverityDonut key={total} {...args} total={total} />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // 1,284 formats to five characters and must still fit the 26px hole.
    await expect(canvas.getByText("1,284")).toBeInTheDocument()
    await expect(canvas.getByText("23,025")).toBeInTheDocument()
  },
}

export const CentreLabelFitSummary: Story = {
  args: { size: 84, label: "Total" },
  render: (args) => (
    <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
      {[7, 146, 1284, 23025].map((total) => (
        <SeverityDonut key={total} {...args} total={total} />
      ))}
    </div>
  ),
}

/** Status breakdowns take the categorical palette, never the severity ramp. */
export const CategoricalPalette: Story = {
  args: { palette: "categorical", size: 84, label: "Status" },
}
