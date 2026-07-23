import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Eye, EyeOff } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Password Input
 *
 * A single-line secret input with a show/hide reveal toggle. Sibling to
 * `NumberInput`: it shares the same AEGIS Input shell (resting `border-strong`,
 * `accent-strong` hover border, 3px `accent-soft` focus ring, 32 / 40 / 48px
 * size scale) so credential fields sit consistently beside text and number
 * fields. An optional `label`, `description`, and `error` render around the
 * control (associated for assistive tech).
 *
 * Public API is CLOSED — no `className` / `style`; sizing is the semantic `size`
 * prop. See `.agent/rules/API_RULES.md` and the AEGIS Input reference.
 */

const shellVariants = cva(
  cn(
    "flex w-full items-stretch overflow-hidden rounded-lg border border-strong bg-background text-foreground transition-colors",
    "focus-within:border-accent-strong focus-within:ring-3 focus-within:ring-accent-soft",
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

const revealVariants = cva(
  cn(
    "flex shrink-0 items-center justify-center text-muted-foreground transition-colors select-none",
    "hover:text-foreground",
    "outline-none focus-visible:text-foreground focus-visible:ring-3 focus-visible:ring-accent-soft",
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

type PasswordInputProps = Omit<
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
    /** Hide the reveal (show/hide) toggle button. */
    hideReveal?: boolean
  }

function PasswordInput({
  size = "md",
  label,
  description,
  error,
  hideReveal = false,
  id,
  disabled,
  autoComplete = "current-password",
  ...input
}: PasswordInputProps) {
  const reactId = React.useId()
  const fieldId = id ?? reactId
  const descId = `${fieldId}-desc`
  const [visible, setVisible] = React.useState(false)
  const invalid = error != null

  return (
    <div data-slot="password-input" className="flex flex-col gap-1.5">
      {label != null && (
        <label
          htmlFor={fieldId}
          className="text-sm font-medium text-foreground select-none"
        >
          {label}
        </label>
      )}

      <div
        data-slot="password-input-shell"
        data-invalid={invalid ? "" : undefined}
        data-disabled={disabled ? "" : undefined}
        className={cn(shellVariants({ size }))}
      >
        <input
          id={fieldId}
          type={visible ? "text" : "password"}
          disabled={disabled}
          autoComplete={autoComplete}
          aria-invalid={invalid || undefined}
          aria-describedby={description != null || invalid ? descId : undefined}
          data-slot="password-input-control"
          className={cn(
            "w-full min-w-0 flex-1 bg-transparent px-3 outline-none",
            "placeholder:text-muted-foreground",
            "disabled:cursor-not-allowed"
          )}
          {...input}
        />

        {!hideReveal && (
          <button
            type="button"
            tabIndex={-1}
            disabled={disabled}
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            onClick={() => setVisible((v) => !v)}
            data-slot="password-input-reveal"
            className={cn(revealVariants({ size }), "border-l border-border")}
          >
            {visible ? <EyeOff /> : <Eye />}
          </button>
        )}
      </div>

      {description != null && !invalid && (
        <p
          id={descId}
          data-slot="password-input-description"
          className="text-muted-foreground text-xs"
        >
          {description}
        </p>
      )}
      {invalid && (
        <p
          id={descId}
          data-slot="password-input-error"
          className="text-destructive text-xs font-medium"
        >
          {error}
        </p>
      )}
    </div>
  )
}

export { PasswordInput, shellVariants as passwordInputShellVariants }
export type { PasswordInputProps }
