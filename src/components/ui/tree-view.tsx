import * as React from "react"
import { ChevronRight, File, Folder, FolderOpen } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * AEGIS — Tree View (Data Display)
 *
 * A hierarchical, expandable list — file trees, org structures, nested
 * categories. It renders a semantic `role="tree"` of `treeitem`s with
 * `aria-expanded` / `aria-selected`, indents by depth, and toggles branches on
 * click or keyboard (Enter/Space, Arrow Right/Left). Expansion and selection are
 * each controllable or uncontrolled.
 *
 * Token-only, no Base UI primitive (a bespoke ARIA tree). Public API is CLOSED —
 * no `className` / `style`; the tree is a typed `nodes` config. All colour is
 * token-driven. See `.agent/rules/API_RULES.md`.
 */

type TreeNode = {
  /** Stable id (expansion + selection key). */
  id: string
  /** Row label. */
  label: React.ReactNode
  /** Optional custom icon (overrides the folder/file default). */
  icon?: React.ReactNode
  /** Child nodes; presence makes the node a branch. */
  children?: TreeNode[]
}

type TreeViewProps = Omit<
  React.ComponentProps<"ul">,
  "className" | "style" | "children"
> & {
  /** The root nodes. */
  nodes: TreeNode[]
  /** Controlled set of expanded ids. */
  expandedIds?: string[]
  /** Initially expanded ids when uncontrolled. */
  defaultExpandedIds?: string[]
  /** Fired with the full expanded-id set on toggle. */
  onExpandedChange?: (ids: string[]) => void
  /** Controlled selected id. */
  selectedId?: string
  /** Fired with a node id when it is selected. */
  onSelectionChange?: (id: string) => void
  /** Accessible name for the tree. */
  label?: string
}

function TreeItem({
  node,
  depth,
  expanded,
  selectedId,
  onToggle,
  onSelect,
}: {
  node: TreeNode
  depth: number
  expanded: Set<string>
  selectedId: string | undefined
  onToggle: (id: string) => void
  onSelect: (id: string) => void
}) {
  const hasChildren = !!node.children && node.children.length > 0
  const isOpen = expanded.has(node.id)
  const isSelected = selectedId === node.id

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      onSelect(node.id)
      if (hasChildren) onToggle(node.id)
    } else if (e.key === "ArrowRight" && hasChildren && !isOpen) {
      e.preventDefault()
      onToggle(node.id)
    } else if (e.key === "ArrowLeft" && hasChildren && isOpen) {
      e.preventDefault()
      onToggle(node.id)
    }
  }

  const defaultIcon = hasChildren ? (
    isOpen ? (
      <FolderOpen aria-hidden />
    ) : (
      <Folder aria-hidden />
    )
  ) : (
    <File aria-hidden />
  )

  return (
    <li
      role="treeitem"
      data-slot="tree-view-item"
      data-selected={isSelected || undefined}
      aria-expanded={hasChildren ? isOpen : undefined}
      aria-selected={isSelected}
    >
      <div
        data-slot="tree-view-row"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onClick={() => {
          onSelect(node.id)
          if (hasChildren) onToggle(node.id)
        }}
        className={cn(
          "flex cursor-pointer items-center gap-1.5 rounded-md py-1 pe-2 text-sm outline-none transition-colors",
          "hover:bg-muted focus-visible:ring-3 focus-visible:ring-accent-soft",
          isSelected
            ? "bg-accent-soft font-medium text-accent-strong"
            : "text-foreground"
        )}
      >
        {/* Depth indentation via spacer cells (no inline style). */}
        {Array.from({ length: depth }).map((_, i) => (
          <span key={i} aria-hidden className="w-4 shrink-0" />
        ))}
        <span
          data-slot="tree-view-toggle"
          aria-hidden
          className="flex size-4 shrink-0 items-center justify-center text-text-faint"
        >
          {hasChildren ? (
            <ChevronRight
              className={cn(
                "size-3.5 transition-transform",
                isOpen ? "rotate-90" : "rtl:rotate-180"
              )}
            />
          ) : null}
        </span>
        <span
          data-slot="tree-view-icon"
          className="flex size-4 shrink-0 items-center justify-center text-muted-foreground [&>svg]:size-4"
        >
          {node.icon ?? defaultIcon}
        </span>
        <span className="min-w-0 flex-1 truncate">{node.label}</span>
      </div>

      {hasChildren && isOpen ? (
        <ul role="group" data-slot="tree-view-group">
          {node.children!.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              expanded={expanded}
              selectedId={selectedId}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </ul>
      ) : null}
    </li>
  )
}

function TreeView({
  nodes,
  expandedIds,
  defaultExpandedIds = [],
  onExpandedChange,
  selectedId,
  onSelectionChange,
  label = "Tree",
  ...props
}: TreeViewProps) {
  const isExpandedControlled = expandedIds != null
  const [internalExpanded, setInternalExpanded] = React.useState<Set<string>>(
    () => new Set(defaultExpandedIds)
  )
  const expanded = isExpandedControlled
    ? new Set(expandedIds)
    : internalExpanded

  const isSelectedControlled = selectedId !== undefined
  const [internalSelected, setInternalSelected] = React.useState<
    string | undefined
  >(undefined)
  const selected = isSelectedControlled ? selectedId : internalSelected

  const toggle = (id: string) => {
    const next = new Set(expanded)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    if (!isExpandedControlled) setInternalExpanded(next)
    onExpandedChange?.([...next])
  }

  const select = (id: string) => {
    if (!isSelectedControlled) setInternalSelected(id)
    onSelectionChange?.(id)
  }

  return (
    <ul
      role="tree"
      aria-label={label}
      data-slot="tree-view"
      className={cn("text-sm text-foreground")}
      {...props}
    >
      {nodes.map((node) => (
        <TreeItem
          key={node.id}
          node={node}
          depth={0}
          expanded={expanded}
          selectedId={selected}
          onToggle={toggle}
          onSelect={select}
        />
      ))}
    </ul>
  )
}

export { TreeView }
export type { TreeViewProps, TreeNode }
