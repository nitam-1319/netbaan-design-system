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
      <div className="dark bg-background p-10 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Card className="w-80">
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
    <Card className="w-80">
      <CardHeader className="border-b">
        <CardTitle>Coverage gap</CardTitle>
        <CardDescription>17 hosts are unmonitored.</CardDescription>
        <CardAction>
          <Badge variant="warning">Action</Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="text-muted-foreground text-sm">
        Enable monitoring to close the gap and improve your posture grade.
      </CardContent>
      <CardFooter className="border-t justify-end gap-2">
        <Button variant="ghost" size="sm">
          Dismiss
        </Button>
        <Button size="sm">Monitor all</Button>
      </CardFooter>
    </Card>
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
