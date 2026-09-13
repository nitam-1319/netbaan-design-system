/** @internal — not part of the public API; may change without a major bump. */

/**
 * AEGIS — calendar arithmetic for the date controls.
 *
 * A date control has to do two things a `Date` alone cannot: lay a month out as
 * a grid, and step a month at a time. Both are questions about a CALENDAR, and
 * the Gregorian answer is wired into `Date` itself — `getMonth()`, `getDate()`,
 * `new Date(y, m, 1)`. For Persian (Jalali) there is no such method, and the
 * differences are not cosmetic: Jalali months run 31/31/31/31/31/31/30/30/30/30/
 * 30/29-or-30 days and the year turns on the March equinox, so a Gregorian grid
 * wearing Persian month names is wrong in its first cell, its length, and its
 * heading. That combination — Persian names over a Gregorian grid — is exactly
 * what `locale="fa"` used to produce, which is why the calendar is now a stated
 * parameter rather than something inferred from the locale.
 *
 * The whole module rests on one observation: every calendar agrees about DAYS.
 * They disagree only about how days are grouped, so all the arithmetic here is
 * day-walking on a `Date` plus ONE primitive — "what is this day called in that
 * calendar" — which `Intl` answers authoritatively for every calendar it ships.
 * Nothing converts in the other direction, so there is no hand-rolled leap rule
 * to drift out of step with the platform's: the first of a month is found by
 * walking back `day - 1` days, its length by walking forward to the next first,
 * and the previous month by stepping one day back off the first. That is also
 * why no separate Jalali library is needed.
 *
 * Days are LOCAL midnight throughout, the same convention the pickers use, so a
 * value never carries a time or drifts across a timezone. Day arithmetic goes
 * through `makeDay` rather than adding milliseconds, so a DST transition cannot
 * move a result by a day.
 */

/** The calendar systems the date controls can draw. */
export type CalendarId = "gregory" | "persian"

/** A day as its own calendar names it. `month` is 1-based, as people write it. */
export interface CalendarParts {
  year: number
  month: number
  day: number
}

const MS_PER_DAY = 86_400_000

/* ------------------------------------------------------------- day walking -- */

/** Local-midnight Date for a y/m/d, normalising overflow (month 12 → next Jan). */
export function makeDay(year: number, month: number, day: number): Date {
  return new Date(year, month, day, 0, 0, 0, 0)
}

export function startOfDay(d: Date): Date {
  return makeDay(d.getFullYear(), d.getMonth(), d.getDate())
}

export function addDays(d: Date, n: number): Date {
  return makeDay(d.getFullYear(), d.getMonth(), d.getDate() + n)
}

export function isSameDay(a: Date | null | undefined, b: Date | null | undefined): boolean {
  if (!a || !b) return false
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/**
 * Whole days between two local midnights.
 *
 * Rounded rather than truncated because a DST boundary makes one of the days 23
 * or 25 hours long, and a truncating divide would report that span as one day
 * short.
 */
function daysBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY)
}

/* --------------------------------------------------------- naming a day ----- */

/**
 * `Intl.DateTimeFormat` is expensive to construct and this is called per grid
 * cell, so one formatter is kept per (locale, calendar, shape).
 */
const formatterCache = new Map<string, Intl.DateTimeFormat>()

function formatter(locale: string | undefined, options: Intl.DateTimeFormatOptions) {
  const key = `${locale ?? ""}|${JSON.stringify(options)}`
  let f = formatterCache.get(key)
  if (!f) {
    f = new Intl.DateTimeFormat(locale, options)
    formatterCache.set(key, f)
  }
  return f
}

/**
 * The day as its calendar names it.
 *
 * Gregorian reads straight off the `Date` — no `Intl`, so the default calendar
 * costs nothing and behaves exactly as it did before this module existed.
 * Persian goes through `Intl` in the `en` locale with Latin digits, because the
 * numbers here are arithmetic, not display: the same day is formatted for the
 * user separately, in the app's own locale and numbering system.
 */
export function getCalendarParts(date: Date, calendar: CalendarId): CalendarParts {
  if (calendar === "gregory") {
    return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() }
  }
  const parts = formatter("en-u-ca-persian-nu-latn", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(date)
  let year = 0
  let month = 0
  let day = 0
  for (const part of parts) {
    if (part.type === "year") year = Number.parseInt(part.value, 10)
    else if (part.type === "month") month = Number.parseInt(part.value, 10)
    else if (part.type === "day") day = Number.parseInt(part.value, 10)
  }
  return { year, month, day }
}

/* --------------------------------------------------------------- months ----- */

/** The first day of the calendar month `date` falls in. */
export function startOfCalendarMonth(date: Date, calendar: CalendarId): Date {
  const { day } = getCalendarParts(date, calendar)
  return addDays(startOfDay(date), -(day - 1))
}

/** The first day of the NEXT calendar month — one day past the month's last. */
function startOfNextCalendarMonth(date: Date, calendar: CalendarId): Date {
  const first = startOfCalendarMonth(date, calendar)
  // No calendar here has a month longer than 31 days, so 32 days on from the
  // first is always inside the next month, whatever its length.
  return startOfCalendarMonth(addDays(first, 32), calendar)
}

/** How many days the calendar month `date` falls in has. */
export function calendarMonthLength(date: Date, calendar: CalendarId): number {
  const first = startOfCalendarMonth(date, calendar)
  return daysBetween(first, startOfNextCalendarMonth(first, calendar))
}

/** Whether two days fall in the same month OF THAT CALENDAR. */
export function isSameCalendarMonth(a: Date, b: Date, calendar: CalendarId): boolean {
  const pa = getCalendarParts(a, calendar)
  const pb = getCalendarParts(b, calendar)
  return pa.year === pb.year && pa.month === pb.month
}

/**
 * `n` calendar months on from `date`, keeping the day of the month.
 *
 * A day the target month does not have is CLAMPED to that month's last day —
 * Shahrivar 31 a month on is Mehr 30, not Aban 1. Rolling over is what makes a
 * `PageDown` through a calendar skip a month, and it is the default behaviour of
 * `new Date(y, m + 1, d)`.
 *
 * The step itself walks month starts rather than doing arithmetic on month
 * numbers, so a year boundary needs no special case: the day before a month's
 * first is the last day of the month before it, whatever either is called.
 */
export function addCalendarMonths(date: Date, n: number, calendar: CalendarId): Date {
  const { day } = getCalendarParts(date, calendar)
  let first = startOfCalendarMonth(date, calendar)
  for (let i = 0; i < Math.abs(n); i++) {
    first =
      n > 0
        ? startOfNextCalendarMonth(first, calendar)
        : startOfCalendarMonth(addDays(first, -1), calendar)
  }
  return addDays(first, Math.min(day, calendarMonthLength(first, calendar)) - 1)
}

/* ----------------------------------------------------------------- weeks ----- */

/**
 * The day the week starts on for a calendar: Saturday (6) for Persian, Sunday
 * (0) for Gregorian.
 *
 * A Persian calendar whose columns ran Sunday-first would put شنبه — the day
 * the Iranian week begins, and the day the word "شنبه" is named for — at the far
 * end of the row, which reads as an off-by-one to anyone using it.
 */
export function defaultWeekStart(calendar: CalendarId): number {
  return calendar === "persian" ? 6 : 0
}

/**
 * The 6×7 grid of days for the calendar month `anchor` falls in, aligned so the
 * first column is `weekStartsOn`.
 *
 * Always 42 cells, so the calendar does not change height as the user pages
 * through months. Weekdays are calendar-independent — `getDay()` is the same
 * Saturday in both systems — so only the month's first day has to come from the
 * calendar.
 */
export function buildCalendarGrid(
  anchor: Date,
  calendar: CalendarId,
  weekStartsOn: number
): Date[] {
  const first = startOfCalendarMonth(anchor, calendar)
  const offset = (first.getDay() - weekStartsOn + 7) % 7
  const start = addDays(first, -offset)
  return Array.from({ length: 42 }, (_, i) => addDays(start, i))
}

/* ------------------------------------------------------------- formatting -- */

/**
 * Every formatter states its `calendar` rather than letting the locale pick.
 *
 * A locale carries a default calendar, and `fa`'s IS Persian — so a Gregorian
 * grid that asked `fa-IR` for a month name got "شهریور" over September's days.
 * Stating it makes the two agree in both directions: a Persian grid is named in
 * Persian months even in English, and a Gregorian grid stays Gregorian even in
 * Persian.
 */

/**
 * Everything but the era.
 *
 * A non-Gregorian calendar formatted in English carries one — `Shahrivar 1405
 * AP` — which is correct and which nobody wants in a calendar heading. It is
 * dropped as a PART rather than by string surgery, so the separators around it
 * go with it and no locale's punctuation has to be guessed at.
 */
function withoutEra(parts: Intl.DateTimeFormatPart[]): string {
  return parts
    .filter((p) => p.type !== "era")
    .map((p) => p.value)
    .join("")
    .trim()
    .replace(/^[,،\s]+|[,،\s]+$/g, "")
}

/**
 * The heading over a month grid, e.g. `شهریور ۱۴۰۵` / `September 2026`.
 *
 * Composed from the month and year parts rather than taken as ICU formats it,
 * because ICU's Persian year-month pattern puts the YEAR first (`۱۴۰۵ شهریور`),
 * which no Persian wall calendar does. Month-then-year is the convention in both
 * languages, and composing it also makes the heading stable across the ICU
 * versions of the browsers this ships to.
 */
export function formatCalendarMonth(
  date: Date,
  calendar: CalendarId,
  locale?: string
): string {
  const parts = formatter(locale, {
    calendar,
    month: "long",
    year: "numeric",
  }).formatToParts(date)
  const month = parts.find((p) => p.type === "month")?.value ?? ""
  const year = parts.find((p) => p.type === "year")?.value ?? ""
  return `${month} ${year}`.trim()
}

/** The number in a day cell, in the locale's own digits. */
export function formatCalendarDay(date: Date, calendar: CalendarId, locale?: string): string {
  return formatter(locale, { calendar, day: "numeric" }).format(date)
}

/** A whole day, for a trigger's value — e.g. `۲۲ شهریور ۱۴۰۵`. */
export function formatCalendarDate(date: Date, calendar: CalendarId, locale?: string): string {
  return withoutEra(
    formatter(locale, {
      calendar,
      year: "numeric",
      month: "short",
      day: "numeric",
    }).formatToParts(date)
  )
}

/** A day spelled out, for a cell's accessible name. */
export function formatCalendarDayLabel(
  date: Date,
  calendar: CalendarId,
  locale?: string
): string {
  return withoutEra(
    formatter(locale, {
      calendar,
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).formatToParts(date)
  )
}

/**
 * The seven column headers, from `weekStartsOn`.
 *
 * `name` is the full weekday for the column's accessible name; `short` is what
 * is painted. Latin scripts abbreviate well by truncation — "Su", "Mo" — but
 * Persian does not: `یکشنبه` cut to two characters is `یک`, a word on its own.
 * Persian calendars use the single-letter forms, which is what `narrow` gives.
 */
export function weekdayHeaders(
  calendar: CalendarId,
  weekStartsOn: number,
  locale?: string
): Array<{ name: string; short: string }> {
  const reference = makeDay(2024, 11, 1) // 2024-12-01, a Sunday
  return Array.from({ length: 7 }, (_, i) => {
    const d = addDays(reference, (weekStartsOn + i) % 7)
    const name = formatter(locale, { weekday: "long" }).format(d)
    const short =
      calendar === "persian"
        ? formatter(locale, { weekday: "narrow" }).format(d)
        : formatter(locale, { weekday: "short" }).format(d).slice(0, 2)
    return { name, short }
  })
}
