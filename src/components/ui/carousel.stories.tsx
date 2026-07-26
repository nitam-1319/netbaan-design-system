import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, waitFor, within } from "storybook/test"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselDots,
} from "@/components/ui/carousel"

const meta = {
  title: "Components/Carousel",
  component: Carousel,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
    loop: { control: "boolean" },
    autoPlay: { control: "boolean" },
    interval: { control: "number" },
  },
  args: {
    label: "Featured",
    loop: false,
    autoPlay: false,
    interval: 5000,
  },
  decorators: [
    (Story) => (
      <div className="text-foreground w-[28rem] max-w-full p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Carousel>

export default meta
type Story = StoryObj<typeof meta>

/** A plain-HTML demo slide (never an AEGIS component, so demo layout is fine). */
function Slide({ n, label }: { n: number; label: string }) {
  const hues = [
    "from-primary/30 to-primary/5",
    "from-success/30 to-success/5",
    "from-warning/30 to-warning/5",
    "from-destructive/30 to-destructive/5",
    "from-accent-strong/30 to-accent-strong/5",
  ]
  return (
    <div
      className={`flex h-44 items-center justify-center rounded-[var(--radius-lg)] border border-border bg-gradient-to-br ${hues[(n - 1) % hues.length]}`}
    >
      <span className="text-foreground text-lg font-semibold">{label}</span>
    </div>
  )
}

const SLIDES = ["Discover", "Monitor", "Remediate", "Report", "Automate"]

export const Default: Story = {
  render: (args) => (
    <Carousel {...args}>
      <CarouselContent>
        {SLIDES.map((label, i) => (
          <CarouselItem key={label}>
            <Slide n={i + 1} label={label} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="mt-4 flex items-center justify-between">
        <CarouselPrevious />
        <CarouselDots />
        <CarouselNext />
      </div>
    </Carousel>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // The region announces itself as a carousel with the given name.
    const region = canvasElement.querySelector("[data-slot=carousel]")
    await expect(region).toBeInTheDocument()
    await expect(region?.getAttribute("role")).toBe("region")
    await expect(region?.getAttribute("aria-roledescription")).toBe("carousel")
    await expect(region?.getAttribute("aria-label")).toBe("Featured")

    // Every slide is a labelled "slide" group carrying "{n} of {total}".
    const slides = canvasElement.querySelectorAll("[data-slot=carousel-item]")
    await expect(slides.length).toBe(SLIDES.length)
    await expect(slides[0]?.getAttribute("aria-roledescription")).toBe("slide")
    await expect(slides[0]?.getAttribute("aria-label")).toBe(
      `1 of ${SLIDES.length}`
    )

    // One dot per slide — the count is measured from the viewport on a rAF after
    // mount, so wait for it to settle rather than reading it synchronously.
    await waitFor(() =>
      expect(
        canvasElement.querySelectorAll("[data-slot=carousel-dot]").length
      ).toBe(SLIDES.length)
    )
    await expect(canvas.getByLabelText("Previous slide")).toBeInTheDocument()
    await expect(canvas.getByLabelText("Next slide")).toBeInTheDocument()
  },
}

export const Looping: Story = {
  args: { loop: true },
  render: (args) => (
    <Carousel {...args}>
      <CarouselContent>
        {SLIDES.map((label, i) => (
          <CarouselItem key={label}>
            <Slide n={i + 1} label={label} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="mt-4 flex items-center justify-between">
        <CarouselPrevious />
        <CarouselDots />
        <CarouselNext />
      </div>
    </Carousel>
  ),
}

export const Autoplay: Story = {
  args: { autoPlay: true, loop: true, interval: 3000 },
  render: (args) => (
    <Carousel {...args}>
      <CarouselContent>
        {SLIDES.map((label, i) => (
          <CarouselItem key={label}>
            <Slide n={i + 1} label={label} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="mt-4 flex items-center justify-between">
        <CarouselPrevious />
        <CarouselDots />
        <CarouselNext />
      </div>
    </Carousel>
  ),
}

export const DotsOnly: Story = {
  render: (args) => (
    <Carousel {...args}>
      <CarouselContent>
        {SLIDES.slice(0, 3).map((label, i) => (
          <CarouselItem key={label}>
            <Slide n={i + 1} label={label} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="mt-4 flex justify-center">
        <CarouselDots />
      </div>
    </Carousel>
  ),
}
