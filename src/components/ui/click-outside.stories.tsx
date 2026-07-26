import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, waitFor, within } from "storybook/test"

import { Button } from "@/components/ui/button"
import { ClickOutside } from "@/components/ui/click-outside"

const meta = {
  title: "Components/Click Outside",
  component: ClickOutside,
  parameters: {
    layout: "centered",
  },
  // Each story supplies its own handler via a local render; this satisfies the
  // required prop for the render-only stories.
  args: {
    onClickOutside: () => {},
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ClickOutside>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: function ClickOutsideDemo() {
    const [open, setOpen] = React.useState(false)
    return (
      <div className="flex flex-col items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          Open panel
        </Button>
        <p className="text-xs text-muted-foreground">
          Then click anywhere outside the panel to dismiss it.
        </p>
        {open ? (
          <ClickOutside onClickOutside={() => setOpen(false)}>
            <div className="w-56 rounded-lg border border-border-strong bg-popover p-4 text-sm text-popover-foreground shadow-elevated">
              I dismiss myself when you interact outside me.
            </div>
          </ClickOutside>
        ) : null}
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: "Open panel" }))
    await expect(
      canvas.getByText("I dismiss myself when you interact outside me.")
    ).toBeVisible()
    // A pointer interaction outside the panel dismisses it.
    await userEvent.click(
      canvas.getByText("Then click anywhere outside the panel to dismiss it.")
    )
    await waitFor(() =>
      expect(
        canvas.queryByText("I dismiss myself when you interact outside me.")
      ).not.toBeInTheDocument()
    )
  },
}

export const StaysOpenOnInsideClick: Story = {
  render: function InsideClickDemo() {
    const [open, setOpen] = React.useState(true)
    const [count, setCount] = React.useState(0)
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-xs text-muted-foreground">
          Clicks inside the panel don't dismiss it.
        </p>
        {open ? (
          <ClickOutside onClickOutside={() => setOpen(false)}>
            <div className="flex w-56 flex-col items-start gap-2 rounded-lg border border-border-strong bg-popover p-4 text-sm text-popover-foreground shadow-elevated">
              <span>Interactions inside are safe.</span>
              <Button variant="ghost" size="sm" onClick={() => setCount((c) => c + 1)}>
                Clicked {count} times
              </Button>
            </div>
          </ClickOutside>
        ) : (
          <p className="text-sm text-muted-foreground">Dismissed.</p>
        )}
      </div>
    )
  },
}

export const Polymorphic: Story = {
  render: function PolymorphicDemo() {
    const [open, setOpen] = React.useState(true)
    return open ? (
      <ClickOutside onClickOutside={() => setOpen(false)} render={<section />}>
        <div className="w-56 rounded-lg border border-border-strong bg-popover p-4 text-sm text-popover-foreground shadow-elevated">
          The wrapper is rendered as a <code>&lt;section&gt;</code> via{" "}
          <code>render</code>.
        </div>
      </ClickOutside>
    ) : (
      <p className="text-sm text-muted-foreground">Dismissed.</p>
    )
  },
}
