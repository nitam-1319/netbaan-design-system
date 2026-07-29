"use client";

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Masonry (Layout)
 *
 * A masonry layout — items flow into balanced vertical columns with no fixed row
 * heights, so cards of varying height pack tightly (galleries, dashboards, card
 * walls). Built on native CSS multi-column, so it degrades gracefully and needs
 * no measurement JS. Each child is kept whole (`break-inside-avoid`).
 *
 * The `columns` count is responsive by construction (fewer columns on small
 * screens). Public API is CLOSED — no `className` / `style`; spacing is the
 * semantic `gap` prop and density is the `columns` prop. All spacing is
 * token-scaled. See `.agent/rules/API_RULES.md`.
 */

type MasonryProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style"
> & {
  /** Target column count on wide screens (1–5). Fewer on smaller screens. */
  columns?: 1 | 2 | 3 | 4 | 5
  /** Gap between items. Default "md". */
  gap?: "sm" | "md" | "lg"
}

/** Responsive column classes per target count (base → sm → lg). */
const columnClass: Record<NonNullable<MasonryProps["columns"]>, string> = {
  1: "columns-1",
  2: "columns-1 sm:columns-2",
  3: "columns-1 sm:columns-2 lg:columns-3",
  4: "columns-1 sm:columns-2 lg:columns-4",
  5: "columns-1 sm:columns-2 lg:columns-3 xl:columns-5",
}

/**
 * Gap scale mirrors the canonical layout tokens shared by Grid / Stack
 * (`sm` → 2, `md` → 4, `lg` → 6) so `gap="md"` means the same spacing on every
 * layout primitive. Column gap and item bottom-margin are kept in lock-step.
 */
const gapClass: Record<NonNullable<MasonryProps["gap"]>, string> = {
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
}

const itemGap: Record<NonNullable<MasonryProps["gap"]>, string> = {
  sm: "mb-2",
  md: "mb-4",
  lg: "mb-6",
}

function Masonry({
  columns = 3,
  gap = "md",
  children,
  ...props
}: MasonryProps) {
  return (
    <div
      data-slot="masonry"
      data-columns={columns}
      className={cn(columnClass[columns], gapClass[gap])}
      {...props}
    >
      {React.Children.map(children, (child) =>
        child == null ? null : (
          <div
            data-slot="masonry-item"
            className={cn("break-inside-avoid", itemGap[gap])}
          >
            {child}
          </div>
        )
      )}
    </div>
  )
}

export { Masonry }
export type { MasonryProps }
