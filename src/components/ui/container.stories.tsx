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
      <div className="min-h-64 py-10 text-foreground">
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

const SIZES = ["sm", "md", "lg", "xl", "2xl", "prose", "full"] as const

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {SIZES.map((size) => (
        <Container key={size} size={size}>
          <Panel>
            <code>size=&quot;{size}&quot;</code>
          </Panel>
        </Container>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const containers = canvasElement.querySelectorAll(
      "[data-slot='container']"
    )
    await expect(containers).toHaveLength(SIZES.length)
    await expect(containers[0]).toHaveClass("max-w-screen-sm")
    await expect(containers[5]).toHaveClass("max-w-prose")
    await expect(containers[6]).toHaveClass("max-w-full")
  },
}

const GUTTERS = ["none", "sm", "md", "lg"] as const

export const Gutters: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {GUTTERS.map((gutter) => (
        <Container key={gutter} size="md" gutter={gutter}>
          <Panel>
            <code>gutter=&quot;{gutter}&quot;</code>
          </Panel>
        </Container>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const containers = canvasElement.querySelectorAll(
      "[data-slot='container']"
    )
    await expect(containers).toHaveLength(GUTTERS.length)
    await expect(containers[0]).toHaveClass("px-0")
    await expect(containers[3]).toHaveClass("px-8")
  },
}

export const AsLandmark: Story = {
  render: () => (
    <Container size="lg" render={<main aria-label="Main content" />}>
      <Panel>
        Rendered as a <code>&lt;main&gt;</code> landmark via the{" "}
        <code>render</code> prop for assistive-tech navigation.
      </Panel>
    </Container>
  ),
  play: async ({ canvasElement }) => {
    const main = canvasElement.querySelector("main[data-slot='container']")
    await expect(main).toBeInTheDocument()
    await expect(main).toHaveClass("max-w-screen-lg")
  },
}
