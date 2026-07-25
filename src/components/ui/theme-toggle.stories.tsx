import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"

import { ThemeToggle } from "@/components/ui/theme-toggle"
import { ThemeProvider } from "@/components/theme-provider"

const meta = {
  title: "Components/Theme Toggle",
  component: ThemeToggle,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "inline-radio", options: ["outline", "ghost", "soft"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
  args: {
    variant: "outline",
    size: "md",
  },
  decorators: [
    (Story) => (
      <ThemeProvider defaultTheme="dark" storageKey="aegis-sb-theme-toggle">
        <div className="p-8 text-foreground">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
} satisfies Meta<typeof ThemeToggle>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole("button")
    // Icon-only → an accessible name is always present.
    await expect(button).toHaveAccessibleName(/switch to (light|dark) theme/i)
    const before = button.getAttribute("data-theme")
    await userEvent.click(button)
    await expect(button.getAttribute("data-theme")).not.toBe(before)
  },
}

export const Variants: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <ThemeToggle variant="outline" />
      <ThemeToggle variant="ghost" />
      <ThemeToggle variant="soft" />
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <ThemeToggle size="sm" />
      <ThemeToggle size="md" />
      <ThemeToggle size="lg" />
    </div>
  ),
}

export const WithLabel: Story = {
  args: { children: "Theme" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("Theme")).toBeInTheDocument()
  },
}
