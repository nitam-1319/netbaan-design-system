import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, waitFor, within } from "storybook/test"

import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { Card, CardContent } from "@/components/ui/card"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */
const meta = {
  title: "Components/ScrollReveal",
  component: ScrollReveal,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    from: { control: "inline-radio", options: ["up", "down", "left", "right", "none"] },
    speed: { control: "inline-radio", options: ["fast", "default", "slow"] },
    delay: { control: { type: "number" } },
    once: { control: "boolean" },
  },
  args: {
    from: "up",
    speed: "default",
    delay: 0,
    once: true,
    children: (
      <Card>
        <CardContent>
          <div style={{ padding: 16, fontSize: 14 }}>Revealed content</div>
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
} satisfies Meta<typeof ScrollReveal>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const root = canvas.getByText("Revealed content").closest("[data-slot=scroll-reveal]")
    // In-view in the test frame → becomes revealed.
    await waitFor(() => expect(root).toHaveAttribute("data-revealed", "true"))
  },
}

export const FromLeft: Story = {
  args: { from: "left" },
}

export const Staggered: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {[0, 1, 2, 3].map((i) => (
        <ScrollReveal key={i} from="up" delay={i * 120}>
          <Card>
            <CardContent>
              <div style={{ padding: 16, fontSize: 14 }}>Row {i + 1}</div>
            </CardContent>
          </Card>
        </ScrollReveal>
      ))}
    </div>
  ),
}
