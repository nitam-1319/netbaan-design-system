import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within, fn } from "storybook/test"

import { PrintView, PrintOnly, ScreenOnly } from "@/components/ui/print-view"
import { Card, CardContent } from "@/components/ui/card"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */
const meta = {
  title: "Components/PrintView",
  component: PrintView,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: {
    title: "Scan Report — March",
    showToolbar: true,
    printLabel: "Print",
    children: (
      <Card>
        <CardContent>
          <div style={{ padding: 16, fontSize: 14 }}>
            <p>This document prints without the toolbar above.</p>
            <ScreenOnly>
              <p style={{ color: "var(--muted-foreground)" }}>
                Shown on screen only.
              </p>
            </ScreenOnly>
            <PrintOnly>
              <p>Confidential — generated for print.</p>
            </PrintOnly>
          </div>
        </CardContent>
      </Card>
    ),
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 560 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PrintView>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("Scan Report — March")).toBeInTheDocument()
    const printBtn = canvas.getByRole("button", { name: /print/i })
    // Stub window.print so the play test doesn't open a real dialog.
    const original = window.print
    window.print = fn()
    await userEvent.click(printBtn)
    await expect(window.print).toHaveBeenCalled()
    window.print = original
  },
}

export const NoToolbar: Story = {
  args: { showToolbar: false },
}
