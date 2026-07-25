import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Helper Text (Forms, closed API)
 *
 * Standalone, context-free supplementary guidance for a form control — the
 * quiet line of muted text under an input that explains format, purpose, or
 * constraints ("We'll never share your email", "8+ characters"). Renders a
 * `<p>` by default and is associated with its control by pointing the control's
 * `aria-describedby` at this element's `id`.
 *
 * Sibling of `FormField`'s Field-bound `FieldDescription` (which auto-wires
 * `aria-describedby` from the `Field.Root` context). Reach for `HelperText`
 * when composing a field by hand outside a `Field`; reach for `FormField` when
 * you want the wiring done for you. See `.agent/DECISIONS.md` (2026-07-25c).
 *
 * For an error or validation message use `ValidationMessage`, not this — helper
 * text is neutral guidance, not a failure state. Public API is CLOSED — no
 * `className` / `style`; customise via the semantic `size` prop. All colour
 * comes from AEGIS tokens. See `.agent/rules/API_RULES.md`.
 */

const helperTextVariants = cva(
  cn("text-muted-foreground data-[disabled]:opacity-50"),
  {
    variants: {
      size: {
        sm: "text-[0.7rem]",
        md: "text-xs",
        lg: "text-sm",
      },
    },
    defaultVariants: { size: "md" },
  }
)

type HelperTextProps = Omit<
  useRender.ComponentProps<"p">,
  "className" | "style"
> &
  VariantProps<typeof helperTextVariants> & {
    /** Dim the text to match a disabled control. */
    disabled?: boolean
  }

function HelperText({
  size = "md",
  disabled = false,
  render = <p />,
  ...props
}: HelperTextProps) {
  return useRender({
    render,
    props: {
      "data-slot": "helper-text",
      "data-disabled": disabled ? "" : undefined,
      className: cn(helperTextVariants({ size })),
      ...props,
    },
  })
}

export { HelperText, helperTextVariants }
export type { HelperTextProps }
