import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { Label } from "@/components/ui/field-label"

const meta = {
  title: "Components/Field Label",
  component: Label,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    required: { control: "boolean" },
    optional: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: {
    children: "Email address",
    htmlFor: "email",
  },
  decorators: [
    (Story) => (
      <div className="p-8 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Label>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const label = canvas.getByText("Email address")
    await expect(label).toBeInTheDocument()
    await expect(label.closest("label")).toHaveAttribute("for", "email")
  },
}

export const Required: Story = {
  args: { required: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // The requirement is conveyed in text (sr-only), not colour alone.
    await expect(canvas.getByText("(required)")).toBeInTheDocument()
  },
}

export const Optional: Story = {
  args: { children: "Company", htmlFor: "company", optional: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("(optional)")).toBeInTheDocument()
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Label size="sm" htmlFor="a">
        Small label
      </Label>
      <Label size="md" htmlFor="b">
        Medium label
      </Label>
      <Label size="lg" htmlFor="c">
        Large label
      </Label>
    </div>
  ),
}

export const Disabled: Story = {
  args: { disabled: true },
}

export const WithControl: Story = {
  render: () => (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="demo-email" required>
        Email address
      </Label>
      <input
        id="demo-email"
        type="email"
        placeholder="you@example.com"
        className="h-10 rounded-lg border border-[var(--border-strong)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] outline-none"
      />
    </div>
  ),
}
