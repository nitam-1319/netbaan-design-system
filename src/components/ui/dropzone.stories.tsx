import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn, userEvent, within } from "storybook/test"

import { Dropzone } from "@/components/ui/dropzone"

/**
 * Every story renders inside an explicit `.dark` surface so the AEGIS dark
 * theme (the design system's primary theme) is exercised.
 */
const meta = {
  title: "Components/Dropzone",
  component: Dropzone,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    disabled: { control: "boolean" },
    invalid: { control: "boolean" },
    multiple: { control: "boolean" },
    accept: { control: "text" },
    title: { control: "text" },
    description: { control: "text" },
    hint: { control: "text" },
  },
  args: {
    size: "md",
    multiple: true,
    title: "Drag & drop files here",
    description: "or click to browse",
    hint: "PNG, JPG or PDF · up to 10 MB",
    onFilesSelected: fn(),
  },
  decorators: [
    (Story) => (
      <div className="dark bg-background text-foreground w-[28rem] max-w-full p-10">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Dropzone>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <Dropzone {...args} size="sm" hint="Small" />
      <Dropzone {...args} size="md" hint="Medium" />
      <Dropzone {...args} size="lg" hint="Large" />
    </div>
  ),
}

export const SingleFile: Story = {
  args: {
    multiple: false,
    title: "Upload your avatar",
    description: "or click to browse",
    hint: "One square image, PNG or JPG",
    accept: "image/png,image/jpeg",
  },
}

export const Invalid: Story = {
  args: {
    invalid: true,
    title: "That file type isn't allowed",
    description: "Drop a different file or click to browse",
    hint: "Only PDF documents are accepted",
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    description: "Uploading is disabled while your plan is paused",
  },
}

export const CustomContent: Story = {
  args: {
    title: "Import a dataset",
    description: "Drag a .csv or .json export here",
    hint: "We never store the raw file — parsing happens in your browser",
    accept: ".csv,.json",
  },
}

/**
 * Persian / RTL — logical spacing and a `flex-col` centre layout mean the
 * region mirrors correctly under `dir="rtl"`; the upload glyph is
 * non-directional and is not mirrored.
 */
export const RTLPersian: Story = {
  name: "RTL (Persian)",
  render: (args) => (
    <div dir="rtl">
      <Dropzone
        {...args}
        title="فایل‌ها را اینجا رها کنید"
        description="یا برای انتخاب کلیک کنید"
        hint="PNG، JPG یا PDF · حداکثر ۱۰ مگابایت"
      />
    </div>
  ),
}

/**
 * Selecting files through the native picker reports them via `onFilesSelected`.
 * We drive the hidden file input directly so the play test is deterministic in
 * the runner (no OS file dialog).
 */
export const SelectFiles: Story = {
  args: { onFilesSelected: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)

    const input = canvasElement.querySelector<HTMLInputElement>(
      "[data-slot='dropzone-input']"
    )
    await expect(input).toBeInTheDocument()
    await expect(
      canvas.getByText("Drag & drop files here", {
        selector: "[data-slot='dropzone-title']",
      })
    ).toBeVisible()

    const file = new File(["hello aegis"], "notes.txt", { type: "text/plain" })
    await userEvent.upload(input as HTMLInputElement, file)

    await expect(args.onFilesSelected).toHaveBeenCalledTimes(1)
    const [received] = (args.onFilesSelected as ReturnType<typeof fn>).mock
      .calls[0] as [File[]]
    await expect(received).toHaveLength(1)
    await expect(received[0].name).toBe("notes.txt")
  },
}

/**
 * A disabled dropzone exposes a disabled input and does not fire selection.
 */
export const DisabledInteraction: Story = {
  args: { disabled: true, onFilesSelected: fn() },
  play: async ({ args, canvasElement }) => {
    const input = canvasElement.querySelector<HTMLInputElement>(
      "[data-slot='dropzone-input']"
    )
    await expect(input).toBeDisabled()
    await expect(args.onFilesSelected).not.toHaveBeenCalled()
  },
}
