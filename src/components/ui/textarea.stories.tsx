import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"

import { Textarea } from "@/components/ui/textarea"

/**
 * Textarea shares the Input visual language from
 * `.agent/references/spec/Input.dc.html`: outline / filled / flush variants
 * (default outline), the sm/md/lg size scale, and the resting / hover / focus /
 * error / success / disabled / read-only states. Focus lights an accent border
 * with a 3px `accent-soft` ring; the resting border is `border-border-strong`.
 * The control auto-grows to fit its content and stays vertically resizable.
 */
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
    variant: {
      control: "inline-radio",
      options: ["outline", "filled", "flush"],
    },
    size: {
      control: "inline-radio",
      options: ["sm", "md", "lg"],
    },
    state: {
      control: "select",
      options: [
        "default",
        "hover",
        "focus",
        "error",
        "success",
        "disabled",
        "readonly",
      ],
    },
    rows: { control: "number" },
    disabled: { control: "boolean" },
    required: { control: "boolean" },
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

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      {(["outline", "filled", "flush"] as const).map((variant) => (
        <Textarea
          key={variant}
          {...args}
          variant={variant}
          label={`Variant: ${variant}`}
          placeholder={`${variant} control`}
        />
      ))}
    </div>
  ),
}

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      {(["sm", "md", "lg"] as const).map((size) => (
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

export const States: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      {(
        ["default", "focus", "error", "success", "readonly"] as const
      ).map((state) => (
        <Textarea
          key={state}
          {...args}
          state={state}
          label={`State: ${state}`}
          defaultValue="Excludes staging environment."
        />
      ))}
    </div>
  ),
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

export const ReadOnly: Story = {
  args: {
    name: "notes",
    readOnly: true,
    defaultValue: "This value is locked but still selectable.",
    description: "Read-only content stays selectable.",
  },
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
