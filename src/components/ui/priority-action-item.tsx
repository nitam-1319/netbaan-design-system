"use client";

import * as React from "react"
import { ChevronRight, Layers } from "lucide-react"

import { ListItem, ListItemContent } from "@/components/ui/list"
import { SeverityBadge, type Severity } from "@/components/ui/severity-badge"

/**
 * AEGIS — Priority Action Item (Domain / ASM)
 *
 * A single, ranked remediation action in a "what to fix next" list: an ordinal
 * rank, the finding severity, a title, supporting meta (affected assets, impact),
 * and — when it links — a trailing chevron. It composes the AEGIS `ListItem`
 * (spacing, dividers, hover/focus affordances) with `SeverityBadge`, so it drops
 * straight into a `List`.
 *
 * Rank and severity are always text (never colour alone). When `href` is set the
 * title is a link and the row shows the interactive affordances. Public API is
 * CLOSED — no `className` / `style`; everything is a semantic prop. All colour is
 * token-driven. See `.agent/rules/API_RULES.md`.
 */

type PriorityActionItemProps = Omit<
  React.ComponentProps<typeof ListItem>,
  "children" | "interactive" | "title"
> & {
  /** The action title. Required. */
  title: React.ReactNode
  /**
   * The full title as plain text, shown as a native tooltip on the truncated
   * heading. Titles here run past 60 characters with no natural break
   * (`Vulnerabilities found for CPE cpe:2.3:a:php:php:7.4.33:*:*:*:*:*:*:*`),
   * and the `title` ATTRIBUTE the row could otherwise carry is spent on the
   * `title` PROP.
   */
  titleTooltip?: string
  /** Ordinal rank shown in the leading chip (e.g. 1 → "1"). */
  rank?: number
  /** Finding severity → SeverityBadge. */
  severity?: Severity
  /** Short supporting description. */
  description?: React.ReactNode
  /** Number of affected assets → "N assets". */
  affectedCount?: number
  /**
   * Renders the affected-count line. The built-in English "N asset(s)" cannot
   * be translated and has no plural rule beyond one/other, which most languages
   * need. Given this, it owns the whole string.
   */
  formatAffected?: (count: number) => React.ReactNode
  /** Estimated impact / effort note (e.g. "Reduces risk 38%"). */
  impact?: React.ReactNode
  /** Link to the action detail; when set the title is a link + row is interactive. */
  href?: string
  /** Anchor target (adds `rel="noreferrer"` for `_blank`). */
  target?: string
}

function PriorityActionItem({
  title,
  titleTooltip,
  formatAffected,
  rank,
  severity,
  description,
  affectedCount,
  impact,
  href,
  target,
  density = "comfortable",
  ...props
}: PriorityActionItemProps) {
  const isLink = href != null

  return (
    <ListItem
      data-slot="priority-action-item"
      data-rank={rank}
      {...(severity ? { "data-severity": severity } : {})}
      density={density}
      interactive={isLink}
      {...props}
    >
      {rank != null ? (
        <span
          data-slot="priority-action-item-rank"
          aria-hidden
          className="flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-3 font-mono text-xs font-semibold tabular-nums text-muted-foreground"
        >
          {rank}
        </span>
      ) : null}

      <ListItemContent>
        <div className="flex items-center gap-2">
          {severity ? <SeverityBadge level={severity} size="sm" /> : null}
          <span
            data-slot="priority-action-item-title"
            title={titleTooltip}
            className="min-w-0 truncate text-sm font-medium text-foreground"
          >
            {isLink ? (
              <a
                href={href}
                target={target}
                rel={target === "_blank" ? "noreferrer" : undefined}
                className="outline-none hover:underline focus-visible:rounded-sm focus-visible:ring-3 focus-visible:ring-accent-soft"
              >
                {title}
              </a>
            ) : (
              title
            )}
          </span>
        </div>

        {description != null ? (
          <p className="truncate text-xs text-muted-foreground">{description}</p>
        ) : null}

        {(affectedCount != null || impact != null) && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
            {affectedCount != null ? (
              <span className="flex items-center gap-1">
                <Layers aria-hidden className="size-3.5 shrink-0" />
                {formatAffected
                  ? formatAffected(affectedCount)
                  : `${affectedCount} ${affectedCount === 1 ? "asset" : "assets"}`}
              </span>
            ) : null}
            {impact != null ? (
              <span data-slot="priority-action-item-impact">{impact}</span>
            ) : null}
          </div>
        )}
      </ListItemContent>

      {isLink ? (
        <ChevronRight
          aria-hidden
          className="ms-auto size-4 shrink-0 text-text-faint rtl:rotate-180"
        />
      ) : null}
    </ListItem>
  )
}

export { PriorityActionItem }
export type { PriorityActionItemProps }
