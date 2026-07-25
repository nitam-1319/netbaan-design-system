import * as React from "react"
import { Slider as SliderPrimitive } from "@base-ui/react/slider"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Slider
 *
 * A single-value or range slider built on the Base UI Slider primitive, which
 * supplies the `role="slider"` thumb inputs, keyboard stepping, and aria value
 * wiring. Pass an array `value`/`defaultValue` to get a two-thumb range slider.
 * An optional inline `label` and live `value` readout can be shown above the
 * track. Styling is AEGIS-token only (closed API — no `className`/`style`).
 *
 * Signature AEGIS motifs: `border-strong` resting thumb border, a 3px
 * `accent-soft` focus ring, and `shadow-elevated` on the thumb.
 */

const trackSizeVariants = cva("relative w-full rounded-full bg-surface-3", {
  variants: {
    size: {
      sm: "h-1",
      md: "h-1.5",
      lg: "h-2.5",
    },
  },
  defaultVariants: { size: "md" },
})

const thumbSizeVariants = cva(
  cn(
    "rounded-full border-2 bg-background shadow-elevated transition-colors",
    "outline-none focus-visible:ring-3 focus-visible:ring-accent-soft",
    "data-[dragging]:border-accent-strong",
    "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
  ),
  {
    variants: {
      size: {
        sm: "size-3.5",
        md: "size-4",
        lg: "size-5",
      },
      invalid: {
        true: "border-destructive",
        false: "border-primary",
      },
    },
    defaultVariants: { size: "md", invalid: false },
  }
)

type SliderRootProps = React.ComponentProps<typeof SliderPrimitive.Root>

type SliderProps = Omit<SliderRootProps, "className" | "style"> &
  VariantProps<typeof trackSizeVariants> & {
    /** Error state — paints the thumb border with the danger token. */
    invalid?: boolean
    /** Inline label rendered above the track (associated via the primitive). */
    label?: React.ReactNode
    /** Show a live, formatted value readout beside the label. */
    showValue?: boolean
    /** Per-thumb accessible label, e.g. `(i) => i === 0 ? "Min" : "Max"`. */
    getAriaLabel?: (index: number) => string
  }

function Slider({
  size = "md",
  invalid = false,
  label,
  showValue = false,
  getAriaLabel,
  value,
  defaultValue,
  orientation = "horizontal",
  ...props
}: SliderProps) {
  // Two thumbs for a range (array value), one otherwise.
  const source = value ?? defaultValue
  const thumbCount = Array.isArray(source) ? source.length : 1

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      value={value}
      defaultValue={defaultValue}
      orientation={orientation}
      className={cn(
        "flex flex-col gap-2 select-none",
        orientation === "vertical" && "h-48 w-auto items-center"
      )}
      {...props}
    >
      {(label != null || showValue) && (
        <div className="flex items-center justify-between gap-3 text-sm">
          {label != null ? (
            <SliderPrimitive.Label
              data-slot="slider-label"
              className="font-medium text-foreground"
            >
              {label}
            </SliderPrimitive.Label>
          ) : (
            <span />
          )}
          {showValue && (
            <SliderPrimitive.Value
              data-slot="slider-value"
              className="text-text-faint font-mono text-xs tabular-nums"
            />
          )}
        </div>
      )}

      <SliderPrimitive.Control
        data-slot="slider-control"
        className={cn(
          "relative flex items-center",
          orientation === "vertical"
            ? "h-full w-4 flex-col justify-center"
            : "w-full"
        )}
      >
        <SliderPrimitive.Track
          data-slot="slider-track"
          className={cn(
            trackSizeVariants({ size }),
            orientation === "vertical" && "h-full w-1.5"
          )}
        >
          <SliderPrimitive.Indicator
            data-slot="slider-indicator"
            className={cn(
              "rounded-full",
              invalid ? "bg-destructive" : "accent-fill"
            )}
          />
          {Array.from({ length: thumbCount }).map((_, i) => (
            <SliderPrimitive.Thumb
              key={i}
              data-slot="slider-thumb"
              getAriaLabel={getAriaLabel}
              className={cn(thumbSizeVariants({ size, invalid }))}
            />
          ))}
        </SliderPrimitive.Track>
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}

export { Slider, trackSizeVariants, thumbSizeVariants }
export type { SliderProps }
