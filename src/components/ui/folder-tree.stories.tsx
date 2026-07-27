import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn, userEvent, within } from "storybook/test"

import { FolderTree } from "@/components/ui/folder-tree"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */
const ITEMS = [
  {
    id: "src",
    name: "src",
    type: "folder" as const,
    children: [
      {
        id: "components",
        name: "components",
        type: "folder" as const,
        children: [
          { id: "button", name: "button.tsx", type: "file" as const },
          { id: "styles", name: "styles.css", type: "file" as const },
        ],
      },
      { id: "logo", name: "logo.svg", type: "file" as const },
    ],
  },
  { id: "empty", name: "assets", type: "folder" as const },
  { id: "readme", name: "README.md", type: "file" as const },
]

const meta = {
  title: "Components/FolderTree",
  component: FolderTree,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    onSelectionChange: { action: "selectionChange" },
    onExpandedChange: { action: "expandedChange" },
  },
  args: {
    onSelectionChange: fn(),
    onExpandedChange: fn(),
    items: ITEMS,
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
} satisfies Meta<typeof FolderTree>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("components")).toBeInTheDocument()
    await userEvent.click(canvas.getByText("components"))
    await expect(canvas.getByText("button.tsx")).toBeInTheDocument()
    await userEvent.click(canvas.getByText("button.tsx"))
    await expect(args.onSelectionChange).toHaveBeenCalledWith("button")
  },
}

export const FullyExpanded: Story = {
  args: { defaultExpandedIds: ["src", "components"] },
}
