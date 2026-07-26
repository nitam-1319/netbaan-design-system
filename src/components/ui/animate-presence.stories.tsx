import type { Meta, StoryObj } from "@storybook/react-vite"
import * as React from "react"
import { expect, userEvent, waitFor, within } from "storybook/test"

import { AnimatePresence } from "@/components/ui/animate-presence"
import { Button } from "@/components/ui/button"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */
const meta = {
  title: "Components/AnimatePresence",
  component: AnimatePresence,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    present: { control: "boolean" },
    duration: { control: { type: "number" } },
    appear: { control: "boolean" },
  },
} satisfies Meta<typeof AnimatePresence>

export default meta
type Story = StoryObj<typeof meta>

function Demo({ appear = false }: { appear?: boolean }) {
  const [open, setOpen] = React.useState(true)
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start" }}>
      <Button onClick={() => setOpen((o) => !o)}>{open ? "Hide" : "Show"}</Button>
      <div style={{ minHeight: 64 }}>
        <AnimatePresence present={open} duration={200} appear={appear}>
          <div
            data-slot="presence-demo"
            className="rounded-xl border border-border-strong bg-card px-4 py-3 text-sm text-foreground transition-[opacity,transform] duration-200 ease-out data-[state=closed]:translate-y-2 data-[state=closed]:opacity-0 motion-reduce:transition-none motion-reduce:transform-none"
          >
            I animate in and out.
          </div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export const Default: Story = {
  args: { present: true, duration: 200, appear: false },
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Present from the start.
    expect(canvas.getByText("I animate in and out.")).toBeInTheDocument()
    // Hide → leave transition plays, then the node unmounts after `duration`.
    await userEvent.click(canvas.getByRole("button", { name: "Hide" }))
    await waitFor(() =>
      expect(canvas.queryByText("I animate in and out.")).not.toBeInTheDocument()
    )
    // Show again → it comes back.
    await userEvent.click(canvas.getByRole("button", { name: "Show" }))
    await waitFor(() =>
      expect(canvas.getByText("I animate in and out.")).toBeInTheDocument()
    )
  },
}

export const AppearOnMount: Story = {
  args: { present: true, duration: 200, appear: true },
  render: () => <Demo appear />,
}
