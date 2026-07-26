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

/** Local-midnight Date for a y/m/d, so values never carry a time or drift by tz. */
function makeDay(year: number, month: number, day: number): Date {
  return new Date(year, month, day, 0, 0, 0, 0)
}

function startOfDay(d: Date): Date {
  return makeDay(d.getFullYear(), d.getMonth(), d.getDate())
}

function isSameDay(a: Date | null | undefined, b: Date | null | undefined): boolean {
  if (!a || !b) return false
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function addDays(d: Date, n: number): Date {
  return makeDay(d.getFullYear(), d.getMonth(), d.getDate() + n)
}

function addMonths(d: Date, n: number): Date {
  return makeDay(d.getFullYear(), d.getMonth() + n, 1)
}

function isBefore(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() < startOfDay(b).getTime()
}

function clampDay(d: Date, min?: Date, max?: Date): Date {
  if (min && isBefore(d, min)) return startOfDay(min)
  if (max && isBefore(max, d)) return startOfDay(max)
  return d
}

/** The 6×7 grid of days for a displayed month, aligned to `weekStartsOn`. */
function buildMonthGrid(viewYear: number, viewMonth: number, weekStartsOn: number): Date[] {
  const first = makeDay(viewYear, viewMonth, 1)
  const offset = (first.getDay() - weekStartsOn + 7) % 7
  const gridStart = addDays(first, -offset)
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i))
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
  /** First day of the week (0 = Sunday … 6 = Saturday). Default 0. */
  weekStartsOn?: number
  /** Format the value shown in the trigger. Default a medium local date. */
  formatDate?: (date: Date) => string
  /** Trigger size. Default "md". */
  size?: DatePickerSize
  /** Disable the whole control. */
  disabled?: boolean
  /** Mark the field invalid (paints the shell + sets `aria-invalid`). */
  invalid?: boolean
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
  weekStartsOn = 0,
  formatDate,
  size = "md",
  disabled = false,
  invalid = false,
}: DatePickerProps) {
  const isControlled = value !== undefined
  const [internal, setInternal] = React.useState<Date | null>(
    defaultValue ? startOfDay(defaultValue) : null
  )
  const selected = isControlled ? (value ? startOfDay(value) : null) : internal

  const [open, setOpen] = React.useState(false)

  const anchor = selected ?? (defaultMonth ? startOfDay(defaultMonth) : startOfDay(new Date()))
  const [view, setView] = React.useState<Date>(makeDay(anchor.getFullYear(), anchor.getMonth(), 1))
  const [focusDay, setFocusDay] = React.useState<Date>(anchor)
  const focusRef = React.useRef(false)
  const dayRefs = React.useRef<Map<string, HTMLButtonElement>>(new Map())

  // Re-anchor the view + keyboard focus to the selection each time the popover opens.
  React.useEffect(() => {
    if (!open) return
    const a = selected ?? (defaultMonth ? startOfDay(defaultMonth) : startOfDay(new Date()))
    setView(makeDay(a.getFullYear(), a.getMonth(), 1))
    setFocusDay(a)
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  // After a keyboard move, focus the button for the focused day.
  React.useEffect(() => {
    if (!open || !focusRef.current) return
    focusRef.current = false
    const key = keyOf(focusDay)
    dayRefs.current.get(key)?.focus()
  }, [focusDay, view, open])

  const fmt = React.useMemo(
    () =>
      formatDate ??
      ((d: Date) => d.toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" })),
    [formatDate, locale]
  )

  const monthLabel = React.useMemo(
    () => view.toLocaleDateString(locale, { month: "long", year: "numeric" }),
    [view, locale]
  )

  const weekdays = React.useMemo(() => {
    // Any Sunday as a reference, then rotate to `weekStartsOn`.
    const ref = makeDay(2024, 11, 1) // 2024-12-01 is a Sunday
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

  function commit(next: Date) {
    const day = startOfDay(next)
    if (!isControlled) setInternal(day)
    onValueChange?.(day)
    setOpen(false)
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
      case "ArrowRight":
        e.preventDefault(); moveFocus(addDays(focusDay, 1)); break
      case "ArrowLeft":
        e.preventDefault(); moveFocus(addDays(focusDay, -1)); break
      case "ArrowDown":
        e.preventDefault(); moveFocus(addDays(focusDay, 7)); break
      case "ArrowUp":
        e.preventDefault(); moveFocus(addDays(focusDay, -7)); break
      case "Home":
        e.preventDefault(); moveFocus(addDays(focusDay, -((focusDay.getDay() - weekStartsOn + 7) % 7))); break
      case "End":
        e.preventDefault(); moveFocus(addDays(focusDay, 6 - ((focusDay.getDay() - weekStartsOn + 7) % 7))); break
      case "PageUp":
        e.preventDefault(); moveFocus(addMonths(focusDay, -1)); break
      case "PageDown":
        e.preventDefault(); moveFocus(addMonths(focusDay, 1)); break
      case "Enter":
      case " ":
        e.preventDefault()
        if (!isDisabledDay(focusDay)) commit(focusDay)
        break
    }
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
        <div data-slot="date-picker" className="flex w-64 flex-col gap-3">
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Previous month"
              onClick={() => setView(addMonths(view, -1))}
            >
              <ChevronLeft aria-hidden className="rtl:rotate-180" />
            </Button>
            <span data-slot="date-picker-month" className="text-sm font-semibold text-foreground">
              {monthLabel}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Next month"
              onClick={() => setView(addMonths(view, 1))}
            >
              <ChevronRight aria-hidden className="rtl:rotate-180" />
            </Button>
          </div>

          <div
            role="grid"
            aria-label={monthLabel}
            data-slot="date-picker-grid"
            className="flex flex-col gap-1"
            onKeyDown={onGridKeyDown}
          >
            <div role="row" className="grid grid-cols-7">
              {weekdays.map((w, i) => (
                <span
                  key={i}
                  role="columnheader"
                  aria-label={w}
                  className="flex h-8 items-center justify-center text-xs font-medium text-muted-foreground"
                >
                  {w.slice(0, 2)}
                </span>
              ))}
            </div>

            {Array.from({ length: 6 }).map((_, week) => (
              <div key={week} role="row" className="grid grid-cols-7 gap-1">
                {grid.slice(week * 7, week * 7 + 7).map((day) => {
                  const outside = day.getMonth() !== view.getMonth()
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
                      aria-label={day.toLocaleDateString(locale, {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                      tabIndex={isFocusDay ? 0 : -1}
                      disabled={dayDisabled}
                      data-outside={outside || undefined}
                      data-selected={isSelected || undefined}
                      onClick={() => commit(day)}
                      className={cn(
                        "flex h-9 items-center justify-center rounded-md text-sm tabular-nums transition-colors outline-none",
                        "hover:bg-muted focus-visible:ring-3 focus-visible:ring-accent-soft",
                        "disabled:pointer-events-none disabled:opacity-40",
                        outside && "text-muted-foreground",
                        !outside && "text-foreground",
                        isSelected && "bg-primary text-primary-foreground hover:bg-primary"
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
      </PopoverContent>
    </Popover>
  )
}

function keyOf(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

export { DatePicker }
