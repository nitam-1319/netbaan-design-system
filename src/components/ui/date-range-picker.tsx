"use client";

import * as React from "react"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

/**
 * AEGIS — Date Range Picker (Inputs)
 *
 * The start/end sibling of `Date Picker`: an AEGIS Input-shell trigger showing
 * the chosen range that opens a `Popover` with the same from-scratch month grid,
 * extended to pick two endpoints. Click a start day, then an end day (they swap
 * if you pick them out of order); the days in between are highlighted, the range
 * commits, and the popover closes. Base UI ships no calendar primitive, so the
 * grid is built here — a real `role="grid"` with month navigation and arrow-key
 * roving focus, matching Date Picker.
 *
 * You own the value; the picker emits a `{ start, end }` of local-midnight dates.
 * Controlled (`value` + `onValueChange`) and uncontrolled (`defaultValue`) are
 * both supported. Public API is CLOSED — no `className` / `style`. Colour is
 * token-only. See `.agent/rules/API_RULES.md`.
 */

/* -------------------------------------------------------------- date utils -- */

function makeDay(year: number, month: number, day: number): Date {
  return new Date(year, month, day, 0, 0, 0, 0)
}
function startOfDay(d: Date): Date {
  return makeDay(d.getFullYear(), d.getMonth(), d.getDate())
}
function isSameDay(a: Date | null | undefined, b: Date | null | undefined): boolean {
  if (!a || !b) return false
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}
function addDays(d: Date, n: number): Date {
  return makeDay(d.getFullYear(), d.getMonth(), d.getDate() + n)
}
function addMonths(d: Date, n: number): Date {
  return makeDay(d.getFullYear(), d.getMonth() + n, 1)
}
function time(d: Date): number {
  return startOfDay(d).getTime()
}
function isBefore(a: Date, b: Date): boolean {
  return time(a) < time(b)
}
function inRange(d: Date, start: Date, end: Date): boolean {
  const t = time(d)
  return t > time(start) && t < time(end)
}
function clampDay(d: Date, min?: Date, max?: Date): Date {
  if (min && isBefore(d, min)) return startOfDay(min)
  if (max && isBefore(max, d)) return startOfDay(max)
  return d
}
function buildMonthGrid(viewYear: number, viewMonth: number, weekStartsOn: number): Date[] {
  const first = makeDay(viewYear, viewMonth, 1)
  const offset = (first.getDay() - weekStartsOn + 7) % 7
  const gridStart = addDays(first, -offset)
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i))
}
function keyOf(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

/* -------------------------------------------------------------------- types -- */

export type DateRangePickerSize = "sm" | "md" | "lg"

export interface DateRange {
  start: Date
  end: Date
}

export interface DateRangePickerProps {
  /** Controlled selected range (`null` = none). */
  value?: DateRange | null
  /** Uncontrolled initial range. */
  defaultValue?: DateRange | null
  /** Fires with the selected range once both endpoints are chosen. */
  onValueChange?: (range: DateRange | null) => void
  /** Month shown when first opened with no value. Defaults to today. */
  defaultMonth?: Date
  /** Earliest selectable day (inclusive). */
  minDate?: Date
  /** Latest selectable day (inclusive). */
  maxDate?: Date
  /** Trigger placeholder when no range is chosen. Default "Pick a date range". */
  placeholder?: string
  /** Accessible label for the trigger. Default "Choose date range". */
  label?: string
  /** BCP-47 locale for month / weekday / value formatting. Default the runtime's. */
  locale?: string
  /** First day of the week (0 = Sunday … 6 = Saturday). Default 0. */
  weekStartsOn?: number
  /** Format one endpoint shown in the trigger. Default a medium local date. */
  formatDate?: (date: Date) => string
  /** Trigger size. Default "md". */
  size?: DateRangePickerSize
  /** Disable the whole control. */
  disabled?: boolean
  /** Mark the field invalid (paints the shell + sets `aria-invalid`). */
  invalid?: boolean
}

const shellSize: Record<DateRangePickerSize, string> = {
  sm: "h-8 text-[0.8rem] [&_svg]:size-3.5",
  md: "h-10 text-sm [&_svg]:size-4",
  lg: "h-12 text-base [&_svg]:size-5",
}

function normalize(range: DateRange | null | undefined): DateRange | null {
  if (!range) return null
  const a = startOfDay(range.start)
  const b = startOfDay(range.end)
  return isBefore(b, a) ? { start: b, end: a } : { start: a, end: b }
}

/* --------------------------------------------------------------------- root -- */

function DateRangePicker({
  value,
  defaultValue = null,
  onValueChange,
  defaultMonth,
  minDate,
  maxDate,
  placeholder = "Pick a date range",
  label = "Choose date range",
  locale,
  weekStartsOn = 0,
  formatDate,
  size = "md",
  disabled = false,
  invalid = false,
}: DateRangePickerProps) {
  const isControlled = value !== undefined
  const [internal, setInternal] = React.useState<DateRange | null>(normalize(defaultValue))
  const selected = isControlled ? normalize(value) : internal

  const [open, setOpen] = React.useState(false)

  const anchor = selected?.start ?? (defaultMonth ? startOfDay(defaultMonth) : startOfDay(new Date()))

  const fmt = React.useMemo(
    () =>
      formatDate ??
      ((d: Date) => d.toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" })),
    [formatDate, locale]
  )

  function commit(range: DateRange) {
    if (!isControlled) setInternal(range)
    onValueChange?.(range)
    setOpen(false)
  }

  const triggerText = selected ? `${fmt(selected.start)} – ${fmt(selected.end)}` : placeholder

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            disabled={disabled}
            aria-label={label}
            aria-invalid={invalid || undefined}
            className={cn(
              "flex w-72 items-center gap-2 rounded-lg border border-border-strong bg-background px-3 text-start text-foreground transition-colors",
              "hover:border-accent-strong focus-visible:border-accent-strong focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent-soft",
              "disabled:pointer-events-none disabled:opacity-50",
              invalid && "border-destructive focus-visible:ring-destructive/30",
              shellSize[size]
            )}
          />
        }
      >
        <Calendar aria-hidden className="shrink-0 text-muted-foreground" />
        <span className={cn("flex-1 truncate", !selected && "text-muted-foreground")}>{triggerText}</span>
      </PopoverTrigger>

      <PopoverContent side="bottom" align="start">
        {/* Fresh mount per open (Popover unmounts on close) → view/focus/anchor
            state come from initializers, so no re-anchor effect is needed. */}
        <RangeCalendar
          anchor={anchor}
          selected={selected}
          minDate={minDate}
          maxDate={maxDate}
          locale={locale}
          weekStartsOn={weekStartsOn}
          onComplete={commit}
        />
      </PopoverContent>
    </Popover>
  )
}

/* ----------------------------------------------------------- range calendar -- */

type RangeCalendarProps = {
  anchor: Date
  selected: DateRange | null
  minDate?: Date
  maxDate?: Date
  locale?: string
  weekStartsOn: number
  onComplete: (range: DateRange) => void
}

function RangeCalendar({
  anchor,
  selected,
  minDate,
  maxDate,
  locale,
  weekStartsOn,
  onComplete,
}: RangeCalendarProps) {
  const [view, setView] = React.useState<Date>(makeDay(anchor.getFullYear(), anchor.getMonth(), 1))
  const [focusDay, setFocusDay] = React.useState<Date>(anchor)
  // The first endpoint of an in-progress selection (null = start a new range).
  const [anchorStart, setAnchorStart] = React.useState<Date | null>(null)
  const focusRef = React.useRef(false)
  const dayRefs = React.useRef<Map<string, HTMLButtonElement>>(new Map())

  React.useEffect(() => {
    if (!focusRef.current) return
    focusRef.current = false
    dayRefs.current.get(keyOf(focusDay))?.focus()
  }, [focusDay, view])

  const monthLabel = React.useMemo(
    () => view.toLocaleDateString(locale, { month: "long", year: "numeric" }),
    [view, locale]
  )
  const weekdays = React.useMemo(() => {
    const ref = makeDay(2024, 11, 1) // a Sunday
    return Array.from({ length: 7 }, (_, i) =>
      addDays(ref, (weekStartsOn + i) % 7).toLocaleDateString(locale, { weekday: "short" })
    )
  }, [locale, weekStartsOn])
  const grid = React.useMemo(
    () => buildMonthGrid(view.getFullYear(), view.getMonth(), weekStartsOn),
    [view, weekStartsOn]
  )
  const isDisabledDay = React.useCallback(
    (d: Date) => (minDate && isBefore(d, startOfDay(minDate))) || (maxDate && isBefore(startOfDay(maxDate), d)),
    [minDate, maxDate]
  )

  // While a start endpoint is pending, don't paint the previous committed range.
  const effectiveSelected = anchorStart ? null : selected

  function pick(day: Date) {
    const d = startOfDay(day)
    if (!anchorStart) {
      setAnchorStart(d)
      return
    }
    const range = isBefore(d, anchorStart) ? { start: d, end: anchorStart } : { start: anchorStart, end: d }
    setAnchorStart(null)
    onComplete(range)
  }

  function moveFocus(next: Date) {
    const clamped = clampDay(next, minDate, maxDate)
    focusRef.current = true
    if (clamped.getMonth() !== view.getMonth() || clamped.getFullYear() !== view.getFullYear()) {
      setView(makeDay(clamped.getFullYear(), clamped.getMonth(), 1))
    }
    setFocusDay(clamped)
  }

  function onGridKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case "ArrowRight": e.preventDefault(); moveFocus(addDays(focusDay, 1)); break
      case "ArrowLeft": e.preventDefault(); moveFocus(addDays(focusDay, -1)); break
      case "ArrowDown": e.preventDefault(); moveFocus(addDays(focusDay, 7)); break
      case "ArrowUp": e.preventDefault(); moveFocus(addDays(focusDay, -7)); break
      case "Home": e.preventDefault(); moveFocus(addDays(focusDay, -((focusDay.getDay() - weekStartsOn + 7) % 7))); break
      case "End": e.preventDefault(); moveFocus(addDays(focusDay, 6 - ((focusDay.getDay() - weekStartsOn + 7) % 7))); break
      case "PageUp": e.preventDefault(); moveFocus(addMonths(focusDay, -1)); break
      case "PageDown": e.preventDefault(); moveFocus(addMonths(focusDay, 1)); break
      case "Enter":
      case " ":
        e.preventDefault()
        if (!isDisabledDay(focusDay)) pick(focusDay)
        break
    }
  }

  return (
    <div data-slot="date-range-picker" className="flex w-64 flex-col gap-3">
      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Previous month" onClick={() => setView(addMonths(view, -1))}>
          <ChevronLeft aria-hidden className="rtl:rotate-180" />
        </Button>
        <span data-slot="date-range-picker-month" className="text-sm font-semibold text-foreground">
          {monthLabel}
        </span>
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Next month" onClick={() => setView(addMonths(view, 1))}>
          <ChevronRight aria-hidden className="rtl:rotate-180" />
        </Button>
      </div>

      <div role="grid" aria-label={monthLabel} data-slot="date-range-picker-grid" className="flex flex-col gap-1" onKeyDown={onGridKeyDown}>
        <div role="row" className="grid grid-cols-7">
          {weekdays.map((w, i) => (
            <span key={i} role="columnheader" aria-label={w} className="flex h-8 items-center justify-center text-xs font-medium text-muted-foreground">
              {w.slice(0, 2)}
            </span>
          ))}
        </div>

        {Array.from({ length: 6 }).map((_, week) => (
          <div key={week} role="row" className="grid grid-cols-7 gap-1">
            {grid.slice(week * 7, week * 7 + 7).map((day) => {
              const outside = day.getMonth() !== view.getMonth()
              const isStart = isSameDay(day, effectiveSelected?.start) || isSameDay(day, anchorStart)
              const isEnd = isSameDay(day, effectiveSelected?.end)
              const isEndpoint = isStart || isEnd
              const within = effectiveSelected ? inRange(day, effectiveSelected.start, effectiveSelected.end) : false
              const isFocusDay = isSameDay(day, focusDay)
              const dayDisabled = isDisabledDay(day)
              return (
                <button
                  key={keyOf(day)}
                  ref={(el) => {
                    if (el) dayRefs.current.set(keyOf(day), el)
                    else dayRefs.current.delete(keyOf(day))
                  }}
                  type="button"
                  role="gridcell"
                  aria-selected={isEndpoint || within}
                  aria-label={day.toLocaleDateString(locale, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                  tabIndex={isFocusDay ? 0 : -1}
                  disabled={dayDisabled}
                  data-outside={outside || undefined}
                  data-endpoint={isEndpoint || undefined}
                  data-in-range={within || undefined}
                  onClick={() => pick(day)}
                  className={cn(
                    "flex h-9 items-center justify-center rounded-md text-sm tabular-nums transition-colors outline-none",
                    "hover:bg-muted focus-visible:ring-3 focus-visible:ring-accent-soft",
                    "disabled:pointer-events-none disabled:opacity-40",
                    outside ? "text-muted-foreground" : "text-foreground",
                    within && "bg-accent-soft",
                    isEndpoint && "bg-primary text-primary-foreground hover:bg-primary"
                  )}
                >
                  {day.getDate()}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

export { DateRangePicker }
