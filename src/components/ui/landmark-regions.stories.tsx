import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import {
  Banner,
  Complementary,
  ContentInfo,
  Main,
  Nav,
  Region,
  Search,
} from "@/components/ui/landmark-regions"

const meta = {
  title: "Components/Landmark Regions",
  component: Main,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="min-h-[24rem] bg-background p-4 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Main>

export default meta
type Story = StoryObj<typeof meta>

/** A full landmark skeleton, the way you'd frame a real page. */
export const PageSkeleton: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Banner>
        <div className="rounded-lg border border-border bg-card p-3 text-sm">
          Banner (header) — logo, product name
        </div>
      </Banner>
      <Nav label="Primary">
        <div className="rounded-lg border border-border bg-card p-3 text-sm">
          Nav "Primary" — top-level links
        </div>
      </Nav>
      <div className="flex gap-3">
        <Main>
          <div className="rounded-lg border border-border bg-card p-3 text-sm">
            Main — primary content
          </div>
        </Main>
        <Complementary label="Related">
          <div className="rounded-lg border border-border bg-card p-3 text-sm">
            Complementary "Related" — aside
          </div>
        </Complementary>
      </div>
      <ContentInfo>
        <div className="rounded-lg border border-border bg-card p-3 text-sm">
          ContentInfo (footer) — © and metadata
        </div>
      </ContentInfo>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole("main")).toBeInTheDocument()
    await expect(
      canvas.getByRole("navigation", { name: "Primary" })
    ).toBeInTheDocument()
    await expect(canvas.getByRole("banner")).toBeInTheDocument()
    await expect(canvas.getByRole("contentinfo")).toBeInTheDocument()
    await expect(
      canvas.getByRole("complementary", { name: "Related" })
    ).toBeInTheDocument()
  },
}

/** A named `Region` becomes a landmark only because it has an accessible name. */
export const NamedRegion: Story = {
  render: () => (
    <Region label="Activity">
      <div className="rounded-lg border border-border bg-card p-3 text-sm">
        Region "Activity"
      </div>
    </Region>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole("region", { name: "Activity" })
    ).toBeInTheDocument()
  },
}

/** A `Search` region wrapping a field. */
export const SearchRegion: Story = {
  render: () => (
    <Search label="Site">
      <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-3 text-sm">
        <input
          type="search"
          placeholder="Search…"
          aria-label="Search the site"
          className="h-9 w-full rounded-md border border-[var(--border-strong)] bg-[var(--background)] px-2 text-sm text-[var(--foreground)] outline-none"
        />
      </div>
    </Search>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole("search", { name: "Site" })
    ).toBeInTheDocument()
  },
}
