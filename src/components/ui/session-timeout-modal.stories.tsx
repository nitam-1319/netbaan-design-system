import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, screen, within } from "storybook/test"

import { SessionTimeoutModal } from "@/components/ui/session-timeout-modal"
import { Button } from "@/components/ui/button"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. The modal is controlled; these stories manage `open` locally with a
 * trigger. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */
const meta = {
  title: "Components/SessionTimeoutModal",
  component: SessionTimeoutModal,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    countdownSeconds: { control: { type: "number" } },
    onExtend: { action: "extend" },
    onLogout: { action: "logout" },
    onTimeout: { action: "timeout" },
  },
  args: {
    open: false,
    countdownSeconds: 60,
    title: "Your session is about to expire",
  },
} satisfies Meta<typeof SessionTimeoutModal>

export default meta
type Story = StoryObj<typeof meta>

function Demo(args: React.ComponentProps<typeof SessionTimeoutModal>) {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        Simulate idle
      </Button>
      <SessionTimeoutModal {...args} open={open} onOpenChange={setOpen} />
    </>
  )
}

export const Default: Story = {
  render: (args) => <Demo {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: /simulate idle/i }))
    // Dialog content is portalled to the body.
    const body = within(document.body)
    await expect(
      await body.findByText("Your session is about to expire")
    ).toBeInTheDocument()
    await expect(body.getByRole("progressbar")).toBeInTheDocument()
    await expect(
      body.getByRole("button", { name: /stay signed in/i })
    ).toBeInTheDocument()
    void screen
  },
}

export const ShortCountdown: Story = {
  render: (args) => <Demo {...args} />,
  args: { countdownSeconds: 15 },
}

export const AlwaysOpen: Story = {
  render: (args) => <SessionTimeoutModal {...args} open onOpenChange={() => {}} />,
  args: { countdownSeconds: 45 },
}
