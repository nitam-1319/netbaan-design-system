"use client";

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Fieldset as BaseFieldset } from "@base-ui/react/fieldset"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Fieldset
 *
 * A semantic grouping of related form controls under a shared `legend`, built
 * on the Base UI `Fieldset` primitive (`<fieldset>` + auto-associated legend).
 * Use it to break a long form into labelled sections. The `plain` variant is
 * pure structure (legend + optional description + a spaced body); the `card`
 * variant wraps the group in a `border` / `radius` / `padding` surface for
 * heavier separation. Disabling the fieldset visually and programmatically
 * disables the controls inside it.
 *
 * Public API is CLOSED — no `className` / `style` / `render`; visual weight is
 * the semantic `variant` prop. See `.agent/rules/API_RULES.md`.
 */

const rootVariants = cva("min-w-0 border-0", {
  variants: {
    variant: {
      plain: "p-0",
      card: "rounded-xl border border-border bg-card p-5 shadow-elevated",
    },
  },
  defaultVariants: { variant: "plain" },
})

type FieldsetProps = Omit<
  BaseFieldset.Root.Props,
  "className" | "style" | "render"
> &
  VariantProps<typeof rootVariants> & {
    /** The group's accessible title, rendered as the legend. */
    legend?: React.ReactNode
    /** Supporting text shown under the legend. */
    description?: React.ReactNode
  }

function Fieldset({
  variant = "plain",
  legend,
  description,
  disabled,
  children,
  ...root
}: FieldsetProps) {
  const reactId = React.useId()
  const descId = `${reactId}-desc`

  return (
    <BaseFieldset.Root
      disabled={disabled}
      aria-describedby={description != null ? descId : undefined}
      data-slot="fieldset"
      className={cn(rootVariants({ variant }))}
      {...root}
    >
      {legend != null && (
        <BaseFieldset.Legend
          data-slot="fieldset-legend"
          className={cn(
            "text-sm font-semibold text-foreground select-none",
            disabled && "opacity-50"
          )}
        >
          {legend}
        </BaseFieldset.Legend>
      )}

      {description != null && (
        <p
          id={descId}
          data-slot="fieldset-description"
          className={cn(
            "mt-1 text-muted-foreground text-xs",
            disabled && "opacity-50"
          )}
        >
          {description}
        </p>
      )}

      <div
        data-slot="fieldset-body"
        className={cn(
          "flex flex-col gap-4",
          (legend != null || description != null) && "mt-4"
        )}
      >
        {children}
      </div>
    </BaseFieldset.Root>
  )
}

export { Fieldset, rootVariants as fieldsetVariants }
export type { FieldsetProps }
