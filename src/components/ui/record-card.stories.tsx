import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"

import {
  RecordCard,
  RecordCardHeader,
  RecordCardFields,
  RecordCardField,
  RecordCardFooter,
} from "@/components/ui/record-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */

const meta = {
  title: "Components/RecordCard",
  component: RecordCard,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
} satisfies Meta<typeof RecordCard>

export default meta
type Story = StoryObj<typeof meta>

/** The shipped shape: collapsed, with a reveal that opens the card as it unmasks. */
export const Default: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false)
    const [revealed, setRevealed] = React.useState(false)
    return (
      <RecordCard open={open} onOpenChange={setOpen}>
        <RecordCardHeader
          index="#3"
          title="m.tabrizi@acme-corp.com"
          badges={<Badge tone="critical" size="sm">4 months ago</Badge>}
          source="Collection#2 · 2025 combo"
          meta="6 fields · credentials"
          actions={
            <Button
              variant="outline"
              size="sm"
              aria-pressed={revealed}
              onClick={(e) => {
                // Revealing implies opening — a revealed value nobody can see is a lie.
                e.stopPropagation()
                setRevealed((r) => !r)
                if (!revealed) setOpen(true)
              }}
            >
              {revealed ? "Hide values" : "Reveal values"}
            </Button>
          }
        />
        <RecordCardFields>
          <RecordCardField label="Email">m.tabrizi@acme-corp.com</RecordCardField>
          <RecordCardField label="Username">mtabrizi</RecordCardField>
          <RecordCardField
            label="Password"
            secret
            masked={!revealed}
            maskedLabel="Hidden — reveal to view"
            hint={revealed ? "Reused ×2" : undefined}
            hintTone="critical"
          >
            Summer2024!
          </RecordCardField>
          <RecordCardField label="IP address">203.0.113.44</RecordCardField>
          <RecordCardField label="URL">https://portal.acme-corp.com/login</RecordCardField>
          <RecordCardField label="Company">ACME Corp</RecordCardField>
        </RecordCardFields>
        <RecordCardFooter>First seen 2025/04/22 · last updated 2025/04/22</RecordCardFooter>
      </RecordCard>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const header = canvas.getByRole("button", { name: /m\.tabrizi/ })

    // Collapsed is the default, and the fields genuinely are not in the DOM.
    await expect(header).toHaveAttribute("aria-expanded", "false")
    await expect(canvas.queryByText("mtabrizi")).not.toBeInTheDocument()

    // The header is a role=button div, so its keyboard handling is its own.
    header.focus()
    await userEvent.keyboard("{Enter}")
    await expect(header).toHaveAttribute("aria-expanded", "true")
    await expect(canvas.getByText("mtabrizi")).toBeInTheDocument()

    // Masked means absent: the plaintext is nowhere for AT or a text copy to find.
    await expect(canvas.queryByText("Summer2024!")).not.toBeInTheDocument()
    await userEvent.click(canvas.getByRole("button", { name: "Reveal values" }))
    await expect(canvas.getByText("Summer2024!")).toBeInTheDocument()
    // …and pressing it did not toggle the card shut.
    await expect(header).toHaveAttribute("aria-expanded", "true")
  },
}

/** Open from the start, with the strength hint stated as a fact rather than advice. */
export const Open: Story = {
  render: () => (
    <RecordCard defaultOpen>
      <RecordCardHeader
        index="#4"
        title="legacy@acme-corp.com"
        badges={<Badge tone="medium" size="sm">3 years ago</Badge>}
        source="Legacy CRM 2022"
        meta="3 fields · credentials"
      />
      <RecordCardFields>
        <RecordCardField label="Email">legacy@acme-corp.com</RecordCardField>
        <RecordCardField label="Username">legacy_admin</RecordCardField>
        <RecordCardField label="Hashed password">
          5f4dcc3b5aa765d61d8327deb882cf99
        </RecordCardField>
      </RecordCardFields>
      <RecordCardFooter tone="warning">
        Values revealed · proposed: log this action to the org audit trail
      </RecordCardFooter>
    </RecordCard>
  ),
}

/** A record the corpus captured nothing usable from. The header still identifies it. */
export const NoFields: Story = {
  render: () => (
    <RecordCard defaultOpen>
      <RecordCardHeader
        index="#12"
        title="Unidentified record"
        badges={<Badge tone="neutral" size="sm">Date unknown</Badge>}
        meta="No fields captured"
      />
      <RecordCardFooter>First seen 2024/01/09</RecordCardFooter>
    </RecordCard>
  ),
}

/** Several in a column — the page of headers this component exists to produce. */
export const Stack: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {["ops@acme-corp.com", "k.rahimi@acme-corp.com", "legacy@acme-corp.com"].map((id, i) => (
        <RecordCard key={id}>
          <RecordCardHeader
            index={`#${i + 1}`}
            title={id}
            badges={<Badge tone={i === 0 ? "critical" : "medium"} size="sm">{i === 0 ? "2 months ago" : "2 years ago"}</Badge>}
            source="VPN dump 2025"
            meta={`${5 - i} fields · credentials`}
          />
          <RecordCardFields>
            <RecordCardField label="Email">{id}</RecordCardField>
            <RecordCardField label="Password" secret masked maskedLabel="Hidden — reveal to view">
              redacted
            </RecordCardField>
          </RecordCardFields>
          <RecordCardFooter>First seen 2025/02/08</RecordCardFooter>
        </RecordCard>
      ))}
    </div>
  ),
}
