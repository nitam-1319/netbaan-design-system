import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { TrendBars } from "@/components/ui/trend-bars"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */

const MONTHS = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"]

const rising = [12, 14, 11, 18, 17, 21, 19, 24, 22, 26, 31, 29]

const meta = {
  title: "Components/TrendBars",
  component: TrendBars,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    emphasis: { control: "inline-radio", options: ["last", "none"] },
  },
  args: {
    label: "Findings over time",
    data: MONTHS.map((label, i) => ({ label, value: rising[i] })),
  },
} satisfies Meta<typeof TrendBars>

export default meta
type Story = StoryObj<typeof meta>

export const TwelveMonths: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole("img", { name: "Findings over time" })).toBeInTheDocument()
    // The screen-reader equivalent carries every period's value.
    await expect(canvas.getByText("May: 29")).toBeInTheDocument()
  },
}

/** No period is privileged — a distribution rather than a "where we are now". */
export const NoEmphasis: Story = {
  args: { emphasis: "none" },
}

/** Zero periods keep their 6px floor: a gap would read as missing data. */
export const WithZeroPeriods: Story = {
  args: {
    data: MONTHS.slice(0, 6).map((label, i) => ({ label, value: [0, 0, 3, 0, 7, 2][i] })),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("Jun: 0")).toBeInTheDocument()
  },
}

/** A short series still fills the strip — the columns share the width. */
export const ShortSeries: Story = {
  args: {
    data: [
      { label: "Mar", value: 4 },
      { label: "Apr", value: 9 },
      { label: "May", value: 6 },
    ],
  },
}

/** All-equal values draw a flat strip rather than collapsing to the floor. */
export const Flat: Story = {
  args: {
    data: MONTHS.slice(0, 8).map((label) => ({ label, value: 5 })),
  },
}
