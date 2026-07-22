import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"

import { LiveRegion } from "@/components/ui/live-region"
import { Button } from "@/components/ui/button"

const meta = {
  title: "Components/Live Region",
  component: LiveRegion,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof LiveRegion>

export default meta
type Story = StoryObj<typeof meta>

export const Polite: Story = {
  render: function PoliteRegion() {
    const [count, setCount] = React.useState(0)
    return (
      <div className="flex flex-col items-start gap-3">
        <Button onClick={() => setCount((c) => c + 1)}>Load more findings</Button>
        <LiveRegion visible politeness="polite">
          {count === 0
            ? "No findings loaded yet."
            : `${count} finding${count === 1 ? "" : "s"} loaded.`}
        </LiveRegion>
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Polite region exposes role=status and aria-live=polite.
    const region = canvas.getByRole("status")
    await expect(region).toHaveAttribute("aria-live", "polite")
    await expect(region).toHaveAttribute("aria-atomic", "true")
    await expect(region).toHaveTextContent("No findings loaded yet.")
    await userEvent.click(canvas.getByRole("button", { name: "Load more findings" }))
    await expect(region).toHaveTextContent("1 finding loaded.")
  },
}

export const Assertive: Story = {
  render: () => (
    <LiveRegion visible politeness="assertive">
      Scan failed — connection to the target timed out.
    </LiveRegion>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Assertive region is exposed as an alert.
    const region = canvas.getByRole("alert")
    await expect(region).toHaveAttribute("aria-live", "assertive")
  },
}

export const ScreenReaderOnly: Story = {
  render: function SrOnlyRegion() {
    const [msg, setMsg] = React.useState("")
    return (
      <div className="flex flex-col items-start gap-3">
        <Button onClick={() => setMsg("Copied CVE reference to clipboard.")}>
          Copy CVE
        </Button>
        <span className="text-sm text-muted-foreground">
          The confirmation below is announced to screen readers but hidden visually.
        </span>
        <LiveRegion>{msg}</LiveRegion>
      </div>
    )
  },
}
