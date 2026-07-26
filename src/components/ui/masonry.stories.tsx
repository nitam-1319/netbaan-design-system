import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { Masonry } from "@/components/ui/masonry"
import { Card, CardContent } from "@/components/ui/card"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */
const HEIGHTS = [120, 200, 90, 160, 240, 110, 180, 140, 220]

function Tile({ i, h }: { i: number; h: number }) {
  return (
    <Card>
      <CardContent>
        <div style={{ height: h, display: "flex", alignItems: "center" }}>
          Item {i + 1}
        </div>
      </CardContent>
    </Card>
  )
}

const meta = {
  title: "Components/Masonry",
  component: Masonry,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    columns: { control: "inline-radio", options: [1, 2, 3, 4, 5] },
    gap: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
  args: {
    columns: 3,
    gap: "md",
    children: HEIGHTS.map((h, i) => <Tile key={i} i={i} h={h} />),
  },
} satisfies Meta<typeof Masonry>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const root = canvas.getByText("Item 1").closest("[data-slot=masonry]")
    await expect(root).toHaveAttribute("data-columns", "3")
    await expect(canvas.getAllByText(/^Item /)).toHaveLength(9)
  },
}

export const TwoColumns: Story = {
  args: { columns: 2 },
}

export const LargeGap: Story = {
  args: { gap: "lg" },
}
