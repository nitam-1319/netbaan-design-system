import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { AssetRow } from "@/components/ui/asset-row"
import { List } from "@/components/ui/list"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */
const meta = {
  title: "Components/AssetRow",
  component: AssetRow,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    severity: {
      control: "inline-radio",
      options: [undefined, "critical", "high", "medium", "low", "info"],
    },
    findings: { control: { type: "number" } },
    online: { control: "boolean" },
    href: { control: "text" },
  },
  args: {
    name: "api.example.com",
    type: "Web server",
    severity: "high",
    findings: 4,
    trend: [2, 3, 3, 5, 4, 6, 4],
    trendLabel: "Findings over the last 7 days",
    online: true,
    href: "#asset-1",
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 560 }}>
        <List variant="bordered">
          <Story />
        </List>
      </div>
    ),
  ],
} satisfies Meta<typeof AssetRow>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const link = canvas.getByRole("link", { name: /api\.example\.com/i })
    await expect(link).toHaveAttribute("href", "#asset-1")
    const root = link.closest("[data-slot=asset-row]")
    await expect(root).toHaveAttribute("data-severity", "high")
    await expect(canvas.getByText("4 findings")).toBeInTheDocument()
  },
}

export const Inventory: Story = {
  render: () => (
    <>
      <AssetRow
        name="admin.example.com"
        type="Admin panel"
        severity="critical"
        findings={2}
        trend={[1, 1, 2, 2, 3, 4, 6]}
        online
        href="#a1"
      />
      <AssetRow
        name="api.example.com"
        type="Web server"
        severity="high"
        findings={4}
        trend={[2, 3, 3, 5, 4, 6, 4]}
        online
        href="#a2"
      />
      <AssetRow
        name="db-01.internal"
        type="Database"
        severity="low"
        findings={1}
        trend={[3, 2, 2, 1, 1, 1, 1]}
        online={false}
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
    type: undefined,
    severity: undefined,
    findings: undefined,
    trend: undefined,
    online: undefined,
    href: undefined,
    name: "10.0.0.42",
  },
}
