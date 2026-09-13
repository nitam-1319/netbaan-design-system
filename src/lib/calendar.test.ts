import { describe, expect, test } from "vitest"

import {
  addCalendarMonths,
  buildCalendarGrid,
  calendarMonthLength,
  defaultWeekStart,
  formatCalendarDate,
  formatCalendarDay,
  formatCalendarMonth,
  getCalendarParts,
  isSameCalendarMonth,
  startOfCalendarMonth,
} from "./calendar"

/**
 * The Jalali (Persian) calendar is not a relabelling of the Gregorian one: its
 * months are 31/31/31/31/31/31/30/30/30/30/30/29-or-30 days and its year turns
 * on the March equinox, so a month grid built on Gregorian boundaries is wrong
 * in both its first cell and its length. These anchors are the days that expose
 * that — year starts, the leap Esfand, and the ordinary day in between — and
 * they are checked against fixed expected values rather than against `Intl`,
 * because `Intl` is the implementation.
 */

/** A local-midnight Date, the shape every function here takes and returns. */
const day = (y: number, m: number, d: number) => new Date(y, m - 1, d)

const parts = (d: Date) => {
  const p = getCalendarParts(d, "persian")
  return `${p.year}/${p.month}/${p.day}`
}

describe("reading a day in the Persian calendar", () => {
  test.each([
    ["an ordinary day", day(2026, 9, 13), "1405/6/22"],
    ["Nowruz — the year turns", day(2026, 3, 21), "1405/1/1"],
    ["the day before it is the last of Esfand", day(2026, 3, 20), "1404/12/29"],
    ["a leap year ends on Esfand 30", day(2025, 3, 20), "1403/12/30"],
    ["and the day after that is Nowruz", day(2025, 3, 21), "1404/1/1"],
  ])("%s", (_label, date, expected) => {
    expect(parts(date)).toBe(expected)
  })

  test("the Gregorian reading of the same day is unchanged", () => {
    expect(getCalendarParts(day(2026, 9, 13), "gregory")).toEqual({
      year: 2026,
      month: 9,
      day: 13,
    })
  })
})

describe("the month a day belongs to", () => {
  test("Shahrivar 1405 starts on 2026-08-23, not on the 1st of a Gregorian month", () => {
    expect(startOfCalendarMonth(day(2026, 9, 13), "persian")).toEqual(day(2026, 8, 23))
  })

  test("the first six Persian months are 31 days, the next five are 30", () => {
    expect(calendarMonthLength(day(2026, 4, 10), "persian")).toBe(31) // Farvardin
    expect(calendarMonthLength(day(2026, 9, 13), "persian")).toBe(31) // Shahrivar
    expect(calendarMonthLength(day(2026, 10, 10), "persian")).toBe(30) // Mehr
  })

  test("Esfand is 30 days in a leap year and 29 otherwise", () => {
    expect(calendarMonthLength(day(2025, 3, 10), "persian")).toBe(30) // Esfand 1403
    expect(calendarMonthLength(day(2026, 3, 10), "persian")).toBe(29) // Esfand 1404
  })

  test("Gregorian months still measure themselves", () => {
    expect(calendarMonthLength(day(2024, 2, 10), "gregory")).toBe(29)
    expect(calendarMonthLength(day(2026, 2, 10), "gregory")).toBe(28)
    expect(startOfCalendarMonth(day(2026, 9, 13), "gregory")).toEqual(day(2026, 9, 1))
  })

  test("two days in the same Persian month are only in the same Gregorian one by luck", () => {
    // Both fall in Shahrivar 1405, either side of the Gregorian month boundary.
    expect(isSameCalendarMonth(day(2026, 8, 25), day(2026, 9, 13), "persian")).toBe(true)
    expect(isSameCalendarMonth(day(2026, 8, 25), day(2026, 9, 13), "gregory")).toBe(false)
  })
})

describe("stepping a month at a time", () => {
  test("forward and back land on the same day of the neighbouring month", () => {
    expect(parts(addCalendarMonths(day(2026, 9, 13), 1, "persian"))).toBe("1405/7/22")
    expect(parts(addCalendarMonths(day(2026, 9, 13), -1, "persian"))).toBe("1405/5/22")
  })

  test("stepping off the end of the year rolls it", () => {
    // 2026-03-10 is Esfand 19, 1404 → Farvardin 19, 1405.
    expect(parts(addCalendarMonths(day(2026, 3, 10), 1, "persian"))).toBe("1405/1/19")
    // 2026-04-10 is Farvardin 21, 1405 → Esfand 21, 1404.
    expect(parts(addCalendarMonths(day(2026, 4, 10), -1, "persian"))).toBe("1404/12/21")
  })

  test("a day the target month does not have is clamped, never rolled over", () => {
    // Shahrivar 31 → Mehr has 30 days. The 31st must not become Mehr 1 of the
    // month after, which is what a naive `+1 month` on a Date does.
    expect(parts(addCalendarMonths(day(2026, 9, 22), 1, "persian"))).toBe("1405/7/30")
  })

  test("Gregorian stepping is clamped the same way", () => {
    expect(getCalendarParts(addCalendarMonths(day(2026, 1, 31), 1, "gregory"), "gregory")).toEqual({
      year: 2026,
      month: 2,
      day: 28,
    })
  })
})

describe("the 6×7 grid", () => {
  test("Persian weeks start on Saturday by default; Gregorian on Sunday", () => {
    expect(defaultWeekStart("persian")).toBe(6)
    expect(defaultWeekStart("gregory")).toBe(0)
  })

  test("it is 42 days, the first cell is the week start, and it covers the month", () => {
    const grid = buildCalendarGrid(day(2026, 9, 13), "persian", 6)

    expect(grid).toHaveLength(42)
    expect(grid[0].getDay()).toBe(6)
    // Shahrivar 1405 starts on Sunday 2026-08-23, so the grid opens on the
    // Saturday before it and the month's own first day is the second cell.
    expect(grid[0]).toEqual(day(2026, 8, 22))
    expect(grid[1]).toEqual(day(2026, 8, 23))
    expect(grid[31]).toEqual(day(2026, 9, 22)) // Shahrivar 31, the last day
  })

  test("the cells before the first of the month belong to the month before", () => {
    // Mehr 1405 starts on Wednesday 2026-09-23, so four cells of Shahrivar —
    // which has 31 days, a length no Gregorian month shares with it — lead in.
    const grid = buildCalendarGrid(day(2026, 10, 10), "persian", 6)
    expect(parts(grid[0])).toBe("1405/6/28")
    expect(parts(grid[3])).toBe("1405/6/31")
    expect(parts(grid[4])).toBe("1405/7/1")
  })

  test("a Gregorian grid is unchanged", () => {
    const grid = buildCalendarGrid(day(2026, 9, 13), "gregory", 0)
    expect(grid).toHaveLength(42)
    expect(grid[0]).toEqual(day(2026, 8, 30)) // 2026-09-01 is a Tuesday
  })
})

describe("what the calendar prints", () => {
  test("a Persian month is named in Persian, with Persian digits", () => {
    expect(formatCalendarMonth(day(2026, 9, 13), "persian", "fa-IR")).toBe("شهریور ۱۴۰۵")
    expect(formatCalendarDay(day(2026, 9, 13), "persian", "fa-IR")).toBe("۲۲")
  })

  test("the calendar wins over the locale's own default", () => {
    // `fa-IR`'s default calendar IS Persian, so a Gregorian grid asking for a
    // month name gets a PERSIAN month back unless the calendar is stated — the
    // exact mismatch that made a `locale="fa"` date picker unreadable.
    expect(formatCalendarMonth(day(2026, 9, 13), "gregory", "fa-IR")).toBe("سپتامبر ۲۰۲۶")
  })

  test("English names a Persian month too, rather than falling back to Gregorian", () => {
    // No era: ICU appends "AP" to a non-Gregorian year in English, which is
    // correct and which nothing wants in a calendar heading.
    expect(formatCalendarMonth(day(2026, 9, 13), "persian", "en-US")).toBe("Shahrivar 1405")
    expect(formatCalendarDate(day(2026, 9, 13), "persian", "en-US")).not.toContain("AP")
  })

  test("the month comes before the year, which is not what ICU's Persian pattern does", () => {
    // ICU formats fa's year-month skeleton as `۱۴۰۵ شهریور`. No Persian wall
    // calendar heads a month that way, so the heading is composed instead.
    const heading = formatCalendarMonth(day(2026, 9, 13), "persian", "fa-IR")
    expect(heading.indexOf("شهریور")).toBeLessThan(heading.indexOf("۱۴۰۵"))
  })
})
