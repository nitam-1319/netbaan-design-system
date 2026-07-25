import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"
import { Search, Globe } from "lucide-react"

import { TextField } from "@/components/ui/text-field"

/**
 * Text Field (Input) restored to `.agent/references/spec/Input.dc.html`: outline /
 * filled / flush variants (default outline), the sm/md/lg size scale (32 / 40 /
 * 48px), leading / trailing adornments, and the resting / hover / focus / error /
 * success / disabled / read-only states. Focus lights an accent border with a 3px
 * `accent-soft` ring; the resting border is `border-border-strong`.
 */
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

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      {(["outline", "filled", "flush"] as const).map((variant) => (
        <TextField
          key={variant}
          {...args}
          variant={variant}
          label={`Variant: ${variant}`}
          placeholder={`${variant} field`}
        />
      ))}
    </div>
  ),
}

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      {(["sm", "md", "lg"] as const).map((size) => (
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

export const States: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      {(
        [
          "default",
          "hover",
          "focus",
          "error",
          "success",
          "readonly",
        ] as const
      ).map((state) => (
        <TextField
          key={state}
          {...args}
          state={state}
          label={`State: ${state}`}
          defaultValue="acme-corp.com"
        />
      ))}
    </div>
  ),
}

export const WithAdornments: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <TextField
        {...args}
        label="Search assets"
        placeholder="Search assets"
        leadingIcon={<Search />}
      />
      <TextField
        {...args}
        label="Domain"
        placeholder="acme-corp.com"
        leadingIcon={<Globe />}
        trailing={<span className="text-muted-foreground text-xs">.com</span>}
      />
    </div>
  ),
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

export const ReadOnly: Story = {
  args: {
    name: "target",
    readOnly: true,
    defaultValue: "api-gw-prod.netbaan.io",
    description: "This value is locked but still selectable.",
  },
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
