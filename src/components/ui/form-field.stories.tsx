import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"

import {
  FormField,
  FieldLabel,
  FieldControl,
  FieldDescription,
  FieldError,
} from "@/components/ui/form-field"

const meta = {
  title: "Components/FormField",
  component: FormField,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FormField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <FormField name="target">
      <FieldLabel>Scan target</FieldLabel>
      <FieldControl placeholder="api-gw-prod.netbaan.io" />
      <FieldDescription>The hostname or IP range to enumerate.</FieldDescription>
    </FormField>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox")
    // Label is associated with the control.
    await expect(canvas.getByText("Scan target")).toBeInTheDocument()
    await userEvent.type(input, "example.com")
    await expect(input).toHaveValue("example.com")
  },
}

export const Required: Story = {
  render: () => (
    <FormField name="email">
      <FieldLabel>Work email</FieldLabel>
      <FieldControl type="email" required placeholder="you@company.com" />
      <FieldDescription>We'll send the report here.</FieldDescription>
    </FormField>
  ),
}

export const WithValidation: Story = {
  render: () => (
    <FormField name="email" validationMode="onChange">
      <FieldLabel>Work email</FieldLabel>
      <FieldControl type="email" required placeholder="you@company.com" />
      <FieldError match="valueMissing">An email is required.</FieldError>
      <FieldError match="typeMismatch">Enter a valid email address.</FieldError>
    </FormField>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("textbox")
    await userEvent.type(input, "not-an-email")
    await userEvent.tab()
    // Type-mismatch error surfaces once the field is validated.
    await expect(
      await canvas.findByText("Enter a valid email address.")
    ).toBeVisible()
    await expect(input).toHaveAttribute("aria-invalid", "true")
  },
}

export const Invalid: Story = {
  render: () => (
    <FormField name="port">
      <FieldLabel>Port</FieldLabel>
      <FieldControl aria-invalid defaultValue="70000" />
      <FieldError match>Port must be between 1 and 65535.</FieldError>
    </FormField>
  ),
}

export const Disabled: Story = {
  render: () => (
    <FormField name="target" disabled>
      <FieldLabel>Scan target</FieldLabel>
      <FieldControl defaultValue="api-gw-prod.netbaan.io" />
      <FieldDescription>Editing is locked while a scan is running.</FieldDescription>
    </FormField>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {(["sm", "default", "lg"] as const).map((size) => (
        <FormField key={size} name={`field-${size}`}>
          <FieldLabel>Size: {size}</FieldLabel>
          <FieldControl size={size} placeholder={`${size} control`} />
        </FormField>
      ))}
    </div>
  ),
}
