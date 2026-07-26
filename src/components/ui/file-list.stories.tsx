import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn, userEvent, within } from "storybook/test"

import { FileList, type FileListItem } from "@/components/ui/file-list"

const SAMPLE: FileListItem[] = [
  { id: "1", name: "annual-report-2025.pdf", bytes: 4_200_000 },
  { id: "2", name: "q3-metrics.csv", bytes: 96_000 },
  { id: "3", name: "keynote-recording.mp4", bytes: 512_000_000, status: "uploading", progress: 62 },
  { id: "4", name: "brand-assets.zip", bytes: 12_800_000, status: "success" },
  { id: "5", name: "huge-export.psd", bytes: 220_000_000, status: "error", errorMessage: "Exceeds the 100 MB limit" },
]

const meta = {
  title: "Components/File List",
  component: FileList,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md"] },
    removable: { control: "boolean" },
    showSummary: { control: "boolean" },
    disabled: { control: "boolean" },
    title: { control: "text" },
  },
  args: {
    files: SAMPLE,
    title: "Attachments",
    removable: true,
    showSummary: true,
    onRemove: fn(),
  },
  decorators: [
    (Story) => (
      <div className="w-[32rem] max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FileList>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const NoHeader: Story = {
  args: { title: undefined, showSummary: false },
}

export const NotRemovable: Story = {
  args: { removable: false },
}

export const Small: Story = {
  args: { size: "sm" },
}

export const Empty: Story = {
  args: {
    files: [],
    emptyState: (
      <div className="rounded-xl border border-dashed border-border-strong bg-surface-2 p-6 text-center text-sm text-muted-foreground">
        No files attached yet
      </div>
    ),
  },
}

export const SingleFile: Story = {
  args: { files: [SAMPLE[0]], title: "Attachment" },
}

/**
 * Persian / RTL — the header (title ↔ summary) and every row mirror; the summary
 * digits stay tabular.
 */
export const RTLPersian: Story = {
  name: "RTL (Persian)",
  render: (args) => (
    <div dir="rtl">
      <FileList
        {...args}
        title="پیوست‌ها"
        files={[
          { id: "1", name: "گزارش-سالانه.pdf", bytes: 4_200_000, description: "۴٫۲ مگابایت · سند" },
          { id: "2", name: "داده‌ها.csv", bytes: 96_000, description: "۹۶ کیلوبایت · صفحه‌گسترده" },
        ]}
      />
    </div>
  ),
}

/** Removing a row calls `onRemove` with the item id. */
export const RemoveInteraction: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)

    const list = canvas.getByRole("list", { name: "Attachments" })
    await expect(list).toBeInTheDocument()
    await expect(canvas.getAllByRole("listitem")).toHaveLength(5)

    const removeButtons = canvas.getAllByRole("button", { name: "Remove file" })
    await userEvent.click(removeButtons[0])
    await expect(args.onRemove).toHaveBeenCalledTimes(1)
    await expect(args.onRemove).toHaveBeenCalledWith("1")
  },
}

/** The summary reflects the count and total size. */
export const SummaryReadout: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText(/^5 files ·/)).toBeVisible()
  },
}
