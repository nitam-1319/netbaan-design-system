"use client";

import type * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { formatBytes, type FileKind } from "@/lib/file"
import {
  FileCard,
  type FileCardStatus,
} from "@/components/ui/file-card"

/**
 * AEGIS — File List (File Management, closed API)
 *
 * A managed vertical set of files. It renders one `FileCard` per item with real
 * list semantics (`role="list"` / `listitem`), an optional header (a `title` and
 * a `N files · total size` summary), and an empty state. Per-item removal is
 * wired through a single `onRemove(id)` callback, so a parent owns the array.
 *
 * Use a File List for an uploads queue, an attachments panel, or a stored-files
 * view — anywhere a set of files is shown and managed together. For a single file
 * use `FileCard`; for inline references use `AttachmentChip`; to collect files use
 * `Dropzone` / `FileUploader`.
 *
 * Closed API — no `className` / `style`. Items are described by data, not markup,
 * so every row is a consistent AEGIS `FileCard`. Colors are tokens only.
 * See `.agent/rules/API_RULES.md`.
 */

type FileListItem = {
  /** Stable identity used for React keys and the `onRemove` callback. */
  id: string
  name: string
  bytes?: number
  mimeType?: string
  kind?: FileKind
  thumbnailSrc?: string
  description?: React.ReactNode
  status?: FileCardStatus
  progress?: number
  errorMessage?: React.ReactNode
  /** Per-item override: hide this row's dismiss button even when the list is removable. */
  removable?: boolean
}

const fileListVariants = cva("flex w-full flex-col", {
  variants: {
    size: {
      sm: "gap-2",
      md: "gap-2.5",
    },
  },
  defaultVariants: { size: "md" },
})

type FileListProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style" | "children" | "title"
> &
  VariantProps<typeof fileListVariants> & {
    /** The files to render, in order. */
    files: FileListItem[]
    /** Optional heading shown above the list. */
    title?: React.ReactNode
    /** Show a `N files · total size` summary in the header. Default `true`. */
    showSummary?: boolean
    /** Show a dismiss button on each row (unless the item opts out). */
    removable?: boolean
    /** Called with an item `id` when its dismiss button is activated. */
    onRemove?: (id: string) => void
    /** Accessible label for every row's dismiss button. Default `"Remove file"`. */
    removeLabel?: string
    /** Rendered in place of the list when `files` is empty. */
    emptyState?: React.ReactNode
    /** Accessible label for the list region (falls back to `title`, else generic). */
    label?: string
    /** Dim + disable every row. */
    disabled?: boolean
  }

function FileList({
  size = "md",
  files,
  title,
  showSummary = true,
  removable = false,
  onRemove,
  removeLabel = "Remove file",
  emptyState,
  label,
  disabled = false,
  ...props
}: FileListProps) {
  const totalBytes = files.reduce((sum, f) => sum + (f.bytes ?? 0), 0)
  const summary =
    files.length > 0 && showSummary
      ? `${files.length} ${files.length === 1 ? "file" : "files"}${
          totalBytes > 0 ? ` · ${formatBytes(totalBytes)}` : ""
        }`
      : null

  const accessibleName =
    label ?? (typeof title === "string" ? title : undefined)

  return (
    <div data-slot="file-list" className="flex w-full flex-col gap-2.5" {...props}>
      {(title != null || summary != null) && (
        <div
          data-slot="file-list-header"
          className="flex items-baseline justify-between gap-3"
        >
          {title != null ? (
            <span
              data-slot="file-list-title"
              className="text-sm font-semibold text-foreground"
            >
              {title}
            </span>
          ) : (
            <span />
          )}
          {summary != null ? (
            <span
              data-slot="file-list-summary"
              dir="ltr"
              className="shrink-0 font-mono text-xs tabular-nums text-text-faint"
            >
              {summary}
            </span>
          ) : null}
        </div>
      )}

      {files.length === 0 ? (
        <div data-slot="file-list-empty">{emptyState}</div>
      ) : (
        <div
          role="list"
          aria-label={accessibleName}
          data-slot="file-list-items"
          className={cn(fileListVariants({ size }))}
        >
          {files.map((item) => {
            const showRemove =
              removable && item.removable !== false && onRemove != null
            return (
              <div role="listitem" key={item.id} data-slot="file-list-item">
                <FileCard
                  size={size}
                  name={item.name}
                  bytes={item.bytes}
                  mimeType={item.mimeType}
                  kind={item.kind}
                  thumbnailSrc={item.thumbnailSrc}
                  description={item.description}
                  status={item.status}
                  progress={item.progress}
                  errorMessage={item.errorMessage}
                  disabled={disabled}
                  removeLabel={removeLabel}
                  onRemove={showRemove ? () => onRemove?.(item.id) : undefined}
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export { FileList, fileListVariants }
export type { FileListProps, FileListItem }
