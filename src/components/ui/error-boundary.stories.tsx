import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, waitFor, within } from "storybook/test"

import { Button } from "@/components/ui/button"
import { ErrorBoundary } from "@/components/ui/error-boundary"

const meta = {
  title: "Components/Error Boundary",
  component: ErrorBoundary,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ErrorBoundary>

export default meta
type Story = StoryObj<typeof meta>

/** A child that throws on render once `broken` is set. */
function Bomb({ broken }: { broken: boolean }) {
  if (broken) {
    throw new Error("Widget failed to render (simulated).")
  }
  return <p className="text-sm text-muted-foreground">Widget is healthy.</p>
}

export const Recovers: Story = {
  render: function RecoveringBoundary() {
    const [broken, setBroken] = React.useState(false)
    return (
      <ErrorBoundary
        onReset={() => setBroken(false)}
        resetKeys={[broken]}
        showErrorDetail
      >
        <div className="flex flex-col items-center gap-3">
          <Bomb broken={broken} />
          <Button variant="outline" size="sm" onClick={() => setBroken(true)}>
            Break the widget
          </Button>
        </div>
      </ErrorBoundary>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Healthy first.
    await expect(canvas.getByText("Widget is healthy.")).toBeVisible()
    // Break it → the boundary shows the recoverable error surface.
    await userEvent.click(
      canvas.getByRole("button", { name: "Break the widget" })
    )
    const alert = await canvas.findByRole("alert")
    await expect(alert).toBeVisible()
    await expect(
      canvas.getByRole("heading", { name: "Something went wrong" })
    ).toBeVisible()
    // Retry resets the cause and re-renders the healthy subtree.
    await userEvent.click(canvas.getByRole("button", { name: "Try again" }))
    await waitFor(() =>
      expect(canvas.getByText("Widget is healthy.")).toBeVisible()
    )
  },
}

export const CustomMessage: Story = {
  render: function CustomMessageBoundary() {
    const [broken, setBroken] = React.useState(false)
    return (
      <ErrorBoundary
        onReset={() => setBroken(false)}
        resetKeys={[broken]}
        title="Chart unavailable"
        description="The metrics service didn't respond. You can retry in a moment."
      >
        <div className="flex flex-col items-center gap-3">
          <Bomb broken={broken} />
          <Button variant="outline" size="sm" onClick={() => setBroken(true)}>
            Simulate outage
          </Button>
        </div>
      </ErrorBoundary>
    )
  },
}

export const RenderPropFallback: Story = {
  render: function RenderPropBoundary() {
    const [broken, setBroken] = React.useState(false)
    return (
      <ErrorBoundary
        onReset={() => setBroken(false)}
        resetKeys={[broken]}
        fallback={({ error, reset }) => (
          <div className="flex flex-col items-center gap-2 text-sm">
            <p className="font-mono text-destructive">{error.message}</p>
            <Button variant="primary" size="sm" onClick={reset}>
              Reload widget
            </Button>
          </div>
        )}
      >
        <div className="flex flex-col items-center gap-3">
          <Bomb broken={broken} />
          <Button variant="outline" size="sm" onClick={() => setBroken(true)}>
            Break the widget
          </Button>
        </div>
      </ErrorBoundary>
    )
  },
}
