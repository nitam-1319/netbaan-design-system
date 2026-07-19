import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, fn } from "storybook/test"
import { ArrowRight, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"

const meta = {
  title: "Components/Button",
  component: Button,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: { onClick: fn(), children: "Run scan" },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "outline", "secondary", "ghost", "destructive", "link"],
    },
    size: {
      control: "select",
      options: ["default", "xs", "sm", "lg", "icon", "icon-xs", "icon-sm", "icon-lg"],
    },
    disabled: { control: "boolean" },
  },
  decorators: [
    (Story) => (
      <div className="flex min-h-32 items-center justify-center p-16">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const btn = canvasElement.querySelector(
      "[data-slot='button']"
    ) as HTMLElement
    await expect(btn).toBeInTheDocument()
    await userEvent.click(btn)
    await expect(args.onClick).toHaveBeenCalled()
  },
}

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args} variant="default" />
      <Button {...args} variant="outline" />
      <Button {...args} variant="secondary" />
      <Button {...args} variant="ghost" />
      <Button {...args} variant="destructive" />
      <Button {...args} variant="link" />
    </div>
  ),
}

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args} size="xs" />
      <Button {...args} size="sm" />
      <Button {...args} size="default" />
      <Button {...args} size="lg" />
    </div>
  ),
}

export const WithIcon: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args}>
        <Plus data-icon="inline-start" />
        Add asset
      </Button>
      <Button {...args} variant="outline">
        Continue
        <ArrowRight data-icon="inline-end" />
      </Button>
      <Button {...args} size="icon" aria-label="Add">
        <Plus />
      </Button>
    </div>
  ),
}

export const Disabled: Story = {
  args: { disabled: true },
}

export const AsLink: Story = {
  name: "Polymorphic (render as anchor)",
  render: (args) => (
    <Button {...args} render={<a href="#run" />}>
      Run scan
    </Button>
  ),
}
