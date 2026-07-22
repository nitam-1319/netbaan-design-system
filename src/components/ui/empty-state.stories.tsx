import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"
import { Inbox, SearchX, ShieldCheck } from "lucide-react"

import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateActions,
} from "@/components/ui/empty-state"
import { Button } from "@/components/ui/button"

const meta = {
  title: "Components/Empty State",
  component: EmptyState,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof EmptyState>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <EmptyState>
      <EmptyStateIcon>
        <Inbox />
      </EmptyStateIcon>
      <EmptyStateTitle>No findings yet</EmptyStateTitle>
      <EmptyStateDescription>
        Run a scan to start monitoring this asset. New findings will appear here as
        soon as they are detected.
      </EmptyStateDescription>
      <EmptyStateActions>
        <Button>Run first scan</Button>
        <Button variant="outline">Import assets</Button>
      </EmptyStateActions>
    </EmptyState>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Root exposes a polite status region for assistive tech.
    const region = canvas.getByRole("status")
    await expect(region).toBeVisible()
    await expect(
      canvas.getByRole("heading", { name: "No findings yet" })
    ).toBeVisible()
    await expect(
      canvas.getByRole("button", { name: "Run first scan" })
    ).toBeVisible()
  },
}

export const NoResults: Story = {
  render: () => (
    <EmptyState size="sm">
      <EmptyStateIcon>
        <SearchX />
      </EmptyStateIcon>
      <EmptyStateTitle>No matches</EmptyStateTitle>
      <EmptyStateDescription>
        No findings match the current filters. Try widening the severity range or
        clearing the search.
      </EmptyStateDescription>
      <EmptyStateActions>
        <Button variant="outline">Clear filters</Button>
      </EmptyStateActions>
    </EmptyState>
  ),
}

export const AllClear: Story = {
  render: () => (
    <EmptyState size="lg">
      <EmptyStateIcon>
        <ShieldCheck />
      </EmptyStateIcon>
      <EmptyStateTitle>All clear</EmptyStateTitle>
      <EmptyStateDescription>
        No open findings across your monitored surface. You are all caught up.
      </EmptyStateDescription>
    </EmptyState>
  ),
}
