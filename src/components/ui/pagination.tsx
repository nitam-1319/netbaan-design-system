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

type PaginationProps = Omit<React.ComponentProps<"nav">, "className" | "style"> & {
  /**
   * `full` (default) centres the pager in its own full-width row.
   * `inline` lets it sit as one item in a footer that also carries a count or
   * a page readout, which `w-full` made impossible without a wrapper.
   */
  width?: "full" | "inline"
}

function Pagination({ width = "full", ...props }: PaginationProps) {
  return (
    <nav
      data-slot="pagination"
      role="navigation"
      aria-label="pagination"
      className={cn(
        "flex",
        width === "full" ? "mx-auto w-full justify-center" : "w-auto justify-start"
      )}
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
  size?: "icon" | "sm" | "md"
  /**
   * Appearance, independent of `isActive`.
   *
   * `isActive` used to be the only route to an outlined control, which forced a
   * Previous/Next button to claim `aria-current="page"` to look right — telling
   * assistive tech that a directional control is the current page. Setting
   * `variant` overrides the active-derived default without touching the
   * semantics.
   */
  variant?: "ghost" | "outline"
}

function PaginationLink({
  isActive = false,
  size = "icon",
  variant,
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
          variant: variant ?? (isActive ? "outline" : "ghost"),
          size: size === "sm" ? "sm" : size,
        }),
        // `buttonVariants` omits inline padding/gap (Button applies it on an
        // inner content span); reproduce it here so labelled controls
        // (Previous/Next) don't collapse their text/chevron to the edges.
        size === "md" && "gap-2 px-4",
        size === "sm" && "gap-1.5 px-2.5"
      ),
      ...props,
    },
  })
}

type PaginationDirectionProps = Omit<PaginationLinkProps, "isActive"> & {
  /**
   * The visible word beside the chevron. Defaults to English.
   *
   * The label used to be a literal inside the component and `children` was not
   * forwarded, so a translated app had no way to use these two controls at all
   * — a Persian footer showed "Previous" and "Next" in the middle of otherwise
   * translated copy, and pagers were re-implemented from `PaginationLink` to
   * avoid it. Pass `children` for the text and `aria-label` for the accessible
   * name; both still have working English defaults.
   */
  children?: React.ReactNode
}

function PaginationPrevious({
  render = <a />,
  size = "md",
  children,
  ...props
}: PaginationDirectionProps) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size={size}
      render={render}
      {...props}
    >
      <ChevronLeft className="rtl:-scale-x-100" />
      <span>{children ?? "Previous"}</span>
    </PaginationLink>
  )
}

function PaginationNext({
  render = <a />,
  size = "md",
  children,
  ...props
}: PaginationDirectionProps) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size={size}
      render={render}
      {...props}
    >
      <span>{children ?? "Next"}</span>
      <ChevronRight className="rtl:-scale-x-100" />
    </PaginationLink>
  )
}

type PaginationEllipsisProps = Omit<
  React.ComponentProps<"span">,
  "className" | "style" | "children"
> & {
  /** Screen-reader text for the gap. Defaults to English. */
  label?: string
}

function PaginationEllipsis({ label = "More pages", ...props }: PaginationEllipsisProps) {
  return (
    <span
      data-slot="pagination-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn("flex size-[38px] items-center justify-center")}
      {...props}
    >
      <MoreHorizontal className="size-4 text-muted-foreground" />
      <span className="sr-only">{label}</span>
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
