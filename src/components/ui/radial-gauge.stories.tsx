import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { RadialGauge } from "@/components/ui/radial-gauge"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar — stories do not hardcode a `.dark` wrapper. Demo layout uses plain
 * HTML wrappers so no `className` is ever passed to an AEGIS component.
 */
const meta = {
  title: "Components/RadialGauge",
  component: RadialGauge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    shape: { control: "inline-radio", options: ["gauge", "ring"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    tone: {
      control: "inline-radio",
      options: ["accent", "success", "warning", "danger", "neutral"],
    },
    thickness: {
      control: "inline-radio",
      options: ["thin", "regular", "thick"],
    },
    value: { control: { type: "range", min: 0, max: 100, step: 1 } },
    min: { control: { type: "number" } },
    max: { control: { type: "number" } },
    showValue: { control: "boolean" },
    valueLabel: { control: "text" },
  },
  args: {
    value: 72,
    shape: "gauge",
    size: "md",
    tone: "accent",
    thickness: "regular",
    showValue: true,
    label: "Security posture",
  },
} satisfies Meta<typeof RadialGauge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const meter = canvas.getByRole("meter", { name: "Security posture" })
    await expect(meter).toBeInTheDocument()
    await expect(meter).toHaveAttribute("aria-valuenow", "72")
    await expect(meter).toHaveAttribute("aria-valuemax", "100")
    await expect(
      meter.querySelector("[data-slot=radial-gauge-value]")
    ).not.toBeNull()
  },
}

export const Shapes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
      <RadialGauge value={72} shape="gauge" label="Gauge" />
      <RadialGauge value={72} shape="ring" label="Ring" />
    </div>
  ),
}

export const Tones: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
      <RadialGauge value={92} tone="success" label="Success" />
      <RadialGauge value={64} tone="accent" label="Accent" />
      <RadialGauge value={48} tone="warning" label="Warning" />
      <RadialGauge value={21} tone="danger" label="Danger" />
      <RadialGauge value={50} tone="neutral" label="Neutral" />
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
      <RadialGauge value={68} size="sm" label="Small" />
      <RadialGauge value={68} size="md" label="Medium" />
      <RadialGauge value={68} size="lg" label="Large" />
    </div>
  ),
}

export const Thickness: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
      <RadialGauge value={68} thickness="thin" label="Thin" />
      <RadialGauge value={68} thickness="regular" label="Regular" />
      <RadialGauge value={68} thickness="thick" label="Thick" />
    </div>
  ),
}

export const Extremes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
      <RadialGauge value={0} tone="danger" label="Empty" />
      <RadialGauge value={100} shape="ring" tone="success" label="Full ring" />
    </div>
  ),
}

/** A custom centre readout — e.g. a security grade ring. */
export const GradeRing: Story = {
  render: () => (
    <RadialGauge value={88} shape="ring" tone="success" label="Overall grade">
      <span
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "1.75rem",
          fontWeight: 700,
        }}
      >
        A
      </span>
    </RadialGauge>
  ),
}

/** Non-percentage range with a custom `valueLabel`. */
export const CustomRange: Story = {
  args: {
    value: 340,
    min: 0,
    max: 850,
    tone: "accent",
    valueLabel: "340",
    label: "Score out of 850",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const meter = canvas.getByRole("meter", { name: "Score out of 850" })
    await expect(meter).toHaveAttribute("aria-valuemax", "850")
    await expect(meter).toHaveAttribute("aria-valuetext", "340")
  },
}
