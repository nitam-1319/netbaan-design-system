import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, screen, within } from "storybook/test"

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
    await expect(await screen.findByText("Scan queued")).toBeVisible()
    await expect(
      screen.getByText("api-gw-prod.netbaan.io will be scanned shortly.")
    ).toBeVisible()
    // Dismiss it via the close control.
    const close = screen.getByRole("button", { name: "Close" })
    await userEvent.click(close)
    await expect(screen.queryByText("Scan queued")).not.toBeInTheDocument()
  },
}

export const Success: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: "Success" }))
    await expect(await screen.findByText("Finding remediated")).toBeVisible()
  },
}
