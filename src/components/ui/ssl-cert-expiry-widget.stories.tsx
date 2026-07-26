import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { SslCertExpiryWidget } from "@/components/ui/ssl-cert-expiry-widget"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */
const meta = {
  title: "Components/SslCertExpiryWidget",
  component: SslCertExpiryWidget,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    daysRemaining: { control: { type: "number" } },
    windowDays: { control: { type: "number" } },
    warnDays: { control: { type: "number" } },
    criticalDays: { control: { type: "number" } },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
  args: {
    daysRemaining: 62,
    windowDays: 90,
    domain: "api.example.com",
    label: "Certificate expiry",
    warnDays: 30,
    criticalDays: 7,
    size: "md",
  },
} satisfies Meta<typeof SslCertExpiryWidget>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const meter = canvas.getByRole("meter", { name: "Certificate expiry" })
    await expect(meter).toHaveAttribute("aria-valuetext", "Expires in 62d")
    const root = canvas
      .getByText("Certificate expiry")
      .closest("[data-slot=ssl-cert-expiry-widget]")
    await expect(root).toHaveAttribute("data-tone", "success")
  },
}

export const Warning: Story = {
  args: { daysRemaining: 21, domain: "gateway.example.com" },
}

export const Critical: Story = {
  args: { daysRemaining: 4, domain: "admin.example.com" },
}

export const Expired: Story = {
  args: { daysRemaining: -3, domain: "legacy.example.com" },
}

export const Fleet: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
      <SslCertExpiryWidget daysRemaining={74} domain="www.example.com" label="Healthy" />
      <SslCertExpiryWidget daysRemaining={19} domain="api.example.com" label="Soon" />
      <SslCertExpiryWidget daysRemaining={3} domain="vpn.example.com" label="Urgent" />
      <SslCertExpiryWidget daysRemaining={-8} domain="old.example.com" label="Expired" />
    </div>
  ),
}
