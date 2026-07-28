import * as React from "react"
import { Field as FieldPrimitive } from "@base-ui/react/field"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Form Field (Interactive tier, closed API)
 *
 * The labelled-control building block for forms, built on the Base UI Field
 * primitive. `FormField` (the root) wires a label, control, helper text and
 * validation message together — associating `htmlFor` / `aria-describedby` /
 * `aria-invalid` and driving validity state — so every input in the system
 * gets consistent labelling and error handling for free.
 *
 * This is the foundation the input components (Text Field, Textarea, Select,
 * …) compose. `FieldControl` renders an `<input>` by default; swap the rendered
 * element with Base UI's `render` prop (e.g. a `<textarea>`), which is
 * composition, not a styling hatch.
 *
 * Public API is CLOSED: no `className` / `style` on any part. Control sizing is
 * the semantic `size` prop; layout between fields belongs in `Box`/`Stack`.
 * See `.agent/rules/API_RULES.md` and `.agent/DECISIONS.md` (escape-hatch policy).
 */

/* ------------------------------------------------------------------ Root -- */

function FormField(
  props: Omit<
    React.ComponentProps<typeof FieldPrimitive.Root>,
    "className" | "style"
  >
) {
  return (
    <FieldPrimitive.Root
      data-slot="form-field"
      className={cn("flex flex-col gap-1.5")}
      {...props}
    />
  )
}

/* ----------------------------------------------------------------- Label -- */

function FieldLabel(
  props: Omit<
    React.ComponentProps<typeof FieldPrimitive.Label>,
    "className" | "style"
  >
) {
  return (
    <FieldPrimitive.Label
      data-slot="field-label"
      className={cn(
        "text-foreground text-sm font-medium select-none",
        "data-[disabled]:opacity-50"
      )}
      {...props}
    />
  )
}

/* --------------------------------------------------------------- Control -- */

const fieldControlVariants = cva(
  cn(
    "border-border-strong bg-background text-foreground placeholder:text-muted-foreground dark:bg-surface-2/30 flex w-full rounded-lg border bg-clip-padding transition-all outline-none",
    "focus-visible:border-primary focus-visible:ring-accent-soft focus-visible:ring-3",
    "disabled:pointer-events-none disabled:opacity-50",
    "aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-invalid:ring-3 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"
  ),
  {
    variants: {
      size: {
        sm: "h-7 px-2.5 text-[0.8rem]",
        default: "h-8 px-2.5 text-sm",
        lg: "h-9 px-3 text-sm",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

type FieldControlProps = Omit<
  React.ComponentProps<typeof FieldPrimitive.Control>,
  "className" | "style" | "size"
> &
  VariantProps<typeof fieldControlVariants>

function FieldControl({ size, ...props }: FieldControlProps) {
  return (
    <FieldPrimitive.Control
      data-slot="field-control"
      className={cn(fieldControlVariants({ size }))}
      {...props}
    />
  )
}

/* ----------------------------------------------------- Description (help) -- */

function FieldDescription(
  props: Omit<
    React.ComponentProps<typeof FieldPrimitive.Description>,
    "className" | "style"
  >
) {
  return (
    <FieldPrimitive.Description
      data-slot="field-description"
      className={cn("text-muted-foreground text-xs")}
      {...props}
    />
  )
}

/* ------------------------------------------------ Error (validation msg) -- */

function FieldError(
  props: Omit<
    React.ComponentProps<typeof FieldPrimitive.Error>,
    "className" | "style"
  >
) {
  return (
    <FieldPrimitive.Error
      data-slot="field-error"
      className={cn("text-destructive-ink text-xs font-medium")}
      {...props}
    />
  )
}

export {
  FormField,
  FieldLabel,
  FieldControl,
  FieldDescription,
  FieldError,
}
