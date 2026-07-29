"use client";

import { Toggle as TogglePrimitive } from "@base-ui/react/toggle"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Toggle Button (Selection Controls tier, closed API)
 *
 * A two-state button that stays pressed once activated, built on the Base UI
 * Toggle primitive. Use it for a single on/off affordance whose pressed state
 * is meaningful on its own (e.g. "bold", "mute", "pin"). For a set of mutually
 * exclusive or multi-select options, compose these inside `ToggleGroup`.
 *
 * The pressed state is exposed by Base UI as `data-pressed` (and reflected to
 * assistive tech as `aria-pressed`), so styling hooks off `data-[pressed]`.
 *
 * Public API is CLOSED: no `className` / `style`. Customization is the semantic
 * `variant` / `size` props; element polymorphism stays available through Base
 * UI's `render` prop. One-off layout belongs in `Box`/`Stack`.
 * See `.agent/rules/API_RULES.md` and `.agent/DECISIONS.md` (escape-hatch policy).
 */

const toggleVariants = cva(
  cn(
    "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none",
    "text-muted-foreground hover:bg-muted hover:text-foreground",
    "data-[pressed]:bg-accent data-[pressed]:text-accent-foreground",
    "focus-visible:border-ring focus-visible:ring-accent-soft focus-visible:ring-3",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
  ),
  {
    variants: {
      variant: {
        default: "",
        outline:
          "border-border bg-background hover:bg-muted data-[pressed]:border-ring",
      },
      size: {
        sm: "h-7 min-w-7 px-2 text-[0.8rem] [&_svg:not([class*='size-'])]:size-3.5",
        default: "h-8 min-w-8 px-2.5",
        lg: "h-9 min-w-9 px-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// Closed public API: strip the styling escape hatches from the primitive's props.
type ToggleProps = Omit<
  TogglePrimitive.Props,
  "className" | "style"
> &
  VariantProps<typeof toggleVariants>

function Toggle({ variant = "default", size = "default", ...props }: ToggleProps) {
  return (
    <TogglePrimitive
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size }))}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }
