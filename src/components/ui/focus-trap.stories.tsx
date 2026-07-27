import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, waitFor, within } from "storybook/test"

import { Button } from "@/components/ui/button"
import { FocusTrap } from "@/components/ui/focus-trap"

const meta = {
  title: "Components/Focus Trap",
  component: FocusTrap,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof FocusTrap>

export default meta
type Story = StoryObj<typeof meta>

/**
 * While the panel is open, `Tab` cycles only through its own controls; it never
 * escapes to the button behind it. Closing restores focus to the trigger.
 */
export const Default: Story = {
  render: function FocusTrapDemo() {
    const [open, setOpen] = React.useState(false)
    return (
      <div className="flex flex-col items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          Open trapped panel
        </Button>
        {open ? (
          <FocusTrap>
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Trapped panel"
              className="flex w-64 flex-col items-start gap-3 rounded-lg border border-border-strong bg-popover p-4 text-sm text-popover-foreground shadow-elevated"
            >
              <p>Tab stays inside this panel.</p>
              <input
                type="text"
                aria-label="A field"
                placeholder="A field"
                className="w-full rounded-md border border-border-strong bg-surface-2 px-2 py-1 text-sm text-foreground outline-none focus-visible:ring-3 focus-visible:ring-accent-soft"
              />
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  Secondary
                </Button>
                <Button variant="default" size="sm" onClick={() => setOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </FocusTrap>
        ) : null}
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole("button", { name: "Open trapped panel" })
    await userEvent.click(trigger)

    // Focus lands inside the panel on open.
    await waitFor(() =>
      expect(canvas.getByRole("dialog")).toContainElement(
        document.activeElement as HTMLElement
      )
    )

    // Tabbing forward past the last control wraps to the first — focus stays in.
    for (let i = 0; i < 6; i++) {
      await userEvent.tab()
      await expect(canvas.getByRole("dialog")).toContainElement(
        document.activeElement as HTMLElement
      )
    }

    // Closing restores focus to the trigger.
    await userEvent.click(canvas.getByRole("button", { name: "Close" }))
    await waitFor(() => expect(trigger).toHaveFocus())
  },
}

/**
 * `initialFocus` sends focus to a specific control instead of the first tabbable.
 */
export const InitialFocus: Story = {
  render: function InitialFocusDemo() {
    const confirmRef = React.useRef<HTMLButtonElement>(null)
    return (
      <FocusTrap initialFocus={confirmRef}>
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Confirm"
          className="flex w-64 flex-col items-start gap-3 rounded-lg border border-border-strong bg-popover p-4 text-sm text-popover-foreground shadow-elevated"
        >
          <p>Focus starts on “Confirm”, not “Cancel”.</p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              Cancel
            </Button>
            <Button ref={confirmRef} variant="default" size="sm">
              Confirm
            </Button>
          </div>
        </div>
      </FocusTrap>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await waitFor(() =>
      expect(canvas.getByRole("button", { name: "Confirm" })).toHaveFocus()
    )
  },
}
