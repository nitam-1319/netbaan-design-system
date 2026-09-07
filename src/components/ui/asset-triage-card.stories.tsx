import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { AssetTriageCard } from "@/components/ui/asset-triage-card"
import { MiniLocationMap } from "@/components/ui/mini-location-map"
import { ScreenshotThumb } from "@/components/ui/screenshot-thumb"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */

const SEVERITY_LABELS = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
  info: "Info",
}

/** Schematic, unprojected geometry — see the MiniLocationMap stories. */
const DEMO_GEOMETRY = {
  land: [
    [0, 40, 20, 40, 20, 60, 0, 60, 0, 40],
    [22, 44, 34, 44, 34, 54, 22, 54, 22, 44],
  ],
  borders: [
    [10, 40, 10, 60],
    [20, 40, 20, 60],
  ],
}

const meta = {
  title: "Components/AssetTriageCard",
  component: AssetTriageCard,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    grade: { control: "inline-radio", options: ["A", "B", "C", "D", "F", "Z"] },
    maxPorts: { control: { type: "number" } },
    href: { control: "text" },
  },
  args: {
    media: <ScreenshotThumb src={null} emptyLabel="No screenshot yet" />,
    title: "shop.example.com",
    subtitle: "SUBDOMAIN",
    statusLabel: "Active",
    statusTone: "success",
    severities: { critical: 1, high: 4, medium: 9, low: 2, info: 7 },
    severityLabels: SEVERITY_LABELS,
    chartLabel: "Findings by severity on shop.example.com",
    grade: "B",
    findings: "23 findings",
    href: "/asset-details?id=42",
  },
} satisfies Meta<typeof AssetTriageCard>

export default meta
type Story = StoryObj<typeof meta>

/** A domain: the media slot carries the site's capture. */
export const Domain: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole("link", { name: "shop.example.com" })
    ).toBeInTheDocument()
    // Centre total is summed from the rungs, never passed in.
    await expect(canvas.getByText("23")).toBeInTheDocument()
    await expect(canvas.getByText("Critical")).toBeInTheDocument()
  },
}

/** An IP: same anatomy, the map replaces the screenshot and ports appear. */
export const Ip: Story = {
  args: {
    media: (
      <MiniLocationMap
        label="Location of 203.0.113.7"
        geometry={DEMO_GEOMETRY}
        lat={50.11}
        lon={8.68}
        city="Frankfurt"
        countryCode="DE"
        asn="AS3320"
        emptyLabel="Location unknown"
      />
    ),
    title: "203.0.113.7",
    titleMeta: "Example Hosting",
    subtitle: "host-7.example.net",
    ports: [
      { port: 22, risky: true },
      { port: 80 },
      { port: 443 },
      { port: 3306, risky: true },
      { port: 8080 },
      { port: 9000 },
    ],
    portsLabel: "Ports",
    grade: "D",
    href: "/ip-details?id=7",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // maxPorts defaults to 4, so two of the six collapse into "+2".
    await expect(canvas.getByText("+2")).toBeInTheDocument()
    await expect(canvas.queryByText("9000")).not.toBeInTheDocument()
  },
}

/** Nothing found: the ring is empty and every count is muted, but all five
 * rungs still appear — an absent rung is information. */
export const Clean: Story = {
  args: {
    severities: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
    grade: "A",
    findings: "0 findings",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("Info")).toBeInTheDocument()
  },
}

/** A grade outside A–F falls back to the C style rather than rendering untoned. */
export const UnmappedGrade: Story = {
  args: { grade: "Z" },
}

/** Everything optional omitted: media, name, and severities only. */
export const Minimal: Story = {
  args: {
    statusLabel: undefined,
    subtitle: undefined,
    titleMeta: undefined,
    grade: undefined,
    findings: undefined,
    ports: undefined,
    href: undefined,
  },
}

export const Grid: Story = {
  render: (args) => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
        gap: 16,
      }}
    >
      <AssetTriageCard {...args} />
      <AssetTriageCard
        {...args}
        title="api.example.com"
        grade="F"
        severities={{ critical: 6, high: 11, medium: 3, low: 0, info: 4 }}
        findings="24 findings"
      />
      <AssetTriageCard
        {...args}
        title="static.example.com"
        grade="A"
        statusTone="neutral"
        statusLabel="Idle"
        severities={{ critical: 0, high: 0, medium: 1, low: 2, info: 5 }}
        findings="8 findings"
      />
    </div>
  ),
}
