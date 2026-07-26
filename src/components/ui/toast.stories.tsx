import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, screen, waitFor, within } from "storybook/test"

import { ToastProvider, Toaster, useToast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"

const meta = {
  title: "Components/Toast",
  component: Toaster,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
        <Toaster />
      </ToastProvider>
    ),
  ],
} satisfies Meta<typeof Toaster>

export default meta
type Story = StoryObj<typeof meta>

function Demo() {
  const toast = useToast()
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        onClick={() =>
          toast.add({
            title: "Scan queued",
            description: "api-gw-prod.netbaan.io will be scanned shortly.",
          })
        }
      >
        Default
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.add({
            type: "success",
            title: "Finding remediated",
            description: "CVE-2026-1043 was marked as resolved.",
          })
        }
      >
        Success
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.add({
            type: "error",
            title: "Export failed",
            description: "The report service timed out. Try again.",
            priority: "high",
          })
        }
      >
        Error
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.add({
            type: "info",
            title: "New scan engine available",
            description: "Upgrade to enable passive discovery.",
            actionProps: { children: "Upgrade" },
          })
        }
      >
        With action
      </Button>
    </div>
  )
}

export const Default: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole("button", { name: "Default" })
    await userEvent.click(trigger)
    // Toast content portals to the body; assert it announced and is visible.
    const toastTitle = await screen.findByText("Scan queued")
    await waitFor(() => expect(toastTitle).toBeVisible())
    await expect(
      screen.getByText("api-gw-prod.netbaan.io will be scanned shortly.")
    ).toBeVisible()
    // Base UI keeps toast controls out of the a11y tree until the viewport is
    // hovered/focused (so a toast never steals focus); hover to reveal Close.
    await userEvent.hover(toastTitle)
    const close = await screen.findByRole("button", { name: "Close" })
    await userEvent.click(close)
    await waitFor(() =>
      expect(screen.queryByText("Scan queued")).not.toBeInTheDocument()
    )
  },
}

export const Success: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: "Success" }))
    const successTitle = await screen.findByText("Finding remediated")
    await waitFor(() => expect(successTitle).toBeVisible())
  },
}
