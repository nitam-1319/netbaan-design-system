"use client";

import * as React from "react"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Detail Sidebar (Domain / ASM)
 *
 * A detail panel docked to the inline end that **overlays** the page without
 * taking it over. It is for inspecting one row of a list while the list stays
 * live: pick a finding, read it, pick the next one without closing anything.
 *
 *   <DetailSidebar open={!!selected} onClose={clear} label="Finding detail" id="finding-detail">
 *     <DetailSidebarHeader>…</DetailSidebarHeader>
 *     <DetailSidebarBody>…</DetailSidebarBody>
 *   </DetailSidebar>
 *
 * **This is deliberately NOT a `Dialog` or a `Drawer`, and must never become
 * one.** Those are modal: they dim the page, trap focus, and mark the rest of
 * the document inert, because they demand a decision before anything else
 * happens. This panel makes the opposite promise — the table behind it stays
 * readable, scrollable and clickable while it is open. Concretely it has:
 *
 *   - no scrim and no backdrop blur — nothing dims,
 *   - no focus trap — Tab leaves the panel and reaches the page,
 *   - nothing set `inert` or `aria-hidden` behind it,
 *   - `role="complementary"`, not `role="dialog"`.
 *
 * Esc closes it, and the caller is responsible for returning focus to whatever
 * opened it (usually the row) — see `onClose`.
 *
 * It does not reflow the page: it floats above the inline end so the columns
 * underneath keep their measure. On a narrow viewport it spans the full width,
 * where overlaying is the only sensible behaviour.
 *
 * Public API is CLOSED — no `className` / `style`. See `.agent/rules/API_RULES.md`.
 */

type DetailSidebarProps = Omit<
  React.ComponentProps<"aside">,
  "className" | "style" | "role"
> & {
  /** Whether the panel is showing. Rendering is skipped entirely when closed. */
  open: boolean
  /**
   * Called on Esc and on the close button. Return focus to the control that
   * opened the panel here — the panel does not trap focus, so it cannot restore
   * it on its own.
   */
  onClose: () => void
  /** Accessible name for the region (e.g. "Finding detail"). Required. */
  label: string
  /** Panel width in px. Default `440`. Always capped at the viewport width. */
  width?: number
}

function DetailSidebar({
  open,
  onClose,
  label,
  width = 440,
  children,
  ...props
}: DetailSidebarProps) {
  React.useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    // Listen on the document, not the panel: because focus is NOT trapped, the
    // user may well be somewhere else on the page when they press Esc.
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <aside
      data-slot="detail-sidebar"
      // Complementary, not dialog: this content supports the page rather than
      // interrupting it, and assistive tech should be able to leave it freely.
      role="complementary"
      aria-label={label}
      className={cn(
        "fixed inset-y-0 end-0 z-40 w-[min(var(--panel-w),100%)]",
        "flex flex-col overflow-y-auto overscroll-contain",
        "border-s border-border bg-card shadow-elevation-4",
        "animate-panel-in"
      )}
      style={{ "--panel-w": `${width}px` } as React.CSSProperties}
      {...props}
    >
      {children}
    </aside>
  )
}

type DetailSidebarHeaderProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style"
> & {
  /** Fires the panel's close affordance. */
  onClose: () => void
  /** Accessible name for the close button (e.g. "Close detail"). Required. */
  closeLabel: string
}

function DetailSidebarHeader({
  onClose,
  closeLabel,
  children,
  ...props
}: DetailSidebarHeaderProps) {
  return (
    <div
      data-slot="detail-sidebar-header"
      className={cn(
        "sticky top-0 z-[1] flex items-start justify-between gap-3",
        "border-b border-border bg-surface px-5 pt-4 pb-3.5"
      )}
      {...props}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-2.5">{children}</div>
      <button
        type="button"
        data-slot="detail-sidebar-close"
        onClick={onClose}
        aria-label={closeLabel}
        className={cn(
          "inline-flex size-7 shrink-0 items-center justify-center rounded-lg",
          "border border-border bg-surface-2 text-muted-foreground",
          "transition-colors duration-[180ms] ease-out hover:text-foreground",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        )}
      >
        <X aria-hidden className="size-3.5" />
      </button>
    </div>
  )
}

function DetailSidebarBody({
  ...props
}: Omit<React.ComponentProps<"div">, "className" | "style">) {
  return (
    <div
      data-slot="detail-sidebar-body"
      className="flex flex-col gap-[22px] px-5 pt-[18px] pb-8"
      {...props}
    />
  )
}

/**
 * One labelled block inside the body.
 *
 * A section is only worth rendering when it has content — omit it entirely
 * rather than printing a heading over an empty space or a "null".
 */
type DetailSidebarSectionProps = Omit<
  React.ComponentProps<"section">,
  "className" | "style"
> & {
  /** Small uppercase heading (e.g. "Remediation"). */
  label?: React.ReactNode
}

function DetailSidebarSection({
  label,
  children,
  ...props
}: DetailSidebarSectionProps) {
  return (
    <section
      data-slot="detail-sidebar-section"
      className="flex flex-col gap-1.5"
      {...props}
    >
      {label != null && (
        <span
          data-slot="detail-sidebar-section-label"
          className="text-[9.5px] leading-snug font-semibold tracking-[0.08em] text-muted-foreground uppercase"
        >
          {label}
        </span>
      )}
      {children}
    </section>
  )
}

export {
  DetailSidebar,
  DetailSidebarHeader,
  DetailSidebarBody,
  DetailSidebarSection,
}
export type {
  DetailSidebarProps,
  DetailSidebarHeaderProps,
  DetailSidebarSectionProps,
}
