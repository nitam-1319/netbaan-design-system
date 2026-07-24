import * as React from "react"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Severity Badge (Domain / ASM)
 *
 * A severity marker for the five-level security scale — Critical, High, Medium,
 * Low, Info — mapped onto the dedicated AEGIS `--sev-*` tokens. It is the
 * severity-scoped sibling of `Badge`: where `Badge` carries generic status
 * tones, Severity Badge encodes the ASM severity ladder so a finding's
 * severity reads consistently everywhere (finding cards, tables, filters).
 *
 * The level is always spelled out as text (with an optional leading dot), so
 * severity is never conveyed by colour alone. Renders a `<span>` by default and
 * composes with any element via `render` (Base UI `useRender`) — e.g. a link.
 *
 * Public API is CLOSED — no `className` / `style`. Level via `severity`, style
 * via `appearance`, scale via `size`. All colour is token-driven.
 * See `.agent/rules/API_RULES.md` and `.agent/DECISIONS.md`.
 */

const severityBadgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center gap-1.5 rounded-md border font-medium whitespace-nowrap transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:pointer-events-none [&_svg]:size-3",
  {
    variants: {
      appearance: {
        soft: "",
        outline: "bg-transparent",
      },
      severity: {
        critical: "",
        high: "",
        medium: "",
        low: "",
        info: "",
      },
      size: {
        sm: "px-1.5 py-0 text-[0.65rem]",
        default: "px-2 py-0.5 text-xs",
        lg: "px-2.5 py-0.5 text-[0.8rem]",
      },
    },
    compoundVariants: [
      // Soft — tinted fill + coloured text (AA-safe: coloured text on a faint
      // wash of its own hue).
      {
        appearance: "soft",
        severity: "critical",
        className:
          "border-transparent bg-[color-mix(in_oklch,var(--sev-critical),transparent_86%)] text-sev-critical",
      },
      {
        appearance: "soft",
        severity: "high",
        className:
          "border-transparent bg-[color-mix(in_oklch,var(--sev-high),transparent_86%)] text-sev-high",
      },
      {
        appearance: "soft",
        severity: "medium",
        className:
          "border-transparent bg-[color-mix(in_oklch,var(--sev-medium),transparent_86%)] text-sev-medium",
      },
      {
        appearance: "soft",
        severity: "low",
        className:
          "border-transparent bg-[color-mix(in_oklch,var(--sev-low),transparent_86%)] text-sev-low",
      },
      {
        appearance: "soft",
        severity: "info",
        className:
          "border-transparent bg-[color-mix(in_oklch,var(--sev-info),transparent_86%)] text-sev-info",
      },
      // Outline — coloured border + coloured text on the surface.
      {
        appearance: "outline",
        severity: "critical",
        className: "border-sev-critical text-sev-critical",
      },
      {
        appearance: "outline",
        severity: "high",
        className: "border-sev-high text-sev-high",
      },
      {
        appearance: "outline",
        severity: "medium",
        className: "border-sev-medium text-sev-medium",
      },
      {
        appearance: "outline",
        severity: "low",
        className: "border-sev-low text-sev-low",
      },
      {
        appearance: "outline",
        severity: "info",
        className: "border-sev-info text-sev-info",
      },
    ],
    defaultVariants: {
      appearance: "soft",
      severity: "info",
      size: "default",
    },
  }
)

type Severity = "critical" | "high" | "medium" | "low" | "info"

const SEVERITY_LABEL: Record<Severity, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
  info: "Info",
}

type SeverityBadgeProps = Omit<
  useRender.ComponentProps<"span">,
  "className" | "style"
> &
  VariantProps<typeof severityBadgeVariants> & {
    /** The severity level. Required — drives colour and the default label. */
    severity: Severity
    /** Show the leading dot marker. Default `true`. */
    showDot?: boolean
    /** Override the visible label (defaults to the capitalised level name). */
    children?: React.ReactNode
  }

function SeverityBadge({
  severity,
  appearance = "soft",
  size = "default",
  showDot = true,
  render = <span />,
  children,
  ...props
}: SeverityBadgeProps) {
  return useRender({
    render,
    props: {
      "data-slot": "severity-badge",
      "data-severity": severity,
      className: cn(severityBadgeVariants({ appearance, severity, size })),
      children: (
        <>
          {showDot ? (
            <span
              data-slot="severity-badge-dot"
              aria-hidden
              className="size-1.5 shrink-0 rounded-full bg-current"
            />
          ) : null}
          {children ?? SEVERITY_LABEL[severity]}
        </>
      ),
      ...props,
    },
  })
}

export { SeverityBadge, severityBadgeVariants }
export type { SeverityBadgeProps, Severity }
