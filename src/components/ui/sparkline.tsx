import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Sparkline
 *
 * A tiny, word-sized chart that shows the shape of a trend inline — in a table
 * cell, a stat tile, or a list row — without axes, gridlines, or labels. Feed
 * it a `data` array of numbers; it renders a `line`, filled `area`, or `bar`
 * chart scaled to fit. Colour comes entirely from the semantic `tone` (the SVG
 * paints with `currentColor`), so a sparkline always agrees with the value it
 * annotates.
 *
 * The public API is CLOSED — no `className` / `style`; shape via `variant`,
 * colour via `tone`, and dimensions via the numeric `width` / `height` props.
 * All colour is token-driven. See `.agent/rules/API_RULES.md`.
 */

const sparklineVariants = cva("inline-block align-middle", {
  variants: {
    tone: {
      accent: "text-primary",
      neutral: "text-muted-foreground",
      success: "text-success",
      warning: "text-warning",
      danger: "text-destructive",
      info: "text-primary",
    },
  },
  defaultVariants: { tone: "accent" },
})

type SparklineProps = Omit<
  React.ComponentProps<"svg">,
  "className" | "style" | "viewBox" | "children"
> &
  VariantProps<typeof sparklineVariants> & {
    /** The series to plot. Two or more numbers. */
    data: number[]
    /** Chart shape. Default `line`. */
    variant?: "line" | "area" | "bar"
    /** Intrinsic width in px (SVG user units). Default 100. */
    width?: number
    /** Intrinsic height in px (SVG user units). Default 28. */
    height?: number
    /** Stroke width for line/area. Default 2. */
    strokeWidth?: number
    /**
     * Accessible label. When provided the chart is `role="img"` with this name;
     * when omitted the chart is `aria-hidden` (decorative beside a visible value).
     */
    label?: string
  }

/** Normalise a series into SVG coordinates within the padded plot area. */
function toPoints(
  data: number[],
  width: number,
  height: number,
  pad: number
) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const span = max - min || 1
  const innerW = width - pad * 2
  const innerH = height - pad * 2
  const step = data.length > 1 ? innerW / (data.length - 1) : 0
  return data.map((value, i) => {
    const x = pad + i * step
    // Invert Y: larger values sit higher on screen.
    const y = pad + innerH - ((value - min) / span) * innerH
    return [x, y] as const
  })
}

function Sparkline({
  data,
  variant = "line",
  tone = "accent",
  width = 100,
  height = 28,
  strokeWidth = 2,
  label,
  ...props
}: SparklineProps) {
  const safe = Array.isArray(data) ? data.filter((n) => Number.isFinite(n)) : []
  const pad = strokeWidth + 1

  const a11y = label
    ? { role: "img" as const, "aria-label": label }
    : { "aria-hidden": true as const }

  // Not enough data to draw a shape — render an empty, correctly-sized box so
  // layout never jumps.
  if (safe.length < 2) {
    return (
      <svg
        data-slot="sparkline"
        data-empty=""
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className={cn(sparklineVariants({ tone }))}
        {...a11y}
        {...props}
      />
    )
  }

  const points = toPoints(safe, width, height, pad)
  const linePath = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`)
    .join(" ")
  const areaPath = `${linePath} L${points[points.length - 1][0].toFixed(
    2
  )},${(height - pad).toFixed(2)} L${points[0][0].toFixed(2)},${(
    height - pad
  ).toFixed(2)} Z`

  const barGap = safe.length > 1 ? Math.min(2, (width - pad * 2) / safe.length / 3) : 1
  const barW = Math.max(1, (width - pad * 2) / safe.length - barGap)
  const baseY = height - pad

  return (
    <svg
      data-slot="sparkline"
      data-variant={variant}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={cn(sparklineVariants({ tone }))}
      {...a11y}
      {...props}
    >
      {variant === "area" && (
        <path
          data-slot="sparkline-area"
          d={areaPath}
          fill="currentColor"
          fillOpacity={0.16}
          stroke="none"
        />
      )}

      {variant === "bar"
        ? points.map(([, y], i) => {
            // Bars occupy per-index SLOTS (width innerW/n) centred in the slot,
            // NOT the line points (which sit on the plot edges) — otherwise the
            // first and last bars overhang the viewBox and clip.
            const slotW = (width - pad * 2) / safe.length
            const cx = pad + (i + 0.5) * slotW
            return (
              <rect
                key={i}
                data-slot="sparkline-bar"
                x={(cx - barW / 2).toFixed(2)}
                y={y.toFixed(2)}
                width={barW.toFixed(2)}
                height={Math.max(1, baseY - y).toFixed(2)}
                rx={1}
                fill="currentColor"
              />
            )
          })
        : (
            <path
              data-slot="sparkline-line"
              d={linePath}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
    </svg>
  )
}

export { Sparkline, sparklineVariants }
export type { SparklineProps }
