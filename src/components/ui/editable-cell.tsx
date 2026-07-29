"use client";


import { cn } from "@/lib/utils"
import { InlineEdit } from "@/components/ui/inline-edit"

/**
 * AEGIS — Editable Cell (Tables & Data Grid)
 *
 * A table-cell wrapper that makes a value editable in place — the data-grid
 * companion to `Inline Edit`. It composes `Inline Edit` (click-to-edit, Enter /
 * Escape, controlled/uncontrolled) and tunes it for a cell: a compact `sm` size,
 * full-cell alignment (start / center / end for numeric columns), and a stable
 * hit target. Drop it inside your own `<td>` / `TableCell`.
 *
 * Public API is CLOSED — no `className` / `style`; alignment and behaviour are
 * semantic props. All colour is token-driven. See `.agent/rules/API_RULES.md`.
 */

type EditableCellProps = {
  /** Controlled value. */
  value?: string
  /** Initial value when uncontrolled. */
  defaultValue?: string
  /** Fired with the new value when an edit is committed. */
  onValueChange?: (value: string) => void
  /** Accessible label for the field + edit trigger (e.g. the column name). Required. */
  label: string
  /** Placeholder when empty. */
  placeholder?: string
  /** Cell content alignment. Default "start" (use "end" for numeric columns). */
  align?: "start" | "center" | "end"
  /** Field scale. Default "sm" (cell-appropriate). */
  size?: "sm" | "md" | "lg"
  /** Disable editing. */
  disabled?: boolean
}

const alignClass: Record<NonNullable<EditableCellProps["align"]>, string> = {
  start: "justify-start text-start",
  center: "justify-center text-center",
  end: "justify-end text-end",
}

function EditableCell({
  value,
  defaultValue,
  onValueChange,
  label,
  placeholder,
  align = "start",
  size = "sm",
  disabled = false,
}: EditableCellProps) {
  return (
    <div
      data-slot="editable-cell"
      data-align={align}
      className={cn("flex w-full items-center", alignClass[align])}
    >
      <InlineEdit
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        label={label}
        placeholder={placeholder}
        size={size}
        disabled={disabled}
      />
    </div>
  )
}

export { EditableCell }
export type { EditableCellProps }
