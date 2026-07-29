"use client";

import * as React from "react"
import { ChevronRight, Server } from "lucide-react"

import { cn } from "@/lib/utils"
import { ListItem, ListItemContent } from "@/components/ui/list"
import { Sparkline } from "@/components/ui/sparkline"
import { SeverityBadge, type Severity } from "@/components/ui/severity-badge"

/**
 * AEGIS — Asset Row (Domain / ASM)
 *
 * A dense row for a single discovered asset in an inventory — a host, domain, IP,
 * or service — showing its name, type, key counts, a trend `Sparkline` (findings
 * or exposure over time), and its highest finding severity. It composes the AEGIS
 * `ListItem` (spacing, dividers, hover/focus) with `Sparkline` and
 * `SeverityBadge`, so it drops straight into a `List`.
 *
 * The sparkline is decorative beside the visible counts (it carries an accessible
 * label only when meaningful). When `href` is set the name is a link and the row
 * is interactive. Public API is CLOSED — no `className` / `style`; everything is
 * a semantic prop. All colour is token-driven. See `.agent/rules/API_RULES.md`.
 */

type AssetRowProps = Omit<
  React.ComponentProps<typeof ListItem>,
  "children" | "interactive" | "className" | "style"
> & {
  /** The asset name — host, domain, or IP. Required. */
  name: React.ReactNode
  /** Asset type / role (e.g. "Web server", "Database"). */
  type?: React.ReactNode
  /** Highest finding severity on the asset → SeverityBadge. */
  severity?: Severity
  /** Number of open findings → "N findings". */
  findings?: number
  /** Trend series (e.g. daily findings) → Sparkline. */
  trend?: number[]
  /** Accessible label for the trend chart; omit to keep it decorative. */
  trendLabel?: string
  /** Connectivity status dot: online (accent) / offline (muted). */
  online?: boolean
  /** Link to the asset detail; when set the name links + row is interactive. */
  href?: string
  /** Anchor target (adds `rel="noreferrer"` for `_blank`). */
  target?: string
}

/** Map a severity to the sparkline's tone so the trend agrees with the badge. */
const TREND_TONE: Record<Severity, React.ComponentProps<typeof Sparkline>["tone"]> = {
  critical: "danger",
  high: "danger",
  medium: "warning",
  low: "accent",
  info: "neutral",
}

function AssetRow({
  name,
  type,
  severity,
  findings,
  trend,
  trendLabel,
  online,
  href,
  target,
  density = "default",
  ...props
}: AssetRowProps) {
  const isLink = href != null
  const trendTone = severity ? TREND_TONE[severity] : "neutral"

  return (
    <ListItem
      data-slot="asset-row"
      {...(severity ? { "data-severity": severity } : {})}
      density={density}
      interactive={isLink}
      {...props}
    >
      <span
        data-slot="asset-row-icon"
        aria-hidden
        className="relative flex size-8 shrink-0 items-center justify-center rounded-md bg-surface-3 text-muted-foreground [&>svg]:size-4"
      >
        <Server />
        {online != null ? (
          <span
            className={cn(
              "absolute -end-0.5 -top-0.5 size-2.5 rounded-full border-2 border-card",
              online ? "bg-success" : "bg-muted-foreground"
            )}
          />
        ) : null}
      </span>

      <ListItemContent>
        <span
          data-slot="asset-row-name"
          className="min-w-0 truncate font-mono text-sm font-medium text-foreground"
        >
          {isLink ? (
            <a
              href={href}
              target={target}
              rel={target === "_blank" ? "noreferrer" : undefined}
              className="outline-none hover:underline focus-visible:rounded-sm focus-visible:ring-3 focus-visible:ring-accent-soft"
            >
              {name}
            </a>
          ) : (
            name
          )}
        </span>
        {(type != null || findings != null) && (
          <span className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
            {type != null ? <span>{type}</span> : null}
            {type != null && findings != null ? (
              <span aria-hidden className="text-text-faint">
                ·
              </span>
            ) : null}
            {findings != null ? (
              <span data-slot="asset-row-findings">
                {findings} {findings === 1 ? "finding" : "findings"}
              </span>
            ) : null}
          </span>
        )}
      </ListItemContent>

      {trend && trend.length > 1 ? (
        <span
          data-slot="asset-row-trend"
          className="hidden shrink-0 sm:inline-flex"
        >
          <Sparkline
            data={trend}
            variant="area"
            tone={trendTone}
            width={72}
            height={24}
            label={trendLabel}
          />
        </span>
      ) : null}

      {severity ? (
        <span className="shrink-0">
          <SeverityBadge level={severity} size="sm" />
        </span>
      ) : null}

      {isLink ? (
        <ChevronRight
          aria-hidden
          className="size-4 shrink-0 text-text-faint rtl:rotate-180"
        />
      ) : null}
    </ListItem>
  )
}

export { AssetRow }
export type { AssetRowProps }
