import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"
import { Info, CircleCheck, TriangleAlert, ShieldAlert } from "lucide-react"

import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

const meta = {
  title: "Components/Alert",
  component: Alert,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="max-w-lg p-8 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Alert>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Alert>
      <Info />
      <AlertTitle>Scan scheduled</AlertTitle>
      <AlertDescription>
        The next discovery scan runs tonight at 02:00 UTC.
      </AlertDescription>
    </Alert>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const alert = canvas.getByRole("alert")
    await expect(alert).toHaveTextContent(/Scan scheduled/)
  },
}

export const Variants: Story = {
  render: () => (
    <div className="space-y-3">
      <Alert variant="info">
        <Info />
        <AlertTitle>New assets discovered</AlertTitle>
        <AlertDescription>12 hosts were added to your inventory.</AlertDescription>
      </Alert>
      <Alert variant="success">
        <CircleCheck />
        <AlertTitle>Posture improved</AlertTitle>
        <AlertDescription>Your grade rose from B to A− this week.</AlertDescription>
      </Alert>
      <Alert variant="warning">
        <TriangleAlert />
        <AlertTitle>Certificate expiring</AlertTitle>
        <AlertDescription>api.netbaan.io expires in 6 days.</AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <ShieldAlert />
        <AlertTitle>Critical vulnerability</AlertTitle>
        <AlertDescription>
          CVE-2025-0042 is exploitable on 3 exposed hosts.
        </AlertDescription>
      </Alert>
    </div>
  ),
}

export const TitleOnly: Story = {
  render: () => (
    <Alert variant="warning">
      <TriangleAlert />
      <AlertTitle>4 findings require review</AlertTitle>
    </Alert>
  ),
}
