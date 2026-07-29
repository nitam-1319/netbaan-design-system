"use client";

import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Button (Primitive tier, closed API, restored to reference)
 *
 * Matches `.agent/references/spec/Button.dc.html`: seven variants, the sm/md/lg
 * size scale (32/38/46px), a real loading state, the 3px accent-soft focus ring,
 * and the signature Primary **beam** (a rotating conic-gradient border over an
 * accent→surface gradient). Closed API — no `className`/`style`; polymorphism via
 * `render`. Tokens only. See `.agent/rules/REFERENCE_FIDELITY.md`.
 */

const buttonVariants = cva(
  "group/button relative isolate inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[var(--r,10px)] font-semibold whitespace-nowrap outline-none select-none transition-[filter,color,background-color,border-color,box-shadow] duration-150 focus-visible:focus-accent active:scale-[0.98] active:brightness-[0.94] disabled:pointer-events-none disabled:opacity-45 aria-disabled:pointer-events-none aria-disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-[1.1em] [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "text-foreground shadow-soft hover:brightness-[1.08]",
        secondary: "border border-border-strong bg-card text-foreground hover:brightness-110",
        soft: "border border-transparent bg-accent-soft text-accent-strong hover:brightness-110",
        outline: "border border-border-strong bg-transparent text-foreground hover:bg-muted",
        ghost: "border border-transparent bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
        destructive: "border border-transparent bg-destructive text-on-tone shadow-elevated hover:brightness-110",
        link: "border border-transparent bg-transparent text-accent-strong underline underline-offset-[3px] hover:brightness-110",
      },
      size: {
        sm: "h-8 text-xs [--r:10px]",
        md: "h-[38px] text-[0.8rem] [--r:11px]",
        lg: "h-[46px] text-sm [--r:13px]",
        icon: "size-[38px] [--r:11px]",
        "icon-sm": "size-8 [--r:10px]",
        "icon-lg": "size-[46px] [--r:13px]",
      },
    },
    defaultVariants: { variant: "secondary", size: "md" },
  }
)

const contentPad: Record<string, string> = {
  sm: "gap-1.5 px-3",
  md: "gap-2 px-4",
  lg: "gap-2 px-5",
  icon: "",
  "icon-sm": "",
  "icon-lg": "",
}

type ButtonProps = Omit<ButtonPrimitive.Props, "className" | "style"> &
  VariantProps<typeof buttonVariants> & {
    /** Shows a spinner, holds the label, and marks the control aria-busy. */
    loading?: boolean
  }

function Button({
  variant = "secondary",
  size = "md",
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const isPrimary = variant === "primary"
  const pad = contentPad[size ?? "md"] ?? "gap-2 px-4"

  return (
    <ButtonPrimitive
      data-slot="button"
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      className={cn(buttonVariants({ variant, size }))}
      {...props}
    >
      {isPrimary ? (
        <>
          {/* Signature beam: rotating conic-gradient revealed as a 1.5px border,
              floated on the accent underglow (shadow-soft). Reference geometry:
              200% square, 3.4s spin, 68/84/92% stops. */}
          <span aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[inherit]">
            <span className="absolute top-1/2 left-1/2 aspect-square w-[200%] -translate-x-1/2 -translate-y-1/2 animate-beam-spin-fast bg-[conic-gradient(from_0deg,transparent_0_68%,var(--primary)_84%,var(--accent-strong)_92%,transparent_100%)]" />
          </span>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-[1.5px] -z-10 rounded-[calc(var(--r,10px)-1.5px)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--primary)_15%,var(--surface-2)),var(--surface-2))]"
          />
        </>
      ) : null}
      <span className={cn("relative z-10 inline-flex items-center justify-center", pad)}>
        {loading ? (
          <span
            aria-hidden
            className="me-2 inline-block size-3.5 animate-spin rounded-full border-2 border-current/40 border-t-current"
          />
        ) : null}
        {children}
      </span>
    </ButtonPrimitive>
  )
}

export { Button, buttonVariants }
