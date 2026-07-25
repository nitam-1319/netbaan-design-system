import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"
import { Hash } from "lucide-react"

import { Tag } from "@/components/ui/tag"

const meta = {
  title: "Components/Tag",
  component: Tag,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    children: "production",
    size: "md",
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    selected: { control: "boolean" },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Tag>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const tag = canvas.getByText("production")
    await expect(tag).toBeInTheDocument()
    await expect(tag).toHaveAttribute("data-slot", "tag")
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Tag size="sm">small</Tag>
      <Tag size="md">medium</Tag>
      <Tag size="lg">large</Tag>
    </div>
  ),
}

/** Resting vs. the accent-tinted `selected` state (filter / choice chips). */
export const Selected: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Tag>archived</Tag>
      <Tag selected>active</Tag>
    </div>
  ),
}

export const WithIcon: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Tag>
        <Hash /> internal
      </Tag>
      <Tag selected>
        <Hash /> tracked
      </Tag>
    </div>
  ),
}

/** A filter chip: render as a `<button>` and toggle `selected` on click. */
export const Filter: Story = {
  render: () => {
    const [on, setOn] = React.useState(false)
    return (
      <Tag selected={on} render={<button type="button" />} onClick={() => setOn((v) => !v)}>
        Active
      </Tag>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const chip = canvas.getByRole("button", { name: "Active" })
    await expect(chip).not.toHaveAttribute("data-selected")
    await userEvent.click(chip)
    await expect(chip).toHaveAttribute("data-selected")
  },
}

export const Removable: Story = {
  render: () => {
    const [visible, setVisible] = React.useState(true)
    if (!visible)
      return <span className="text-sm text-muted-foreground">Removed</span>
    return (
      <Tag selected onRemove={() => setVisible(false)}>
        production
      </Tag>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const remove = canvas.getByRole("button", { name: "Remove" })
    await expect(remove).toBeInTheDocument()
    await userEvent.click(remove)
    await expect(canvas.getByText("Removed")).toBeInTheDocument()
  },
}

export const RemovableGroup: Story = {
  render: () => {
    const [tags, setTags] = React.useState([
      "us-east-1",
      "prod",
      "public-subnet",
    ])
    return (
      <div className="flex flex-wrap gap-2">
        {tags.map((t) => (
          <Tag
            key={t}
            onRemove={() => setTags((prev) => prev.filter((x) => x !== t))}
            removeLabel={`Remove ${t}`}
          >
            {t}
          </Tag>
        ))}
        {tags.length === 0 ? (
          <span className="text-sm text-muted-foreground">No filters</span>
        ) : null}
      </div>
    )
  },
}

export const Disabled: Story = {
  render: () => (
    <Tag selected disabled onRemove={() => {}}>
      locked
    </Tag>
  ),
}
