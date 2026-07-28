import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Clock } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Time Picker
 *
 * A single-field time input for picking an hour/minute (and, where the platform
 * supports it, seconds via `step`). Built on the native `<input type="time">`,
 * so it inherits the platform's accessible time-editing behaviour — spin the
 * hour/minute segments with the arrow keys, type digits, and open the native
 * picker — while wearing the AEGIS Input shell.
 *
 * Sibling to `SearchInput` / `PasswordInput` / `NumberInput`: it shares the same
 * shell (resting `border-strong`, `accent-strong` hover border, 3px
 * `accent-soft` focus ring, 32 / 40 / 48px size scale) so time fields line up
 * with every other input. A leading clock glyph marks it; an optional `label`,
 * `description`, and `error` render around the control (associated for
 * assistive tech). Range and granularity come from the native `min` / `max` /
 * `step` props (e.g. `step={60}` for whole minutes, `step={1}` to expose
 * seconds). Controlled (`value` + `onChange`) and uncontrolled (`defaultValue`)
 * are both supported through the native input contract.
 *
 * Public API is CLOSED — no `className` / `style`; sizing is the semantic `size`
 * prop and `type` is fixed to `time`. See `.agent/rules/API_RULES.md` and the
 * AEGIS Input reference.
 */

const shellVariants = cva(
  cn(
    "flex w-full items-stretch overflow-hidden rounded-lg border border-border-strong bg-background text-foreground transition-colors",
    "hover:border-accent-strong",
    "focus-within:border-primary focus-within:ring-3 focus-within:ring-accent-soft",
    "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
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

const adornmentVariants = cva(
  "flex shrink-0 items-center justify-center text-muted-foreground select-none",
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

type TimePickerProps = Omit<
  React.ComponentProps<"input">,
  "className" | "style" | "size" | "type"
> &
  VariantProps<typeof shellVariants> & {
    /** Visible label above the control. */
    label?: React.ReactNode
    /** Helper text below the control. */
    description?: React.ReactNode
    /** Validation message; shown whenever present. Also paints the error state. */
    error?: React.ReactNode
  }

function TimePicker({
  size = "md",
  label,
  description,
  error,
  id,
  disabled,
  ...input
}: TimePickerProps) {
  const reactId = React.useId()
  const fieldId = id ?? reactId
  const descId = `${fieldId}-desc`
  const invalid = error != null

  return (
    <div data-slot="time-picker" className="flex flex-col gap-1.5">
      {label != null && (
        <label
          htmlFor={fieldId}
          className="text-sm font-medium text-foreground select-none"
        >
          {label}
        </label>
      )}

      <div
        data-slot="time-picker-shell"
        data-invalid={invalid ? "" : undefined}
        data-disabled={disabled ? "" : undefined}
        className={cn(shellVariants({ size }))}
      >
        <span
          data-slot="time-picker-icon"
          className={cn(adornmentVariants({ size }))}
        >
          <Clock aria-hidden="true" />
        </span>

        <input
          id={fieldId}
          type="time"
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-describedby={description != null || invalid ? descId : undefined}
          data-slot="time-picker-control"
          className={cn(
            "w-full min-w-0 flex-1 bg-transparent pe-2.5 outline-none",
            "placeholder:text-muted-foreground",
            "disabled:cursor-not-allowed",
            // The native picker indicator inherits the field colour and opens on
            // click; give it a pointer cursor without hard-coding a colour.
            "[&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
          )}
          {...input}
        />
      </div>

      {description != null && !invalid && (
        <p
          id={descId}
          data-slot="time-picker-description"
          className="text-muted-foreground text-xs"
        >
          {description}
        </p>
      )}
      {invalid && (
        <p
          id={descId}
          data-slot="time-picker-error"
          className="text-destructive-ink text-xs font-medium"
        >
          {error}
        </p>
      )}
    </div>
  )
}

export { TimePicker, shellVariants as timePickerShellVariants }
export type { TimePickerProps }
