import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Input Group (Interactive tier, closed API)
 *
 * Joins a single-line input with leading and/or trailing addons — an icon, a
 * unit ("kg", ".com"), a prefix ("https://"), or a small action — inside one
 * bordered shell that focuses as a unit. It reuses the AEGIS Input tokens
 * (resting `border-strong`, 3px `accent-soft` focus ring, 32 / 40 / 48px size
 * scale) so grouped inputs sit consistently beside Text Field / Search Input.
 *
 * This is a token-only layout primitive (no Base UI part): compose
 * `InputGroupAddon` slots around a single `InputGroupInput`.
 *
 * Public API is CLOSED: no `className` / `style` on any part. Sizing is the
 * semantic `size`; addon side is the semantic `align`; layout belongs in
 * `Box`/`Stack`.
 * See `.agent/rules/API_RULES.md` and `.agent/DECISIONS.md` (escape-hatch policy).
 */

/* ------------------------------------------------------------------ Shell -- */

const inputGroupVariants = cva(
  cn(
    "flex w-full items-stretch overflow-hidden rounded-lg border border-border-strong bg-background text-foreground transition-colors",
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

type InputGroupProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style"
> &
  VariantProps<typeof inputGroupVariants> & {
    /** Paints the error state (border + focus ring). */
    invalid?: boolean
    /** Disables the group (dims + blocks interaction). */
    disabled?: boolean
  }

function InputGroup({
  size = "md",
  invalid,
  disabled,
  ...props
}: InputGroupProps) {
  return (
    <div
      data-slot="input-group"
      role="group"
      data-invalid={invalid ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
      className={cn(inputGroupVariants({ size }))}
      {...props}
    />
  )
}

/* ------------------------------------------------------------------ Input -- */

function InputGroupInput(
  props: Omit<React.ComponentProps<"input">, "className" | "style" | "size">
) {
  return (
    <input
      data-slot="input-group-input"
      className={cn(
        "w-full min-w-0 flex-1 bg-transparent px-3 outline-none",
        "placeholder:text-muted-foreground",
        "disabled:cursor-not-allowed"
      )}
      {...props}
    />
  )
}

/* ------------------------------------------------------------------ Addon -- */

const inputGroupAddonVariants = cva(
  cn(
    "flex shrink-0 items-center justify-center gap-1.5 px-3 text-muted-foreground select-none",
    "[&_svg]:size-4 [&_svg]:shrink-0"
  ),
  {
    variants: {
      align: {
        start: "border-e border-border",
        end: "border-s border-border",
      },
      plain: {
        true: "border-0 px-2.5",
        false: "bg-muted/40",
      },
    },
    defaultVariants: {
      align: "start",
      plain: false,
    },
  }
)

type InputGroupAddonProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style"
> &
  VariantProps<typeof inputGroupAddonVariants>

function InputGroupAddon({ align, plain, ...props }: InputGroupAddonProps) {
  return (
    <div
      data-slot="input-group-addon"
      className={cn(inputGroupAddonVariants({ align, plain }))}
      {...props}
    />
  )
}

export { InputGroup, InputGroupInput, InputGroupAddon, inputGroupVariants }
