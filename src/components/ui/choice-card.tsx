import * as React from "react"
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group"
import { Radio as RadioPrimitive } from "@base-ui/react/radio"

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
}

function ChoiceCard({
  label,
  description,
  icon,
  showIndicator = true,
  ...props
}: ChoiceCardProps) {
  return (
    <RadioPrimitive.Root
      data-slot="choice-card"
      className={cn(
        "group border-input bg-background relative flex flex-1 cursor-pointer items-start gap-3 rounded-lg border p-4 text-left transition-colors outline-none",
        "hover:border-border-strong hover:bg-accent/40",
        "data-[checked]:border-primary data-[checked]:bg-accent-soft data-[checked]:ring-primary data-[checked]:ring-1",
        "focus-visible:ring-accent-soft focus-visible:ring-[3px]",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
      )}
      {...props}
    >
      {icon ? (
        <span
          data-slot="choice-card-icon"
          className="text-muted-foreground group-data-[checked]:text-primary mt-0.5 flex size-5 shrink-0 items-center justify-center [&_svg]:size-5"
        >
          {icon}
        </span>
      ) : null}

      <span
        data-slot="choice-card-body"
        className="flex min-w-0 flex-col gap-0.5"
      >
        <span
          data-slot="choice-card-label"
          className="text-foreground text-sm font-medium"
        >
          {label}
        </span>
        {description ? (
          <span
            data-slot="choice-card-description"
            className="text-muted-foreground text-xs leading-snug"
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
            "border-input group-data-[checked]:border-primary group-data-[checked]:bg-primary mt-0.5 ml-auto flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors"
          )}
        >
          <RadioPrimitive.Indicator className="flex items-center justify-center">
            <span className="bg-primary-foreground size-1.5 rounded-full" />
          </RadioPrimitive.Indicator>
        </span>
      ) : null}
    </RadioPrimitive.Root>
  )
}

export { ChoiceCardGroup, ChoiceCard }
export type { ChoiceCardGroupProps, ChoiceCardProps }
