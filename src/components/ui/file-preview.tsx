import { createElement, useState } from "react"
import type * as React from "react"
import { Eye } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { fileIcon, fileKind, formatBytes, type FileKind } from "@/lib/file"
import { Lightbox } from "@/components/ui/lightbox"

/**
 * AEGIS — File Preview (File Management, closed API)
 *
 * A framed preview of a single file. For an image it shows the picture in a media
 * frame that (when `zoomable`) opens a full-screen `Lightbox` on click or
 * keyboard; for any other file it shows a large kind glyph. A footer bar carries
 * the name, a meta line (size · kind), and an optional trailing `action`.
 *
 * Use it where a file deserves a visual — a media library tile, an attachment
 * preview, a detail pane. For an inline reference use `AttachmentChip`; for a
 * compact row use `FileCard`; to collect files use `Dropzone` / `FileUploader`.
 *
 * Closed API — no `className` / `style`. It owns the Lightbox open state so the
 * thumbnail stays a single, styled, accessible control. Colors are tokens only.
 * See `.agent/rules/API_RULES.md`.
 */

const filePreviewVariants = cva(
  cn(
    "group/file-preview flex w-full flex-col overflow-hidden rounded-xl border border-border bg-surface-2 text-card-foreground",
    "transition-[border-color] duration-150",
    "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-55"
  ),
  {
    variants: {
      size: {
        sm: "[--fp-pad:0.625rem] text-xs",
        md: "[--fp-pad:0.75rem] text-sm",
        lg: "[--fp-pad:0.875rem] text-sm",
      },
    },
    defaultVariants: { size: "md" },
  }
)

const ASPECT: Record<string, string> = {
  square: "aspect-square",
  video: "aspect-video",
  wide: "aspect-[3/1]",
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

type FilePreviewProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style" | "children"
> &
  VariantProps<typeof filePreviewVariants> & {
    /** File name shown in the footer (truncated when long). */
    name: string
    /** Image URL. When set with an image kind, the media frame shows the picture. */
    src?: string
    /** File size in bytes; drives the default meta line. */
    bytes?: number
    /** MIME type, used with `name` to pick the kind glyph + label. */
    mimeType?: string
    /** Force a specific file kind. */
    kind?: FileKind
    /** Alt text for the image preview + Lightbox (defaults to `name`). */
    alt?: string
    /** Caption shown beneath the image in the Lightbox. */
    caption?: React.ReactNode
    /** Media frame aspect ratio. */
    aspect?: "square" | "video" | "wide"
    /** Open a full-screen Lightbox when the image is activated. Default `true`. */
    zoomable?: boolean
    /** Hide the footer bar (name/meta/action). */
    hideFooter?: boolean
    /** Extra trailing control in the footer (e.g. a download button). */
    action?: React.ReactNode
    /** Dim + disable interaction. */
    disabled?: boolean
  }

function FilePreview({
  size = "md",
  name,
  src,
  bytes,
  mimeType,
  kind,
  alt,
  caption,
  aspect = "video",
  zoomable = true,
  hideFooter = false,
  action,
  disabled = false,
  ...props
}: FilePreviewProps) {
  const [open, setOpen] = useState(false)
  const resolvedKind = kind ?? fileKind(name, mimeType)
  const isImage = resolvedKind === "image" && !!src
  const label = alt ?? name
  const aspectClass = ASPECT[aspect] ?? ASPECT.video
  const meta = [bytes != null ? formatBytes(bytes) : null, KIND_LABEL[resolvedKind]]
    .filter(Boolean)
    .join(" · ")

  const frame = cn(
    "relative flex items-center justify-center overflow-hidden bg-surface-3",
    aspectClass
  )

  return (
    <div
      data-slot="file-preview"
      data-kind={resolvedKind}
      data-disabled={disabled || undefined}
      className={cn(filePreviewVariants({ size }))}
      {...props}
    >
      {isImage && zoomable ? (
        <>
          <button
            type="button"
            data-slot="file-preview-trigger"
            aria-label={`Preview ${label}`}
            aria-haspopup="dialog"
            disabled={disabled}
            onClick={() => setOpen(true)}
            className={cn(
              frame,
              "cursor-pointer outline-none",
              "focus-visible:ring-[3px] focus-visible:ring-accent-soft focus-visible:ring-inset"
            )}
          >
            <img src={src} alt={label} className="size-full object-cover" />
            <span
              aria-hidden
              className="absolute inset-0 flex items-center justify-center gap-1.5 bg-background/65 font-medium text-foreground opacity-0 backdrop-blur-[1px] transition-opacity duration-150 group-hover/file-preview:opacity-100"
            >
              <Eye className="size-4" />
              Preview
            </span>
          </button>
          <Lightbox
            images={[{ src, alt: label, caption }]}
            open={open}
            onOpenChange={setOpen}
          />
        </>
      ) : (
        <div data-slot="file-preview-frame" className={frame}>
          {isImage ? (
            <img src={src} alt={label} className="size-full object-cover" />
          ) : (
            createElement(fileIcon(resolvedKind), {
              "aria-hidden": true,
              className: "size-10 text-muted-foreground",
            })
          )}
        </div>
      )}

      {!hideFooter ? (
        <div
          data-slot="file-preview-footer"
          className="flex items-center gap-2 p-[var(--fp-pad)]"
        >
          <div className="flex min-w-0 flex-1 flex-col">
            <span
              data-slot="file-preview-name"
              dir="auto"
              className="truncate font-medium text-foreground"
              title={name}
            >
              {name}
            </span>
            {meta ? (
              <span
                data-slot="file-preview-meta"
                dir="auto"
                className="truncate text-xs text-muted-foreground"
              >
                {meta}
              </span>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}
    </div>
  )
}

export { FilePreview, filePreviewVariants }
export type { FilePreviewProps }
