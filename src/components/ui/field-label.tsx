"use client";

import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Field Label (Forms, closed API)
 *
 * A standalone, context-free form label exported as `Label`. Renders a
 * `<label>` by default and associates with a control through the native
 * `htmlFor` prop. Use it to label any input when you are laying out a field by
 * hand — a checkbox row, a control inside a `Box`/`Stack`, or a custom
 * composite the `FormField` wrapper doesn't cover.
 *
 * Deliberately named `Label`, not `FieldLabel`: `FormField`'s `FieldLabel` is
 * bound to the Base UI `Field.Root` context and auto-wires `htmlFor` / disabled
 * state to the field's control. This atom carries no context — reach for
 * `Label` outside a `Field`, and for `FormField` when you want the wiring done
 * for you. See `.agent/DECISIONS.md` (Forms atoms are context-free siblings of
 * the Field parts).
 *
 * Optional `required` / `optional` render an indicator after the text so the
 * requirement is conveyed in text, never colour alone. Public API is CLOSED —
 * no `className` / `style`; customise via the semantic `size` prop. All colour
 * comes from AEGIS tokens. See `.agent/rules/API_RULES.md`.
 */

const labelVariants = cva(
  cn(
    "inline-flex items-center gap-1 font-medium text-foreground select-none",
    "data-[disabled]:opacity-50"
  ),
  {
    variants: {
      size: {
        sm: "text-[0.8rem]",
        md: "text-sm",
        lg: "text-base",
      },
    },
    defaultVariants: { size: "md" },
  }
)

type LabelProps = Omit<
  useRender.ComponentProps<"label">,
  "className" | "style"
> &
  VariantProps<typeof labelVariants> & {
    /** Show a required indicator (`*`) plus an sr-only "(required)". */
    required?: boolean
    /** Show a muted "(optional)" hint after the label text. */
    optional?: boolean
    /** Dim the label to match a disabled control. */
    disabled?: boolean
  }

function Label({
  size = "md",
  required = false,
  optional = false,
  disabled = false,
  children,
  render = <label />,
  ...props
}: LabelProps) {
  return useRender({
    render,
    props: {
      "data-slot": "field-label",
      "data-disabled": disabled ? "" : undefined,
      className: cn(labelVariants({ size })),
      children: (
        <>
          {children}
          {required && (
            <>
              <span aria-hidden="true" className="text-destructive-ink">
                *
              </span>
              <span className="sr-only"> (required)</span>
            </>
          )}
          {!required && optional && (
            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
          )}
        </>
      ),
      ...props,
    },
  })
}

export { Label, labelVariants }
export type { LabelProps }
