import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"

import { CurrencyInput } from "@/components/ui/currency-input"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers — no `className` is passed to
 * an AEGIS component.
 */
const meta = {
  title: "Components/CurrencyInput",
  component: CurrencyInput,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    disabled: { control: "boolean" },
    decimals: { control: "number" },
    onValueChange: { action: "valueChange" },
  },
  args: {
    label: "Amount",
    symbol: "$",
  },
  decorators: [
    (Story) => (
      <div className="w-72 p-6 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CurrencyInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    defaultValue: 1234.5,
    description: "Formats on blur; edits as a plain number on focus.",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByLabelText("Amount") as HTMLInputElement
    // Resting: grouped + fixed decimals.
    await expect(input).toHaveValue("1,234.50")
    // Focus reveals the raw editable number.
    await userEvent.click(input)
    await expect(input).toHaveValue("1234.5")
    // Re-enter a value and blur to reformat.
    await userEvent.clear(input)
    await userEvent.type(input, "5000")
    await userEvent.tab()
    await expect(input).toHaveValue("5,000.00")
  },
}

export const Sizes: Story = {
  args: { label: undefined },
  render: () => (
    <div className="flex flex-col gap-5">
      <CurrencyInput size="sm" label="Small" defaultValue={12.5} />
      <CurrencyInput size="md" label="Medium" defaultValue={1200} />
      <CurrencyInput size="lg" label="Large" defaultValue={1250000.75} />
    </div>
  ),
}

export const WithCurrencyCode: Story = {
  args: {
    label: "Budget",
    symbol: "€",
    suffix: "EUR",
    defaultValue: 4999.99,
    description: "Leading symbol plus a trailing currency code.",
  },
}

export const WholeNumbers: Story = {
  args: {
    label: "Seats",
    symbol: "×",
    decimals: 0,
    defaultValue: 25000,
    description: "decimals=0 formats as a grouped integer.",
  },
}

export const Clamped: Story = {
  args: {
    label: "Bid (10–1,000)",
    min: 10,
    max: 1000,
    defaultValue: 250,
    description: "Values are clamped to the range on blur.",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByLabelText("Bid (10–1,000)") as HTMLInputElement
    await userEvent.click(input)
    await userEvent.clear(input)
    await userEvent.type(input, "9999")
    await userEvent.tab()
    await expect(input).toHaveValue("1,000.00")
  },
}

export const Error: Story = {
  args: {
    defaultValue: 0,
    error: "Enter an amount greater than zero.",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByLabelText("Amount")).toHaveAttribute(
      "aria-invalid",
      "true"
    )
    await expect(canvas.getByText(/greater than zero/i)).toBeInTheDocument()
  },
}

export const Disabled: Story = {
  args: {
    defaultValue: 4200,
    disabled: true,
  },
}

export const Empty: Story = {
  args: {
    label: "Amount",
    placeholder: "0.00",
    required: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByLabelText("Amount") as HTMLInputElement
    // Empty, required field: no committed value and native required is set.
    await expect(input).toHaveValue("")
    await expect(input).toBeRequired()
  },
}
