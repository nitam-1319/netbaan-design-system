import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn, userEvent, within } from "storybook/test"
import { FolderPlus, UserPlus, Wand2 } from "lucide-react"

import { FirstRunOnboarding } from "@/components/ui/first-run-onboarding"

const meta = {
  title: "Components/First-run Onboarding",
  component: FirstRunOnboarding,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "default", "lg"] },
  },
  args: {
    title: "Welcome to Netbaan",
    description:
      "Let's get your workspace set up. Follow these steps to start monitoring your attack surface.",
    onPrimary: fn(),
  },
  decorators: [
    (Story) => (
      <div className="w-[32rem] max-w-full rounded-xl border border-border bg-card text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FirstRunOnboarding>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    steps: [
      {
        title: "Add your first domain",
        description: "Point Netbaan at a domain to begin discovery.",
        icon: <FolderPlus />,
      },
      {
        title: "Invite your team",
        description: "Bring in teammates to triage findings together.",
        icon: <UserPlus />,
      },
      {
        title: "Run your first scan",
        description: "Kick off a scan and review the results.",
        icon: <Wand2 />,
      },
    ],
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("Welcome to Netbaan")).toBeInTheDocument()
    await expect(canvas.getByText("Add your first domain")).toBeInTheDocument()
    const primary = canvas.getByRole("button", { name: "Get started" })
    await userEvent.click(primary)
    await expect(args.onPrimary).toHaveBeenCalledOnce()
  },
}

export const NumberedSteps: Story = {
  args: {
    description: "Three quick steps and you're up and running.",
    steps: [
      { title: "Connect a data source" },
      { title: "Configure alerts" },
      { title: "Share your first dashboard" },
    ],
  },
}

export const WithSecondary: Story = {
  args: {
    onSecondary: fn(),
    steps: [
      { title: "Create a project" },
      { title: "Import your assets" },
    ],
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const skip = canvas.getByRole("button", { name: "Skip for now" })
    await userEvent.click(skip)
    await expect(args.onSecondary).toHaveBeenCalledOnce()
  },
}

export const NoSteps: Story = {
  args: {
    title: "You're all set",
    description: "Nothing to configure — jump straight in.",
    steps: undefined,
  },
}

export const Sizes: Story = {
  args: {
    steps: [
      { title: "Connect a data source" },
      { title: "Configure alerts" },
    ],
  },
  render: (args) => (
    <div className="flex flex-col divide-y divide-border">
      <FirstRunOnboarding {...args} size="sm" title="Small" />
      <FirstRunOnboarding {...args} size="default" title="Default" />
      <FirstRunOnboarding {...args} size="lg" title="Large" />
    </div>
  ),
}
