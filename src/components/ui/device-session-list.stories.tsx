import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn, userEvent, within } from "storybook/test"

import { DeviceSessionList } from "@/components/ui/device-session-list"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */
const meta = {
  title: "Components/DeviceSessionList",
  component: DeviceSessionList,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    onRevoke: { action: "revoke" },
  },
  args: {
    onRevoke: fn(),
    sessions: [
      {
        id: "s1",
        device: "MacBook Pro",
        type: "desktop",
        browser: "Chrome on macOS",
        location: "Tehran, IR",
        lastActive: "Active now",
        current: true,
      },
      {
        id: "s2",
        device: "iPhone 15",
        type: "mobile",
        browser: "Safari on iOS",
        location: "Tehran, IR",
        lastActive: "2h ago",
      },
      {
        id: "s3",
        device: "Windows PC",
        type: "desktop",
        browser: "Edge on Windows",
        location: "Berlin, DE",
        lastActive: "3d ago",
      },
    ],
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 560 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DeviceSessionList>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    // The current session is marked and has no revoke button.
    const current = canvas
      .getByText("MacBook Pro")
      .closest("[data-slot=device-session-list-item]")
    await expect(current).toHaveAttribute("data-current", "true")
    await expect(canvas.getByText("Current")).toBeInTheDocument()
    // Revoking a non-current session fires onRevoke with its id.
    const revokeButtons = canvas.getAllByRole("button", { name: /revoke/i })
    await userEvent.click(revokeButtons[0])
    await expect(args.onRevoke).toHaveBeenCalledWith("s2")
  },
}

export const SingleSession: Story = {
  args: {
    sessions: [
      {
        id: "s1",
        device: "MacBook Pro",
        type: "desktop",
        browser: "Chrome on macOS",
        location: "Tehran, IR",
        lastActive: "Active now",
        current: true,
      },
    ],
  },
}

export const DeviceTypes: Story = {
  args: {
    sessions: [
      {
        id: "s1",
        device: "MacBook Pro",
        type: "desktop",
        browser: "Chrome on macOS",
        location: "Tehran, IR",
        lastActive: "Active now",
        current: true,
      },
      {
        id: "s2",
        device: "iPhone 15",
        type: "mobile",
        browser: "Safari on iOS",
        lastActive: "2h ago",
      },
      {
        id: "s3",
        device: "iPad Air",
        type: "tablet",
        location: "Berlin, DE",
      },
      {
        id: "s4",
        device: "Unknown device",
      },
    ],
  },
}

export const Empty: Story = {
  args: { sessions: [] },
}
