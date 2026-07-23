import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"
import { Rocket, Building2, Zap } from "lucide-react"

import { ChoiceCardGroup, ChoiceCard } from "@/components/ui/choice-card"

const meta = {
  title: "Components/ChoiceCard",
  component: ChoiceCardGroup,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="text-foreground w-full max-w-md p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChoiceCardGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <ChoiceCardGroup {...args} aria-label="Choose a plan" defaultValue="pro">
      <ChoiceCard
        value="starter"
        label="Starter"
        description="For individuals getting started. 1 project."
      />
      <ChoiceCard
        value="pro"
        label="Pro"
        description="For growing teams. Unlimited projects and history."
      />
      <ChoiceCard
        value="enterprise"
        label="Enterprise"
        description="SSO, audit logs, and a dedicated success manager."
      />
    </ChoiceCardGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // The preselected card is checked.
    await expect(canvas.getByRole("radio", { name: /Pro/ })).toBeChecked()
    // Selecting another card moves the selection (single-select group).
    const enterprise = canvas.getByRole("radio", { name: /Enterprise/ })
    await userEvent.click(enterprise)
    await expect(enterprise).toBeChecked()
    await expect(canvas.getByRole("radio", { name: /Pro/ })).not.toBeChecked()
  },
}

export const WithIcons: Story = {
  render: (args) => (
    <ChoiceCardGroup {...args} aria-label="Choose a workspace" defaultValue="team">
      <ChoiceCard
        value="personal"
        icon={<Zap aria-hidden />}
        label="Personal"
        description="Just for you."
      />
      <ChoiceCard
        value="team"
        icon={<Rocket aria-hidden />}
        label="Team"
        description="Collaborate with up to 20 people."
      />
      <ChoiceCard
        value="org"
        icon={<Building2 aria-hidden />}
        label="Organization"
        description="Company-wide, with central billing."
      />
    </ChoiceCardGroup>
  ),
}

export const Horizontal: Story = {
  render: (args) => (
    <ChoiceCardGroup
      {...args}
      orientation="horizontal"
      aria-label="Shipping speed"
      defaultValue="standard"
    >
      <ChoiceCard value="standard" label="Standard" description="3–5 days" />
      <ChoiceCard value="express" label="Express" description="1–2 days" />
    </ChoiceCardGroup>
  ),
}

export const WithDisabledOption: Story = {
  render: (args) => (
    <ChoiceCardGroup {...args} aria-label="Choose a plan" defaultValue="pro">
      <ChoiceCard value="pro" label="Pro" description="Available now." />
      <ChoiceCard
        value="enterprise"
        label="Enterprise"
        description="Contact sales to enable."
        disabled
      />
    </ChoiceCardGroup>
  ),
}
