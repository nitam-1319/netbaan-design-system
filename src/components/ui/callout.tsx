import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import {
  Info,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Lightbulb,
} from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Callout
 *
 * A prominent inline emphasis block for a single important aside — a tip, a
 * heads-up, a caveat — most at home in documentation and long-form content. It
 * bakes in a tone-appropriate leading icon and a left accent bar over a soft
 * tinted surface, so it stands apart from the surrounding prose. Unlike the
 * composable **Alert** banner, a Callout is a single element with an optional
 * `title` and its body as `children`.
 *
 * Public API is CLOSED — no `className` / `style`; use the semantic `tone`,
 * `title`, and `icon` props. All colour comes from AEGIS tokens.
 */

const calloutVariants = cva(
  cn(
    "w-full rounded-lg border border-l-4 px-4 py-3 text-sm text-pretty",
    "[&_a]:font-medium [&_a]:underline [&_a]:underline-offset-4"
  ),
  {
    variants: {
      tone: {
        note: "border-border border-l-border bg-muted/40 text-foreground",
        info: "border-transparent border-l-current bg-[color-mix(in_oklch,var(--sev-low),transparent_88%)] text-sev-low-ink",
        success:
          "border-transparent border-l-current bg-[color-mix(in_oklch,var(--success),transparent_88%)] text-success-ink",
        warning:
          "border-transparent border-l-current bg-[color-mix(in_oklch,var(--warning),transparent_88%)] text-warning-ink",
        danger:
          "border-transparent border-l-current bg-[color-mix(in_oklch,var(--destructive),transparent_88%)] text-destructive-ink",
      },
    },
    defaultVariants: { tone: "note" },
  }
)

const defaultIcons = {
  note: Lightbulb,
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: AlertCircle,
} as const

type CalloutProps = Omit<React.ComponentProps<"div">, "className" | "style"> &
  VariantProps<typeof calloutVariants> & {
    /** Bold heading above the body. */
    title?: React.ReactNode
    /** Override the leading icon, or pass `false` to hide it. */
    icon?: React.ReactNode | false
  }

function Callout({
  tone = "note",
  title,
  icon,
  children,
  ...props
}: CalloutProps) {
  const DefaultIcon = defaultIcons[tone ?? "note"]
  const showIcon = icon !== false
  const iconNode =
    icon != null && icon !== false ? (
      icon
    ) : (
      <DefaultIcon aria-hidden="true" />
    )

  return (
    <div
      data-slot="callout"
      className={cn(calloutVariants({ tone }))}
      {...props}
    >
      <div className="flex gap-3">
        {showIcon && (
          <span
            data-slot="callout-icon"
            className="mt-0.5 shrink-0 [&>svg]:size-[1.125rem]"
          >
            {iconNode}
          </span>
        )}
        <div data-slot="callout-content" className="min-w-0 flex-1">
          {title != null && (
            <div
              data-slot="callout-title"
              className="mb-0.5 font-semibold tracking-tight"
            >
              {title}
            </div>
          )}
          <div
            data-slot="callout-body"
            className="text-foreground/85 [&_p]:leading-relaxed [&_p:not(:last-child)]:mb-2"
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export { Callout, calloutVariants }
export type { CalloutProps }
