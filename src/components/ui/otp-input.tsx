import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { OTPField } from "@base-ui/react/otp-field"

import { cn } from "@/lib/utils"

/**
 * AEGIS — OTP Input
 *
 * A one-time-passcode / verification-code field built on the Base UI
 * `OTPField` primitive: `length` individual character slots that behave as a
 * single control (paste-to-fill, arrow-key navigation, auto-advance, backspace
 * to the previous slot). Each slot wears the AEGIS Input skin — resting
 * `border-strong`, `accent-strong` on hover, a 3px `accent-soft` focus ring —
 * and the filled slot carries an `accent-strong` border so progress reads at a
 * glance. Optional `label`, `description`, and `error` render around the group.
 *
 * Public API is CLOSED — no `className` / `style` / `render`; sizing is the
 * semantic `size` prop. See `.agent/rules/API_RULES.md`.
 */

const slotVariants = cva(
  cn(
    "m-0 rounded-lg border border-border-strong bg-background text-center font-medium text-foreground tabular-nums transition-colors",
    "outline-none",
    "hover:border-accent-strong",
    "focus:border-primary focus:ring-3 focus:ring-accent-soft",
    "data-[filled]:border-accent-strong",
    "data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
  ),
  {
    variants: {
      size: {
        sm: "size-9 text-sm",
        md: "size-11 text-base",
        lg: "size-14 text-lg",
      },
      invalid: {
        true: "border-destructive hover:border-destructive focus:border-destructive focus:ring-destructive/30 data-[filled]:border-destructive",
        false: "",
      },
    },
    defaultVariants: { size: "md", invalid: false },
  }
)

type OTPInputProps = Omit<
  OTPField.Root.Props,
  "className" | "style" | "render" | "children"
> &
  VariantProps<typeof slotVariants> & {
    /** Visible label above the group. */
    label?: React.ReactNode
    /** Helper text below the group. */
    description?: React.ReactNode
    /** Validation message; shown whenever present. Also paints the error state. */
    error?: React.ReactNode
  }

function OTPInput({
  size = "md",
  length,
  label,
  description,
  error,
  id,
  disabled,
  ...root
}: OTPInputProps) {
  const reactId = React.useId()
  const fieldId = id ?? reactId
  const descId = `${fieldId}-desc`
  const invalid = error != null

  return (
    <div data-slot="otp-input" className="flex flex-col gap-1.5">
      {label != null && (
        <label
          htmlFor={fieldId}
          className="text-sm font-medium text-foreground select-none"
        >
          {label}
        </label>
      )}

      <OTPField.Root
        id={fieldId}
        length={length}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        aria-describedby={description != null || invalid ? descId : undefined}
        data-slot="otp-input-root"
        className="flex items-center gap-2"
        {...root}
      >
        {Array.from({ length }, (_, index) => (
          <OTPField.Input
            key={index}
            aria-label={`Character ${index + 1} of ${length}`}
            data-slot="otp-input-slot"
            className={cn(slotVariants({ size, invalid }))}
          />
        ))}
      </OTPField.Root>

      {description != null && !invalid && (
        <p
          id={descId}
          data-slot="otp-input-description"
          className="text-muted-foreground text-xs"
        >
          {description}
        </p>
      )}
      {invalid && (
        <p
          id={descId}
          data-slot="otp-input-error"
          className="text-destructive text-xs font-medium"
        >
          {error}
        </p>
      )}
    </div>
  )
}

export { OTPInput, slotVariants as otpInputSlotVariants }
export type { OTPInputProps }
