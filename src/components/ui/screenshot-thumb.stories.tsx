import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { ScreenshotThumb } from "@/components/ui/screenshot-thumb"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */

// An inline SVG data URI stands in for a real capture: deterministic, offline,
// and no colour literal leaks into the component itself.
const SAMPLE_CAPTURE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="300">
       <rect width="480" height="300" fill="#1b1a24"/>
       <rect x="0" y="0" width="480" height="44" fill="#26243a"/>
       <rect x="24" y="72" width="220" height="14" rx="7" fill="#3b3856"/>
       <rect x="24" y="102" width="320" height="10" rx="5" fill="#2f2c46"/>
       <rect x="24" y="122" width="280" height="10" rx="5" fill="#2f2c46"/>
     </svg>`
  )

const meta = {
  title: "Components/ScreenshotThumb",
  component: ScreenshotThumb,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    loading: { control: "inline-radio", options: ["lazy", "eager"] },
  },
  args: {
    src: SAMPLE_CAPTURE,
    alt: "Screenshot of shop.example.com",
    emptyLabel: "No screenshot yet",
  },
} satisfies Meta<typeof ScreenshotThumb>

export default meta
type Story = StoryObj<typeof meta>

export const Loaded: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByAltText("Screenshot of shop.example.com")
    ).toBeInTheDocument()
  },
}

/** No capture yet — the hatched slot keeps the card's geometry. */
export const Empty: Story = {
  args: { src: null },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("No screenshot yet")).toBeInTheDocument()
  },
}

/** A dead URL resolves to the same slot as a missing one. */
export const Failed: Story = {
  args: { src: "https://example.invalid/missing.png" },
}

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: 16, maxWidth: 360 }}>
      <ScreenshotThumb {...args} size="sm" />
      <ScreenshotThumb {...args} size="md" />
      <ScreenshotThumb {...args} size="lg" />
    </div>
  ),
}
