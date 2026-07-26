import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { PullToRefresh } from "@/components/ui/pull-to-refresh"
import { List, ListItem } from "@/components/ui/list"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */
const meta = {
  title: "Components/PullToRefresh",
  component: PullToRefresh,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    threshold: { control: { type: "number" } },
    disabled: { control: "boolean" },
    onRefresh: { action: "refresh" },
  },
  args: {
    threshold: 72,
    disabled: false,
    children: (
      <List variant="divided">
        {Array.from({ length: 10 }).map((_, i) => (
          <ListItem key={i}>Item {i + 1}</ListItem>
        ))}
      </List>
    ),
  },
  decorators: [
    (Story) => (
      <div style={{ height: 280, maxWidth: 420, border: "1px solid var(--border)", borderRadius: 12 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PullToRefresh>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const root = canvas.getByText("Item 1").closest("[data-slot=pull-to-refresh]")
    await expect(root).toBeInTheDocument()
    // The status region exists (announced via role=status).
    await expect(canvas.getByText("Pull to refresh")).toBeInTheDocument()
  },
}

export const LargeThreshold: Story = {
  args: { threshold: 120 },
}
