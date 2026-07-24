import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { FormSection } from "@/components/ui/form-section"
import { TextField } from "@/components/ui/text-field"
import { Textarea } from "@/components/ui/textarea"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. The demo composes real AEGIS fields inside the section — no
 * `className` is passed to any AEGIS component.
 */
const meta = {
  title: "Components/FormSection",
  component: FormSection,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    layout: { control: "inline-radio", options: ["stacked", "aside"] },
    headingLevel: { control: "inline-radio", options: [2, 3, 4] },
    title: { control: "text" },
    description: { control: "text" },
  },
  args: {
    layout: "stacked",
    headingLevel: 3,
    title: "Profile",
    description: "This information is shown on your public profile.",
  },
} satisfies Meta<typeof FormSection>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <FormSection {...args}>
      <TextField label="Display name" defaultValue="Ada Lovelace" />
      <TextField label="Email" type="email" defaultValue="ada@example.com" />
    </FormSection>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const region = canvas.getByRole("region", { name: "Profile" })
    await expect(region).toBeInTheDocument()
  },
}

export const Aside: Story = {
  args: {
    layout: "aside",
    title: "Notifications",
    description:
      "Choose how you want to be notified about scans and new findings.",
  },
  render: (args) => (
    <FormSection {...args}>
      <TextField label="Alert email" type="email" defaultValue="soc@corp.io" />
      <Textarea label="Escalation notes" rows={3} />
    </FormSection>
  ),
}

export const Stacked: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
      <FormSection
        title="Profile"
        description="Basic account details."
      >
        <TextField label="Display name" defaultValue="Ada Lovelace" />
      </FormSection>
      <FormSection
        title="Security"
        description="Manage how you sign in."
      >
        <TextField label="Current password" type="password" />
      </FormSection>
    </div>
  ),
}

export const NoHeader: Story = {
  args: { title: undefined, description: undefined },
  render: (args) => (
    <FormSection {...args}>
      <TextField label="Search query" type="search" />
    </FormSection>
  ),
}
