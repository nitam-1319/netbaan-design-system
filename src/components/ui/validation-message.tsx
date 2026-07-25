import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { CircleAlert, CircleCheck, TriangleAlert } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Validation Message (Forms, closed API)
 *
 * The failure (or confirmation) line shown after a form control is validated —
 * "Enter a valid email", "Passwords don't match", "Username available". It
 * renders a `<p>` with a live-region role so assistive tech announces it as it
 * appears, a leading tone icon, and the message text. Associate it with its
 * control by pointing the control's `aria-describedby` at this element's `id`
 * and setting `aria-invalid` on the control for the `error` tone.
 *
 * Sibling of `FormField`'s Field-bound `FieldError` (which auto-wires
 * `aria-describedby` and shows/hides from `Field.Root` validity). Reach for
 * `ValidationMessage` when composing a field by hand outside a `Field`; reach
 * for `FormField` when you want the wiring done for you. See
 * `.agent/DECISIONS.md` (2026-07-25c).
 *
 * `error` / `warning` announce assertively (`role="alert"`); `success`
 * announces politely (`role="status"`). The icon is decorative (`aria-hidden`)
 * — meaning lives in the text, never in colour or icon alone (WCAG 1.4.1).
 * Public API is CLOSED — no `className` / `style`; customise via the semantic
 * `tone` / `size` props. All colour comes from AEGIS tokens.
 */

const validationMessageVariants = cva(
  cn(
    "flex items-start gap-1.5 font-medium",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:translate-y-px"
  ),
  {
    variants: {
      tone: {
        error: "text-destructive",
        warning: "text-warning",
        success: "text-success",
      },
      size: {
        sm: "text-[0.7rem] [&_svg]:size-3",
        md: "text-xs [&_svg]:size-3.5",
        lg: "text-sm [&_svg]:size-4",
      },
    },
    defaultVariants: { tone: "error", size: "md" },
  }
)

const toneIcon = {
  error: CircleAlert,
  warning: TriangleAlert,
  success: CircleCheck,
} as const

type ValidationMessageProps = Omit<
  React.ComponentProps<"p">,
  "className" | "style"
> &
  VariantProps<typeof validationMessageVariants> & {
    /** Override the leading tone icon, or pass `false` to hide it. */
    icon?: React.ReactNode | false
  }

function ValidationMessage({
  tone = "error",
  size = "md",
  icon,
  children,
  ...props
}: ValidationMessageProps) {
  const DefaultIcon = toneIcon[tone ?? "error"]
  const showIcon = icon !== false
  const iconNode =
    icon != null && icon !== false ? icon : <DefaultIcon aria-hidden="true" />

  return (
    <p
      data-slot="validation-message"
      data-tone={tone}
      // error/warning are assertive; success is a polite confirmation.
      role={tone === "success" ? "status" : "alert"}
      className={cn(validationMessageVariants({ tone, size }))}
      {...props}
    >
      {showIcon && iconNode}
      <span data-slot="validation-message-text">{children}</span>
    </p>
  )
}

export { ValidationMessage, validationMessageVariants }
export type { ValidationMessageProps }
