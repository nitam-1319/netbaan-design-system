import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn, userEvent, within } from "storybook/test"

import { UploadProgress } from "@/components/ui/upload-progress"

const meta = {
  title: "Components/Upload Progress",
  component: UploadProgress,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md"] },
    status: { control: "inline-radio", options: ["queued", "uploading", "paused", "success", "error"] },
    value: { control: { type: "range", min: 0, max: 100, step: 1 } },
    showPercent: { control: "boolean" },
    indeterminate: { control: "boolean" },
    name: { control: "text" },
  },
  args: {
    name: "keynote-recording.mp4",
    value: 62,
    status: "uploading",
    loadedBytes: 317_000_000,
    totalBytes: 512_000_000,
    remainingLabel: "~48s left",
  },
  decorators: [
    (Story) => (
      <div className="w-[30rem] max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof UploadProgress>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithControls: Story = {
  args: { onPause: fn(), onCancel: fn() },
}

export const Paused: Story = {
  args: { status: "paused", value: 62, remainingLabel: "Paused", onResume: fn(), onCancel: fn() },
}

export const Success: Story = {
  args: { status: "success", value: 100, remainingLabel: undefined },
}

export const Error: Story = {
  args: {
    status: "error",
    value: 40,
    errorMessage: "Connection lost — upload failed",
    onRetry: fn(),
    onCancel: fn(),
  },
}

export const Indeterminate: Story = {
  args: { indeterminate: true, value: null, remainingLabel: "Preparing…", loadedBytes: undefined, onCancel: fn() },
}

export const NoName: Story = {
  args: { name: undefined },
}

export const Small: Story = {
  args: { size: "sm" },
}

/**
 * Persian / RTL — the header (name ↔ percent ↔ controls) mirrors and the meta
 * digits stay tabular.
 */
export const RTLPersian: Story = {
  name: "RTL (Persian)",
  render: (args) => (
    <div dir="rtl">
      <UploadProgress
        {...args}
        name="ضبط-ارائه.mp4"
        remainingLabel="۴۸ ثانیه مانده"
        onPause={() => {}}
        onCancel={() => {}}
      />
    </div>
  ),
}

/** The bar exposes the correct progressbar value and controls fire. */
export const ControlsInteraction: Story = {
  args: { onPause: fn(), onCancel: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)

    const bar = canvas.getByRole("progressbar", { name: "Uploading keynote-recording.mp4" })
    await expect(bar).toHaveAttribute("aria-valuenow", "62")

    await userEvent.click(canvas.getByRole("button", { name: "Pause upload" }))
    await expect(args.onPause).toHaveBeenCalledTimes(1)

    await userEvent.click(canvas.getByRole("button", { name: "Cancel upload" }))
    await expect(args.onCancel).toHaveBeenCalledTimes(1)
  },
}
