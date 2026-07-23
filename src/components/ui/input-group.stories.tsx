import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"
import { AtSign, Search, Link2 } from "lucide-react"

import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group"

/**
 * Input Group joins an input with leading/trailing addons inside one shell that
 * focuses as a unit. Theme and direction come from the global toolbar.
 */
const meta = {
  title: "Components/InputGroup",
  component: InputGroup,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-80 p-16 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof InputGroup>

export default meta
type Story = StoryObj<typeof meta>

export const LeadingIcon: Story = {
  render: () => (
    <InputGroup>
      <InputGroupAddon align="start" plain>
        <Search />
      </InputGroupAddon>
      <InputGroupInput placeholder="Search…" aria-label="Search" />
    </InputGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByLabelText("Search")
    await userEvent.type(input, "hello")
    await expect(input).toHaveValue("hello")
  },
}

export const TextPrefix: Story = {
  render: () => (
    <InputGroup>
      <InputGroupAddon align="start">
        <Link2 />
        https://
      </InputGroupAddon>
      <InputGroupInput placeholder="your-site" aria-label="Domain" />
    </InputGroup>
  ),
}

export const TrailingUnit: Story = {
  render: () => (
    <InputGroup>
      <InputGroupInput
        type="number"
        placeholder="0"
        aria-label="Weight"
        inputMode="decimal"
      />
      <InputGroupAddon align="end">kg</InputGroupAddon>
    </InputGroup>
  ),
}

export const BothSides: Story = {
  render: () => (
    <InputGroup>
      <InputGroupAddon align="start" plain>
        <AtSign />
      </InputGroupAddon>
      <InputGroupInput placeholder="username" aria-label="Handle" />
      <InputGroupAddon align="end">@acme.com</InputGroupAddon>
    </InputGroup>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {(["sm", "md", "lg"] as const).map((size) => (
        <InputGroup key={size} size={size}>
          <InputGroupAddon align="start">$</InputGroupAddon>
          <InputGroupInput placeholder="0.00" aria-label={`Amount ${size}`} />
          <InputGroupAddon align="end">USD</InputGroupAddon>
        </InputGroup>
      ))}
    </div>
  ),
}

export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <InputGroup invalid>
        <InputGroupAddon align="start" plain>
          <AtSign />
        </InputGroupAddon>
        <InputGroupInput
          defaultValue="not-an-email"
          aria-label="Email (invalid)"
        />
      </InputGroup>
      <InputGroup disabled>
        <InputGroupAddon align="start">https://</InputGroupAddon>
        <InputGroupInput
          disabled
          defaultValue="example.com"
          aria-label="Disabled"
        />
      </InputGroup>
    </div>
  ),
}
