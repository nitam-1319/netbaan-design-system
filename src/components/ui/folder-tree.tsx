import * as React from "react"
import {
  File,
  FileCode,
  FileImage,
  FileText,
  Folder,
} from "lucide-react"

import { TreeView, type TreeNode } from "@/components/ui/tree-view"

/**
 * AEGIS — Folder Tree (File Management)
 *
 * A file-system view built on `Tree View`: it maps a typed `items` tree of files
 * and folders into tree nodes, assigning folder icons and file-type icons (code,
 * image, doc, generic) by extension. Folders with children keep Tree View's
 * open/close folder glyph; empty folders and files get a fixed icon.
 *
 * A thin, file-aware wrapper — all interaction (expand, select, keyboard, ARIA)
 * is inherited from `Tree View`. Public API is CLOSED — no `className` / `style`;
 * the tree is a typed `items` config. All colour is token-driven.
 * See `.agent/rules/API_RULES.md`.
 */

type FolderNode = {
  /** Stable id. */
  id: string
  /** File or folder name. */
  name: React.ReactNode
  /** Entry kind. */
  type: "folder" | "file"
  /** Explicit extension for icon selection (else derived from `name`). */
  extension?: string
  /** Child entries (folders only). */
  children?: FolderNode[]
}

type FolderTreeProps = Omit<
  React.ComponentProps<typeof TreeView>,
  "nodes" | "children" | "className" | "style"
> & {
  /** The file-system entries. */
  items: FolderNode[]
}

const CODE_EXT = new Set([
  "ts", "tsx", "js", "jsx", "json", "css", "html", "mjs", "cjs", "sh", "py", "go", "rs",
])
const IMAGE_EXT = new Set(["png", "jpg", "jpeg", "svg", "gif", "webp", "avif", "ico"])
const DOC_EXT = new Set(["md", "mdx", "txt", "pdf", "doc", "docx", "csv"])

/** Pick a file icon from an extension. */
function fileIcon(ext: string | undefined): React.ReactNode {
  const e = (ext ?? "").toLowerCase()
  if (CODE_EXT.has(e)) return <FileCode aria-hidden />
  if (IMAGE_EXT.has(e)) return <FileImage aria-hidden />
  if (DOC_EXT.has(e)) return <FileText aria-hidden />
  return <File aria-hidden />
}

/** Derive an extension from a name string. */
function extOf(node: FolderNode): string | undefined {
  if (node.extension) return node.extension
  if (typeof node.name === "string") {
    const dot = node.name.lastIndexOf(".")
    if (dot > 0) return node.name.slice(dot + 1)
  }
  return undefined
}

/** Map file entries to tree nodes, assigning file-type / folder icons. */
function toTreeNodes(items: FolderNode[]): TreeNode[] {
  return items.map((item) => {
    const isFolder = item.type === "folder"
    const hasChildren = !!item.children && item.children.length > 0
    return {
      id: item.id,
      label: item.name,
      // Folders with children keep Tree View's open/close glyph (no override);
      // empty folders get a folder icon; files get an extension icon.
      icon: isFolder
        ? hasChildren
          ? undefined
          : <Folder aria-hidden />
        : fileIcon(extOf(item)),
      children: isFolder && hasChildren ? toTreeNodes(item.children!) : undefined,
    }
  })
}

function FolderTree({ items, label = "Files", ...props }: FolderTreeProps) {
  const nodes = React.useMemo(() => toTreeNodes(items), [items])
  return <TreeView data-slot="folder-tree" nodes={nodes} label={label} {...props} />
}

export { FolderTree }
export type { FolderTreeProps, FolderNode }
