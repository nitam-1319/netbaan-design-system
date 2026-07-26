import * as React from "react"

import { Checkbox } from "@/components/ui/checkbox"

/**
 * AEGIS — Role / Permission Selector (Authentication & Security, closed API)
 *
 * A grouped permission matrix: resources/categories, each with a set of togglable
 * permissions, plus a tri-state "select all" per group. You own the selection — a
 * flat array of permission values — and it emits the next array on every change.
 * Use it to compose a role out of fine-grained permissions.
 *
 * Built on the AEGIS `Checkbox` (label + description, indeterminate mixed state,
 * paired hidden input for forms), so keyboard, focus rings, and ARIA come from the
 * primitive. Public API is CLOSED — no `className` / `style`.
 * See `.agent/rules/API_RULES.md`.
 */

type Permission = {
  /** Stable permission value emitted in the selection array. */
  value: string
  /** Visible label. */
  label: string
  /** Optional helper text under the label. */
  description?: string
  /** Disable this permission. */
  disabled?: boolean
}

type PermissionGroup = {
  /** Stable group key. */
  key: string
  /** Group heading (also the select-all label). */
  label: string
  /** Permissions in this group. */
  permissions: Permission[]
}

type RolePermissionSelectorProps = {
  /** The permission groups to render. */
  groups: PermissionGroup[]
  /** Controlled selection (flat array of permission values). */
  value?: string[]
  /** Uncontrolled initial selection. */
  defaultValue?: string[]
  /** Fires with the full next selection on every change. */
  onValueChange?: (value: string[]) => void
  /** Disable the whole selector. */
  disabled?: boolean
  /** Row density. Default "md". */
  size?: "sm" | "md"
  /** Accessible name for the group of controls. */
  "aria-label"?: string
}

function RolePermissionSelector({
  groups,
  value,
  defaultValue,
  onValueChange,
  disabled = false,
  size = "md",
  "aria-label": ariaLabel = "Permissions",
}: RolePermissionSelectorProps) {
  const [internal, setInternal] = React.useState<string[]>(defaultValue ?? [])
  const isControlled = value !== undefined
  const selected = isControlled ? value : internal

  const selectedSet = React.useMemo(() => new Set(selected), [selected])

  function commit(next: string[]) {
    if (!isControlled) setInternal(next)
    onValueChange?.(next)
  }

  function togglePermission(permValue: string) {
    const next = selectedSet.has(permValue)
      ? selected.filter((v) => v !== permValue)
      : [...selected, permValue]
    commit(next)
  }

  function toggleGroup(group: PermissionGroup, allSelected: boolean) {
    const selectable = group.permissions.filter((p) => !p.disabled).map((p) => p.value)
    if (allSelected) {
      const remove = new Set(selectable)
      commit(selected.filter((v) => !remove.has(v)))
    } else {
      const merged = new Set(selected)
      selectable.forEach((v) => merged.add(v))
      commit([...merged])
    }
  }

  const checkboxSize = size === "sm" ? "sm" : "md"

  return (
    <div
      data-slot="role-permission-selector"
      role="group"
      aria-label={ariaLabel}
      className="flex flex-col gap-5"
    >
      {groups.map((group) => {
        const selectable = group.permissions.filter((p) => !p.disabled)
        const selectedInGroup = selectable.filter((p) => selectedSet.has(p.value))
        const allSelected = selectable.length > 0 && selectedInGroup.length === selectable.length
        const someSelected = selectedInGroup.length > 0 && !allSelected

        return (
          <section
            key={group.key}
            data-slot="role-permission-group"
            aria-label={group.label}
            className="flex flex-col gap-2"
          >
            <div className="flex items-center gap-2 border-b border-border pb-2">
              <Checkbox
                size={checkboxSize}
                label={group.label}
                checked={allSelected}
                indeterminate={someSelected}
                disabled={disabled || selectable.length === 0}
                onCheckedChange={() => toggleGroup(group, allSelected)}
              />
            </div>
            <div className="flex flex-col gap-2 ps-6">
              {group.permissions.map((perm) => (
                <Checkbox
                  key={perm.value}
                  size={checkboxSize}
                  label={perm.label}
                  description={perm.description}
                  checked={selectedSet.has(perm.value)}
                  disabled={disabled || perm.disabled}
                  onCheckedChange={() => togglePermission(perm.value)}
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

export { RolePermissionSelector }
export type { RolePermissionSelectorProps, PermissionGroup, Permission }
