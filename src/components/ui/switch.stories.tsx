import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"

import { Switch } from "@/components/ui/switch"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to the AEGIS Switch.
 */
const meta = {
  title: "Components/Switch",
  component: Switch,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    showIcons: { control: "boolean" },
    loading: { control: "boolean" },
    error: { control: "boolean" },
    disabled: { control: "boolean" },
    defaultChecked: { control: "boolean" },
    label: { control: "text" },
    description: { control: "text" },
  },
  args: {
    "aria-label": "Enable monitoring",
  },
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const sw = canvas.getByRole("switch")
    await expect(sw).toHaveAttribute("data-slot", "switch")
    await expect(sw).toHaveAttribute("aria-checked", "false")
    await userEvent.click(sw)
    await expect(sw).toHaveAttribute("aria-checked", "true")
  },
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
      <Switch size="sm" defaultChecked aria-label="Small" />
      <Switch size="md" defaultChecked aria-label="Medium" />
      <Switch size="lg" defaultChecked aria-label="Large" />
    </div>
  ),
}

export const States: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <Switch aria-label="Off" />
      <Switch defaultChecked aria-label="On" />
      <Switch error aria-label="Error" />
      <Switch loading defaultChecked aria-label="Loading" />
      <Switch disabled aria-label="Disabled off" />
      <Switch disabled defaultChecked aria-label="Disabled on" />
    </div>
  ),
}

export const WithIcons: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
      <Switch showIcons defaultChecked aria-label="Encryption on" />
      <Switch showIcons aria-label="Public profile off" />
    </div>
  ),
}

export const WithLabel: Story = {
  args: {
    label: "Two-factor authentication",
    description: "Require a verification code at every sign-in.",
    defaultChecked: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByText("Two-factor authentication")
    ).toBeInTheDocument()
    await expect(canvas.getByRole("switch")).toHaveAttribute(
      "aria-checked",
      "true"
    )
  },
}

export const Loading: Story = {
  args: { loading: true, defaultChecked: true, label: "Saving preference" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const sw = canvas.getByRole("switch")
    await expect(sw).toHaveAttribute("aria-busy", "true")
    await expect(sw).toBeDisabled()
  },
}

export const Error: Story = {
  args: {
    error: true,
    label: "Accept terms",
    description: "You must enable this to continue.",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole("switch")).toHaveAttribute(
      "aria-invalid",
      "true"
    )
  },
}
