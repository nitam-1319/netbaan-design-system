import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { ToolCallBlock } from "@/components/ui/tool-call-block"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */
const meta = {
  title: "Components/ToolCallBlock",
  component: ToolCallBlock,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    status: { control: "inline-radio", options: ["pending", "success", "error"] },
    language: { control: "text" },
  },
  args: {
    name: "scan_subdomains",
    description: "Enumerate live subdomains for a target domain",
    status: "success",
    language: "json",
    args: { domain: "example.com", ports: [80, 443], timeout_s: 30 },
    result: { found: 12, live: 9, criticals: 2 },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 560 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ToolCallBlock>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const root = canvas
      .getByText("scan_subdomains")
      .closest("[data-slot=tool-call-block]")
    await expect(root).toHaveAttribute("data-status", "success")
    await expect(canvas.getByText("Succeeded")).toBeInTheDocument()
    // Arguments are pretty-printed as JSON.
    await expect(canvas.getByText(/"domain"/)).toBeInTheDocument()
  },
}

export const Running: Story = {
  args: { status: "pending", result: undefined },
}

export const Failed: Story = {
  args: {
    status: "error",
    result: { error: "timeout after 30s", code: "ETIMEDOUT" },
  },
}

export const StringArgs: Story = {
  args: {
    name: "run_query",
    language: "sql",
    args: "SELECT host, port FROM assets WHERE exposed = true;",
    result: undefined,
  },
}

export const NoArguments: Story = {
  args: { name: "refresh_inventory", args: undefined, result: { updated: 340 } },
}
