import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Status Indicator
 *
 * A bare presence / health dot — optionally with an inline label. Unlike
 * `StatusPill` (a chip on a soft background) this is just the mark: use it in an
 * avatar corner, a table cell, a nav item, or a legend where a chip would be too
 * heavy. `status` maps to a semantic colour; `pulse` animates the dot
 * (`animate-pulse-dot`) for live/ongoing states; `ping` adds the expanding ring
 * (`animate-status-ping`) for "online now".
 *
 * The public API is CLOSED — no `className` / `style`; use the semantic
 * `status`, `size`, `pulse`, and `ping` props. Colour is token-driven.
 * See `.agent/rules/API_RULES.md`.
 */

const dotVariants = cva("relative inline-flex shrink-0 rounded-full bg-current", {
  variants: {
    status: {
      online: "text-success",
      away: "text-warning",
      busy: "text-destructive",
      offline: "text-muted-foreground",
      neutral: "text-muted-foreground",
      accent: "text-primary",
    },
    size: {
      sm: "size-2",
      md: "size-2.5",
      lg: "size-3",
    },
  },
  defaultVariants: { status: "online", size: "md" },
})

const rootVariants = cva(
  "inline-flex w-fit items-center align-middle text-foreground select-none",
  {
    variants: {
      size: {
        sm: "gap-1.5 text-[0.8rem]",
        md: "gap-2 text-sm",
        lg: "gap-2 text-sm",
      },
    },
    defaultVariants: { size: "md" },
  }
)

/** Default screen-reader wording for each status when no `label` is given. */
const STATUS_TEXT: Record<
  NonNullable<VariantProps<typeof dotVariants>["status"]>,
  string
> = {
  online: "Online",
  away: "Away",
  busy: "Busy",
  offline: "Offline",
  neutral: "Status",
  accent: "Status",
}

type StatusIndicatorProps = Omit<
  React.ComponentProps<"span">,
  "className" | "style"
> &
  VariantProps<typeof dotVariants> & {
    /** Visible text beside the dot. When omitted the dot is labelled for SR. */
    label?: React.ReactNode
    /** Slowly fade the dot to signal a live / ongoing state. */
    pulse?: boolean
    /** Emit an expanding ring behind the dot (e.g. "online now"). */
    ping?: boolean
    /**
     * Accessible name when there is no visible `label`. Defaults to a word for
     * the `status` (e.g. "Online"). Ignored when `label` is present.
     */
    srLabel?: string
  }

function StatusIndicator({
  status = "online",
  size = "md",
  label,
  pulse = false,
  ping = false,
  srLabel,
  children,
  ...props
}: StatusIndicatorProps) {
  const visibleLabel = label ?? children
  const hasLabel = visibleLabel != null
  const accessibleText =
    srLabel ?? STATUS_TEXT[status ?? "online"]

  return (
    <span
      data-slot="status-indicator"
      data-status={status ?? undefined}
      className={cn(rootVariants({ size }))}
      {...props}
    >
      <span
        aria-hidden="true"
        data-slot="status-indicator-dot"
        className={cn(dotVariants({ status, size }))}
      >
        {ping && (
          <span
            data-slot="status-indicator-ping"
            className={cn(
              "absolute inset-0 rounded-full bg-current animate-status-ping"
            )}
          />
        )}
        {pulse && !ping && (
          <span
            data-slot="status-indicator-pulse"
            className={cn(
              "absolute inset-0 rounded-full bg-current animate-pulse-dot"
            )}
          />
        )}
      </span>
      {hasLabel ? (
        <span data-slot="status-indicator-label">{visibleLabel}</span>
      ) : (
        <span className="sr-only">{accessibleText}</span>
      )}
    </span>
  )
}

export { StatusIndicator, dotVariants as statusIndicatorDotVariants }
export type { StatusIndicatorProps }
