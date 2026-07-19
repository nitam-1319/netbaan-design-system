import * as React from "react"
import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"
import { Check, Minus } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Checkbox
 *
 * An independent binary selection with an indeterminate (mixed) state, built on
 * the Base UI Checkbox primitive. The primitive supplies the accessible
 * `role="checkbox"`, `aria-checked` (incl. "mixed"), the paired hidden input for
 * forms, and keyboard support. The box + indicator are styled with AEGIS tokens.
 */

function Checkbox(
  props: Omit<
    React.ComponentProps<typeof CheckboxPrimitive.Root>,
    "className" | "style"
  >
) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input bg-input/20 text-primary-foreground shadow-sm transition-colors outline-none",
        "data-[checked]:border-primary data-[checked]:bg-primary data-[indeterminate]:border-primary data-[indeterminate]:bg-primary",
        "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20"
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current"
      >
        <Check
          className="size-3.5 in-data-[indeterminate]:hidden"
          strokeWidth={3}
        />
        <Minus
          className="hidden size-3.5 in-data-[indeterminate]:block"
          strokeWidth={3}
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
