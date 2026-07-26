import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, waitFor, within } from "storybook/test"

import { LazyLoader } from "@/components/ui/lazy-loader"
import { Card, CardContent } from "@/components/ui/card"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */
const meta = {
  title: "Components/LazyLoader",
  component: LazyLoader,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    minHeight: { control: { type: "number" } },
    once: { control: "boolean" },
    onVisible: { action: "visible" },
  },
  args: {
    minHeight: 120,
    once: true,
    rootMargin: "200px",
    children: (
      <Card>
        <CardContent>
          <div style={{ padding: 16, fontSize: 14 }}>Loaded content</div>
        </CardContent>
      </Card>
    ),
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LazyLoader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // In the test viewport it's in view, so content loads.
    await waitFor(() => expect(canvas.getByText("Loaded content")).toBeInTheDocument())
  },
}

export const BelowTheFold: Story = {
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480 }}>
        <div style={{ height: "90vh" }} />
        <Story />
      </div>
    ),
  ],
}

export const CustomPlaceholder: Story = {
  args: {
    placeholder: (
      <div style={{ padding: 24, textAlign: "center", fontSize: 13 }}>
        Loading chart…
      </div>
    ),
  },
}
