import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { PriorityActionItem } from "@/components/ui/priority-action-item"
import { List } from "@/components/ui/list"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */
const meta = {
  title: "Components/PriorityActionItem",
  component: PriorityActionItem,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    severity: {
      control: "inline-radio",
      options: [undefined, "critical", "high", "medium", "low", "info"],
    },
    rank: { control: { type: "number" } },
    affectedCount: { control: { type: "number" } },
    href: { control: "text" },
  },
  args: {
    rank: 1,
    severity: "critical",
    title: "Patch xz-utils on 3 exposed hosts",
    description: "Supply-chain backdoor with public exploit code available.",
    affectedCount: 3,
    impact: "Reduces critical risk 42%",
    href: "#action-1",
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 520 }}>
        <List variant="bordered">
          <Story />
        </List>
      </div>
    ),
  ],
} satisfies Meta<typeof PriorityActionItem>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const link = canvas.getByRole("link", { name: /Patch xz-utils/i })
    await expect(link).toHaveAttribute("href", "#action-1")
    const root = link.closest("[data-slot=priority-action-item]")
    await expect(root).toHaveAttribute("data-rank", "1")
    await expect(root).toHaveAttribute("data-severity", "critical")
    await expect(canvas.getByText("3 assets")).toBeInTheDocument()
  },
}

export const Queue: Story = {
  render: () => (
    <>
      <PriorityActionItem
        rank={1}
        severity="critical"
        title="Patch xz-utils on 3 exposed hosts"
        affectedCount={3}
        impact="Reduces critical risk 42%"
        href="#a1"
      />
      <PriorityActionItem
        rank={2}
        severity="high"
        title="Enforce MFA on the admin portal"
        affectedCount={1}
        impact="Closes account-takeover path"
        href="#a2"
      />
      <PriorityActionItem
        rank={3}
        severity="medium"
        title="Rotate leaked API keys"
        affectedCount={7}
        impact="Revokes stale credentials"
        href="#a3"
      />
    </>
  ),
}

export const Static: Story = {
  args: { href: undefined },
}

export const Minimal: Story = {
  args: {
    rank: undefined,
    severity: undefined,
    description: undefined,
    affectedCount: undefined,
    impact: undefined,
    href: undefined,
    title: "Review firewall rules",
  },
}
