import type { Meta, StoryObj } from "@storybook/react-vite"
import * as React from "react"
import { expect, userEvent, waitFor, within } from "storybook/test"

import { Transition, Fade, Slide, Scale } from "@/components/ui/fade-slide-scale"
import { Button } from "@/components/ui/button"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */
const meta = {
  title: "Components/FadeSlideScale",
  component: Transition,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    preset: {
      control: "select",
      options: [
        "fade",
        "slide-up",
        "slide-down",
        "slide-left",
        "slide-right",
        "scale",
        "scale-fade",
      ],
    },
    speed: { control: "inline-radio", options: ["fast", "default", "slow"] },
    open: { control: "boolean" },
    appear: { control: "boolean" },
  },
} satisfies Meta<typeof Transition>

export default meta
type Story = StoryObj<typeof meta>

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border-strong bg-card px-4 py-3 text-sm text-foreground">
      {children}
    </div>
  )
}

export const Default: Story = {
  args: { open: true, preset: "slide-up", speed: "default" },
  render: (args) => {
    const [open, setOpen] = React.useState(true)
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start" }}>
        <Button onClick={() => setOpen((o) => !o)}>{open ? "Hide" : "Show"}</Button>
        <div style={{ minHeight: 64 }}>
          <Transition {...args} open={open}>
            <Panel>Transitioned panel</Panel>
          </Transition>
        </div>
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    expect(canvas.getByText("Transitioned panel")).toBeInTheDocument()
    await userEvent.click(canvas.getByRole("button", { name: "Hide" }))
    await waitFor(() =>
      expect(canvas.queryByText("Transitioned panel")).not.toBeInTheDocument()
    )
    await userEvent.click(canvas.getByRole("button", { name: "Show" }))
    await waitFor(() => expect(canvas.getByText("Transitioned panel")).toBeInTheDocument())
  },
}

export const Presets: Story = {
  render: () => {
    const [open, setOpen] = React.useState(true)
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start" }}>
        <Button onClick={() => setOpen((o) => !o)}>{open ? "Hide all" : "Show all"}</Button>
        <div style={{ display: "flex", gap: 12, minHeight: 64 }}>
          <Fade open={open}>
            <Panel>Fade</Panel>
          </Fade>
          <Slide open={open} from="left">
            <Panel>Slide</Panel>
          </Slide>
          <Scale open={open} fade>
            <Panel>Scale</Panel>
          </Scale>
        </div>
      </div>
    )
  },
}
