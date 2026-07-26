import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn, userEvent, within } from "storybook/test"
import { Sparkles, ShieldAlert, FileSearch } from "lucide-react"

import {
  SuggestionChips,
  SuggestionChip,
} from "@/components/ui/suggestion-chips"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers — no `className` is passed to
 * an AEGIS component.
 */
const meta = {
  title: "Components/SuggestionChips",
  component: SuggestionChips,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    disabled: { control: "boolean" },
    label: { control: "text" },
    onSelect: { action: "select" },
  },
  args: {
    onSelect: fn(),
    label: "Suggested prompts",
    size: "md",
    items: [
      { label: "Summarise findings" },
      { label: "Show critical assets" },
      { label: "Expiring certificates" },
    ],
  },
  decorators: [
    (Story) => (
      <div className="max-w-xl text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SuggestionChips>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const group = canvas.getByRole("group", { name: "Suggested prompts" })
    await expect(group).toBeInTheDocument()
    const chip = canvas.getByRole("button", { name: "Show critical assets" })
    await userEvent.click(chip)
    await expect(args.onSelect).toHaveBeenCalledWith("Show critical assets", 1)
  },
}

export const WithIcons: Story = {
  args: {
    items: [
      { label: "Summarise", icon: <Sparkles /> },
      { label: "Triage critical", icon: <ShieldAlert /> },
      { label: "Search assets", icon: <FileSearch /> },
    ],
  },
}

export const Sizes: Story = {
  args: { items: undefined },
  render: () => (
    <div className="flex flex-col gap-4">
      {(["sm", "md", "lg"] as const).map((size) => (
        <SuggestionChips
          key={size}
          size={size}
          label={`Suggestions ${size}`}
          items={[
            { label: "First reply" },
            { label: "Second reply" },
            { label: "Third reply" },
          ]}
        />
      ))}
    </div>
  ),
}

export const Composed: Story = {
  args: { items: undefined },
  render: () => (
    <SuggestionChips label="Quick replies">
      <SuggestionChip icon={<Sparkles />}>Explain this finding</SuggestionChip>
      <SuggestionChip>Draft a remediation</SuggestionChip>
      <SuggestionChip disabled>Escalate (locked)</SuggestionChip>
    </SuggestionChips>
  ),
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}
