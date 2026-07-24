import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { KeyboardShortcut } from "@/components/ui/keyboard-shortcut"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers — no `className` is passed to
 * an AEGIS component.
 */
const meta = {
  title: "Components/KeyboardShortcut",
  component: KeyboardShortcut,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    keys: { control: "text" },
    platform: { control: "inline-radio", options: ["auto", "mac", "pc"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    separator: { control: "text" },
  },
  args: {
    keys: "Mod+K",
    platform: "mac",
    size: "md",
    separator: "+",
  },
} satisfies Meta<typeof KeyboardShortcut>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // The spelled-out label is what a screen reader announces.
    await expect(canvas.getByText("Command K")).toBeInTheDocument()
  },
}

export const Platforms: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
      <div style={{ display: "grid", gap: "0.35rem", justifyItems: "center" }}>
        <KeyboardShortcut keys="Mod+K" platform="mac" />
        <span style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>
          macOS
        </span>
      </div>
      <div style={{ display: "grid", gap: "0.35rem", justifyItems: "center" }}>
        <KeyboardShortcut keys="Mod+K" platform="pc" />
        <span style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>
          Windows / Linux
        </span>
      </div>
    </div>
  ),
}

export const Chords: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "0.75rem", justifyItems: "start" }}>
      <KeyboardShortcut keys="Mod+Shift+P" platform="mac" />
      <KeyboardShortcut keys={["Mod", "Alt", "Enter"]} platform="mac" />
      <KeyboardShortcut keys="Ctrl+ArrowUp" platform="pc" />
      <KeyboardShortcut keys="Escape" platform="mac" />
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
      <KeyboardShortcut keys="Mod+S" platform="mac" size="sm" />
      <KeyboardShortcut keys="Mod+S" platform="mac" size="md" />
      <KeyboardShortcut keys="Mod+S" platform="mac" size="lg" />
    </div>
  ),
}

export const InContext: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        color: "var(--foreground)",
      }}
    >
      <span>Open the command palette</span>
      <KeyboardShortcut keys="Mod+K" platform="mac" size="sm" />
    </div>
  ),
}
