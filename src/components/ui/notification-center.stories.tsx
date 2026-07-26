import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"

import { NotificationCenter } from "@/components/ui/notification-center"
import { Button } from "@/components/ui/button"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. The panel is controlled; these stories manage `open` locally. Demo
 * layout uses plain HTML wrappers so no `className` / `style` is ever passed to
 * an AEGIS component.
 */
const NOTIFICATIONS = [
  {
    id: "n1",
    title: "Critical finding on admin.example.com",
    description: "Exposed admin panel without authentication.",
    time: "2m ago",
    read: false,
  },
  {
    id: "n2",
    title: "Scan completed",
    description: "1,240 of 1,380 assets scanned.",
    time: "1h ago",
    read: false,
  },
  {
    id: "n3",
    title: "Certificate renewed",
    description: "api.example.com is valid for 90 more days.",
    time: "Yesterday",
    read: true,
  },
]

const meta = {
  title: "Components/NotificationCenter",
  component: NotificationCenter,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    side: { control: "inline-radio", options: ["right", "left", "top", "bottom"] },
    onNotificationClick: { action: "notificationClick" },
    onDismiss: { action: "dismiss" },
    onMarkAllRead: { action: "markAllRead" },
  },
  args: {
    notifications: NOTIFICATIONS,
    title: "Notifications",
    side: "right",
  },
} satisfies Meta<typeof NotificationCenter>

export default meta
type Story = StoryObj<typeof meta>

function Demo(args: React.ComponentProps<typeof NotificationCenter>) {
  const [open, setOpen] = React.useState(false)
  return (
    <NotificationCenter
      {...args}
      open={open}
      onOpenChange={setOpen}
      trigger={<Button variant="primary">Open notifications</Button>}
    />
  )
}

export const Default: Story = {
  render: (args) => <Demo {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: /open notifications/i }))
    const body = within(document.body)
    // Two unread → count badge shows "2".
    await expect(await body.findByText("2")).toBeInTheDocument()
    await expect(
      body.getByText("Critical finding on admin.example.com")
    ).toBeInTheDocument()
  },
}

export const AllRead: Story = {
  render: (args) => <Demo {...args} />,
  args: {
    notifications: NOTIFICATIONS.map((n) => ({ ...n, read: true })),
  },
}

export const Empty: Story = {
  render: (args) => <Demo {...args} />,
  args: { notifications: [] },
}
