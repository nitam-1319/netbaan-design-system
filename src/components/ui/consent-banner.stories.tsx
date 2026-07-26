import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn, userEvent, within } from "storybook/test"

import { ConsentBanner } from "@/components/ui/consent-banner"

const meta = {
  title: "Components/Consent Banner",
  component: ConsentBanner,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    placement: {
      control: "inline-radio",
      options: ["inline", "bottom", "top", "floating"],
    },
    showIcon: { control: "boolean" },
    title: { control: "text" },
  },
  args: {
    placement: "inline",
    showIcon: true,
    onAccept: fn(),
    onReject: fn(),
    policyHref: "#privacy",
  },
  decorators: [
    (Story) => (
      <div className="w-[46rem] max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ConsentBanner>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithManage: Story = {
  args: { onManage: fn() },
}

export const Dismissible: Story = {
  args: { onManage: fn(), onDismiss: fn() },
}

export const NoIcon: Story = {
  args: { showIcon: false, onManage: fn() },
}

export const Floating: Story = {
  parameters: { layout: "fullscreen" },
  args: { placement: "floating", onManage: fn(), onDismiss: fn() },
  render: (args) => (
    <div className="relative h-[22rem] w-full overflow-hidden rounded-lg bg-surface-2">
      <ConsentBanner {...args} />
    </div>
  ),
}

export const CustomCopy: Story = {
  args: {
    title: "Cookies & tracking",
    description:
      "This site uses strictly necessary cookies to function, plus optional analytics cookies. Choose what you allow.",
    acceptLabel: "Allow all",
    rejectLabel: "Necessary only",
    onManage: fn(),
  },
}

/**
 * Persian / RTL — the banner mirrors; the dismiss button and floating anchor
 * move to the logical side.
 */
export const RTLPersian: Story = {
  name: "RTL (Persian)",
  render: (args) => (
    <div dir="rtl">
      <ConsentBanner
        {...args}
        title="ما به حریم خصوصی شما اهمیت می‌دهیم"
        description="ما از کوکی‌ها برای بهبود تجربه شما استفاده می‌کنیم."
        acceptLabel="پذیرش همه"
        rejectLabel="رد همه"
        manageLabel="مدیریت ترجیحات"
        policyLabel="سیاست حفظ حریم خصوصی"
        onManage={args.onManage}
      />
    </div>
  ),
  args: { onManage: fn() },
}

/** Accept and Reject fire their handlers; the region is labelled. */
export const ConsentInteraction: Story = {
  args: { onManage: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole("region", { name: "We value your privacy" })
    ).toBeInTheDocument()

    await userEvent.click(canvas.getByRole("button", { name: "Accept all" }))
    await expect(args.onAccept).toHaveBeenCalledTimes(1)

    await userEvent.click(canvas.getByRole("button", { name: "Reject all" }))
    await expect(args.onReject).toHaveBeenCalledTimes(1)
  },
}
