import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn, userEvent, screen, waitFor, within } from "storybook/test"

import { Lightbox } from "@/components/ui/lightbox"

// Inline SVG data URLs keep the stories self-contained (no network).
function swatch(label: string, from: string, to: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="640" height="420" fill="url(#g)"/><text x="50%" y="50%" fill="#fff" font-family="sans-serif" font-size="40" font-weight="700" text-anchor="middle" dominant-baseline="middle">${label}</text></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

const IMAGES = [
  { src: swatch("Asset map", "#7c53d4", "#2fb680"), alt: "Asset map overview", caption: "Full attack-surface asset map." },
  { src: swatch("Findings", "#e5484d", "#ecb22e"), alt: "Findings dashboard", caption: "Findings triaged by severity." },
  { src: swatch("Coverage", "#2fb680", "#7c53d4"), alt: "Scan coverage", caption: "Weekly scan coverage trend." },
]

const triggerButton = (text: string) => (
  <span className="border-border-strong hover:bg-muted inline-flex items-center gap-2 rounded-[var(--radius-md)] border px-4 py-2 text-sm font-medium">
    {text}
  </span>
)

/**
 * The Lightbox portals to `document.body`; the global Theme/Locale toolbar
 * drives Light/Dark and English-LTR / Persian-RTL. It is always modal — Escape
 * or the close button dismisses it; the arrows and keyboard step the set.
 */
const meta = {
  title: "Components/Lightbox",
  component: Lightbox,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    loop: { control: "boolean" },
    label: { control: "text" },
  },
  args: {
    images: IMAGES,
    loop: false,
    label: "Image viewer",
    trigger: triggerButton("Open gallery"),
  },
  decorators: [
    (Story) => (
      <div className="text-foreground p-16">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Lightbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByText("Open gallery"))

    // Portalled dialog opens with a name and the first image.
    const dialog = await screen.findByRole("dialog")
    await waitFor(() => expect(dialog).toBeVisible())
    await expect(screen.getByText("1 / 3")).toBeInTheDocument()
    await expect(screen.getByAltText("Asset map overview")).toBeInTheDocument()

    // Next advances the counter and swaps the image.
    await userEvent.click(screen.getByRole("button", { name: "Next image" }))
    await expect(screen.getByText("2 / 3")).toBeInTheDocument()
    await expect(screen.getByAltText("Findings dashboard")).toBeInTheDocument()

    // Close unmounts the surface.
    await userEvent.click(screen.getByRole("button", { name: "Close" }))
  },
}

export const Looping: Story = {
  args: { loop: true, trigger: triggerButton("Open looping gallery") },
}

export const SingleImage: Story = {
  args: { images: [IMAGES[0]], trigger: triggerButton("View image") },
}

export const OpenByDefault: Story = {
  args: {
    defaultOpen: true,
    defaultIndex: 1,
    trigger: undefined,
    onOpenChange: fn(),
    onIndexChange: fn(),
  },
}
