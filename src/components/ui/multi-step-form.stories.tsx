import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn, userEvent, within } from "storybook/test"

import { MultiStepForm } from "@/components/ui/multi-step-form"
import { TextField } from "@/components/ui/text-field"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */
const STEPS = [
  {
    label: "Account",
    description: "Your details",
    content: (
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <TextField label="Full name" placeholder="Ada Lovelace" />
        <TextField label="Email" type="email" placeholder="ada@example.com" />
      </div>
    ),
  },
  {
    label: "Organization",
    description: "Company info",
    content: (
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <TextField label="Company" placeholder="Netbaan" />
        <TextField label="Role" placeholder="Security lead" />
      </div>
    ),
  },
  {
    label: "Review",
    description: "Confirm & submit",
    content: <p style={{ fontSize: 14 }}>Review your details, then submit.</p>,
  },
]

const meta = {
  title: "Components/MultiStepForm",
  component: MultiStepForm,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    onStepChange: { action: "stepChange" },
    onSubmit: { action: "submit" },
  },
  args: {
    onStepChange: fn(),
    onSubmit: fn(),
    steps: STEPS,
    orientation: "horizontal",
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 640 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MultiStepForm>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    // Starts on step 1; Back is disabled.
    await expect(canvas.getByText("Step 1 of 3")).toBeInTheDocument()
    await expect(canvas.getByRole("button", { name: /back/i })).toBeDisabled()
    // Advance to step 2.
    await userEvent.click(canvas.getByRole("button", { name: /next/i }))
    await expect(args.onStepChange).toHaveBeenCalledWith(1)
    await expect(canvas.getByText("Step 2 of 3")).toBeInTheDocument()
  },
}

export const Submit: Story = {
  args: { defaultActiveStep: 2 },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: /submit/i }))
    await expect(args.onSubmit).toHaveBeenCalled()
  },
}

export const Vertical: Story = {
  args: { orientation: "vertical" },
}

export const Submitting: Story = {
  args: { defaultActiveStep: 2, submitting: true },
}
