"use client"

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
    "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-accent-soft",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
  ),
  {
    variants: {
      /**
       * Which colour the PRESSED chip wears. `accent` (default) is the
       * library's one accent. The `cat-1…6` and severity tones exist so a
       * filter chip can be drawn in the same colour as the thing it filters —
       * the correspondence between control and mark is the point, and without
       * it every pressed chip in a four-way filter is identical. Tone fills and
       * outlines only; the label stays `--foreground` so the pressed chip is
       * legible at every tone in both themes.
       */
      tone: {
        accent:
          "data-[pressed]:bg-accent data-[pressed]:text-accent-foreground",
        "cat-1": "[--tone:var(--cat-1)]",
        "cat-2": "[--tone:var(--cat-2)]",
        "cat-3": "[--tone:var(--cat-3)]",
        "cat-4": "[--tone:var(--cat-4)]",
        "cat-5": "[--tone:var(--cat-5)]",
        "cat-6": "[--tone:var(--cat-6)]",
        critical: "[--tone:var(--sev-critical)]",
        high: "[--tone:var(--sev-high)]",
        medium: "[--tone:var(--sev-medium)]",
        low: "[--tone:var(--sev-low)]",
        info: "[--tone:var(--sev-info)]",
        success: "[--tone:var(--success)]",
        warning: "[--tone:var(--warning)]",
        danger: "[--tone:var(--destructive)]",
      },
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
    compoundVariants: (
      [
        "cat-1",
        "cat-2",
        "cat-3",
        "cat-4",
        "cat-5",
        "cat-6",
        "critical",
        "high",
        "medium",
        "low",
        "info",
        "success",
        "warning",
        "danger",
      ] as const
    ).flatMap((tone) =>
      (["default", "outline"] as const).map((variant) => ({
        tone,
        variant,
        className: cn(
          "data-[pressed]:bg-[color-mix(in_oklch,var(--tone),transparent_86%)]",
          "data-[pressed]:border-[color-mix(in_oklch,var(--tone),transparent_76%)]",
          "data-[pressed]:text-foreground"
        ),
      }))
    ),
    defaultVariants: {
      tone: "accent",
      variant: "default",
      size: "default",
    },
  }
)

// Closed public API: strip the styling escape hatches from the primitive's props.
type ToggleProps = Omit<TogglePrimitive.Props, "className" | "style"> &
  VariantProps<typeof toggleVariants>

function Toggle({
  tone = "accent",
  variant = "default",
  size = "default",
  ...props
}: ToggleProps) {
  return (
    <TogglePrimitive
      data-slot="toggle"
      data-tone={tone}
      className={cn(toggleVariants({ tone, variant, size }))}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }
