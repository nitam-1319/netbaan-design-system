import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { AttentionTile } from "@/components/ui/attention-tile"
import { BreakdownDonut } from "@/components/ui/breakdown-donut"
import {
  SummaryStatBar,
  SummaryStatCell,
  SummaryStatValue,
} from "@/components/ui/summary-stat-bar"
import { VisuallyHidden } from "@/components/ui/visually-hidden"

const meta = {
  title: "Components/SummaryStatBar",
  component: SummaryStatBar,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
  args: { label: "Findings summary" },
  decorators: [
    (Story) => (
      <div className="p-6 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SummaryStatBar>

export default meta
type Story = StoryObj<typeof meta>

export const FourCells: Story = {
  args: {
    children: (
      <>
        <SummaryStatCell label="Total findings">
          <SummaryStatValue
            delta={
              <span className="text-sev-high-ink">
                ▲ 146 this week
                {/* Direction is spelled out — an arrow and a colour are both
                    invisible to a screen reader. */}
                <VisuallyHidden> (up)</VisuallyHidden>
              </span>
            }
          >
            3,412
          </SummaryStatValue>
        </SummaryStatCell>

        <SummaryStatCell label="By severity">
          <BreakdownDonut
            label="Findings by severity"
            centerSublabel="TOTAL"
            legendColumns={2}
            data={[
              { key: "critical", label: "Critical", value: 218 },
              { key: "high", label: "High", value: 604 },
              { key: "medium", label: "Medium", value: 1187 },
              { key: "low", label: "Low", value: 942 },
              { key: "info", label: "Info", value: 461 },
            ]}
          />
        </SummaryStatCell>

        <SummaryStatCell label="By status">
          <BreakdownDonut
            label="Findings by status"
            palette="categorical"
            swatch="dot"
            data={[
              { key: "open", label: "Open", value: 1493 },
              { key: "in_progress", label: "In progress", value: 528 },
              { key: "fixed", label: "Fixed", value: 1102 },
              { key: "accepted_risk", label: "Accepted", value: 289 },
            ]}
          />
        </SummaryStatCell>

        <SummaryStatCell label="Needs attention">
          <AttentionTile tone="critical" count={218}>
            Critical findings open
          </AttentionTile>
          <AttentionTile tone="high" count={87}>
            Likely exploited
          </AttentionTile>
        </SummaryStatCell>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole("region", { name: "Findings summary" })
    ).toBeInTheDocument()
    await expect(canvas.getByText("3,412")).toBeInTheDocument()
    await expect(canvas.getByText("(up)")).toBeInTheDocument()
  },
}

/** Two cells split the bar evenly; the rule always falls between them. */
export const TwoCells: Story = {
  args: {
    children: (
      <>
        <SummaryStatCell label="Assets in scope">
          <SummaryStatValue>1,204</SummaryStatValue>
        </SummaryStatCell>
        <SummaryStatCell label="Scanned this week">
          <SummaryStatValue>318</SummaryStatValue>
        </SummaryStatCell>
      </>
    ),
  },
}

/** Narrow cells fold to a grid rather than crushing. */
export const Narrow: Story = {
  args: {
    minCellWidth: 230,
    children: (
      <>
        <SummaryStatCell label="Total">
          <SummaryStatValue>3,412</SummaryStatValue>
        </SummaryStatCell>
        <SummaryStatCell label="Open">
          <SummaryStatValue>1,493</SummaryStatValue>
        </SummaryStatCell>
        <SummaryStatCell label="Fixed">
          <SummaryStatValue>1,102</SummaryStatValue>
        </SummaryStatCell>
      </>
    ),
  },
  decorators: [
    (Story) => (
      <div className="w-[30rem] max-w-full p-6 text-foreground">
        <Story />
      </div>
    ),
  ],
}
