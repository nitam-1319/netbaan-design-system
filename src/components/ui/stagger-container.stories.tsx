import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, waitFor, within } from "storybook/test"

import { StaggerContainer } from "@/components/ui/stagger-container"
import { Card, CardContent } from "@/components/ui/card"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */
const meta = {
  title: "Components/StaggerContainer",
  component: StaggerContainer,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    stagger: { control: { type: "number" } },
    from: { control: "inline-radio", options: ["up", "down", "left", "right", "none"] },
    speed: { control: "inline-radio", options: ["fast", "default", "slow"] },
    gap: { control: "inline-radio", options: ["none", "sm", "md", "lg"] },
  },
  args: {
    stagger: 100,
    from: "up",
    speed: "default",
    gap: "md",
    children: [1, 2, 3, 4].map((n) => (
      <Card key={n}>
        <CardContent>
          <div style={{ padding: 16, fontSize: 14 }}>Card {n}</div>
        </CardContent>
      </Card>
    )),
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StaggerContainer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const root = canvas.getByText("Card 1").closest("[data-slot=stagger-container]")
    await expect(root).toBeInTheDocument()
    // Each child is wrapped in a scroll-reveal that reveals in the test frame.
    await waitFor(() =>
      expect(
        canvas.getByText("Card 4").closest("[data-slot=scroll-reveal]")
      ).toHaveAttribute("data-revealed", "true")
    )
  },
}

export const FastFromLeft: Story = {
  args: { stagger: 60, from: "left", speed: "fast" },
}
