import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination"

const meta = {
  title: "Components/Pagination",
  component: Pagination,
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
} satisfies Meta<typeof Pagination>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious render={<a href="#prev" />} />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink render={<a href="#1" />}>1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink render={<a href="#2" />} isActive>
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink render={<a href="#3" />}>3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink render={<a href="#12" />}>12</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext render={<a href="#next" />} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const nav = canvas.getByRole("navigation", { name: "pagination" })
    await expect(nav).toBeInTheDocument()
    // The active page is marked current.
    const active = canvas.getByRole("link", { name: "2" })
    await expect(active).toHaveAttribute("aria-current", "page")
    await expect(canvas.getByRole("link", { name: "1" })).not.toHaveAttribute(
      "aria-current"
    )
  },
}

export const Controlled: Story = {
  render: () => {
    const total = 5
    const [page, setPage] = React.useState(1)
    return (
      <div className="flex flex-col items-center gap-3">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                render={<button type="button" />}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              />
            </PaginationItem>
            {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
              <PaginationItem key={n}>
                <PaginationLink
                  render={<button type="button" />}
                  isActive={n === page}
                  onClick={() => setPage(n)}
                >
                  {n}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                render={<button type="button" />}
                onClick={() => setPage((p) => Math.min(total, p + 1))}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
        <p className="text-sm text-muted-foreground">Page {page} of {total}</p>
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("Page 1 of 5")).toBeInTheDocument()
    await userEvent.click(canvas.getByRole("button", { name: "Go to next page" }))
    await expect(canvas.getByText("Page 2 of 5")).toBeInTheDocument()
    await userEvent.click(canvas.getByRole("button", { name: "3" }))
    await expect(canvas.getByText("Page 3 of 5")).toBeInTheDocument()
  },
}

export const Simple: Story = {
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious render={<a href="#prev" />} />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext render={<a href="#next" />} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
}
