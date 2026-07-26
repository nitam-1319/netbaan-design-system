import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { AttackSurfaceWidget } from "@/components/ui/attack-surface-widget"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */
const meta = {
  title: "Components/AttackSurfaceWidget",
  component: AttackSurfaceWidget,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: {
    title: "Attack surface",
    description: "Exposed services by category",
    total: 342,
    totalLabel: "exposed services",
    xKey: "category",
    data: [
      { category: "Web", https: 120, http: 40 },
      { category: "API", https: 64, http: 18 },
      { category: "Mail", https: 22, http: 30 },
      { category: "DB", https: 8, http: 20 },
    ],
    series: [
      { key: "https", label: "HTTPS" },
      { key: "http", label: "HTTP" },
    ],
    stacked: true,
    height: 260,
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 640 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AttackSurfaceWidget>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const root = canvas
      .getByText("Attack surface")
      .closest("[data-slot=attack-surface-widget]")
    await expect(root).toBeInTheDocument()
    await expect(canvas.getByText("342")).toBeInTheDocument()
    // The composed chart is rendered with the widget's accessible name.
    await expect(canvas.getByRole("img", { name: "Attack surface" })).toBeInTheDocument()
  },
}

export const Grouped: Story = {
  args: { stacked: false, title: "Open ports by category" },
}

export const SingleSeries: Story = {
  args: {
    title: "Findings by severity",
    description: undefined,
    total: undefined,
    totalLabel: undefined,
    stacked: false,
    xKey: "severity",
    data: [
      { severity: "Critical", count: 6 },
      { severity: "High", count: 18 },
      { severity: "Medium", count: 44 },
      { severity: "Low", count: 71 },
    ],
    series: [{ key: "count", label: "Findings" }],
  },
}
