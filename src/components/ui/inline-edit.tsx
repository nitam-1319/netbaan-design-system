"use client";

import * as React from "react"
import { Check, Pencil, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { TextField } from "@/components/ui/text-field"
import { Button } from "@/components/ui/button"

/**
 * AEGIS — Inline Edit (Forms)
 *
 * A value that reads as text until you edit it in place: click the value (or its
 * pencil affordance) to swap to a `TextField` pre-filled with the current value,
 * then commit with Enter / the check, or discard with Escape / the ✕. It composes
 * the AEGIS `TextField` and `Button`, so the editor inherits the field treatment,
 * focus ring, and button affordances.
 *
 * Controlled (`value` + `onValueChange`) and uncontrolled (`defaultValue`) usage
 * are both supported, as are controlled/uncontrolled edit state. Public API is
 * CLOSED — no `className` / `style`; everything is a semantic prop. All colour is
 * token-driven. See `.agent/rules/API_RULES.md`.
 */

type InlineEditProps = {
  /** Controlled value. */
  value?: string
  /** Initial value when uncontrolled. Default "". */
  defaultValue?: string
  /** Fired with the new value when an edit is committed. */
  onValueChange?: (value: string) => void
  /** Accessible label for the field and the edit trigger. Required. */
  label: string
  /** Placeholder shown when the value is empty. */
  placeholder?: string
  /** Controlled edit state. */
  editing?: boolean
  /** Fired when edit mode is entered/left. */
  onEditingChange?: (editing: boolean) => void
  /** Field + button scale. Default "md". */
  size?: "sm" | "md" | "lg"
  /** Disable editing entirely. */
  disabled?: boolean
  /** Accessible label for the save button. Default "Save". */
  saveLabel?: string
  /** Accessible label for the cancel button. Default "Cancel". */
  cancelLabel?: string
}

const iconButtonSize = { sm: "icon-sm", md: "icon", lg: "icon-lg" } as const

function InlineEdit({
  value,
  defaultValue = "",
  onValueChange,
  label,
  placeholder = "Empty",
  editing,
  onEditingChange,
  size = "md",
  disabled = false,
  saveLabel = "Save",
  cancelLabel = "Cancel",
}: InlineEditProps) {
  const isValueControlled = value != null
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const currentValue = isValueControlled ? value : internalValue

  const isEditingControlled = editing != null
  const [internalEditing, setInternalEditing] = React.useState(false)
  const isEditing = isEditingControlled ? editing : internalEditing

  const [draft, setDraft] = React.useState(currentValue)

  const setEditing = (next: boolean) => {
    if (!isEditingControlled) setInternalEditing(next)
    onEditingChange?.(next)
  }

  const startEditing = () => {
    if (disabled) return
    setDraft(currentValue)
    setEditing(true)
  }

  const commit = () => {
    if (!isValueControlled) setInternalValue(draft)
    onValueChange?.(draft)
    setEditing(false)
  }

  const cancel = () => {
    setDraft(currentValue)
    setEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      commit()
    } else if (e.key === "Escape") {
      e.preventDefault()
      cancel()
    }
  }

  if (isEditing) {
    return (
      <div
        data-slot="inline-edit"
        data-editing=""
        className={cn("flex items-center gap-1.5")}
        onKeyDown={handleKeyDown}
      >
        <TextField
          aria-label={label}
          size={size}
          value={draft}
          placeholder={placeholder}
          autoFocus
          onChange={(e) => setDraft((e.target as HTMLInputElement).value)}
        />
        <Button
          variant="primary"
          size={iconButtonSize[size]}
          onClick={commit}
          aria-label={saveLabel}
        >
          <Check aria-hidden />
        </Button>
        <Button
          variant="ghost"
          size={iconButtonSize[size]}
          onClick={cancel}
          aria-label={cancelLabel}
        >
          <X aria-hidden />
        </Button>
      </div>
    )
  }

  const isEmpty = currentValue.trim() === ""

  return (
    <button
      type="button"
      data-slot="inline-edit"
      data-empty={isEmpty || undefined}
      disabled={disabled}
      onClick={startEditing}
      aria-label={`Edit ${label}`}
      className={cn(
        "group/inline-edit inline-flex max-w-full items-center gap-1.5 rounded-md px-1.5 py-0.5 text-start outline-none transition-colors",
        "hover:bg-muted focus-visible:ring-3 focus-visible:ring-accent-soft",
        "disabled:pointer-events-none disabled:opacity-50",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        size === "lg" && "text-base"
      )}
    >
      <span
        data-slot="inline-edit-value"
        className={cn(
          "min-w-0 truncate",
          isEmpty ? "text-muted-foreground italic" : "text-foreground"
        )}
      >
        {isEmpty ? placeholder : currentValue}
      </span>
      <Pencil
        aria-hidden
        className="size-3.5 shrink-0 text-text-faint opacity-0 transition-opacity group-hover/inline-edit:opacity-100 group-focus-visible/inline-edit:opacity-100"
      />
    </button>
  )
}

export { InlineEdit }
export type { InlineEditProps }
