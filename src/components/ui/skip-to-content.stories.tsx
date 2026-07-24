import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"

import { SkipToContent } from "@/components/ui/skip-to-content"

/**
 * Every story renders inside an explicit `.dark` surface so the AEGIS dark
 * theme (the design system's primary theme) is exercised. The link is hidden
 * until focused — press Tab into the preview to reveal it.
 */
const meta = {
  title: "Components/SkipToContent",
  component: SkipToContent,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    targetId: { control: "text" },
  },
  args: {
    targetId: "main-content",
  },
  decorators: [
    (Story) => (
      <div className="dark bg-background text-foreground min-h-64 p-8">
        <Story />
        <header className="border-strong text-muted-foreground mb-6 rounded-lg border border-dashed p-4 text-sm">
          Masthead / navigation (Tab past me)
        </header>
        <main
          id="main-content"
          tabIndex={-1}
          className="text-foreground rounded-lg outline-none"
        >
          <h1 className="text-lg font-semibold">Main content</h1>
          <p className="text-muted-foreground text-sm">
            The skip link jumps focus here.
          </p>
        </main>
      </div>
    ),
  ],
} satisfies Meta<typeof SkipToContent>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-2">
      <SkipToContent {...args} size="sm">
        Skip (sm)
      </SkipToContent>
      <SkipToContent {...args} size="md">
        Skip (md)
      </SkipToContent>
      <SkipToContent {...args} size="lg">
        Skip (lg)
      </SkipToContent>
    </div>
  ),
}

/**
 * The link is the first focusable element and points at the main landmark.
 * Tabbing into the page focuses it; it is hidden until then.
 */
export const KeyboardReveal: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const link = canvas.getByRole("link", { name: "Skip to main content" })

    await expect(link).toHaveAttribute("href", "#main-content")
    await expect(link).toHaveClass("sr-only")

    await userEvent.tab()
    await expect(link).toHaveFocus()
  },
}
