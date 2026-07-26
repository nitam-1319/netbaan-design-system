import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import {
  ReducedMotion,
  usePrefersReducedMotion,
} from "@/components/ui/reduced-motion"

const meta = {
  title: "Components/Reduced Motion",
  component: ReducedMotion,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ReducedMotion>

export default meta
type Story = StoryObj<typeof meta>

export const Gate: Story = {
  render: () => (
    <ReducedMotion
      whenReduced={
        <p className="text-sm text-muted-foreground">
          Reduced motion is on — showing the calm, static version.
        </p>
      }
    >
      <p className="text-sm text-foreground">
        Full motion — showing the animated version.
      </p>
    </ReducedMotion>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // The default test environment does not request reduced motion, so the
    // full-motion branch renders.
    await expect(
      canvas.getByText("Full motion — showing the animated version.")
    ).toBeVisible()
  },
}

export const RenderProp: Story = {
  render: () => (
    <ReducedMotion>
      {(reduced) => (
        <p className="text-sm text-foreground">
          Preference: <strong>{reduced ? "reduce" : "no-preference"}</strong>
        </p>
      )}
    </ReducedMotion>
  ),
}

export const HookReadout: Story = {
  render: function HookReadout() {
    const reduced = usePrefersReducedMotion()
    return (
      <div className="flex flex-col items-center gap-2 text-sm">
        <span className="text-muted-foreground">usePrefersReducedMotion()</span>
        <span
          data-testid="value"
          className="rounded-md bg-muted px-2 py-1 font-mono text-foreground"
        >
          {String(reduced)}
        </span>
        <p className="max-w-xs text-center text-xs text-muted-foreground">
          Toggle "Reduce motion" in your OS accessibility settings to see this
          update live.
        </p>
      </div>
    )
  },
}
