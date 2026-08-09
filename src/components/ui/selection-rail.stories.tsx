import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"

import { SelectionRail, type SelectionRailItem } from "@/components/ui/selection-rail"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */

const HOSTS: SelectionRailItem[] = [
  { id: "h1", label: "acme-corp.com", count: 1284, countTone: "critical", currentLabel: "Showing records" },
  { id: "h2", label: "shop.acme-corp.com", count: 417, countTone: "high", currentLabel: "Showing records" },
  { id: "h3", label: "dev-portal.acme-corp.com", count: 96, countTone: "medium", currentLabel: "Showing records" },
  { id: "h4", label: "acme-cloud.io", count: 61, countTone: "medium", currentLabel: "Showing records" },
  { id: "h5", label: "mail.acme-corp.com", count: 12, countTone: "neutral", currentLabel: "Showing records" },
  { id: "h6", label: "acmestatic.net", count: 3, countTone: "neutral", currentLabel: "Showing records" },
]

const meta = {
  title: "Components/SelectionRail",
  component: SelectionRail,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: {
    title: "Affected hosts",
    meta: "1/4",
    hint: "Select a host to open its leaked records",
    status: "6 hosts loaded · page 1 of 4",
    items: HOSTS,
    sticky: false,
    "aria-label": "Affected hosts",
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 300 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SelectionRail>

export default meta
type Story = StoryObj<typeof meta>

/** The rail as it ships: a selection, a position line, and a pinned load-more. */
export const Default: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<string | null>("h1")
    return (
      <SelectionRail
        {...args}
        value={value}
        onValueChange={setValue}
        onLoadMore={() => {}}
        loadMoreLabel="Load more hosts"
      />
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Anchored: four hosts contain "acme-corp.com" as a suffix (shop., dev-portal., mail.),
    // so an unanchored pattern matches all of them.
    const first = canvas.getByRole("button", { name: /^acme-corp\.com/ })
    await expect(first).toHaveAttribute("aria-current", "true")

    // Picking a row moves `aria-current` — the open row is announced, not just tinted.
    const next = canvas.getByRole("button", { name: /acmestatic\.net/ })
    await userEvent.click(next)
    await expect(next).toHaveAttribute("aria-current", "true")
    await expect(first).not.toHaveAttribute("aria-current")
  },
}

/** Nothing picked yet: every row is dormant and the marker line is reserved but blank. */
export const NoSelection: Story = {
  args: { value: null },
}

/** First load. Placeholder rows keep the rail's geometry so nothing jumps on arrival. */
export const Loading: Story = {
  args: { loading: true, items: [] },
}

/** The org has no hosts with leaked records. The rail states it inside its own frame. */
export const Empty: Story = {
  args: {
    items: [],
    status: undefined,
    empty: "No leaked records found.",
  },
}

/** A rail longer than its 420px box scrolls internally; the load-more stays reachable. */
export const Scrolling: Story = {
  args: {
    items: Array.from({ length: 24 }, (_, i) => ({
      id: `host-${i}`,
      label: `host-${String(i).padStart(2, "0")}.acme-corp.com`,
      count: (24 - i) * 37,
      countTone: i < 4 ? ("high" as const) : ("neutral" as const),
      currentLabel: "Showing records",
    })),
    value: "host-00",
    status: "24 hosts loaded · page 4 of 4",
  },
}
