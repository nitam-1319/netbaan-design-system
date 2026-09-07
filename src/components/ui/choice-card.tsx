"use client"

import * as React from "react"
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group"
import { Radio as RadioPrimitive } from "@base-ui/react/radio"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Choice Card (Selection Controls tier, closed API)
 *
 * A large, selectable card used to pick one option from a small set — a plan, a
 * shipping speed, a workspace type. It is a radio in card clothing: built on the
 * Base UI Radio Group + Radio primitives, so the group is a real
 * `role="radiogroup"` with roving-tabindex arrow-key navigation, a paired hidden
 * input for native form submission, and full controlled/uncontrolled state; each
 * card is an accessible `role="radio"` with `aria-checked`.
 *
 * Compose it as a `ChoiceCardGroup` wrapping one `ChoiceCard` per option (each
 * with a unique `value`). This build is single-select; multi-select choice cards
 * (on the Checkbox Group primitive) are a follow-up (see `.agent/DECISIONS.md`).
 *
 * Public API is CLOSED: no `className` / `style`. Content is the semantic
 * `label` / `description` / `icon` props; layout is the group's `orientation`.
 * See `.agent/rules/API_RULES.md` and `.agent/DECISIONS.md` (escape-hatch policy).
 */

/* ------------------------------------------------------------------ Group -- */

type ChoiceCardGroupProps = Omit<
  React.ComponentProps<typeof RadioGroupPrimitive>,
  "className" | "style"
> & {
  /** Lay the cards out in a column or a row. @default "vertical" */
  orientation?: "vertical" | "horizontal"
}

function ChoiceCardGroup({
  orientation = "vertical",
  ...props
}: ChoiceCardGroupProps) {
  return (
    <RadioGroupPrimitive
      data-slot="choice-card-group"
      data-orientation={orientation}
      className={cn(
        "flex gap-3 data-[orientation=horizontal]:flex-row data-[orientation=vertical]:flex-col"
      )}
      {...props}
    />
  )
}

/* ------------------------------------------------------------------- Card -- */

type ChoiceCardProps = Omit<
  React.ComponentProps<typeof RadioPrimitive.Root>,
  "className" | "style" | "children"
> & {
  /** The option's title. */
  label: React.ReactNode
  /** Optional supporting line under the label. */
  description?: React.ReactNode
  /** Optional leading icon or illustration. */
  icon?: React.ReactNode
  /** Show the trailing radio indicator. @default true */
  showIndicator?: boolean
  /**
   * `inline` (default) is one row: `icon | label + description | indicator`.
   * `stacked` puts the glyph on its own line above the label and pins the
   * indicator to the top inline-end — the form a selection GRID wants, where
   * the cards are tiles rather than rows.
   */
  layout?: "inline" | "stacked"
  /**
   * Trailing content on the LABEL row — a count, a price, a badge. It sits
   * outside the label so it is not part of the radio's accessible name; a
   * "5 plans" meta read out as part of the option's name is noise.
   */
  meta?: React.ReactNode
  /** Frame the icon in a tinted 32px chip instead of leaving it a bare glyph. */
  iconChip?: boolean
  /** The selected mark: a filled `dot` (default) or a `check`. */
  indicatorMark?: "dot" | "check"
  /**
   * A per-card action (a "Preview" button). It is rendered as a DOM SIBLING of
   * the radio, not inside it — nesting a `<button>` inside `role="radio"` is
   * invalid and needs a `stopPropagation` hack to be usable at all.
   */
  actions?: React.ReactNode
}

function ChoiceCard({
  label,
  description,
  icon,
  showIndicator = true,
  layout = "inline",
  meta,
  iconChip = false,
  indicatorMark = "dot",
  actions,
  ...props
}: ChoiceCardProps) {
  const stacked = layout === "stacked"

  const card = (
    <RadioPrimitive.Root
      data-slot="choice-card"
      data-layout={layout}
      className={cn(
        "group relative flex flex-1 cursor-pointer rounded-lg border border-border-strong bg-background p-4 text-start transition-colors outline-none",
        stacked ? "flex-col items-stretch gap-2" : "items-start gap-3",
        "hover:border-border-strong hover:bg-accent/40",
        "data-[checked]:border-primary data-[checked]:bg-accent-soft data-[checked]:ring-1 data-[checked]:ring-primary",
        "focus-visible:ring-[3px] focus-visible:ring-accent-soft",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
      )}
      {...props}
    >
      {icon ? (
        <span
          data-slot="choice-card-icon"
          className={cn(
            "flex shrink-0 items-center justify-center text-muted-foreground group-data-[checked]:text-primary",
            iconChip
              ? "size-8 rounded-[10px] bg-surface-2 group-data-[checked]:bg-accent-soft [&_svg]:size-[18px]"
              : "size-5 [&_svg]:size-5",
            stacked ? "" : "mt-0.5"
          )}
        >
          {icon}
        </span>
      ) : null}

      <span
        data-slot="choice-card-body"
        className="flex min-w-0 flex-col gap-0.5"
      >
        <span
          data-slot="choice-card-label-row"
          className={cn("flex items-baseline gap-2", stacked ? "pe-6" : "")}
        >
          <span
            data-slot="choice-card-label"
            className="min-w-0 text-sm font-medium text-foreground"
          >
            {label}
          </span>
          {meta ? (
            <span
              data-slot="choice-card-meta"
              className="ms-auto shrink-0 text-xs text-muted-foreground tabular-nums"
            >
              {meta}
            </span>
          ) : null}
        </span>
        {description ? (
          <span
            data-slot="choice-card-description"
            className="text-xs leading-snug text-muted-foreground"
          >
            {description}
          </span>
        ) : null}
      </span>

      {showIndicator ? (
        <span
          data-slot="choice-card-indicator"
          aria-hidden="true"
          className={cn(
            "flex shrink-0 items-center justify-center rounded-full border border-border-strong transition-colors group-data-[checked]:border-primary group-data-[checked]:bg-primary",
            indicatorMark === "check" ? "size-[18px]" : "size-4",
            stacked ? "absolute end-4 top-4" : "ms-auto mt-0.5"
          )}
        >
          <RadioPrimitive.Indicator className="flex items-center justify-center">
            {indicatorMark === "check" ? (
              <Check
                aria-hidden
                strokeWidth={3}
                className="size-3 animate-dot-pop text-primary-foreground"
              />
            ) : (
              <span className="size-1.5 animate-dot-pop rounded-full bg-primary-foreground" />
            )}
          </RadioPrimitive.Indicator>
        </span>
      ) : null}
    </RadioPrimitive.Root>
  )

  if (!actions) return card

  return (
    <div data-slot="choice-card-shell" className={cn("relative flex flex-1")}>
      {card}
      <span
        data-slot="choice-card-actions"
        className={cn("absolute end-3 bottom-3 z-10 flex items-center gap-1.5")}
      >
        {actions}
      </span>
    </div>
  )
}

export { ChoiceCardGroup, ChoiceCard }
export type { ChoiceCardGroupProps, ChoiceCardProps }
