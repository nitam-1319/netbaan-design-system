import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Star } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Rating (Inputs tier, closed API)
 *
 * A star rating: pick a whole-number score from 1..`max`, or render read-only to
 * display an existing score. Interactive ratings are a genuine radio group of
 * visually-hidden native radios behind star labels, so keyboard navigation
 * (arrow keys, Home/End), focus, and form submission work natively; a hover
 * preview highlights the stars up to the pointer.
 *
 * Read-only ratings render as a single labelled image ("3 out of 5 stars") with
 * no form controls, for use in cards, tables, and reviews.
 *
 * Public API is CLOSED: no `className` / `style`. Score is the controlled
 * `value` / uncontrolled `defaultValue` (+ `onValueChange`); presentation is the
 * semantic `size` prop; behaviour is `readOnly` / `disabled` / `max`. All colour
 * comes from AEGIS tokens.
 * See `.agent/rules/API_RULES.md` and `.agent/DECISIONS.md` (escape-hatch policy).
 */

const starVariants = cva("shrink-0 transition-colors", {
  variants: {
    size: {
      sm: "size-4",
      md: "size-5",
      lg: "size-6",
    },
  },
  defaultVariants: { size: "md" },
})

const rowVariants = cva("inline-flex w-fit items-center", {
  variants: {
    size: {
      sm: "gap-0.5",
      md: "gap-1",
      lg: "gap-1.5",
    },
  },
  defaultVariants: { size: "md" },
})

type RatingBaseProps = VariantProps<typeof starVariants> & {
  /** Number of stars. @default 5 */
  max?: number
}

type RatingProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style" | "defaultValue" | "onChange" | "children"
> &
  RatingBaseProps & {
    /** Controlled score (1..max; 0 = unrated). */
    value?: number
    /** Uncontrolled initial score. @default 0 */
    defaultValue?: number
    /** Called with the newly selected score. */
    onValueChange?: (value: number) => void
    /** Display an existing score without allowing edits. */
    readOnly?: boolean
    /** Disable interaction and dim the control. */
    disabled?: boolean
    /** Form field name for the underlying radios. */
    name?: string
    /** Accessible name for the rating group. @default "Rating" */
    "aria-label"?: string
  }

function Star_({
  filled,
  size,
}: {
  filled: boolean
  size: RatingBaseProps["size"]
}) {
  return (
    <Star
      aria-hidden
      className={cn(
        starVariants({ size }),
        filled
          ? "fill-warning text-warning"
          : "fill-transparent text-muted-foreground/40"
      )}
    />
  )
}

function Rating({
  max = 5,
  size = "md",
  value,
  defaultValue = 0,
  onValueChange,
  readOnly = false,
  disabled = false,
  name,
  "aria-label": ariaLabel = "Rating",
  ...props
}: RatingProps) {
  const isControlled = value !== undefined
  const [internal, setInternal] = React.useState(defaultValue)
  const current = isControlled ? (value as number) : internal
  const [hovered, setHovered] = React.useState<number | null>(null)

  const stars = Array.from({ length: max }, (_, i) => i + 1)
  const reactId = React.useId()
  const groupName = name ?? `rating-${reactId}`

  /* -------------------------------------------------- Read-only display -- */
  if (readOnly) {
    return (
      <div
        data-slot="rating"
        data-readonly="true"
        role="img"
        aria-label={`${current} out of ${max} stars`}
        className={cn(rowVariants({ size }))}
        {...props}
      >
        {stars.map((star) => (
          <Star_ key={star} filled={star <= current} size={size} />
        ))}
      </div>
    )
  }

  /* ---------------------------------------------------- Interactive group -- */
  const shown = hovered ?? current

  function select(next: number) {
    if (disabled) return
    if (!isControlled) setInternal(next)
    onValueChange?.(next)
  }

  return (
    <div
      data-slot="rating"
      role="radiogroup"
      aria-label={ariaLabel}
      data-disabled={disabled ? "" : undefined}
      className={cn(
        rowVariants({ size }),
        disabled && "pointer-events-none opacity-50"
      )}
      onMouseLeave={() => setHovered(null)}
      {...props}
    >
      {stars.map((star) => {
        const checked = star === current
        return (
          <label
            key={star}
            data-slot="rating-star"
            className="cursor-pointer"
            onMouseEnter={() => setHovered(star)}
          >
            <input
              type="radio"
              name={groupName}
              value={star}
              checked={checked}
              disabled={disabled}
              onChange={() => select(star)}
              className="sr-only peer"
              aria-label={`${star} star${star === 1 ? "" : "s"}`}
            />
            <span
              className={cn(
                "block rounded-sm p-0.5 transition-[box-shadow]",
                "peer-focus-visible:ring-accent-soft peer-focus-visible:ring-[3px]"
              )}
            >
              <Star_ filled={star <= shown} size={size} />
            </span>
          </label>
        )
      })}
    </div>
  )
}

export { Rating, starVariants as ratingStarVariants }
export type { RatingProps }
