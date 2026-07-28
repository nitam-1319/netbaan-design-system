import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"
import { ChevronLeft, Menu, MoreVertical, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  MobileAppBar,
  MobileAppBarLeading,
  MobileAppBarTitle,
  MobileAppBarActions,
} from "@/components/ui/mobile-app-bar"

const meta = {
  title: "Components/Mobile App Bar",
  component: MobileAppBar,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof MobileAppBar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="w-[380px] max-w-full">
      <MobileAppBar placement="static">
        <MobileAppBarLeading>
          <Button variant="ghost" size="icon-sm" aria-label="Open menu">
            <Menu />
          </Button>
        </MobileAppBarLeading>
        <MobileAppBarTitle render={<h1 />}>Findings</MobileAppBarTitle>
        <MobileAppBarActions>
          <Button variant="ghost" size="icon-sm" aria-label="Search">
            <Search />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="More options">
            <MoreVertical />
          </Button>
        </MobileAppBarActions>
      </MobileAppBar>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole("heading", { name: "Findings" })
    ).toBeVisible()
    await expect(
      canvas.getByRole("button", { name: "Search" })
    ).toBeVisible()
  },
}

export const BackNavigation: Story = {
  render: () => (
    <div className="w-[380px] max-w-full">
      <MobileAppBar placement="static">
        <MobileAppBarLeading>
          <Button variant="ghost" size="icon-sm" aria-label="Back">
            <ChevronLeft />
          </Button>
        </MobileAppBarLeading>
        <MobileAppBarTitle render={<h1 />}>
          api-gw-prod.netbaan.io
        </MobileAppBarTitle>
        <MobileAppBarActions>
          <Button variant="ghost" size="icon-sm" aria-label="More options">
            <MoreVertical />
          </Button>
        </MobileAppBarActions>
      </MobileAppBar>
    </div>
  ),
}

export const CenteredTitle: Story = {
  render: () => (
    <div className="w-[380px] max-w-full">
      <MobileAppBar placement="static">
        <MobileAppBarLeading>
          <Button variant="ghost" size="icon-sm" aria-label="Back">
            <ChevronLeft />
          </Button>
        </MobileAppBarLeading>
        <MobileAppBarTitle render={<h1 />} align="center">
          Settings
        </MobileAppBarTitle>
        <MobileAppBarActions>
          <Button variant="ghost" size="icon-sm" aria-label="Search">
            <Search />
          </Button>
        </MobileAppBarActions>
      </MobileAppBar>
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex w-[380px] max-w-full flex-col gap-4">
      {(["sm", "default", "lg"] as const).map((size) => (
        // Each demo bar is scoped inside a labelled <section> so its <header>
        // is not a top-level banner landmark — a real screen has exactly one.
        <section key={size} aria-label={`${size} app bar`}>
          <MobileAppBar size={size} placement="static">
            <MobileAppBarLeading>
              <Button variant="ghost" size="icon-sm" aria-label="Open menu">
                <Menu />
              </Button>
            </MobileAppBarLeading>
            <MobileAppBarTitle>{size}</MobileAppBarTitle>
            <MobileAppBarActions>
              <Button variant="ghost" size="icon-sm" aria-label="Search">
                <Search />
              </Button>
            </MobileAppBarActions>
          </MobileAppBar>
        </section>
      ))}
    </div>
  ),
}
