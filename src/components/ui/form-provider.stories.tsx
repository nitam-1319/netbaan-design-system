import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn, userEvent, within } from "storybook/test"

import { FormProvider, FormActions } from "@/components/ui/form-provider"
import {
  FormField,
  FieldLabel,
  FieldControl,
  FieldDescription,
  FieldError,
} from "@/components/ui/form-field"
import { Button } from "@/components/ui/button"

const meta = {
  title: "Components/Form Provider",
  component: FormProvider,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof FormProvider>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="max-w-sm">
      <FormProvider onFormSubmit={fn()}>
        <FormField name="email">
          <FieldLabel>Work email</FieldLabel>
          <FieldControl type="email" placeholder="you@netbaan.io" required />
          <FieldDescription>We'll send scan alerts to this address.</FieldDescription>
          <FieldError match="valueMissing">Email is required.</FieldError>
          <FieldError match="typeMismatch">Enter a valid email address.</FieldError>
        </FormField>
        <FormField name="workspace">
          <FieldLabel>Workspace</FieldLabel>
          <FieldControl placeholder="netbaan-prod" required />
          <FieldError match="valueMissing">Workspace is required.</FieldError>
        </FormField>
        <FormActions>
          <Button type="reset" variant="ghost">
            Reset
          </Button>
          <Button type="submit">Create workspace</Button>
        </FormActions>
      </FormProvider>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Submitting empty surfaces the required-field errors (validationMode onSubmit).
    await userEvent.click(canvas.getByRole("button", { name: "Create workspace" }))
    await expect(await canvas.findByText("Email is required.")).toBeVisible()
    await expect(canvas.getByText("Workspace is required.")).toBeVisible()
    // Filling the fields clears the errors on re-validation.
    await userEvent.type(canvas.getByLabelText("Work email"), "sam@netbaan.io")
    await userEvent.type(canvas.getByLabelText("Workspace"), "netbaan-prod")
    await expect(canvas.queryByText("Email is required.")).not.toBeInTheDocument()
  },
}

export const ServerErrors: Story = {
  render: () => (
    <div className="max-w-sm">
      <FormProvider errors={{ email: "That email is already registered." }}>
        <FormField name="email">
          <FieldLabel>Work email</FieldLabel>
          <FieldControl type="email" defaultValue="sam@netbaan.io" />
          <FieldError />
        </FormField>
        <FormActions>
          <Button type="submit">Continue</Button>
        </FormActions>
      </FormProvider>
    </div>
  ),
}
