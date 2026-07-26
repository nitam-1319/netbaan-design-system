import * as React from "react"

import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"

/**
 * AEGIS — Row Selection (Tables & Data Grid)
 *
 * The standalone checkbox-selection affordance for a hand-rolled `Table` — the
 * selection sibling of Column Sort / Column Filter. The `useRowSelection` hook
 * owns the selected-id set (controlled or uncontrolled) with a tri-state
 * select-all; `RowSelectionHeader` renders the header `<th>` select-all box and
 * `RowSelectionCell` renders a per-row `<td>` box. It emits selection; you keep
 * the data and decide what selection means.
 *
 * Selection is conveyed by the native `checkbox` state (and the row's
 * `data-state="selected"` if you set it), never colour alone. Public API is
 * CLOSED — no `className` / `style`. Mirrors Data Table's selection semantics.
 * See `.agent/rules/API_RULES.md`.
 */

/* ------------------------------------------------------------------ Types -- */

export interface UseRowSelectionOptions {
  /** Controlled selected row ids. */
  selectedIds?: string[]
  /** Uncontrolled initial selection. */
  defaultSelectedIds?: string[]
  /** Fires with the full next id list on every change. */
  onSelectedIdsChange?: (ids: string[]) => void
}

export interface ToggleAllState {
  /** True when every visible row is selected. */
  checked: boolean
  /** True when some — but not all — visible rows are selected. */
  indeterminate: boolean
}

export interface UseRowSelectionReturn {
  /** Currently selected ids. */
  selectedIds: string[]
  /** Number of selected ids. */
  selectedCount: number
  /** Whether a given row id is selected. */
  isSelected: (id: string) => boolean
  /** Select or deselect one row. */
  toggle: (id: string, checked: boolean) => void
  /** Select or deselect every id in `allIds` at once. */
  toggleAll: (allIds: string[], checked: boolean) => void
  /** The header checkbox state for the given visible id set. */
  getToggleAllState: (allIds: string[]) => ToggleAllState
  /** Clear the whole selection. */
  clear: () => void
}

/* ------------------------------------------------------------------- Hook -- */

function useRowSelection({
  selectedIds,
  defaultSelectedIds = [],
  onSelectedIdsChange,
}: UseRowSelectionOptions = {}): UseRowSelectionReturn {
  const [internal, setInternal] = React.useState<string[]>(defaultSelectedIds)
  const isControlled = selectedIds !== undefined
  const selection = isControlled ? selectedIds! : internal

  const commit = React.useCallback(
    (next: string[]) => {
      if (!isControlled) setInternal(next)
      onSelectedIdsChange?.(next)
    },
    [isControlled, onSelectedIdsChange]
  )

  const selectedSet = React.useMemo(() => new Set(selection), [selection])

  const isSelected = React.useCallback((id: string) => selectedSet.has(id), [selectedSet])

  const toggle = React.useCallback(
    (id: string, checked: boolean) => {
      if (checked) {
        if (selectedSet.has(id)) return
        commit([...selection, id])
      } else {
        commit(selection.filter((rowId) => rowId !== id))
      }
    },
    [selection, selectedSet, commit]
  )

  const toggleAll = React.useCallback(
    (allIds: string[], checked: boolean) => {
      if (checked) {
        const next = new Set(selectedSet)
        allIds.forEach((id) => next.add(id))
        commit([...next])
      } else {
        const remove = new Set(allIds)
        commit(selection.filter((id) => !remove.has(id)))
      }
    },
    [selection, selectedSet, commit]
  )

  const getToggleAllState = React.useCallback(
    (allIds: string[]): ToggleAllState => {
      const checked = allIds.length > 0 && allIds.every((id) => selectedSet.has(id))
      const someSelected = allIds.some((id) => selectedSet.has(id))
      return { checked, indeterminate: someSelected && !checked }
    },
    [selectedSet]
  )

  const clear = React.useCallback(() => commit([]), [commit])

  return {
    selectedIds: selection,
    selectedCount: selection.length,
    isSelected,
    toggle,
    toggleAll,
    getToggleAllState,
    clear,
  }
}

/* --------------------------------------------------------------- th / td -- */

type ThProps = Omit<React.ComponentProps<"th">, "className" | "style" | "children">
type TdProps = Omit<React.ComponentProps<"td">, "className" | "style" | "children">

export interface RowSelectionHeaderProps extends ThProps {
  /** Header checkbox state (from `getToggleAllState`). */
  state: ToggleAllState
  /** Fires with the next checked value when the select-all box is toggled. */
  onToggleAll: (checked: boolean) => void
  /** Disable the select-all box (e.g. while loading or when there are no rows). */
  disabled?: boolean
  /** Accessible name for the select-all box. Default "Select all rows". */
  label?: string
}

function RowSelectionHeader({
  state,
  onToggleAll,
  disabled = false,
  label = "Select all rows",
  ...props
}: RowSelectionHeaderProps) {
  return (
    <th
      data-slot="row-selection-header"
      className={cn("h-10 px-3 align-middle [&:has([role=checkbox])]:pe-0")}
      {...props}
    >
      <div className={cn("flex items-center")}>
        <Checkbox
          checked={state.checked}
          indeterminate={state.indeterminate}
          onCheckedChange={(checked) => onToggleAll(checked)}
          disabled={disabled}
          aria-label={label}
        />
      </div>
    </th>
  )
}

export interface RowSelectionCellProps extends TdProps {
  /** Whether this row is selected. */
  selected: boolean
  /** Fires with the next checked value when this row's box is toggled. */
  onSelectedChange: (checked: boolean) => void
  /** Accessible name for this row's box. Required — describe the row. */
  label: string
  /** Disable this row's box. */
  disabled?: boolean
}

function RowSelectionCell({
  selected,
  onSelectedChange,
  label,
  disabled = false,
  ...props
}: RowSelectionCellProps) {
  return (
    <td
      data-slot="row-selection-cell"
      className={cn("p-3 align-middle [&:has([role=checkbox])]:pe-0")}
      {...props}
    >
      <div className={cn("flex items-center")}>
        <Checkbox
          checked={selected}
          onCheckedChange={(checked) => onSelectedChange(checked)}
          disabled={disabled}
          aria-label={label}
        />
      </div>
    </td>
  )
}

export { useRowSelection, RowSelectionHeader, RowSelectionCell }
