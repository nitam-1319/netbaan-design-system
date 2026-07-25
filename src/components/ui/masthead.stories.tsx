import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { Button } from "@/components/ui/button"
import {
  Masthead,
  MastheadContent,
  MastheadEyebrow,
  MastheadBrand,
  MastheadBreadcrumb,
  MastheadTitle,
  MastheadDescription,
  MastheadActions,
} from "@/components/ui/masthead"

/**
 * The AEGIS page header. A rotating conic-gradient **beam** sweeps around the
 * border while the content sits on an inset `--card` panel. This is the
 * signature masthead used on every reference page.
 */
const meta = {
  title: "Components/Masthead",
  component: Masthead,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="bg-background p-8 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Masthead>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Masthead>
      <MastheadContent>
        <MastheadEyebrow>
          <MastheadBrand>AEGIS</MastheadBrand>
          <MastheadBreadcrumb>DESIGN SYSTEM / v1.0</MastheadBreadcrumb>
        </MastheadEyebrow>
        <MastheadTitle>Component library</MastheadTitle>
        <MastheadDescription>
          A dark-first, enterprise-grade system. Every component ships a
          20-point specification — anatomy, states, tokens, accessibility, and
          production React.
        </MastheadDescription>
      </MastheadContent>
      <MastheadActions>
        <Button variant="outline" size="sm">
          ☾ Dark mode
        </Button>
      </MastheadActions>
    </Masthead>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvasElement.querySelector("[data-slot='masthead']")
    ).toBeInTheDocument()
    await expect(canvas.getByText("Component library")).toBeVisible()
    await expect(canvas.getByText("AEGIS")).toBeVisible()
  },
}

export const PageHeader: Story = {
  name: "As a page header (breadcrumb + CTA)",
  render: () => (
    <Masthead>
      <MastheadContent>
        <MastheadEyebrow>
          <MastheadBrand>AEGIS</MastheadBrand>
          <MastheadBreadcrumb>FOUNDATIONS / ACTIONS / BUTTON</MastheadBreadcrumb>
        </MastheadEyebrow>
        <MastheadTitle>Button</MastheadTitle>
        <MastheadDescription>
          Triggers an action or event — submitting, confirming, opening, running.
        </MastheadDescription>
      </MastheadContent>
      <MastheadActions>
        <Button variant="ghost" size="sm">
          ← Library
        </Button>
        <Button variant="primary" size="sm">
          View spec
        </Button>
      </MastheadActions>
    </Masthead>
  ),
}
