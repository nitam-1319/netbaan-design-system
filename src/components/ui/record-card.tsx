"use client";

import * as React from "react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { VisuallyHidden } from "@/components/ui/visually-hidden"

/**
 * AEGIS — Record Card (Domain / ASM)
 *
 * One harvested record — a leaked credential row, a scraped identity, a parsed
 * log entry — drawn as a card that is **collapsed by default** and opens to its
 * fields on demand. A page of these is a page of headers, not a wall of text.
 *
 *   <RecordCard>
 *     <RecordCardHeader
 *       index="#3" title="m.tabrizi@acme-corp.com"
 *       badges={<Badge tone="critical">4 months ago</Badge>}
 *       source="Collection#2" meta="10 fields · credentials"
 *       actions={<CopyButton value={text} />}
 *     />
 *     <RecordCardFields>
 *       <RecordCardField label="Email">m.tabrizi@acme-corp.com</RecordCardField>
 *       <RecordCardField label="Password" secret masked={!revealed}
 *                        maskedLabel="Hidden — reveal to view"
 *                        hint="Weak" hintTone="critical">Summer2024!</RecordCardField>
 *     </RecordCardFields>
 *     <RecordCardFooter>First seen 2025/04/22</RecordCardFooter>
 *   </RecordCard>
 *
 * Two decisions the card makes for you, both of them the reason it exists:
 *
 * 1. **The header is a `role="button"` `<div>`, not a `<button>`.** It carries
 *    the record's own controls (reveal, copy), and a button inside a button is
 *    invalid HTML that browsers silently unnest. Because of that it wires its own
 *    Enter/Space handler — `preventDefault()` on Space so the page does not
 *    scroll — without which a page of collapsed cards is unreachable by keyboard.
 *    Controls passed to `actions` must stop propagation so pressing one does not
 *    also toggle the card.
 *
 * 2. **A masked field's value never reaches the DOM.** `masked` renders a dot
 *    placeholder in place of the children, so a screen reader, a text copy and a
 *    page snapshot all see the same thing the eye does. Masking by colour or by
 *    a CSS overlay is not masking. Pass `maskedLabel` so assistive tech is told
 *    the field is hidden rather than empty.
 *
 * Fields stack one per row against a fixed label column, so the labels form a
 * single scan line no matter how unequal the values are. Render only the fields
 * a record actually carries: an "Address —" row asserts an absent value was
 * checked for.
 *
 * Public API is CLOSED — no `className` / `style`; every label is a `ReactNode`
 * so the consuming app owns translation. Colour is token-only.
 * See `.agent/rules/API_RULES.md`.
 */

type RecordCardTone =
  | "neutral"
  | "accent"
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "low"
  | "medium"
  | "high"
  | "critical"

/* ------------------------------------------------------------------ Root -- */

interface RecordCardContextValue {
  open: boolean
  toggle: () => void
  panelId: string
  headerId: string
}

const RecordCardContext = React.createContext<RecordCardContextValue | null>(null)

function useRecordCard(part: string): RecordCardContextValue {
  const ctx = React.useContext(RecordCardContext)
  if (!ctx) throw new Error(`${part} must be rendered inside a <RecordCard>.`)
  return ctx
}

type RecordCardProps = Omit<React.ComponentProps<"div">, "className" | "style"> & {
  /** Controlled open state. Omit to let the card own it. */
  open?: boolean
  /** Initial open state when uncontrolled. Default `false` — collapsed is the default. */
  defaultOpen?: boolean
  /** Fired with the next open state whenever the header toggles. */
  onOpenChange?: (open: boolean) => void
}

function RecordCard({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  children,
  ...props
}: RecordCardProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen)
  const open = openProp ?? uncontrolled
  const reactId = React.useId()

  const toggle = React.useCallback(() => {
    const next = !open
    if (openProp === undefined) setUncontrolled(next)
    onOpenChange?.(next)
  }, [open, openProp, onOpenChange])

  const ctx = React.useMemo<RecordCardContextValue>(
    () => ({
      open,
      toggle,
      panelId: `${reactId}-panel`,
      headerId: `${reactId}-header`,
    }),
    [open, toggle, reactId]
  )

  return (
    <RecordCardContext.Provider value={ctx}>
      <div
        data-slot="record-card"
        data-open={open || undefined}
        className="focus-escape rounded-xl border border-border bg-card shadow-elevation-1"
        {...props}
      >
        {children}
      </div>
    </RecordCardContext.Provider>
  )
}

/* ---------------------------------------------------------------- Header -- */

type RecordCardHeaderProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style" | "children"
> & {
  /** The record's position in the result set (e.g. "#11"). Mono, muted. */
  index?: React.ReactNode
  /** What identifies this record — an email, a username, a fallback label. */
  title: React.ReactNode
  /** Status chips beside the title (age, severity). Pass `Badge`s. */
  badges?: React.ReactNode
  /** Where the record came from (a database or dump name). Mono, muted. */
  source?: React.ReactNode
  /** What is inside, without opening it (e.g. "10 fields · credentials"). */
  meta?: React.ReactNode
  /** Per-record controls. Each must `stopPropagation` so it does not toggle the card. */
  actions?: React.ReactNode
}

function RecordCardHeader({
  index,
  title,
  badges,
  source,
  meta,
  actions,
  onClick,
  onKeyDown,
  ...props
}: RecordCardHeaderProps) {
  const { open, toggle, panelId, headerId } = useRecordCard("RecordCardHeader")

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    onClick?.(e)
    if (e.defaultPrevented) return
    toggle()
  }

  // A role="button" div gets none of a real button's keyboard behaviour for
  // free. Space must be preventDefault-ed or the page scrolls under the reader.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e)
    if (e.defaultPrevented) return
    if (e.key !== "Enter" && e.key !== " " && e.key !== "Spacebar") return
    e.preventDefault()
    toggle()
  }

  return (
    <div
      data-slot="record-card-header"
      id={headerId}
      role="button"
      tabIndex={0}
      aria-expanded={open}
      aria-controls={panelId}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "grid cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3.5 gap-y-2.5",
        "bg-surface px-[18px] py-[13px]",
        "transition-colors motion-enter motion-reduce:transition-none",
        "hover:bg-accent-soft",
        "focus-visible:focus-accent"
      )}
      {...props}
    >
      <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1.5">
        <span
          aria-hidden
          data-slot="record-card-caret"
          className={cn(
            "inline-flex text-muted-foreground",
            "transition-transform motion-enter motion-reduce:transition-none",
            // One rotation, never a rotation composed with a mirror. Tailwind v4
            // writes `rotate` and `scale` as SEPARATE transform properties and
            // CSS composes them translate → rotate → scale, so `rtl:-scale-x-100`
            // plus `rotate-90` mirrored the already-rotated caret and pointed it
            // UP in Persian whenever the card was open. `rtl:rotate-180` says
            // the same thing about the closed state without the composition.
            open ? "rotate-90" : "rtl:rotate-180"
          )}
        >
          <svg
            viewBox="0 0 24 24"
            width="13"
            height="13"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </span>
        {index != null ? (
          <span className="font-mono text-[11.5px] leading-none font-semibold tabular-nums text-muted-foreground">
            {index}
          </span>
        ) : null}
        <span className="truncate font-mono text-[12.5px] leading-[1.3] font-semibold text-foreground">
          {title}
        </span>
        {badges}
        {source != null ? (
          <span className="font-mono text-[10.5px] leading-none font-medium text-muted-foreground">
            {source}
          </span>
        ) : null}
        {meta != null ? (
          <span className="text-[10.5px] leading-none font-medium text-muted-foreground">
            {meta}
          </span>
        ) : null}
      </div>
      {actions != null ? (
        <div data-slot="record-card-actions" className="flex items-center gap-2">
          {actions}
        </div>
      ) : null}
    </div>
  )
}

/* ---------------------------------------------------------------- Fields -- */

/**
 * The record's fields, one per row. Renders nothing while the card is collapsed
 * — the point of the card is that a page of them costs a page of headers.
 *
 * Deliberately a single column rather than a multi-column auto-fit grid. These
 * values have wildly unequal heights: an email is one line and a concatenated
 * hash bundle is twenty. In a grid every cell on a row stretches to the tallest
 * of them, so one long value strands its neighbours at the top of an otherwise
 * empty column and the reader's eye has to reset for each. Stacked, the label
 * column stays a fixed scan line and a long value simply pushes the next field
 * down.
 */
function RecordCardFields({
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "className" | "style">) {
  const { open, panelId, headerId } = useRecordCard("RecordCardFields")
  if (!open) return null
  return (
    <div
      data-slot="record-card-fields"
      id={panelId}
      role="region"
      aria-labelledby={headerId}
      className={cn(
        "flex flex-col gap-y-2.5",
        "border-t border-border px-[18px] py-3.5"
      )}
      {...props}
    >
      {children}
    </div>
  )
}

type RecordCardFieldProps = Omit<React.ComponentProps<"div">, "className" | "style"> & {
  /** The field's name. Rendered as a small uppercase label column. */
  label: React.ReactNode
  /** A stated fact about the value (e.g. "Weak", "Reused ×3") — never advice. */
  hint?: React.ReactNode
  /** Tone for the hint chip. Default `neutral`. */
  hintTone?: RecordCardTone
  /** Draw the value as a credential once it is visible. */
  secret?: boolean
  /** Replace the value with a dot placeholder. The children are not rendered at all. */
  masked?: boolean
  /** How many dots to draw while masked. Default 10. */
  maskLength?: number
  /** What assistive tech is told in place of a masked value (e.g. "Hidden — reveal to view"). */
  maskedLabel?: React.ReactNode
}

function RecordCardField({
  label,
  hint,
  hintTone = "neutral",
  secret = false,
  masked = false,
  maskLength = 10,
  maskedLabel,
  children,
  ...props
}: RecordCardFieldProps) {
  return (
    <div
      data-slot="record-card-field"
      className="grid grid-cols-[104px_minmax(0,1fr)] items-baseline gap-2.5 py-[5px]"
      {...props}
    >
      <span className="text-[10.5px] leading-[1.5] font-medium tracking-[0.04em] uppercase text-muted-foreground">
        {label}
      </span>
      <span className="flex min-w-0 flex-wrap items-baseline gap-2">
        <span
          data-slot="record-card-value"
          data-masked={masked || undefined}
          className={cn(
            "font-mono text-[11.5px] leading-[1.6] font-medium break-all",
            masked
              ? "text-muted-foreground"
              : secret
                ? "text-sev-critical-ink"
                : "text-foreground"
          )}
        >
          {masked ? (
            <>
              <span aria-hidden>{"•".repeat(maskLength)}</span>
              {maskedLabel != null ? <VisuallyHidden>{maskedLabel}</VisuallyHidden> : null}
            </>
          ) : (
            children
          )}
        </span>
        {hint != null ? (
          <Badge variant="soft" tone={hintTone} size="sm">
            {hint}
          </Badge>
        ) : null}
      </span>
    </div>
  )
}

/* ---------------------------------------------------------------- Footer -- */

type RecordCardFooterProps = Omit<React.ComponentProps<"div">, "className" | "style"> & {
  /** `muted` for provenance; `warning` when the line reports a caveat. Default `muted`. */
  tone?: "muted" | "warning"
}

/** The card's provenance line. Like the fields, it is part of the open state. */
function RecordCardFooter({ tone = "muted", children, ...props }: RecordCardFooterProps) {
  const { open } = useRecordCard("RecordCardFooter")
  if (!open) return null
  return (
    <div
      data-slot="record-card-footer"
      className={cn(
        "border-t border-border bg-surface px-[18px] py-[9px]",
        "font-mono text-[10px] leading-[1.5] font-medium",
        tone === "warning" ? "text-sev-high-ink" : "text-muted-foreground"
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { RecordCard, RecordCardHeader, RecordCardFields, RecordCardField, RecordCardFooter }
export type {
  RecordCardProps,
  RecordCardHeaderProps,
  RecordCardFieldProps,
  RecordCardFooterProps,
  RecordCardTone,
}
