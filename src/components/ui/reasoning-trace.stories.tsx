import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"

import { ReasoningTrace } from "@/components/ui/reasoning-trace"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */
const meta = {
  title: "Components/ReasoningTrace",
  component: ReasoningTrace,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    status: { control: "inline-radio", options: ["done", "thinking"] },
    defaultOpen: { control: "boolean" },
    durationSeconds: { control: { type: "number" } },
    onOpenChange: { action: "openChange" },
  },
  args: {
    title: "Reasoning",
    durationSeconds: 4,
    status: "done",
    defaultOpen: false,
    steps: [
      "Parsed the request and identified the target subdomain set.",
      "Cross-referenced open ports against the known-service fingerprint DB.",
      "Ranked findings by CVSS and exposure, surfacing the two criticals first.",
    ],
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 560 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ReasoningTrace>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole("button", { name: /Reasoning/i })
    // Collapsed by default → expanding reveals the steps.
    await expect(trigger).toHaveAttribute("aria-expanded", "false")
    await userEvent.click(trigger)
    await expect(trigger).toHaveAttribute("aria-expanded", "true")
    await expect(
      canvas.getByText(/identified the target subdomain set/i)
    ).toBeInTheDocument()
  },
}

export const Expanded: Story = {
  args: { defaultOpen: true },
}

export const Thinking: Story = {
  args: { status: "thinking", durationSeconds: undefined, defaultOpen: true },
}

export const Freeform: Story = {
  args: {
    steps: undefined,
    defaultOpen: true,
    children:
      "The asset was flagged because its TLS certificate expires in 6 days and it exposes an admin panel without IP allow-listing. Both raise the effective severity above the base CVSS.",
  },
}

export const NoDuration: Story = {
  args: { durationSeconds: undefined },
}
