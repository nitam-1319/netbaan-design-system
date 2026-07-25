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
 * AEGIS — Text Field / Input (Interactive tier, closed API, restored to reference)
 *
 * Matches `.agent/references/spec/Input.dc.html` (Input == Text Field): the
 * outline / filled / flush variants (default outline), the sm/md/lg size scale
 * (32 / 40 / 48px, default md), leading / trailing adornment slots, and the
 * resting / hover / focus / error / success / disabled / read-only states.
 * Resting border is `border-border-strong`; focus lights an accent border with a
 * 3px `accent-soft` ring. Built on the Base UI Field primitive, so label
 * association, `aria-describedby`, `aria-invalid` and native validity come for
 * free — the label / description / error props compose the `FormField` family.
 *
 * For layouts the flat API can't express (a field with two controls, a custom
 * error arrangement), compose the `FormField` parts directly instead.
 *
 * Public API is CLOSED: no `className` / `style`. Treatment is the semantic
 * `variant` / `size` props; layout between fields belongs in `Box` / `Stack`.
 * Element polymorphism stays available through Base UI's `render` prop. Tokens only.
 * See `.agent/rules/API_RULES.md` and `.agent/DECISIONS.md` (escape-hatch policy).
 */

const textFieldVariants = cva(
  cn(
    "peer w-full bg-clip-padding font-medium text-foreground placeholder:text-muted-foreground outline-none transition-[color,background-color,border-color,box-shadow] duration-150",
    "hover:border-accent-strong",
    "focus-visible:border-accent focus-visible:bg-surface focus-visible:ring-[3px] focus-visible:ring-accent-soft",
    "aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20",
    "read-only:bg-surface-3 read-only:text-muted-foreground",
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
  ),
  {
    variants: {
      size: {
        sm: "h-8 rounded-[8px] px-3 text-xs",
        md: "h-10 rounded-[9px] px-3.5 text-sm",
        lg: "h-12 rounded-[11px] px-4 text-base",
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
        focus: "border-accent bg-surface ring-[3px] ring-accent-soft",
        error: "border-destructive ring-[3px] ring-destructive/20",
        success: "border-success ring-[3px] ring-success/20",
        disabled: "pointer-events-none opacity-50",
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

type TextFieldProps = Omit<
  React.ComponentProps<typeof FieldPrimitive.Control>,
  "className" | "style" | "size"
> &
  VariantProps<typeof textFieldVariants> & {
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
    /** Adornment rendered inside the leading edge of the field (e.g. an icon). */
    leadingIcon?: React.ReactNode
    /** Adornment rendered inside the trailing edge (e.g. a unit, clear button). */
    trailing?: React.ReactNode
    /** When to validate the field. */
    validationMode?: React.ComponentProps<typeof FormField>["validationMode"]
    /** Custom validation callback. */
    validate?: React.ComponentProps<typeof FormField>["validate"]
  }

function TextField({
  variant,
  size,
  state,
  label,
  description,
  error,
  leadingIcon,
  trailing,
  name,
  disabled,
  readOnly,
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
      <div data-slot="text-field-adornments" className="relative flex w-full items-center">
        {leadingIcon ? (
          <span
            aria-hidden
            className="text-muted-foreground pointer-events-none absolute inset-y-0 start-3 flex items-center [&_svg]:size-4"
          >
            {leadingIcon}
          </span>
        ) : null}
        <FieldPrimitive.Control
          data-slot="text-field-control"
          readOnly={readOnly}
          className={cn(
            textFieldVariants({ variant, size, state }),
            leadingIcon ? "ps-10" : undefined,
            trailing ? "pe-9" : undefined
          )}
          {...control}
        />
        {trailing ? (
          <span className="text-muted-foreground absolute inset-y-0 end-3 flex items-center [&_svg]:size-4">
            {trailing}
          </span>
        ) : null}
      </div>
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      {error ? <FieldError match>{error}</FieldError> : null}
    </FormField>
  )
}

export { TextField, textFieldVariants }
export type { TextFieldProps }
