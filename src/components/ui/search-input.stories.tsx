import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"

import { SearchInput } from "@/components/ui/search-input"

const meta = {
  title: "Components/SearchInput",
  component: SearchInput,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    disabled: { control: "boolean" },
    hideClear: { control: "boolean" },
    onChange: { action: "change" },
    onClear: { action: "clear" },
  },
  args: {
    label: "Search",
    placeholder: "Search…",
  },
  decorators: [
    (Story) => (
      <div className="w-80 p-6 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SearchInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("searchbox", { name: "Search" })
    // No clear button until there is a value.
    await expect(
      canvas.queryByRole("button", { name: "Clear search" })
    ).toBeNull()
    await userEvent.type(input, "invoices")
    await expect(input).toHaveValue("invoices")
    // Clear button appears and empties the field.
    const clear = canvas.getByRole("button", { name: "Clear search" })
    await userEvent.click(clear)
    await expect(input).toHaveValue("")
  },
}

export const Sizes: Story = {
  args: { label: undefined },
  render: () => (
    <div className="flex flex-col gap-5">
      <SearchInput size="sm" label="Small" />
      <SearchInput size="md" label="Medium" />
      <SearchInput size="lg" label="Large" />
    </div>
  ),
}

export const WithHelperText: Story = {
  args: {
    label: "Find a project",
    description: "Search by name, key, or owner.",
  },
}

export const Prefilled: Story = {
  args: {
    label: "Search",
    defaultValue: "quarterly report",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Clear button is present immediately for a prefilled field.
    await expect(
      canvas.getByRole("button", { name: "Clear search" })
    ).toBeInTheDocument()
  },
}

export const Error: Story = {
  args: {
    label: "Search",
    defaultValue: "??",
    error: "Enter at least three characters.",
  },
}

export const NoClearButton: Story = {
  args: { label: "Search", defaultValue: "persistent", hideClear: true },
}

export const Disabled: Story = {
  args: { defaultValue: "read only", disabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole("searchbox", { name: "Search" })).toBeDisabled()
  },
}
