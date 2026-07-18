import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, screen, waitFor } from "storybook/test"
import { Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"

const meta = {
  title: "Components/Tooltip",
  component: Tooltip,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="dark bg-background flex min-h-40 items-center justify-center p-16">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Tooltip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger
        render={<Button variant="outline">Hover or focus me</Button>}
      />
      <TooltipContent>Runs a fresh discovery scan of the asset.</TooltipContent>
    </Tooltip>
  ),
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector(
      "[data-slot='tooltip-trigger']"
    ) as HTMLElement
    await expect(trigger).toBeInTheDocument()

    // Opens on hover…
    await userEvent.hover(trigger)
    const tip = await screen.findByRole("tooltip")
    await expect(tip).toHaveTextContent(/discovery scan/i)

    // …and dismisses on unhover.
    await userEvent.unhover(trigger)
    await waitFor(() =>
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument()
    )
  },
}

export const Sides: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <Tooltip key={side}>
          <TooltipTrigger
            render={<Button variant="secondary" className="capitalize" />}
          >
            {side}
          </TooltipTrigger>
          <TooltipContent side={side}>Opens on the {side}.</TooltipContent>
        </Tooltip>
      ))}
    </div>
  ),
}

export const RichContent: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button variant="ghost" size="icon" aria-label="About coverage">
            <Info />
          </Button>
        }
      />
      <TooltipContent side="top" className="max-w-56">
        <p className="font-heading text-[0.7rem] tracking-wide uppercase text-accent-strong">
          Scan coverage
        </p>
        <p className="mt-1">
          Percentage of discovered hosts that are actively monitored.
        </p>
      </TooltipContent>
    </Tooltip>
  ),
}

export const WithoutArrow: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger render={<Button variant="outline">No arrow</Button>} />
      <TooltipContent showArrow={false}>Flush label, no arrow.</TooltipContent>
    </Tooltip>
  ),
}

export const KeyboardFocus: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger render={<Button variant="outline">Tab to me</Button>} />
      <TooltipContent>Focus reveals the tooltip for keyboard users.</TooltipContent>
    </Tooltip>
  ),
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector(
      "[data-slot='tooltip-trigger']"
    ) as HTMLElement
    trigger.focus()
    await expect(trigger).toHaveFocus()
    await waitFor(() =>
      expect(screen.getByRole("tooltip")).toHaveTextContent(/keyboard users/i)
    )
  },
}
