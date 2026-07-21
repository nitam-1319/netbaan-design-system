import * as React from "react"

import {
  FormField,
  FieldLabel,
  FieldControl,
  FieldDescription,
  FieldError,
} from "@/components/ui/form-field"

/**
 * AEGIS — Text Field (Interactive tier, closed API)
 *
 * The batteries-included single-line text input: a prop-driven convenience
 * wrapper that composes the `FormField` family (label + control + helper text +
 * validation message) into one component for the common case. It is built on
 * the same Base UI Field primitive as `FormField`, so label association,
 * `aria-describedby`, `aria-invalid`, and native validity all come for free.
 *
 * For layouts the flat API can't express (a field with two controls, a custom
 * error arrangement), compose the `FormField` parts directly instead.
 *
 * Public API is CLOSED: no `className` / `style`. Sizing is the semantic `size`
 * prop; layout between fields belongs in `Box`/`Stack`.
 * See `.agent/rules/API_RULES.md` and `.agent/DECISIONS.md` (escape-hatch policy).
 */

type TextFieldProps = Omit<
  React.ComponentProps<typeof FieldControl>,
  "render"
> & {
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
  /** When to validate the field. */
  validationMode?: React.ComponentProps<typeof FormField>["validationMode"]
  /** Custom validation callback. */
  validate?: React.ComponentProps<typeof FormField>["validate"]
}

function TextField({
  label,
  description,
  error,
  name,
  disabled,
  validationMode,
  validate,
  ...control
}: TextFieldProps) {
  return (
    <FormField
      data-slot="text-field"
      name={name}
      disabled={disabled}
      validationMode={validationMode}
      validate={validate}
    >
      {label ? <FieldLabel>{label}</FieldLabel> : null}
      <FieldControl {...control} />
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      {error ? <FieldError match>{error}</FieldError> : null}
    </FormField>
  )
}

export { TextField }
export type { TextFieldProps }
