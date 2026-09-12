import type { Meta, StoryObj } from "@storybook/react-vite"
import * as React from "react"
import { expect, userEvent, waitFor, within } from "storybook/test"

import { FilterBar } from "@/components/ui/filter-bar"
import type {
  FilterBarFacet,
  FilterBarValue,
} from "@/components/ui/filter-bar"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */
const meta = {
  title: "Components/FilterBar",
  component: FilterBar,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
} satisfies Meta<typeof FilterBar>

export default meta
type Story = StoryObj<typeof meta>

const VULN_FACETS: FilterBarFacet[] = [
  {
    id: "severity",
    label: "Severity",
    type: "multi",
    options: [
      { value: "critical", label: "Critical", count: 2 },
      { value: "high", label: "High", count: 2 },
      { value: "medium", label: "Medium", count: 2 },
      { value: "low", label: "Low", count: 2 },
    ],
  },
  {
    id: "status",
    label: "Status",
    type: "multi",
    options: [
      { value: "open", label: "Open", count: 5 },
      { value: "triaged", label: "Triaged", count: 2 },
      { value: "resolved", label: "Resolved", count: 1 },
    ],
  },
  {
    id: "sensor",
    label: "Sensor",
    type: "multi",
    searchable: true,
    options: [
      { value: "nuclei", label: "Nuclei", count: 4 },
      { value: "zap", label: "ZAP", count: 2 },
      { value: "manual", label: "Manual", count: 2 },
    ],
  },
  {
    id: "tag",
    label: "Tag",
    type: "multi",
    searchable: true,
    options: [
      { value: "external", label: "External", count: 4 },
      { value: "web", label: "Web", count: 3 },
      { value: "exploited", label: "Exploited", count: 2 },
      { value: "internal", label: "Internal", count: 1 },
    ],
  },
  { id: "discovered", label: "Discovered", type: "date" },
  {
    id: "host",
    label: "Host contains",
    type: "text",
    placeholder: "api.example",
  },
]

function Demo({
  facets = VULN_FACETS,
  initial = {},
  loading,
  error,
  formatCount,
}: {
  facets?: FilterBarFacet[]
  initial?: Record<string, FilterBarValue>
  loading?: boolean
  error?: boolean
  formatCount?: (value: number) => string
}) {
  const [values, setValues] =
    React.useState<Record<string, FilterBarValue>>(initial)
  const [search, setSearch] = React.useState("")

  return (
    <FilterBar
      facets={facets}
      values={values}
      onChange={(id, value) => setValues((prev) => ({ ...prev, [id]: value }))}
      onClear={() => setValues({})}
      search={search}
      onSearch={setSearch}
      searchPlaceholder="Search title, CVE, host"
      resultLine="8 findings"
      onCopyLink={() => {}}
      loading={loading}
      error={error}
      formatCount={formatCount}
    />
  )
}

export const Vulnerabilities: Story = {
  args: {
    facets: VULN_FACETS,
    values: {},
    onChange: () => {},
    onClear: () => {},
    search: "",
    onSearch: () => {},
  },
  render: () => <Demo />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("the bar starts unfiltered", async () => {
      await expect(canvas.getByText("No filters applied")).toBeVisible()
    })

    await step("the panel opens and shows the first facet", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /Filters/ }))
      const panel = within(await screenBody())
      // "Severity" appears twice once the panel is open — the rail entry and
      // the pane header — so the query is anchored to the rail button, which
      // is also what carries the selected state.
      await waitFor(() =>
        expect(
          panel.getByRole("button", { name: "Severity" })
        ).toHaveAttribute("aria-current", "true")
      )
    })

    await step("checking an option updates the summary", async () => {
      const panel = within(await screenBody())
      await userEvent.click(panel.getByRole("checkbox", { name: /Critical/ }))
      await waitFor(() =>
        expect(canvas.getByText(/1 filter · severity/)).toBeVisible()
      )
    })
  },
}

/** The panel is portalled, so its contents live outside the story canvas. */
async function screenBody() {
  return document.body
}

export const WithSelection: Story = {
  args: {
    facets: VULN_FACETS,
    values: {},
    onChange: () => {},
    onClear: () => {},
    search: "",
    onSearch: () => {},
  },
  render: () => (
    <Demo initial={{ severity: ["critical", "high"], tag: ["external"] }} />
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: /Filters/ }))
    const panel = within(await screenBody())

    await step("the hairline marks the hoisted selection", async () => {
      await waitFor(() =>
        expect(
          document.querySelectorAll('[data-slot="filter-bar-divider"]')
        ).toHaveLength(1)
      )
    })

    await step("and withdraws once it would misdescribe the order", async () => {
      // The order is frozen for the visit, so checking a further option leaves
      // it below the line — which would then claim everything under it is
      // unselected. The line goes rather than lie; the row tint carries on.
      await userEvent.click(panel.getByRole("checkbox", { name: /Low/ }))
      await waitFor(() =>
        expect(
          document.querySelectorAll('[data-slot="filter-bar-divider"]')
        ).toHaveLength(0)
      )
      await expect(panel.getByRole("checkbox", { name: /Low/ })).toBeChecked()
    })
  },
}

export const OptionsLoading: Story = {
  args: {
    facets: VULN_FACETS,
    values: {},
    onChange: () => {},
    onClear: () => {},
    search: "",
    onSearch: () => {},
  },
  render: () => <Demo loading />,
}

export const OptionsError: Story = {
  args: {
    facets: VULN_FACETS,
    values: {},
    onChange: () => {},
    onClear: () => {},
    search: "",
    onSearch: () => {},
  },
  render: () => <Demo error />,
}

/**
 * What the endpoint can actually send.
 *
 * `GET /{resource}/filter/` decides how many options a facet has, and a portfolio
 * facet — registrars, CVEs, assignees — runs to thousands. This story is the one
 * that keeps the list windowed: at 20 000 options the rendered row count must stay
 * in the tens, and both the rail and the panel must hold their shape against a
 * facet list longer than the panel is tall.
 */
const HUGE_FACETS: FilterBarFacet[] = [
  {
    id: "registrar",
    label: "Registrar",
    type: "multi",
    searchable: true,
    options: Array.from({ length: 20_000 }, (_, i) => ({
      value: `r${i}`,
      label: `Registrar ${i}`,
      count: 20_000 - i,
    })),
  },
  ...Array.from({ length: 30 }, (_, i) => ({
    id: `spare${i}`,
    label: `Spare facet ${i}`,
    type: "multi" as const,
    options: [{ value: "a", label: "Alpha", count: 1 }],
  })),
]

export const HugeOptionSet: Story = {
  args: {
    facets: HUGE_FACETS,
    values: {},
    onChange: () => {},
    onClear: () => {},
    search: "",
    onSearch: () => {},
  },
  render: () => (
    <Demo facets={HUGE_FACETS} initial={{ registrar: ["r5000", "r9"] }} />
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: /Filters/ }))

    await step("only the window is in the DOM", async () => {
      await waitFor(() =>
        expect(
          document.querySelector('[data-slot="filter-bar-option-viewport"]')
        ).toBeInTheDocument()
      )
      const rendered = document.querySelectorAll(
        '[data-slot="filter-bar-option"]'
      ).length
      expect(rendered).toBeGreaterThan(0)
      expect(rendered).toBeLessThan(40)
    })

    await step("the scroll range still covers every option", async () => {
      const canvasEl = document.querySelector(
        '[data-slot="filter-bar-option-canvas"]'
      ) as HTMLElement
      // 20 000 rows at a 32px pitch, plus the hairline's 13px.
      await expect(canvasEl.style.height).toBe("640013px")
    })

    await step("the rail scrolls rather than stretching the panel", async () => {
      const rail = document.querySelector(
        '[data-slot="filter-bar-rail"]'
      ) as HTMLElement
      await expect(rail.scrollHeight).toBeGreaterThan(rail.clientHeight)
    })

    await step("and leaves no bare strip beneath itself", async () => {
      // A searchable facet's option-search field makes the pane taller than any
      // cap the rail could carry, so a capped rail stopped above the footer and
      // showed the card through the gap. The rail must end exactly where the
      // panel body does, whatever the pane's height turns out to be.
      const rail = document
        .querySelector('[data-slot="filter-bar-rail"]')!
        .getBoundingClientRect()
      const body = document
        .querySelector('[data-slot="filter-bar-panel"]')!
        .firstElementChild!.getBoundingClientRect()
      await expect(Math.round(body.bottom - rail.bottom)).toBe(0)
      await expect(Math.round(rail.top - body.top)).toBe(0)
    })
  },
}

/**
 * A date facet bounded the way the filter-options endpoint actually bounds one:
 * with full ISO timestamps, not bare days. A native date input silently DROPS a
 * `min` / `max` it cannot read as `YYYY-MM-DD`, so these have to be narrowed
 * before they reach the field or the facet's own bounds never apply.
 */
const DATE_FACETS: FilterBarFacet[] = [
  {
    id: "discovered",
    label: "Discovered",
    type: "date",
    min: "2026-01-01T00:00:00.000Z",
    max: "2026-12-31T23:59:59.000Z",
  },
  {
    id: "severity",
    label: "Severity",
    type: "multi",
    options: [{ value: "critical", label: "Critical", count: 2 }],
  },
]

/**
 * A range whose start falls after its end — the state a deep link can deliver
 * even though the calendar will no longer produce it.
 */
export const BackwardsDateRange: Story = {
  args: {
    facets: DATE_FACETS,
    values: {},
    onChange: () => {},
    onClear: () => {},
    search: "",
    onSearch: () => {},
  },
  render: () => (
    <Demo
      facets={DATE_FACETS}
      initial={{ discovered: { from: "2026-08-20", to: "2026-01-01" } }}
    />
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("the closed trigger already says something is wrong", async () => {
      const badge = canvasElement.querySelector(
        '[data-slot="filter-bar-count"]'
      ) as HTMLElement
      await expect(badge).toHaveAttribute("data-invalid")
      // The facet still COUNTS — it is a constraint the user set and has to
      // fix, and dropping it from the tally would understate that.
      await expect(badge).toHaveTextContent("1")
    })

    await userEvent.click(canvas.getByRole("button", { name: /Filters/ }))
    const panel = within(document.body)

    await step("the rail names it in a word, not just a colour", async () => {
      await waitFor(() =>
        expect(
          panel.getByRole("button", { name: /Discovered/ })
        ).toHaveTextContent("invalid")
      )
    })

    await step("both fields are marked and the pair is explained", async () => {
      await userEvent.click(panel.getByRole("button", { name: /Discovered/ }))
      const from = panel.getByLabelText("From")
      const to = panel.getByLabelText("To")
      await expect(from).toHaveAttribute("aria-invalid", "true")
      await expect(to).toHaveAttribute("aria-invalid", "true")
      await expect(
        panel.getByText("Start date must be on or before the end date.")
      ).toBeVisible()
    })

    await step("the endpoint's bounds arrive as days, not timestamps", async () => {
      // Passed through whole, these would be dropped by the browser and the
      // facet would be unbounded in both directions.
      await expect(panel.getByLabelText("From")).toHaveAttribute(
        "min",
        "2026-01-01"
      )
      await expect(panel.getByLabelText("To")).toHaveAttribute(
        "max",
        "2026-12-31"
      )
    })

    await step("and the two fields bound each other", async () => {
      // This is what stops the range being created in the first place: the
      // start calendar stops at the end day, and the end calendar starts at the
      // start day.
      await expect(panel.getByLabelText("From")).toHaveAttribute(
        "max",
        "2026-01-01"
      )
      await expect(panel.getByLabelText("To")).toHaveAttribute(
        "min",
        "2026-08-20"
      )
    })

    await step("correcting the end day clears the whole state", async () => {
      const to = panel.getByLabelText("To") as HTMLInputElement
      await userEvent.clear(to)
      await userEvent.type(to, "2026-09-30")
      await waitFor(() =>
        expect(
          panel.queryByText("Start date must be on or before the end date.")
        ).not.toBeInTheDocument()
      )
      await expect(panel.getByLabelText("From")).not.toHaveAttribute(
        "aria-invalid"
      )
      await expect(
        canvasElement.querySelector('[data-slot="filter-bar-count"]')
      ).not.toHaveAttribute("data-invalid")
    })
  },
}

/**
 * Every number the bar prints on its own account, routed through the app's own
 * formatter.
 *
 * `toLocaleString()` — the default, and all this component ever did — reads the
 * RUNTIME's locale, so it follows the machine rather than the app. An app whose
 * language is a user preference needs the opposite: the same Persian-Indic
 * digits it uses everywhere else, in an `en-US` browser. Two of the three
 * figures were not even localised to the runtime; they were interpolated raw.
 */
export const FormattedCounts: Story = {
  args: {
    facets: VULN_FACETS,
    values: {},
    onChange: () => {},
    onClear: () => {},
    search: "",
    onSearch: () => {},
  },
  render: () => (
    <Demo
      facets={BIG_COUNT_FACETS}
      initial={{ severity: ["critical"], status: ["open"] }}
      formatCount={faDigits}
    />
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("the trigger badge counts in the supplied numerals", async () => {
      await waitFor(() =>
        expect(
          canvasElement.querySelector('[data-slot="filter-bar-count"]')
        ).toHaveTextContent("۲")
      )
    })

    await step("so does the summary sentence", async () => {
      await expect(canvas.getByText(/^۲ filters/)).toBeVisible()
    })

    await step("and so does an option's count, grouping included", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /Filters/ }))
      const panel = within(await screenBody())
      const option = await waitFor(() =>
        panel.getByRole("checkbox", { name: /Critical/ })
      )
      await expect(option).toHaveTextContent("۱٬۲۳۴")
    })
  },
}

/** Persian-Indic digits with a Persian group separator, as an app would supply. */
function faDigits(value: number) {
  const FA = "۰۱۲۳۴۵۶۷۸۹"
  return new Intl.NumberFormat("en-US")
    .format(value)
    .replace(/[0-9]/g, (d) => FA[Number(d)])
    .replace(/,/g, "٬")
}

/** Counts large enough to show the group separator as well as the digits. */
const BIG_COUNT_FACETS: FilterBarFacet[] = VULN_FACETS.map((facet) =>
  facet.type === "multi"
    ? {
        ...facet,
        options: facet.options.map((option, index) => ({
          ...option,
          count: 1234 + index,
        })),
      }
    : facet
)
