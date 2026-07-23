import * as React from "react"
import { NumberField as NumberFieldPrimitive } from "@base-ui/react/number-field"
import { cva, type VariantProps } from "class-variance-authority"
import { Minus, Plus } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Number Input
 *
 * A numeric input with increment/decrement steppers and pointer scrubbing,
 * built on the Base UI NumberField primitive. It handles locale-aware parsing
 * and formatting, keyboard stepping, min/max clamping, and native form
 * integration. An optional `label` and `description`/`error` slot render around
 * the control (associated for assistive tech).
 *
 * Follows the AEGIS Input reference (`references/spec/Input.dc.html`): resting
 * `border-strong`, `accent-strong` hover border, a 3px `accent-soft` focus ring,
 * and the 32 / 40 / 48px size scale. Public API is CLOSED — no `className` /
 * `style`; sizing is the semantic `size` prop.
 */

const groupVariants = cva(
  cn(
    "flex w-full items-stretch overflow-hidden rounded-lg border border-strong bg-background text-foreground transition-colors",
    "focus-within:border-accent-strong focus-within:ring-3 focus-within:ring-accent-soft",
    "has-data-[disabled]:pointer-events-none has-data-[disabled]:opacity-50",
    "data-[invalid]:border-destructive data-[invalid]:focus-within:ring-destructive/30"
  ),
  {
    variants: {
      size: {
        sm: "h-8 text-[0.8rem]",
        md: "h-10 text-sm",
        lg: "h-12 text-base",
      },
    },
    defaultVariants: { size: "md" },
  }
)

const stepperVariants = cva(
  cn(
    "flex shrink-0 items-center justify-center text-muted-foreground transition-colors select-none",
    "hover:bg-surface-2 hover:text-foreground active:bg-surface-3",
    "outline-none focus-visible:bg-surface-2 focus-visible:text-foreground",
    "disabled:pointer-events-none disabled:opacity-40"
  ),
  {
    variants: {
      size: {
        sm: "w-7 [&_svg]:size-3.5",
        md: "w-9 [&_svg]:size-4",
        lg: "w-11 [&_svg]:size-5",
      },
    },
    defaultVariants: { size: "md" },
  }
)

type NumberInputProps = Omit<
  React.ComponentProps<typeof NumberFieldPrimitive.Root>,
  "className" | "style"
> &
  VariantProps<typeof groupVariants> & {
    /** Visible label above the control. */
    label?: React.ReactNode
    /** Helper text below the control. */
    description?: React.ReactNode
    /** Validation message; shown whenever present. Also paints the error state. */
    error?: React.ReactNode
    /** Placeholder shown when empty. */
    placeholder?: string
    /** Hide the +/- stepper buttons (keeps keyboard + scrub). */
    hideSteppers?: boolean
  }

function NumberInput({
  size = "md",
  label,
  description,
  error,
  placeholder,
  hideSteppers = false,
  id,
  ...root
}: NumberInputProps) {
  const reactId = React.useId()
  const fieldId = id ?? reactId
  const invalid = error != null

  return (
    <div data-slot="number-input" className="flex flex-col gap-1.5">
      {label != null && (
        <label
          htmlFor={fieldId}
          className="text-sm font-medium text-foreground select-none"
        >
          {label}
        </label>
      )}

      <NumberFieldPrimitive.Root id={fieldId} {...root}>
        <NumberFieldPrimitive.Group
          data-slot="number-input-group"
          data-invalid={invalid ? "" : undefined}
          className={cn(groupVariants({ size }))}
        >
          {!hideSteppers && (
            <NumberFieldPrimitive.Decrement
              data-slot="number-input-decrement"
              aria-label="Decrease"
              className={cn(
                stepperVariants({ size }),
                "border-r border-border"
              )}
            >
              <Minus />
            </NumberFieldPrimitive.Decrement>
          )}

          <NumberFieldPrimitive.Input
            data-slot="number-input-control"
            placeholder={placeholder}
            aria-invalid={invalid || undefined}
            className={cn(
              "w-full min-w-0 flex-1 bg-transparent px-3 text-center tabular-nums outline-none",
              "placeholder:text-muted-foreground",
              "disabled:cursor-not-allowed"
            )}
          />

          {!hideSteppers && (
            <NumberFieldPrimitive.Increment
              data-slot="number-input-increment"
              aria-label="Increase"
              className={cn(
                stepperVariants({ size }),
                "border-l border-border"
              )}
            >
              <Plus />
            </NumberFieldPrimitive.Increment>
          )}
        </NumberFieldPrimitive.Group>
      </NumberFieldPrimitive.Root>

      {description != null && !invalid && (
        <p
          data-slot="number-input-description"
          className="text-muted-foreground text-xs"
        >
          {description}
        </p>
      )}
      {invalid && (
        <p
          data-slot="number-input-error"
          className="text-destructive text-xs font-medium"
        >
          {error}
        </p>
      )}
    </div>
  )
}

export { NumberInput, groupVariants as numberInputGroupVariants }
export type { NumberInputProps }
