import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, screen, waitFor, within } from "storybook/test"

import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const meta = {
  title: "Components/HoverCard",
  component: HoverCard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="p-16 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof HoverCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger
        render={
          <a
            href="#ada"
            className="font-medium text-primary underline underline-offset-4"
          >
            @ada
          </a>
        }
      />
      <HoverCardContent>
        <div className="flex gap-3">
          <Avatar>
            <AvatarFallback>AL</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-semibold text-foreground">Ada Lovelace</p>
            <p className="text-muted-foreground">
              First programmer. Writes about analytical engines and looping.
            </p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole("link", { name: "@ada" })
    await userEvent.hover(trigger)
    // Portalled content lands on document.body.
    const card = await screen.findByText("Ada Lovelace")
    await waitFor(() => expect(card).toBeVisible())
  },
}

export const WithArrow: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger
        render={
          <a
            href="#repo"
            className="font-medium text-primary underline underline-offset-4"
          >
            aegis/design-system
          </a>
        }
      />
      <HoverCardContent showArrow>
        <p className="font-semibold text-foreground">aegis/design-system</p>
        <p className="mt-1 text-muted-foreground">
          A closed-API component library on Base UI. TypeScript · MIT.
        </p>
      </HoverCardContent>
    </HoverCard>
  ),
}

export const Sides: Story = {
  render: () => (
    <div className="flex gap-10">
      <HoverCard>
        <HoverCardTrigger
          render={<span className="cursor-default text-primary">Top</span>}
        />
        <HoverCardContent side="top">Opens above the trigger.</HoverCardContent>
      </HoverCard>
      <HoverCard>
        <HoverCardTrigger
          render={<span className="cursor-default text-primary">Right</span>}
        />
        <HoverCardContent side="right">
          Opens to the right of the trigger.
        </HoverCardContent>
      </HoverCard>
    </div>
  ),
}
