import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"
import { Activity, ShieldAlert, Users } from "lucide-react"

import {
  StatTile,
  StatTileCaption,
  StatTileChart,
  StatTileDelta,
  StatTileHeader,
  StatTileIcon,
  StatTileLabel,
  StatTileUnit,
  StatTileValue,
} from "@/components/ui/stat-tile"
import { Sparkline } from "@/components/ui/sparkline"

/**
 * Theme (Light/Dark) and direction (English-LTR / Persian-RTL) come from the
 * global Storybook toolbar — stories never hard-code a `.dark` wrapper.
 */
const meta = {
  title: "Components/StatTile",
  component: StatTile,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
  args: {
    size: "md",
  },
} satisfies Meta<typeof StatTile>

export default meta
type Story = StoryObj<typeof meta>

const TREND = [12, 18, 15, 22, 19, 28, 26, 34]

export const Default: Story = {
  render: (args) => (
    <StatTile {...args}>
      <StatTileHeader>
        <StatTileLabel>Monthly active users</StatTileLabel>
        <StatTileIcon>
          <Users />
        </StatTileIcon>
      </StatTileHeader>
      <StatTileValue>
        48,271<StatTileUnit>users</StatTileUnit>
      </StatTileValue>
      <StatTileDelta trend="up">8.2%</StatTileDelta>
      <StatTileCaption>vs. previous 30 days</StatTileCaption>
    </StatTile>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("48,271")).toBeInTheDocument()
    // Trend direction is exposed to assistive tech, not by colour alone.
    await expect(canvas.getByText("Up")).toHaveClass("sr-only")
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-4">
      {(["sm", "md", "lg"] as const).map((size) => (
        <StatTile key={size} size={size}>
          <StatTileLabel>Requests / sec</StatTileLabel>
          <StatTileValue>2,940</StatTileValue>
          <StatTileDelta trend="up">3.1%</StatTileDelta>
        </StatTile>
      ))}
    </div>
  ),
}

/**
 * `trend` sets the arrow (direction); `sentiment` sets the colour (good/bad).
 * They are decoupled: a falling cost trends `down` but is `positive`.
 */
export const DeltaSentiment: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-4">
      <StatTile>
        <StatTileLabel>Revenue</StatTileLabel>
        <StatTileValue>$92.4k</StatTileValue>
        <StatTileDelta trend="up" sentiment="positive">
          12%
        </StatTileDelta>
      </StatTile>
      <StatTile>
        <StatTileLabel>Error rate</StatTileLabel>
        <StatTileValue>1.8%</StatTileValue>
        <StatTileDelta trend="up" sentiment="negative">
          0.4pp
        </StatTileDelta>
      </StatTile>
      <StatTile>
        <StatTileLabel>Cloud spend</StatTileLabel>
        <StatTileValue>$14.2k</StatTileValue>
        <StatTileDelta trend="down" sentiment="positive">
          6%
        </StatTileDelta>
      </StatTile>
      <StatTile>
        <StatTileLabel>Sessions</StatTileLabel>
        <StatTileValue>10,004</StatTileValue>
        <StatTileDelta trend="flat">0%</StatTileDelta>
      </StatTile>
    </div>
  ),
}

export const WithChart: Story = {
  render: (args) => (
    <StatTile {...args}>
      <StatTileHeader>
        <StatTileLabel>Throughput</StatTileLabel>
        <StatTileIcon>
          <Activity />
        </StatTileIcon>
      </StatTileHeader>
      <StatTileValue>
        34<StatTileUnit>k/min</StatTileUnit>
      </StatTileValue>
      <StatTileDelta trend="up" sentiment="positive">
        21%
      </StatTileDelta>
      <StatTileChart>
        <Sparkline data={TREND} variant="area" tone="success" width={180} />
      </StatTileChart>
    </StatTile>
  ),
}

export const DashboardGrid: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      <StatTile>
        <StatTileHeader>
          <StatTileLabel>Open findings</StatTileLabel>
          <StatTileIcon>
            <ShieldAlert />
          </StatTileIcon>
        </StatTileHeader>
        <StatTileValue>1,284</StatTileValue>
        <StatTileDelta trend="down" sentiment="positive">
          9%
        </StatTileDelta>
        <StatTileCaption>resolved faster this week</StatTileCaption>
      </StatTile>
      <StatTile>
        <StatTileHeader>
          <StatTileLabel>Assets monitored</StatTileLabel>
          <StatTileIcon>
            <Activity />
          </StatTileIcon>
        </StatTileHeader>
        <StatTileValue>6,912</StatTileValue>
        <StatTileDelta trend="up">2.4%</StatTileDelta>
        <StatTileChart>
          <Sparkline data={TREND} tone="accent" width={160} />
        </StatTileChart>
      </StatTile>
    </div>
  ),
}
