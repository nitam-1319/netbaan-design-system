import { createElement } from "react"
import { useRender } from "@base-ui/react/use-render"
import { AlertCircle, Loader2, X } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { fileIcon, fileKind, formatBytes, type FileKind } from "@/lib/file"

/**
 * AEGIS — Attachment Chip (File Management, closed API)
 *
 * A compact inline chip standing in for an attached file: a kind glyph, the file
 * name (truncated), an optional size, and an optional dismiss button. It follows
 * the AEGIS chip language (the same surface / focus-ring DNA as `Tag`) but is
 * file-aware — it picks its icon from the file name or MIME type via `@/lib/file`
 * so every file surface shows the same glyph for the same file.
 *
 * Use it inline (a row of attachments under a message or field). For a richer,
 * block presentation of a file use `FileCard`; for a vertical set use `FileList`.
 *
 * Renders a `<span>` by default and composes with any element via `render`
 * (e.g. an `<a>` download link). Closed API — no `className` / `style`; the
 * `onRemove` / `disabled` / `invalid` props are semantic, not styling hatches.
 * Tokens only. See `.agent/rules/API_RULES.md`.
 */

const attachmentChipVariants = cva(
  cn(
    "group/attachment inline-flex w-fit max-w-full shrink-0 items-center gap-2 border font-sans font-medium leading-[1.2] animate-chip-pop align-middle",
    "transition-[color,background-color,border-color,box-shadow] duration-150 outline-none select-none",
    "border-border-strong bg-surface-3 text-foreground",
    "focus-visible:ring-[3px] focus-visible:ring-accent-soft focus-visible:border-accent-strong",
    "data-[invalid=true]:border-destructive data-[invalid=true]:text-destructive-ink",
    "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-45",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0"
  ),
  {
    variants: {
      size: {
        sm: "rounded-[8px] px-2 py-1 text-[11.5px] [&_svg]:size-3.5",
        md: "rounded-[10px] px-2.5 py-1.5 text-[12.5px] [&_svg]:size-4",
      },
    },
    defaultVariants: { size: "md" },
  }
)

const REMOVE_SIZE: Record<string, string> = {
  sm: "size-[18px]",
  md: "size-5",
}

type AttachmentChipProps = Omit<
  useRender.ComponentProps<"span">,
  "className" | "style" | "children"
> &
  VariantProps<typeof attachmentChipVariants> & {
    /** File name shown in the chip (truncated when long). */
    name: string
    /** File size in bytes; rendered as a human-readable suffix when provided. */
    bytes?: number
    /** MIME type, used (with `name`) to pick the kind glyph. */
    mimeType?: string
    /** Force a specific file kind / glyph instead of inferring it. */
    kind?: FileKind
    /** Replace the leading glyph. Pass `false` to omit it. */
    icon?: React.ReactNode | false
    /** Show a spinner in place of the glyph (e.g. while uploading). */
    loading?: boolean
    /** Paint the destructive treatment and show an alert glyph. */
    invalid?: boolean
    /** Dim the chip and disable its dismiss affordance. */
    disabled?: boolean
    /** Show a trailing dismiss button and fire this when it is activated. */
    onRemove?: () => void
    /** Accessible label for the dismiss button. */
    removeLabel?: string
  }

function AttachmentChip({
  size = "md",
  name,
  bytes,
  mimeType,
  kind,
  icon,
  loading = false,
  invalid = false,
  disabled = false,
  onRemove,
  removeLabel = "Remove attachment",
  render = <span />,
  ...props
}: AttachmentChipProps) {
  const sizeKey = (size ?? "md") as string
  const resolvedKind = kind ?? fileKind(name, mimeType)
  const sizeText = bytes != null ? formatBytes(bytes) : null

  const leading =
    icon === false ? null : loading ? (
      <Loader2 aria-hidden className="animate-spin text-accent-strong" />
    ) : invalid ? (
      <AlertCircle aria-hidden className="text-destructive-ink" />
    ) : (
      (icon ??
        createElement(fileIcon(resolvedKind), {
          "aria-hidden": true,
          className: "text-muted-foreground",
        }))
    )

  return useRender({
    render,
    props: {
      "data-slot": "attachment-chip",
      "data-kind": resolvedKind,
      "data-invalid": invalid || undefined,
      "data-disabled": disabled || undefined,
      "aria-disabled": disabled || undefined,
      className: cn(attachmentChipVariants({ size })),
      ...props,
      children: (
        <>
          {leading}
          <span
            data-slot="attachment-chip-name"
            className="min-w-0 truncate"
            title={name}
          >
            {name}
          </span>
          {sizeText ? (
            <span
              data-slot="attachment-chip-size"
              dir="ltr"
              className="shrink-0 font-mono text-[0.9em] tabular-nums text-text-faint"
            >
              {sizeText}
            </span>
          ) : null}
          {onRemove ? (
            <button
              type="button"
              data-slot="attachment-chip-remove"
              aria-label={removeLabel}
              disabled={disabled}
              onClick={onRemove}
              className={cn(
                "-me-1 ms-0.5 inline-flex shrink-0 items-center justify-center rounded-full bg-[var(--track)] text-muted-foreground outline-none",
                "transition-[filter,background-color,color] hover:text-foreground hover:brightness-110",
                "focus-visible:ring-[3px] focus-visible:ring-accent-soft disabled:pointer-events-none",
                REMOVE_SIZE[sizeKey]
              )}
            >
              <X className="size-[62%]" strokeWidth={2.75} aria-hidden />
            </button>
          ) : null}
        </>
      ),
    },
  })
}

export { AttachmentChip, attachmentChipVariants }
export type { AttachmentChipProps }
