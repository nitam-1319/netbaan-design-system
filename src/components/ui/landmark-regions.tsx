"use client";

import * as React from "react"
import { useRender } from "@base-ui/react/use-render"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Landmark Regions (Accessibility, closed API)
 *
 * A set of thin semantic wrappers that give a page its ARIA landmark skeleton:
 * `Banner`, `Nav`, `Main`, `Complementary`, `ContentInfo`, `Region`, and
 * `Search`. Each renders the correct native element (so the landmark role is
 * implicit and robust) and exposes a `label` prop for the accessible name that
 * distinguishes repeated landmarks (two `Nav`s, an aside, a search region).
 *
 * These are layout-neutral on purpose — they impose no colour, spacing, or
 * flow. Put visual layout inside `Box` / `Stack` / `Grid` / `Container`; the
 * landmark only carries structure and semantics. They pair naturally with
 * `App Shell`, `Navbar`, `Sidebar`, and `Skip to Content`.
 *
 * Public API is CLOSED — no `className` / `style`. Element polymorphism stays
 * available through `render` for the rare case an element must change, but the
 * default element IS the semantics, so change it only when you also preserve
 * the role. See `.agent/rules/API_RULES.md` and `.agent/rules/ACCESSIBILITY_RULES.md`.
 */

/* --------------------------------------------------------------- helpers -- */

/** Shared base: layout-neutral, just a min-w-0 guard so a landmark inside a
 *  flex/grid parent can shrink instead of overflowing. */
const landmarkBase = "min-w-0"

type LabeledProps<T extends keyof React.JSX.IntrinsicElements> = Omit<
  useRender.ComponentProps<T>,
  "className" | "style"
> & {
  /** Accessible name (aria-label) — required when the page has more than one
   *  landmark of this type so screen-reader users can tell them apart. */
  label?: string
}

/* ------------------------------------------------------------------ Main -- */

/** The page's primary content. Exactly one per page. Renders `<main>`. */
function Main(
  props: Omit<useRender.ComponentProps<"main">, "className" | "style">
) {
  const { render = <main />, ...rest } = props
  return useRender({
    render,
    props: { "data-slot": "landmark-main", className: cn(landmarkBase), ...rest },
  })
}

/* ---------------------------------------------------------------- Banner -- */

/** Site header / masthead. Renders `<header>` (role=banner at the top level). */
function Banner(
  props: Omit<useRender.ComponentProps<"header">, "className" | "style">
) {
  const { render = <header />, ...rest } = props
  return useRender({
    render,
    props: {
      "data-slot": "landmark-banner",
      className: cn(landmarkBase),
      ...rest,
    },
  })
}

/* ------------------------------------------------------------ ContentInfo -- */

/** Site footer / metadata. Renders `<footer>` (role=contentinfo at top level). */
function ContentInfo(
  props: Omit<useRender.ComponentProps<"footer">, "className" | "style">
) {
  const { render = <footer />, ...rest } = props
  return useRender({
    render,
    props: {
      "data-slot": "landmark-contentinfo",
      className: cn(landmarkBase),
      ...rest,
    },
  })
}

/* ------------------------------------------------------------------- Nav -- */

/** A navigation region. Renders `<nav>` (role=navigation). Give a `label` when
 *  the page has more than one nav (e.g. "Primary", "Breadcrumb", "Pagination"). */
function Nav({ label, render = <nav />, ...rest }: LabeledProps<"nav">) {
  return useRender({
    render,
    props: {
      "data-slot": "landmark-nav",
      "aria-label": label,
      className: cn(landmarkBase),
      ...rest,
    },
  })
}

/* --------------------------------------------------------- Complementary -- */

/** Supporting content tangential to the main content (a sidebar of related
 *  links, filters, a widget rail). Renders `<aside>` (role=complementary). */
function Complementary({
  label,
  render = <aside />,
  ...rest
}: LabeledProps<"aside">) {
  return useRender({
    render,
    props: {
      "data-slot": "landmark-complementary",
      "aria-label": label,
      className: cn(landmarkBase),
      ...rest,
    },
  })
}

/* ---------------------------------------------------------------- Region -- */

/** A generic named landmark for a significant page area that isn't covered by a
 *  more specific role. Renders `<section>` — which only becomes a landmark when
 *  it has an accessible name, so `label` (or `aria-labelledby`) is required. */
function Region({ label, render = <section />, ...rest }: LabeledProps<"section">) {
  return useRender({
    render,
    props: {
      "data-slot": "landmark-region",
      "aria-label": label,
      className: cn(landmarkBase),
      ...rest,
    },
  })
}

/* ---------------------------------------------------------------- Search -- */

/** A search region — wrap the search field(s) and submit control. Renders the
 *  native `<search>` element (role=search). Give a `label` when there is more
 *  than one search on the page. */
function Search({ label, render = <search />, ...rest }: LabeledProps<"search">) {
  return useRender({
    render,
    props: {
      // The native <search> element (role=search) is new (2023) and still
      // unmapped by some screen readers and test tooling, so we set the role
      // explicitly to guarantee the landmark is exposed everywhere.
      role: "search",
      "data-slot": "landmark-search",
      "aria-label": label,
      className: cn(landmarkBase),
      ...rest,
    },
  })
}

export { Main, Banner, ContentInfo, Nav, Complementary, Region, Search }
