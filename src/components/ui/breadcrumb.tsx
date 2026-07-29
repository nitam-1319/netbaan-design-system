"use client";

import * as React from "react"
import { useRender } from "@base-ui/react/use-render"
import { ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Breadcrumbs
 *
 * A hierarchical trail showing the user's location. Semantic `<nav>` → `<ol>` →
 * `<li>` structure with an accessible label and `aria-current="page"` on the
 * final crumb. Links compose onto any element (router `Link`, `<a>`) via the
 * Base UI `render` prop, so the closed API needs no `className` hatch. The
 * separator is directional and mirrors automatically in RTL.
 * See `.agent/rules/API_RULES.md`.
 */

function Breadcrumb(
  props: Omit<React.ComponentProps<"nav">, "className" | "style">
) {
  return <nav data-slot="breadcrumb" aria-label="Breadcrumb" {...props} />
}

function BreadcrumbList(
  props: Omit<React.ComponentProps<"ol">, "className" | "style">
) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        "flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground"
      )}
      {...props}
    />
  )
}

function BreadcrumbItem(
  props: Omit<React.ComponentProps<"li">, "className" | "style">
) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("inline-flex items-center gap-1.5")}
      {...props}
    />
  )
}

function BreadcrumbLink({
  render = <a />,
  ...props
}: Omit<useRender.ComponentProps<"a">, "className" | "style">) {
  return useRender({
    render,
    props: {
      "data-slot": "breadcrumb-link",
      className: cn(
        "rounded-sm outline-none transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:ring-3 focus-visible:ring-accent-soft"
      ),
      ...props,
    },
  })
}

function BreadcrumbPage(
  props: Omit<React.ComponentProps<"span">, "className" | "style">
) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn("font-medium text-foreground")}
      {...props}
    />
  )
}

function BreadcrumbSeparator({
  children,
  ...props
}: Omit<React.ComponentProps<"li">, "className" | "style">) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn(
        "[&>svg]:size-3.5 [&>svg]:text-muted-foreground/70 [&>svg]:rtl:-scale-x-100"
      )}
      {...props}
    >
      {children ?? <ChevronRight />}
    </li>
  )
}

function BreadcrumbEllipsis(
  props: Omit<React.ComponentProps<"span">, "className" | "style">
) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn("flex size-5 items-center justify-center")}
      {...props}
    >
      <MoreHorizontal className="size-4" />
      <span className="sr-only">More</span>
    </span>
  )
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
}
