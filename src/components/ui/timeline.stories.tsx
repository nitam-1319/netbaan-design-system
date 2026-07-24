import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"
import { Check, GitCommitHorizontal, Rocket } from "lucide-react"

import {
  Timeline,
  TimelineDescription,
  TimelineItem,
  TimelineTime,
  TimelineTitle,
} from "@/components/ui/timeline"

/**
 * Every story renders inside an explicit `.dark` surface so the AEGIS dark
 * theme (the design system's primary theme) is exercised.
 */
const meta = {
  title: "Components/Timeline",
  component: Timeline,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="dark bg-background text-foreground w-[24rem] max-w-full p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Timeline>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Timeline>
      <TimelineItem tone="success">
        <TimelineTitle>Scan completed</TimelineTitle>
        <TimelineTime dateTime="2026-07-24T09:12">09:12</TimelineTime>
        <TimelineDescription>
          412 assets discovered, 3 new findings triaged.
        </TimelineDescription>
      </TimelineItem>
      <TimelineItem tone="accent">
        <TimelineTitle>Scan started</TimelineTitle>
        <TimelineTime dateTime="2026-07-24T09:00">09:00</TimelineTime>
        <TimelineDescription>
          Weekly attack-surface sweep kicked off automatically.
        </TimelineDescription>
      </TimelineItem>
      <TimelineItem tone="neutral">
        <TimelineTitle>Configuration saved</TimelineTitle>
        <TimelineTime dateTime="2026-07-23T17:40">Yesterday</TimelineTime>
      </TimelineItem>
    </Timeline>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Ordered list carries the sequence semantics.
    const list = canvasElement.querySelector("[data-slot=timeline]")
    await expect(list?.tagName).toBe("OL")
    await expect(canvas.getByText("Scan completed")).toBeInTheDocument()
    await expect(
      canvasElement.querySelectorAll("[data-slot=timeline-item]").length
    ).toBe(3)
  },
}

export const Tones: Story = {
  render: () => (
    <Timeline>
      <TimelineItem tone="accent">
        <TimelineTitle>Accent — in progress</TimelineTitle>
      </TimelineItem>
      <TimelineItem tone="success">
        <TimelineTitle>Success — resolved</TimelineTitle>
      </TimelineItem>
      <TimelineItem tone="warning">
        <TimelineTitle>Warning — needs attention</TimelineTitle>
      </TimelineItem>
      <TimelineItem tone="danger">
        <TimelineTitle>Danger — failed</TimelineTitle>
      </TimelineItem>
      <TimelineItem tone="neutral">
        <TimelineTitle>Neutral — informational</TimelineTitle>
      </TimelineItem>
    </Timeline>
  ),
}

export const WithIconMarkers: Story = {
  render: () => (
    <Timeline>
      <TimelineItem tone="success" marker={<Rocket />}>
        <TimelineTitle>Deployed to production</TimelineTitle>
        <TimelineTime>2m ago</TimelineTime>
      </TimelineItem>
      <TimelineItem tone="accent" marker={<Check />}>
        <TimelineTitle>Checks passed</TimelineTitle>
        <TimelineTime>8m ago</TimelineTime>
      </TimelineItem>
      <TimelineItem tone="neutral" marker={<GitCommitHorizontal />}>
        <TimelineTitle>Commit pushed</TimelineTitle>
        <TimelineTime>15m ago</TimelineTime>
      </TimelineItem>
    </Timeline>
  ),
}
