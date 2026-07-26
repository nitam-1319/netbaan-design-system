import type { Meta, StoryObj } from "@storybook/react-vite"
import * as React from "react"
import { expect, userEvent, within } from "storybook/test"

import { ColorPicker, type HSL } from "@/components/ui/color-picker"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */
const meta = {
  title: "Components/ColorPicker",
  component: ColorPicker,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof ColorPicker>

export default meta
type Story = StoryObj<typeof meta>

const presets: HSL[] = [
  { h: 217, s: 90, l: 60 },
  { h: 152, s: 65, l: 45 },
  { h: 38, s: 92, l: 55 },
  { h: 0, s: 78, l: 55 },
  { h: 280, s: 68, l: 60 },
  { h: 200, s: 18, l: 46 },
]

export const Default: Story = {
  args: { size: "md", label: "Brand colour" },
  render: (args) => <ColorPicker {...args} presets={presets} defaultValue={{ h: 217, s: 90, l: 60 }} />,
}

export const Controlled: Story = {
  render: () => {
    const [color, setColor] = React.useState<HSL>({ h: 152, s: 65, l: 45 })
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
        <ColorPicker value={color} onValueChange={setColor} presets={presets} label="Accent" />
        <code style={{ fontSize: 12 }}>{`h ${color.h} · s ${color.s} · l ${color.l}`}</code>
      </div>
    )
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole("button", { name: /Accent/ })
    await step("open picker", async () => {
      await userEvent.click(trigger)
    })
    // Sliders live in a portalled popover — query the whole document.
    const body = within(document.body)
    const hue = await body.findByRole("slider", { name: "Hue" })
    const sat = body.getByRole("slider", { name: "Saturation" })
    const light = body.getByRole("slider", { name: "Lightness" })
    expect(hue).toBeInTheDocument()
    expect(sat).toBeInTheDocument()
    expect(light).toBeInTheDocument()
    // Presets are exposed as a labelled group of swatch buttons.
    expect(body.getByRole("group", { name: "Preset colours" })).toBeInTheDocument()
  },
}

export const Disabled: Story = {
  args: { disabled: true, label: "Locked colour" },
}
