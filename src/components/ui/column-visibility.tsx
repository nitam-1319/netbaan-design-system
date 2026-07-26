import * as React from "react"
import { Columns3 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Menu,
  MenuTrigger,
  MenuContent,
  MenuGroup,
  MenuGroupLabel,
  MenuCheckboxItem,
} from "@/components/ui/menu"

/**
 * AEGIS — Column Visibility (Tables & Data Grid)
 *
 * The dropdown that lets a user show or hide a table's columns. It is
 * config-driven and controlled by you: pass the `columns` catalogue and a
 * `key → visible` map; it renders a checkbox item per hideable column and emits
 * the next map on every toggle. Pair it with a Data Table by feeding the map into
 * your column list.
 *
 * A column marked `canHide: false` is always shown (locked, disabled item), and
 * `minVisible` stops the user from hiding everything. Built on the AEGIS `Menu`
 * (roving focus, typeahead, portalled surface). Public API is CLOSED — no
 * `className` / `style`. See `.agent/rules/API_RULES.md`.
 */

type ColumnVisibilityItem = {
  /** Stable column key (matches your Data Table column). */
  key: string
  /** Human label shown in the menu. */
  label: string
  /** Whether the user may hide this column. Default `true`. */
  canHide?: boolean
}

type VisibilityMap = Record<string, boolean>

type ColumnVisibilityProps = {
  /** The columns that can be toggled. */
  columns: ColumnVisibilityItem[]
  /** Controlled visibility map (`key → visible`). Missing keys are treated as visible. */
  value?: VisibilityMap
  /** Uncontrolled initial visibility map. */
  defaultValue?: VisibilityMap
  /** Fires with the full next map whenever a column is toggled. */
  onValueChange?: (next: VisibilityMap) => void
  /** Trigger button text. Default "Columns". */
  triggerLabel?: string
  /** Menu heading. Default "Toggle columns". */
  heading?: string
  /** Minimum number of columns that must stay visible. Default 1. */
  minVisible?: number
  /** Trigger size. Default "sm". */
  size?: "sm" | "md" | "lg"
  /** Positioner side. Default "bottom". */
  side?: React.ComponentProps<typeof MenuContent>["side"]
  /** Positioner alignment. Default "end". */
  align?: React.ComponentProps<typeof MenuContent>["align"]
}

function ColumnVisibility({
  columns,
  value,
  defaultValue,
  onValueChange,
  triggerLabel = "Columns",
  heading = "Toggle columns",
  minVisible = 1,
  size = "sm",
  side = "bottom",
  align = "end",
}: ColumnVisibilityProps) {
  const [internal, setInternal] = React.useState<VisibilityMap>(defaultValue ?? {})
  const isControlled = value !== undefined
  const map = isControlled ? value : internal

  const isVisible = React.useCallback(
    (key: string) => map[key] ?? true,
    [map]
  )

  const visibleCount = columns.filter((c) => isVisible(c.key)).length

  function toggle(key: string) {
    const currentlyVisible = isVisible(key)
    // Block hiding the last allowed column(s).
    if (currentlyVisible && visibleCount <= minVisible) return
    const next: VisibilityMap = { ...map, [key]: !currentlyVisible }
    if (!isControlled) setInternal(next)
    onValueChange?.(next)
  }

  return (
    <Menu>
      <MenuTrigger render={<Button variant="outline" size={size} />}>
        <Columns3 aria-hidden />
        {triggerLabel}
      </MenuTrigger>
      <MenuContent side={side} align={align} aria-label={heading}>
        <MenuGroup>
          <MenuGroupLabel>{heading}</MenuGroupLabel>
          {columns.map((col) => {
            const locked = col.canHide === false
            const visible = isVisible(col.key)
            return (
              <MenuCheckboxItem
                key={col.key}
                checked={locked ? true : visible}
                disabled={locked}
                closeOnClick={false}
                onCheckedChange={() => toggle(col.key)}
              >
                {col.label}
              </MenuCheckboxItem>
            )
          })}
        </MenuGroup>
      </MenuContent>
    </Menu>
  )
}

export { ColumnVisibility }
export type { ColumnVisibilityProps, ColumnVisibilityItem, VisibilityMap }
