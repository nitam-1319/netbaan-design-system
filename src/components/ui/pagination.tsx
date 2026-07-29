"use client";

import * as React from "react"
import { useRender } from "@base-ui/react/use-render"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

/**
 * AEGIS — Pagination
 *
 * Page navigation for splitting long result sets. Semantic `<nav>` → `<ul>` →
 * `<li>` with an accessible label; the active page is marked
 * `aria-current="page"`. Controls reuse `buttonVariants` so pagination reads as
 * one family with `Button`. Links compose onto any element (router `Link`,
 * `<a>`) via the Base UI `render` prop, so the closed API needs no styling
 * hatch. Previous/Next chevrons are directional and mirror in RTL.
 * See `.agent/rules/API_RULES.md`.
 */

function Pagination(
  props: Omit<React.ComponentProps<"nav">, "className" | "style">
) {
  return (
    <nav
      data-slot="pagination"
      role="navigation"
      aria-label="pagination"
      className={cn("mx-auto flex w-full justify-center")}
      {...props}
    />
  )
}

function PaginationContent(
  props: Omit<React.ComponentProps<"ul">, "className" | "style">
) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1")}
      {...props}
    />
  )
}

function PaginationItem(
  props: Omit<React.ComponentProps<"li">, "className" | "style">
) {
  return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = Omit<
  useRender.ComponentProps<"a">,
  "className" | "style"
> & {
  isActive?: boolean
  size?: "icon" | "md"
}

function PaginationLink({
  isActive = false,
  size = "icon",
  render = <a />,
  ...props
}: PaginationLinkProps) {
  return useRender({
    render,
    props: {
      "data-slot": "pagination-link",
      "data-active": isActive || undefined,
      "aria-current": isActive ? "page" : undefined,
      className: cn(
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
          size,
        }),
        // `buttonVariants` omits inline padding/gap (Button applies it on an
        // inner content span); reproduce it here so labelled controls
        // (Previous/Next) don't collapse their text/chevron to the edges.
        size === "md" && "gap-2 px-4"
      ),
      ...props,
    },
  })
}

function PaginationPrevious({
  render = <a />,
  ...props
}: Omit<PaginationLinkProps, "isActive" | "size">) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="md"
      render={render}
      {...props}
    >
      <ChevronLeft className="rtl:-scale-x-100" />
      <span>Previous</span>
    </PaginationLink>
  )
}

function PaginationNext({
  render = <a />,
  ...props
}: Omit<PaginationLinkProps, "isActive" | "size">) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="md"
      render={render}
      {...props}
    >
      <span>Next</span>
      <ChevronRight className="rtl:-scale-x-100" />
    </PaginationLink>
  )
}

function PaginationEllipsis(
  props: Omit<React.ComponentProps<"span">, "className" | "style">
) {
  return (
    <span
      data-slot="pagination-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn("flex size-[38px] items-center justify-center")}
      {...props}
    >
      <MoreHorizontal className="size-4 text-muted-foreground" />
      <span className="sr-only">More pages</span>
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
}
