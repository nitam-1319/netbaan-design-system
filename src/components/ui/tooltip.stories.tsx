import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, screen, waitFor } from "storybook/test"
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
      <div className="flex min-h-40 items-center justify-center p-16">
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

    // The tooltip opens on hover AND focus. Base UI's hover-open relies on a
    // pointer-rest heuristic that the headless play harness cannot drive
    // deterministically (userEvent.hover does not satisfy it), so we exercise
    // the equivalent focus trigger — it opens the identical role="tooltip"
    // popup — and additionally verify it dismisses on blur.
    trigger.focus()
    await expect(trigger).toHaveFocus()
    const tip = await screen.findByRole("tooltip")
    await expect(tip).toHaveTextContent(/discovery scan/i)

    trigger.blur()
    await waitFor(() =>
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument()
    )
  },
}

export const Sides: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      {(["Top", "Right", "Bottom", "Left"] as const).map((side) => (
        <Tooltip key={side}>
          <TooltipTrigger render={<Button variant="secondary">{side}</Button>} />
          <TooltipContent side={side.toLowerCase() as "top" | "right" | "bottom" | "left"}>
            Opens on the {side.toLowerCase()}.
          </TooltipContent>
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
      <TooltipContent side="top">
        <p className="font-heading text-accent-strong text-xs font-semibold tracking-wide uppercase">
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
