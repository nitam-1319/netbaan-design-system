import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { PageHeaderBand } from "@/components/ui/page-header-band"
import { Button } from "@/components/ui/button"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */

const meta = {
  title: "Components/PageHeaderBand",
  component: PageHeaderBand,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: {
    kicker: "Attack surface",
    title: "Domains",
    meta: "6 of 1,284 shown · sorted by risk",
  },
} satisfies Meta<typeof PageHeaderBand>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    actions: (
      <>
        <Button variant="outline">Export evidence</Button>
        <Button variant="primary">Add domain</Button>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole("heading", { level: 1 })).toHaveTextContent("Domains")
  },
}

/** A settings or detail page: no eyebrow, no counts, no actions. */
export const TitleOnly: Story = {
  args: { kicker: undefined, meta: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole("heading", { level: 1 })).toBeInTheDocument()
  },
}

/** The band absorbs a long title and a wide action group by wrapping. */
export const LongTitle: Story = {
  args: {
    title: "Vulnerabilities discovered across every monitored attack surface",
    meta: "128 of 20,486 shown · sorted by severity",
    actions: (
      <>
        <Button variant="outline">Export evidence</Button>
        <Button variant="primary">Start scan</Button>
      </>
    ),
  },
}

/** Actions without a counts line — the common shape for detail pages. */
export const ActionsWithoutMeta: Story = {
  args: {
    kicker: undefined,
    meta: undefined,
    title: "Account settings",
    actions: <Button variant="primary">Save changes</Button>,
  },
}
