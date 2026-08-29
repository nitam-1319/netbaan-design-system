"use client";

import * as React from "react"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"
import { Link2, SlidersHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ErrorState } from "@/components/ui/error-state"
import { Kbd } from "@/components/ui/kbd"
import { SearchInput } from "@/components/ui/search-input"
import { Skeleton } from "@/components/ui/skeleton"
import { TextField } from "@/components/ui/text-field"

/**
 * AEGIS — Filter Bar (Tables & Data Grid)
 *
 * The single filter toolbar for every list page. Configured by an array of
 * facets: the page describes *what* it filters on and the bar decides its own
 * controls, so eight list pages stop re-improvising a chip row plus a rank of
 * dropdowns. Three facet types (`multi`, `date`, `text`) cover the product's
 * list surfaces; a fourth is a change to this component, never to a page.
 *
 * The toolbar is one wrapping row — a Filters trigger carrying the active count,
 * a summary sentence in place of a chip row (chips cost a whole row of vertical
 * space to say what one sentence says, and push the table down as they
 * accumulate), an optional copy-link button, and search. Search is not a filter:
 * it stays in the toolbar at every breakpoint.
 *
 * The panel is portalled through the Base UI Popover engine, which is
 * load-bearing rather than incidental — list pages render inside
 * `Card > CardContent`, which clips, and the panel is taller than a short list
 * card. Portalling plus collision flipping is what keeps the footer's `Clear
 * all` and `Done` reachable.
 *
 * Filtering applies live; `Done` only closes. Public API is CLOSED — no
 * `className` / `style`; appearance comes entirely from `facets`.
 * See `.agent/rules/API_RULES.md`.
 */

type FilterBarOption = {
  value: string
  /** Display text. Fall back to the raw value at the adapter, never here. */
  label: string
  /**
   * Size of this option in the *unfiltered* set. Omit it when the source cannot
   * supply one — the count column simply does not render. Never fabricate it.
   */
  count?: number
}

/** A `date` facet's value. Either bound may be empty. */
type FilterBarDateValue = { from: string; to: string }

type FilterBarFacet =
  | {
      id: string
      label: string
      type: "multi"
      /** Adds a client-side search field above the option list. */
      searchable?: boolean
      options: FilterBarOption[]
    }
  | {
      id: string
      label: string
      type: "date"
      /** Selectable bounds, e.g. the endpoint's `created_at_range`. */
      min?: string
      max?: string
    }
  | { id: string; label: string; type: "text"; placeholder?: string }

type FilterBarValue = string[] | FilterBarDateValue | string

/**
 * Every string the bar renders on its own account. Supplied so the component
 * stays translatable without a locale dependency — the same contract as
 * `Pagination` and `DataTable`.
 */
type FilterBarLabels = {
  filters: string
  noFilters: string
  /** Unit in the summary sentence, e.g. "3 filters · severity, tag". */
  filterOne: string
  filterMany: string
  clear: string
  clearAll: string
  done: string
  copyLink: string
  noOptions: string
  textDescription: string
  /** Prefix for a searchable facet's option search, e.g. "Search tag". */
  searchPrefix: string
  last7Days: string
  last30Days: string
  last90Days: string
  allTime: string
  from: string
  to: string
  optionsErrorTitle: string
  optionsErrorDescription: string
  retry: string
  /** Shown beneath a `date` facet whose start day falls after its end day. */
  invalidRange: string
  /**
   * That facet's word in the rail, in place of its value summary. The rail
   * marks an unusable range with a word as well as a colour — the same rule the
   * set-facet dot follows.
   */
  invalidShort: string
}

const DEFAULT_LABELS: FilterBarLabels = {
  filters: "Filters",
  noFilters: "No filters applied",
  filterOne: "filter",
  filterMany: "filters",
  clear: "Clear",
  clearAll: "Clear all",
  done: "Done",
  copyLink: "Copy link to this view",
  noOptions: "No options match that search.",
  textDescription: "Matches anywhere in the value. Case-insensitive.",
  searchPrefix: "Search",
  last7Days: "Last 7 days",
  last30Days: "Last 30 days",
  last90Days: "Last 90 days",
  allTime: "All time",
  from: "From",
  to: "To",
  optionsErrorTitle: "Filter options unavailable",
  optionsErrorDescription: "The options for this facet could not be loaded.",
  retry: "Retry",
  invalidRange: "Start date must be on or before the end date.",
  invalidShort: "invalid",
}

type FilterBarProps = {
  /** The facets this list filters on, in the order they appear in the rail. */
  facets: FilterBarFacet[]
  /** Current value per facet id — a `string[]`, a `{from,to}`, or a `string`. */
  values: Record<string, FilterBarValue>
  /** Fires on every change; the list is expected to refetch immediately. */
  onChange: (facetId: string, value: FilterBarValue) => void
  /** Clears every facet at once. */
  onClear: () => void
  search: string
  onSearch: (value: string) => void
  searchPlaceholder?: string
  /** Live result count shown in the panel footer, e.g. "8 of 42 findings". */
  resultLine?: string
  /**
   * Raises the copy-link button. The bar writes `window.location.href` to the
   * clipboard and then calls this, so the page owns the confirmation toast.
   */
  onCopyLink?: () => void
  /** Facet options are still loading — the pane shows placeholder rows. */
  loading?: boolean
  /** Facet options failed to load — the pane offers a retry. */
  error?: boolean
  /** Retry handler for the options error state. */
  onRetry?: () => void
  /** Overrides for the bar's own copy; anything omitted stays English. */
  labels?: Partial<FilterBarLabels>
}

/**
 * Option-list geometry.
 *
 * The list has always been a `232px` box of `~31px` rows separated by a `1px`
 * gap (measured: a row's content box is `30.719px` — twelve pixels of padding
 * around an `18.719px` line box — and neither the checkbox nor the label's line
 * box changes with the script, so the pitch is the same in Latin and Persian).
 * Stating it as constants is what lets the list window itself: above
 * `VIRTUALIZE_ABOVE` options the rows are positioned rather than stacked, and
 * geometry the browser used to derive has to be geometry we can compute.
 *
 * Below the threshold nothing changes — the list renders whole, every row is a
 * tab stop, and the hairline is a real element in the flow, exactly as it has
 * always been. The windowed path exists for the sizes where the alternative is
 * not a slower page but a dead one.
 */
const OPTION_ROW_HEIGHT = 31
const OPTION_ROW_PITCH = 32
const OPTION_VIEWPORT_HEIGHT = 232
const OPTION_OVERSCAN = 6
/** The hairline's own pixel plus the `my-1.5` that gives it air. */
const OPTION_DIVIDER_SPACE = 13
const VIRTUALIZE_ABOVE = 60

function datePresets(labels: FilterBarLabels) {
  return [
    { label: labels.last7Days, days: 7 },
    { label: labels.last30Days, days: 30 },
    { label: labels.last90Days, days: 90 },
  ]
}

function isoDay(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function daysAgo(days: number) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return isoDay(date)
}

/**
 * A bound as a native date input states it: `YYYY-MM-DD`, or nothing.
 *
 * The two ends of a range do not arrive in the same ISO shape. The input's own
 * value is always a bare day, but a facet's `min` / `max` come from whatever the
 * filter-options endpoint sends, which is routinely a full timestamp
 * (`2026-01-01T00:00:00.000Z`). A native date input REJECTS a `min` / `max` it
 * cannot read as a bare day and drops the bound entirely rather than reporting
 * it — which is why the endpoint's bounds have never actually constrained the
 * calendar. Narrowing every bound to its day fixes that, and keeps the
 * comparisons below honest: a timestamp compared as text sorts AFTER the very
 * day it falls on, so a mixed pair would read `2026-01-01T00:00:00.000Z` as
 * later than `2026-01-01`.
 *
 * Text comparison is the right tool once both sides are days, because
 * `YYYY-MM-DD` is fixed-width and big-endian — lexical order IS chronological
 * order, with no parsing and no timezone to shift the answer by a day.
 */
function asDay(value: string | undefined): string {
  return value ? value.slice(0, 10) : ""
}

/** The later of two days, ignoring an absent one. */
function laterDay(a: string, b: string): string {
  if (!a) return b
  if (!b) return a
  return a > b ? a : b
}

/** The earlier of two days, ignoring an absent one. */
function earlierDay(a: string, b: string): string {
  if (!a) return b
  if (!b) return a
  return a < b ? a : b
}

/**
 * A range whose start day falls after its end day — a filter that can only ever
 * match nothing.
 *
 * Only a range carrying BOTH bounds can be inverted. One bound alone is an
 * open-ended range and a perfectly good filter, so it is never flagged.
 */
function isInvertedRange(range: FilterBarDateValue): boolean {
  const from = asDay(range.from)
  const to = asDay(range.to)
  return Boolean(from && to && from > to)
}

function asList(value: FilterBarValue | undefined): string[] {
  return Array.isArray(value) ? value : []
}

function asRange(value: FilterBarValue | undefined): FilterBarDateValue {
  return value != null && !Array.isArray(value) && typeof value === "object"
    ? value
    : { from: "", to: "" }
}

function asText(value: FilterBarValue | undefined): string {
  return typeof value === "string" ? value : ""
}

function isSet(facet: FilterBarFacet, values: FilterBarProps["values"]) {
  const value = values[facet.id]
  if (value == null) return false
  if (facet.type === "date") {
    const range = asRange(value)
    return Boolean(range.from || range.to)
  }
  if (facet.type === "text") return asText(value).length > 0
  return asList(value).length > 0
}

function FilterBar({
  facets,
  values,
  onChange,
  onClear,
  search,
  onSearch,
  searchPlaceholder = "Search",
  resultLine,
  onCopyLink,
  loading = false,
  error = false,
  onRetry,
  labels: labelOverrides,
}: FilterBarProps) {
  const labels = { ...DEFAULT_LABELS, ...labelOverrides }
  const [open, setOpen] = React.useState(false)
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [optionQuery, setOptionQuery] = React.useState("")
  // Frozen option order, one entry per facet visited while the panel is open.
  const [order, setOrder] = React.useState<Record<string, string[]>>({})

  // The active facet is RESOLVED, never assumed. The facet set changes under an
  // open panel when the org switches, or when a wizard step re-filters its
  // options — falling back to the first facet is what keeps the pane from
  // rendering blank against a stale id.
  const active =
    facets.find((facet) => facet.id === activeId) ?? facets[0] ?? null

  const setFacets = facets.filter((facet) => isSet(facet, values))
  const activeCount = setFacets.length
  const summary =
    activeCount === 0
      ? labels.noFilters
      : `${activeCount} ${
          activeCount === 1 ? labels.filterOne : labels.filterMany
        } · ${setFacets.map((facet) => facet.label.toLowerCase()).join(", ")}`

  // Selected-first ordering, captured once per facet visit. Re-sorting live
  // would slide a row out from under the pointer as it is being checked, so the
  // capture happens only where a visit BEGINS — opening the panel and switching
  // facets — and never on click. Both paths call `freeze`, so the open path and
  // the facet-switch path cannot drift apart. A facet with nothing captured (the
  // facet set changed underneath, or options arrived after the panel opened)
  // keeps its natural order rather than hoisting mid-visit.
  const activeOrder =
    active && active.type === "multi" ? order[active.id] : undefined

  function freeze(
    facet: FilterBarFacet | null,
    previous: Record<string, string[]>
  ) {
    if (!facet || facet.type !== "multi" || facet.options.length === 0) {
      return previous
    }
    // Membership through a Set, not `Array.includes` per option: the two passes
    // below are O(options) each, and against an array they were O(options ×
    // selected) — the shape that turns a wide facet into a stalled panel.
    const selected = new Set(asList(values[facet.id]))
    const hoisted: string[] = []
    const rest: string[] = []
    for (const option of facet.options) {
      ;(selected.has(option.value) ? hoisted : rest).push(option.value)
    }
    return { ...previous, [facet.id]: [...hoisted, ...rest] }
  }

  // `F` opens the panel from anywhere on the page, but never steals a keystroke
  // from a field the user is already typing in. It routes through the same open
  // path as the trigger so the visit is captured identically — which means the
  // handler closes over live render values, hence the deliberate re-bind on
  // every render rather than a stale-closure dependency list.
  React.useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key !== "f" && event.key !== "F") return
      if (event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target as HTMLElement | null
      const tag = target?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return
      if (target?.isContentEditable) return
      event.preventDefault()
      handleOpenChange(true)
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  })

  function handleOpenChange(next: boolean) {
    setOpen(next)
    setOptionQuery("")
    // Opening starts a visit; closing releases every capture so the next visit
    // re-hoists whatever is selected by then.
    setOrder(next ? freeze(active, {}) : {})
  }

  function selectFacet(facet: FilterBarFacet) {
    setActiveId(facet.id)
    setOptionQuery("")
    setOrder((previous) => freeze(facet, previous))
  }

  function clearActive() {
    if (!active) return
    onChange(
      active.id,
      active.type === "date"
        ? { from: "", to: "" }
        : active.type === "text"
          ? ""
          : []
    )
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard?.writeText(window.location.href)
    } catch {
      /* Clipboard access can be denied; the page still gets its callback. */
    }
    onCopyLink?.()
  }

  /**
   * A facet holding a constraint that cannot be satisfied.
   *
   * A backwards date range is the only one today, and it is a state the bar can
   * READ rather than one a page has to declare: the `{from,to}` contract is this
   * component's own, so nothing is gained by making every list page compute the
   * same predicate and pass it back in. The page's job is not to submit it.
   */
  function isInvalid(facet: FilterBarFacet) {
    return facet.type === "date" && isInvertedRange(asRange(values[facet.id]))
  }

  const invalidCount = facets.filter(isInvalid).length

  function facetValueLabel(facet: FilterBarFacet) {
    if (facet.type === "date") {
      if (isInvalid(facet)) return labels.invalidShort
      const range = asRange(values[facet.id])
      return range.from && range.to ? "range" : "set"
    }
    if (facet.type === "text") return "text"
    return String(asList(values[facet.id]).length)
  }

  return (
    <div
      data-slot="filter-bar"
      className="flex w-full flex-wrap items-center gap-2.5"
    >
      <PopoverPrimitive.Root open={open} onOpenChange={handleOpenChange}>
        <PopoverPrimitive.Trigger
          data-slot="filter-bar-trigger"
          data-open={open ? "" : undefined}
          className={cn(
            "inline-flex h-8 shrink-0 items-center gap-[7px] rounded-lg border border-border bg-surface px-[11px]",
            "text-[0.78rem] font-medium text-foreground transition-colors",
            "hover:border-accent-strong hover:bg-surface-2",
            "outline-none focus-visible:ring-3 focus-visible:ring-accent-soft",
            "data-[open]:border-primary data-[open]:bg-accent-soft"
          )}
        >
          <SlidersHorizontal
            aria-hidden="true"
            className="size-3.5 text-muted-foreground"
          />
          {labels.filters}
          {activeCount > 0 ? (
            /* The count keeps counting an unusable facet — it IS a constraint
               the user set, and quietly dropping it to `2` would understate the
               thing they still have to fix. What changes is the colour, plus a
               `title` naming the problem, because the badge is the only part of
               this control still on screen once the panel is closed. */
            <span
              data-slot="filter-bar-count"
              data-invalid={invalidCount > 0 ? "" : undefined}
              title={invalidCount > 0 ? labels.invalidRange : undefined}
              className={cn(
                "inline-flex h-[17px] min-w-[17px] items-center justify-center rounded-full px-[5px]",
                "bg-primary font-mono text-[0.66rem] font-semibold text-primary-foreground tabular-nums",
                "data-[invalid]:bg-destructive data-[invalid]:text-on-tone"
              )}
            >
              {activeCount}
            </span>
          ) : null}
          <Kbd size="sm" aria-hidden="true">
            F
          </Kbd>
        </PopoverPrimitive.Trigger>

        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Positioner
            data-slot="filter-bar-positioner"
            side="bottom"
            align="start"
            sideOffset={7}
            collisionPadding={8}
            className="z-50"
          >
            <PopoverPrimitive.Popup
              data-slot="filter-bar-panel"
              aria-label="Filters"
              className={cn(
                "w-[520px] max-w-[calc(100vw-1rem)] overflow-clip rounded-[12px] border border-border bg-card shadow-elevation-3 outline-none",
                "origin-[var(--transform-origin)] transition-[transform,opacity] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]",
                "data-[starting-style]:translate-y-[-6px] data-[starting-style]:scale-[0.99] data-[starting-style]:opacity-0",
                "data-[ending-style]:scale-[0.99] data-[ending-style]:opacity-0 data-[ending-style]:motion-exit"
              )}
            >
              <div className="grid grid-cols-[172px_minmax(0,1fr)] items-stretch">
                {/* The rail SCROLLS rather than growing — a response can carry
                    more facets than fit, and an unbounded rail stretched the
                    popup past the viewport, taking `Clear all` and `Done` off
                    screen with it.

                    It cannot be capped with a `max-height`, though: the pane
                    beside it sets the row's height, and any fixed cap is either
                    shorter than the pane (leaving a bare strip below the rail —
                    which is what a searchable facet does, since its search field
                    makes the pane ~104px taller) or taller than it (back to
                    stretching the popup). So the rail is absolutely positioned
                    inside a stretched wrapper instead: `absolute` keeps it out
                    of the row's height calculation, so the PANE decides how tall
                    the row is, and `inset-0` makes the rail exactly that tall
                    whatever the pane turns out to be. The wrapper carries the
                    surface and the divider so both reach the footer. */}
                <div className="relative border-e border-border bg-surface">
                  <div
                    data-slot="filter-bar-rail"
                    className="absolute inset-0 flex flex-col gap-0.5 overflow-y-auto p-2"
                  >
                    {facets.map((facet) => {
                      const on = facet.id === active?.id
                      const marked = isSet(facet, values)
                      const broken = isInvalid(facet)
                      return (
                        <button
                          key={facet.id}
                          type="button"
                          data-slot="filter-bar-facet"
                          data-on={on ? "" : undefined}
                          aria-current={on ? "true" : undefined}
                          onClick={() => selectFacet(facet)}
                          className={cn(
                            // `shrink-0`: the rail is a scroll container, and a
                            // column flex child shrinks by default — without it
                            // forty facets would squash into the rail's height
                            // instead of scrolling past it.
                            "flex w-full shrink-0 items-center justify-between gap-2 rounded-md px-2.5 py-[7px]",
                            "text-start text-xs font-medium text-muted-foreground transition-colors",
                            "hover:bg-surface-2 hover:text-foreground",
                            "outline-none focus-visible:ring-3 focus-visible:ring-accent-soft",
                            "data-[on]:bg-accent-soft data-[on]:text-foreground"
                          )}
                        >
                          <span className="min-w-0 truncate">{facet.label}</span>
                          {marked ? (
                            /* Both the WORD and the dot change — the summary
                               reads "invalid" where it would read "range", so
                               the rail never signals the difference by hue
                               alone, which is the same rule the set dot follows. */
                            <span className="inline-flex items-center gap-1.5">
                              <span
                                className={cn(
                                  "font-mono text-[0.69rem] tabular-nums",
                                  broken
                                    ? "text-destructive-ink"
                                    : "text-muted-foreground"
                                )}
                              >
                                {facetValueLabel(facet)}
                              </span>
                              <span
                                aria-hidden="true"
                                className={cn(
                                  "size-1.5 shrink-0 rounded-full",
                                  broken ? "bg-destructive" : "bg-primary"
                                )}
                              />
                            </span>
                          ) : null}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="flex min-h-[296px] flex-col">
                  <div className="flex items-center justify-between gap-2.5 border-b border-border px-3 py-2.5">
                    <span className="text-[0.78rem] font-semibold text-foreground">
                      {active?.label ?? labels.filters}
                    </span>
                    {active && isSet(active, values) ? (
                      <Button variant="link" size="sm" onClick={clearActive}>
                        {labels.clear}
                      </Button>
                    ) : null}
                  </div>

                  <div className="flex flex-1 flex-col gap-2.5 px-3 py-2.5">
                    <FilterBarPane
                      facet={active}
                      values={values}
                      order={activeOrder}
                      optionQuery={optionQuery}
                      onOptionQueryChange={setOptionQuery}
                      onChange={onChange}
                      loading={loading}
                      error={error}
                      onRetry={onRetry}
                      labels={labels}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2.5 border-t border-border bg-surface px-3 py-2.5">
                    <span className="text-[0.72rem] text-muted-foreground">
                      {resultLine}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={onClear}>
                        {labels.clearAll}
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleOpenChange(false)}
                      >
                        {labels.done}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </PopoverPrimitive.Popup>
          </PopoverPrimitive.Positioner>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>

      <span
        data-slot="filter-bar-summary"
        className="min-w-0 truncate text-[0.78rem] text-muted-foreground"
      >
        {summary}
      </span>
      {activeCount > 0 ? (
        <Button variant="link" size="sm" onClick={onClear}>
          {labels.clear}
        </Button>
      ) : null}

      <span className="flex-[1_1_2.5rem]" />

      {onCopyLink ? (
        <button
          type="button"
          data-slot="filter-bar-copy-link"
          onClick={handleCopyLink}
          title={labels.copyLink}
          aria-label={labels.copyLink}
          className={cn(
            "inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-surface",
            "text-muted-foreground transition-colors",
            "hover:border-accent-strong hover:bg-surface-2 hover:text-foreground",
            "outline-none focus-visible:ring-3 focus-visible:ring-accent-soft"
          )}
        >
          <Link2 aria-hidden="true" className="size-[15px]" />
        </button>
      ) : null}

      <div className="w-[248px] max-w-full shrink-0">
        <SearchInput
          size="sm"
          shortcut="/"
          value={search}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          onChange={(event) => onSearch(event.target.value)}
        />
      </div>
    </div>
  )
}

type FilterBarPaneProps = {
  facet: FilterBarFacet | null
  values: FilterBarProps["values"]
  /** The frozen option order for a `multi` facet's current visit. */
  order: string[] | undefined
  optionQuery: string
  onOptionQueryChange: (value: string) => void
  onChange: FilterBarProps["onChange"]
  loading: boolean
  error: boolean
  onRetry?: () => void
  labels: FilterBarLabels
}

function FilterBarPane({
  facet,
  values,
  order,
  optionQuery,
  onOptionQueryChange,
  onChange,
  loading,
  error,
  onRetry,
  labels,
}: FilterBarPaneProps) {
  if (!facet) return null

  // A facet-options failure must never block the list, so it is contained to
  // the pane — the rest of the toolbar keeps working.
  if (error) {
    return (
      <ErrorState
        size="sm"
        title={labels.optionsErrorTitle}
        description={labels.optionsErrorDescription}
        onRetry={onRetry}
        retryLabel={labels.retry}
      />
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-2" aria-busy="true">
        {[0, 1, 2, 3].map((row) => (
          <Skeleton key={row} />
        ))}
      </div>
    )
  }

  if (facet.type === "text") {
    return (
      <TextField
        size="sm"
        value={asText(values[facet.id])}
        placeholder={facet.placeholder ?? "Contains…"}
        aria-label={facet.label}
        description={labels.textDescription}
        onChange={(event) => onChange(facet.id, event.target.value)}
      />
    )
  }

  if (facet.type === "date") {
    const range = asRange(values[facet.id])
    const setRange = (from: string, to: string) =>
      onChange(facet.id, { from, to })
    const min = asDay(facet.min)
    const max = asDay(facet.max)
    const from = asDay(range.from)
    const to = asDay(range.to)
    const inverted = isInvertedRange(range)
    return (
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {datePresets(labels).map((preset) => (
            <FilterBarPreset
              key={preset.label}
              label={preset.label}
              onClick={() => setRange(daysAgo(preset.days), isoDay(new Date()))}
            />
          ))}
          <FilterBarPreset
            label={labels.allTime}
            onClick={() => setRange("", "")}
          />
        </div>
        {/* The two fields bound EACH OTHER, not just the facet — the end day
            caps the start calendar and the start day floors the end one, so the
            ordinary path through this control cannot produce a backwards range
            at all. The facet's own bounds still win wherever they are tighter.

            Prevention is not the whole answer, though, because the calendar is
            not the only way in: a day can be typed straight into the field, and
            a range arrives wholesale from a deep link that never passed through
            this component. Both fields are therefore marked `aria-invalid` when
            the pair is backwards — which is what paints the shells, `TextField`
            leaving the state to its caller by design — and the message hangs off
            the second field so it reads beneath the pair rather than between
            them. An out-of-range value is still SHOWN; a control that blanked
            what the user typed would leave nothing to correct. */}
        <TextField
          size="sm"
          type="date"
          label={labels.from}
          value={from}
          min={min || undefined}
          max={earlierDay(max, to) || undefined}
          aria-invalid={inverted || undefined}
          onChange={(event) => setRange(event.target.value, range.to)}
        />
        <TextField
          size="sm"
          type="date"
          label={labels.to}
          value={to}
          min={laterDay(min, from) || undefined}
          max={max || undefined}
          aria-invalid={inverted || undefined}
          error={inverted ? labels.invalidRange : undefined}
          onChange={(event) => setRange(range.from, event.target.value)}
        />
      </div>
    )
  }

  return (
    <>
      {facet.searchable ? (
        <SearchInput
          size="sm"
          value={optionQuery}
          placeholder={`${labels.searchPrefix} ${facet.label.toLowerCase()}`}
          aria-label={`${labels.searchPrefix} ${facet.label.toLowerCase()}`}
          onChange={(event) => onOptionQueryChange(event.target.value)}
        />
      ) : null}
      <FilterBarOptionList
        facet={facet}
        selected={asList(values[facet.id])}
        order={order}
        optionQuery={optionQuery}
        onChange={onChange}
        labels={labels}
      />
    </>
  )
}

type FilterBarOptionListProps = {
  facet: Extract<FilterBarFacet, { type: "multi" }>
  selected: string[]
  order: string[] | undefined
  optionQuery: string
  onChange: FilterBarProps["onChange"]
  labels: FilterBarLabels
}

/**
 * The checkbox list for a `multi` facet.
 *
 * Split out of `FilterBarPane` because it is the only part of the bar whose
 * cost scales with the RESPONSE rather than with the design: a facet's option
 * count is whatever `GET /{resource}/filter/` decides to send, and three of the
 * things this list did per render were quadratic in it.
 *
 * - Applying the frozen order called `order.indexOf` from inside a sort
 *   comparator — a linear scan per comparison, so O(n² log n) overall. It is a
 *   rank `Map` now, which makes the sort plain O(n log n). Measured on the
 *   shipped 0.5.1: 5 000 options cost 41 ms, 20 000 cost 605 ms, 40 000 cost
 *   2.7 s — and this ran again on every keystroke in the option search and
 *   every option clicked, because the whole bar re-renders on each change.
 * - Membership (`selected.includes`) was an array scan per row. It is a `Set`.
 * - Every option was in the DOM, six nodes apiece, for a box that shows seven
 *   of them: 2 000 options materialised 12 026 nodes, 20 000 would materialise
 *   ~120 000. That is the one that stopped being slow and started being fatal.
 *
 * So above `VIRTUALIZE_ABOVE` the list windows — only the rows near the
 * viewport exist, positioned inside a full-height spacer, which is the same
 * technique and the same shape as `VirtualizedGrid`. Below it the list renders
 * whole, exactly as before, because every facet the product actually ships
 * (severity, record type, port state) is a handful of options and there is no
 * reason to hand them a scroll-driven code path.
 */
function FilterBarOptionList({
  facet,
  selected,
  order,
  optionQuery,
  onChange,
  labels,
}: FilterBarOptionListProps) {
  const selectedSet = React.useMemo(() => new Set(selected), [selected])

  const rank = React.useMemo(() => {
    if (!order) return null
    const map = new Map<string, number>()
    for (let i = 0; i < order.length; i++) map.set(order[i], i)
    return map
  }, [order])

  const visible = React.useMemo(() => {
    // `?? -1` preserves the old `indexOf` semantics for a value the frozen
    // order never captured: it sorts ahead of everything, not to the end.
    const ranked = rank
      ? [...facet.options].sort(
          (a, b) => (rank.get(a.value) ?? -1) - (rank.get(b.value) ?? -1)
        )
      : facet.options
    const query = optionQuery.trim().toLowerCase()
    return query
      ? ranked.filter((option) => option.label.toLowerCase().includes(query))
      : ranked
  }, [facet.options, rank, optionQuery])

  // The hairline marks the boundary between the hoisted selection and the rest.
  // Because the order is frozen for the visit, checking a further option does
  // NOT move it up — which would otherwise strand a checked row below a line
  // that claims everything under it is unselected. So the hairline is drawn only
  // while the list is still cleanly partitioned, and withdraws as soon as it
  // would misdescribe the grouping; the row tint goes on carrying which options
  // are selected, so nothing becomes ambiguous.
  const dividerAt = React.useMemo(() => {
    let firstUnselected = -1
    for (let i = 0; i < visible.length; i++) {
      if (!selectedSet.has(visible[i].value)) {
        firstUnselected = i
        break
      }
    }
    if (firstUnselected <= 0) return -1
    for (let i = firstUnselected + 1; i < visible.length; i++) {
      if (selectedSet.has(visible[i].value)) return -1
    }
    return firstUnselected
  }, [visible, selectedSet])

  function toggle(value: string) {
    onChange(
      facet.id,
      selectedSet.has(value)
        ? selected.filter((entry) => entry !== value)
        : [...selected, value]
    )
  }

  function renderOption(
    option: FilterBarOption,
    index: number,
    style?: React.CSSProperties
  ) {
    const on = selectedSet.has(option.value)
    return (
      <button
        key={option.value}
        type="button"
        role="checkbox"
        aria-checked={on}
        data-slot="filter-bar-option"
        data-index={index}
        data-on={on ? "" : undefined}
        onClick={() => toggle(option.value)}
        style={style}
        className={cn(
          "flex items-center justify-between gap-2.5 rounded-md px-2 py-1.5 text-start transition-colors",
          "hover:bg-surface-2",
          "outline-none focus-visible:ring-3 focus-visible:ring-accent-soft",
          "data-[on]:bg-accent-soft data-[on]:hover:bg-accent-strong/40",
          style && "absolute inset-x-0"
        )}
      >
        <span className="inline-flex min-w-0 items-center gap-2">
          {/* The row owns the checkbox semantics (nesting a button inside a
              button is invalid), so the box renders as a presentational span
              driven by `checked`. */}
          <Checkbox
            render={<span />}
            size="sm"
            checked={on}
            tabIndex={-1}
            aria-hidden="true"
          />
          <span className="truncate text-[0.78rem] text-foreground">
            {option.label}
          </span>
        </span>
        {option.count != null ? (
          <span className="font-mono text-[0.69rem] text-muted-foreground tabular-nums">
            {option.count.toLocaleString()}
          </span>
        ) : null}
      </button>
    )
  }

  if (visible.length === 0) {
    return (
      <span className="px-0.5 py-1 text-xs text-muted-foreground">
        {labels.noOptions}
      </span>
    )
  }

  if (visible.length > VIRTUALIZE_ABOVE) {
    return (
      // Keyed on the list's IDENTITY. A facet switch or a narrowed search is a
      // different list, and the window has to reopen at the top of it — through
      // a remount rather than an effect, so one render settles both the scroll
      // offset the component holds and the one the DOM holds.
      <FilterBarOptionWindow
        key={`${facet.id}:${optionQuery}`}
        label={facet.label}
        options={visible}
        dividerAt={dividerAt}
        renderOption={renderOption}
      />
    )
  }

  return (
    <div
      role="group"
      aria-label={facet.label}
      className="flex max-h-[232px] flex-col gap-px overflow-y-auto"
    >
      {visible.map((option, index) => (
        <React.Fragment key={option.value}>
          {index === dividerAt && index > 0 ? (
            <div
              aria-hidden="true"
              data-slot="filter-bar-divider"
              className="mx-1 my-1.5 h-px bg-border"
            />
          ) : null}
          {renderOption(option, index)}
        </React.Fragment>
      ))}
    </div>
  )
}

type FilterBarOptionWindowProps = {
  label: string
  options: FilterBarOption[]
  dividerAt: number
  renderOption: (
    option: FilterBarOption,
    index: number,
    style?: React.CSSProperties
  ) => React.ReactNode
}

/**
 * The windowed option list: only the rows near the viewport exist.
 *
 * Same technique as `VirtualizedGrid` — a full-height spacer establishes the
 * scroll range for the whole set, and the rendered rows are positioned at their
 * true offset inside it — so a facet of forty thousand options costs the same
 * twenty rows of DOM as a facet of eighty.
 */
function FilterBarOptionWindow({
  label,
  options,
  dividerAt,
  renderOption,
}: FilterBarOptionWindowProps) {
  const viewportRef = React.useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = React.useState(0)
  // The row an arrow key asked for. It may not be mounted at the moment of the
  // keystroke, so the move is: scroll it into range, render, then focus it —
  // and the request rides a ref, because parking it in state would make the
  // effect that consumes it set state and cascade a render.
  const pendingFocus = React.useRef<number | null>(null)

  function focusRow(index: number) {
    const row = viewportRef.current?.querySelector<HTMLButtonElement>(
      `[data-slot="filter-bar-option"][data-index="${index}"]`
    )
    if (row) row.focus()
    return Boolean(row)
  }

  React.useEffect(() => {
    const index = pendingFocus.current
    if (index == null) return
    pendingFocus.current = null
    focusRow(index)
  })

  /**
   * Arrow keys.
   *
   * Tab is enough while every row is in the DOM, but it cannot cross the window
   * once they are not — it walks off the last rendered row and out of the list.
   * These address rows by INDEX rather than by focus order, so every option
   * stays reachable from the keyboard however few are materialised.
   */
  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const last = options.length - 1
    const from = Number(
      (event.target as HTMLElement).getAttribute?.("data-index") ?? -1
    )
    if (Number.isNaN(from)) return
    let next: number
    if (event.key === "ArrowDown") next = from + 1
    else if (event.key === "ArrowUp") next = from - 1
    else if (event.key === "Home") next = 0
    else if (event.key === "End") next = last
    else return
    next = Math.max(0, Math.min(last, next))
    event.preventDefault()

    const viewport = viewportRef.current
    if (viewport) {
      const top = next * OPTION_ROW_PITCH
      const bottom = top + OPTION_ROW_HEIGHT
      if (top < viewport.scrollTop) viewport.scrollTop = top
      else if (bottom > viewport.scrollTop + OPTION_VIEWPORT_HEIGHT) {
        viewport.scrollTop = bottom - OPTION_VIEWPORT_HEIGHT
      }
      setScrollTop(viewport.scrollTop)
    }
    // A neighbour is usually already rendered, and then there is nothing to
    // wait for — moving focus now matters, because a step that does not change
    // the scroll offset does not re-render, so an effect scheduled against one
    // would never run and the keystroke would be swallowed. Deferring is only
    // for the step that scrolls a row into existence.
    if (!focusRow(next)) pendingFocus.current = next
  }

  // Rows below the hairline are pushed down by the space it occupies in the
  // unwindowed list, so both paths draw the same picture. The window itself is
  // computed off the plain pitch — the offset is under half a row, and the
  // overscan absorbs it.
  const offsetAfterDivider = dividerAt > 0 ? OPTION_DIVIDER_SPACE : 0
  const topOf = (index: number) =>
    index * OPTION_ROW_PITCH +
    (dividerAt > 0 && index >= dividerAt ? offsetAfterDivider : 0)
  const start = Math.max(
    0,
    Math.floor(scrollTop / OPTION_ROW_PITCH) - OPTION_OVERSCAN
  )
  const end = Math.min(
    options.length,
    start +
      Math.ceil(OPTION_VIEWPORT_HEIGHT / OPTION_ROW_PITCH) +
      OPTION_OVERSCAN * 2
  )
  const rows: React.ReactNode[] = []
  for (let i = start; i < end; i++) {
    rows.push(
      renderOption(options[i], i, { top: topOf(i), height: OPTION_ROW_HEIGHT })
    )
  }

  return (
    <div
      ref={viewportRef}
      role="group"
      aria-label={label}
      data-slot="filter-bar-option-viewport"
      onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
      onKeyDown={handleKeyDown}
      className="relative overflow-y-auto"
      style={{ height: OPTION_VIEWPORT_HEIGHT }}
    >
      {/* The spacer carries the scroll range for the WHOLE set while only the
          window is materialised. Presentational, so the rows stay direct
          children of the group as far as assistive tech is concerned. */}
      <div
        role="presentation"
        data-slot="filter-bar-option-canvas"
        className="relative w-full"
        style={{ height: options.length * OPTION_ROW_PITCH + offsetAfterDivider }}
      >
        {dividerAt > 0 ? (
          <div
            aria-hidden="true"
            data-slot="filter-bar-divider"
            className="absolute inset-x-1 h-px bg-border"
            style={{ top: dividerAt * OPTION_ROW_PITCH + 6 }}
          />
        ) : null}
        {rows}
      </div>
    </div>
  )
}

function FilterBarPreset({
  label,
  onClick,
}: {
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-slot="filter-bar-preset"
      className={cn(
        "h-6 shrink-0 rounded-[7px] border border-border bg-surface px-2.5",
        "text-[0.72rem] font-medium text-muted-foreground transition-colors",
        "hover:border-accent-strong hover:text-foreground",
        "outline-none focus-visible:ring-3 focus-visible:ring-accent-soft"
      )}
    >
      {label}
    </button>
  )
}

export { FilterBar }
export type {
  FilterBarProps,
  FilterBarFacet,
  FilterBarLabels,
  FilterBarOption,
  FilterBarValue,
  FilterBarDateValue,
}
