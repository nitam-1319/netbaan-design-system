import * as React from "react"
import { Field as FieldPrimitive } from "@base-ui/react/field"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import {
  FormField,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/form-field"

/**
 * AEGIS — Textarea (Interactive tier, closed API)
 *
 * The batteries-included multi-line text input: the sibling of `TextField`, a
 * prop-driven convenience wrapper that composes the `FormField` family (label +
 * control + helper text + validation message) into one component for the common
 * case. It is built on the same Base UI `Field` primitive as `FormField`, so
 * label association, `aria-describedby`, `aria-invalid`, and native validity all
 * come for free — the only difference from `TextField` is that the control is a
 * `<textarea>` (swapped in via Base UI's `render`), sized by height instead of a
 * single line.
 *
 * For layouts the flat API can't express (a field with two controls, a custom
 * error arrangement), compose the `FormField` parts directly instead.
 *
 * Public API is CLOSED: no `className` / `style`. Sizing is the semantic `size`
 * prop; layout between fields belongs in `Box`/`Stack`.
 * See `.agent/rules/API_RULES.md` and `.agent/DECISIONS.md` (escape-hatch policy).
 */

const textareaVariants = cva(
  cn(
    "border-input bg-background text-foreground placeholder:text-muted-foreground dark:bg-input/30 flex w-full resize-y rounded-lg border bg-clip-padding py-2 transition-all outline-none",
    "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3",
    "disabled:pointer-events-none disabled:resize-none disabled:opacity-50",
    "aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-invalid:ring-3 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"
  ),
  {
    variants: {
      size: {
        sm: "min-h-16 px-2.5 text-[0.8rem]",
        default: "min-h-20 px-2.5 text-sm",
        lg: "min-h-24 px-3 text-sm",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

type TextareaProps = Omit<
  React.ComponentProps<typeof FieldPrimitive.Control>,
  "className" | "style" | "size" | "render"
> &
  VariantProps<typeof textareaVariants> & {
    /** The field's visible label. */
    label?: React.ReactNode
    /** Helper text shown below the control, linked via `aria-describedby`. */
    description?: React.ReactNode
    /**
     * A validation message. Shown whenever present (externally controlled), so
     * pair it with your own `invalid` / `aria-invalid` state. For native-validity
     * driven messages, compose the `FormField` parts with `FieldError match=…`.
     */
    error?: React.ReactNode
    /** Number of visible text rows (native textarea `rows`). */
    rows?: number
    /** When to validate the field. */
    validationMode?: React.ComponentProps<typeof FormField>["validationMode"]
    /** Custom validation callback. */
    validate?: React.ComponentProps<typeof FormField>["validate"]
  }

function Textarea({
  label,
  description,
  error,
  size,
  name,
  disabled,
  rows,
  validationMode,
  validate,
  ...control
}: TextareaProps) {
  return (
    <FormField
      data-slot="textarea"
      name={name}
      disabled={disabled}
      validationMode={validationMode}
      validate={validate}
    >
      {label ? <FieldLabel>{label}</FieldLabel> : null}
      <FieldPrimitive.Control
        data-slot="textarea-control"
        className={cn(textareaVariants({ size }))}
        render={<textarea rows={rows} />}
        {...control}
      />
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      {error ? <FieldError match>{error}</FieldError> : null}
    </FormField>
  )
}

export { Textarea, textareaVariants }
export type { TextareaProps }
