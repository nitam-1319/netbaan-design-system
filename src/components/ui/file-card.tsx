import { createElement } from "react"
import type * as React from "react"
import { AlertCircle, CheckCircle2, Loader2, X } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { fileIcon, fileKind, formatBytes, type FileKind } from "@/lib/file"
import { Progress } from "@/components/ui/progress"

/**
 * AEGIS — File Card (File Management, closed API)
 *
 * A block presentation of a single file: a thumbnail (for images) or kind glyph,
 * the file name, a meta line (size · kind, or a custom description / error), an
 * optional determinate upload `Progress`, a status affordance, and optional
 * trailing `actions` / dismiss button. It builds on the AEGIS card surface
 * (solid card + hairline border + neutral glass) and reuses the `Progress`
 * component for its uploading state — so a card, a File List, and a standalone
 * Upload Progress all read the same.
 *
 * Use a File Card when a file needs room — a review step, an attachments panel,
 * an uploads queue. For an inline reference use `AttachmentChip`; for a managed
 * vertical set use `FileList`.
 *
 * Closed API — no `className` / `style`. `actions` is a composition slot (extra
 * controls), not a styling hatch. File kind + size come from `@/lib/file`; colors
 * are tokens only. See `.agent/rules/API_RULES.md`.
 */

type FileCardStatus = "idle" | "uploading" | "success" | "error"

const fileCardVariants = cva(
  cn(
    "group/file-card relative flex w-full items-center gap-3 rounded-xl border bg-card text-card-foreground glass-panel",
    "transition-[border-color,box-shadow] duration-150",
    "border-border",
    "data-[selected=true]:border-accent-strong data-[selected=true]:ring-[3px] data-[selected=true]:ring-accent-soft",
    "data-[status=error]:border-destructive/55",
    "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-55",
    "[&_svg]:shrink-0"
  ),
  {
    variants: {
      size: {
        sm: "gap-2.5 p-2.5",
        md: "gap-3 p-3",
      },
    },
    defaultVariants: { size: "md" },
  }
)

const TILE_SIZE: Record<string, string> = {
  sm: "size-9 [&_svg]:size-4",
  md: "size-11 [&_svg]:size-5",
}

const KIND_LABEL: Record<FileKind, string> = {
  image: "Image",
  video: "Video",
  audio: "Audio",
  archive: "Archive",
  code: "Code",
  spreadsheet: "Spreadsheet",
  document: "Document",
  generic: "File",
}

type FileCardProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style" | "children"
> &
  VariantProps<typeof fileCardVariants> & {
    /** File name (truncated when long). */
    name: string
    /** File size in bytes; drives the default meta line. */
    bytes?: number
    /** MIME type, used with `name` to pick the kind glyph + label. */
    mimeType?: string
    /** Force a specific file kind. */
    kind?: FileKind
    /** Replace the leading glyph. Pass `false` to omit the tile entirely. */
    icon?: React.ReactNode | false
    /** Image preview URL; shown in the leading tile in place of the glyph. */
    thumbnailSrc?: string
    /** Override the secondary meta line (defaults to `size · Kind`). */
    description?: React.ReactNode
    /** Lifecycle status; selects the trailing affordance + border treatment. */
    status?: FileCardStatus
    /** Determinate upload percent (0–100). Rendered as a `Progress` bar. */
    progress?: number
    /** Message shown in place of the meta line when `status="error"`. */
    errorMessage?: React.ReactNode
    /** Selected (accent border + ring). */
    selected?: boolean
    /** Dim + disable interaction. */
    disabled?: boolean
    /** Extra trailing controls (e.g. a download button). Composition slot. */
    actions?: React.ReactNode
    /** Show a trailing dismiss button and fire this when activated. */
    onRemove?: () => void
    /** Accessible label for the dismiss button. */
    removeLabel?: string
  }

function FileCard({
  size = "md",
  name,
  bytes,
  mimeType,
  kind,
  icon,
  thumbnailSrc,
  description,
  status = "idle",
  progress,
  errorMessage,
  selected = false,
  disabled = false,
  actions,
  onRemove,
  removeLabel = "Remove file",
  ...props
}: FileCardProps) {
  const sizeKey = (size ?? "md") as string
  const resolvedKind = kind ?? fileKind(name, mimeType)
  const metaLine =
    status === "error" && errorMessage != null
      ? errorMessage
      : (description ??
        [bytes != null ? formatBytes(bytes) : null, KIND_LABEL[resolvedKind]]
          .filter(Boolean)
          .join(" · "))

  const showProgress = status === "uploading" && progress != null

  const statusGlyph =
    status === "uploading" ? (
      <Loader2 aria-hidden className="size-4 animate-spin text-accent-strong" />
    ) : status === "success" ? (
      <CheckCircle2 aria-hidden className="size-4 text-success" />
    ) : status === "error" ? (
      <AlertCircle aria-hidden className="size-4 text-destructive" />
    ) : null

  return (
    <div
      data-slot="file-card"
      data-kind={resolvedKind}
      data-status={status}
      data-selected={selected || undefined}
      data-disabled={disabled || undefined}
      className={cn(fileCardVariants({ size }))}
      {...props}
    >
      {icon !== false ? (
        <div
          data-slot="file-card-tile"
          className={cn(
            "flex items-center justify-center overflow-hidden rounded-lg bg-surface-3 text-muted-foreground",
            TILE_SIZE[sizeKey]
          )}
        >
          {thumbnailSrc ? (
            <img
              src={thumbnailSrc}
              alt=""
              aria-hidden
              className="size-full object-cover"
            />
          ) : (
            (icon ??
              createElement(fileIcon(resolvedKind), { "aria-hidden": true }))
          )}
        </div>
      ) : null}

      <div data-slot="file-card-body" className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span
          data-slot="file-card-name"
          className="truncate text-sm font-medium text-foreground"
          title={name}
        >
          {name}
        </span>
        <span
          data-slot="file-card-meta"
          className={cn(
            "truncate text-xs",
            status === "error" ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {metaLine}
        </span>
        {showProgress ? (
          <div data-slot="file-card-progress" className="mt-1.5">
            <Progress
              value={progress}
              tone={status === "error" ? "critical" : "default"}
              aria-label={`Uploading ${name}`}
            />
          </div>
        ) : null}
      </div>

      <div data-slot="file-card-trailing" className="flex shrink-0 items-center gap-1.5">
        {statusGlyph}
        {actions}
        {onRemove ? (
          <button
            type="button"
            data-slot="file-card-remove"
            aria-label={removeLabel}
            disabled={disabled}
            onClick={onRemove}
            className={cn(
              "inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none",
              "transition-[color,background-color] hover:bg-muted hover:text-foreground",
              "focus-visible:ring-[3px] focus-visible:ring-accent-soft focus-visible:border-accent-strong disabled:pointer-events-none"
            )}
          >
            <X className="size-4" aria-hidden />
          </button>
        ) : null}
      </div>
    </div>
  )
}

export { FileCard, fileCardVariants }
export type { FileCardProps, FileCardStatus }
