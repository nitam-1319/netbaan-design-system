import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, screen } from "storybook/test"

import { ScrollArea } from "@/components/ui/scroll-area"

/**
 * Every story renders inside an explicit `.dark` surface so the AEGIS dark
 * theme (the design default) is exercised regardless of the toolbar globals.
 * The ScrollArea fills its parent, so each demo gives it a bounded size.
 */
const meta = {
  title: "Components/ScrollArea",
  component: ScrollArea,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    orientation: "vertical",
  },
  argTypes: {
    orientation: {
      control: "inline-radio",
      options: ["vertical", "horizontal", "both"],
    },
  },
  decorators: [
    (Story) => (
      <div className="dark bg-background text-foreground p-10">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ScrollArea>

export default meta
type Story = StoryObj<typeof meta>

const ASSETS = Array.from({ length: 40 }, (_, i) => ({
  host: `asset-${String(i + 1).padStart(2, "0")}.netbaan.io`,
  ip: `10.0.${Math.floor(i / 12)}.${(i * 7) % 255}`,
}))

export const Vertical: Story = {
  render: (args) => (
    <div className="border-border-strong h-64 w-72 rounded-lg border">
      <ScrollArea {...args}>
        <ul className="p-3 text-sm">
          {ASSETS.map((a) => (
            <li
              key={a.host}
              className="text-foreground flex items-center justify-between gap-4 rounded-md px-2 py-1.5"
            >
              <span>{a.host}</span>
              <span className="text-muted-foreground tabular-nums">{a.ip}</span>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const viewport = canvasElement.querySelector(
      '[data-slot="scroll-area-viewport"]'
    ) as HTMLElement
    await expect(viewport).toBeInTheDocument()
    // The list overflows its bounded parent, so it is scrollable.
    await expect(viewport.scrollHeight).toBeGreaterThan(viewport.clientHeight)
    // First row is present; scrolling reveals lower rows.
    await expect(screen.getByText("asset-01.netbaan.io")).toBeInTheDocument()
    await userEvent.click(screen.getByText("asset-01.netbaan.io"))
    viewport.scrollTop = 160
    await expect(viewport.scrollTop).toBeGreaterThan(0)
  },
}

export const Horizontal: Story = {
  render: () => (
    <div className="border-border-strong w-80 rounded-lg border">
      <ScrollArea orientation="horizontal">
        <div className="flex w-max gap-3 p-3">
          {Array.from({ length: 12 }, (_, i) => (
            <div
              key={i}
              className="bg-muted text-foreground grid h-24 w-32 shrink-0 place-items-center rounded-md text-sm"
            >
              Panel {i + 1}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  ),
}

export const Both: Story = {
  render: () => (
    <div className="border-border-strong h-64 w-80 rounded-lg border">
      <ScrollArea orientation="both">
        <div className="w-[42rem] p-3">
          <p className="text-muted-foreground mb-3 text-sm">
            Content overflows on both axes; scrollbars appear per axis and share a
            corner.
          </p>
          <ul className="text-sm">
            {ASSETS.map((a) => (
              <li key={a.host} className="text-foreground py-1.5 whitespace-nowrap">
                {a.host} — {a.ip} — last seen 2026-07-2{a.host.length % 9} — open
                ports 22, 443, 8443
              </li>
            ))}
          </ul>
        </div>
      </ScrollArea>
    </div>
  ),
}
