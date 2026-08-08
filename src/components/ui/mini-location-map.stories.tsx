import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { MiniLocationMap } from "@/components/ui/mini-location-map"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 *
 * The geometry below is a SCHEMATIC stand-in, not real geography — Storybook must
 * not depend on the consuming app's generated 50m dataset. It is shaped exactly
 * like the real thing (flat `[lon, lat, …]` rings, unprojected) so the projection,
 * the windowing and the layer order are all exercised for real.
 */

/** A coarse box of "land" around 0–20°E / 40–60°N, plus a smaller neighbour. */
const DEMO_LAND = [
  [0, 40, 20, 40, 20, 60, 0, 60, 0, 40],
  [22, 44, 34, 44, 34, 54, 22, 54, 22, 44],
]

/** A vertical "border" bisecting the first landmass, and one along its edge. */
const DEMO_BORDERS = [
  [10, 40, 10, 60],
  [20, 40, 20, 60],
]

const GEOMETRY = { land: DEMO_LAND, borders: DEMO_BORDERS }

const meta = {
  title: "Components/MiniLocationMap",
  component: MiniLocationMap,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: { size: { control: "inline-radio", options: ["sm", "md", "lg"] } },
  args: {
    label: "Location of 203.0.113.7",
    lat: 50.11,
    lon: 8.68,
    geometry: GEOMETRY,
    city: "Frankfurt",
    countryCode: "DE",
    asn: "AS24940",
    emptyLabel: "Location unknown",
  },
} satisfies Meta<typeof MiniLocationMap>

export default meta
type Story = StoryObj<typeof meta>

export const Placed: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole("img", { name: "Location of 203.0.113.7" })).toBeInTheDocument()
    await expect(canvas.getByText("Frankfurt, DE")).toBeInTheDocument()
    // Country borders are a REQUIRED layer — a map without them is decoration.
    await expect(
      canvasElement.querySelector('[data-slot="mini-location-map-borders"] path')
    ).toBeTruthy()
  },
}

/** No coordinates: the hatch placeholder, and emphatically no pin. */
export const UnknownLocation: Story = {
  args: { lat: null, lon: null },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("Location unknown")).toBeInTheDocument()
    await expect(canvasElement.querySelector('[data-slot="mini-location-map-marker"]')).toBeNull()
  },
}

/** Coordinates but no place name — the chip falls back to the operator alone. */
export const AsnOnly: Story = {
  args: { city: null, countryCode: null },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("AS24940")).toBeInTheDocument()
  },
}

/** Neither a place name nor an operator: the chip is omitted entirely. */
export const NoChip: Story = {
  args: { city: null, countryCode: null, asn: null },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[data-slot="mini-location-map-chip"]')).toBeNull()
  },
}

/** Near the antimeridian: longitudes wrap toward the centre, never across the frame. */
export const Antimeridian: Story = {
  args: { lat: -16.9, lon: 179.2, city: "Suva", countryCode: "FJ", asn: null },
}

/** Southern hemisphere — Mercator's non-linear latitude handled by the projection. */
export const SouthernHemisphere: Story = {
  args: { lat: -23.55, lon: -46.63, city: "São Paulo", countryCode: "BR", asn: "AS28573" },
}

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: 16, maxWidth: 360 }}>
      <MiniLocationMap {...args} size="sm" />
      <MiniLocationMap {...args} size="md" />
      <MiniLocationMap {...args} size="lg" />
    </div>
  ),
}
