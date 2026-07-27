import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { HostsByCountryMap } from "@/components/ui/hosts-by-country-map"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Paths below are simple demo polygons in the map's viewBox space — in
 * a real app you project topology upstream and pass the resulting `d` strings.
 * Demo layout uses plain HTML wrappers so no `className` / `style` is ever passed
 * to an AEGIS component.
 */

const SAMPLE = [
  { id: "US", label: "United States", d: "M120 180 L320 180 L320 300 L120 300 Z", hosts: 4210 },
  { id: "DE", label: "Germany", d: "M470 150 L540 150 L540 210 L470 210 Z", hosts: 1870 },
  { id: "GB", label: "United Kingdom", d: "M430 140 L465 140 L465 195 L430 195 Z", hosts: 1340 },
  { id: "IN", label: "India", d: "M640 300 L720 300 L720 380 L640 380 Z", hosts: 980 },
  { id: "BR", label: "Brazil", d: "M300 380 L400 380 L400 500 L300 500 Z", hosts: 640 },
  { id: "JP", label: "Japan", d: "M800 210 L850 210 L850 280 L800 280 Z", hosts: 415 },
  { id: "AU", label: "Australia", d: "M760 440 L880 440 L880 540 L760 540 Z", hosts: 120 },
  { id: "ZA", label: "South Africa", d: "M500 470 L560 470 L560 540 L500 540 Z" },
]

const meta = {
  title: "Components/HostsByCountryMap",
  component: HostsByCountryMap,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    steps: { control: { type: "number" } },
    topCount: { control: { type: "number" } },
    showLegend: { control: "boolean" },
    showRanking: { control: "boolean" },
  },
  args: {
    label: "Hosts by country",
    countries: SAMPLE,
    steps: 5,
    topCount: 5,
    showLegend: true,
    showRanking: true,
  },
} satisfies Meta<typeof HostsByCountryMap>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <div style={{ maxWidth: 620 }}>
      <HostsByCountryMap {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Fleet total 4210+1870+1340+980+640+415+120 = 9575 hosts across 7 countries.
    const root = canvas
      .getByText("Hosts by country")
      .closest("[data-slot=hosts-by-country-map]")
    await expect(root).toHaveAttribute(
      "aria-label",
      "Hosts by country — 9,575 hosts across 7 countries"
    )
    // The map is rendered as a labelled image.
    await expect(
      canvas.getByRole("img", {
        name: "Hosts by country — 9,575 hosts across 7 countries",
      })
    ).toBeInTheDocument()
    // Top country by hosts leads the ranking.
    const ranking = root?.querySelector("[data-slot=hosts-by-country-map-ranking]")
    await expect(ranking).toBeInTheDocument()
    await expect(within(ranking as HTMLElement).getByText("United States")).toBeInTheDocument()
    await expect(within(ranking as HTMLElement).getByText("4,210")).toBeInTheDocument()
  },
}

export const NoRanking: Story = {
  args: { showRanking: false },
  render: (args) => (
    <div style={{ maxWidth: 620 }}>
      <HostsByCountryMap {...args} />
    </div>
  ),
}

export const TopThree: Story = {
  args: { topCount: 3 },
  render: (args) => (
    <div style={{ maxWidth: 620 }}>
      <HostsByCountryMap {...args} />
    </div>
  ),
}

export const NoLegend: Story = {
  args: { showLegend: false },
  render: (args) => (
    <div style={{ maxWidth: 620 }}>
      <HostsByCountryMap {...args} />
    </div>
  ),
}
