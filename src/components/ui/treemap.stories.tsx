import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { Treemap } from "@/components/ui/treemap"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */
const meta = {
  title: "Components/Treemap",
  component: Treemap,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    height: { control: { type: "number" } },
  },
  args: {
    label: "Assets by group",
    height: 320,
    items: [
      { key: "web", label: "Web", value: 120 },
      { key: "api", label: "API", value: 80 },
      { key: "db", label: "Databases", value: 45 },
      { key: "mail", label: "Mail", value: 30 },
      { key: "vpn", label: "VPN", value: 18 },
      { key: "other", label: "Other", value: 12 },
    ],
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 560 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Treemap>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole("group", { name: "Assets by group" })
    ).toBeInTheDocument()
    const tiles = canvasElement.querySelectorAll("[data-slot=treemap-tile]")
    await expect(tiles).toHaveLength(6)
    // Values are in accessible names.
    await expect(canvas.getByLabelText("Web: 120")).toBeInTheDocument()
  },
}

export const Spend: Story = {
  args: {
    label: "Cloud spend by service",
    valueFormat: (v: number) => `$${v}k`,
    items: [
      { key: "compute", label: "Compute", value: 42 },
      { key: "storage", label: "Storage", value: 28 },
      { key: "network", label: "Network", value: 15 },
      { key: "ml", label: "ML", value: 33 },
      { key: "misc", label: "Misc", value: 8 },
    ],
  },
}
