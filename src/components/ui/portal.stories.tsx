import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, waitFor, within } from "storybook/test"

import { Button } from "@/components/ui/button"
import { Portal } from "@/components/ui/portal"

const meta = {
  title: "Components/Portal",
  component: Portal,
  parameters: {
    layout: "centered",
  },
  // Each story supplies its own subtree via a local render; this satisfies the
  // required `children` prop for the render-only stories.
  args: {
    children: null,
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Portal>

export default meta
type Story = StoryObj<typeof meta>

/**
 * A panel teleported to `document.body` escapes an `overflow:hidden` ancestor
 * that would otherwise clip it.
 */
export const Default: Story = {
  render: function PortalDemo() {
    const [open, setOpen] = React.useState(false)
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="h-20 w-56 overflow-hidden rounded-lg border border-border-strong bg-surface-2 p-3 text-sm text-muted-foreground">
          This clipping box has <code>overflow:hidden</code>.
          <div className="mt-2">
            <Button variant="outline" size="sm" onClick={() => setOpen((o) => !o)}>
              {open ? "Hide" : "Show"} portalled panel
            </Button>
          </div>
        </div>
        {open ? (
          <Portal>
            <div
              data-testid="portalled-panel"
              className="fixed bottom-6 end-6 w-64 rounded-lg border border-border-strong bg-popover p-4 text-sm text-popover-foreground shadow-elevated"
            >
              I render into <code>&lt;body&gt;</code>, so the clipping box never cuts me off.
            </div>
          </Portal>
        ) : null}
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // The portalled node lives outside canvasElement (in <body>), so query the document.
    const body = within(document.body)
    await userEvent.click(canvas.getByRole("button", { name: /Show portalled panel/i }))
    await waitFor(() =>
      expect(body.getByTestId("portalled-panel")).toBeInTheDocument()
    )
    // It is NOT a descendant of the clipping box / story canvas.
    await expect(canvasElement.contains(body.getByTestId("portalled-panel"))).toBe(false)
    await userEvent.click(canvas.getByRole("button", { name: /Hide portalled panel/i }))
    await waitFor(() =>
      expect(body.queryByTestId("portalled-panel")).not.toBeInTheDocument()
    )
  },
}

/**
 * `container` targets a specific mount point instead of `document.body`.
 */
export const CustomContainer: Story = {
  render: function CustomContainerDemo() {
    const hostRef = React.useRef<HTMLDivElement>(null)
    const [ready, setReady] = React.useState(false)
    // The host exists only after mount; flip a flag so the lazy getter resolves it.
    React.useEffect(() => setReady(true), [])
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-xs text-muted-foreground">
          The badge below is portalled into the dashed host, not rendered where it is written.
        </p>
        {ready ? (
          <Portal container={() => hostRef.current}>
            <span className="rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
              Portalled here
            </span>
          </Portal>
        ) : null}
        <div
          ref={hostRef}
          data-testid="custom-host"
          className="flex min-h-12 min-w-48 items-center justify-center rounded-lg border border-dashed border-border-strong p-2"
        />
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await waitFor(() =>
      expect(canvas.getByTestId("custom-host")).toContainElement(
        canvas.getByText("Portalled here")
      )
    )
  },
}

/**
 * `disabled` renders the children inline, in place — no teleport.
 */
export const Disabled: Story = {
  render: () => (
    <div
      data-testid="inline-host"
      className="rounded-lg border border-border-strong bg-surface-2 p-4 text-sm text-foreground"
    >
      <Portal disabled>
        <span className="font-medium">I stay right here (disabled).</span>
      </Portal>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByTestId("inline-host")).toContainElement(
      canvas.getByText("I stay right here (disabled).")
    )
  },
}
