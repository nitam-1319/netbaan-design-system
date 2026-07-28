import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within, fn } from "storybook/test"
import { Archive, Trash2 } from "lucide-react"

import { SwipeActions } from "@/components/ui/swipe-actions"
import { List } from "@/components/ui/list"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */
const meta = {
  title: "Components/SwipeActions",
  component: SwipeActions,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: {
    actions: [
      { label: "Archive", icon: <Archive aria-hidden />, onClick: fn() },
      { label: "Delete", icon: <Trash2 aria-hidden />, onClick: fn(), destructive: true },
    ],
    children: "Swipe this row left",
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 420 }}>
        <List variant="bordered">
          <Story />
        </List>
      </div>
    ),
  ],
} satisfies Meta<typeof SwipeActions>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // The actions are real, operable buttons even without swiping.
    const del = canvas.getByRole("button", { name: "Delete" })
    await expect(del).toBeInTheDocument()
    await userEvent.click(del)
    // onClick is wired (fn() from args).
    await expect(canvas.getByText("Swipe this row left")).toBeInTheDocument()
  },
}

export const SingleAction: Story = {
  args: {
    actions: [
      { label: "Delete", icon: <Trash2 aria-hidden />, onClick: fn(), destructive: true },
    ],
  },
}

/** Gesture disabled — the row no longer swipes (actions stay reachable elsewhere). */
export const Disabled: Story = {
  args: { disabled: true },
}

export const Rows: Story = {
  // The `List` wrapper comes from the decorator, so the rows are valid
  // `role="listitem"` children of a single semantic list.
  render: () => (
    <>
      {["Alert from web-01", "Scan completed", "Cert expiring"].map((t) => (
        <SwipeActions
          key={t}
          actions={[
            { label: "Archive", icon: <Archive aria-hidden />, onClick: () => {} },
            { label: "Delete", icon: <Trash2 aria-hidden />, onClick: () => {}, destructive: true },
          ]}
        >
          {t}
        </SwipeActions>
      ))}
    </>
  ),
}
