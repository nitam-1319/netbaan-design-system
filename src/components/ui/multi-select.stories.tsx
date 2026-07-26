import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, screen, waitFor, within } from "storybook/test"

import { MultiSelect } from "@/components/ui/multi-select"

/**
 * Multi-select filters a list as you type and keeps several values as removable
 * chips. The list portals to `document.body`; the global Theme/Locale toolbar
 * drives Light/Dark and English-LTR / Persian-RTL.
 */
const meta = {
  title: "Components/MultiSelect",
  component: MultiSelect,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
  decorators: [
    (Story) => (
      <div className="w-80 p-16 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MultiSelect>

export default meta
type Story = StoryObj<typeof meta>

const FRUITS = [
  "Apple",
  "Apricot",
  "Banana",
  "Blackberry",
  "Cherry",
  "Grapefruit",
  "Mango",
  "Peach",
  "Pear",
  "Pineapple",
]

export const Default: Story = {
  args: { items: FRUITS, placeholder: "Add fruit…", "aria-label": "Fruit" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("combobox")
    await userEvent.click(input)
    // Pick two values (multiselect keeps the list open).
    await userEvent.click(await screen.findByRole("option", { name: "Apple" }))
    await userEvent.click(await screen.findByRole("option", { name: "Banana" }))
    // Both appear as removable chips.
    expect(canvas.getByRole("button", { name: "Remove Apple" })).toBeInTheDocument()
    expect(canvas.getByRole("button", { name: "Remove Banana" })).toBeInTheDocument()
    // Removing one drops just that chip.
    await userEvent.click(canvas.getByRole("button", { name: "Remove Apple" }))
    await waitFor(() =>
      expect(canvas.queryByRole("button", { name: "Remove Apple" })).not.toBeInTheDocument()
    )
    expect(canvas.getByRole("button", { name: "Remove Banana" })).toBeInTheDocument()
  },
}

export const Prefilled: Story = {
  args: {
    items: FRUITS,
    defaultValue: ["Cherry", "Mango"],
    placeholder: "Add fruit…",
    "aria-label": "Fruit",
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {(["sm", "md", "lg"] as const).map((size) => (
        <MultiSelect
          key={size}
          size={size}
          items={FRUITS}
          defaultValue={["Apple"]}
          placeholder={`Size ${size}…`}
          aria-label={`Fruit ${size}`}
        />
      ))}
    </div>
  ),
}
