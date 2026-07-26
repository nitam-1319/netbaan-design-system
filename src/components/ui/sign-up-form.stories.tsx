import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn, userEvent, within } from "storybook/test"

import { SignUpForm } from "@/components/ui/sign-up-form"

const meta = {
  title: "Components/Sign-up Form",
  component: SignUpForm,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    submitting: { control: "boolean" },
    disabled: { control: "boolean" },
    showNameField: { control: "boolean" },
    showConfirmPassword: { control: "boolean" },
    requireTerms: { control: "boolean" },
  },
  args: {
    onSubmit: fn(),
    description: "Start monitoring your attack surface in minutes.",
  },
  decorators: [
    (Story) => (
      <div className="w-[24rem] max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SignUpForm>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithSSO: Story = {
  args: {
    providers: ["google", "github"],
    onProviderSelect: fn(),
    footer: (
      <>
        Already have an account?{" "}
        <a
          href="#login"
          className="font-medium text-accent-strong underline underline-offset-[3px]"
        >
          Sign in
        </a>
      </>
    ),
  },
}

export const Minimal: Story = {
  args: { showNameField: false, showConfirmPassword: false, requireTerms: false },
}

export const ServerError: Story = {
  args: { errors: { email: "That email is already registered." } },
}

export const Submitting: Story = {
  args: { submitting: true },
}

/**
 * Persian / RTL — labels, the strength meter, and the terms row mirror.
 */
export const RTLPersian: Story = {
  name: "RTL (Persian)",
  render: (args) => (
    <div dir="rtl">
      <SignUpForm
        {...args}
        title="ساخت حساب کاربری"
        description="نظارت بر سطح حمله خود را در چند دقیقه آغاز کنید."
        nameLabel="نام کامل"
        emailLabel="ایمیل"
        passwordLabel="گذرواژه"
        confirmLabel="تکرار گذرواژه"
        submitLabel="ایجاد حساب"
        termsLabel="با شرایط استفاده و حریم خصوصی موافقم"
      />
    </div>
  ),
  args: { onSubmit: fn() },
}

/** Empty submit surfaces required errors; a valid form reports values. */
export const SubmitInteraction: Story = {
  args: { onSubmit: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const submit = canvas.getByRole("button", { name: "Create account" })

    await userEvent.click(submit)
    await expect(canvas.getByText("Please enter your name.")).toBeVisible()
    await expect(canvas.getByText("Email is required.")).toBeVisible()
    await expect(args.onSubmit).not.toHaveBeenCalled()

    await userEvent.type(canvas.getByLabelText("Full name"), "Sam Rivera")
    await userEvent.type(canvas.getByLabelText("Email"), "sam@netbaan.io")
    await userEvent.type(canvas.getByLabelText("Password"), "Str0ng-pass!")
    await userEvent.type(canvas.getByLabelText("Confirm password"), "Str0ng-pass!")
    await userEvent.click(
      canvas.getByRole("checkbox", {
        name: /agree to the Terms/i,
      })
    )
    await userEvent.click(submit)
    await expect(args.onSubmit).toHaveBeenCalledWith({
      name: "Sam Rivera",
      email: "sam@netbaan.io",
      password: "Str0ng-pass!",
      acceptedTerms: true,
    })
  },
}
