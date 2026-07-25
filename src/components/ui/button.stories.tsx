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
      options: ["primary", "secondary", "soft", "outline", "ghost", "destructive", "link"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg", "icon", "icon-sm", "icon-lg"],
    },
    loading: { control: "boolean" },
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

export const Primary: Story = {
  args: { variant: "primary" },
  play: async ({ canvasElement, args }) => {
    const btn = canvasElement.querySelector("[data-slot='button']") as HTMLElement
    await expect(btn).toBeInTheDocument()
    await userEvent.click(btn)
    await expect(args.onClick).toHaveBeenCalled()
  },
}

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args} variant="primary" />
      <Button {...args} variant="secondary" />
      <Button {...args} variant="soft" />
      <Button {...args} variant="outline" />
      <Button {...args} variant="ghost" />
      <Button {...args} variant="destructive" />
      <Button {...args} variant="link" />
    </div>
  ),
}

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args} variant="primary" size="sm" />
      <Button {...args} variant="primary" size="md" />
      <Button {...args} variant="primary" size="lg" />
    </div>
  ),
}

export const WithIcon: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args} variant="primary">
        <Plus />
        Add asset
      </Button>
      <Button {...args} variant="outline">
        Continue
        <ArrowRight />
      </Button>
      <Button {...args} variant="soft" size="icon" aria-label="Add">
        <Plus />
      </Button>
    </div>
  ),
}

export const Loading: Story = {
  args: { variant: "primary", loading: true, children: "Scanning" },
}

export const Disabled: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args} variant="primary" disabled />
      <Button {...args} variant="secondary" disabled />
      <Button {...args} variant="outline" disabled />
    </div>
  ),
}

export const AsLink: Story = {
  name: "Polymorphic (render as anchor)",
  render: (args) => (
    <Button {...args} variant="link" render={<a href="#run" />}>
      Run scan
    </Button>
  ),
}
