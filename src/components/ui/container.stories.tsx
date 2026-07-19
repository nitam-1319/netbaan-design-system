import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { Container } from "@/components/ui/container"

const meta = {
  title: "Components/Container",
  component: Container,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="dark bg-background min-h-64 py-10 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Container>

export default meta
type Story = StoryObj<typeof meta>

const Panel = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-surface border-border rounded-lg border p-6 text-sm">
    {children}
  </div>
)

export const Default: Story = {
  render: () => (
    <Container size="md">
      <Panel>
        A centered, max-width container keeps content at a readable measure with
        responsive gutters.
      </Panel>
    </Container>
  ),
  play: async ({ canvasElement }) => {
    const container = canvasElement.querySelector("[data-slot='container']")
    await expect(container).toBeInTheDocument()
    await expect(container).toHaveClass("mx-auto")
  },
}

export const Prose: Story = {
  render: () => (
    <Container size="prose">
      <Panel>
        The <code>prose</code> size constrains long-form text to an optimal line
        length for comfortable reading.
      </Panel>
    </Container>
  ),
  play: async ({ canvasElement }) => {
    const container = canvasElement.querySelector("[data-slot='container']")
    await expect(container).toHaveClass("max-w-prose")
  },
}

export const NoGutter: Story = {
  render: () => (
    <Container size="lg" gutter="none">
      <Panel>Edge-to-edge content with no horizontal padding.</Panel>
    </Container>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByText(/Edge-to-edge content/)
    ).toBeVisible()
  },
}
