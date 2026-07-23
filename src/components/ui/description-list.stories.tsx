import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import {
  DescriptionList,
  DescriptionTerm,
  DescriptionDetails,
} from "@/components/ui/description-list"

const meta = {
  title: "Components/DescriptionList",
  component: DescriptionList,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "inline-radio", options: ["stacked", "grid"] },
  },
  decorators: [
    (Story) => (
      <div className="w-96 p-6 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DescriptionList>

export default meta
type Story = StoryObj<typeof meta>

export const Grid: Story = {
  args: { variant: "grid" },
  render: (args) => (
    <DescriptionList {...args}>
      <DescriptionTerm>Plan</DescriptionTerm>
      <DescriptionDetails>Enterprise</DescriptionDetails>
      <DescriptionTerm>Seats</DescriptionTerm>
      <DescriptionDetails>128 of 150</DescriptionDetails>
      <DescriptionTerm>Renews</DescriptionTerm>
      <DescriptionDetails>March 1, 2027</DescriptionDetails>
      <DescriptionTerm>Owner</DescriptionTerm>
      <DescriptionDetails>ada@example.com</DescriptionDetails>
    </DescriptionList>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("Plan").tagName).toBe("DT")
    await expect(canvas.getByText("Enterprise").tagName).toBe("DD")
  },
}

export const Stacked: Story = {
  args: { variant: "stacked" },
  render: (args) => (
    <DescriptionList {...args}>
      <DescriptionTerm>Shipping address</DescriptionTerm>
      <DescriptionDetails>
        1 Infinite Loop, Cupertino, CA 95014
      </DescriptionDetails>
      <DescriptionTerm>Delivery window</DescriptionTerm>
      <DescriptionDetails>2–4 business days</DescriptionDetails>
    </DescriptionList>
  ),
}
