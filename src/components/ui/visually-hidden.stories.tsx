import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { VisuallyHidden } from "@/components/ui/visually-hidden"
import { Button } from "@/components/ui/button"

const meta = {
  title: "Components/VisuallyHidden",
  component: VisuallyHidden,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    children: "Content for screen readers only",
  },
} satisfies Meta<typeof VisuallyHidden>

export default meta
type Story = StoryObj<typeof meta>

/**
 * On its own, `VisuallyHidden` renders nothing you can see — the text below the
 * frame is present in the accessibility tree and announced by screen readers.
 */
export const Default: Story = {
  render: (args) => (
    <p className="text-muted-foreground text-sm">
      There is hidden text here →<VisuallyHidden {...args} />← announced but not
      shown.
    </p>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Present in the DOM / a11y tree even though it is clipped from view.
    const hidden = canvas.getByText("Content for screen readers only")
    await expect(hidden).toBeInTheDocument()
  },
}

/**
 * The most common use: give an icon-only button a spoken name. The glyph is all
 * a sighted user needs; screen-reader users hear "Run scan".
 */
export const IconButtonLabel: Story = {
  render: () => (
    <Button size="icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
        <path
          d="M5 3l14 9-14 9V3z"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
      <VisuallyHidden>Run scan</VisuallyHidden>
    </Button>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // The button has no visible text, yet exposes an accessible name.
    await expect(
      canvas.getByRole("button", { name: "Run scan" })
    ).toBeInTheDocument()
  },
}

/**
 * Add screen-reader-only context to visible text — here, a caveat that would be
 * visual clutter next to the link label.
 */
export const InlineContext: Story = {
  render: () => (
    <a href="https://example.com" className="text-primary underline">
      View report
      <VisuallyHidden> (opens in a new tab)</VisuallyHidden>
    </a>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole("link", { name: "View report (opens in a new tab)" })
    ).toBeInTheDocument()
  },
}

/**
 * Polymorphic via `render`: expose a heading that structures the page for
 * assistive tech without adding a visible title to a compact widget.
 */
export const AsHeading: Story = {
  render: () => (
    <section className="text-foreground text-sm">
      <VisuallyHidden render={<h2 />}>Recent findings</VisuallyHidden>
      <p>3 new criticals since your last visit.</p>
    </section>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole("heading", { name: "Recent findings" })
    ).toBeInTheDocument()
  },
}
