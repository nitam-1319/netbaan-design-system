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

const alertVariants = cva(
  "relative grid w-full grid-cols-[0_1fr] items-start gap-y-0.5 rounded-lg border px-4 py-3 text-sm has-[>svg]:grid-cols-[calc(var(--spacing)*5)_1fr] has-[>svg]:gap-x-3 [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground border-border",
        info: "border-transparent bg-[color-mix(in_oklch,var(--sev-low),transparent_88%)] text-sev-low-ink",
        success:
          "border-transparent bg-[color-mix(in_oklch,var(--success),transparent_88%)] text-success-ink",
        warning:
          "border-transparent bg-[color-mix(in_oklch,var(--warning),transparent_88%)] text-warning-ink",
        destructive:
          "border-transparent bg-destructive/10 text-destructive-ink dark:bg-destructive/15",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  variant = "default",
  role = "alert",
  ...props
}: Omit<React.ComponentProps<"div">, "className" | "style"> &
  VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role={role}
      className={cn(alertVariants({ variant }))}
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
