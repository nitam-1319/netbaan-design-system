"use client";

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Form Actions
 *
 * The action row at the foot of a form — submit, cancel, and any secondary
 * buttons. It standardises their alignment, spacing, and wrapping so every form
 * ends the same way. `align="end"` (default) puts the primary action on the
 * inline-end edge; `between` splits a leading action (e.g. "Back") from the
 * trailing ones. An optional top `divider` separates it from the fields, and
 * `sticky` pins it to the bottom of a scrolling form on a translucent bar.
 *
 * Alignment is direction-aware: flexbox main-start/end follow `direction`, so
 * `end` sits on the correct edge in both LTR and RTL with no change.
 *
 * Public API is CLOSED — no `className` / `style`. Place AEGIS `Button`s inside.
 * See `.agent/rules/API_RULES.md`.
 */

const formActionsVariants = cva("flex flex-wrap items-center gap-3", {
  variants: {
    align: {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
    },
    divider: {
      true: "border-t border-border pt-4",
      false: "",
    },
    sticky: {
      true: "sticky bottom-0 z-10 border-t border-border bg-background/80 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      false: "",
    },
    // C2: carried over from the FormProvider-local FormActions this component
    // replaced. On narrow viewports the row becomes a reversed column, so the
    // primary action (last in DOM order, and so last in the tab order) sits on
    // top where a thumb reaches it first.
    stack: {
      true: "flex-col-reverse sm:flex-row",
      false: "",
    },
  },
  defaultVariants: {
    align: "end",
    divider: false,
    sticky: false,
    stack: false,
  },
})

type FormActionsProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style"
> &
  VariantProps<typeof formActionsVariants> & {
    /** Alignment of the actions along the row. Default `end`. */
    align?: "start" | "center" | "end" | "between"
    /** Draw a top border separating the row from the fields. Default `false`. */
    divider?: boolean
    /** Pin the row to the bottom of a scrolling form. Default `false`. */
    sticky?: boolean
    /**
     * Stack the actions as a reversed column below the `sm` breakpoint, so the
     * primary action sits on top on narrow viewports. Default `false`.
     */
    stack?: boolean
  }

function FormActions({
  align = "end",
  divider = false,
  sticky = false,
  stack = false,
  ...props
}: FormActionsProps) {
  return (
    <div
      data-slot="form-actions"
      role="group"
      data-align={align}
      className={cn(formActionsVariants({ align, divider, sticky, stack }))}
      {...props}
    />
  )
}

export { FormActions, formActionsVariants }
export type { FormActionsProps }
