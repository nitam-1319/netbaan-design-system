"use client";

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Masthead (page-header, closed API)
 *
 * The signature page header used on every reference page: a rotating
 * conic-gradient **beam** sweeps around the border (`beamSpin` 6.5s) behind a
 * `--card` panel inset 1.5px, carrying an eyebrow (brand chip + breadcrumb), a
 * display title, a description, and an actions slot. This is the "header with a
 * light beam moving across it" from the reference masthead — the same beam motif
 * as `Card variant="beam"` / the Primary button, promoted to a first-class
 * page-level header.
 *
 * Composed of slot parts so any page can assemble its own header:
 *   Masthead · MastheadContent · MastheadEyebrow · MastheadBrand ·
 *   MastheadBreadcrumb · MastheadTitle · MastheadDescription · MastheadActions
 *
 * Public API is CLOSED — no `className` / `style`; tokens only.
 */

function Masthead({
  children,
  ...props
}: Omit<React.ComponentProps<"header">, "className" | "style">) {
  return (
    <header
      data-slot="masthead"
      className="relative isolate overflow-hidden rounded-[20px] bg-border-strong shadow-elevated"
      {...props}
    >
      {/* Signature beam: rotating conic-gradient arc revealed as a 1.5px frame. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
      >
        <span className="absolute top-1/2 left-1/2 aspect-square w-[140%] -translate-x-1/2 -translate-y-1/2 animate-beam-spin bg-[conic-gradient(from_0deg,transparent_0_74%,var(--primary)_85%,var(--accent-strong)_92%,transparent_100%)]" />
      </span>
      <div className="relative z-[1] m-[1.5px] flex flex-wrap items-start justify-between gap-6 rounded-[18.5px] bg-card px-8 py-7">
        {children}
      </div>
    </header>
  )
}

/** Left column — eyebrow + title + description. */
function MastheadContent(
  props: Omit<React.ComponentProps<"div">, "className" | "style">
) {
  return (
    <div
      data-slot="masthead-content"
      className={cn("flex min-w-0 flex-col leading-tight")}
      {...props}
    />
  )
}

/** Row above the title — pair a MastheadBrand chip with a MastheadBreadcrumb. */
function MastheadEyebrow(
  props: Omit<React.ComponentProps<"div">, "className" | "style">
) {
  return (
    <div
      data-slot="masthead-eyebrow"
      className={cn("mb-3 flex flex-wrap items-center gap-2.5")}
      {...props}
    />
  )
}

/** The AEGIS brand chip (accent fill, mono caps). */
function MastheadBrand(
  props: Omit<React.ComponentProps<"span">, "className" | "style">
) {
  return (
    <span
      data-slot="masthead-brand"
      className={cn(
        "inline-flex items-center rounded-md bg-primary-solid px-2.5 py-1 font-mono text-[10px] font-semibold tracking-[0.08em] text-white uppercase"
      )}
      {...props}
    />
  )
}

/** Muted mono breadcrumb path (use ` / ` separators). */
function MastheadBreadcrumb(
  props: Omit<React.ComponentProps<"span">, "className" | "style">
) {
  return (
    <span
      data-slot="masthead-breadcrumb"
      className={cn(
        "font-mono text-[11px] font-medium tracking-[0.03em] text-text-faint"
      )}
      {...props}
    />
  )
}

/** Display title — Space Grotesk, 40px. */
function MastheadTitle(
  props: Omit<React.ComponentProps<"h1">, "className" | "style">
) {
  return (
    <h1
      data-slot="masthead-title"
      className={cn(
        "font-heading text-[clamp(1.75rem,1.2rem+2vw,2.5rem)] leading-[1.15] font-bold tracking-tight text-foreground text-balance"
      )}
      {...props}
    />
  )
}

/** Supporting copy under the title. */
function MastheadDescription(
  props: Omit<React.ComponentProps<"p">, "className" | "style">
) {
  return (
    <p
      data-slot="masthead-description"
      className={cn(
        "mt-3 max-w-[640px] text-sm leading-relaxed text-muted-foreground text-pretty"
      )}
      {...props}
    />
  )
}

/** Right-aligned actions (theme toggle, primary CTA…). */
function MastheadActions(
  props: Omit<React.ComponentProps<"div">, "className" | "style">
) {
  return (
    <div
      data-slot="masthead-actions"
      className={cn("flex flex-none flex-wrap items-center gap-2.5")}
      {...props}
    />
  )
}

export {
  Masthead,
  MastheadContent,
  MastheadEyebrow,
  MastheadBrand,
  MastheadBreadcrumb,
  MastheadTitle,
  MastheadDescription,
  MastheadActions,
}
