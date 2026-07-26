import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"
import { Download } from "lucide-react"

import { FilePreview } from "@/components/ui/file-preview"

const IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='320' height='180'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='%237c5cff'/><stop offset='1' stop-color='%2322d3ee'/></linearGradient></defs><rect width='320' height='180' fill='url(%23g)'/><circle cx='240' cy='60' r='40' fill='%23ffffff' opacity='0.35'/></svg>"
  )

const meta = {
  title: "Components/File Preview",
  component: FilePreview,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    aspect: { control: "inline-radio", options: ["square", "video", "wide"] },
    zoomable: { control: "boolean" },
    hideFooter: { control: "boolean" },
    disabled: { control: "boolean" },
    name: { control: "text" },
  },
  args: {
    name: "cover-art.png",
    src: IMG,
    bytes: 980_000,
    mimeType: "image/png",
    caption: "Generated cover artwork",
  },
  decorators: [
    (Story) => (
      <div className="w-[22rem] max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FilePreview>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Square: Story = {
  args: { aspect: "square" },
}

export const WithAction: Story = {
  args: {
    action: (
      <button
        type="button"
        aria-label="Download"
        className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-accent-soft"
      >
        <Download className="size-4" aria-hidden />
      </button>
    ),
  },
}

export const NonImage: Story = {
  args: { name: "annual-report.pdf", src: undefined, bytes: 4_200_000, mimeType: "application/pdf" },
}

export const NotZoomable: Story = {
  args: { zoomable: false },
}

export const NoFooter: Story = {
  args: { hideFooter: true, aspect: "square" },
}

export const Kinds: Story = {
  render: (args) => (
    <div className="grid grid-cols-2 gap-3">
      <FilePreview {...args} name="report.pdf" src={undefined} mimeType="application/pdf" bytes={2_400_000} aspect="square" />
      <FilePreview {...args} name="promo.mp4" src={undefined} mimeType="video/mp4" bytes={48_000_000} aspect="square" />
      <FilePreview {...args} name="assets.zip" src={undefined} mimeType="application/zip" bytes={12_800_000} aspect="square" />
      <FilePreview {...args} name="main.tsx" src={undefined} bytes={4_200} aspect="square" />
    </div>
  ),
}

export const Disabled: Story = {
  args: { disabled: true },
}

/** Persian / RTL — the footer (name/meta ↔ action) mirrors. */
export const RTLPersian: Story = {
  name: "RTL (Persian)",
  render: (args) => (
    <div dir="rtl">
      <FilePreview {...args} name="طرح-جلد.png" caption="طرح جلد تولیدشده" />
    </div>
  ),
}

/** The image preview exposes a labelled dialog trigger. */
export const PreviewTrigger: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole("button", { name: "Preview cover-art.png" })
    await expect(trigger).toBeInTheDocument()
    await expect(trigger).toHaveAttribute("aria-haspopup", "dialog")
  },
}
