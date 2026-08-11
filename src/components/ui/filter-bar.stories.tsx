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
}: {
  facets?: FilterBarFacet[]
  initial?: Record<string, FilterBarValue>
  loading?: boolean
  error?: boolean
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
