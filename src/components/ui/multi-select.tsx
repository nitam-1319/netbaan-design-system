import * as React from "react"
import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox"
import { cva, type VariantProps } from "class-variance-authority"
import { ChevronsUpDown, X } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox"

/**
 * AEGIS — Multi-select (Inputs, closed API)
 *
 * The multi-select sibling of `Combobox`: type to filter, pick several values,
 * each shown as a removable chip in the field. It is the component the Combobox
 * decision deferred multi-select to (`.agent/DECISIONS.md`, 2026-07-23) — built on
 * the same Base UI Combobox primitive in `multiple` mode, using its native
 * `Chips` / `Chip` / `ChipRemove` parts (so chip keyboard nav, Backspace-to-remove,
 * roving focus, filtering, portalling and the input↔listbox ARIA all come from the
 * primitive).
 *
 * The field shell reuses the AEGIS Input tokens (`border-strong`, `accent-soft`
 * focus, 32 / 40 / 48px scale); the list surface reuses the AEGIS `Combobox`
 * content/list/item so it matches single-select exactly. Public API is CLOSED — no
 * `className` / `style`. See `.agent/rules/API_RULES.md`.
 */

const shellVariants = cva(
  cn(
    "flex w-full items-center gap-1 rounded-lg border border-border-strong bg-background text-foreground transition-colors",
    "focus-within:border-primary focus-within:ring-3 focus-within:ring-accent-soft",
    "data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
  ),
  {
    variants: {
      size: {
        sm: "min-h-8 text-[0.8rem]",
        md: "min-h-10 text-sm",
        lg: "min-h-12 text-base",
      },
    },
    defaultVariants: { size: "md" },
  }
)

const adornmentVariants = cva(
  cn(
    "flex shrink-0 items-center justify-center self-stretch text-muted-foreground transition-colors outline-none select-none",
    "hover:text-foreground focus-visible:text-foreground",
    "disabled:pointer-events-none disabled:opacity-40"
  ),
  {
    variants: {
      size: {
        sm: "w-7 [&_svg]:size-3.5",
        md: "w-9 [&_svg]:size-4",
        lg: "w-11 [&_svg]:size-5",
      },
    },
    defaultVariants: { size: "md" },
  }
)

type MultiSelectProps = Omit<
  React.ComponentProps<typeof ComboboxPrimitive.Root<string, true>>,
  "multiple" | "render"
> &
  VariantProps<typeof shellVariants> & {
    /** The selectable values. */
    items: string[]
    /** Field placeholder (shown when no chips). */
    placeholder?: string
    /** Message when the filter matches nothing. Default "No results." */
    emptyMessage?: string
    /** Hide the trailing clear-all button. */
    hideClear?: boolean
    /** Accessible name for the field. */
    "aria-label"?: string
    /** Positioner side. Default "bottom". */
    side?: React.ComponentProps<typeof ComboboxContent>["side"]
    /** Positioner alignment. Default "start". */
    align?: React.ComponentProps<typeof ComboboxContent>["align"]
  }

function MultiSelect({
  items,
  size = "md",
  placeholder,
  emptyMessage = "No results.",
  hideClear = false,
  disabled,
  side = "bottom",
  align = "start",
  "aria-label": ariaLabel,
  ...root
}: MultiSelectProps) {
  return (
    <ComboboxPrimitive.Root
      data-slot="multi-select"
      multiple
      items={items}
      disabled={disabled}
      {...root}
    >
      <div
        data-slot="multi-select-shell"
        data-disabled={disabled ? "" : undefined}
        className={cn(shellVariants({ size }))}
      >
        <ComboboxPrimitive.Chips
          data-slot="multi-select-chips"
          className="flex flex-1 flex-wrap items-center gap-1 py-1 ps-2"
        >
          <ComboboxPrimitive.Value>
            {(selected: string[] | null) =>
              (selected ?? []).map((value) => (
                <ComboboxPrimitive.Chip
                  key={value}
                  data-slot="multi-select-chip"
                  className={cn(
                    "inline-flex max-w-full items-center gap-1 rounded-md border border-border-strong bg-surface-2 py-0.5 ps-2 pe-1 text-xs text-foreground",
                    "data-[highlighted]:border-primary data-[highlighted]:ring-3 data-[highlighted]:ring-accent-soft"
                  )}
                >
                  <span className="truncate">{value}</span>
                  <ComboboxPrimitive.ChipRemove
                    data-slot="multi-select-chip-remove"
                    aria-label={`Remove ${value}`}
                    className={cn(
                      "inline-flex items-center justify-center rounded-sm p-0.5 text-muted-foreground outline-none transition-colors",
                      "hover:text-foreground focus-visible:text-foreground [&_svg]:size-3"
                    )}
                  >
                    <X aria-hidden />
                  </ComboboxPrimitive.ChipRemove>
                </ComboboxPrimitive.Chip>
              ))
            }
          </ComboboxPrimitive.Value>
          <ComboboxPrimitive.Input
            data-slot="multi-select-input"
            aria-label={ariaLabel}
            placeholder={placeholder}
            className={cn(
              "min-w-[6ch] flex-1 bg-transparent px-1 py-1 outline-none",
              "placeholder:text-muted-foreground disabled:cursor-not-allowed"
            )}
          />
        </ComboboxPrimitive.Chips>

        {!hideClear ? (
          <ComboboxPrimitive.Clear
            data-slot="multi-select-clear"
            aria-label="Clear all"
            className={cn(adornmentVariants({ size }))}
          >
            <X aria-hidden />
          </ComboboxPrimitive.Clear>
        ) : null}
        <ComboboxPrimitive.Trigger
          data-slot="multi-select-trigger"
          aria-label="Open"
          disabled={disabled}
          className={cn(adornmentVariants({ size }))}
        >
          <ChevronsUpDown aria-hidden />
        </ComboboxPrimitive.Trigger>
      </div>

      <ComboboxContent side={side} align={align}>
        <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
        <ComboboxList>
          {(item: string) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </ComboboxPrimitive.Root>
  )
}

export { MultiSelect }
export type { MultiSelectProps }
