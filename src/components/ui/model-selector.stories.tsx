import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn, userEvent, screen, within } from "storybook/test"
import { Sparkles, Zap, Brain, Bot } from "lucide-react"

import { ModelSelector, type ModelOption } from "@/components/ui/model-selector"

const MODELS: ModelOption[] = [
  {
    value: "opus",
    label: "Claude Opus",
    description: "Most capable — deep reasoning and analysis",
    icon: <Brain />,
    badge: "Pro",
  },
  {
    value: "sonnet",
    label: "Claude Sonnet",
    description: "Balanced speed and capability",
    icon: <Sparkles />,
  },
  {
    value: "haiku",
    label: "Claude Haiku",
    description: "Fastest — light, everyday tasks",
    icon: <Zap />,
  },
]

const GROUPED: ModelOption[] = [
  { value: "opus", label: "Claude Opus", description: "Deep reasoning", icon: <Brain />, badge: "Pro", group: "Models" },
  { value: "sonnet", label: "Claude Sonnet", description: "Balanced", icon: <Sparkles />, group: "Models" },
  { value: "triage", label: "Triage agent", description: "Routes and prioritises findings", icon: <Bot />, group: "Agents" },
  { value: "recon", label: "Recon agent", description: "Discovers new assets", icon: <Bot />, group: "Agents", badge: "Beta" },
]

const meta = {
  title: "Components/Model Selector",
  component: ModelSelector,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "inline-radio", options: ["outline", "filled", "flush"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    disabled: { control: "boolean" },
  },
  args: {
    models: MODELS,
    label: "Model",
    placeholder: "Select a model",
    variant: "outline",
    size: "md",
    onValueChange: fn(),
  },
  decorators: [
    (Story) => (
      <div className="text-foreground w-72 p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ModelSelector>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole("combobox")
    await userEvent.click(trigger)

    // Menu is portalled; pick Sonnet.
    const option = await screen.findByRole("option", { name: /Claude Sonnet/ })
    await userEvent.click(option)

    // Base UI passes (value, eventDetails); assert on the value argument.
    await expect(args.onValueChange).toHaveBeenCalledWith("sonnet", expect.anything())
    // Trigger now reflects the chosen model.
    await expect(canvas.getByRole("combobox")).toHaveTextContent("Claude Sonnet")
  },
}

export const WithDefault: Story = {
  args: { defaultValue: "sonnet" },
}

export const Grouped: Story = {
  args: { models: GROUPED, label: "Model or agent", placeholder: "Choose…" },
}

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <ModelSelector {...args} size="sm" defaultValue="haiku" />
      <ModelSelector {...args} size="md" defaultValue="sonnet" />
      <ModelSelector {...args} size="lg" defaultValue="opus" />
    </div>
  ),
}

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "opus" },
}
