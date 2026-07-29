"use client";

import * as React from "react"
import { Plus, Trash2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

/**
 * AEGIS — Field Array (Forms)
 *
 * Manages a repeatable set of fields — email lists, key/value pairs, team
 * members, scan targets — with add, remove, and `min` / `max` bounds. You render
 * each row's fields via `renderItem`; Field Array owns the array state, the row
 * frame, the remove control, and the add button (composing `Button`).
 *
 * Controlled (`value` + `onChange`) or uncontrolled (`defaultValue`). Public API
 * is CLOSED — no `className` / `style`; everything is a semantic prop. All colour
 * is token-driven. See `.agent/rules/API_RULES.md`.
 */

type FieldArrayProps<T> = {
  /** Controlled array value. */
  value?: T[]
  /** Initial value when uncontrolled. Default `[]`. */
  defaultValue?: T[]
  /** Fired with the next array on add/remove. */
  onChange?: (next: T[]) => void
  /** Render one row's fields. */
  renderItem: (args: { item: T; index: number }) => React.ReactNode
  /** Factory for a new row (used by the add button). */
  newItem: () => T
  /** Group label / legend. */
  label?: React.ReactNode
  /** Add button label. Default "Add". */
  addLabel?: React.ReactNode
  /** Accessible label for each remove button. Default "Remove". */
  removeLabel?: string
  /** Minimum rows (remove disabled at this count). Default 0. */
  min?: number
  /** Maximum rows (add disabled at this count). */
  max?: number
  /** Disable all controls. */
  disabled?: boolean
}

function FieldArray<T>({
  value,
  defaultValue = [],
  onChange,
  renderItem,
  newItem,
  label,
  addLabel = "Add",
  removeLabel = "Remove",
  min = 0,
  max,
  disabled = false,
}: FieldArrayProps<T>) {
  const isControlled = value != null
  const [internal, setInternal] = React.useState<T[]>(defaultValue)
  const items = isControlled ? value : internal
  const labelId = React.useId()

  const commit = (next: T[]) => {
    if (!isControlled) setInternal(next)
    onChange?.(next)
  }

  const add = () => {
    if (max != null && items.length >= max) return
    commit([...items, newItem()])
  }
  const removeAt = (index: number) => {
    if (items.length <= min) return
    commit(items.filter((_, i) => i !== index))
  }

  const canAdd = !disabled && (max == null || items.length < max)
  const canRemove = !disabled && items.length > min

  return (
    <div data-slot="field-array" role="group" aria-labelledby={label != null ? labelId : undefined} className={cn("flex flex-col gap-3")}>
      {label != null ? (
        <span id={labelId} data-slot="field-array-label" className="text-sm font-medium text-foreground">
          {label}
        </span>
      ) : null}

      {items.length === 0 ? (
        <p data-slot="field-array-empty" className="text-sm text-muted-foreground">
          No entries yet.
        </p>
      ) : null}

      <div className="flex flex-col gap-2">
        {items.map((item, index) => (
          <div
            key={index}
            data-slot="field-array-item"
            data-index={index}
            className="flex items-start gap-2"
          >
            <div className="min-w-0 flex-1">{renderItem({ item, index })}</div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeAt(index)}
              disabled={!canRemove}
              aria-label={`${removeLabel} ${index + 1}`}
            >
              <Trash2 aria-hidden className="text-destructive-ink" />
            </Button>
          </div>
        ))}
      </div>

      <div>
        <Button variant="outline" size="sm" onClick={add} disabled={!canAdd}>
          <Plus aria-hidden />
          {addLabel}
        </Button>
      </div>
    </div>
  )
}

export { FieldArray }
export type { FieldArrayProps }
