import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { Marquee } from "@/components/ui/marquee"
import { Badge } from "@/components/ui/badge"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */
const meta = {
  title: "Components/Marquee",
  component: Marquee,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    direction: { control: "inline-radio", options: ["left", "right", "up", "down"] },
    speed: { control: "inline-radio", options: ["fast", "default", "slow"] },
    pauseOnHover: { control: "boolean" },
    gap: { control: "inline-radio", options: ["none", "sm", "md", "lg"] },
    repeat: { control: { type: "number" } },
  },
  args: { children: null },
} satisfies Meta<typeof Marquee>

export default meta
type Story = StoryObj<typeof meta>

const Items = () => (
  <>
    {["Acme", "Globex", "Initech", "Umbrella", "Soylent", "Hooli"].map((name) => (
      <Badge key={name} variant="soft">
        {name}
      </Badge>
    ))}
  </>
)

export const Default: Story = {
  args: { direction: "left", speed: "default", pauseOnHover: true, gap: "md", repeat: 2 },
  render: (args) => (
    <div style={{ maxWidth: 520 }}>
      <Marquee {...args}>
        <Items />
      </Marquee>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const strip = canvas.getByText("Acme").closest("[data-slot=marquee]")
    expect(strip).toHaveAttribute("data-direction", "left")
    // Content is duplicated for the seamless loop → more than one "Acme".
    expect(canvas.getAllByText("Acme").length).toBeGreaterThan(1)
  },
}

export const Reverse: Story = {
  args: { direction: "right" },
  render: (args) => (
    <div style={{ maxWidth: 520 }}>
      <Marquee {...args}>
        <Items />
      </Marquee>
    </div>
  ),
}

export const Vertical: Story = {
  args: { direction: "up", gap: "sm" },
  render: (args) => (
    <div style={{ height: 180, maxWidth: 240 }}>
      <Marquee {...args}>
        <Items />
      </Marquee>
    </div>
  ),
}
