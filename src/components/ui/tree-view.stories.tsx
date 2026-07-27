import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn, userEvent, within } from "storybook/test"

import { TreeView } from "@/components/ui/tree-view"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */
const NODES = [
  {
    id: "src",
    label: "src",
    children: [
      {
        id: "components",
        label: "components",
        children: [
          { id: "button", label: "button.tsx" },
          { id: "card", label: "card.tsx" },
        ],
      },
      { id: "index", label: "index.ts" },
    ],
  },
  {
    id: "public",
    label: "public",
    children: [{ id: "favicon", label: "favicon.svg" }],
  },
  { id: "readme", label: "README.md" },
]

const meta = {
  title: "Components/TreeView",
  component: TreeView,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    onExpandedChange: { action: "expandedChange" },
    onSelectionChange: { action: "selectionChange" },
  },
  args: {
    onExpandedChange: fn(),
    onSelectionChange: fn(),
    nodes: NODES,
    defaultExpandedIds: ["src"],
    label: "Project files",
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 320 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TreeView>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    // "src" is expanded initially → its children are visible.
    await expect(canvas.getByText("components")).toBeInTheDocument()
    // Expand "components".
    await userEvent.click(canvas.getByText("components"))
    await expect(args.onExpandedChange).toHaveBeenCalled()
    await expect(canvas.getByText("button.tsx")).toBeInTheDocument()
    // Select a leaf.
    await userEvent.click(canvas.getByText("button.tsx"))
    await expect(args.onSelectionChange).toHaveBeenCalledWith("button")
  },
}

export const Collapsed: Story = {
  args: { defaultExpandedIds: [] },
}

export const FullyExpanded: Story = {
  args: { defaultExpandedIds: ["src", "components", "public"] },
}
