import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { MiniLocationMap } from "@/components/ui/mini-location-map"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 *
 * The paths below are SCHEMATIC landmasses, not real geography — the component
 * renders whatever projection you hand it, so the stories only need something
 * shaped like a coastline. Production passes real projected geometry.
 */
const DEMO_LAND = [
  "M120,110 L300,90 L420,150 L380,250 L240,280 L140,220 Z",
  "M470,60 L700,80 L760,180 L640,240 L520,200 Z",
  "M540,280 L700,300 L680,400 L560,380 Z",
]

const meta = {
  title: "Components/MiniLocationMap",
  component: MiniLocationMap,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    zoom: { control: { type: "range", min: 1, max: 12, step: 1 } },
  },
  args: {
    label: "Location of 203.0.113.7",
    paths: DEMO_LAND,
    marker: { x: 560, y: 150 },
    location: "Frankfurt, DE",
    asn: "AS3320",
    emptyLabel: "Location unknown",
  },
} satisfies Meta<typeof MiniLocationMap>

export default meta
type Story = StoryObj<typeof meta>

export const Placed: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole("img", { name: "Location of 203.0.113.7" })
    ).toBeInTheDocument()
    await expect(canvas.getByText("Frankfurt, DE")).toBeInTheDocument()
  },
}

/** No geo data — no map, no pin, and the caption says so plainly. */
export const Unknown: Story = {
  args: { marker: null },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("Location unknown")).toBeInTheDocument()
    await expect(canvas.queryByRole("img")).not.toBeInTheDocument()
  },
}

/** Without a place name the chip disappears; the pin still marks the spot. */
export const NoChip: Story = {
  args: { location: undefined, asn: undefined },
}

/** The crop clamps at the edge of the geometry rather than panning into blank space. */
export const NearEdge: Story = {
  args: { marker: { x: 8, y: 470 } },
}

export const Zoom: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: 16, maxWidth: 360 }}>
      <MiniLocationMap {...args} zoom={1} />
      <MiniLocationMap {...args} zoom={4} />
      <MiniLocationMap {...args} zoom={10} />
    </div>
  ),
}
