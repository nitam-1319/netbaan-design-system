import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn, userEvent, within } from "storybook/test"

import { LoginForm } from "@/components/ui/login-form"

const meta = {
  title: "Components/Login Form",
  component: LoginForm,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    submitting: { control: "boolean" },
    disabled: { control: "boolean" },
    showRemember: { control: "boolean" },
  },
  args: {
    onSubmit: fn(),
    description: "Welcome back. Sign in to your NetBaan workspace.",
  },
  decorators: [
    (Story) => (
      <div className="w-[24rem] max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LoginForm>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { onForgotPassword: fn() },
}

export const WithSSO: Story = {
  args: {
    providers: ["google", "github", "microsoft"],
    onProviderSelect: fn(),
    onForgotPassword: fn(),
    footer: (
      <>
        Don&apos;t have an account?{" "}
        <a
          href="#signup"
          className="font-medium text-accent-strong underline underline-offset-[3px]"
        >
          Sign up
        </a>
      </>
    ),
  },
}

export const ServerError: Story = {
  args: {
    errors: { form: "Your email or password is incorrect." },
    defaultEmail: "sam@netbaan.io",
  },
}

export const FieldErrors: Story = {
  args: {
    errors: {
      email: "We don't recognize that email.",
      password: "Password must be at least 8 characters.",
    },
    defaultEmail: "typo@",
  },
}

export const Submitting: Story = {
  args: { submitting: true, defaultEmail: "sam@netbaan.io" },
}

export const NoRemember: Story = {
  args: { showRemember: false, forgotHref: "#reset" },
}

/**
 * Persian / RTL — labels, the forgot link, and the SSO row all mirror.
 */
export const RTLPersian: Story = {
  name: "RTL (Persian)",
  render: (args) => (
    <div dir="rtl">
      <LoginForm
        {...args}
        title="ورود"
        description="به فضای کاری خود وارد شوید."
        emailLabel="ایمیل"
        passwordLabel="گذرواژه"
        submitLabel="ورود"
        rememberLabel="مرا به خاطر بسپار"
        forgotLabel="گذرواژه را فراموش کرده‌اید؟"
        onForgotPassword={fn()}
        providers={["google", "github"]}
        onProviderSelect={fn()}
      />
    </div>
  ),
  args: { onSubmit: fn() },
}

/** Empty submit surfaces required-field errors; a valid submit reports values. */
export const SubmitInteraction: Story = {
  args: { onSubmit: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const submit = canvas.getByRole("button", { name: "Sign in" })

    await userEvent.click(submit)
    await expect(canvas.getByText("Email is required.")).toBeVisible()
    await expect(canvas.getByText("Password is required.")).toBeVisible()
    await expect(args.onSubmit).not.toHaveBeenCalled()

    await userEvent.type(canvas.getByLabelText("Email"), "sam@netbaan.io")
    await userEvent.type(canvas.getByLabelText("Password"), "s3cret-pass")
    await userEvent.click(submit)
    await expect(args.onSubmit).toHaveBeenCalledWith({
      email: "sam@netbaan.io",
      password: "s3cret-pass",
      remember: false,
    })
  },
}
