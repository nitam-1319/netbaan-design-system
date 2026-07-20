import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "@/components/ui/breadcrumb"

const meta = {
  title: "Components/Breadcrumb",
  component: Breadcrumb,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="p-10 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Breadcrumb>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink render={<a href="#dashboard" />}>
            Dashboard
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink render={<a href="#assets" />}>Assets</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>api.netbaan.io</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const nav = canvas.getByRole("navigation", { name: "Breadcrumb" })
    await expect(nav).toBeInTheDocument()
    // The final crumb marks the current page.
    const current = canvas.getByText("api.netbaan.io")
    await expect(current).toHaveAttribute("aria-current", "page")
    // Ancestor links are real anchors.
    await expect(
      canvas.getByRole("link", { name: "Assets" })
    ).toHaveAttribute("href", "#assets")
  },
}

export const WithCollapse: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink render={<a href="#root" />}>Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbEllipsis />
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink render={<a href="#assets" />}>Assets</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Certificate</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
}

export const TwoLevel: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink render={<a href="#findings" />}>
            Findings
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>CVE-2025-0042</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
}
