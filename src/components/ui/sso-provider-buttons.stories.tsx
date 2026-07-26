import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn, userEvent, within } from "storybook/test"

import {
  SSOProviderButton,
  SSOProviderButtons,
} from "@/components/ui/sso-provider-buttons"

const meta = {
  title: "Components/SSO Provider Buttons",
  component: SSOProviderButton,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    provider: {
      control: "inline-radio",
      options: ["google", "github", "microsoft", "apple", "gitlab", "sso"],
    },
    variant: { control: "inline-radio", options: ["secondary", "outline", "ghost"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    fullWidth: { control: "boolean" },
  },
  args: { provider: "google", variant: "secondary", size: "md", fullWidth: true },
  decorators: [
    (Story) => (
      <div className="w-[22rem] max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SSOProviderButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Providers: Story = {
  render: (args) => (
    <SSOProviderButtons
      {...args}
      providers={["google", "github", "microsoft", "apple", "gitlab"]}
      onSelectProvider={fn()}
    />
  ),
}

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <SSOProviderButton {...args} variant="secondary" provider="github" />
      <SSOProviderButton {...args} variant="outline" provider="github" />
      <SSOProviderButton {...args} variant="ghost" provider="github" />
    </div>
  ),
}

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <SSOProviderButton {...args} size="sm" provider="google" />
      <SSOProviderButton {...args} size="md" provider="google" />
      <SSOProviderButton {...args} size="lg" provider="google" />
    </div>
  ),
}

export const Horizontal: Story = {
  render: (args) => (
    <SSOProviderButtons
      {...args}
      orientation="horizontal"
      fullWidth={false}
      providers={["google", "github", "apple"]}
      label="{provider}"
      onSelectProvider={fn()}
    />
  ),
}

export const EnterpriseSSO: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <SSOProviderButton
        {...args}
        provider="sso"
        variant="outline"
        label="Sign in with SSO"
      />
      <SSOProviderButton
        {...args}
        provider="saml"
        variant="outline"
        label="Continue with {provider}"
      />
    </div>
  ),
}

export const Disabled: Story = {
  args: { disabled: true },
}

/**
 * Persian / RTL — the mark leads on the logical start and the row mirrors.
 */
export const RTLPersian: Story = {
  name: "RTL (Persian)",
  render: (args) => (
    <div dir="rtl">
      <SSOProviderButtons
        {...args}
        providers={["google", "github"]}
        label="ادامه با {provider}"
        groupLabel="ورود با ارائه‌دهنده"
        onSelectProvider={fn()}
      />
    </div>
  ),
}

/** Activating a provider button fires `onSelectProvider` with its key. */
export const SelectInteraction: Story = {
  render: (args) => {
    const onSelectProvider = fn()
    return (
      <SSOProviderButtons
        {...args}
        providers={["google", "github"]}
        onSelectProvider={onSelectProvider}
      />
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const github = canvas.getByRole("button", { name: "Continue with GitHub" })
    await expect(github).toBeVisible()
    await userEvent.click(github)
    // group is present and labelled
    await expect(
      canvas.getByRole("group", { name: "Sign in with a provider" })
    ).toBeInTheDocument()
  },
}
