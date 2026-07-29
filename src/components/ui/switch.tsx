"use client";

import * as React from "react"
import { Switch as SwitchPrimitive } from "@base-ui/react/switch"
import { Check } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Switch (Primitive tier, closed API, restored to reference)
 *
 * Matches `.agent/references/spec/Toggle.dc.html`: the sm/md/lg track scale
 * (36×20 / 44×26 / 52×30, default md), a pure-white thumb inset 3px, the on-track
 * accent gradient, the 3px accent-soft focus ring, an `error` (invalid-required)
 * ring, a `loading` state (thumb spinner + locked + aria-busy), optional
 * `showIcons` thumb glyphs (check on / bar off), and built-in `label` +
 * `description` slots. Off-track uses `bg-track` (the reference `--track`
 * groove). Built on the Base UI Switch primitive, which
 * supplies `role="switch"`, `aria-checked`, a paired hidden input for forms, and
 * keyboard support. Closed API — no `className` / `style`; polymorphism via
 * `render`. Tokens only. See `.agent/rules/REFERENCE_FIDELITY.md`.
 */

const switchTrackVariants = cva(
  "peer relative inline-flex shrink-0 cursor-pointer items-center rounded-full outline-none transition-[background-color,box-shadow] duration-200 bg-track data-[checked]:accent-fill focus-visible:ring-[3px] focus-visible:ring-accent-soft aria-invalid:ring-[3px] aria-invalid:ring-destructive/30 disabled:cursor-not-allowed disabled:opacity-45 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-45",
  {
    variants: {
      size: {
        sm: "h-[20px] w-9 px-[3px] py-[2px]",
        md: "h-[26px] w-11 p-[3px]",
        lg: "h-[30px] w-13 p-[3px]",
      },
    },
    defaultVariants: { size: "md" },
  }
)

const switchThumbVariants = cva(
  "pointer-events-none flex items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-200",
  {
    variants: {
      size: {
        sm: "size-4 ltr:data-[checked]:translate-x-[14px] rtl:data-[checked]:-translate-x-[14px]",
        md: "size-5 ltr:data-[checked]:translate-x-[18px] rtl:data-[checked]:-translate-x-[18px]",
        lg: "size-6 ltr:data-[checked]:translate-x-[22px] rtl:data-[checked]:-translate-x-[22px]",
      },
    },
    defaultVariants: { size: "md" },
  }
)

type SwitchProps = Omit<
  React.ComponentProps<typeof SwitchPrimitive.Root>,
  "className" | "style"
> &
  VariantProps<typeof switchTrackVariants> & {
    /** Renders check (on) / bar (off) glyphs inside the thumb. */
    showIcons?: boolean
    /** Shows a thumb spinner and locks the switch during an async commit. */
    loading?: boolean
    /** Danger ring for an invalid required switch. */
    error?: boolean
    /** The setting name tied to the switch. */
    label?: React.ReactNode
    /** Optional secondary line describing what the switch controls. */
    description?: React.ReactNode
  }

function Switch({
  size = "md",
  showIcons = false,
  loading = false,
  error = false,
  disabled,
  label,
  description,
  ...props
}: SwitchProps) {
  const control = (
    <SwitchPrimitive.Root
      data-slot="switch"
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      aria-invalid={error || undefined}
      className={cn(switchTrackVariants({ size }))}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(switchThumbVariants({ size }))}
      >
        {loading ? (
          <span
            aria-hidden
            className="size-3 animate-spin rounded-full border-2 border-accent-strong/40 border-t-accent-strong"
          />
        ) : showIcons ? (
          <>
            <Check
              aria-hidden
              strokeWidth={3}
              className="hidden size-2.5 text-accent-strong in-data-[checked]:block"
            />
            <span
              aria-hidden
              className="h-0.5 w-2 rounded-full bg-text-faint in-data-[checked]:hidden"
            />
          </>
        ) : null}
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  )

  if (label == null && description == null) return control

  return (
    <label
      data-slot="switch-field"
      className={cn(
        "inline-flex cursor-pointer items-center gap-3.5 select-none",
        (disabled || loading) && "cursor-not-allowed opacity-55"
      )}
    >
      {control}
      <span className="flex flex-col gap-0.5">
        {label != null ? (
          <span className="text-sm font-semibold text-foreground">{label}</span>
        ) : null}
        {description != null ? (
          <span className="text-xs text-text-faint">{description}</span>
        ) : null}
      </span>
    </label>
  )
}

export { Switch, switchTrackVariants }
export type { SwitchProps }
