"use client";

import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"
import { cva } from "class-variance-authority"
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { StatusPill } from "@/components/ui/status-pill"

/**
 * AEGIS — Scan Switcher
 *
 * The control that makes "which scan am I looking at?" answerable on an asset
 * detail page. It ships as three parts that share one vocabulary and one
 * selection:
 *
 *   ScanSwitcher          the compact control beside the tabs
 *   ScanHistoryList       the same selection in list form, inside a card
 *   HistoricalScanBanner  the strip that admits the page is not showing "now"
 *
 *   <ScanSwitcher label="Showing scan" options={scans} value={id}
 *                 onValueChange={setId} listLabel="Scan history"
 *                 latestLabel="Latest" historicalLabel="Historical"
 *                 olderLabel="Older scan" newerLabel="Newer scan" />
 *
 * This exists because a detail page that quietly re-reads itself from a past scan
 * is a page that lies. The reported defect was exactly that: the figures changed
 * and nothing said so. So the selection is stated three times over — in the
 * trigger, as a `VIEWING` marker on the chosen history row, and in the banner —
 * and the three cannot disagree, because they are one controlled value.
 *
 * Options are ordered NEWEST FIRST, which is how a scan list reads. The arrows
 * therefore run against the index: "older" steps forward through the array,
 * "newer" steps back. They are separate buttons rather than a spinner because
 * stepping one scan at a time is the common move and opening a menu to do it is
 * three interactions instead of one.
 *
 * Keyboard behaviour, dismissal, roving focus, typeahead and focus return come
 * from the Base UI Select primitive: the trigger is a `combobox` with
 * `aria-haspopup="listbox"`, the popup is a `listbox`, and each row is an
 * `option` carrying `aria-selected`. The history list is a plain button list with
 * `aria-current` instead — it is content a reader scrolls, not a menu.
 *
 * The `VIEWING` marker reserves its slot with `visibility`, never `display`, so
 * moving the selection between rows does not shift the column widths under the
 * pointer.
 *
 * Public API is CLOSED — no `className` / `style`. Every label is a `ReactNode`
 * or `string` the consuming app translates and formats; the component never
 * formats a date or names a scan status itself. Colour is token-only.
 * See `.agent/rules/API_RULES.md`.
 */

/**
 * Semantic tone for a scan's dot and pill. The app maps its own status vocabulary
 * onto these, exactly as it does for `StatusPill` — the design system does not
 * hard-code a scanner's state machine.
 */
type ScanTone = "success" | "info" | "warning" | "danger" | "neutral"

const dotVariants = cva("shrink-0 rounded-full", {
  variants: {
    tone: {
      success: "bg-success",
      info: "bg-primary",
      warning: "bg-warning",
      danger: "bg-destructive",
      neutral: "bg-muted-foreground",
    },
    size: {
      trigger: "size-[7px]",
      row: "size-2 justify-self-center",
    },
  },
  defaultVariants: { tone: "neutral", size: "row" },
})

/** 32 × 34 stepper buttons flanking the trigger. */
const stepperClasses = cn(
  "inline-flex h-[34px] w-8 shrink-0 items-center justify-center rounded-[9px]",
  "border border-border bg-surface text-muted-foreground",
  "transition-colors hover:bg-accent-soft hover:text-foreground",
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
  "disabled:pointer-events-none disabled:opacity-40"
)

type ScanOption = {
  /** Stable scan id. This is the switcher's value. Required. */
  id: string
  /** The scan's date, already formatted and localised by the app. Required. */
  date: React.ReactNode
  /** One-line note under the date (e.g. "Timed out at enumeration"). */
  note?: React.ReactNode
  /** Status word for the row (e.g. "Completed"). Required. */
  statusLabel: React.ReactNode
  /** Semantic tone for the dot and the pill. Default `"neutral"`. */
  tone?: ScanTone
  /** Marks the newest scan — drives the Latest / Historical badge. */
  isLatest?: boolean
}

type ScanSwitcherProps = {
  /** Uppercase lead-in (e.g. "Showing scan"). Required. */
  label: React.ReactNode
  /** Every scan, NEWEST FIRST. Required. */
  options: ScanOption[]
  /** Selected scan id. Controlled. Required. */
  value: string
  /** Called with the newly selected scan id. Required. */
  onValueChange: (id: string) => void
  /** Accessible name for the listbox (e.g. "Scan history"). Required. */
  listLabel: string
  /** Badge on the trigger when the newest scan is selected (e.g. "Latest"). */
  latestLabel: React.ReactNode
  /** Badge on the trigger otherwise (e.g. "Historical"). */
  historicalLabel: React.ReactNode
  /** Accessible name for the step-older button. Required. */
  olderLabel: string
  /** Accessible name for the step-newer button. Required. */
  newerLabel: string
}

function ScanSwitcher({
  label,
  options,
  value,
  onValueChange,
  listLabel,
  latestLabel,
  historicalLabel,
  olderLabel,
  newerLabel,
}: ScanSwitcherProps) {
  const index = options.findIndex((option) => option.id === value)
  const selected = index >= 0 ? options[index] : options[0]
  // Newest first, so "older" walks forward through the array and "newer" back.
  const older = index >= 0 && index < options.length - 1 ? options[index + 1] : null
  const newer = index > 0 ? options[index - 1] : null

  if (selected == null) return null

  return (
    <div data-slot="scan-switcher" className="flex items-center gap-1.5">
      <span
        data-slot="scan-switcher-label"
        className="me-1 text-[10px] font-medium uppercase leading-none tracking-[0.06em] text-muted-foreground"
      >
        {label}
      </span>

      <button
        type="button"
        data-slot="scan-switcher-older"
        aria-label={olderLabel}
        disabled={older == null}
        onClick={() => older != null && onValueChange(older.id)}
        className={stepperClasses}
      >
        <ChevronLeft aria-hidden className="size-3.5 rtl:rotate-180" strokeWidth={2.5} />
      </button>

      <SelectPrimitive.Root
        items={options.map((option) => option.id)}
        value={value}
        onValueChange={(next) => onValueChange(String(next))}
      >
        <SelectPrimitive.Trigger
          data-slot="scan-switcher-trigger"
          className={cn(
            "inline-flex h-[34px] items-center gap-[9px] rounded-[10px] px-3",
            "border border-border bg-surface text-foreground",
            "transition-colors hover:bg-accent-soft",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
            "[&[data-popup-open]_[data-slot=scan-switcher-chevron]]:rotate-180"
          )}
        >
          <span aria-hidden className={cn(dotVariants({ tone: selected.tone, size: "trigger" }))} />
          <span className="font-mono text-xs font-semibold leading-none tabular-nums">
            {selected.date}
          </span>
          <span className="text-[10.5px] font-medium leading-none text-muted-foreground">
            {selected.isLatest ? latestLabel : historicalLabel}
          </span>
          <ChevronDown
            data-slot="scan-switcher-chevron"
            aria-hidden
            className="size-[13px] text-muted-foreground transition-transform"
            strokeWidth={2.5}
          />
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Positioner
            data-slot="scan-switcher-positioner"
            sideOffset={6}
            align="end"
            alignItemWithTrigger={false}
            className="z-50"
          >
            <SelectPrimitive.Popup
              data-slot="scan-switcher-popup"
              aria-label={listLabel}
              className={cn(
                "max-h-[300px] w-[300px] overflow-auto overscroll-contain p-[5px] outline-none",
                "rounded-xl border border-border bg-card shadow-elevation-4",
                "origin-[var(--transform-origin)] animate-menu-in"
              )}
            >
              {options.map((option) => (
                <SelectPrimitive.Item
                  key={option.id}
                  value={option.id}
                  data-slot="scan-switcher-option"
                  className={cn(
                    "relative grid w-full cursor-default grid-cols-[14px_minmax(0,1fr)_auto] items-center gap-2.5",
                    "rounded-[9px] px-2.5 py-[9px] text-start text-foreground outline-none",
                    "data-[highlighted]:bg-accent-soft",
                    // The rail is a pseudo-element rather than an inset shadow so
                    // it sits on the inline start and mirrors under RTL.
                    "data-[selected]:bg-accent-soft",
                    "data-[selected]:before:absolute data-[selected]:before:inset-y-0 data-[selected]:before:start-0 data-[selected]:before:w-0.5 data-[selected]:before:rounded-s-[9px] data-[selected]:before:bg-primary"
                  )}
                >
                  <span aria-hidden className={cn(dotVariants({ tone: option.tone }))} />
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <SelectPrimitive.ItemText className="font-mono text-xs font-medium leading-[1.4] tabular-nums">
                      {option.date}
                    </SelectPrimitive.ItemText>
                    {option.note != null ? (
                      <span className="truncate text-[10px] font-medium leading-[1.4] text-muted-foreground">
                        {option.note}
                      </span>
                    ) : null}
                  </span>
                  <span className="text-[10.5px] font-medium leading-[1.4] text-muted-foreground">
                    {option.statusLabel}
                  </span>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Popup>
          </SelectPrimitive.Positioner>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>

      <button
        type="button"
        data-slot="scan-switcher-newer"
        aria-label={newerLabel}
        disabled={newer == null}
        onClick={() => newer != null && onValueChange(newer.id)}
        className={stepperClasses}
      >
        <ChevronRight aria-hidden className="size-3.5 rtl:rotate-180" strokeWidth={2.5} />
      </button>
    </div>
  )
}

/* ------------------------------------------------------- history list -- */

type ScanHistoryListProps = {
  /** Every scan, NEWEST FIRST. Required. */
  options: ScanOption[]
  /** Selected scan id. Controlled. Required. */
  value: string
  /** Called with the newly selected scan id. Required. */
  onValueChange: (id: string) => void
  /** Marker on the selected row (e.g. "Viewing"). Required. */
  viewingLabel: React.ReactNode
  /** Accessible name for a row, given its formatted date. Required. */
  rowLabel: (option: ScanOption) => string
}

/**
 * The scan history card's body: the switcher's selection as a scrollable list of
 * rows. Capped so a forty-scan asset scrolls inside the card rather than
 * stretching the page past its neighbours.
 */
function ScanHistoryList({
  options,
  value,
  onValueChange,
  viewingLabel,
  rowLabel,
}: ScanHistoryListProps) {
  return (
    <div
      data-slot="scan-history-list"
      // Divided rather than a top border per row: the enclosing flush `Card`
      // already rules a hairline under its header, and two adjacent 1px borders
      // read as a 2px seam.
      className="max-h-[268px] divide-y divide-border overflow-auto overscroll-contain"
    >
      {options.map((option) => {
        const current = option.id === value
        return (
          <button
            key={option.id}
            type="button"
            data-slot="scan-history-row"
            aria-current={current || undefined}
            aria-label={rowLabel(option)}
            onClick={() => onValueChange(option.id)}
            className={cn(
              "relative grid w-full grid-cols-[14px_minmax(0,1fr)_auto_auto] items-center gap-3",
              // px-6 is the card inset, so rows line up with the header above them.
              "px-6 py-[11px] text-start text-foreground",
              "transition-colors hover:bg-accent-soft",
              "focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
              // The rail is a pseudo-element rather than an inset shadow so it
              // sits on the inline start and mirrors under RTL.
              current &&
                "bg-accent-soft before:absolute before:inset-y-0 before:start-0 before:w-0.5 before:bg-primary"
            )}
          >
            <span aria-hidden className={cn(dotVariants({ tone: option.tone }))} />
            <span className="flex min-w-0 items-baseline gap-2">
              <span className="font-mono text-xs font-medium leading-[1.5] tabular-nums">
                {option.date}
              </span>
              {option.note != null ? (
                <span className="truncate text-[10.5px] font-medium leading-[1.5] text-muted-foreground">
                  {option.note}
                </span>
              ) : null}
            </span>
            {/* The slot is always reserved — `visibility`, never `display` — so
                moving the selection does not shift the row's other columns. */}
            <span
              data-slot="scan-history-viewing"
              aria-hidden
              className={cn(
                "text-[10px] font-medium uppercase leading-[1.4] tracking-[0.05em] text-primary",
                !current && "invisible"
              )}
            >
              {viewingLabel}
            </span>
            <StatusPill tone={option.tone ?? "neutral"} size="sm">
              {option.statusLabel}
            </StatusPill>
          </button>
        )
      })}
    </div>
  )
}

/* ---------------------------------------------------- historical banner -- */

type HistoricalScanBannerProps = {
  /** The admission itself — which scan the figures below come from. Required. */
  children: React.ReactNode
  /** The way back, rendered at the inline end (e.g. a "Back to latest" button). */
  action?: React.ReactNode
}

/**
 * The strip that appears whenever the page is NOT showing the latest scan. It is
 * a live region, so the change is announced and not only drawn: a reader who
 * steps back a scan with the arrows learns that every figure moved with them.
 *
 * `--sev-high` at a low mix, not `--destructive`: a historical view is a caveat,
 * not a failure.
 */
function HistoricalScanBanner({ children, action }: HistoricalScanBannerProps) {
  return (
    <div
      data-slot="historical-scan-banner"
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-wrap items-center justify-between gap-4 rounded-xl px-4 py-[11px]",
        "border border-[color-mix(in_oklch,var(--sev-high),transparent_76%)]",
        "bg-[color-mix(in_oklch,var(--sev-high),transparent_88%)]",
        "text-xs font-medium leading-[1.5] text-foreground"
      )}
    >
      <span data-slot="historical-scan-banner-text" className="min-w-0">
        {children}
      </span>
      {action}
    </div>
  )
}

export { ScanSwitcher, ScanHistoryList, HistoricalScanBanner, dotVariants as scanDotVariants }
export type {
  ScanSwitcherProps,
  ScanHistoryListProps,
  HistoricalScanBannerProps,
  ScanOption,
  ScanTone,
}
