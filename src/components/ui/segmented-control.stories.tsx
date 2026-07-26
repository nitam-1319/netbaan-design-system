import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, waitFor, within } from "storybook/test"
import { LayoutGrid, List, Map } from "lucide-react"

import { SegmentedControl } from "@/components/ui/segmented-control"

const meta = {
  title: "Components/SegmentedControl",
  component: SegmentedControl,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    fullWidth: { control: "boolean" },
    disabled: { control: "boolean" },
    onValueChange: { action: "valueChange" },
  },
  decorators: [
    (Story) => (
      <div className="p-6 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SegmentedControl>

export default meta
type Story = StoryObj<typeof meta>

const rangeItems = [
  { value: "24h", label: "24h" },
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" },
  { value: "90d", label: "90d" },
]

export const Default: Story = {
  args: { items: rangeItems, defaultValue: "7d" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Re-query inside waitFor: the pressed state settles after the controlled
    // default commits, so a captured node reference can read a stale attribute.
    await waitFor(() =>
      expect(canvas.getByRole("button", { name: "7d" })).toHaveAttribute(
        "aria-pressed",
        "true"
      )
    )
    // Selecting another segment moves the pressed state.
    await userEvent.click(canvas.getByRole("button", { name: "30d" }))
    await waitFor(() =>
      expect(canvas.getByRole("button", { name: "30d" })).toHaveAttribute(
        "aria-pressed",
        "true"
      )
    )
    await expect(canvas.getByRole("button", { name: "7d" })).toHaveAttribute(
      "aria-pressed",
      "false"
    )
    // Re-clicking the active segment keeps a selection (no deselect).
    await userEvent.click(canvas.getByRole("button", { name: "30d" }))
    await expect(canvas.getByRole("button", { name: "30d" })).toHaveAttribute(
      "aria-pressed",
      "true"
    )
  },
}

export const Sizes: Story = {
  args: { items: rangeItems },
  render: (args) => (
    <div className="flex flex-col items-start gap-4">
      <SegmentedControl {...args} size="sm" defaultValue="24h" />
      <SegmentedControl {...args} size="md" defaultValue="7d" />
      <SegmentedControl {...args} size="lg" defaultValue="30d" />
    </div>
  ),
}

export const WithIcons: Story = {
  args: {
    defaultValue: "grid",
    items: [
      { value: "grid", label: <LayoutGrid />, "aria-label": "Grid view" },
      { value: "list", label: <List />, "aria-label": "List view" },
      { value: "map", label: <Map />, "aria-label": "Map view" },
    ],
  },
}

export const IconAndText: Story = {
  args: {
    defaultValue: "list",
    items: [
      {
        value: "grid",
        label: (
          <>
            <LayoutGrid /> Grid
          </>
        ),
      },
      {
        value: "list",
        label: (
          <>
            <List /> List
          </>
        ),
      },
      {
        value: "map",
        label: (
          <>
            <Map /> Map
          </>
        ),
      },
    ],
  },
}

export const FullWidth: Story = {
  args: {
    items: rangeItems,
    defaultValue: "7d",
    fullWidth: true,
  },
  decorators: [
    (Story) => (
      <div className="w-96 p-6 text-foreground">
        <Story />
      </div>
    ),
  ],
}

export const DisabledSegment: Story = {
  args: {
    defaultValue: "on",
    items: [
      { value: "on", label: "Enabled" },
      { value: "off", label: "Disabled", disabled: true },
      { value: "auto", label: "Auto" },
    ],
  },
}

export const Controlled: Story = {
  args: {
    items: [
      { value: "summary", label: "Summary" },
      { value: "findings", label: "Findings" },
      { value: "assets", label: "Assets" },
    ],
  },
  render: () => {
    const [value, setValue] = React.useState("summary")
    return (
      <div className="flex flex-col gap-3">
        <SegmentedControl
          value={value}
          onValueChange={setValue}
          items={[
            { value: "summary", label: "Summary" },
            { value: "findings", label: "Findings" },
            { value: "assets", label: "Assets" },
          ]}
        />
        <p className="text-sm text-muted-foreground">Viewing: {value}</p>
      </div>
    )
  },
}
