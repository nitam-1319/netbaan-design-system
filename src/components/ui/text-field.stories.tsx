import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"

import { TextField } from "@/components/ui/text-field"

const meta = {
  title: "Components/TextField",
  component: TextField,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    label: "Scan target",
    placeholder: "api-gw-prod.netbaan.io",
  },
  argTypes: {
    size: {
      control: "inline-radio",
      options: ["sm", "default", "lg"],
    },
    disabled: { control: "boolean" },
    required: { control: "boolean" },
  },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TextField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    name: "target",
    description: "The hostname or IP range to enumerate.",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox")
    await expect(canvas.getByText("Scan target")).toBeInTheDocument()
    await userEvent.type(input, "example.com")
    await expect(input).toHaveValue("example.com")
  },
}

export const WithError: Story = {
  args: {
    name: "target",
    error: "That host is out of the approved scope.",
    "aria-invalid": true,
    defaultValue: "internal-db.corp",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByText("That host is out of the approved scope.")
    ).toBeVisible()
    await expect(canvas.getByRole("textbox")).toHaveAttribute(
      "aria-invalid",
      "true"
    )
  },
}

export const Required: Story = {
  args: {
    name: "email",
    label: "Work email",
    type: "email",
    required: true,
    placeholder: "you@company.com",
    description: "We'll send the report here.",
  },
}

export const Disabled: Story = {
  args: {
    name: "target",
    disabled: true,
    defaultValue: "api-gw-prod.netbaan.io",
    description: "Editing is locked while a scan is running.",
  },
}

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      {(["sm", "default", "lg"] as const).map((size) => (
        <TextField
          key={size}
          {...args}
          size={size}
          label={`Size: ${size}`}
          placeholder={`${size} control`}
        />
      ))}
    </div>
  ),
}

function NativeValidationDemo() {
  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="flex w-72 flex-col gap-3"
    >
      <TextField
        name="email"
        label="Work email"
        type="email"
        required
        placeholder="you@company.com"
      />
    </form>
  )
}

export const InAForm: Story = {
  render: () => <NativeValidationDemo />,
}
