import * as React from "react"
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group"
import { Toggle as TogglePrimitive } from "@base-ui/react/toggle"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Segmented Control (Navigation tier, closed API)
 *
 * A compact, mutually-exclusive selector rendered as connected segments inside a
 * shared track — the classic "pick one of a few" control for view switches,
 * ranges, or modes. Built on the Base UI ToggleGroup primitive (single-select),
 * so it gets roving focus, arrow-key navigation, and pressed coordination for
 * free. The active segment lifts onto a `background` surface with
 * `shadow-elevated`.
 *
 * Config-driven: pass an `items` array rather than composing children, so the
 * common case is one prop. Exactly one item is always selected (re-pressing the
 * active item does not clear it).
 *
 * Public API is CLOSED: no `className` / `style`. Sizing is the semantic `size`
 * prop; layout between controls belongs in `Box`/`Stack`.
 * See `.agent/rules/API_RULES.md` and `.agent/DECISIONS.md`.
 */

const trackVariants = cva(
  cn(
    "inline-flex items-center rounded-lg border border-border bg-surface-2 p-0.5",
    "data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch"
  ),
  {
    variants: {
      size: {
        sm: "gap-0.5",
        md: "gap-0.5",
        lg: "gap-1",
      },
      fullWidth: {
        true: "flex w-full",
        false: "",
      },
    },
    defaultVariants: { size: "md", fullWidth: false },
  }
)

const segmentVariants = cva(
  cn(
    "relative inline-flex items-center justify-center gap-1.5 rounded-md font-medium whitespace-nowrap select-none",
    "text-muted-foreground transition-all outline-none",
    "hover:text-foreground",
    "data-[pressed]:bg-surface-3 data-[pressed]:text-foreground data-[pressed]:glass-panel",
    "focus-visible:ring-3 focus-visible:ring-accent-soft",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0"
  ),
  {
    variants: {
      size: {
        sm: "h-7 px-2.5 text-[0.8rem] [&_svg]:size-3.5",
        md: "h-8 px-3 text-sm [&_svg]:size-4",
        lg: "h-9 px-4 text-sm [&_svg]:size-4",
      },
      fullWidth: {
        true: "flex-1",
        false: "",
      },
    },
    defaultVariants: { size: "md", fullWidth: false },
  }
)

type SegmentedControlItem = {
  /** The value reported when this segment is selected. */
  value: string
  /** Visible content (text and/or icon). */
  label: React.ReactNode
  /** Accessible label when `label` is icon-only. */
  "aria-label"?: string
  /** Disable this segment individually. */
  disabled?: boolean
}

type SegmentedControlProps = Omit<
  ToggleGroupPrimitive.Props<string>,
  "className" | "style" | "value" | "defaultValue" | "onValueChange" | "multiple"
> &
  VariantProps<typeof trackVariants> & {
    /** The segments to render. */
    items: SegmentedControlItem[]
    /** Controlled selected value. */
    value?: string
    /** Uncontrolled initial selected value. */
    defaultValue?: string
    /** Fired with the newly-selected value. */
    onValueChange?: (
      value: string,
      eventDetails: ToggleGroupPrimitive.ChangeEventDetails
    ) => void
  }

function SegmentedControl({
  items,
  size = "md",
  fullWidth = false,
  value,
  defaultValue,
  onValueChange,
  ...props
}: SegmentedControlProps) {
  // Control the value internally so the "exactly one selected" contract holds:
  // Base UI's ToggleGroup deselects on re-press, so we ignore empty selections
  // and keep the current value instead of clearing it.
  const isControlled = value != null
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const current = isControlled ? value : internalValue

  return (
    <ToggleGroupPrimitive<string>
      data-slot="segmented-control"
      className={cn(trackVariants({ size, fullWidth }))}
      value={current != null ? [current] : []}
      onValueChange={(groupValue, eventDetails) => {
        // Single-select: keep exactly one selection (ignore deselect-to-empty).
        const next = groupValue[0]
        if (next == null) return
        if (!isControlled) setInternalValue(next)
        onValueChange?.(next, eventDetails)
      }}
      {...props}
    >
      {items.map((item) => (
        <TogglePrimitive
          key={item.value}
          data-slot="segmented-control-item"
          value={item.value}
          disabled={item.disabled}
          aria-label={item["aria-label"]}
          className={cn(segmentVariants({ size, fullWidth }))}
        >
          {item.label}
        </TogglePrimitive>
      ))}
    </ToggleGroupPrimitive>
  )
}

export { SegmentedControl, trackVariants, segmentVariants }
export type { SegmentedControlProps, SegmentedControlItem }
