"use client";

import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { DonutChart } from "@/components/ui/donut-chart"
import { StatusPill, type StatusPillProps } from "@/components/ui/status-pill"
import { type Severity } from "@/components/ui/severity-badge"

/**
 * AEGIS — Asset Triage Card
 *
 * The card in a visual-triage grid: one discovered asset, opened by a picture of
 * it. A domain card leads with a screenshot of the site, an IP card with a map of
 * where it sits — both fill the `media` slot, so a grid of either reads with the
 * same anatomy and the same baseline.
 *
 *   <AssetTriageCard
 *     media={<ScreenshotThumb src={host.thumbnail} emptyLabel="No screenshot yet" />}
 *     title="shop.example.com"
 *     subtitle="SUBDOMAIN"
 *     severities={{ critical: 1, high: 4, medium: 9, low: 2, info: 7 }}
 *     severityLabels={severityLabels}
 *     chartLabel="Findings by severity on shop.example.com"
 *     grade="B"
 *     href="/asset-details?id=42"
 *   />
 *
 * Below the media: the asset's name in mono, a severity donut against the full
 * five-rung breakdown (every rung shown, zeroes muted — an absent rung is
 * information too), an optional open-ports row, and a footer pairing the letter
 * grade with a findings count.
 *
 * Where `AssetRow` packs an inventory into scannable lines, this trades density
 * for recognition: use it when the picture is what lets someone triage at a
 * glance, and the row when the list is long and the name is enough.
 *
 * The donut is the AEGIS `DonutChart` on its severity palette (`--chart-1..5` IS
 * the severity ramp), so ring, dots, and counts agree by construction. Hover lift,
 * accent border, and the pointer-tracked spotlight all come from `Card`
 * `interactive` — nothing is restyled here.
 *
 * Public API is CLOSED — no `className` / `style`; labels are `ReactNode` so the
 * consuming app owns translation. Colour is token-only.
 * See `.agent/rules/API_RULES.md`.
 */

/** Severity rungs, worst first — the order the donut and the list both follow. */
const SEVERITY_ORDER: readonly Severity[] = [
  "critical",
  "high",
  "medium",
  "low",
  "info",
] as const

/** Per-rung dot fill. */
const SEVERITY_DOT: Record<Severity, string> = {
  critical: "bg-sev-critical",
  high: "bg-sev-high",
  medium: "bg-sev-medium",
  low: "bg-sev-low",
  info: "bg-sev-info",
}

/** Per-rung count ink, used only when the rung is non-zero. */
const SEVERITY_INK: Record<Severity, string> = {
  critical: "text-sev-critical-ink",
  high: "text-sev-high-ink",
  medium: "text-sev-medium-ink",
  low: "text-sev-low-ink",
  info: "text-sev-info-ink",
}

/**
 * The grade tile. Tone escalates A → F; the fill is the tone at 18% so the letter
 * stays legible on `--surface`. Grades outside A–F fall back to the C style, which
 * is the documented behaviour for an unmapped grade.
 */
const gradeVariants = cva(
  "inline-flex size-[26px] shrink-0 items-center justify-center rounded-md font-mono text-[11px] font-bold uppercase",
  {
    variants: {
      tone: {
        a: "bg-success/[0.18] text-success-ink",
        b: "bg-primary/[0.18] text-primary",
        c: "bg-sev-medium/[0.18] text-sev-medium-ink",
        d: "bg-sev-high/[0.18] text-sev-high-ink",
        f: "bg-sev-critical/[0.18] text-sev-critical-ink",
      },
    },
    defaultVariants: { tone: "c" },
  }
)

type GradeTone = "a" | "b" | "c" | "d" | "f"

/** Map a grade letter to its tile tone. Unmapped grades fall back to `"c"`. */
function toneForGrade(grade: string | null | undefined): GradeTone {
  const letter = (grade ?? "").trim().toLowerCase().charAt(0)
  return letter === "a" || letter === "b" || letter === "d" || letter === "f"
    ? letter
    : "c"
}

/** One open port. `risky` tints the chip — which ports count as risky is policy
 * the consuming app owns, not something this component decides. */
type AssetTriageCardPort = {
  port: number
  risky?: boolean
}

type AssetTriageCardProps = {
  /** The media strip — a `ScreenshotThumb` or a `MiniLocationMap`. Required. */
  media: React.ReactNode
  /** Status word overlaid on the media (e.g. "Active"). Omit to show none. */
  statusLabel?: React.ReactNode
  /** Tone for the status pill. Default `"neutral"`. */
  statusTone?: StatusPillProps["tone"]
  /** The asset's name — host or IP address. Set in mono. Required. */
  title: React.ReactNode
  /** Trailing detail on the title line (e.g. the hosting provider). */
  titleMeta?: React.ReactNode
  /** Secondary line under the title (e.g. "SUBDOMAIN", or a PTR hostname). */
  subtitle?: React.ReactNode
  /** Finding counts per severity rung. All five are rendered. Required. */
  severities: Record<Severity, number>
  /** Display name per rung — the consuming app translates these. Required. */
  severityLabels: Record<Severity, string>
  /** Accessible name for the donut (e.g. "Findings by severity on example.com"). */
  chartLabel: string
  /** Open ports. Omit to hide the ports row entirely. */
  ports?: AssetTriageCardPort[]
  /** Micro-label above the port chips (e.g. "Ports"). */
  portsLabel?: React.ReactNode
  /** How many port chips to show before collapsing the rest. Default `4`. */
  maxPorts?: number
  /** Render the overflow chip for the `n` ports beyond `maxPorts`. Default `+n`. */
  formatPortOverflow?: (count: number) => React.ReactNode
  /** Letter grade (A–F). Unmapped values take the C style. */
  grade?: string | null
  /** Findings readout in the footer (e.g. "24 findings"). */
  findings?: React.ReactNode
  /** Detail link. When set the card is interactive and the title is the link. */
  href?: string
}

function AssetTriageCard({
  media,
  statusLabel,
  statusTone = "neutral",
  title,
  titleMeta,
  subtitle,
  severities,
  severityLabels,
  chartLabel,
  ports,
  portsLabel,
  maxPorts = 4,
  formatPortOverflow = (count) => `+${count}`,
  grade,
  findings,
  href,
}: AssetTriageCardProps) {
  const total = SEVERITY_ORDER.reduce(
    (sum, rung) => sum + Math.max(0, severities[rung] ?? 0),
    0
  )

  const donutData = SEVERITY_ORDER.map((rung) => ({
    key: rung,
    label: severityLabels[rung],
    value: Math.max(0, severities[rung] ?? 0),
  }))

  const shownPorts = ports?.slice(0, Math.max(0, maxPorts)) ?? []
  const overflow = (ports?.length ?? 0) - shownPorts.length

  return (
    <Card variant="default" interactive={href != null}>
      <div className="-my-6 flex flex-col">
        {/* Media — full-bleed to the card edge, with the status pill floated over it. */}
        <div className="relative overflow-hidden rounded-t-xl">
          {media}
          {statusLabel != null ? (
            <span
              data-slot="asset-triage-card-status"
              className="absolute top-2 end-2"
            >
              <StatusPill tone={statusTone} size="sm">
                {statusLabel}
              </StatusPill>
            </span>
          ) : null}
        </div>

        <div className="flex flex-col gap-3.5 px-4 py-3.5">
          {/* Identity */}
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="flex min-w-0 items-baseline gap-2">
              <span
                data-slot="asset-triage-card-title"
                className="min-w-0 truncate font-mono text-[13.5px] font-semibold text-foreground"
              >
                {href != null ? (
                  <a
                    href={href}
                    className="outline-none hover:underline focus-visible:rounded-sm focus-visible:ring-3 focus-visible:ring-accent-soft"
                  >
                    {title}
                  </a>
                ) : (
                  title
                )}
              </span>
              {titleMeta != null ? (
                <span className="shrink-0 font-mono text-[10.5px] text-muted-foreground">
                  {titleMeta}
                </span>
              ) : null}
            </span>
            {subtitle != null ? (
              <span
                data-slot="asset-triage-card-subtitle"
                className="truncate font-mono text-[10px] tracking-[0.05em] text-muted-foreground"
              >
                {subtitle}
              </span>
            ) : null}
          </div>

          {/* Severity: the ring, then every rung spelled out beside it. */}
          <div className="flex items-center gap-3">
            <span className="relative shrink-0">
              <DonutChart
                label={chartLabel}
                data={donutData}
                width={58}
                height={58}
                innerRatio={0.52}
                padAngle={3}
                margin={{ top: 4, right: 4, bottom: 4, left: 4 }}
                showLegend={false}
                showCenterLabel={false}
              />
              {/* Centre total as HTML so it keeps the display face and card-scale
                  type rather than the chart's own heading size. */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 flex items-center justify-center font-heading text-[15px] font-bold tabular-nums text-foreground"
              >
                {total}
              </span>
            </span>

            <dl className="grid min-w-0 flex-1 grid-cols-2 gap-x-3.5 gap-y-[3px]">
              {SEVERITY_ORDER.map((rung) => {
                const count = Math.max(0, severities[rung] ?? 0)
                return (
                  <div
                    key={rung}
                    data-slot="asset-triage-card-severity"
                    data-severity={rung}
                    className="flex min-w-0 items-center gap-1.5"
                  >
                    <span
                      aria-hidden
                      className={cn("size-1.5 shrink-0 rounded-full", SEVERITY_DOT[rung])}
                    />
                    <dt className="min-w-0 truncate text-[11px] text-muted-foreground">
                      {severityLabels[rung]}
                    </dt>
                    <dd
                      className={cn(
                        "ms-auto font-mono text-[11px] tabular-nums",
                        count > 0 ? SEVERITY_INK[rung] : "text-muted-foreground"
                      )}
                    >
                      {count}
                    </dd>
                  </div>
                )
              })}
            </dl>
          </div>

          {/* Open ports */}
          {shownPorts.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1.5">
              {portsLabel != null ? (
                <span className="me-0.5 text-[10px] font-medium uppercase tracking-[0.05em] text-muted-foreground">
                  {portsLabel}
                </span>
              ) : null}
              <span className="flex flex-wrap items-center gap-1.5">
                {shownPorts.map(({ port, risky }) => (
                  <span
                    key={port}
                    data-slot="asset-triage-card-port"
                    data-risky={risky || undefined}
                    className={cn(
                      "inline-flex items-center rounded-md border px-1.5 py-0.5 font-mono text-[10.5px] tabular-nums",
                      risky
                        ? "border-sev-high/[0.24] bg-sev-high/[0.14] text-sev-high-ink"
                        : "border-border bg-surface-2 text-muted-foreground"
                    )}
                  >
                    {port}
                  </span>
                ))}
                {overflow > 0 ? (
                  <span
                    data-slot="asset-triage-card-port-overflow"
                    className="inline-flex items-center rounded-md border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[10.5px] tabular-nums text-muted-foreground"
                  >
                    {formatPortOverflow(overflow)}
                  </span>
                ) : null}
              </span>
            </div>
          ) : null}

          {/* Footer: the grade, and how much is outstanding. */}
          {grade != null || findings != null ? (
            <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
              {grade != null ? (
                <span
                  data-slot="asset-triage-card-grade"
                  data-grade={grade}
                  className={cn(gradeVariants({ tone: toneForGrade(grade) }))}
                >
                  {grade}
                </span>
              ) : (
                <span />
              )}
              {findings != null ? (
                <span
                  data-slot="asset-triage-card-findings"
                  className="font-mono text-[11px] tabular-nums text-muted-foreground"
                >
                  {findings}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </Card>
  )
}

export { AssetTriageCard, gradeVariants as assetTriageGradeVariants, toneForGrade }
export type { AssetTriageCardProps, AssetTriageCardPort, GradeTone }
