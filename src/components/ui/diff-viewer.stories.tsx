import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { DiffViewer } from "@/components/ui/diff-viewer"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */
const meta = {
  title: "Components/DiffViewer",
  component: DiffViewer,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    showLineNumbers: { control: "boolean" },
    showCopy: { control: "boolean" },
    size: { control: "inline-radio", options: ["sm", "md"] },
  },
  args: {
    filename: "auth/token.ts",
    showLineNumbers: true,
    showCopy: true,
    size: "md",
    lines: [
      { type: "context", content: "export function verify(token: string) {", oldLine: 10, newLine: 10 },
      { type: "remove", content: "  return decode(token)", oldLine: 11 },
      { type: "add", content: "  const claims = decode(token)", newLine: 11 },
      { type: "add", content: "  assertNotExpired(claims)", newLine: 12 },
      { type: "add", content: "  return claims", newLine: 13 },
      { type: "context", content: "}", oldLine: 12, newLine: 14 },
    ],
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 620 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DiffViewer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("+3")).toBeInTheDocument()
    await expect(canvas.getByText("−1")).toBeInTheDocument()
    const added = canvas
      .getByText("const claims = decode(token)")
      .closest("[data-slot=diff-viewer-line]")
    await expect(added).toHaveAttribute("data-type", "add")
  },
}

export const NoLineNumbers: Story = {
  args: { showLineNumbers: false },
}

export const Small: Story = {
  args: { size: "sm" },
}
