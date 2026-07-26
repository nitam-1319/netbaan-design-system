import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"

import { ResizablePanels } from "@/components/ui/resizable-panels"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */
function Pane({ label }: { label: string }) {
  return (
    <div style={{ padding: 16, fontSize: 14, color: "var(--muted-foreground)" }}>
      {label}
    </div>
  )
}

const meta = {
  title: "Components/ResizablePanels",
  component: ResizablePanels,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    defaultSize: { control: { type: "range", min: 10, max: 90 } },
    onSizeChange: { action: "sizeChange" },
  },
  args: {
    orientation: "horizontal",
    defaultSize: 40,
    children: [<Pane key="a" label="Sidebar" />, <Pane key="b" label="Content" />],
  },
  decorators: [
    (Story) => (
      <div style={{ height: 260, maxWidth: 640 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ResizablePanels>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const handle = canvas.getByRole("separator", { name: "Resize panels" })
    await expect(handle).toHaveAttribute("aria-valuenow", "40")
    await expect(handle).toHaveAttribute("aria-orientation", "vertical")
    // Keyboard resize.
    handle.focus()
    await userEvent.keyboard("{ArrowRight}")
    await expect(args.onSizeChange).toHaveBeenCalledWith(42)
  },
}

export const Vertical: Story = {
  args: {
    orientation: "vertical",
    children: [<Pane key="a" label="Top" />, <Pane key="b" label="Bottom" />],
  },
  decorators: [
    (Story) => (
      <div style={{ height: 320, maxWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
}

export const WideSidebar: Story = {
  args: { defaultSize: 70 },
}
