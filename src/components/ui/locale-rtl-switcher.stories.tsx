import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"

import { LocaleSwitcher } from "@/components/ui/locale-rtl-switcher"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */
const meta = {
  title: "Components/LocaleSwitcher",
  component: LocaleSwitcher,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "inline-radio", options: ["outline", "ghost", "soft"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    showLabel: { control: "boolean" },
    onLocaleChange: { action: "localeChange" },
  },
  args: {
    variant: "outline",
    size: "md",
    showLabel: true,
  },
} satisfies Meta<typeof LocaleSwitcher>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole("button")
    await expect(button).toHaveAttribute("data-slot", "locale-switcher")
    // Toggling flips the applied locale between EN and FA.
    const before = button.getAttribute("data-locale")
    await userEvent.click(button)
    await expect(button.getAttribute("data-locale")).not.toBe(before)
  },
}

export const IconOnly: Story = {
  args: { showLabel: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole("button")
    // With no visible label the button must still expose an accessible name.
    await expect(button).toHaveAccessibleName(/switch language/i)
  },
}

export const Variants: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
      <LocaleSwitcher variant="outline" />
      <LocaleSwitcher variant="ghost" />
      <LocaleSwitcher variant="soft" />
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
      <LocaleSwitcher size="sm" />
      <LocaleSwitcher size="md" />
      <LocaleSwitcher size="lg" />
    </div>
  ),
}

export const ThreeLocales: Story = {
  args: {
    locales: [
      { code: "en", name: "English", dir: "ltr" },
      { code: "fa", name: "فارسی", dir: "rtl" },
      { code: "ar", name: "العربية", dir: "rtl" },
    ],
  },
}

export const Disabled: Story = {
  args: { disabled: true },
}
