import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from "@/components/ui/card"

const meta = {
  title: "Components/Card",
  component: Card,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="p-10 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="w-80">
      <Card>
        <CardHeader>
          <CardTitle>Attack surface</CardTitle>
          <CardDescription>
            Externally reachable services discovered this week.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold tracking-tight">128</p>
          <p className="text-muted-foreground text-sm">+12 vs. last scan</p>
        </CardContent>
      </Card>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("Attack surface")).toBeVisible()
    await expect(
      canvasElement.querySelector("[data-slot='card']")
    ).toBeInTheDocument()
  },
}

export const WithActionAndFooter: Story = {
  render: () => (
    <div className="w-80">
      <Card>
        <CardHeader>
          <CardTitle>Coverage gap</CardTitle>
          <CardDescription>17 hosts are unmonitored.</CardDescription>
          <CardAction>
            <Badge tone="warning">Action</Badge>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground text-sm">
            Enable monitoring to close the gap and improve your posture grade.
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex w-full justify-end gap-2">
            <Button variant="ghost" size="sm">
              Dismiss
            </Button>
            <Button size="sm">Monitor all</Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvasElement.querySelector("[data-slot='card-action']")
    ).toBeInTheDocument()
    await expect(
      canvas.getByRole("button", { name: "Monitor all" })
    ).toBeEnabled()
  },
}

export const Elevated: Story = {
  render: () => (
    <div className="w-80">
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Featured finding</CardTitle>
          <CardDescription>
            Deep, overlay-grade elevation for a card that floats above content.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Uses the signature <code>--shadow</code> token.
          </p>
        </CardContent>
      </Card>
    </div>
  ),
}

export const Beam: Story = {
  name: "Beam (animated border)",
  render: () => (
    <div className="w-80">
      <Card variant="beam">
        <CardHeader>
          <CardTitle>Live scan</CardTitle>
          <CardDescription>
            The signature rotating beam frames the card while work is in flight.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold tracking-tight">Running…</p>
          <p className="text-muted-foreground text-sm">42 of 128 hosts scanned</p>
        </CardContent>
        <CardFooter>
          <div className="flex w-full justify-end">
            <Button variant="primary" size="sm">
              View progress
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvasElement.querySelector("[data-variant='beam']")
    ).toBeInTheDocument()
    await expect(canvas.getByText("Live scan")).toBeVisible()
  },
}
