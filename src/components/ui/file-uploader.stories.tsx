import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn, userEvent, within } from "storybook/test"

import { FileUploader } from "@/components/ui/file-uploader"

const meta = {
  title: "Components/File Uploader",
  component: FileUploader,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    multiple: { control: "boolean" },
    disabled: { control: "boolean" },
    maxFiles: { control: "number" },
    accept: { control: "text" },
    title: { control: "text" },
  },
  args: {
    listTitle: "Selected files",
    onFilesChange: fn(),
  },
  decorators: [
    (Story) => (
      <div className="w-[32rem] max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FileUploader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithSeededFiles: Story = {
  args: {
    defaultFiles: [
      { id: "seed-1", name: "annual-report.pdf", bytes: 4_200_000, status: "success" },
      { id: "seed-2", name: "metrics.csv", bytes: 96_000, status: "idle" },
    ],
  },
}

export const SingleFile: Story = {
  args: {
    multiple: false,
    maxFiles: 1,
    title: "Replace your avatar",
    accept: "image/png,image/jpeg",
    hint: "One square PNG or JPG",
  },
}

export const ImagesOnly: Story = {
  args: {
    accept: "image/*",
    title: "Upload images",
    description: "PNG, JPG, GIF or WebP",
  },
}

export const WithLimits: Story = {
  args: {
    maxFiles: 3,
    maxSizeBytes: 5_000_000,
    onReject: fn(),
    hint: "Up to 3 files · 5 MB each",
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultFiles: [{ id: "d1", name: "locked.pdf", bytes: 1_200_000 }],
  },
}

/** Persian / RTL — the Dropzone and the file list both mirror. */
export const RTLPersian: Story = {
  name: "RTL (Persian)",
  render: (args) => (
    <div dir="rtl">
      <FileUploader
        {...args}
        title="فایل‌ها را اینجا رها کنید"
        description="یا برای انتخاب کلیک کنید"
        listTitle="فایل‌های انتخاب‌شده"
      />
    </div>
  ),
}

/** Selecting through the picker appends validated files to the list. */
export const SelectAppends: Story = {
  args: { onFilesChange: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvasElement.querySelector<HTMLInputElement>(
      "[data-slot='dropzone-input']"
    )
    await expect(input).toBeInTheDocument()

    const file = new File(["hello aegis"], "notes.txt", { type: "text/plain" })
    await userEvent.upload(input as HTMLInputElement, file)

    await expect(canvas.getByText("notes.txt")).toBeVisible()
    await expect(args.onFilesChange).toHaveBeenCalled()
    await expect(canvas.getAllByRole("listitem")).toHaveLength(1)
  },
}

/** An oversized file is kept with an error status and a reason. */
export const RejectsOversize: Story = {
  args: { maxSizeBytes: 4, onReject: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvasElement.querySelector<HTMLInputElement>(
      "[data-slot='dropzone-input']"
    )
    const big = new File(["way too many bytes here"], "big.txt", { type: "text/plain" })
    await userEvent.upload(input as HTMLInputElement, big)

    await expect(canvas.getByText(/Exceeds the/)).toBeVisible()
    await expect(args.onReject).toHaveBeenCalledTimes(1)
  },
}
