import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Floating Action Button (FAB)
 *
 * A prominent, circular (or extended) action pinned above the content — the
 * primary action on a mobile surface. Built on the same Base UI Button primitive
 * as the AEGIS `Button`, with the signature Primary **beam** for the accent
 * variant, so tokens, focus ring, and motion match the rest of the system.
 *
 * Provide an `icon`; add a `label` to render the *extended* (pill) form. Use
 * `placement` to pin it to a viewport corner, or `placement="inline"` to drop it
 * into your own positioned container.
 *
 * Public API is CLOSED — no `className` / `style`. Configure via the semantic
 * props; colour and elevation are token-only. See `.agent/rules/API_RULES.md`.
 */

const fabVariants = cva(
  "group/fab relative isolate inline-flex shrink-0 items-center justify-center overflow-hidden font-semibold whitespace-nowrap outline-none select-none transition-[filter,box-shadow,background-color,color] duration-150 focus-visible:focus-accent active:scale-[0.96] active:brightness-[0.94] disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "text-foreground shadow-bloom hover:brightness-[1.08]",
        secondary:
          "border border-border-strong bg-card text-foreground shadow-elevated hover:brightness-110",
        surface:
          "border border-transparent bg-surface-2 text-foreground shadow-elevated hover:bg-muted",
        destructive:
          "border border-transparent bg-destructive text-white shadow-elevated hover:brightness-110",
      },
      size: {
        sm: "h-11 min-w-11 text-sm [--fab-r:14px] [&_svg]:size-5",
        md: "h-14 min-w-14 text-sm [--fab-r:17px] [&_svg]:size-6",
        lg: "h-16 min-w-16 text-base [--fab-r:19px] [&_svg]:size-7",
      },
      placement: {
        inline: "",
        "bottom-end": "fixed bottom-5 end-5 z-50",
        "bottom-start": "fixed bottom-5 start-5 z-50",
        "bottom-center": "fixed bottom-5 left-1/2 z-50 -translate-x-1/2",
      },
      extended: { true: "", false: "aspect-square" },
    },
    compoundVariants: [
      { extended: true, size: "sm", class: "px-4" },
      { extended: true, size: "md", class: "px-5" },
      { extended: true, size: "lg", class: "px-6" },
    ],
    defaultVariants: {
      variant: "primary",
      size: "md",
      placement: "inline",
      extended: false,
    },
  }
)

type FABVariant = "primary" | "secondary" | "surface" | "destructive"

type FloatingActionButtonProps = Omit<
  ButtonPrimitive.Props,
  "className" | "style" | "children"
> &
  Pick<VariantProps<typeof fabVariants>, "size" | "placement"> & {
    variant?: FABVariant
    /** The action glyph. Required — a FAB is icon-first. */
    icon: React.ReactNode
    /** When set, renders the extended (pill) form with this text. */
    label?: React.ReactNode
    /**
     * Accessible name. Required when there is no `label` (icon-only), so the
     * button is never unlabelled.
     */
    "aria-label"?: string
  }

function FloatingActionButton({
  variant = "primary",
  size = "md",
  placement = "inline",
  icon,
  label,
  disabled,
  ...props
}: FloatingActionButtonProps) {
  const extended = label != null
  const isPrimary = variant === "primary"

  return (
    <ButtonPrimitive
      data-slot="floating-action-button"
      disabled={disabled}
      className={cn(
        fabVariants({ variant, size, placement, extended }),
        "rounded-[var(--fab-r,17px)]"
      )}
      {...props}
    >
      {isPrimary ? (
        <>
          {/* Signature accent beam — the FAB's raised, active affordance. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[inherit]"
          >
            <span className="absolute top-1/2 left-1/2 aspect-square w-[200%] -translate-x-1/2 -translate-y-1/2 animate-beam-spin-fast bg-[conic-gradient(from_0deg,transparent_0_68%,var(--primary)_84%,var(--accent-strong)_92%,transparent_100%)]" />
          </span>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-[1.5px] -z-10 rounded-[calc(var(--fab-r,17px)-1.5px)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--primary)_16%,var(--surface-2)),var(--surface-2))]"
          />
        </>
      ) : null}
      <span
        className={cn(
          "relative z-10 inline-flex items-center justify-center",
          extended && (size === "sm" ? "gap-1.5" : size === "lg" ? "gap-2.5" : "gap-2")
        )}
      >
        <span aria-hidden className="inline-flex items-center justify-center">
          {icon}
        </span>
        {extended && <span className="pe-0.5">{label}</span>}
      </span>
    </ButtonPrimitive>
  )
}

export { FloatingActionButton, fabVariants }
export type { FloatingActionButtonProps }
