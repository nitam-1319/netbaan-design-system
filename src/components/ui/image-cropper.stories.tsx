import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"

import { ImageCropper } from "@/components/ui/image-cropper"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. A tiny inline SVG data-URI is used as the demo image so the story is
 * self-contained. Demo layout uses plain HTML wrappers so no `className` /
 * `style` is ever passed to an AEGIS component.
 */

const IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='640' height='400'>
      <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0' stop-color='#6d5efc'/><stop offset='1' stop-color='#1b1830'/>
      </linearGradient></defs>
      <rect width='640' height='400' fill='url(#g)'/>
      <circle cx='200' cy='150' r='80' fill='#ffffff' opacity='0.35'/>
      <circle cx='460' cy='280' r='60' fill='#ffffff' opacity='0.25'/>
    </svg>`
  )

const meta = {
  title: "Components/ImageCropper",
  component: ImageCropper,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    step: { control: { type: "number" } },
    minSize: { control: { type: "number" } },
  },
  args: {
    src: IMG,
    alt: "Abstract gradient with two soft circles",
    label: "Crop image",
    step: 0.05,
    minSize: 0.1,
  },
} satisfies Meta<typeof ImageCropper>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <div style={{ maxWidth: 420 }}>
      <ImageCropper {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // The crop selection is an accessible slider with a spelled-out valuetext.
    const selection = canvas.getByRole("slider", { name: "Crop image" })
    await expect(selection).toHaveAttribute(
      "aria-valuetext",
      "Crop 60% × 60% at 20%, 20%"
    )
    await expect(canvas.getByRole("img", { name: /Abstract gradient/ })).toBeInTheDocument()

    // Keyboard nudges the crop position (deterministic, rect-independent).
    selection.focus()
    await userEvent.keyboard("{ArrowRight}") // +step (0.05) to x → 25%
    await expect(selection).toHaveAttribute(
      "aria-valuetext",
      "Crop 60% × 60% at 25%, 20%"
    )
    // Shift+Arrow resizes.
    await userEvent.keyboard("{Shift>}{ArrowDown}{/Shift}") // +step to height → 65%
    await expect(selection).toHaveAttribute(
      "aria-valuetext",
      "Crop 60% × 65% at 25%, 20%"
    )
  },
}

export const PortraitStart: Story = {
  args: { defaultValue: { x: 0.3, y: 0.1, width: 0.4, height: 0.8 } },
  render: (args) => (
    <div style={{ maxWidth: 420 }}>
      <ImageCropper {...args} />
    </div>
  ),
}
