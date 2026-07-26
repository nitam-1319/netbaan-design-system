import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn, userEvent, within } from "storybook/test"
import { Download } from "lucide-react"

import { FileCard } from "@/components/ui/file-card"

const meta = {
  title: "Components/File Card",
  component: FileCard,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md"] },
    status: { control: "inline-radio", options: ["idle", "uploading", "success", "error"] },
    progress: { control: { type: "range", min: 0, max: 100, step: 1 } },
    selected: { control: "boolean" },
    disabled: { control: "boolean" },
    name: { control: "text" },
    bytes: { control: "number" },
  },
  args: {
    name: "annual-report-2025.pdf",
    bytes: 4_200_000,
  },
  decorators: [
    (Story) => (
      <div className="w-[30rem] max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FileCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithActions: Story = {
  args: {
    onRemove: fn(),
    actions: (
      <button
        type="button"
        aria-label="Download"
        className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-accent-soft"
      >
        <Download className="size-4" aria-hidden />
      </button>
    ),
  },
}

export const Uploading: Story = {
  args: { status: "uploading", progress: 62, name: "keynote-recording.mp4", bytes: 512_000_000 },
}

export const Success: Story = {
  args: { status: "success", onRemove: fn() },
}

export const Error: Story = {
  args: {
    status: "error",
    name: "huge-export.psd",
    bytes: 220_000_000,
    errorMessage: "File exceeds the 100 MB limit",
    onRemove: fn(),
  },
}

export const Thumbnail: Story = {
  args: {
    name: "cover-art.png",
    bytes: 980_000,
    thumbnailSrc:
      "data:image/svg+xml;utf8," +
      encodeURIComponent(
        "<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='%237c5cff'/><stop offset='1' stop-color='%2322d3ee'/></linearGradient></defs><rect width='48' height='48' fill='url(%23g)'/></svg>"
      ),
    onRemove: fn(),
  },
}

export const Selected: Story = {
  args: { selected: true, onRemove: fn() },
}

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <FileCard {...args} size="sm" name="small-card.csv" bytes={64_000} />
      <FileCard {...args} size="md" name="medium-card.csv" bytes={64_000} />
    </div>
  ),
}

export const Kinds: Story = {
  render: (args) => (
    <div className="flex flex-col gap-2.5">
      <FileCard {...args} name="report.pdf" bytes={2_400_000} />
      <FileCard {...args} name="dataset.csv" bytes={96_000} />
      <FileCard {...args} name="promo.mp4" bytes={48_000_000} />
      <FileCard {...args} name="assets.zip" bytes={12_800_000} />
      <FileCard {...args} name="main.tsx" bytes={4_200} />
    </div>
  ),
}

export const Disabled: Story = {
  args: { disabled: true, onRemove: fn() },
}

/**
 * Persian / RTL — logical layout mirrors; the thumbnail tile leads and the
 * dismiss button trails on the correct side.
 */
export const RTLPersian: Story = {
  name: "RTL (Persian)",
  args: { onRemove: fn() },
  render: (args) => (
    <div dir="rtl">
      <FileCard {...args} name="گزارش-سالانه.pdf" description="۴٫۲ مگابایت · سند" />
    </div>
  ),
}

/** The dismiss button fires `onRemove` and is keyboard-reachable. */
export const RemoveInteraction: Story = {
  args: { onRemove: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("annual-report-2025.pdf")).toBeVisible()

    const remove = canvas.getByRole("button", { name: "Remove file" })
    await userEvent.click(remove)
    await expect(args.onRemove).toHaveBeenCalledTimes(1)
  },
}

/** The uploading state exposes a labelled progressbar at the given value. */
export const UploadingProgress: Story = {
  args: { status: "uploading", progress: 45, name: "video.mp4", bytes: 80_000_000 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const bar = canvas.getByRole("progressbar", { name: "Uploading video.mp4" })
    await expect(bar).toBeInTheDocument()
    await expect(bar).toHaveAttribute("aria-valuenow", "45")
  },
}
