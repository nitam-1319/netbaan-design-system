import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect } from "storybook/test"

import { CountUpTicker } from "@/components/ui/count-up-ticker"

const meta = {
  title: "Components/Count-up Ticker",
  component: CountUpTicker,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "inline-radio",
      options: ["sm", "md", "lg", "xl", "inherit"],
    },
    value: { control: "number" },
    duration: { control: "number" },
    decimals: { control: "number" },
  },
  args: {
    value: 1234,
    size: "xl",
    duration: 1200,
  },
  decorators: [
    (Story) => (
      <div className="p-8 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CountUpTicker>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector(
      '[data-slot="count-up-ticker"]'
    ) as HTMLElement | null
    await expect(root).toBeTruthy()
    // The final, correct value is always available to assistive tech (sr-only),
    // regardless of where the visible animation currently is.
    await expect(root?.textContent).toContain("1,234")
  },
}

export const Currency: Story = {
  args: { value: 48250, prefix: "$", size: "xl", decimals: 0 },
}

export const Percentage: Story = {
  args: { value: 87.4, suffix: "%", decimals: 1, size: "lg" },
}

export const FromNonZero: Story = {
  args: { value: 100, from: 60, suffix: " pts", size: "lg", duration: 1500 },
}

export const Inline: Story = {
  args: { size: "inherit" },
  render: () => (
    <p className="text-sm text-muted-foreground">
      You have{" "}
      <CountUpTicker
        value={2048}
        size="inherit"
      />{" "}
      credits remaining.
    </p>
  ),
}

export const KpiRow: Story = {
  render: () => (
    <div className="flex gap-8">
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">Revenue</span>
        <CountUpTicker value={48250} prefix="$" size="xl" />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">Uptime</span>
        <CountUpTicker value={99.98} suffix="%" decimals={2} size="xl" />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">Assets</span>
        <CountUpTicker value={12874} size="xl" />
      </div>
    </div>
  ),
}
