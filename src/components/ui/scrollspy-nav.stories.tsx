import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { ScrollspyNav } from "@/components/ui/scrollspy-nav"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */
const ITEMS = [
  { id: "overview", label: "Overview" },
  { id: "install", label: "Installation" },
  { id: "usage", label: "Usage" },
  { id: "api", label: "API" },
]

const meta = {
  title: "Components/ScrollspyNav",
  component: ScrollspyNav,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    orientation: { control: "inline-radio", options: ["vertical", "horizontal"] },
    onActiveChange: { action: "activeChange" },
  },
  args: {
    items: ITEMS,
    orientation: "vertical",
    label: "On this page",
  },
  decorators: [
    (Story) => (
      <div style={{ display: "flex", gap: 24 }}>
        <div style={{ position: "sticky", top: 0, alignSelf: "flex-start" }}>
          <Story />
        </div>
        <div>
          {ITEMS.map((s) => (
            <section
              key={s.id}
              id={s.id}
              style={{ minHeight: 200, paddingBottom: 24 }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>{s.label}</h3>
              <p style={{ fontSize: 14, color: "var(--muted-foreground)" }}>
                Content for {s.label}.
              </p>
            </section>
          ))}
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof ScrollspyNav>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const nav = canvas.getByRole("navigation", { name: "On this page" })
    await expect(nav).toBeInTheDocument()
    // The first item is active initially.
    const overview = canvas.getByRole("link", { name: "Overview" })
    await expect(overview).toHaveAttribute("aria-current", "location")
  },
}

export const Horizontal: Story = {
  args: { orientation: "horizontal" },
}
