import * as React from "react"

import { formatBytes } from "@/lib/file"
import { Dropzone } from "@/components/ui/dropzone"
import { FileList, type FileListItem } from "@/components/ui/file-list"

/**
 * AEGIS — File Uploader (File Management, closed API)
 *
 * The full intake composite: a `Dropzone` to collect files and a managed
 * `FileList` of what was selected, wired together with client-side validation
 * (`accept`, `maxSizeBytes`, `maxFiles`). Selection appends to the list; rejected
 * files are kept with an `error` status and a plain-language reason so the user
 * can see and dismiss them.
 *
 * Controlled or uncontrolled: pass `files` + `onFilesChange` to own the array, or
 * let the uploader hold it (seed with `defaultFiles`). Either way it never uploads
 * anything itself — it emits the current `FileListItem[]`; the parent performs the
 * transfer and updates each item's `status` / `progress`.
 *
 * Closed API — no `className` / `style`; validation + callbacks are semantic, not
 * styling hatches. Colors are tokens only (inherited from `Dropzone` / `FileCard`).
 * See `.agent/rules/API_RULES.md`.
 */

type Rejection = { file: File; reason: string }

type FileUploaderProps = {
  /** Comma-separated `accept` list, forwarded to the Dropzone and used to validate. */
  accept?: string
  /** Allow selecting more than one file. Default `true`. */
  multiple?: boolean
  /** Dim + disable the whole uploader. */
  disabled?: boolean
  /** Dropzone size. The list uses `md` for `lg`. */
  size?: "sm" | "md" | "lg"
  /** Dropzone prompt lines. */
  title?: React.ReactNode
  description?: React.ReactNode
  hint?: React.ReactNode
  /** Maximum number of files to keep; extra selections are rejected. */
  maxFiles?: number
  /** Maximum size per file in bytes; larger files are rejected. */
  maxSizeBytes?: number
  /** Controlled list of items. Provide with `onFilesChange`. */
  files?: FileListItem[]
  /** Initial items for the uncontrolled mode. */
  defaultFiles?: FileListItem[]
  /** Called with the full item list whenever it changes. */
  onFilesChange?: (items: FileListItem[]) => void
  /** Called with the files that failed validation, and why. */
  onReject?: (rejections: Rejection[]) => void
  /** Heading above the file list. */
  listTitle?: React.ReactNode
  /** Show the `N files · total` summary. Default `true`. */
  showSummary?: boolean
  /** Allow removing selected files. Default `true`. */
  removable?: boolean
}

/** Does `file` satisfy a comma-separated `accept` list? Empty accept ⇒ yes. */
function matchesAccept(file: File, accept?: string): boolean {
  if (!accept) return true
  const name = file.name.toLowerCase()
  const type = (file.type || "").toLowerCase()
  return accept
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .some((pattern) => {
      if (pattern.startsWith(".")) return name.endsWith(pattern)
      if (pattern.endsWith("/*")) return type.startsWith(pattern.slice(0, -1))
      return type === pattern
    })
}

function FileUploader({
  accept,
  multiple = true,
  disabled = false,
  size = "md",
  title,
  description,
  hint,
  maxFiles,
  maxSizeBytes,
  files: controlled,
  defaultFiles = [],
  onFilesChange,
  onReject,
  listTitle,
  showSummary = true,
  removable = true,
}: FileUploaderProps) {
  const isControlled = controlled != null
  const [internal, setInternal] = React.useState<FileListItem[]>(defaultFiles)
  const items = isControlled ? controlled : internal
  const counter = React.useRef(0)

  const commit = React.useCallback(
    (next: FileListItem[]) => {
      if (!isControlled) setInternal(next)
      onFilesChange?.(next)
    },
    [isControlled, onFilesChange]
  )

  const handleSelected = React.useCallback(
    (picked: File[]) => {
      const rejections: Rejection[] = []
      const additions: FileListItem[] = []

      // How many more files may be added under maxFiles.
      let remaining =
        maxFiles != null ? Math.max(0, maxFiles - items.length) : Infinity

      for (const file of picked) {
        let reason: string | null = null
        if (maxSizeBytes != null && file.size > maxSizeBytes) {
          reason = `Exceeds the ${formatBytes(maxSizeBytes)} limit`
        } else if (!matchesAccept(file, accept)) {
          reason = "File type not allowed"
        } else if (remaining <= 0) {
          reason =
            maxFiles === 1
              ? "Only one file allowed"
              : `Only ${maxFiles} files allowed`
        }

        const id = `file-${(counter.current += 1)}`
        const base: FileListItem = {
          id,
          name: file.name,
          bytes: file.size,
          mimeType: file.type || undefined,
        }

        if (reason) {
          rejections.push({ file, reason })
          additions.push({ ...base, status: "error", errorMessage: reason })
        } else {
          remaining -= 1
          additions.push({ ...base, status: "idle" })
        }
      }

      if (additions.length === 0) return
      const next = multiple ? [...items, ...additions] : additions.slice(-1)
      commit(next)
      if (rejections.length > 0) onReject?.(rejections)
    },
    [accept, commit, items, maxFiles, maxSizeBytes, multiple, onReject]
  )

  const handleRemove = React.useCallback(
    (id: string) => {
      commit(items.filter((it) => it.id !== id))
    },
    [commit, items]
  )

  // Anything still selectable? (respect maxFiles for the dropzone affordance)
  const atCapacity =
    maxFiles != null && items.filter((i) => i.status !== "error").length >= maxFiles
  const listSize = size === "lg" ? "md" : size

  return (
    <div data-slot="file-uploader" className="flex w-full flex-col gap-3">
      <Dropzone
        size={size}
        accept={accept}
        multiple={multiple}
        disabled={disabled || atCapacity}
        title={title}
        description={description}
        hint={
          hint ??
          (maxSizeBytes != null
            ? `Up to ${formatBytes(maxSizeBytes)} per file`
            : undefined)
        }
        onFilesSelected={handleSelected}
      />
      {items.length > 0 ? (
        <FileList
          size={listSize}
          files={items}
          title={listTitle}
          showSummary={showSummary}
          removable={removable}
          onRemove={handleRemove}
          disabled={disabled}
        />
      ) : null}
    </div>
  )
}

export { FileUploader }
export type { FileUploaderProps }
