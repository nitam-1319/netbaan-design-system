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
    const selected = asList(values[facet.id])
    return {
      ...previous,
      [facet.id]: [
        ...facet.options.filter((option) => selected.includes(option.value)),
        ...facet.options.filter((option) => !selected.includes(option.value)),
      ].map((option) => option.value),
    }
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

  function facetValueLabel(facet: FilterBarFacet) {
    if (facet.type === "date") {
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
            <span
              data-slot="filter-bar-count"
              className={cn(
                "inline-flex h-[17px] min-w-[17px] items-center justify-center rounded-full px-[5px]",
                "bg-primary font-mono text-[0.66rem] font-semibold text-primary-foreground tabular-nums"
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
                <div
                  data-slot="filter-bar-rail"
                  className="flex flex-col gap-0.5 border-e border-border bg-surface p-2"
                >
                  {facets.map((facet) => {
                    const on = facet.id === active?.id
                    const marked = isSet(facet, values)
                    return (
                      <button
                        key={facet.id}
                        type="button"
                        data-slot="filter-bar-facet"
                        data-on={on ? "" : undefined}
                        aria-current={on ? "true" : undefined}
                        onClick={() => selectFacet(facet)}
                        className={cn(
                          "flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-[7px]",
                          "text-start text-xs font-medium text-muted-foreground transition-colors",
                          "hover:bg-surface-2 hover:text-foreground",
                          "outline-none focus-visible:ring-3 focus-visible:ring-accent-soft",
                          "data-[on]:bg-accent-soft data-[on]:text-foreground"
                        )}
                      >
                        <span className="min-w-0 truncate">{facet.label}</span>
                        {marked ? (
                          <span className="inline-flex items-center gap-1.5">
                            <span className="font-mono text-[0.69rem] text-muted-foreground tabular-nums">
                              {facetValueLabel(facet)}
                            </span>
                            <span
                              aria-hidden="true"
                              className="size-1.5 shrink-0 rounded-full bg-primary"
                            />
                          </span>
                        ) : null}
                      </button>
                    )
                  })}
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
        <TextField
          size="sm"
          type="date"
          label={labels.from}
          value={range.from}
          min={facet.min}
          max={facet.max}
          onChange={(event) => setRange(event.target.value, range.to)}
        />
        <TextField
          size="sm"
          type="date"
          label={labels.to}
          value={range.to}
          min={facet.min}
          max={facet.max}
          onChange={(event) => setRange(range.from, event.target.value)}
        />
      </div>
    )
  }

  const selected = asList(values[facet.id])
  const ranked = order
    ? [...facet.options].sort(
        (a, b) => order.indexOf(a.value) - order.indexOf(b.value)
      )
    : facet.options
  const query = optionQuery.trim().toLowerCase()
  const visible = query
    ? ranked.filter((option) => option.label.toLowerCase().includes(query))
    : ranked
  // The hairline sits at the boundary between the hoisted selection and the
  // rest, so it is only drawn once and only when there is a boundary to mark.
  const dividerAt = selected.length
    ? visible.findIndex((option) => !selected.includes(option.value))
    : -1

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

      {visible.length === 0 ? (
        <span className="px-0.5 py-1 text-xs text-muted-foreground">
          {labels.noOptions}
        </span>
      ) : (
        <div
          role="group"
          aria-label={facet.label}
          className="flex max-h-[232px] flex-col gap-px overflow-y-auto"
        >
          {visible.map((option, index) => {
            const on = selected.includes(option.value)
            return (
              <React.Fragment key={option.value}>
                {index === dividerAt && index > 0 ? (
                  <div
                    aria-hidden="true"
                    className="mx-1 my-1.5 h-px bg-border"
                  />
                ) : null}
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={on}
                  data-slot="filter-bar-option"
                  data-on={on ? "" : undefined}
                  onClick={() =>
                    onChange(
                      facet.id,
                      on
                        ? selected.filter((value) => value !== option.value)
                        : [...selected, option.value]
                    )
                  }
                  className={cn(
                    "flex items-center justify-between gap-2.5 rounded-md px-2 py-1.5 text-start transition-colors",
                    "hover:bg-surface-2",
                    "outline-none focus-visible:ring-3 focus-visible:ring-accent-soft",
                    "data-[on]:bg-accent-soft data-[on]:hover:bg-accent-strong/40"
                  )}
                >
                  <span className="inline-flex min-w-0 items-center gap-2">
                    {/* The row owns the checkbox semantics (nesting a button
                        inside a button is invalid), so the box renders as a
                        presentational span driven by `checked`. */}
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
              </React.Fragment>
            )
          })}
        </div>
      )}
    </>
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
