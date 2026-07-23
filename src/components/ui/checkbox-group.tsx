import * as React from "react"
import { CheckboxGroup as CheckboxGroupPrimitive } from "@base-ui/react/checkbox-group"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"

/**
 * AEGIS — Checkbox Group (Interactive tier, closed API)
 *
 * A set of related checkboxes sharing one value, built on the Base UI Checkbox
 * Group primitive. The group owns the array of ticked names
 * (`value` / `defaultValue` / `onValueChange`), and — via `allValues` plus a
 * `parent` item — supports a tri-state "select all" checkbox whose indeterminate
 * state is derived automatically.
 *
 * `CheckboxGroupItem` composes the AEGIS `Checkbox` with a clickable label row;
 * its `value` becomes the checkbox's `name`, which is how the primitive tracks
 * membership.
 *
 * Public API is CLOSED: no `className` / `style` on any part. Direction is the
 * semantic `orientation` prop; layout belongs in `Box`/`Stack`. Element
 * polymorphism stays available through Base UI's `render` prop.
 * See `.agent/rules/API_RULES.md` and `.agent/DECISIONS.md` (escape-hatch policy).
 */

/* ------------------------------------------------------------------ Root -- */

const checkboxGroupVariants = cva("flex", {
  variants: {
    orientation: {
      vertical: "flex-col gap-3",
      horizontal: "flex-row flex-wrap gap-x-5 gap-y-2",
    },
  },
  defaultVariants: {
    orientation: "vertical",
  },
})

type CheckboxGroupProps = Omit<
  React.ComponentProps<typeof CheckboxGroupPrimitive>,
  "className" | "style"
> &
  VariantProps<typeof checkboxGroupVariants>

function CheckboxGroup({ orientation, ...props }: CheckboxGroupProps) {
  return (
    <CheckboxGroupPrimitive
      data-slot="checkbox-group"
      className={cn(checkboxGroupVariants({ orientation }))}
      {...props}
    />
  )
}

/* ------------------------------------------------------------------ Item -- */

type CheckboxGroupItemProps = Omit<
  React.ComponentProps<typeof Checkbox>,
  "name"
> & {
  /** The name tracked by the group's value array. */
  value: string
  /** Label content shown beside the checkbox. */
  children?: React.ReactNode
}

function CheckboxGroupItem({
  value,
  children,
  ...props
}: CheckboxGroupItemProps) {
  return (
    <label
      data-slot="checkbox-group-item"
      className={cn(
        "flex items-center gap-2.5 text-sm text-foreground select-none",
        "has-data-[disabled]:cursor-not-allowed has-data-[disabled]:opacity-60",
        "not-has-data-[disabled]:cursor-pointer"
      )}
    >
      <Checkbox name={value} {...props} />
      {children != null ? <span className="leading-none">{children}</span> : null}
    </label>
  )
}

/* -------------------------------------------------- Parent (select all) -- */

type CheckboxGroupSelectAllProps = Omit<
  React.ComponentProps<typeof Checkbox>,
  "name" | "parent" | "value"
> & {
  /** Label content for the select-all row. */
  children?: React.ReactNode
}

function CheckboxGroupSelectAll({
  children,
  ...props
}: CheckboxGroupSelectAllProps) {
  return (
    <label
      data-slot="checkbox-group-select-all"
      className={cn(
        "flex items-center gap-2.5 text-sm font-medium text-foreground select-none",
        "has-data-[disabled]:cursor-not-allowed has-data-[disabled]:opacity-60",
        "not-has-data-[disabled]:cursor-pointer"
      )}
    >
      <Checkbox parent {...props} />
      {children != null ? <span className="leading-none">{children}</span> : null}
    </label>
  )
}

export { CheckboxGroup, CheckboxGroupItem, CheckboxGroupSelectAll }
