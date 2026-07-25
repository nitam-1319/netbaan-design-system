import * as React from "react"
import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"
import { cva, type VariantProps } from "class-variance-authority"
import { Check, Minus } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Checkbox (Primitive tier, closed API, restored to reference)
 *
 * Matches `.agent/references/spec/Checkbox.dc.html`: the sm/md/lg box scale
 * (16/20/24px, default md), the full state set (default / checked /
 * indeterminate / hover / focus / disabled / error / readonly), a `size` prop,
 * and built-in `label` + `description` slots. The mark pops in with the
 * signature `animate-check-pop`. Built on the Base UI Checkbox primitive, which
 * supplies `role="checkbox"`, `aria-checked` (incl. "mixed"), the paired hidden
 * input for forms, and keyboard support.
 *
 * Public API is CLOSED — no `className` / `style`; element swaps go through
 * `render`. Tokens only: resting border `border-strong`, checked fill the accent
 * gradient, focus a 3px accent-soft ring. See `.agent/rules/REFERENCE_FIDELITY.md`.
 */

const checkboxVariants = cva(
  cn(
    "peer relative flex shrink-0 items-center justify-center border border-border-strong bg-surface-2 text-primary-foreground outline-none transition-[background-color,border-color,box-shadow] duration-150",
    "hover:border-accent-strong",
    "data-[checked]:border-transparent data-[checked]:accent-fill",
    "data-[indeterminate]:border-transparent data-[indeterminate]:accent-fill",
    "focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-accent-soft",
    "aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20",
    "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-45 data-[readonly]:cursor-default"
  ),
  {
    variants: {
      size: {
        sm: "size-4 rounded-[5px]",
        md: "size-5 rounded-[6px]",
        lg: "size-6 rounded-[7px]",
      },
    },
    defaultVariants: { size: "md" },
  }
)

const markSize: Record<NonNullable<VariantProps<typeof checkboxVariants>["size"]>, string> = {
  sm: "size-3",
  md: "size-3.5",
  lg: "size-4",
}

type CheckboxProps = Omit<
  React.ComponentProps<typeof CheckboxPrimitive.Root>,
  "className" | "style"
> &
  VariantProps<typeof checkboxVariants> & {
    /** Primary option text; when present the box renders inside a clickable row. */
    label?: React.ReactNode
    /** Optional secondary line clarifying the option. */
    description?: React.ReactNode
  }

function Checkbox({ size = "md", label, description, id, ...props }: CheckboxProps) {
  const icon = markSize[size ?? "md"] ?? markSize.md

  const box = (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      id={id}
      className={cn(checkboxVariants({ size }))}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex animate-check-pop items-center justify-center text-current"
      >
        <Check
          className={cn(icon, "in-data-[indeterminate]:hidden")}
          strokeWidth={3}
        />
        <Minus
          className={cn("hidden", icon, "in-data-[indeterminate]:block")}
          strokeWidth={3}
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )

  if (label == null && description == null) return box

  return (
    <label
      data-slot="checkbox-field"
      className={cn(
        "flex cursor-pointer items-start gap-3 select-none",
        "has-data-[disabled]:cursor-not-allowed"
      )}
    >
      {box}
      <span className="flex flex-col gap-0.5 peer-data-[disabled]:opacity-45">
        {label != null ? (
          <span
            data-slot="checkbox-label"
            className="text-sm leading-none font-semibold text-foreground"
          >
            {label}
          </span>
        ) : null}
        {description != null ? (
          <span
            data-slot="checkbox-description"
            className="text-xs leading-snug text-text-faint"
          >
            {description}
          </span>
        ) : null}
      </span>
    </label>
  )
}

export { Checkbox, checkboxVariants }
