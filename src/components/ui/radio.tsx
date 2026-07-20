import * as React from "react"
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group"
import { Radio as RadioPrimitive } from "@base-ui/react/radio"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Radio Group
 *
 * A set of mutually exclusive options built on the Base UI Radio Group + Radio
 * primitives. The group supplies `role="radiogroup"`, roving-tabindex arrow-key
 * navigation, a paired hidden input for native form submission, and full
 * controlled/uncontrolled state; each item renders an accessible `role="radio"`
 * with `aria-checked`. The circle + dot indicator are styled with AEGIS tokens.
 *
 * Public API is CLOSED (no `className` / `style`). Layout of the option list is
 * token-only via the group's `orientation`; one-off spacing belongs in
 * `Box`/`Stack`. See `.agent/rules/API_RULES.md`.
 */

type RadioGroupProps = Omit<
  React.ComponentProps<typeof RadioGroupPrimitive>,
  "className" | "style"
> & {
  orientation?: "vertical" | "horizontal"
}

function RadioGroup({ orientation = "vertical", ...props }: RadioGroupProps) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      data-orientation={orientation}
      className={cn(
        "flex gap-2.5 data-[orientation=horizontal]:flex-row data-[orientation=vertical]:flex-col"
      )}
      {...props}
    />
  )
}

function RadioGroupItem(
  props: Omit<
    React.ComponentProps<typeof RadioPrimitive.Root>,
    "className" | "style"
  >
) {
  return (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      className={cn(
        "peer flex aspect-square size-4 shrink-0 items-center justify-center rounded-full border border-input bg-input/20 shadow-sm transition-colors outline-none",
        "data-[checked]:border-primary data-[checked]:bg-primary",
        "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20"
      )}
      {...props}
    >
      <RadioPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="flex items-center justify-center"
      >
        <span className="size-1.5 rounded-full bg-primary-foreground" />
      </RadioPrimitive.Indicator>
    </RadioPrimitive.Root>
  )
}

export { RadioGroup, RadioGroupItem }
