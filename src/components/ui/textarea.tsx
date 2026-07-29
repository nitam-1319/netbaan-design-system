"use client";

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
 * AEGIS — Textarea (Interactive tier, closed API, restored to reference)
 *
 * The multi-line sibling of `TextField`, sharing the Input visual language from
 * `.agent/references/spec/Input.dc.html`: the outline / filled / flush variants
 * (default outline), the sm/md/lg size scale (default md), and the resting /
 * hover / focus / error / success / disabled / read-only states. Resting border
 * is `border-border-strong`; focus lights an accent border with a 3px
 * `accent-soft` ring. Built on the same Base UI `Field` primitive as `FormField`,
 * so label association, `aria-describedby`, `aria-invalid` and native validity
 * come for free — the only difference from `TextField` is that the control is a
 * `<textarea>` (swapped in via Base UI's `render`), sized by height, vertically
 * resizable, and auto-growing to fit its content (`field-sizing`).
 *
 * For layouts the flat API can't express (a field with two controls, a custom
 * error arrangement), compose the `FormField` parts directly instead.
 *
 * Public API is CLOSED: no `className` / `style`. Treatment is the semantic
 * `variant` / `size` props; layout between fields belongs in `Box` / `Stack`.
 * Tokens only. See `.agent/rules/API_RULES.md` and `.agent/DECISIONS.md`.
 */

const textareaVariants = cva(
  cn(
    "peer field-sizing-content w-full resize-y bg-clip-padding font-medium text-foreground placeholder:text-muted-foreground outline-none transition-[color,background-color,border-color,box-shadow] duration-150",
    "hover:border-accent-strong",
    "focus-visible:border-primary focus-visible:bg-surface focus-visible:ring-[3px] focus-visible:ring-accent-soft",
    "aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20",
    "read-only:bg-surface-3 read-only:text-muted-foreground",
    "disabled:pointer-events-none disabled:resize-none disabled:cursor-not-allowed disabled:opacity-50"
  ),
  {
    variants: {
      size: {
        sm: "min-h-16 rounded-[8px] px-3 py-2 text-xs",
        md: "min-h-20 rounded-[9px] px-3.5 py-2.5 text-sm",
        lg: "min-h-28 rounded-[11px] px-4 py-3 text-base",
      },
      variant: {
        outline: "border border-border-strong bg-surface-2",
        filled: "border border-transparent bg-surface-3",
        flush:
          "rounded-none border-0 border-b border-border-strong bg-transparent px-0.5",
      },
      /**
       * Forces a visual state — handy for documentation, screenshots and the
       * story state matrix. Real interaction states (hover / focus / invalid /
       * disabled / read-only) apply automatically from the control's props.
       */
      state: {
        default: "",
        hover: "border-accent-strong",
        focus: "border-primary bg-surface ring-[3px] ring-accent-soft",
        error: "border-destructive ring-[3px] ring-destructive/20",
        success: "border-success ring-[3px] ring-success/20",
        disabled: "pointer-events-none resize-none opacity-50",
        readonly: "bg-surface-3 text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "outline",
      size: "md",
      state: "default",
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
  variant,
  size,
  state,
  label,
  description,
  error,
  name,
  disabled,
  readOnly,
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
        readOnly={readOnly}
        className={cn(textareaVariants({ variant, size, state }))}
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
