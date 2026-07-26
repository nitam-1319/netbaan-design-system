import type * as React from "react"
import { AlertCircle, CheckCircle2, Pause, Play, RotateCcw, X } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { formatBytes } from "@/lib/file"
import { Progress } from "@/components/ui/progress"

/**
 * AEGIS — Upload Progress (File Management, closed API)
 *
 * The progress readout for a single upload: a label row (an optional file name +
 * a percent), a determinate/indeterminate `Progress` bar toned by status, and a
 * meta row (`loaded / total`, an optional ETA, or an error message). Optional
 * inline controls — pause, resume, cancel, retry — appear only when their
 * callback is supplied.
 *
 * It is the focused progress widget; for the full file identity (thumbnail, kind,
 * remove) use `FileCard`, which reuses the same `Progress`. For a whole queue use
 * `FileList` or `FileUploader`.
 *
 * Closed API — no `className` / `style`. Status is a semantic prop; controls are
 * callbacks, not styling hatches. Sizes come from `@/lib/file`; colors are tokens
 * only. See `.agent/rules/API_RULES.md`.
 */

type UploadStatus = "queued" | "uploading" | "paused" | "success" | "error"

const STATUS_TONE: Record<UploadStatus, "default" | "success" | "critical"> = {
  queued: "default",
  uploading: "default",
  paused: "default",
  success: "success",
  error: "critical",
}

const uploadProgressVariants = cva("flex w-full flex-col", {
  variants: {
    size: {
      sm: "gap-1",
      md: "gap-1.5",
    },
  },
  defaultVariants: { size: "md" },
})

type IconButtonSpec = {
  key: string
  label: string
  icon: React.ReactNode
  onClick: () => void
}

type UploadProgressProps = Omit<
  React.ComponentProps<"div">,
  "className" | "style" | "children"
> &
  VariantProps<typeof uploadProgressVariants> & {
    /** Percent complete (0–100). Pass `null` (with `indeterminate`) for an unknown total. */
    value?: number | null
    /** Optional file name shown in the label row. */
    name?: React.ReactNode
    /** Lifecycle status; tones the bar and selects the trailing glyph. */
    status?: UploadStatus
    /** Bytes uploaded so far; combines with `totalBytes` into the meta line. */
    loadedBytes?: number
    /** Total bytes; combines with `loadedBytes` into the meta line. */
    totalBytes?: number
    /** Estimated time remaining, e.g. `"~12s left"`. */
    remainingLabel?: React.ReactNode
    /** Message shown (in place of the meta line) when `status="error"`. */
    errorMessage?: React.ReactNode
    /** Show the numeric percent in the label row. Default `true`. */
    showPercent?: boolean
    /** Render the bar as indeterminate (sliding) — implied when `value == null`. */
    indeterminate?: boolean
    /** Show a pause control and fire this. */
    onPause?: () => void
    /** Show a resume control and fire this. */
    onResume?: () => void
    /** Show a cancel control and fire this. */
    onCancel?: () => void
    /** Show a retry control and fire this. */
    onRetry?: () => void
  }

function UploadProgress({
  size = "md",
  value = 0,
  name,
  status = "uploading",
  loadedBytes,
  totalBytes,
  remainingLabel,
  errorMessage,
  showPercent = true,
  indeterminate,
  onPause,
  onResume,
  onCancel,
  onRetry,
  ...props
}: UploadProgressProps) {
  const isIndeterminate = indeterminate || value == null
  const barValue = isIndeterminate ? null : Math.max(0, Math.min(100, value))
  const tone = STATUS_TONE[status]

  const percentText =
    status === "success"
      ? "100%"
      : isIndeterminate || barValue == null
        ? null
        : `${Math.round(barValue)}%`

  const sizeMeta =
    loadedBytes != null && totalBytes != null
      ? `${formatBytes(loadedBytes)} / ${formatBytes(totalBytes)}`
      : totalBytes != null
        ? formatBytes(totalBytes)
        : null

  const metaLine =
    status === "error" && errorMessage != null
      ? errorMessage
      : [sizeMeta, status !== "success" ? remainingLabel : null]
          .filter(Boolean)
          .reduce<React.ReactNode[]>((acc, part, i) => {
            if (i > 0) acc.push(" · ")
            acc.push(part)
            return acc
          }, [])

  const trailingGlyph =
    status === "success" ? (
      <CheckCircle2 aria-hidden className="size-4 text-success" />
    ) : status === "error" ? (
      <AlertCircle aria-hidden className="size-4 text-destructive" />
    ) : null

  const controls: IconButtonSpec[] = []
  if (onPause && status === "uploading")
    controls.push({ key: "pause", label: "Pause upload", icon: <Pause className="size-3.5" aria-hidden />, onClick: onPause })
  if (onResume && (status === "paused" || status === "queued"))
    controls.push({ key: "resume", label: "Resume upload", icon: <Play className="size-3.5" aria-hidden />, onClick: onResume })
  if (onRetry && status === "error")
    controls.push({ key: "retry", label: "Retry upload", icon: <RotateCcw className="size-3.5" aria-hidden />, onClick: onRetry })
  if (onCancel && status !== "success")
    controls.push({ key: "cancel", label: "Cancel upload", icon: <X className="size-3.5" aria-hidden />, onClick: onCancel })

  const ariaLabel =
    typeof name === "string" ? `Uploading ${name}` : "Upload progress"

  return (
    <div
      data-slot="upload-progress"
      data-status={status}
      className={cn(uploadProgressVariants({ size }))}
      {...props}
    >
      {(name != null || percentText != null || controls.length > 0) && (
        <div
          data-slot="upload-progress-header"
          className="flex items-center gap-2"
        >
          {name != null ? (
            <span
              data-slot="upload-progress-name"
              className="min-w-0 flex-1 truncate text-sm font-medium text-foreground"
            >
              {name}
            </span>
          ) : (
            <span className="flex-1" />
          )}
          {trailingGlyph}
          {showPercent && percentText != null ? (
            <span
              data-slot="upload-progress-percent"
              className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground"
            >
              {percentText}
            </span>
          ) : null}
          {controls.length > 0 ? (
            <div className="flex shrink-0 items-center gap-0.5">
              {controls.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  data-slot={`upload-progress-${c.key}`}
                  aria-label={c.label}
                  onClick={c.onClick}
                  className={cn(
                    "inline-flex size-6 items-center justify-center rounded-md text-muted-foreground outline-none",
                    "transition-[color,background-color] hover:bg-muted hover:text-foreground",
                    "focus-visible:ring-[3px] focus-visible:ring-accent-soft focus-visible:border-accent-strong"
                  )}
                >
                  {c.icon}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      )}

      <Progress value={barValue} tone={tone} aria-label={ariaLabel} />

      {(Array.isArray(metaLine) ? metaLine.length > 0 : metaLine != null) ? (
        <span
          data-slot="upload-progress-meta"
          className={cn(
            "truncate text-xs",
            status === "error" ? "text-destructive" : "text-text-faint"
          )}
        >
          {metaLine}
        </span>
      ) : null}
    </div>
  )
}

export { UploadProgress, uploadProgressVariants }
export type { UploadProgressProps, UploadStatus }
