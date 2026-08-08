import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"

import { Button } from "@/components/ui/button"
import {
  HistoricalScanBanner,
  ScanHistoryList,
  ScanSwitcher,
  type ScanOption,
} from "@/components/ui/scan-switcher"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */

const SCANS: ScanOption[] = [
  { id: "s1", date: "2025/05/19", note: "Latest scan", statusLabel: "Completed", tone: "success", isLatest: true },
  { id: "s2", date: "2025/05/18", note: "Timed out at enumeration", statusLabel: "Failed", tone: "danger" },
  { id: "s3", date: "2025/04/15", statusLabel: "Completed", tone: "success" },
  { id: "s4", date: "2025/04/14", note: "29 findings", statusLabel: "Completed", tone: "success" },
  { id: "s5", date: "2025/04/09", note: "Scheduled sweep", statusLabel: "Running", tone: "info" },
  { id: "s6", date: "2025/04/02", statusLabel: "Completed", tone: "success" },
]

const LABELS = {
  label: "Showing scan",
  listLabel: "Scan history",
  latestLabel: "Latest",
  historicalLabel: "Historical",
  olderLabel: "Older scan",
  newerLabel: "Newer scan",
}

const meta = {
  title: "Components/ScanSwitcher",
  component: ScanSwitcher,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: { ...LABELS, options: SCANS, value: "s1", onValueChange: () => {} },
} satisfies Meta<typeof ScanSwitcher>

export default meta
type Story = StoryObj<typeof meta>

export const Latest: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("Latest")).toBeInTheDocument()
    // Newest selected → there is no newer scan to step to.
    await expect(canvas.getByRole("button", { name: "Newer scan" })).toBeDisabled()
    await expect(canvas.getByRole("button", { name: "Older scan" })).toBeEnabled()
  },
}

export const Historical: Story = {
  args: { value: "s4" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText("Historical")).toBeInTheDocument()
    await expect(canvas.getByRole("button", { name: "Newer scan" })).toBeEnabled()
  },
}

export const Oldest: Story = {
  args: { value: "s6" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole("button", { name: "Older scan" })).toBeDisabled()
  },
}

/** The popup is a real listbox: options carry `aria-selected`. */
export const OpenListbox: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("combobox"))
    const options = await within(document.body).findAllByRole("option")
    await expect(options).toHaveLength(SCANS.length)
    await expect(options[0]).toHaveAttribute("aria-selected", "true")
  },
}

/** Controlled end to end: the trigger, the history list and the banner agree. */
export const FullSurface: StoryObj = {
  render: () => {
    const [value, setValue] = React.useState("s4")
    const selected = SCANS.find((scan) => scan.id === value)
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 640 }}>
        <ScanSwitcher {...LABELS} options={SCANS} value={value} onValueChange={setValue} />
        {selected?.isLatest === true ? null : (
          <HistoricalScanBanner
            action={
              <Button variant="outline" size="sm" onClick={() => setValue("s1")}>
                Back to latest scan
              </Button>
            }
          >
            Historical view — every figure below comes from the scan of {selected?.date}, not the
            latest one.
          </HistoricalScanBanner>
        )}
        <ScanHistoryList
          options={SCANS}
          value={value}
          onValueChange={setValue}
          viewingLabel="Viewing"
          rowLabel={(option) => `Load the scan of ${String(option.date)}`}
        />
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole("status")).toBeInTheDocument()
    await userEvent.click(canvas.getByRole("button", { name: "Back to latest scan" }))
    await expect(canvas.queryByRole("status")).not.toBeInTheDocument()
    await expect(
      canvas.getByRole("button", { name: "Load the scan of 2025/05/19" })
    ).toHaveAttribute("aria-current", "true")
  },
}
