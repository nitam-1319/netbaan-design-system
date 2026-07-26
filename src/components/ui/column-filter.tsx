import * as React from "react"
import { Filter } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverTitle,
} from "@/components/ui/popover"

/**
 * AEGIS — Column Filter (Tables & Data Grid)
 *
 * The per-column filter affordance for a table header: a compact trigger that
 * shows whether a filter is active and opens a popover with the filter control.
 * Two modes cover the common cases — `text` (a "contains" query, emits a string)
 * and `select` (a checkbox list, emits the chosen values). You own the data; the
 * component emits the filter value and marks itself active.
 *
 * Numeric / date **range** filters are a deliberate follow-up (an additive mode),
 * not folded in here — see `.agent/DECISIONS.md`. Built on the AEGIS `Popover`
 * (portalled, collision-aware) + `Checkbox`. Public API is CLOSED — no
 * `className` / `style`. See `.agent/rules/API_RULES.md`.
 */

type ColumnFilterOption = { value: string; label: string }

type ColumnFilterProps = {
  /** Column name — used for the trigger's accessible name and the popover title. */
  label: string
  /** Filter mode. Default "text". */
  type?: "text" | "select"
  /** Options for `type="select"`. */
  options?: ColumnFilterOption[]
  /** Controlled value — a string for `text`, a string[] for `select`. */
  value?: string | string[]
  /** Uncontrolled initial value. */
  defaultValue?: string | string[]
  /** Fires with the next value on every change. */
  onValueChange?: (value: string | string[]) => void
  /** Placeholder for the text input. */
  placeholder?: string
  /** Trigger size. Default "sm". */
  size?: "sm" | "md" | "lg"
  /** Popover side. Default "bottom". */
  side?: React.ComponentProps<typeof PopoverContent>["side"]
  /** Popover alignment. Default "start". */
  align?: React.ComponentProps<typeof PopoverContent>["align"]
}

const triggerSize: Record<NonNullable<ColumnFilterProps["size"]>, "icon-sm" | "icon" | "icon-lg"> = {
  sm: "icon-sm",
  md: "icon",
  lg: "icon-lg",
}

function ColumnFilter({
  label,
  type = "text",
  options = [],
  value,
  defaultValue,
  onValueChange,
  placeholder,
  size = "sm",
  side = "bottom",
  align = "start",
}: ColumnFilterProps) {
  const isSelect = type === "select"
  const [internal, setInternal] = React.useState<string | string[]>(
    defaultValue ?? (isSelect ? [] : "")
  )
  const isControlled = value !== undefined
  const val = isControlled ? value : internal

  const selected = isSelect ? (Array.isArray(val) ? val : []) : []
  const text = !isSelect ? (typeof val === "string" ? val : "") : ""
  const active = isSelect ? selected.length > 0 : text.length > 0

  function commit(next: string | string[]) {
    if (!isControlled) setInternal(next)
    onValueChange?.(next)
  }

  function toggleOption(optValue: string) {
    const next = selected.includes(optValue)
      ? selected.filter((v) => v !== optValue)
      : [...selected, optValue]
    commit(next)
  }

  function clear() {
    commit(isSelect ? [] : "")
  }

  return (
    <Popover>
      <PopoverTrigger
        render={<Button variant={active ? "soft" : "ghost"} size={triggerSize[size]} />}
        aria-label={active ? `Filter by ${label} (active)` : `Filter by ${label}`}
      >
        <Filter aria-hidden />
      </PopoverTrigger>
      <PopoverContent side={side} align={align}>
        <div data-slot="column-filter" className="flex w-56 flex-col gap-3">
          <PopoverTitle>
            <span className="text-sm font-semibold text-foreground">Filter: {label}</span>
          </PopoverTitle>

          {isSelect ? (
            <div className="flex flex-col gap-2" role="group" aria-label={`Filter by ${label}`}>
              {options.map((opt) => (
                <Checkbox
                  key={opt.value}
                  size="sm"
                  label={opt.label}
                  checked={selected.includes(opt.value)}
                  onCheckedChange={() => toggleOption(opt.value)}
                />
              ))}
            </div>
          ) : (
            <input
              type="text"
              value={text}
              placeholder={placeholder ?? `Filter ${label}…`}
              aria-label={`Filter by ${label}`}
              onChange={(e) => commit(e.target.value)}
              className={cn(
                "h-9 w-full rounded-lg border border-border-strong bg-surface-2 px-3 text-sm text-foreground outline-none transition-[color,box-shadow,border-color]",
                "placeholder:text-muted-foreground hover:border-accent-strong",
                "focus-visible:border-accent-strong focus-visible:ring-3 focus-visible:ring-accent-soft"
              )}
            />
          )}

          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={clear} disabled={!active}>
              Clear
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { ColumnFilter }
export type { ColumnFilterProps, ColumnFilterOption }
