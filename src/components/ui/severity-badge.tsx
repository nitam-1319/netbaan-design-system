"use client";

import { Badge, type BadgeProps } from "@/components/ui/badge"

/**
 * AEGIS — Severity Badge (Domain / ASM)
 *
 * The severity-scoped sibling of `Badge`. It is a thin wrapper that pins a
 * finding's severity `level` (Critical · High · Medium · Low · Info) onto the
 * matching Badge `tone` from the severity ramp, so the ladder reads identically
 * everywhere (finding cards, tables, filters). Because it composes `Badge`, all
 * colour flows from AEGIS `--sev-*` tokens with no per-file literals.
 *
 * The level is always spelled out as text (with an optional leading dot), so
 * severity is never conveyed by colour alone. Public API is CLOSED — no
 * `className` / `style`; polymorphism via `render`. See `.agent/rules/API_RULES.md`.
 */

type Severity = "critical" | "high" | "medium" | "low" | "info"

const SEVERITY_LABEL: Record<Severity, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
  info: "Info",
}

type SeverityBadgeProps = Omit<BadgeProps, "tone" | "count" | "max"> & {
  /** The severity level. Required — drives the tone and the default label. */
  level: Severity
}

function SeverityBadge({
  level,
  variant = "soft",
  size = "md",
  dot = true,
  children,
  ...props
}: SeverityBadgeProps) {
  return (
    <Badge
      tone={level}
      variant={variant}
      size={size}
      dot={dot}
      data-slot="severity-badge"
      data-severity={level}
      {...props}
    >
      {children ?? SEVERITY_LABEL[level]}
    </Badge>
  )
}

export { SeverityBadge, SEVERITY_LABEL }
export type { SeverityBadgeProps, Severity }
