import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"
import { Filter, Hash } from "lucide-react"

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
  },
  decorators: [
    (Story) => (
      <div className="flex min-h-24 items-center justify-center p-10 text-foreground">
        <Story />
      </div>
    ),
  ],
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

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Tag variant="default">default</Tag>
      <Tag variant="primary">primary</Tag>
      <Tag variant="outline">outline</Tag>
      <Tag variant="muted">muted</Tag>
      <Tag variant="success">passing</Tag>
      <Tag variant="warning">degraded</Tag>
      <Tag variant="destructive">exposed</Tag>
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Tag size="sm">sm</Tag>
      <Tag size="default">default</Tag>
      <Tag size="lg">lg</Tag>
    </div>
  ),
}

export const WithIcon: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Tag variant="outline">
        <Hash /> internal
      </Tag>
      <Tag variant="muted">
        <Filter /> external-facing
      </Tag>
    </div>
  ),
}

export const Removable: Story = {
  render: () => {
    const [visible, setVisible] = React.useState(true)
    if (!visible) return <span className="text-sm text-muted-foreground">Removed</span>
    return (
      <Tag variant="primary" onRemove={() => setVisible(false)}>
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
            variant="outline"
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
    <Tag variant="primary" disabled onRemove={() => {}}>
      locked
    </Tag>
  ),
}
