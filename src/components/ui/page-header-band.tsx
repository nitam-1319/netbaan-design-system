"use client";

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Page Header Band
 *
 * The console's page header: kicker, title, and a counts line on an
 * accent-tinted hero surface, with the page's actions at the inline end. Two
 * heavily blurred "aurora" ellipses drift behind the content and an accent
 * spotlight tracks the pointer, so the top of every page has the same weight and
 * the same light.
 *
 *   <PageHeaderBand
 *     kicker="Attack surface"
 *     title="Domains"
 *     meta="6 of 1,284 shown · sorted by risk"
 *     actions={<><Button variant="outline">Export evidence</Button>
 *               <Button variant="primary">Add domain</Button></>}
 *   />
 *
 * This is NOT the beam. `Card variant="beam"` is a different motif: a page
 * carries at most one beam and it belongs on the primary button, never on this
 * band. The band also does not lift or change border colour on hover — only the
 * spotlight moves, because the header is a landmark, not a control.
 *
 * The aurora is decorative and is swept by the global `prefers-reduced-motion`
 * rule, which parks both ellipses on their resting frame and leaves the static
 * gradient. The spotlight is pointer-driven rather than animated, so it survives.
 *
 * Cost is two composited blurred layers per page. Do not nest the band inside
 * another blurred or `backdrop-filter` surface, and do not add more blobs.
 *
 * Public API is CLOSED — no `className` / `style`; every label is a `ReactNode`
 * so the consuming app owns translation. Colour is token-only.
 * See `.agent/rules/API_RULES.md`.
 */

type PageHeaderBandProps = {
  /** Small uppercase eyebrow above the title (e.g. "Attack surface"). */
  kicker?: React.ReactNode
  /** The page title. Rendered as the page's `<h1>`. Required. */
  title: React.ReactNode
  /** The counts / context line under the title (e.g. "6 of 1,284 shown"). */
  meta?: React.ReactNode
  /** Page actions, rendered at the inline end. Buttons, outline before primary. */
  actions?: React.ReactNode
}

function PageHeaderBand({ kicker, title, meta, actions }: PageHeaderBandProps) {
  // Pointer-tracked spotlight: write the local cursor position into --mx/--my,
  // which the background's first gradient layer reads. Behaviour only — the
  // component still exposes no style API. The -400px default parks the
  // highlight off-surface until the pointer actually arrives.
  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`)
  }

  return (
    <header
      data-slot="page-header-band"
      onPointerMove={handlePointerMove}
      className={cn(
        "relative isolate flex flex-wrap items-end justify-between gap-6 overflow-hidden",
        "rounded-xl border border-border px-7 py-[26px]",
        // Layer 1 is the spotlight, layer 2 the static diagonal tint.
        "bg-[radial-gradient(280px_circle_at_var(--mx,-400px)_var(--my,-400px),color-mix(in_srgb,var(--primary)_13%,transparent),transparent_55%),linear-gradient(135deg,color-mix(in_srgb,var(--primary)_14%,var(--card)),var(--card)_58%)]"
      )}
    >
      {/* Aurora. Anchored with logical insets so the composition mirrors in RTL. */}
      <span
        data-slot="page-header-band-aurora"
        aria-hidden
        className="pointer-events-none absolute top-[-150px] start-[8%] z-0 h-[260px] w-[400px] animate-aurora rounded-full bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--primary)_42%,transparent),transparent_70%)] blur-[44px]"
      />
      <span
        data-slot="page-header-band-aurora"
        aria-hidden
        className="pointer-events-none absolute top-[-120px] end-[10%] z-0 h-[230px] w-[340px] animate-aurora-slow rounded-full bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--accent-strong)_30%,transparent),transparent_70%)] blur-[48px]"
      />

      <div className="relative z-[1] flex min-w-0 flex-col gap-1.5">
        {kicker != null ? (
          <span
            data-slot="page-header-band-kicker"
            className="text-[11px] font-medium uppercase leading-none tracking-[0.06em] text-muted-foreground"
          >
            {kicker}
          </span>
        ) : null}
        <h1
          data-slot="page-header-band-title"
          className="font-heading text-[26px] font-semibold leading-[1.15] tracking-[-0.02em] text-foreground"
        >
          {title}
        </h1>
        {meta != null ? (
          <span data-slot="page-header-band-meta" className="text-sm text-muted-foreground">
            {meta}
          </span>
        ) : null}
      </div>

      {actions != null ? (
        <div
          data-slot="page-header-band-actions"
          className="relative z-[1] flex flex-wrap items-center gap-2.5"
        >
          {actions}
        </div>
      ) : null}
    </header>
  )
}

export { PageHeaderBand }
export type { PageHeaderBandProps }
