"use client";

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Alert / Banner
 *
 * A persistent inline status message. Composed of `Alert` (the region),
 * `AlertTitle`, and `AlertDescription`. A grid layout aligns an optional leading
 * icon with the copy. Severity variants map onto the AEGIS accent/severity
 * tokens — never hard-coded colors. Use `role="alert"` (default) for urgent
 * messages, or override to `status`/`region` for advisory banners.
 */

/* C1 — Alert now expresses hue as `tone` and fill treatment as `variant`, the
   same two axes as Badge, StatusPill, Tag, Callout and SeverityBadge. It used
   to collapse both into `variant`, so `<Alert tone="warning">` silently did
   nothing.

   Backwards compatibility is real, not nominal: the legacy hue names are still
   accepted in `variant` and mapped onto `tone`, and `tone="neutral"` renders
   byte-identically to the old `variant="default"`. The audit's version mapped
   `default -> info` and defaulted to `tone: "info"`, which would have silently
   turned every existing bare <Alert> from a neutral card into an info tint. */
const alertVariants = cva(
  "relative grid w-full grid-cols-[0_1fr] items-start gap-y-0.5 rounded-lg border px-4 py-3 text-sm has-[>svg]:grid-cols-[calc(var(--spacing)*5)_1fr] has-[>svg]:gap-x-3 [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      // Fill treatment — reads the hue from the `--tone` property set below.
      variant: {
        soft: "text-(--tone-ink) bg-[color-mix(in_oklch,var(--tone),transparent_88%)] border-transparent",
        solid: "text-on-tone bg-(--tone) border-transparent",
        outline: "text-(--tone-ink) bg-transparent border-(--tone)",
      },
      // Semantic hue — sets `--tone` (fill) and `--tone-ink` (accessible text).
      tone: {
        neutral: "[--tone:var(--muted-foreground)] [--tone-ink:var(--muted-foreground)]",
        accent: "[--tone:var(--accent-strong)] [--tone-ink:var(--accent-strong)]",
        info: "[--tone:var(--sev-low)] [--tone-ink:var(--sev-low-ink)]",
        success: "[--tone:var(--success)] [--tone-ink:var(--success-ink)]",
        warning: "[--tone:var(--warning)] [--tone-ink:var(--warning-ink)]",
        danger: "[--tone:var(--destructive)] [--tone-ink:var(--destructive-ink)]",
      },
    },
    compoundVariants: [
      // Preserves the previous `variant="default"` exactly: a plain card
      // surface with a hairline border, NOT a tinted wash.
      {
        tone: "neutral",
        variant: "soft",
        className: "bg-card text-card-foreground border-border",
      },
      { tone: "neutral", variant: "solid", className: "bg-surface-3 text-foreground" },
      // Matches Badge: the deeper solid so white clears AA in both themes.
      { tone: "accent", variant: "solid", className: "bg-primary-solid text-white" },
    ],
    defaultVariants: { tone: "neutral", variant: "soft" },
  }
)

type AlertTone = NonNullable<VariantProps<typeof alertVariants>["tone"]>
type AlertVariant = NonNullable<VariantProps<typeof alertVariants>["variant"]>

/** Legacy hue names that used to live on `variant`. Removal target: v0.3.0. */
const LEGACY_VARIANT_TONE: Record<string, AlertTone> = {
  default: "neutral",
  info: "info",
  success: "success",
  warning: "warning",
  destructive: "danger",
}

type AlertProps = Omit<React.ComponentProps<"div">, "className" | "style"> & {
  /** Semantic hue. Default `neutral`. */
  tone?: AlertTone
  /**
   * Fill treatment. Default `soft`.
   *
   * @deprecated Passing a hue name (`default` | `info` | `success` |
   * `warning` | `destructive`) is the pre-0.1 API; it is mapped onto `tone`
   * and will be removed in v0.3.0. Pass `tone` instead.
   */
  variant?: AlertVariant | keyof typeof LEGACY_VARIANT_TONE
}

function Alert({ tone, variant, role = "alert", ...props }: AlertProps) {
  let resolvedTone: AlertTone | undefined = tone
  let resolvedVariant: AlertVariant | undefined

  if (variant && variant in LEGACY_VARIANT_TONE) {
    // Legacy call site: the hue arrived in `variant`. An explicit `tone` wins.
    resolvedTone = tone ?? LEGACY_VARIANT_TONE[variant]
    resolvedVariant = "soft"
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[AEGIS] <Alert variant="${variant}"> is deprecated: \`variant\` now ` +
          `selects the fill treatment (soft | solid | outline) and the hue ` +
          `moved to \`tone\`. Use <Alert tone="${resolvedTone}"> instead. ` +
          `The legacy form is removed in v0.3.0.`
      )
    }
  } else {
    resolvedVariant = variant as AlertVariant | undefined
  }

  return (
    <div
      data-slot="alert"
      role={role}
      data-tone={resolvedTone ?? "neutral"}
      className={cn(alertVariants({ tone: resolvedTone, variant: resolvedVariant }))}
      {...props}
    />
  )
}

function AlertTitle({
  ...props
}: Omit<React.ComponentProps<"div">, "className" | "style">) {
  return (
    <div
      data-slot="alert-title"
      className={cn("col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight")}
      {...props}
    />
  )
}

function AlertDescription({
  ...props
}: Omit<React.ComponentProps<"div">, "className" | "style">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "col-start-2 grid justify-items-start gap-1 text-sm text-pretty [&_p]:leading-relaxed"
      )}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, alertVariants }
export type { AlertProps, AlertTone, AlertVariant }
