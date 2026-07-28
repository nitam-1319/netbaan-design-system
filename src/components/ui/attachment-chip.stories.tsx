import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn, userEvent, waitFor, within } from "storybook/test"

import { AttachmentChip } from "@/components/ui/attachment-chip"

const meta = {
  title: "Components/Attachment Chip",
  component: AttachmentChip,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md"] },
    loading: { control: "boolean" },
    invalid: { control: "boolean" },
    disabled: { control: "boolean" },
    name: { control: "text" },
    bytes: { control: "number" },
  },
  args: {
    name: "quarterly-report.pdf",
    bytes: 2_400_000,
  },
} satisfies Meta<typeof AttachmentChip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithRemove: Story = {
  args: { onRemove: fn() },
}

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <AttachmentChip {...args} size="sm" />
      <AttachmentChip {...args} size="md" />
    </div>
  ),
}

/** The glyph is inferred from the file name / MIME type via `@/lib/file`. */
export const Kinds: Story = {
  render: (args) => (
    <div className="flex max-w-md flex-wrap items-center gap-3">
      <AttachmentChip {...args} name="hero-banner.png" bytes={840_000} />
      <AttachmentChip {...args} name="demo-reel.mp4" bytes={48_000_000} />
      <AttachmentChip {...args} name="soundtrack.mp3" bytes={5_200_000} />
      <AttachmentChip {...args} name="build-assets.zip" bytes={12_800_000} />
      <AttachmentChip {...args} name="index.tsx" bytes={4_200} />
      <AttachmentChip {...args} name="q3-metrics.csv" bytes={96_000} />
      <AttachmentChip {...args} name="notes.txt" bytes={1_100} />
    </div>
  ),
}

export const Loading: Story = {
  args: { loading: true, name: "uploading-video.mp4", bytes: 64_000_000 },
}

export const Invalid: Story = {
  args: { invalid: true, name: "too-large.psd", bytes: 120_000_000, onRemove: fn() },
}

export const Disabled: Story = {
  args: { disabled: true, onRemove: fn() },
}

export const NoSize: Story = {
  args: { name: "attachment.pdf", bytes: undefined },
}

/**
 * As a download link — `render={<a>}` makes the chip keyboard-focusable and
 * exposes the AEGIS focus ring automatically.
 */
export const AsLink: Story = {
  args: {
    render: <a href="/files/quarterly-report.pdf" download />,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const link = canvas.getByRole("link", { name: /quarterly-report\.pdf/ })
    await waitFor(() => expect(link).toBeVisible())
    link.focus()
    await expect(link).toHaveFocus()
  },
}

/**
 * Persian / RTL — logical spacing (`gap`, `ms/me`) mirrors the layout; the file
 * glyph and dismiss icon are non-directional and are not flipped.
 */
export const RTLPersian: Story = {
  name: "RTL (Persian)",
  args: { onRemove: fn() },
  render: (args) => (
    <div dir="rtl">
      <AttachmentChip {...args} name="گزارش-فصلی.pdf" />
    </div>
  ),
}

/** The dismiss button fires `onRemove` and is reachable by keyboard. */
export const RemoveInteraction: Story = {
  args: { onRemove: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    // Chip mounts with a `chipPop` entrance animation (opacity 0 → 1); wait for it to settle.
    await waitFor(() => expect(canvas.getByText("quarterly-report.pdf")).toBeVisible())

    const remove = canvas.getByRole("button", { name: "Remove attachment" })
    await userEvent.click(remove)
    await expect(args.onRemove).toHaveBeenCalledTimes(1)
  },
}

/** A disabled chip exposes a disabled dismiss button and does not fire. */
export const DisabledInteraction: Story = {
  args: { disabled: true, onRemove: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const remove = canvas.getByRole("button", { name: "Remove attachment" })
    await expect(remove).toBeDisabled()
    await expect(args.onRemove).not.toHaveBeenCalled()
  },
}
