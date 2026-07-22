import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"

import { Textarea } from "@/components/ui/textarea"

const meta = {
  title: "Components/Textarea",
  component: Textarea,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    label: "Scan notes",
    placeholder: "Describe the scope, exclusions, and any known issues…",
  },
  argTypes: {
    size: {
      control: "inline-radio",
      options: ["sm", "default", "lg"],
    },
    rows: { control: "number" },
    disabled: { control: "boolean" },
    required: { control: "boolean" },
    onValueChange: { action: "valueChange" },
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    name: "notes",
    description: "Only visible to your team on the report.",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const control = canvas.getByRole("textbox")
    await expect(canvas.getByText("Scan notes")).toBeInTheDocument()
    await userEvent.type(control, "Excludes staging.\nContact: soc@netbaan.io")
    await expect(control).toHaveValue(
      "Excludes staging.\nContact: soc@netbaan.io"
    )
  },
}

export const WithError: Story = {
  args: {
    name: "notes",
    error: "Notes must be under 500 characters.",
    "aria-invalid": true,
    defaultValue: "…",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByText("Notes must be under 500 characters.")
    ).toBeVisible()
    await expect(canvas.getByRole("textbox")).toHaveAttribute(
      "aria-invalid",
      "true"
    )
  },
}

export const Required: Story = {
  args: {
    name: "justification",
    label: "Justification",
    required: true,
    placeholder: "Why is this target in scope?",
    description: "Required for the audit trail.",
  },
}

export const Disabled: Story = {
  args: {
    name: "notes",
    disabled: true,
    defaultValue: "Editing is locked while a scan is running.",
    description: "Editing is locked while a scan is running.",
  },
}

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      {(["sm", "default", "lg"] as const).map((size) => (
        <Textarea
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

function ScopeForm() {
  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="flex w-80 flex-col gap-3"
    >
      <Textarea
        name="justification"
        label="Justification"
        required
        rows={5}
        placeholder="Why is this target in scope?"
      />
    </form>
  )
}

export const InAForm: Story = {
  render: () => <ScopeForm />,
}
