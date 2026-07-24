import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, waitFor, within } from "storybook/test"

import { CopyButton } from "@/components/ui/copy-to-clipboard"

/**
 * Every story renders inside an explicit `.dark` surface so the AEGIS dark
 * theme (the design system's primary theme) is exercised.
 */
const meta = {
  title: "Components/CopyButton",
  component: CopyButton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["outline", "ghost", "soft"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    value: { control: "text" },
    disabled: { control: "boolean" },
  },
  args: {
    value: "npm i @aegis/ui",
    children: "Copy",
  },
  decorators: [
    (Story) => (
      <div className="dark bg-background text-foreground flex min-h-24 items-center justify-center gap-3 p-10">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CopyButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Variants: Story = {
  args: { children: undefined },
  render: () => (
    <div className="flex items-center gap-3">
      <CopyButton variant="outline" value="outline">
        Outline
      </CopyButton>
      <CopyButton variant="ghost" value="ghost">
        Ghost
      </CopyButton>
      <CopyButton variant="soft" value="soft">
        Soft
      </CopyButton>
    </div>
  ),
}

export const Sizes: Story = {
  args: { children: undefined },
  render: () => (
    <div className="flex items-center gap-3">
      <CopyButton size="sm" value="sm">
        Small
      </CopyButton>
      <CopyButton size="md" value="md">
        Medium
      </CopyButton>
      <CopyButton size="lg" value="lg">
        Large
      </CopyButton>
    </div>
  ),
}

export const IconOnly: Story = {
  args: { children: undefined, value: "8f3c-copied-token" },
}

export const Disabled: Story = {
  args: { disabled: true },
}

/**
 * Clicking copies the value and flips the button into its confirmed state:
 * the accessible label becomes "Copied". We stub the async Clipboard API so
 * the play test is deterministic in the runner.
 */
export const CopyInteraction: Story = {
  args: { value: "aegis-copy-token", children: "Copy token" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    let written = ""
    Object.assign(navigator, {
      clipboard: {
        writeText: (text: string) => {
          written = text
          return Promise.resolve()
        },
      },
    })

    const button = canvas.getByRole("button", { name: "Copy token" })
    await userEvent.click(button)

    await waitFor(() => expect(written).toBe("aegis-copy-token"))
    await waitFor(() =>
      expect(
        canvas.getByRole("button", { name: "Copied" })
      ).toBeInTheDocument()
    )
  },
}
