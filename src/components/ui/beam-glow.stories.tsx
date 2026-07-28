import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"
import { Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { BeamGlow } from "@/components/ui/beam-glow"

const meta = {
  title: "Components/Beam Glow",
  component: BeamGlow,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof BeamGlow>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <BeamGlow>
      <div className="flex w-64 flex-col items-start gap-2">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
          <Sparkles className="size-4 text-accent-strong" aria-hidden />
          Upgrade to Pro
        </span>
        <p className="text-sm text-muted-foreground">
          Continuous scanning, unlimited assets, and priority remediation.
        </p>
        <Button variant="primary" size="sm">
          Start trial
        </Button>
      </div>
    </BeamGlow>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("Upgrade to Pro")).toBeVisible()
    // The decorative frame is present around the content.
    await expect(
      canvasElement.querySelector('[data-slot="beam-glow"]')
    ).not.toBeNull()
    await expect(
      canvas.getByRole("button", { name: "Start trial" })
    ).toBeVisible()
  },
}

export const WithGlow: Story = {
  render: () => (
    <BeamGlow glow speed="fast">
      <div className="flex w-64 flex-col items-center gap-1 text-center">
        <span className="text-sm font-semibold text-foreground">
          Live threat feed
        </span>
        <p className="text-xs text-muted-foreground">
          Faster beam + accent bloom for a raised, active surface.
        </p>
      </div>
    </BeamGlow>
  ),
}

export const Radii: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      {(["sm", "md", "lg"] as const).map((radius) => (
        <BeamGlow key={radius} radius={radius} size="sm">
          <span className="block w-24 text-center text-xs font-medium text-foreground">
            radius={radius}
          </span>
        </BeamGlow>
      ))}
    </div>
  ),
}

export const Pill: Story = {
  render: () => (
    <BeamGlow radius="full" size="sm">
      <span className="inline-flex items-center gap-1.5 px-3 text-sm font-semibold text-foreground">
        <Sparkles className="size-4 text-accent-strong" aria-hidden />
        New
      </span>
    </BeamGlow>
  ),
}

export const Static: Story = {
  render: () => (
    <BeamGlow active={false}>
      <div className="w-64 text-sm text-muted-foreground">
        With <code>active=false</code> the beam ring is shown but does not spin.
      </div>
    </BeamGlow>
  ),
  play: async ({ canvasElement }) => {
    // The decorative frame is present…
    const frame = canvasElement.querySelector('[data-slot="beam-glow"]')
    await expect(frame).not.toBeNull()
    // …but with active={false} the beam ring is static (no spin animation).
    await expect(
      canvasElement.querySelector(".animate-beam-spin")
    ).toBeNull()
    await expect(
      canvasElement.querySelector(".animate-beam-spin-fast")
    ).toBeNull()
  },
}
