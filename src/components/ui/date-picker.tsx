"use client";

import * as React from "react"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  addCalendarMonths,
  addDays,
  buildCalendarGrid,
  defaultWeekStart,
  formatCalendarDate,
  formatCalendarDay,
  formatCalendarDayLabel,
  formatCalendarMonth,
  isSameCalendarMonth,
  isSameDay,
  startOfCalendarMonth,
  startOfDay,
  weekdayHeaders,
  type CalendarId,
} from "@/lib/calendar"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

/**
 * AEGIS — Date Picker (Inputs)
 *
 * A single-date field: an AEGIS Input-shell trigger (leading calendar glyph,
 * formatted value) that opens a `Popover` holding a self-contained month
 * calendar. Base UI ships no calendar primitive, so the grid is built from
 * scratch — a real `role="grid"` of day buttons with month navigation and
 * arrow-key roving focus — mirroring how `Rating` / `Tree View` implement their
 * own keyboard model. It composes the AEGIS `Popover` and `Button`, and wears
 * the same shell (resting `border-strong`, `accent-strong` hover, 3px
 * `accent-soft` focus ring, 32 / 40 / 48px scale) as the other inputs.
 *
 * You own the value; the picker emits a `Date` (local midnight) on selection and
 * closes. Controlled (`value` + `onValueChange`) and uncontrolled
 * (`defaultValue`) are both supported. Public API is CLOSED — no `className` /
 * `style`. Colour is token-only. See `.agent/rules/API_RULES.md`.
 */

/* -------------------------------------------------------------- date utils -- */

/*
 * Day arithmetic — `makeDay` / `startOfDay` / `addDays` / `isSameDay` — and
 * everything that groups days into months lives in `@/lib/calendar`, because a
 * month is a question about a CALENDAR and this control draws two of them. See
 * that module for why Jalali is day-walking rather than a conversion.
 */

function isBefore(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() < startOfDay(b).getTime()
}

function clampDay(d: Date, min?: Date, max?: Date): Date {
  if (min && isBefore(d, min)) return startOfDay(min)
  if (max && isBefore(max, d)) return startOfDay(max)
  return d
}

/* -------------------------------------------------------------------- types -- */

export type DatePickerSize = "sm" | "md" | "lg"

export interface DatePickerProps {
  /** Controlled selected date (`null` = none). */
  value?: Date | null
  /** Uncontrolled initial date. */
  defaultValue?: Date | null
  /** Fires with the selected date (or `null` if cleared). */
  onValueChange?: (date: Date | null) => void
  /** Month shown when first opened with no value. Defaults to today. */
  defaultMonth?: Date
  /** Earliest selectable day (inclusive). */
  minDate?: Date
  /** Latest selectable day (inclusive). */
  maxDate?: Date
  /** Trigger placeholder when no date is chosen. Default "Pick a date". */
  placeholder?: string
  /** Accessible label for the trigger. Default "Choose date". */
  label?: string
  /** BCP-47 locale for month / weekday / value formatting. Default the runtime's. */
  locale?: string
  /**
   * The calendar system the grid is DRAWN in. Default `"gregory"`.
   *
   * Stated rather than inferred from `locale`, because the two are independent
   * choices and inferring gets it wrong in both directions: a locale carries a
   * default calendar, and `fa`'s is Persian, so `locale="fa"` alone used to
   * paint Persian month names over Gregorian month boundaries — a calendar that
   * is wrong in its heading, its first cell and its length, and that reads as a
   * bug to anyone who can use it. `calendar="persian"` draws a true Jalali
   * month: 31-day months through Shahrivar, a 29-or-30-day Esfand, the year
   * turning at Nowruz, and Saturday-first columns.
   *
   * The VALUE is unaffected. `value` / `onValueChange` are `Date`s in both
   * calendars, because a `Date` is an instant, not a notation — so a page that
   * sends `YYYY-MM-DD` to a backend keeps sending the Gregorian one, and the
   * calendar stays a display concern.
   */
  calendar?: CalendarId
  /**
   * First day of the week (0 = Sunday … 6 = Saturday). Defaults to the
   * calendar's own: Saturday for Persian, Sunday for Gregorian.
   */
  weekStartsOn?: number
  /** Format the value shown in the trigger. Default a medium date in `calendar`. */
  formatDate?: (date: Date) => string
  /** Trigger size. Default "md". */
  size?: DatePickerSize
  /** Disable the whole control. */
  disabled?: boolean
  /** Mark the field invalid (paints the shell + sets `aria-invalid`). */
  invalid?: boolean
  /** Accessible name for the back-a-month button. Default "Previous month". */
  previousMonthLabel?: string
  /** Accessible name for the forward-a-month button. Default "Next month". */
  nextMonthLabel?: string
}

const shellSize: Record<DatePickerSize, string> = {
  sm: "h-8 text-[0.8rem] [&_svg]:size-3.5",
  md: "h-10 text-sm [&_svg]:size-4",
  lg: "h-12 text-base [&_svg]:size-5",
}

/* --------------------------------------------------------------------- root -- */

function DatePicker({
  value,
  defaultValue = null,
  onValueChange,
  defaultMonth,
  minDate,
  maxDate,
  placeholder = "Pick a date",
  label = "Choose date",
  locale,
  calendar = "gregory",
  weekStartsOn = defaultWeekStart(calendar),
  formatDate,
  size = "md",
  disabled = false,
  invalid = false,
  previousMonthLabel = "Previous month",
  nextMonthLabel = "Next month",
}: DatePickerProps) {
  const isControlled = value !== undefined
  const [internal, setInternal] = React.useState<Date | null>(
    defaultValue ? startOfDay(defaultValue) : null
  )
  const selected = isControlled ? (value ? startOfDay(value) : null) : internal

  const [open, setOpen] = React.useState(false)

  const anchor = selected ?? (defaultMonth ? startOfDay(defaultMonth) : startOfDay(new Date()))

  const fmt = React.useMemo(
    () => formatDate ?? ((d: Date) => formatCalendarDate(d, calendar, locale)),
    [formatDate, locale, calendar]
  )

  function commit(next: Date) {
    const day = startOfDay(next)
    if (!isControlled) setInternal(day)
    onValueChange?.(day)
    setOpen(false)
  }

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
              "flex w-56 items-center gap-2 rounded-lg border border-border-strong bg-background px-3 text-start text-foreground transition-colors",
              "hover:border-accent-strong focus-visible:border-accent-strong focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent-soft",
              "disabled:pointer-events-none disabled:opacity-50",
              invalid && "border-destructive focus-visible:ring-destructive/30",
              shellSize[size]
            )}
          />
        }
      >
        <Calendar aria-hidden className="shrink-0 text-muted-foreground" />
        <span className={cn("flex-1 truncate", !selected && "text-muted-foreground")}>
          {selected ? fmt(selected) : placeholder}
        </span>
      </PopoverTrigger>

      <PopoverContent side="bottom" align="start">
        {/* Fresh mount per open (Popover unmounts on close) → initial view/focus
            come from state initializers, so no re-anchor effect is needed. */}
        <MonthCalendar
          anchor={anchor}
          selected={selected}
          minDate={minDate}
          maxDate={maxDate}
          locale={locale}
          calendar={calendar}
          weekStartsOn={weekStartsOn}
          previousMonthLabel={previousMonthLabel}
          nextMonthLabel={nextMonthLabel}
          onSelect={commit}
        />
      </PopoverContent>
    </Popover>
  )
}

/* ----------------------------------------------------------- month calendar -- */

type MonthCalendarProps = {
  anchor: Date
  selected: Date | null
  minDate?: Date
  maxDate?: Date
  locale?: string
  calendar: CalendarId
  weekStartsOn: number
  previousMonthLabel: string
  nextMonthLabel: string
  onSelect: (day: Date) => void
}

function MonthCalendar({
  anchor,
  selected,
  minDate,
  maxDate,
  locale,
  calendar,
  weekStartsOn,
  previousMonthLabel,
  nextMonthLabel,
  onSelect,
}: MonthCalendarProps) {
  // `view` is the FIRST DAY of the displayed month, not a (year, month) pair —
  // a Jalali month has no Gregorian month number to hold, and the first day is
  // the one thing both calendars can name.
  const [view, setView] = React.useState<Date>(startOfCalendarMonth(anchor, calendar))
  const [focusDay, setFocusDay] = React.useState<Date>(anchor)
  const focusRef = React.useRef(false)
  const dayRefs = React.useRef<Map<string, HTMLButtonElement>>(new Map())

  // After a keyboard move, focus the button for the focused day (DOM effect only).
  React.useEffect(() => {
    if (!focusRef.current) return
    focusRef.current = false
    dayRefs.current.get(keyOf(focusDay))?.focus()
  }, [focusDay, view])

  const monthLabel = React.useMemo(
    () => formatCalendarMonth(view, calendar, locale),
    [view, calendar, locale]
  )
  const weekdays = React.useMemo(
    () => weekdayHeaders(calendar, weekStartsOn, locale),
    [calendar, locale, weekStartsOn]
  )
  const grid = React.useMemo(
    () => buildCalendarGrid(view, calendar, weekStartsOn),
    [view, calendar, weekStartsOn]
  )
  const isDisabledDay = React.useCallback(
    (d: Date) => (minDate && isBefore(d, startOfDay(minDate))) || (maxDate && isBefore(startOfDay(maxDate), d)),
    [minDate, maxDate]
  )

  function moveFocus(next: Date) {
    const clamped = clampDay(next, minDate, maxDate)
    focusRef.current = true
    if (!isSameCalendarMonth(clamped, view, calendar)) {
      setView(startOfCalendarMonth(clamped, calendar))
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
      case "PageUp": e.preventDefault(); moveFocus(addCalendarMonths(focusDay, -1, calendar)); break
      case "PageDown": e.preventDefault(); moveFocus(addCalendarMonths(focusDay, 1, calendar)); break
      case "Enter":
      case " ":
        e.preventDefault()
        if (!isDisabledDay(focusDay)) onSelect(focusDay)
        break
    }
  }

  return (
    <div data-slot="date-picker" className="flex w-64 flex-col gap-3">
      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" size="icon-sm" aria-label={previousMonthLabel} onClick={() => setView(addCalendarMonths(view, -1, calendar))}>
          <ChevronLeft aria-hidden className="rtl:rotate-180" />
        </Button>
        <span data-slot="date-picker-month" className="text-sm font-semibold text-foreground">
          {monthLabel}
        </span>
        <Button type="button" variant="ghost" size="icon-sm" aria-label={nextMonthLabel} onClick={() => setView(addCalendarMonths(view, 1, calendar))}>
          <ChevronRight aria-hidden className="rtl:rotate-180" />
        </Button>
      </div>

      <div role="grid" aria-label={monthLabel} data-slot="date-picker-grid" className="flex flex-col gap-1" onKeyDown={onGridKeyDown}>
        <div role="row" className="grid grid-cols-7">
          {weekdays.map((w, i) => (
            <span key={i} role="columnheader" aria-label={w.name} className="flex h-8 items-center justify-center text-xs font-medium text-muted-foreground">
              {w.short}
            </span>
          ))}
        </div>

        {Array.from({ length: 6 }).map((_, week) => (
          <div key={week} role="row" className="grid grid-cols-7 gap-1">
            {grid.slice(week * 7, week * 7 + 7).map((day) => {
              const outside = !isSameCalendarMonth(day, view, calendar)
              const isSelected = isSameDay(day, selected)
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
                  aria-selected={isSelected}
                  aria-label={formatCalendarDayLabel(day, calendar, locale)}
                  tabIndex={isFocusDay ? 0 : -1}
                  disabled={dayDisabled}
                  data-outside={outside || undefined}
                  data-selected={isSelected || undefined}
                  onClick={() => onSelect(day)}
                  className={cn(
                    "flex h-9 items-center justify-center rounded-md text-sm tabular-nums transition-colors outline-none",
                    "hover:bg-muted focus-visible:ring-3 focus-visible:ring-accent-soft",
                    "disabled:pointer-events-none disabled:opacity-40",
                    outside ? "text-muted-foreground" : "text-foreground",
                    isSelected && "bg-primary text-primary-foreground hover:bg-primary"
                  )}
                >
                  {formatCalendarDay(day, calendar, locale)}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

function keyOf(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

export { DatePicker }
