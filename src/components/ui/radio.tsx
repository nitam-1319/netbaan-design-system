import * as React from "react"
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group"
import { Radio as RadioPrimitive } from "@base-ui/react/radio"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Radio Group (Primitive tier, closed API, restored to reference)
 *
 * Matches `.agent/references/spec/Radio.dc.html`: the sm/md/lg ring scale
 * (16/20/24px, default md), the full state set (selected / hover / focus /
 * disabled / error / readonly), a `size` prop, and built-in `label` +
 * `description` slots. The inner dot pops in with the signature
 * `animate-dot-pop`. Built on the Base UI Radio Group + Radio primitives, which
 * supply `role="radiogroup"` / `role="radio"`, roving-tabindex arrow-key
 * navigation, the paired hidden input for native form submission, and full
 * controlled/uncontrolled state.
 *
 * Public API is CLOSED — no `className` / `style`; element swaps go through
 * `render`. Tokens only: resting ring `border-strong`, selected ring + dot the
 * accent gradient, focus a 3px accent-soft ring. Layout is the semantic
 * `orientation` prop. See `.agent/rules/API_RULES.md`.
 */

/* ----------------------------------------------------------------- Group -- */

type RadioGroupProps = Omit<
  React.ComponentProps<typeof RadioGroupPrimitive>,
  "className" | "style"
> & {
  orientation?: "vertical" | "horizontal"
}

function RadioGroup({ orientation = "vertical", ...props }: RadioGroupProps) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      data-orientation={orientation}
      className={cn(
        "flex gap-2.5 data-[orientation=horizontal]:flex-row data-[orientation=vertical]:flex-col"
      )}
      {...props}
    />
  )
}

/* ------------------------------------------------------------------ Item -- */

const radioVariants = cva(
  cn(
    "peer relative flex shrink-0 items-center justify-center rounded-full border border-border-strong bg-surface-2 outline-none transition-[background-color,border-color,box-shadow] duration-150",
    "hover:border-accent-strong",
    "data-[checked]:border-2 data-[checked]:border-accent",
    "focus-visible:border-accent focus-visible:ring-[3px] focus-visible:ring-accent-soft",
    "aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20",
    "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-45 data-[readonly]:cursor-default"
  ),
  {
    variants: {
      size: {
        sm: "size-4",
        md: "size-5",
        lg: "size-6",
      },
    },
    defaultVariants: { size: "md" },
  }
)

const radioDotVariants = cva(
  "block rounded-full bg-[linear-gradient(145deg,var(--accent),var(--accent-strong))] animate-dot-pop",
  {
    variants: {
      size: {
        sm: "size-[7px]",
        md: "size-[9px]",
        lg: "size-[11px]",
      },
    },
    defaultVariants: { size: "md" },
  }
)

type RadioGroupItemProps = Omit<
  React.ComponentProps<typeof RadioPrimitive.Root>,
  "className" | "style"
> &
  VariantProps<typeof radioVariants> & {
    /** Primary option text; when present the ring renders inside a clickable row. */
    label?: React.ReactNode
    /** Optional secondary line clarifying the option. */
    description?: React.ReactNode
  }

function RadioGroupItem({
  size = "md",
  label,
  description,
  ...props
}: RadioGroupItemProps) {
  const ring = (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      className={cn(radioVariants({ size }))}
      {...props}
    >
      <RadioPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="flex items-center justify-center"
      >
        <span className={cn(radioDotVariants({ size }))} />
      </RadioPrimitive.Indicator>
    </RadioPrimitive.Root>
  )

  if (label == null && description == null) return ring

  return (
    <label
      data-slot="radio-group-field"
      className={cn(
        "flex cursor-pointer items-start gap-3 select-none",
        "has-data-[disabled]:cursor-not-allowed"
      )}
    >
      {ring}
      <span className="flex flex-col gap-0.5">
        {label != null ? (
          <span
            data-slot="radio-group-label"
            className="text-sm leading-none font-semibold text-foreground peer-data-[disabled]:text-text-faint"
          >
            {label}
          </span>
        ) : null}
        {description != null ? (
          <span
            data-slot="radio-group-description"
            className="text-xs leading-snug text-text-faint"
          >
            {description}
          </span>
        ) : null}
      </span>
    </label>
  )
}

export { RadioGroup, RadioGroupItem, radioVariants }
